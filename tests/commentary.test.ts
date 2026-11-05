import { describe, expect, it } from 'vitest'
import { commentaryText, matchdayCommentary } from '../app/utils/commentary'
import { parseShareText } from '../app/utils/shareCard'
import { useShare } from '../app/composables/useShare'

const day = (d: [boolean, number], s: [boolean, number], spot: number) =>
	commentaryText(matchdayCommentary({ daily: { isWin: d[0], guesses: d[1] }, scout: { isWin: s[0], guesses: s[1], maxGuesses: 6 }, spot: { score: spot, rounds: 10 } }))

// Matchday commentary: one line from the scores, never the answers
describe('Matchday commentary', () => {
	it('picks a verdict for each kind of day', () => {
		expect(day([true, 3], [true, 2], 10)).toBe('Flawless: all three won and a perfect Spot')
		expect(day([true, 2], [false, 6], 10)).toBe('Clinical: 2/6 in the Daily and a perfect Spot')
		expect(day([true, 4], [true, 3], 6)).toBe('Full points: the Daily in 4, the Scout Report in 3 and 6/10 in Spot')
		expect(day([false, 6], [false, 6], 9)).toBe('Rescued: 9/10 in Spot after the Daily and the Scout Report got away')
		expect(day([true, 6], [false, 6], 5)).toBe('Last gasp: the Daily won with the final guess, plus 5/10 in Spot')
		expect(day([false, 6], [true, 4], 5)).toBe('Bounced back: the Daily got away, but the Scout Report fell in 4')
	})

	it('heads the Matchday share card with the verdict', () => {
		const text = useShare().getMatchdayShareText({
			puzzle: 30,
			streak: 3,
			daily: { guesses: ['MINTEH'], answer: 'MINTEH', isWin: true },
			scout: { results: [], isWin: false, maxGuesses: 6 },
			spot: { results: [true], score: 10, rounds: 10 },
		})
		expect(parseShareText(text)).toMatchObject({ kind: 'matchday', verdict: 'Clinical' })
	})
})
