import { Capacitor } from '@capacitor/core'
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
import { GRID_WEEK_LEADERBOARD, LEADERBOARD_IDS } from '../utils/appStore'
import { useGridStore } from '../stores/grid'
import { useCardsStore } from '../stores/cards'
import { useAccessibilityStore } from '../stores/accessibility'
import { ACHIEVEMENTS, achievementProgress, buildAchievementContext } from '../utils/achievements'
import { nextToPlay, useTodayProgress } from '../composables/useTodayProgress'
import { getUKDateString } from '../utils/dateStreak'
import { track } from '../utils/appGlance'

// Progress already sent to Game Center, so only changes are reported
const ACHIEVEMENTS_SENT_KEY = 'footballdle-achievements-sent'

// App Store rating prompt: asked at good moments only (all three daily games done with
// the Daily won, a Matchday streak of 3, 7 or 30, a finished card set), at most once every 30 days and never
// just after a loss. Only Apple's own prompt, no gate in front of it and no reward; iOS
// itself shows it at most 3 times a year.
const REVIEW_STREAKS = [3, 7, 30]
const REVIEW_ASKED_KEY = 'footballdle-review-asked'
const REVIEW_GAP_MS = 30 * 24 * 60 * 60 * 1000

// Native-only setup for the iOS app; does nothing on the website.
export default defineNuxtPlugin((nuxtApp) => {
	if (!Capacitor.isNativePlatform()) return

	// Status bar text colour follows Settings → Appearance (stores/appearance.ts)

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
	const accessibility = useAccessibilityStore()
	const challenge = useModeStatsStore('challenge')
	for (const store of [daily, scout, spotball, challenge]) store.loadStats()

	// Full-time buzz: success on a win, error on a loss, in any mode
	const haptics = useHaptics()
	let lastLossAt = 0
	for (const store of [daily, scout, spotball, challenge]) {
		watch(() => store.stats.wins, (now, before) => now > before && haptics.success())
		watch(
			() => store.stats.losses,
			(now, before) => {
				if (now <= before) return
				haptics.error()
				lastLossAt = Date.now()
			},
		)
	}

	// AppGlance: all three daily games done, once a day (any order, win or lose)
	const today = useTodayProgress()
	watch(
		() => [daily, scout, spotball].map(s => s.stats.gamesPlayed).join(),
		() => {
			today.refresh()
			if (nextToPlay({ daily: today.daily.value, scout: today.scout.value, spot: today.spot.value })) return
			const key = 'footballdle-glance-matchday'
			try {
				if (localStorage.getItem(key) === getUKDateString()) return
				localStorage.setItem(key, getUKDateString())
			} catch {
				return
			}
			track('matchday.completed')
			// The earliest good moment to ask for a rating, well before a 3-day streak
			if (today.daily.value.status === 'won') askForReview()
		},
	)

	// Rating prompt (see REVIEW_STREAKS). Changes in the first few seconds are a fresh
	// install catching up from iCloud, not a moment to ask
	const launchedAt = Date.now()
	function askForReview() {
		const now = Date.now()
		if (now - launchedAt < 10_000 || now - lastLossAt < 60_000) return
		try {
			if (now - (Number(localStorage.getItem(REVIEW_ASKED_KEY)) || 0) < REVIEW_GAP_MS) return
			localStorage.setItem(REVIEW_ASKED_KEY, String(now))
		} catch {
			return
		}
		// After the win sheet has had a moment on screen
		setTimeout(() => InAppReview.requestReview().catch(() => {}), 1500)
	}
	const playStreak = usePlayStreakStore()
	watch(
		() => playStreak.current,
		(streak, previous) => streak > previous && REVIEW_STREAKS.includes(streak) && askForReview(),
	)
	const cards = useCardsStore()
	watch(
		() => Object.keys(cards.saved.sets).length,
		(sets, previous) => sets > previous && askForReview(),
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

	// The Grid: loaded at launch so its stats count towards trophies and total wins
	const grid = useGridStore()
	watch(
		() => grid.stats.perfectGrids,
		(perfect, previous) => perfect > previous && askForReview(),
	)
	grid.load()

	const totalWins = computed(
		() => daily.stats.wins + scout.stats.wins + spotball.stats.wins + challenge.stats.wins + grid.stats.wins,
	)
	const scores: [string, () => number][] = [
		[LEADERBOARD_IDS.dailyStreak, () => daily.stats.maxStreak],
		[LEADERBOARD_IDS.scoutStreak, () => scout.stats.maxStreak],
		// Not while Settings > Accessibility > Relaxed timer is on: those rounds are twice as long
		[LEADERBOARD_IDS.spotballStreak, () => (accessibility.relaxedTimer ? 0 : spotball.stats.maxStreak)],
		[LEADERBOARD_IDS.totalWins, () => totalWins.value],
		...(GRID_WEEK_LEADERBOARD ? [[GRID_WEEK_LEADERBOARD, () => grid.weekPoints] as [string, () => number]] : []),
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
		[() => [daily.stats, scout.stats, spotball.stats, challenge.stats, grid.stats], gameCenter.isAuthenticated],
		() => reportAchievementProgress(),
		{ deep: true },
	)

	// A newly unlocked trophy is a good moment to ask for a rating
	const trophiesEarned = () =>
		Object.values(
			achievementProgress(
				buildAchievementContext({ daily: daily.stats, scout: scout.stats, spot: spotball.stats, challenge: challenge.stats }),
			),
		).filter(percent => percent >= 100).length
	let earned = trophiesEarned()
	watch(
		() => [daily.stats, scout.stats, spotball.stats, grid.stats, cards.saved],
		() => {
			const now = trophiesEarned()
			if (now > earned) askForReview()
			earned = now
		},
		{ deep: true },
	)
})
