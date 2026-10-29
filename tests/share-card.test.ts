import { describe, expect, it } from 'vitest'
import { useShare } from '../app/composables/useShare'
import { parseShareText } from '../app/utils/shareCard'

// Share cards are drawn from the share text, so each text format must read back into the
// right card: game, score, streak and a spoiler-free board
const share = useShare()
const scoutRow = (club: string, nat: string, pos: string) => ({
	name: 'A',
	club: { value: 'x', state: club },
	nationality: { value: 'y', state: nat },
	position: { value: 'z', state: pos },
}) as never

describe('share cards', () => {
	it('Daily: tiles, score and streak, no letters', () => {
		const card = parseShareText(share.getShareText(['GNONTO', 'MINTEH'], 'MINTEH', true, '#212', 12))
		expect(card).toEqual({
			kind: 'result',
			number: '#212',
			streak: 12,
			highContrast: false,
			sections: [{ mode: 'daily', score: '2/6', rows: [['x', 'a', 'x', 'x', 'a', 'x'], ['g', 'g', 'g', 'g', 'g', 'g']] }],
		})
	})

	it('a lost Daily scores X and has no streak line', () => {
		const card = parseShareText(share.getShareText(['GNONTO'], 'MINTEH', false, '#212', 0))!
		expect(card.sections[0]!.score).toBe('X/6')
		expect(card.streak).toBeUndefined()
	})

	it('Scout Report and Spot the Baller', () => {
		const scout = parseShareText(share.getScoutShareText([scoutRow('absent', 'present', 'correct')], false, 6, 212, 3))!
		expect(scout.sections[0]).toEqual({ mode: 'scout', score: 'X/6', rows: [['x', 'a', 'g']] })
		const spot = parseShareText(share.getSpotShareText([{ correct: true }, { correct: false }], 1, 10, 212, 5, true))!
		expect(spot).toMatchObject({ number: '#212', streak: 5, sections: [{ mode: 'spot', score: '1/10', dots: [true, false] }] })
	})

	it('The Grid: a single grid and a whole week', () => {
		const single = parseShareText('Footballdle The Grid (practice)\n700/900\n\n🟩🟩⬛\n🟨🟩🟩\n🟩⬛🟩\n\nfootballdle.co.uk/app')!
		expect(single.sections[0]).toEqual({ mode: 'grid', score: '700', rows: [['g', 'g', 'x'], ['a', 'g', 'g'], ['g', 'x', 'g']], sub: 'Practice', note: 'of 900 points' })
		const week = parseShareText('Footballdle The Grid · week of 2 Nov\n1,500/4,500\n\n1 🟩🟩🟩🟩🟩🟩🟩🟩🟩 900\n2 🟩🟨⬛⬛🟩⬛⬛⬛🟩 600\n\nfootballdle.co.uk/app')!
		expect(week.sections[0]).toMatchObject({ score: '1,500', sub: 'Week of 2 Nov', note: 'of 4,500 points' })
		expect(week.sections[0]!.rows).toHaveLength(2)
		expect(week.sections[0]!.rows![1]).toHaveLength(9)
	})

	it('Matchday: every game on one story card', () => {
		const card = parseShareText(
			share.getMatchdayShareText({
				puzzle: 294,
				streak: 24,
				daily: { guesses: ['GNONTO', 'MINTEH'], answer: 'MINTEH', isWin: true },
				scout: { results: [scoutRow('absent', 'present', 'correct')], isWin: false, maxGuesses: 6 },
				spot: { results: [true, false], score: 1, rounds: 10 },
				gridPoints: 2350,
			}),
		)!
		expect(card.kind).toBe('matchday')
		expect(card.number).toBe('#294')
		expect(card.streak).toBe(24)
		expect(card.sections.map(s => [s.mode, s.score])).toEqual([
			['daily', '2/6'],
			['scout', 'X/6'],
			['spot', '1/10'],
			['grid', '2,350'],
		])
	})

	it('high-contrast shares are drawn in orange and blue', () => {
		expect(parseShareText('Footballdle ⚽ #212\n1/6\n\n🟧🟧🟧🟧🟧🟧\n\nfootballdle.co.uk/app')).toMatchObject({ highContrast: true, sections: [{ rows: [['g', 'g', 'g', 'g', 'g', 'g']] }] })
	})

	it('anything else is shared as text only', () => {
		expect(parseShareText('Did you know? Some football fact.\n\nfootballdle.co.uk/app')).toBeNull()
	})
})
