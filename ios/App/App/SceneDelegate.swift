import UIKit
import Capacitor
import AppGlance

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        // MainViewController registers the app's own plugins (Game Center)
        window?.rootViewController = MainViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    // AppGlance sessions ("active right now", installs, retention): the app is UIKit, so
    // there's no SwiftUI root view for .trackAppLifecycle()
    func sceneDidBecomeActive(_ scene: UIScene) {
        AppGlance.setActive(true)
    }

    func sceneWillResignActive(_ scene: UIScene) {
        AppGlance.setActive(false)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
