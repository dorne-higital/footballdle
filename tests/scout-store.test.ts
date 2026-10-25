import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useScoutReportStore } from '../app/stores/scoutReport'
import { priceOf } from '../app/utils/scoutClues'

const storage = new Map<string, string>()
globalThis.localStorage = {
	getItem: (k: string) => storage.get(k) ?? null,
	setItem: (k: string, v: string) => void storage.set(k, v),
	removeItem: (k: string) => void storage.delete(k),
	clear: () => storage.clear(),
	key: () => null,
	length: 0,
} as Storage

// A past puzzle: 14 March 2026, the answer was Kevin Danso (Sunderland, Austria, defender)
describe('Scout Report store (1.3 rules)', () => {
	beforeEach(() => {
		storage.clear()
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-03-14T12:00:00Z'))
		setActivePinia(createPinia())
	})

	it('starts with a brief that fills the dossier', () => {
		const scout = useScoutReportStore()
		expect(scout.answer.toLowerCase()).toBe('kevin danso')
		expect(scout.brief?.facts.sort()).toEqual(['continent', 'region'])
		expect(scout.dossier.club.region).toBe('north-east')
		expect(scout.dossier.nation.continent).toBe('Europe')
		expect(scout.dossier.position.found).toBeUndefined()
	})

	it('a North East club, a defender and a price arrow', () => {
		const scout = useScoutReportStore()
		scout.submitGuess('Lewis Hall')
		const [row] = scout.guessResults
		expect(row!.club.state).toBe('present') // Newcastle: same region as Sunderland
		expect(row!.position.state).toBe('correct')
		const hall = priceOf('lewis hall')!
		expect(row!.price?.arrow).toBe(hall > 50 ? 'down' : 'up')
		expect(scout.dossier.club.ruledOut).toEqual(['Newcastle'])
		expect(scout.dossier.nation.ruledOut).toEqual(['England'])
		expect(scout.dossier.position.found).toBe('Defender')
		const price = scout.dossier.price!
		expect(hall > 50 ? price.max : price.min).toBe(hall > 50 ? hall - 1 : hall + 1)
	})

	it('hints skip what the brief already said', () => {
		const scout = useScoutReportStore()
		for (let i = 0; i < 5; i++) scout.unlockHint()
		expect(scout.hints.map(h => h.label)).not.toContain('Continent')
		expect(scout.canPurchaseHint).toBe(false)
	})
})
