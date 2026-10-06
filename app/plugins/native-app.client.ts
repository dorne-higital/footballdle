import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { InAppReview } from '@capacitor-community/in-app-review'
import { computed, watch } from 'vue'
import { useModeStatsStore } from '../stores/modeStats'
import { usePurchasesStore } from '../stores/purchases'
import { useGameCenter } from '../composables/useGameCenter'
import { useHaptics } from '../composables/useHaptics'
import { LEADERBOARD_IDS } from '../utils/appStore'

// Daily streaks at which we ask for an App Store rating (iOS rate-limits the prompt itself)
const REVIEW_PROMPT_STREAKS = [3, 10]

// Native-only setup for the iOS app; does nothing on the website.
export default defineNuxtPlugin(() => {
	if (!Capacitor.isNativePlatform()) return

	// The app is always the dark Floodlights look; Style.Dark = light status bar text
	StatusBar.setStyle({ style: Style.Dark }).catch(() => {})

	usePurchasesStore().init()

	const daily = useModeStatsStore('daily')
	const scout = useModeStatsStore('scout')
	const spotball = useModeStatsStore('spotball')
	const challenge = useModeStatsStore('challenge')
	for (const store of [daily, scout, spotball, challenge]) store.loadStats()

	// Full-time buzz: success on a win, error on a loss, in any mode
	const haptics = useHaptics()
	for (const store of [daily, scout, spotball, challenge]) {
		watch(() => store.stats.wins, (now, before) => now > before && haptics.success())
		watch(() => store.stats.losses, (now, before) => now > before && haptics.error())
	}

	watch(
		() => daily.stats.currentStreak,
		(streak, previous) => {
			if (streak > previous && REVIEW_PROMPT_STREAKS.includes(streak)) {
				InAppReview.requestReview().catch(() => {})
			}
		},
	)

	// Submit after sign-in (backfilling existing stats), then whenever they improve
	const gameCenter = useGameCenter()
	gameCenter.authenticate().then((authenticated) => {
		if (!authenticated) return

		const totalWins = computed(
			() => daily.stats.wins + scout.stats.wins + spotball.stats.wins + challenge.stats.wins,
		)
		const scores: [string, () => number][] = [
			[LEADERBOARD_IDS.dailyStreak, () => daily.stats.maxStreak],
			[LEADERBOARD_IDS.scoutStreak, () => scout.stats.maxStreak],
			[LEADERBOARD_IDS.spotballStreak, () => spotball.stats.maxStreak],
			[LEADERBOARD_IDS.totalWins, () => totalWins.value],
		]
		for (const [leaderboardId, score] of scores) {
			watch(score, value => gameCenter.submitScore(leaderboardId, value), { immediate: true })
		}
	})
})
