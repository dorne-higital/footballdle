import { describe, expect, it } from 'vitest'
import { SHARE_LINK, useShare } from '../app/composables/useShare'

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
				SHARE_LINK,
			].join('\n'),
		)
	})

	it('Scout Report shares a fourth square for price when there is one', () => {
		const text = useShare().getScoutShareText(
			[
				{ name: 'A', club: { value: 'x', state: 'present' }, nationality: { value: 'y', state: 'absent' }, position: { value: 'z', state: 'correct' }, price: { value: '£5.3m', state: 'present', arrow: 'down' } },
				{ name: 'B', club: { value: 'x', state: 'correct' }, nationality: { value: 'y', state: 'correct' }, position: { value: 'z', state: 'correct' } },
			],
			true,
			6,
			73,
		)
		expect(text.split('\n').slice(3, 5)).toEqual(['🟨⬛🟩🟨', '🟩🟩🟩'])
	})
})
