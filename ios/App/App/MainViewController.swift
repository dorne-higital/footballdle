import Capacitor

// Registers the app's own (non-npm) Capacitor plugins, and sets up the web view's scrolling.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(GameCenterPlugin())
        bridge?.registerPluginInstance(ICloudBackupPlugin())

        // Screens scroll up and down only, with no scroll bar line
        if let scrollView = webView?.scrollView {
            scrollView.showsVerticalScrollIndicator = false
            scrollView.showsHorizontalScrollIndicator = false
            scrollView.alwaysBounceHorizontal = false
        }
    }
}
