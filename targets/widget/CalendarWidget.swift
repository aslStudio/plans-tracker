import WidgetKit
import SwiftUI
import UIKit

/// Must match the group in `app.json`'s `ios.entitlements` and the one
/// `CalendarWidgetDataModule` (modules/calendar-widget-data) writes to from
/// the main app.
private let appGroupId = "group.app.planstracker.widget"

/// One calendar-agenda entry as synced from JS — mirrors `WidgetAgendaItem`
/// in modules/calendar-widget-data/index.ts exactly (JSON keys). Already
/// resolved to one specific calendar date (not a recurrence rule) by the JS
/// side, same shape `agendaForDate` produces for one day, flattened across
/// the next several days so the widget always has something to show even
/// on a quiet "today".
struct AgendaItem: Codable {
    let title: String
    /// Local date, `"YYYY-MM-DD"`.
    let date: String
    let startMinute: Int
    let duration: Int
    let allDay: Bool
    /// Raw hex, e.g. `"#087F78"` — the event's own color, same literal
    /// value `EVENT_COLORS`/the color picker store on `CalendarEvent`, not
    /// a named app accent, so no custom colorset lookup is needed here.
    let color: String
    var useAppAccent: Bool? = nil
    let completed: Bool

    /// Distinct per occurrence (date + start + title) — stable enough for
    /// `ForEach` without needing a real id from the JS side.
    var rowKey: String { "\(date)-\(startMinute)-\(title)" }
}

struct CalendarWidgetEntry: TimelineEntry {
    let date: Date
    let items: [AgendaItem]
}

private func calendarDateKey(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: date)
}

private func placeholderItems() -> [AgendaItem] {
    let today = calendarDateKey(.now)
    let tomorrow = calendarDateKey(Calendar.current.date(byAdding: .day, value: 1, to: .now) ?? .now)
    return [
        AgendaItem(title: widgetText("Позвонить папе", "Call Dad"), date: today, startMinute: 18 * 60, duration: 45, allDay: false, color: "#009DE0", completed: false),
        AgendaItem(title: widgetText("Собеседование", "Interview"), date: tomorrow, startMinute: 12 * 60, duration: 60, allDay: false, color: "#009DE0", completed: false),
        AgendaItem(title: widgetText("Прогулка", "Walk"), date: tomorrow, startMinute: 17 * 60, duration: 60, allDay: false, color: "#339E89", completed: false),
    ]
}

// React Native theme values use rgba(), event pickers use hex.
private func widgetUIColor(_ raw: String) -> UIColor? {
    let text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
    if text.hasPrefix("rgb"), let open = text.firstIndex(of: "("), let close = text.firstIndex(of: ")") {
        let values = text[text.index(after: open)..<close].split(separator: ",").compactMap { Double($0.trimmingCharacters(in: .whitespaces)) }
        guard values.count >= 3 else { return nil }
        return UIColor(red: values[0] / 255, green: values[1] / 255, blue: values[2] / 255, alpha: values.count > 3 ? values[3] : 1)
    }
    var hex = text.hasPrefix("#") ? String(text.dropFirst()) : text
    if hex.count == 3 { hex = hex.map { "\($0)\($0)" }.joined() }
    guard hex.count == 6, let value = UInt64(hex, radix: 16) else { return nil }
    return UIColor(red: Double((value >> 16) & 255) / 255, green: Double((value >> 8) & 255) / 255, blue: Double(value & 255) / 255, alpha: 1)
}

var widgetAccent: Color {
    let defaults = UserDefaults(suiteName: appGroupId)
    let light = widgetUIColor(defaults?.string(forKey: "accentLight") ?? "#087F78") ?? .systemTeal
    let dark = widgetUIColor(defaults?.string(forKey: "accentDark") ?? "#53DBCA") ?? .systemTeal
    return Color(uiColor: UIColor { $0.userInterfaceStyle == .dark ? dark : light })
}

private func parseHexColor(_ raw: String) -> Color {
    widgetUIColor(raw).map { Color(uiColor: $0) } ?? widgetAccent
}

/// Midnight-local `Date` for `"YYYY-MM-DD"` plus `minute` minutes — the same
/// "local calendar date, not a timestamp" convention the main app's own
/// `parseLocalDateString`/`toLocalDateString` (shared/lib/date.ts) use.
private func absoluteDate(_ dateString: String, minute: Int) -> Date? {
    let parts = dateString.split(separator: "-").compactMap { Int($0) }
    guard parts.count == 3 else { return nil }
    var components = DateComponents()
    components.year = parts[0]
    components.month = parts[1]
    components.day = parts[2]
    components.minute = minute
    return Calendar.current.date(from: components)
}

private func timeLabel(_ minute: Int) -> String {
    String(format: "%02d:%02d", minute / 60, minute % 60)
}

/// `widgetText("Сегодня", "Today")` / `widgetText("Завтра", "Tomorrow")` / a short weekday name — same qualifiers the
/// in-app agenda implicitly shows via day grouping, needed here since a
/// list row has no surrounding section header to lean on.
private func dayLabel(for dateString: String, relativeTo now: Date) -> String? {
    guard let date = absoluteDate(dateString, minute: 0) else { return nil }
    let calendar = Calendar.current
    if calendar.isDate(date, inSameDayAs: now) { return nil }
    if calendar.isDate(date, inSameDayAs: calendar.date(byAdding: .day, value: 1, to: now) ?? now) {
        return widgetText("Завтра", "Tomorrow")
    }
    let formatter = DateFormatter()
    formatter.locale = widgetLocale
    formatter.dateFormat = "EEE"
    return formatter.string(from: date).capitalized
}

/// Items still relevant `asOf` a given moment (ongoing or upcoming — not
/// yet fully elapsed), nearest first. All-day items sort to the start of
/// their day for free since their synthesized start is that day's midnight.
private func upcoming(_ items: [AgendaItem], asOf now: Date, limit: Int) -> [AgendaItem] {
    items
        .compactMap { item -> (AgendaItem, Date, Date)? in
            guard let start = absoluteDate(item.date, minute: item.allDay ? 0 : item.startMinute)
            else { return nil }
            let end = absoluteDate(
                item.date,
                minute: item.allDay ? 24 * 60 : item.startMinute + item.duration
            ) ?? start
            return (item, start, end)
        }
        .filter { _, _, end in end > now }
        .sorted { $0.1 < $1.1 }
        .prefix(limit)
        .map(\.0)
}

/// Reads whatever the main app last wrote (see CalendarWidgetDataModule.swift)
/// — the widget extension has no repository access of its own.
struct CalendarProvider: TimelineProvider {
    func placeholder(in context: Context) -> CalendarWidgetEntry {
        CalendarWidgetEntry(date: .now, items: placeholderItems())
    }

    func getSnapshot(in context: Context, completion: @escaping (CalendarWidgetEntry) -> Void) {
        completion(context.isPreview ? placeholder(in: context) : loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CalendarWidgetEntry>) -> Void) {
        let all = loadAllItems()
        let now = Date()
        // Re-render right as each of the next few items starts (so a "next
        // up" row flips to "ongoing"/drops off promptly), not just on
        // whatever cadence iOS happens to pick — same reasoning as
        // `StepsProvider`'s own midnight entry in the Steps widget.
        let upcomingStarts = all
            .compactMap { absoluteDate($0.date, minute: $0.allDay ? 0 : $0.startMinute) }
            .filter { $0 > now }
            .sorted()
            .prefix(8)
        let upcomingEnds = all.compactMap {
            absoluteDate($0.date, minute: $0.allDay ? 1440 : $0.startMinute + $0.duration)
        }.filter { $0 > now }.sorted().prefix(8)
        let midnight = Calendar.current.date(byAdding: .day, value: 1, to: Calendar.current.startOfDay(for: now)) ?? now.addingTimeInterval(86400)
        let entryDates = Array(Set([now, midnight] + upcomingStarts + upcomingEnds)).sorted()
        let entries = entryDates.map { entryDate in
            CalendarWidgetEntry(date: entryDate, items: upcoming(all, asOf: entryDate, limit: 8))
        }
        completion(Timeline(entries: entries, policy: .after(now.addingTimeInterval(3600))))
    }

    private func loadAllItems() -> [AgendaItem] {
        let defaults = UserDefaults(suiteName: appGroupId)
        guard
            let json = defaults?.string(forKey: "calendarAgendaJSON"),
            let data = json.data(using: .utf8),
            let items = try? JSONDecoder().decode([AgendaItem].self, from: data)
        else { return [] }
        return items
    }

    private func loadEntry() -> CalendarWidgetEntry {
        let now = Date()
        return CalendarWidgetEntry(date: now, items: upcoming(loadAllItems(), asOf: now, limit: 8))
    }
}

private func calendarLabel(_ date: Date, format: String) -> String {
    let formatter = DateFormatter()
    formatter.locale = widgetLocale
    formatter.dateFormat = format
    return formatter.string(from: date)
}

private struct CalendarDateHeading: View {
    let date: Date
    var compact = false
    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(calendarLabel(date, format: compact ? "EEE" : "EEEE").uppercased())
                .font(.system(size: 10, weight: .medium)).tracking(1)
                .foregroundStyle(.secondary)
            Text(calendarLabel(date, format: "d"))
                .font(.system(size: 32, weight: .regular))
                .foregroundStyle(widgetAccent)
        }
    }
}

private struct EmptyState: View {
    var body: some View {
        Text(widgetText("Нет ближайших событий", "No upcoming events"))
            .font(.caption).foregroundStyle(.secondary)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

private struct CalendarEventCard: View {
    @Environment(\.widgetRenderingMode) private var renderingMode
    let item: AgendaItem
    var compact = false
    // Preserve readable text for user-selected light event colors.
    private var background: Color {
        // Clear/tinted Home Screen modes turn opaque colors white. Preserve
        // a low-alpha surface so the system-tinted text remains legible.
        guard renderingMode == .fullColor else { return .primary.opacity(0.14) }
        return item.useAppAccent == true ? widgetAccent : parseHexColor(item.color)
    }
    private var foreground: Color {
        guard renderingMode == .fullColor else { return .primary }
        guard item.useAppAccent != true, let color = widgetUIColor(item.color) else { return .white }
        var red: CGFloat = 0, green: CGFloat = 0, blue: CGFloat = 0, alpha: CGFloat = 0
        color.getRed(&red, green: &green, blue: &blue, alpha: &alpha)
        return red * 0.299 + green * 0.587 + blue * 0.114 > 0.67 ? .black : .white
    }
    private var time: String {
        item.allDay ? widgetText("Весь день", "All day") : "\(timeLabel(item.startMinute))–\(timeLabel((item.startMinute + item.duration) % 1440))"
    }
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            if compact {
                Text("\(item.allDay ? widgetText("Весь день", "All day") : timeLabel(item.startMinute))  \(item.title)")
                    .font(.system(size: 11, weight: .medium)).lineLimit(1)
            } else {
                Text(item.title).font(.system(size: 13, weight: .semibold)).lineLimit(2)
                Text(time).font(.system(size: 11)).lineLimit(1)
            }
        }
        .strikethrough(item.completed)
        .foregroundStyle(foreground)
        .padding(.horizontal, 9).padding(.vertical, compact ? 6 : 8)
        .frame(maxWidth: .infinity, maxHeight: compact ? nil : .infinity, alignment: .topLeading)
        .background(background, in: RoundedRectangle(cornerRadius: 13))
        .opacity(item.completed ? 0.6 : 1)
    }
}

private struct CalendarAgendaCards: View {
    let entry: CalendarWidgetEntry
    var limit = 2
    var body: some View {
        let items = Array(entry.items.prefix(limit))
        VStack(alignment: .leading, spacing: 7) {
            if items.isEmpty {
                EmptyState()
            } else {
                ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                    if (index == 0 && dayLabel(for: item.date, relativeTo: entry.date) != nil)
                        || (index > 0 && items[index - 1].date != item.date) {
                        Text((dayLabel(for: item.date, relativeTo: entry.date) ?? widgetText("Сегодня", "Today")).uppercased())
                            .font(.system(size: 9, weight: .medium)).tracking(1)
                            .foregroundStyle(.secondary).padding(.leading, 5)
                    }
                    CalendarEventCard(item: item, compact: index > 0)
                }
            }
        }
    }
}

struct CalendarWidgetSmallView: View {
    var entry: CalendarProvider.Entry
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            CalendarDateHeading(date: entry.date)
            Spacer(minLength: 0)
            if let next = entry.items.first {
                if let day = dayLabel(for: next.date, relativeTo: entry.date) {
                    Text(day.uppercased()).font(.system(size: 9)).foregroundStyle(.secondary)
                }
                CalendarEventCard(item: next).fixedSize(horizontal: false, vertical: true)
            } else { EmptyState() }
        }
        .padding(14)
        .containerBackground(.background, for: .widget)
    }
}

struct CalendarWidgetMediumView: View {
    var entry: CalendarProvider.Entry
    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            CalendarDateHeading(date: entry.date, compact: true).frame(width: 56, alignment: .leading)
            CalendarAgendaCards(entry: entry)
        }
        .padding(14)
        .containerBackground(.background, for: .widget)
    }
}

private struct CalendarMonthGrid: View {
    @Environment(\.widgetRenderingMode) private var renderingMode
    let date: Date
    private var calendar: Calendar { Calendar(identifier: .gregorian) }
    private var start: Date {
        calendar.date(from: calendar.dateComponents([.year, .month], from: date)) ?? date
    }
    private var offset: Int { (calendar.component(.weekday, from: start) + 5) % 7 }
    private var dayCount: Int { calendar.range(of: .day, in: .month, for: date)?.count ?? 30 }
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(calendarLabel(date, format: "LLLL").uppercased())
                .font(.system(size: 10, weight: .medium)).tracking(1).padding(.bottom, 3)
            HStack(spacing: 0) {
                ForEach(Array((widgetLanguage == "ru" ? ["П", "В", "С", "Ч", "П", "С", "В"] : ["M", "T", "W", "T", "F", "S", "S"]).enumerated()), id: \.offset) { _, label in
                    Text(label).font(.system(size: 8)).foregroundStyle(.secondary).frame(maxWidth: .infinity)
                }
            }
            ForEach(0..<((offset + dayCount + 6) / 7), id: \.self) { row in
                HStack(spacing: 0) {
                    ForEach(0..<7, id: \.self) { column in
                        let dayOffset = row * 7 + column - offset
                        let cell = calendar.date(byAdding: .day, value: dayOffset, to: start) ?? date
                        let today = calendar.isDate(cell, inSameDayAs: date)
                        Text("\(calendar.component(.day, from: cell))")
                            .font(.system(size: 9, weight: today ? .bold : .medium))
                            .foregroundStyle(today && renderingMode == .fullColor ? Color.white : Color.primary.opacity(dayOffset < 0 || dayOffset >= dayCount ? 0.3 : 1))
                            .frame(width: 14, height: 14)
                            .background {
                                if today {
                                    if renderingMode == .fullColor {
                                        Circle().fill(widgetAccent)
                                    } else {
                                        // A white fill would merge with the date after
                                        // WidgetKit applies the clear/tinted appearance.
                                        Circle().strokeBorder(Color.primary.opacity(0.8), lineWidth: 1)
                                    }
                                }
                            }
                            .frame(maxWidth: .infinity)
                    }
                }
            }
        }
    }
}

struct CalendarWidgetLargeView: View {
    var entry: CalendarProvider.Entry
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 24) {
                CalendarDateHeading(date: entry.date).frame(width: 84, alignment: .leading)
                CalendarMonthGrid(date: entry.date)
            }
            CalendarAgendaCards(entry: entry, limit: 3)
        }
        .padding(16)
        .containerBackground(.background, for: .widget)
    }
}

// Separate medium option matches the month + agenda reference without
// replacing the upcoming-events widget already on the user's Home Screen.
struct CalendarMonthWidget: Widget {
    let kind = "CalendarMonthWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalendarProvider()) { entry in
            GeometryReader { geometry in
                HStack(alignment: .top, spacing: 16) {
                    CalendarMonthGrid(date: entry.date).frame(width: geometry.size.width * 0.54)
                    CalendarAgendaCards(entry: entry)
                }
            }
            .padding(14)
            .containerBackground(.background, for: .widget)
            .widgetURL(URL(string: "planstracker://planner"))
        }
        .configurationDisplayName(widgetText("Месяц и события", "Month and events"))
        .description(widgetText("Календарь на месяц и ближайшие события.", "Monthly calendar and upcoming events."))
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

private struct CalendarWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    var entry: CalendarProvider.Entry

    var body: some View {
        switch family {
        case .systemMedium:
            CalendarWidgetMediumView(entry: entry)
        case .systemLarge:
            CalendarWidgetLargeView(entry: entry)
        default:
            CalendarWidgetSmallView(entry: entry)
        }
    }
}

struct CalendarWidget: Widget {
    let kind: String = "CalendarWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalendarProvider()) { entry in
            CalendarWidgetEntryView(entry: entry)
                .widgetURL(URL(string: "planstracker://planner"))
        }
        .configurationDisplayName(widgetText("Календарь", "Calendar"))
        .description(widgetText("Ближайшие события — задачи и мероприятия с указанным временем.", "Upcoming scheduled tasks and events."))
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

#Preview(as: .systemSmall) {
    CalendarWidget()
} timeline: {
    CalendarWidgetEntry(date: .now, items: placeholderItems())
}

#Preview(as: .systemMedium) {
    CalendarWidget()
} timeline: {
    CalendarWidgetEntry(date: .now, items: placeholderItems())
}

#Preview(as: .systemLarge) {
    CalendarWidget()
} timeline: {
    CalendarWidgetEntry(date: .now, items: placeholderItems())
}
