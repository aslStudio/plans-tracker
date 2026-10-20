const { withStorybook } = require('@storybook/react-native/withStorybook')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)
config.transformer.babelTransformerPath =
    require.resolve('react-native-svg-transformer/expo')
config.resolver.assetExts = config.resolver.assetExts.filter(
    (ext) => ext !== 'svg',
)
config.resolver.assetExts.push('tgs')
config.resolver.sourceExts.push('svg')

module.exports = withStorybook(config, { docTools: false })
