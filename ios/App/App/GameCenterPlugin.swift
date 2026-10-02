import Capacitor
import GameKit

// Minimal Game Center bridge: sign-in, score submission and the leaderboard UI.
// JS side lives in app/composables/useGameCenter.ts.
@objc(GameCenterPlugin)
public class GameCenterPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GameCenterPlugin"
    public let jsName = "GameCenter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submitScore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showLeaderboards", returnType: CAPPluginReturnPromise)
    ]

    @objc func authenticate(_ call: CAPPluginCall) {
        let player = GKLocalPlayer.local
        if player.isAuthenticated {
            call.resolve(["authenticated": true])
            return
        }

        // GameKit may call this handler more than once (e.g. after the sign-in
        // sheet closes), so only resolve the JS promise the first time.
        var resolved = false
        player.authenticateHandler = { [weak self] viewController, _ in
            DispatchQueue.main.async {
                if let viewController = viewController {
                    self?.bridge?.viewController?.present(viewController, animated: true)
                    return
                }
                if !resolved {
                    resolved = true
                    call.resolve(["authenticated": player.isAuthenticated])
                }
            }
        }
    }

    @objc func submitScore(_ call: CAPPluginCall) {
        guard let leaderboardId = call.getString("leaderboardId"), let score = call.getInt("score") else {
            call.reject("leaderboardId and score are required")
            return
        }
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Not signed in to Game Center")
            return
        }

        GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [leaderboardId]) { error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve()
            }
        }
    }

    @objc func showLeaderboards(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let gameCenterVC: GKGameCenterViewController
            if let leaderboardId = call.getString("leaderboardId") {
                gameCenterVC = GKGameCenterViewController(leaderboardID: leaderboardId, playerScope: .global, timeScope: .allTime)
            } else {
                gameCenterVC = GKGameCenterViewController(state: .leaderboards)
            }
            gameCenterVC.gameCenterDelegate = self
            self.bridge?.viewController?.present(gameCenterVC, animated: true)
            call.resolve()
        }
    }
}

extension GameCenterPlugin: GKGameCenterControllerDelegate {
    public func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
}
