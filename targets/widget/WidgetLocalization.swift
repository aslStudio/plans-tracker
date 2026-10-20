import Foundation
var widgetLanguage: String {
    if let saved = UserDefaults(suiteName: "group.app.planstracker.widget")?.string(forKey: "appLanguage"), ["ru", "en"].contains(saved) { return saved }
    return (Locale.preferredLanguages.first ?? "en").lowercased().hasPrefix("ru") ? "ru" : "en"
}
var widgetLocale: Locale { Locale(identifier: widgetLanguage == "ru" ? "ru_RU" : "en_US") }
func widgetText(_ ru: String, _ en: String) -> String { widgetLanguage == "ru" ? ru : en }
