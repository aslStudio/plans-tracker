Pod::Spec.new do |s|
  s.name = 'PlansCloud'
  s.version = '1.0.0'
  s.summary = 'Private CloudKit storage for Plans Tracker'
  s.description = 'Stores the application archive in the user private CloudKit database.'
  s.author = 'Plans Tracker'
  s.homepage = 'https://expo.dev'
  s.license = { :type => 'MIT' }
  s.platforms = { :ios => '16.4' }
  s.source = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'CloudKit'
  s.swift_version = '5.9'
  s.source_files = '**/*.{h,m,mm,swift}'
end
