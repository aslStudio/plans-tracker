// Combines @react-native/jest-preset's resolver (platform/haste extension
// handling) with react-native-worklets' resolver tweak, which strips
// `.native.` extensions for its own package so Jest resolves the plain
// (mock-friendly) module instead of the one that touches the real native
// worklets runtime. Reanimated's own mock re-exports the real package
// internals, so without this, requiring `react-native-reanimated/mock`
// crashes trying to load a native module that doesn't exist in Jest.
const rnResolver = require('@react-native/jest-preset/jest/resolver.js')

module.exports = (request, options) => {
    if (
        options.basedir.includes('react-native-worklets') ||
        request.includes('react-native-worklets')
    ) {
        options = {
            ...options,
            extensions: options.extensions?.filter((ext) => !ext.includes('native')),
        }
    }

    return rnResolver(request, options)
}
