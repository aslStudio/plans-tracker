import ExpoModulesCore
import WidgetKit

public class TaskWidgetDataModule: Module {
    public func definition() -> ModuleDefinition {
        Name("TaskWidgetData")
        Function("updateTasks") { (json: String) in
            UserDefaults(suiteName: "group.app.planstracker.widget")?.set(json, forKey: "taskDaysJSON")
            WidgetCenter.shared.reloadTimelines(ofKind: "TasksWidget")
        }
        Function("clearWidgetData") {
            let defaults = UserDefaults(suiteName: "group.app.planstracker.widget")
            defaults?.set("[]", forKey: "taskDaysJSON")
            for key in defaults?.dictionaryRepresentation().keys ?? Dictionary<String, Any>().keys {
                if key.hasPrefix("taskToggle.") {
                    defaults?.removeObject(forKey: key)
                }
            }
            WidgetCenter.shared.reloadTimelines(ofKind: "TasksWidget")
        }
        // Each action has its own key so acknowledging an older action cannot
        // erase a new tap written by the extension while JS was saving.
        AsyncFunction("getPendingToggles") { () -> String in
            let defaults = UserDefaults(suiteName: "group.app.planstracker.widget")
            let actions = (defaults?.dictionaryRepresentation() ?? [:])
                .filter { $0.key.hasPrefix("taskToggle.") }
                .compactMap { $0.value as? String }
            return "[" + actions.joined(separator: ",") + "]"
        }
        AsyncFunction("acknowledgeToggle") { (id: String) in
            UserDefaults(suiteName: "group.app.planstracker.widget")?.removeObject(forKey: "taskToggle." + id)
        }
    }
}
