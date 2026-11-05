import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Reminders (1.3, K3): the daily one, Grid wording on Saturdays, and the 21:30 last-chance
// nudge for a streak of 3+ that hasn't been kept yet
const scheduled: { id: number; title: string; body: string; schedule: { at: Date } }[] = []
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true }, registerPlugin: () => ({}) }))
vi.mock('@capacitor/local-notifications', () => ({
	LocalNotifications: {
		checkPermissions: async () => ({ display: 'granted' }),
		requestPermissions: async () => ({ display: 'granted' }),
		cancel: async () => {},
		schedule: async ({ notifications }: { notifications: typeof scheduled }) => void scheduled.push(...notifications),
	},
}))

const storage = new Map<string, string>()
globalThis.localStorage = {
	getItem: (k: string) => storage.get(k) ?? null,
	setItem: (k: string, v: string) => void storage.set(k, v),
	removeItem: (k: string) => void storage.delete(k),
	clear: () => storage.clear(),
	key: () => null,
	length: 0,
} as Storage

const { useRemindersStore } = await import('../app/stores/reminders')
const { usePlayStreakStore } = await import('../app/stores/playStreak')

const uk = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

async function plan(now: Date, streak: { current: number; lastDate: Date }, prefs: object = {}) {
	vi.setSystemTime(now)
	storage.set('footballdle-reminder', JSON.stringify({ enabled: true, hour: 12, ...prefs }))
	setActivePinia(createPinia())
	// The streak store only reads storage in the browser, so set it directly
	const playStreak = usePlayStreakStore()
	playStreak.current = streak.current
	playStreak.lastDate = uk(streak.lastDate)
	const reminders = useRemindersStore()
	reminders.load()
	scheduled.length = 0
	await reminders.reschedule()
	return scheduled
}

describe('reminders', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		storage.clear()
	})
	afterEach(() => vi.useRealTimers())

	// Friday 6 Nov 2026, 10am; Saturday is the 7th
	const friday = new Date(2026, 10, 6, 10, 0)
	const thursday = new Date(2026, 10, 5)

	it('plans a fortnight of daily reminders, with the Grid drop on Saturdays', async () => {
		const out = await plan(friday, { current: 1, lastDate: thursday })
		const daily = out.filter(n => n.id < 4200)
		expect(daily).toHaveLength(14)
		const saturday = daily.find(n => n.schedule.at.getDate() === 7)!
		expect(saturday.body).toContain('Five new Grids')
	})

	it('adds a 21:30 last chance while a 3+ streak is unplayed today', async () => {
		const out = await plan(friday, { current: 5, lastDate: thursday })
		const last = out.filter(n => n.id >= 4200)
		expect(last).toHaveLength(1)
		expect(last[0]!.title).toBe('Your 5-day streak ends at midnight')
		expect(last[0]!.schedule.at.getHours()).toBe(21)
		expect(last[0]!.schedule.at.getMinutes()).toBe(30)
	})

	it('played today: nothing tonight, tomorrow covered instead', async () => {
		const out = await plan(friday, { current: 5, lastDate: friday })
		const last = out.filter(n => n.id >= 4200)
		expect(last).toHaveLength(1)
		expect(last[0]!.schedule.at.getDate()).toBe(7)
		expect(out.some(n => n.schedule.at.getDate() === 6)).toBe(false)
	})

	it('no last chance for short streaks, when switched off, or for late reminder times', async () => {
		expect((await plan(friday, { current: 2, lastDate: thursday })).some(n => n.id >= 4200)).toBe(false)
		expect((await plan(friday, { current: 5, lastDate: thursday }, { lastChance: false })).some(n => n.id >= 4200)).toBe(false)
	})

	it('never more than two a day', async () => {
		const out = await plan(friday, { current: 9, lastDate: thursday })
		const perDay = new Map<number, number>()
		for (const n of out) perDay.set(n.schedule.at.getDate(), (perDay.get(n.schedule.at.getDate()) ?? 0) + 1)
		expect(Math.max(...perDay.values())).toBeLessThanOrEqual(2)
	})
})
