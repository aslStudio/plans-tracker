import WidgetKit
import SwiftUI
import AppIntents

private let taskDefaults = UserDefaults(suiteName: "group.app.planstracker.widget")
private let taskPageSize = 5

struct TaskWidgetItem: Codable, Identifiable {
    let id: String
    let title: String
    var completed: Bool
    let recurring: Bool
}
private struct TaskWidgetDay: Codable {
    let date: String
    var items: [TaskWidgetItem]
}
private struct TaskWidgetToggle: Codable {
    let id: String
    let taskId: String
    let date: String
    let completed: Bool
}
private func taskDateKey(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = .current
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: date)
}
private func taskPendingToggles() -> [TaskWidgetToggle] {
    (taskDefaults?.dictionaryRepresentation() ?? [:])
        .filter { $0.key.hasPrefix("taskToggle.") }
        .compactMap { _, value in
            guard let json = value as? String, let data = json.data(using: .utf8) else { return nil }
            return try? JSONDecoder().decode(TaskWidgetToggle.self, from: data)
        }
        .sorted { $0.id < $1.id }
}
private func taskDays() -> [TaskWidgetDay] {
    guard let json = taskDefaults?.string(forKey: "taskDaysJSON"),
          let data = json.data(using: .utf8),
          var days = try? JSONDecoder().decode([TaskWidgetDay].self, from: data)
    else { return [] }
    for toggle in taskPendingToggles() {
        for day in days.indices {
            for item in days[day].items.indices where days[day].items[item].id == toggle.taskId {
                if !days[day].items[item].recurring || days[day].date == toggle.date {
                    days[day].items[item].completed = toggle.completed
                }
            }
        }
    }
    return days
}
struct TasksWidgetEntry: TimelineEntry {
    let date: Date
    let items: [TaskWidgetItem]
    let page: Int
    let available: Bool
    var done: Int { items.filter(\.completed).count }
    var progress: Double { items.isEmpty ? 0 : Double(done) / Double(items.count) }
    var pageCount: Int { max(1, (items.count + taskPageSize - 1) / taskPageSize) }
    var currentPage: Int { min(max(0, page), pageCount - 1) }
    var visibleItems: [TaskWidgetItem] {
        // Keep row positions stable when checking off items.
        Array(items.dropFirst(currentPage * taskPageSize).prefix(taskPageSize))
    }
}
struct ToggleTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete task"
    static var isDiscoverable: Bool = false
    @Parameter(title: "Task ID") var taskId: String
    @Parameter(title: "Date") var date: String
    init() {}
    init(taskId: String, date: String) { self.taskId = taskId; self.date = date }
    func perform() async throws -> some IntentResult {
        // Reject a tap on a stale yesterday view instead of completing today's occurrence.
        guard date == taskDateKey(.now),
              let day = taskDays().first(where: { $0.date == date }),
              let item = day.items.first(where: { $0.id == taskId }) else { return .result() }
        let id = String(format: "%020.6f", Date.now.timeIntervalSince1970) + "-" + UUID().uuidString
        let action = TaskWidgetToggle(id: id, taskId: taskId, date: date, completed: !item.completed)
        let data = try JSONEncoder().encode(action)
        taskDefaults?.set(String(decoding: data, as: UTF8.self), forKey: "taskToggle." + id)
        WidgetCenter.shared.reloadTimelines(ofKind: "TasksWidget")
        return .result()
    }
}
struct TaskPageIntent: AppIntent {
    static var title: LocalizedStringResource = "Browse tasks"
    static var isDiscoverable: Bool = false
    @Parameter(title: "Page") var page: Int
    init() {}
    init(page: Int) { self.page = page }
    func perform() async throws -> some IntentResult {
        taskDefaults?.set(max(0, page), forKey: "taskPage." + taskDateKey(.now))
        WidgetCenter.shared.reloadTimelines(ofKind: "TasksWidget")
        return .result()
    }
}
struct TasksProvider: TimelineProvider {
    func placeholder(in context: Context) -> TasksWidgetEntry {
        TasksWidgetEntry(date: .now, items: [
            TaskWidgetItem(id: "1", title: widgetText("Ответить на письма", "Reply to emails"), completed: true, recurring: false),
            TaskWidgetItem(id: "2", title: widgetText("Купить продукты", "Buy groceries"), completed: false, recurring: false),
            TaskWidgetItem(id: "3", title: widgetText("Записаться к врачу", "Book a doctor appointment"), completed: false, recurring: false),
        ], page: 0, available: true)
    }
    func getSnapshot(in context: Context, completion: @escaping (TasksWidgetEntry) -> Void) {
        completion(context.isPreview ? placeholder(in: context) : entry(at: .now, days: taskDays()))
    }
    private func entry(at date: Date, days: [TaskWidgetDay]) -> TasksWidgetEntry {
        let key = taskDateKey(date)
        let day = days.first { $0.date == key }
        return TasksWidgetEntry(date: date, items: day?.items ?? [],
                                page: taskDefaults?.integer(forKey: "taskPage." + key) ?? 0,
                                available: day != nil)
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<TasksWidgetEntry>) -> Void) {
        let now = Date.now
        let days = taskDays()
        var entries = [entry(at: now, days: days)]
        // Include midnight entries and an expired state even if the app stays closed.
        for offset in 1...7 {
            if let date = Calendar.current.date(byAdding: .day, value: offset, to: Calendar.current.startOfDay(for: now)) {
                entries.append(entry(at: date, days: days))
            }
        }
        completion(Timeline(entries: entries, policy: .after(now.addingTimeInterval(15 * 60))))
    }
}
private struct TaskRing: View {
    let entry: TasksWidgetEntry
    var body: some View {
        ZStack {
            Circle().stroke(Color.secondary.opacity(0.18), lineWidth: 8)
            Circle().trim(from: 0, to: entry.progress)
                .stroke(widgetAccent, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                .rotationEffect(.degrees(-90))
            Text("\(Int(entry.progress * 100))%")
                .font(.system(size: 23, weight: .bold, design: .rounded))
                .minimumScaleFactor(0.7)
        }
        .accessibilityLabel(widgetText("Выполнено \(entry.done) из \(entry.items.count)", "\(entry.done) of \(entry.items.count) completed"))
    }
}
private struct AddQuickTaskLink: View {
    var body: some View {
        Link(destination: URL(string: "planstracker://quick-task")!) {
            Label(widgetText("Добавить задачу", "Add task"), systemImage: "plus")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(widgetAccent)
                .frame(maxWidth: .infinity, minHeight: 32, alignment: .leading)
        }
    }
}
private struct TasksWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: TasksWidgetEntry
    private var summary: String {
        if !entry.available { return widgetText("Откройте приложение для обновления", "Open the app to refresh") }
        return entry.items.isEmpty ? widgetText("На сегодня задач нет", "No tasks today") : widgetText("\(entry.done) из \(entry.items.count) выполнено", "\(entry.done) of \(entry.items.count) completed")
    }
    var body: some View {
        Group {
            switch family {
            case .systemLarge: large
            case .systemMedium: medium
            default: small
            }
        }
        .padding(16)
        .containerBackground(.background, for: .widget)
        .widgetURL(URL(string: "planstracker://"))
    }
    private var small: some View {
        VStack(alignment: .leading, spacing: 8) {
            TaskRing(entry: entry).frame(width: 76, height: 76)
            Text(widgetText("Задачи · сегодня", "Tasks · today")).font(.caption.weight(.semibold))
            Text(summary).font(.caption2).foregroundStyle(.secondary).lineLimit(2)
        }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
    private var medium: some View {
        HStack(spacing: 22) {
            TaskRing(entry: entry).frame(width: 90, height: 90)
            VStack(alignment: .leading, spacing: 8) {
                Text(widgetText("Задачи · сегодня", "Tasks · today")).font(.subheadline.weight(.semibold))
                Text(summary).font(.caption).foregroundStyle(.secondary)
                AddQuickTaskLink()
            }
        }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
    private var large: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(widgetText("Задачи · сегодня", "Tasks · today")).font(.subheadline.weight(.semibold))
                Spacer()
                Text("\(entry.done)/\(entry.items.count)").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
            }
            WidgetProgressBar(progress: entry.progress)
            if entry.items.isEmpty {
                Text(summary).font(.footnote).foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            } else {
                VStack(spacing: 8) {
                    ForEach(entry.visibleItems) { item in
                        Button(intent: ToggleTaskIntent(taskId: item.id, date: taskDateKey(entry.date))) {
                            HStack(spacing: 10) {
                                Image(systemName: item.completed ? "checkmark.circle.fill" : "circle")
                                    .font(.system(size: 21)).foregroundStyle(item.completed ? widgetAccent : .secondary)
                                Text(item.title).font(.subheadline).lineLimit(1)
                                    .strikethrough(item.completed)
                                    .foregroundStyle(item.completed ? .secondary : .primary)
                                Spacer(minLength: 0)
                            }.frame(minHeight: 26).contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(item.title)
                        .accessibilityValue(item.completed ? widgetText("Выполнено", "Completed") : widgetText("Не выполнено", "Not completed"))
                    }
                }
                Spacer(minLength: 0)
            }
            if entry.pageCount > 1 {
                HStack {
                    Button(intent: TaskPageIntent(page: entry.currentPage - 1)) { Image(systemName: "chevron.up") }
                        .disabled(entry.currentPage == 0).accessibilityLabel(widgetText("Предыдущие задачи", "Previous tasks"))
                    Spacer()
                    Text("\(entry.currentPage + 1) / \(entry.pageCount)").font(.caption2).foregroundStyle(.secondary)
                    Spacer()
                    Button(intent: TaskPageIntent(page: entry.currentPage + 1)) { Image(systemName: "chevron.down") }
                        .disabled(entry.currentPage == entry.pageCount - 1).accessibilityLabel(widgetText("Следующие задачи", "Next tasks"))
                }.buttonStyle(.plain).tint(widgetAccent)
            }
            AddQuickTaskLink()
        }
    }
}
struct TasksWidget: Widget {
    let kind = "TasksWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TasksProvider()) { entry in TasksWidgetView(entry: entry) }
            .configurationDisplayName(widgetText("Задачи", "Tasks"))
            .description(widgetText("Прогресс на сегодня, отметки выполнения и быстрое добавление задач.", "Today’s progress, task completion, and quick task creation."))
            .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
            .contentMarginsDisabled()
    }
}
