import Capacitor

// Registers the app's own (non-npm) Capacitor plugins, and sets up the web view's scrolling.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(GameCenterPlugin())
        bridge?.registerPluginInstance(ICloudBackupPlugin())

        // No white flash at launch: an opaque web view with nothing drawn yet paints white,
        // so keep it see-through over the app's own dark green (Capacitor keeps whatever
        // opacity it finds here once the first page has loaded)
        let launchGreen = UIColor(red: 7 / 255, green: 19 / 255, blue: 13 / 255, alpha: 1)
        view.backgroundColor = launchGreen
        webView?.isOpaque = false
        webView?.backgroundColor = launchGreen

        // Screens scroll up and down only, with no scroll bar line
        if let scrollView = webView?.scrollView {
            scrollView.showsVerticalScrollIndicator = false
            scrollView.showsHorizontalScrollIndicator = false
            scrollView.alwaysBounceHorizontal = false
        }
    }
}
