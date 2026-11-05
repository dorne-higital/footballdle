import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Streak Shields (1.3, F6): earned every 7 days, held up to 2 (3 with Pro), one covers a
// single missed day, and they never count towards the Matchday trophies (realBest)
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false }, registerPlugin: () => ({}) }))
const storage = new Map<string, string>()
globalThis.localStorage = {
	getItem: (k: string) => storage.get(k) ?? null,
	setItem: (k: string, v: string) => void storage.set(k, v),
	removeItem: (k: string) => void storage.delete(k),
	clear: () => storage.clear(),
	key: () => null,
	length: 0,
} as Storage

vi.stubGlobal('useRuntimeConfig', () => ({ public: { isApp: true, appShell: true } }))

const { usePlayStreakStore, shiftUKDate } = await import('../app/stores/playStreak')
const { usePurchasesStore } = await import('../app/stores/purchases')

const day = (n: number) => shiftUKDate('01/11/2026', n)

function fresh(pro = false) {
	setActivePinia(createPinia())
	usePurchasesStore().isPro = pro
	const s = usePlayStreakStore()
	s.current = 0
	s.best = 0
	s.lastDate = ''
	return s
}
const playDays = (s: ReturnType<typeof usePlayStreakStore>, from: number, to: number) => {
	for (let n = from; n <= to; n++) s.markPlayed(day(n))
}

describe('Streak Shields', () => {
	beforeEach(() => storage.clear())

	it('shifts UK dates across months', () => {
		expect(shiftUKDate('31/10/2026', 1)).toBe('01/11/2026')
		expect(shiftUKDate('01/03/2026', -1)).toBe('28/02/2026')
	})

	it('earns one every 7 days, up to 2 (3 with Pro)', () => {
		const s = fresh()
		playDays(s, 0, 6)
		expect(s.shields).toBe(1)
		playDays(s, 7, 27)
		expect(s.shields).toBe(2)
		const pro = fresh(true)
		playDays(pro, 0, 27)
		expect(pro.shields).toBe(3)
	})

	it('covers a single missed day and the streak carries on', () => {
		const s = fresh()
		playDays(s, 0, 6)
		// day 7 missed, back on day 8: the shield bridges the gap without adding a day
		s.markPlayed(day(8))
		expect(s.current).toBe(8)
		expect(s.shields).toBe(0)
		expect(s.shieldedDate).toBe(day(7))
		expect(s.shieldSeen).toBe(false)
	})

	it('does nothing for two missed days, or with no shield', () => {
		const s = fresh()
		playDays(s, 0, 6)
		s.markPlayed(day(9))
		expect(s.current).toBe(1)
		expect(s.shields).toBe(1)
		const none = fresh()
		playDays(none, 0, 3)
		none.markPlayed(day(5))
		expect(none.current).toBe(1)
	})

	it('trophies count real days only', () => {
		const s = fresh()
		playDays(s, 0, 6)
		s.markPlayed(day(8))
		playDays(s, 9, 10)
		expect(s.best).toBe(10)
		expect(s.realBest).toBe(7)
	})
})
