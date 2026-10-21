import { describe, expect, it } from 'vitest'
import { useShare } from '../app/composables/useShare'

describe('Share Matchday', () => {
	it('puts every game in one message', () => {
		const text = useShare().getMatchdayShareText({
			puzzle: 294,
			streak: 24,
			daily: { guesses: ['GNONTO', 'MINTEH'], answer: 'MINTEH', isWin: true },
			scout: {
				results: [{ name: 'A', club: { value: 'x', state: 'absent' }, nationality: { value: 'y', state: 'present' }, position: { value: 'z', state: 'correct' } }],
				isWin: false,
				maxGuesses: 6,
			},
			spot: { results: [true, false], score: 1, rounds: 10 },
			gridPoints: 2350,
		})
		expect(text).toBe(
			[
				'Footballdle Matchday #294 🔥 24 day streak',
				'',
				'⚽ Daily 2/6',
				'⬛🟨⬛⬛🟨⬛',
				'🟩🟩🟩🟩🟩🟩',
				'',
				'🔎 Scout Report X/6',
				'⬛🟨🟩',
				'',
				'👀 Spot the Baller 1/10',
				'🟢🔴',
				'',
				'🧩 Grid Week 2,350 / 4,500',
				'',
				'footballdle.co.uk',
			].join('\n'),
		)
	})
})
