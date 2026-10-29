import Capacitor
import AppGlance

// AppGlance analytics for the web app: the screens and events happen in the web view, so
// they reach the SDK through here. Calls resolve straight away and never fail; the SDK
// queues and sends on its own. JS side: app/utils/appGlance.ts
@objc(AppGlancePlugin)
public class AppGlancePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppGlancePlugin"
    public let jsName = "AppGlance"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "track", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "trackScreen", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setUserProperties", returnType: CAPPluginReturnPromise)
    ]

    @objc func track(_ call: CAPPluginCall) {
        if let name = call.getString("name") {
            AppGlance.track(name, metadata: strings(call.getObject("metadata")))
        }
        call.resolve()
    }

    @objc func trackScreen(_ call: CAPPluginCall) {
        if let name = call.getString("name") {
            AppGlance.trackScreen(name)
        }
        call.resolve()
    }

    @objc func setUserProperties(_ call: CAPPluginCall) {
        AppGlance.setUserProperties(strings(call.getObject("properties")))
        call.resolve()
    }

    // Metadata is [String: String]; anything else from JS is dropped
    private func strings(_ object: JSObject?) -> [String: String] {
        (object ?? [:]).compactMapValues { $0 as? String }
    }
}
