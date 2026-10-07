import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import { InAppReview } from '@capacitor-community/in-app-review'
import { App } from '@capacitor/app'
import { LocalNotifications } from '@capacitor/local-notifications'
import { computed, watch } from 'vue'
import { useModeStatsStore } from '../stores/modeStats'
import { usePurchasesStore } from '../stores/purchases'
import { usePlayStreakStore } from '../stores/playStreak'
import { useRemindersStore } from '../stores/reminders'
import { useGameCenter } from '../composables/useGameCenter'
import { useHaptics } from '../composables/useHaptics'
import { LEADERBOARD_IDS } from '../utils/appStore'
import { ACHIEVEMENTS, achievementProgress, buildAchievementContext } from '../utils/achievements'

// Progress already sent to Game Center, so only changes are reported
const ACHIEVEMENTS_SENT_KEY = 'footballdle-achievements-sent'

// Daily streaks at which we ask for an App Store rating (iOS rate-limits the prompt itself)
const REVIEW_PROMPT_STREAKS = [3, 10]

const STREAK_HINT_EVERY = 5
const STREAK_REWARD_KEY = 'footballdle-streak-reward'

// Native-only setup for the iOS app; does nothing on the website.
export default defineNuxtPlugin((nuxtApp) => {
	if (!Capacitor.isNativePlatform()) return

	// The app is always the dark Floodlights look; Style.Dark = light status bar text
	StatusBar.setStyle({ style: Style.Dark }).catch(() => {})

	// Keyboard: no "^ v Done" bar, and the page stays pinned to the top while the
	// web view resizes around the keyboard (see capacitor.config.ts)
	Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {})
	// html.keyboard-open lets screens hide extras while typing (assets/_app-shell.scss)
	const root = document.documentElement
	Keyboard.addListener('keyboardWillShow', () => {
		root.classList.add('keyboard-open')
		window.scrollTo(0, 0)
	}).catch(() => {})
	Keyboard.addListener('keyboardDidShow', () => window.scrollTo(0, 0)).catch(() => {})
	Keyboard.addListener('keyboardWillHide', () => root.classList.remove('keyboard-open')).catch(() => {})

	const purchases = usePurchasesStore()
	purchases.init()


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

	// A free hint for every 5 days of Daily streak. Keyed by streak and date so a
	// reload or stats refresh can't pay out the same milestone twice.
	watch(
		() => daily.stats.currentStreak,
		(streak, previous) => {
			if (streak <= previous || streak % STREAK_HINT_EVERY !== 0) return
			const key = `${streak}-${daily.stats.lastPlayedDate}`
			if (localStorage.getItem(STREAK_REWARD_KEY) === key) return
			localStorage.setItem(STREAK_REWARD_KEY, key)
			purchases.grantHints(1)
			purchases.rewardNote = `${streak}-day streak! Free hint added.`
		},
	)

	// Sign in once the app is on screen (iOS can't show the sign-in sheet mid-launch).
	// Scores go up whenever the player is signed in, including a later sign-in from the
	// Ranks tab, and again whenever they improve; earlier stats are backfilled.
	const gameCenter = useGameCenter()
	// Daily reminders (opt-in from Settings): keep the next fortnight planned, and drop
	// today's once a game has been played
	const reminders = useRemindersStore()
	reminders.load()
	reminders.reschedule()
	App.addListener('resume', () => reminders.reschedule()).catch(() => {})
	watch(
		() => usePlayStreakStore().lastDate,
		() => reminders.reschedule(),
	)
	// Tapping a reminder opens the Daily
	LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
		const route = action.notification.extra?.route
		if (typeof route === 'string') navigateTo(route)
	}).catch(() => {})

	nuxtApp.hook('app:mounted', () => {
		gameCenter.watchAuth()
		setTimeout(() => gameCenter.authenticate(), 800)
	})
	// Back from iOS Settings: pick up a Game Center sign-in made while we were away.
	// Only shows a sheet if GameKit had one waiting that never got on screen.
	App.addListener('resume', () => {
		if (!gameCenter.isAuthenticated.value) gameCenter.authenticate(5000)
	}).catch(() => {})

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
		watch([score, gameCenter.isAuthenticated], ([value, signedIn]) => {
			if (signedIn) gameCenter.submitScore(leaderboardId, value)
		})
	}

	// Achievements: recalculated from stats whenever they change (and on sign-in)
	const readJson = (key: string) => {
		try {
			return JSON.parse(localStorage.getItem(key) || 'null')
		} catch {
			return null
		}
	}

	async function reportAchievementProgress() {
		if (!gameCenter.isAuthenticated.value) return
		const ctx = buildAchievementContext({
			daily: daily.stats,
			scout: scout.stats,
			spot: spotball.stats,
			challenge: challenge.stats,
		})
		const sent: Record<string, number> = readJson(ACHIEVEMENTS_SENT_KEY) ?? {}
		const progress = achievementProgress(ctx)
		const changed = ACHIEVEMENTS.map(a => ({ id: a.id, percent: progress[a.id] ?? 0 })).filter(
			a => a.percent > (sent[a.id] ?? 0),
		)
		if (changed.length && (await gameCenter.reportAchievements(changed))) {
			for (const a of changed) sent[a.id] = a.percent
			localStorage.setItem(ACHIEVEMENTS_SENT_KEY, JSON.stringify(sent))
		}
	}

	watch(
		[() => [daily.stats, scout.stats, spotball.stats, challenge.stats], gameCenter.isAuthenticated],
		() => reportAchievementProgress(),
		{ deep: true },
	)
})
