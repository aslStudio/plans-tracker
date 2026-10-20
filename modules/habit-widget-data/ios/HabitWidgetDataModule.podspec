Pod::Spec.new do |s|
  s.name           = 'HabitWidgetDataModule'
  s.version        = '1.0.0'
  s.summary        = 'Writes today\'s habit list/streak to the App Group shared with the Habits Home Screen widget.'
  s.description    = 'Bridges today\'s due habits + the all-habits streak to UserDefaults(suiteName:) so the WidgetKit extension can render and toggle them, and reads back pending tap-to-complete toggles.'
  s.license        = 'MIT'
  s.author         = ''
  s.homepage       = 'https://planstracker.app'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,swift}'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
