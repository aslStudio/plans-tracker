import ExpoModulesCore
import WidgetKit

/// Must match the group in `app.json`'s `ios.entitlements` and the one
/// `targets/widget/HabitsWidget.swift` reads from.
private let appGroupId = "group.app.planstracker.widget"

/// Bridges today's habit list + the all-habits streak to the App Group
/// `UserDefaults` the Home Screen widget extension reads from (see
/// targets/widget/HabitsWidget.swift), and reads back whatever the widget's
/// own tap-to-complete `Button(intent:)` rows queued while the app wasn't
/// running.
public class HabitWidgetDataModule: Module {
  public func definition() -> ModuleDefinition {
    Name("HabitWidgetData")

    // `itemsJSON` is a JSON-encoded array of `{ id, title, completed }`,
    // today's due habits only — see HabitsWidget.swift's own
    // `HabitWidgetItem` for the decode side.
    Function("updateHabits") { (itemsJSON: String, streak: Int) in
      let defaults = UserDefaults(suiteName: appGroupId)
      defaults?.set(itemsJSON, forKey: "habitItemsJSON")
      defaults?.set(streak, forKey: "habitStreak")
      WidgetCenter.shared.reloadAllTimelines()
    }

    Function("clearWidgetData") {
      let defaults = UserDefaults(suiteName: appGroupId)
      defaults?.set("[]", forKey: "habitItemsJSON")
      defaults?.set(0, forKey: "habitStreak")
      defaults?.removeObject(forKey: "habitPendingTogglesJSON")
      WidgetCenter.shared.reloadAllTimelines()
    }

    // Read-and-clear — once JS has these it owns applying them to
    // `habitsRepository`, so leaving them in place would re-apply the same
    // toggle again on the next sync.
    AsyncFunction("getPendingToggles") { () -> String in
      let defaults = UserDefaults(suiteName: appGroupId)
      let json = defaults?.string(forKey: "habitPendingTogglesJSON") ?? "[]"
      defaults?.removeObject(forKey: "habitPendingTogglesJSON")
      return json
    }
  }
}
