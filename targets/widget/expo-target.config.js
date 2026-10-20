/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
    type: 'widget',
    name: 'CalendarWidget',
    displayName: 'Календарь',
    // `AppIntents` backs the Habits widget's tap-to-complete `Button(intent:)`
    // rows (iOS 17+ interactive widgets).
    frameworks: ['WidgetKit', 'SwiftUI', 'AppIntents'],
    // `.containerBackground(for: .widget)` (iOS 17+) is the only reason this
    // needs a higher floor than the main app's deployment target — the
    // widget extension sets its own independent of the app's.
    deploymentTarget: '17.0',
    // Restrict to iPhone — without this, apple-targets defaults widgets to
    // iPhone + iPad ("1,2") even though the app itself is iPhone-only.
    deviceFamilies: ['phone'],
    // Left empty so the App Group in `ios.entitlements` (app.json) auto-syncs
    // here — widgets sync app groups by default, see @bacons/apple-targets'
    // entitlements/app-groups.md.
    entitlements: {},
})
