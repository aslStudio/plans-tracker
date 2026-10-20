import ExpoModulesCore

public class AppEnvironmentModule: Module {
    public func definition() -> ModuleDefinition {
        Name("AppEnvironment")
        // appStoreReceiptURL is deprecated in favor of StoreKit 2's AppTransaction,
        // but that API needs iOS 16+ entitlement plumbing not worth it for a single
        // TestFlight-vs-App-Store check; the receipt file name still reliably differs.
        Function("isTestFlight") { () -> Bool in
            Bundle.main.appStoreReceiptURL?.lastPathComponent == "sandboxReceipt"
        }
    }
}
