import ExpoModulesCore
import WidgetKit

/// Must match the group in `app.json`'s `ios.entitlements` and the one
/// `targets/widget/CalendarWidget.swift` reads from.
private let appGroupId = "group.app.planstracker.widget"

/// Bridges the upcoming-agenda window to the App Group `UserDefaults` the
/// Home Screen widget extension reads from (see targets/widget), and asks
/// WidgetKit to redraw it immediately rather than waiting for its own
/// timeline schedule.
public class CalendarWidgetDataModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CalendarWidgetData")

    // `agendaJSON` is a JSON-encoded array of
    // `{ title, date, startMinute, duration, allDay, color, completed }`,
    // one entry per concrete calendar-date occurrence (already resolved
    // from any recurrence rule by the JS side) — see
    // CalendarWidget.swift's own `AgendaItem` for the decode side.
    Function("updateAgenda") { (agendaJSON: String) in
      let defaults = UserDefaults(suiteName: appGroupId)
      defaults?.set(agendaJSON, forKey: "calendarAgendaJSON")
      WidgetCenter.shared.reloadAllTimelines()
    }

    Function("updateLanguage") { (language: String) in
      UserDefaults(suiteName: appGroupId)?.set(language, forKey: "appLanguage")
      WidgetCenter.shared.reloadAllTimelines()
    }

    Function("updateAccent") { (light: String, dark: String) in
      let defaults = UserDefaults(suiteName: appGroupId)
      defaults?.set(light, forKey: "accentLight")
      defaults?.set(dark, forKey: "accentDark")
      WidgetCenter.shared.reloadAllTimelines()
    }

    Function("clearWidgetData") {
      UserDefaults(suiteName: appGroupId)?.set("[]", forKey: "calendarAgendaJSON")
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
