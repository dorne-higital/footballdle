import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Puzzle archive (1.3, F3): #1 to yesterday, never today; the last 7 days cost a hint each
// (free with Pro), older days are Pro only; no stats or streaks
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
// 5 Nov 2026: Daily #1 was 7 Oct, so the archive is #1 to #29 (4 Nov)
vi.useFakeTimers()
vi.setSystemTime(new Date('2026-11-05T12:00:00Z'))

const { useArchiveStore, FREE_DAYS } = await import('../app/stores/archive')
const { usePurchasesStore } = await import('../app/stores/purchases')
const { getAnswerForDay } = await import('../app/composables/useFootballers')

function fresh(pro = false, hints = 3) {
	storage.clear()
	setActivePinia(createPinia())
	const purchases = usePurchasesStore()
	purchases.isPro = pro
	purchases.hintBank = hints
	const archive = useArchiveStore()
	archive.load()
	return { archive, purchases }
}

describe('puzzle archive', () => {
	beforeEach(() => storage.clear())

	it('runs from yesterday back to #1, never today', () => {
		const { archive } = fresh()
		expect(archive.days[0]).toMatchObject({ date: '04/11/2026', iso: '2026-11-04', number: 29 })
		expect(archive.days.at(-1)).toMatchObject({ date: '07/10/2026', number: 1 })
		expect(archive.days.some(d => d.date === '05/11/2026')).toBe(false)
		expect(archive.start('2026-11-05')).toBe(false)
	})

	it('the last week costs a hint each, older days need Pro', () => {
		const { archive, purchases } = fresh()
		expect(archive.days.slice(0, FREE_DAYS).every(d => d.access === 'hint')).toBe(true)
		expect(archive.days[FREE_DAYS]!.access).toBe('pro')
		expect(archive.start(archive.days[FREE_DAYS]!.iso)).toBe(false)
		expect(archive.start('2026-11-04')).toBe(true)
		expect(purchases.hintBank).toBe(2)
		// Opening it again is free
		expect(archive.start('2026-11-04')).toBe(true)
		expect(purchases.hintBank).toBe(2)
	})

	it('Pro opens everything for free', () => {
		const { archive, purchases } = fresh(true, 0)
		expect(archive.days.every(d => d.access === 'open')).toBe(true)
		expect(archive.start(archive.days.at(-1)!.iso)).toBe(true)
		expect(purchases.hintBank).toBe(0)
	})

	it('plays with Daily rules and always accepts the answer', () => {
		const { archive } = fresh(true)
		archive.start('2026-11-04')
		for (const ch of getAnswerForDay('04/11/2026').toUpperCase()) archive.onKey(ch)
		archive.onKey('ENTER')
		expect(archive.game).toMatchObject({ over: true, win: true })
		expect(archive.days[0]!.game?.win).toBe(true)
	})
})
