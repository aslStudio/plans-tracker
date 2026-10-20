import WidgetKit
import SwiftUI
import AppIntents

/// Same group `CalendarWidgetDataModule`/`CalendarWidget.swift` use — one
/// shared container, different keys per widget's own data.
private let habitAppGroupId = "group.app.planstracker.widget"

struct HabitWidgetItem: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    var completed: Bool
}

/// A tap-to-toggle the Large widget's AppIntent didn't get around to
/// applying to the real `habitsRepository` yet — queued here until the main
/// app next comes to the foreground (see `applyPendingHabitToggles`), since
/// the widget extension has no access to AsyncStorage/the app's own data
/// layer at all, only this shared App Group container.
private struct PendingHabitToggle: Codable {
    let habitId: String
    let completed: Bool
}

struct HabitsWidgetEntry: TimelineEntry {
    let date: Date
    let items: [HabitWidgetItem]
    let streak: Int
    var page: Int = 0

    var pageCount: Int { max(1, (items.count + 4) / 5) }
    var currentPage: Int { min(max(0, page), pageCount - 1) }
    var visibleItems: [HabitWidgetItem] {
        Array(items.dropFirst(currentPage * 5).prefix(5))
    }

    var total: Int { items.count }
    var done: Int { items.filter(\.completed).count }
    var progress: Double { total > 0 ? Double(done) / Double(total) : 0 }
    var isComplete: Bool { total > 0 && done == total }
}

private func placeholderHabitItems() -> [HabitWidgetItem] {
    [
        HabitWidgetItem(id: "1", title: widgetText("Выпить воды", "Drink water"), completed: true),
        HabitWidgetItem(id: "2", title: widgetText("Почитать 20 минут", "Read for 20 minutes"), completed: false),
        HabitWidgetItem(id: "3", title: widgetText("Растяжка", "Stretch"), completed: false),
    ]
}

private func loadHabitItems() -> [HabitWidgetItem] {
    let defaults = UserDefaults(suiteName: habitAppGroupId)
    guard
        let json = defaults?.string(forKey: "habitItemsJSON"),
        let data = json.data(using: .utf8),
        let items = try? JSONDecoder().decode([HabitWidgetItem].self, from: data)
    else { return [] }
    return items
}

private func saveHabitItems(_ items: [HabitWidgetItem]) {
    guard
        let data = try? JSONEncoder().encode(items),
        let json = String(data: data, encoding: .utf8)
    else { return }
    UserDefaults(suiteName: habitAppGroupId)?.set(json, forKey: "habitItemsJSON")
}

private func loadStreak() -> Int {
    UserDefaults(suiteName: habitAppGroupId)?.integer(forKey: "habitStreak") ?? 0
}

private func loadPendingToggles() -> [PendingHabitToggle] {
    let defaults = UserDefaults(suiteName: habitAppGroupId)
    guard
        let json = defaults?.string(forKey: "habitPendingTogglesJSON"),
        let data = json.data(using: .utf8),
        let items = try? JSONDecoder().decode([PendingHabitToggle].self, from: data)
    else { return [] }
    return items
}

/// Replaces any already-queued toggle for the same habit rather than
/// appending — only the latest intent per habit matters once the app
/// applies the queue, and a flaky connection shouldn't let a double-tap
/// enqueue two contradictory entries.
private func queuePendingToggle(habitId: String, completed: Bool) {
    let defaults = UserDefaults(suiteName: habitAppGroupId)
    var pending = loadPendingToggles().filter { $0.habitId != habitId }
    pending.append(PendingHabitToggle(habitId: habitId, completed: completed))
    guard
        let data = try? JSONEncoder().encode(pending),
        let json = String(data: data, encoding: .utf8)
    else { return }
    defaults?.set(json, forKey: "habitPendingTogglesJSON")
}

struct HabitPageIntent: AppIntent {
    static var title: LocalizedStringResource = "Browse habits"
    static var isDiscoverable: Bool = false
    @Parameter(title: "Page") var page: Int
    init() {}
    init(page: Int) { self.page = page }
    func perform() async throws -> some IntentResult {
        UserDefaults(suiteName: habitAppGroupId)?.set(max(0, page), forKey: "habitPage")
        WidgetCenter.shared.reloadTimelines(ofKind: "HabitsWidget")
        return .result()
    }
}

private func dayWord(_ count: Int) -> String {
    if widgetLanguage == "en" { return count == 1 ? "day" : "days" }
    let mod10 = count % 10
    let mod100 = count % 100
    if mod10 == 1 && mod100 != 11 { return "день" }
    if (2...4).contains(mod10) && !(12...14).contains(mod100) { return "дня" }
    return "дней"
}

/// Flips one habit's today-completion right from the widget, with no app
/// launch — optimistically updates the shared snapshot both this widget and
/// `CalendarWidget` read from (via `reloadAllTimelines`), and queues the
/// change for `habitsRepository.setCompletion` to apply for real on next
/// foreground. The displayed `streak` number itself isn't recomputed here —
/// that needs the full completion history the widget never has, so it can
/// lag a few seconds until the app's own sync catches up.
struct ToggleHabitIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete habit"
    static var isDiscoverable: Bool = false

    @Parameter(title: "Habit ID")
    var habitId: String

    init() {}
    init(habitId: String) {
        self.habitId = habitId
    }

    func perform() async throws -> some IntentResult {
        var items = loadHabitItems()
        guard let index = items.firstIndex(where: { $0.id == habitId }) else {
            return .result()
        }
        items[index].completed.toggle()
        saveHabitItems(items)
        queuePendingToggle(habitId: habitId, completed: items[index].completed)
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

/// Reads whatever the main app last wrote (see HabitWidgetDataModule.swift)
/// — the widget extension has no repository access of its own.
struct HabitsProvider: TimelineProvider {
    func placeholder(in context: Context) -> HabitsWidgetEntry {
        HabitsWidgetEntry(date: .now, items: placeholderHabitItems(), streak: 5)
    }

    func getSnapshot(in context: Context, completion: @escaping (HabitsWidgetEntry) -> Void) {
        completion(context.isPreview ? placeholder(in: context) : loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HabitsWidgetEntry>) -> Void) {
        let entry = loadEntry()
        completion(Timeline(entries: [entry], policy: .after(entry.date.addingTimeInterval(15 * 60))))
    }

    private func loadEntry() -> HabitsWidgetEntry {
        HabitsWidgetEntry(date: .now, items: loadHabitItems(), streak: loadStreak(),
                          page: UserDefaults(suiteName: habitAppGroupId)?.integer(forKey: "habitPage") ?? 0)
    }
}

private struct HabitRing: View {
    let progress: Double
    let reached: Bool
    var lineWidth: CGFloat = 8

    var body: some View {
        ZStack {
            Circle().stroke(Color.secondary.opacity(0.18), lineWidth: lineWidth)
            if reached {
                Circle().stroke(widgetAccent, lineWidth: lineWidth)
            } else {
                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(widgetAccent, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.easeOut, value: progress)
            }
        }
    }
}

/// Same icon the app's own Habits tab uses (see `app/(tabs)/_layout.tsx`'s
/// `sf: "flame.fill"`) — no custom asset needed.
private struct HabitFlame: View {
    let reached: Bool
    var size: CGFloat = 22

    var body: some View {
        Image(systemName: "flame.fill")
            .resizable()
            .scaledToFit()
            .frame(width: size, height: size)
            .foregroundStyle(reached ? widgetAccent : .secondary)
    }
}

private struct StreakStat: View {
    let streak: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(widgetText("СЕРИЯ", "STREAK"))
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.secondary)
                .tracking(0.4)
            Text("\(streak)")
                .font(.system(size: 21, weight: .bold, design: .rounded))
                .minimumScaleFactor(0.8)
                .lineLimit(1)
        }
    }
}

private struct EmptyHabitsState: View {
    var body: some View {
        Text(widgetText("На сегодня привычек нет", "No habits today"))
            .font(.footnote.weight(.semibold))
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

/// `.systemSmall` — same shape as the Steps widget's own small layout: a
/// ring with a flame at its center, one stat underneath. Here the ring is
/// today's done/total completion and the stat is the all-habits streak.
struct HabitsWidgetSmallView: View {
    var entry: HabitsProvider.Entry

    var body: some View {
        GeometryReader { geometry in
            let ringSize = max(40, min(90, geometry.size.height - 52))
            VStack(alignment: .leading, spacing: 10) {
                ZStack {
                    HabitRing(progress: entry.progress, reached: entry.isComplete)
                    HabitFlame(reached: entry.isComplete, size: ringSize * 0.44)
                }
                .frame(width: ringSize, height: ringSize)
                StreakStat(streak: entry.streak)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        }
        .padding(18)
        .containerBackground(.background, for: .widget)
    }
}

/// `.systemMedium` — bigger ring + the streak as a sentence, plus a short
/// "N of M done" line underneath it.
struct HabitsWidgetMediumView: View {
    var entry: HabitsProvider.Entry

    var body: some View {
        HStack(spacing: 20) {
            ZStack {
                HabitRing(progress: entry.progress, reached: entry.isComplete, lineWidth: 10)
                    .frame(width: 92, height: 92)
                HabitFlame(reached: entry.isComplete, size: 32)
            }
            VStack(alignment: .leading, spacing: 6) {
                Text(widgetText("\(entry.streak) \(dayWord(entry.streak)) подряд", "\(entry.streak) \(dayWord(entry.streak)) in a row"))
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(1)
                Text(
                    entry.total > 0
                        ? widgetText("\(entry.done) из \(entry.total) выполнено", "\(entry.done) of \(entry.total) completed")
                        : widgetText("Нет привычек на сегодня", "No habits today")
                )
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 18)
        .containerBackground(.background, for: .widget)
    }
}

struct WidgetProgressBar: View {
    let progress: Double

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                Capsule().fill(Color.secondary.opacity(0.18))
                Capsule()
                    .fill(widgetAccent)
                    .frame(width: geometry.size.width * max(0, min(1, progress)))
            }
        }
        .frame(height: 6)
    }
}

private struct HabitRow: View {
    let item: HabitWidgetItem

    var body: some View {
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .strokeBorder(
                        item.completed ? widgetAccent : Color.secondary.opacity(0.4),
                        lineWidth: 2
                    )
                    .background(Circle().fill(item.completed ? widgetAccent : Color.clear))
                if item.completed {
                    Image(systemName: "checkmark")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(.white)
                }
            }
            .frame(width: 20, height: 20)
            Text(item.title)
                .font(.subheadline)
                .strikethrough(item.completed)
                .foregroundStyle(item.completed ? .secondary : .primary)
                .lineLimit(1)
            Spacer(minLength: 0)
        }
        .contentShape(Rectangle())
    }
}

/// Fixed pages: WidgetKit cannot render scrolling containers.
struct HabitsWidgetLargeView: View {
    var entry: HabitsProvider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(widgetText("Привычки", "Habits"))
                    .font(.subheadline.weight(.semibold))
                Spacer()
                Text("\(entry.done)/\(entry.total)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
            WidgetProgressBar(progress: entry.progress)
            if entry.items.isEmpty {
                EmptyHabitsState()
            } else {
                VStack(alignment: .leading, spacing: 10) {
                    ForEach(entry.visibleItems) { item in
                        Button(intent: ToggleHabitIntent(habitId: item.id)) {
                            HabitRow(item: item).frame(minHeight: 30)
                        }
                        .buttonStyle(.plain)
                    }
                }
                Spacer(minLength: 0)
                if entry.pageCount > 1 {
                    HStack {
                        Button(intent: HabitPageIntent(page: entry.currentPage - 1)) {
                            Image(systemName: "chevron.up").frame(width: 32, height: 28)
                        }
                        .disabled(entry.currentPage == 0)
                        .accessibilityLabel(widgetText("Предыдущие привычки", "Previous habits"))
                        Spacer()
                        Text("\(entry.currentPage + 1) / \(entry.pageCount)")
                            .font(.caption2).foregroundStyle(.secondary)
                        Spacer()
                        Button(intent: HabitPageIntent(page: entry.currentPage + 1)) {
                            Image(systemName: "chevron.down").frame(width: 32, height: 28)
                        }
                        .disabled(entry.currentPage == entry.pageCount - 1)
                        .accessibilityLabel(widgetText("Следующие привычки", "Next habits"))
                    }.buttonStyle(.plain).tint(widgetAccent)
                }
            }
        }
        .padding(16)
        .containerBackground(.background, for: .widget)
    }
}

private struct HabitsWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    var entry: HabitsProvider.Entry

    var body: some View {
        switch family {
        case .systemMedium:
            HabitsWidgetMediumView(entry: entry)
        case .systemLarge:
            HabitsWidgetLargeView(entry: entry)
        default:
            HabitsWidgetSmallView(entry: entry)
        }
    }
}

struct HabitsWidget: Widget {
    let kind: String = "HabitsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HabitsProvider()) { entry in
            HabitsWidgetEntryView(entry: entry)
                .widgetURL(URL(string: "planstracker://habits"))
        }
        .configurationDisplayName(widgetText("Привычки", "Habits"))
        .description(widgetText("Серия, прогресс дня и список привычек — можно отмечать прямо из виджета.", "Your streak, daily progress, and habits — complete them right in the widget."))
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

#Preview(as: .systemSmall) {
    HabitsWidget()
} timeline: {
    HabitsWidgetEntry(date: .now, items: placeholderHabitItems(), streak: 5)
}

#Preview(as: .systemMedium) {
    HabitsWidget()
} timeline: {
    HabitsWidgetEntry(date: .now, items: placeholderHabitItems(), streak: 5)
}

#Preview(as: .systemLarge) {
    HabitsWidget()
} timeline: {
    HabitsWidgetEntry(date: .now, items: placeholderHabitItems(), streak: 5)
}
