import { describe, expect, it } from 'vitest'
import seasons from '../app/data/cards.json'
import { SAMPLE_CARD, clubStyle } from '../app/utils/clubs'

// The Cards tab's sample card must never be (or hint at) a real one
const all = Object.values((seasons as { seasons: Record<string, any> }).seasons)

describe('sample Player Card', () => {
	it('is no real player or club', () => {
		for (const season of all) {
			const cards = Object.values(season.cards) as { name: string; surname: string }[]
			expect(cards.some(c => c.surname.toLowerCase() === SAMPLE_CARD.surname || c.name === SAMPLE_CARD.name)).toBe(false)
			expect(Object.keys(season.clubs)).not.toContain(SAMPLE_CARD.club)
		}
	})

	it('has its own club band and fits the card', () => {
		expect(clubStyle(SAMPLE_CARD.club).code).toBe('FDL')
		expect(SAMPLE_CARD.surname.length).toBeLessThanOrEqual(6)
	})

	it("keeps 'up to 4 hints' true for set rewards", () => {
		for (const season of all) {
			const hints = Object.values(season.clubs).map((c: any) => c.hints)
			expect(Math.max(...hints)).toBeLessThanOrEqual(4)
		}
	})
})
