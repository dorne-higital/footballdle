import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { getUKDateString } from '../utils/dateStreak'
import { usePlayStreakStore } from './playStreak'
import { useGridStore } from './grid'

const STORAGE_KEY = 'footballdle-reminder'
// Reminders use ids FIRST_ID … FIRST_ID + DAYS_AHEAD - 1
const FIRST_ID = 4100
// Scheduled as one-offs rather than a repeating alarm, so a day you've already played
// can be skipped. Topped up whenever the app opens or a game is finished.
const DAYS_AHEAD = 14
// The streak's "last chance" nudge (1.3): ids LAST_CHANCE_ID … + 1, today and tomorrow only,
// at 21:30 when a Matchday streak of 3 or more hasn't been kept yet. With the daily one,
// never more than two a day.
const LAST_CHANCE_ID = FIRST_ID + 100
const LAST_CHANCE_STREAK = 3
// Asked once, after a finished game (FullTimePanel.vue), not before anything's been played
const ASKED_KEY = 'footballdle-reminder-asked'

export const REMINDER_HOURS = [9, 12, 18, 20] as const

const MESSAGES = [
	"Today's mystery footballer is waiting. Six tries. Go.",
	'New player, new puzzle. Fancy your chances?',
	"Fresh Daily, Scout Report and Spot the Baller are live. Don't miss out.",
	"Kick-off! Today's Footballdle is ready.",
]
// The Grid drops five new grids every Saturday; Friday is the last day of a week
const GRID_DROP = 'Five new Grids are live, the same for everyone. Plus today\'s Daily.'
const GRID_LAST_DAY = "Last day for this week's Grids. New ones drop tomorrow."

// Daily "come and play" reminder (iOS app only), off until the player opts in
export const useRemindersStore = defineStore('reminders', () => {
	const enabled = ref(false)
	const hour = ref<number>(12)
	const denied = ref(false)
	// The 21:30 streak nudge; on unless switched off in Settings
	const lastChance = ref(true)
	const isAvailable = ref(Capacitor.isNativePlatform())

	function load() {
		try {
			const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
			if (saved) {
				enabled.value = !!saved.enabled
				hour.value = REMINDER_HOURS.includes(saved.hour) ? saved.hour : 12
				lastChance.value = saved.lastChance !== false
			}
		} catch {}
	}

	function save() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: enabled.value, hour: hour.value, lastChance: lastChance.value }))
		} catch {}
	}

	// Wrapped in an object: returning a Capacitor plugin (a Proxy that answers to
	// `then`) straight from an async function makes the promise hang forever
	async function plugin() {
		const { LocalNotifications } = await import('@capacitor/local-notifications')
		return { LocalNotifications }
	}

	async function cancelAll() {
		const { LocalNotifications } = await plugin()
		await LocalNotifications.cancel({
			notifications: [
				...Array.from({ length: DAYS_AHEAD }, (_, i) => ({ id: FIRST_ID + i })),
				{ id: LAST_CHANCE_ID },
				{ id: LAST_CHANCE_ID + 1 },
			],
		})
	}

	/** Re-plan the next fortnight of reminders. Only ever called once the player has
	 *  opted in, because scheduling asks for permission if it hasn't been granted. */
	async function reschedule() {
		if (!isAvailable.value || !enabled.value) return
		try {
			const { LocalNotifications } = await plugin()
			const { display } = await LocalNotifications.checkPermissions()
			if (display !== 'granted') {
				denied.value = display === 'denied'
				return
			}
			await cancelAll()

			const playStreak = usePlayStreakStore()
			playStreak.load()
			const playedToday = playStreak.lastDate === getUKDateString()
			// This week's Grids started but not finished (only known for the current week)
			const grid = useGridStore()
			const gridsLeft = grid.weekSolved > 0 && !grid.weekDone
			const now = new Date()
			const notifications = []
			for (let i = 0; i < DAYS_AHEAD; i++) {
				const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour.value, 0, 0)
				if (at <= now || (i === 0 && playedToday)) continue
				// The streak still counts tomorrow if it's alive today
				const streak = i === 0 ? playStreak.activeStreak : i === 1 && playedToday ? playStreak.current : 0
				const day = at.getDay()
				const gridDay = day === 6 ? 'drop' : day === 5 && i < 7 && gridsLeft ? 'last' : ''
				notifications.push({
					id: FIRST_ID + i,
					title: streak >= 2 ? `${streak}-day Matchday streak on the line` : 'Footballdle',
					body:
						streak >= 2
							? "Play any game today to keep your Matchday streak going."
							: gridDay === 'drop'
								? GRID_DROP
								: gridDay === 'last'
									? GRID_LAST_DAY
									: MESSAGES[(at.getDate() + i) % MESSAGES.length]!,
					schedule: { at, allowWhileIdle: true },
					extra: { route: gridDay ? '/play/grid' : '/play/daily' },
				})
			}
			// Last chance, late in the evening, while a streak worth saving is still unplayed.
			// Only today and tomorrow are known; playing cancels it (reschedule runs then).
			if (lastChance.value && hour.value < 21) {
				for (const i of [0, 1]) {
					const streak = i === 0 ? (playedToday ? 0 : playStreak.activeStreak) : playedToday ? playStreak.current : 0
					const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 21, 30, 0)
					if (streak < LAST_CHANCE_STREAK || at <= now) continue
					notifications.push({
						id: LAST_CHANCE_ID + i,
						title: `Your ${streak}-day streak ends at midnight`,
						body: 'Any game keeps it going. One minute is enough.',
						schedule: { at, allowWhileIdle: true },
						extra: { route: '/play/daily' },
					})
				}
			}
			if (notifications.length) await LocalNotifications.schedule({ notifications })
		} catch (error) {
			console.warn('Could not schedule reminders:', error)
		}
	}

	/** From the Settings toggle, or the ask after a game with the hour they're playing at:
	 *  asks for permission the first time */
	async function enable(atHour?: number) {
		if (!isAvailable.value) return false
		if (atHour !== undefined && (REMINDER_HOURS as readonly number[]).includes(atHour)) hour.value = atHour
		try {
			const { LocalNotifications } = await plugin()
			const { display } = await LocalNotifications.requestPermissions()
			denied.value = display !== 'granted'
			if (denied.value) return false
			enabled.value = true
			save()
			await reschedule()
			return true
		} catch {
			return false
		}
	}

	async function disable() {
		enabled.value = false
		save()
		if (isAvailable.value) await cancelAll().catch(() => {})
	}

	async function setLastChance(on: boolean) {
		lastChance.value = on
		save()
		if (on) await reschedule()
		else if (isAvailable.value) {
			const { LocalNotifications } = await plugin()
			await LocalNotifications.cancel({ notifications: [{ id: LAST_CHANCE_ID }, { id: LAST_CHANCE_ID + 1 }] }).catch(() => {})
		}
	}

	/** The ask after a finished game: shown once, only if reminders are off and allowed */
	function shouldAsk() {
		if (!isAvailable.value || enabled.value || denied.value) return false
		try {
			return !localStorage.getItem(ASKED_KEY)
		} catch {
			return false
		}
	}
	function markAsked() {
		try {
			localStorage.setItem(ASKED_KEY, '1')
		} catch {}
	}

	async function setHour(value: number) {
		hour.value = value
		save()
		await reschedule()
	}

	return { enabled, hour, denied, isAvailable, lastChance, load, enable, disable, setHour, setLastChance, shouldAsk, markAsked, reschedule }
})
