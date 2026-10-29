import { Capacitor } from '@capacitor/core'
import { watch } from 'vue'
import { useModeStatsStore } from '../stores/modeStats'
import { usePurchasesStore } from '../stores/purchases'

const STREAK_HINT_EVERY = 5
const STREAK_REWARD_KEY = 'footballdle-streak-reward'

// The hint bank wherever the app shell runs (iPhone and website): welcome hints, and a
// free hint for every 5 days of Daily streak. Purchases themselves are iPhone only
// (plugins/native-app.client.ts starts RevenueCat there).
export default defineNuxtPlugin(() => {
	if (!useRuntimeConfig().public.appShell) return

	const purchases = usePurchasesStore()
	const daily = useModeStatsStore('daily')
	// After hydration: on the website the server-rendered state (no hints, no stats) would
	// otherwise overwrite what's saved in this browser
	onNuxtReady(() => {
		if (!Capacitor.isNativePlatform()) purchases.init()
		daily.loadStats()
	})

	// Keyed by streak and date so a reload or stats refresh can't pay out the same
	// milestone twice
	watch(
		() => daily.stats.currentStreak,
		(streak, previous) => {
			if (streak <= previous || streak % STREAK_HINT_EVERY !== 0) return
			const key = `${streak}-${daily.stats.lastPlayedDate}`
			if (localStorage.getItem(STREAK_REWARD_KEY) === key) return
			localStorage.setItem(STREAK_REWARD_KEY, key)
			purchases.grantHints(1)
			purchases.rewardNote = `${streak}-day Daily streak! Free hint added.`
		},
	)
})
