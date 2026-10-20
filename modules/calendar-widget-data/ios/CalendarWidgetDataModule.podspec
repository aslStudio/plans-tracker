Pod::Spec.new do |s|
  s.name           = 'CalendarWidgetDataModule'
  s.version        = '1.0.0'
  s.summary        = 'Writes the upcoming calendar agenda to the App Group shared with the Calendar Home Screen widget.'
  s.description    = 'Bridges the upcoming agenda window to UserDefaults(suiteName:) so the WidgetKit extension can render it, and reloads the widget timeline.'
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
