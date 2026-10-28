import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { currentSeason, lastDayOf, seasonDay, useCardsStore } from '../app/stores/cards'
import { useReplayStore } from '../app/stores/replay'

const storage = new Map<string, string>()
globalThis.localStorage = {
	getItem: (k: string) => storage.get(k) ?? null,
	setItem: (k: string, v: string) => void storage.set(k, v),
	removeItem: (k: string) => void storage.delete(k),
	clear: () => storage.clear(),
	key: () => null,
	length: 0,
} as Storage
vi.stubGlobal('useRuntimeConfig', () => ({ public: { isApp: true, appShell: true, revenuecatAppleKey: '' } }))

// 28 Oct 2026, two weeks into the 2026-27 season
const TODAY = new Date('2026-10-28T12:00:00Z')

describe('missed cards', () => {
	beforeEach(() => {
		storage.clear()
		vi.useFakeTimers()
		vi.setSystemTime(TODAY)
		setActivePinia(createPinia())
	})

	it('puts each season puzzle on the right day', () => {
		const { season } = currentSeason()!
		expect(seasonDay(season, season.startPuzzle).toISOString().slice(0, 10)).toBe(season.start)
		expect(seasonDay(season, season.startPuzzle + 13).toISOString().slice(0, 10)).toBe('2026-10-28')
	})

	it('lists missed cards oldest first, never one that comes round again, never today', () => {
		const cards = useCardsStore()
		const { label, season } = currentSeason()!
		const missed = cards.missedCards(label)
		expect(missed.length).toBeGreaterThan(0)
		expect(missed.map(m => m.id)).toEqual([...cards.missedIds(label)].sort((a, b) => lastDayOf(season, a) - lastDayOf(season, b) || a.localeCompare(b)))
		for (const m of missed) {
			expect(m.club).toBe(season.cards[m.id]!.club)
			expect(m.date.getTime()).toBeLessThan(TODAY.getTime() - 12 * 3600_000 + 1)
		}
		const puzzles = missed.map(m => m.puzzle)
		expect([...puzzles].sort((a, b) => a - b)).toEqual(puzzles)
	})

	it('unblocks the replay as soon as the Daily is finished, without a reload', () => {
		const replay = useReplayStore()
		expect(replay.blocker).toBe("Finish today's Daily to unlock a replay.")
		useCardsStore().saved.played['28/10/2026'] = true
		expect(replay.blocker).not.toBe("Finish today's Daily to unlock a replay.")
	})
})
