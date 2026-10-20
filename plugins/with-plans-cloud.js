const { withEntitlementsPlist, withInfoPlist } = require('expo/config-plugins')
module.exports = function withPlansCloud(config) {
    const container = process.env.PLANS_TRACKER_ICLOUD_CONTAINER
    const bundle = process.env.PLANS_TRACKER_IOS_BUNDLE_IDENTIFIER
    if (bundle) config.ios = { ...config.ios, bundleIdentifier: bundle }
    if (!container) return config
    if (!container.startsWith('iCloud.'))
        throw new Error('PLANS_TRACKER_ICLOUD_CONTAINER must start with iCloud.')
    config = withEntitlementsPlist(config, (c) => {
        c.modResults['com.apple.developer.icloud-container-identifiers'] = [
            container,
        ]
        c.modResults['com.apple.developer.icloud-services'] = ['CloudKit']
        return c
    })
    return withInfoPlist(config, (c) => {
        c.modResults.PlansCloudContainer = container
        return c
    })
}
