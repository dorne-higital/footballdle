import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { getUKDateString } from '../utils/dateStreak'
import { usePlayStreakStore } from './playStreak'

const STORAGE_KEY = 'footballdle-reminder'
// Reminders use ids FIRST_ID … FIRST_ID + DAYS_AHEAD - 1
const FIRST_ID = 4100
// Scheduled as one-offs rather than a repeating alarm, so a day you've already played
// can be skipped. Topped up whenever the app opens or a game is finished.
const DAYS_AHEAD = 14

export const REMINDER_HOURS = [9, 12, 18, 20] as const

const MESSAGES = [
	"Today's mystery footballer is waiting. Six tries. Go.",
	'New player, new puzzle. Fancy your chances?',
	"Fresh Daily, Scout Report and Spot the Baller are live. Don't miss out.",
	"Kick-off! Today's Footballdle is ready.",
]

// Daily "come and play" reminder (iOS app only), off until the player opts in
export const useRemindersStore = defineStore('reminders', () => {
	const enabled = ref(false)
	const hour = ref<number>(12)
	const denied = ref(false)
	const isAvailable = ref(Capacitor.isNativePlatform())

	function load() {
		try {
			const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
			if (saved) {
				enabled.value = !!saved.enabled
				hour.value = REMINDER_HOURS.includes(saved.hour) ? saved.hour : 12
			}
		} catch {}
	}

	function save() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: enabled.value, hour: hour.value }))
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
			notifications: Array.from({ length: DAYS_AHEAD }, (_, i) => ({ id: FIRST_ID + i })),
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
			const now = new Date()
			const notifications = []
			for (let i = 0; i < DAYS_AHEAD; i++) {
				const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour.value, 0, 0)
				if (at <= now || (i === 0 && playedToday)) continue
				// The streak still counts tomorrow if it's alive today
				const streak = i === 0 ? playStreak.activeStreak : i === 1 && playedToday ? playStreak.current : 0
				notifications.push({
					id: FIRST_ID + i,
					title: streak >= 2 ? `🔥 ${streak}-day streak on the line` : 'Footballdle',
					body:
						streak >= 2
							? "Play any game today to keep your Matchday streak going."
							: MESSAGES[(at.getDate() + i) % MESSAGES.length]!,
					schedule: { at, allowWhileIdle: true },
					extra: { route: '/play/daily' },
				})
			}
			if (notifications.length) await LocalNotifications.schedule({ notifications })
		} catch (error) {
			console.warn('Could not schedule reminders:', error)
		}
	}

	/** From the Settings toggle: asks for permission the first time */
	async function enable() {
		if (!isAvailable.value) return false
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

	async function setHour(value: number) {
		hour.value = value
		save()
		await reschedule()
	}

	return { enabled, hour, denied, isAvailable, load, enable, disable, setHour, reschedule }
})
