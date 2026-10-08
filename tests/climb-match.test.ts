import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { generateMatch, TIERS, type ClimbPlayer } from '../app/utils/climb/questions'
import {
	answer,
	courseFor,
	currentQuestion,
	isFinished,
	QUESTIONS_PER_MATCH,
	resultFor,
	scorelineFor,
	startMatch,
	summarise,
	targetsFor,
	timeUp,
	useVar,
	varHides,
} from '../app/utils/climb/match'

const players: ClimbPlayer[] = JSON.parse(readFileSync(new URL('../app/data/players.json', import.meta.url), 'utf8'))

describe('targetsFor', () => {
	it('is 8 to win in the first two leagues and 9 from League One', () => {
		expect(targetsFor(0, 'mid')).toEqual({ win: 8, draw: 6 })
		expect(targetsFor(1, 'mid')).toEqual({ win: 8, draw: 6 })
		expect(targetsFor(2, 'mid')).toEqual({ win: 9, draw: 7 })
		expect(targetsFor(5, 'mid')).toEqual({ win: 9, draw: 7 })
	})
	it('needs one more against a top-two side and one fewer against the bottom side', () => {
		expect(targetsFor(1, 'top')).toEqual({ win: 9, draw: 7 })
		expect(targetsFor(1, 'bottom')).toEqual({ win: 7, draw: 5 })
		expect(targetsFor(3, 'top')).toEqual({ win: 10, draw: 8 })
		expect(targetsFor(3, 'bottom')).toEqual({ win: 8, draw: 6 })
	})
})

describe('resultFor', () => {
	it('splits on the targets', () => {
		const t = targetsFor(2, 'mid')
		expect(resultFor(10, t)).toBe('W')
		expect(resultFor(9, t)).toBe('W')
		expect(resultFor(8, t)).toBe('D')
		expect(resultFor(7, t)).toBe('D')
		expect(resultFor(6, t)).toBe('L')
	})
})

describe('courseFor', () => {
	const t = targetsFor(1, 'top') // win 9, draw 7
	it('counts the mistakes you can still afford', () => {
		expect(courseFor(6, 6, t)).toMatchObject({ best: 'W', spare: 1, message: 'On for a win, one mistake to spare' })
		expect(courseFor(6, 5, t)).toMatchObject({ best: 'W', spare: 0, message: 'On for a win, no mistakes allowed' })
	})
	it('drops to a draw, then a loss, as answers go wrong', () => {
		expect(courseFor(6, 4, t).best).toBe('D')
		expect(courseFor(8, 4, t).best).toBe('L')
	})
	it('says when the win is already won', () => {
		expect(courseFor(9, 9, t)).toMatchObject({ best: 'W', message: 'The win is yours, keep going for goals' })
	})
})

describe('scorelineFor', () => {
	it('always agrees with the result, and a perfect match keeps a clean sheet', () => {
		for (let tier = 0; tier < 6; tier++) {
			for (const opp of ['top', 'mid', 'bottom'] as const) {
				const t = targetsFor(tier, opp)
				for (let correct = 0; correct <= QUESTIONS_PER_MATCH; correct++) {
					for (let seed = 0; seed < 50; seed++) {
						const [f, a] = scorelineFor(correct, t, seed % 2 ? 0.8 : 0.2, seed)
						const r = resultFor(correct, t)
						if (r === 'W') expect(f).toBeGreaterThan(a)
						if (r === 'D') expect(f).toBe(a)
						if (r === 'L') expect(f).toBeLessThan(a)
						if (correct === QUESTIONS_PER_MATCH) expect(a).toBe(0)
						expect(f).toBeLessThanOrEqual(6)
						expect(a).toBeLessThanOrEqual(6)
					}
				}
			}
		}
	})
})

describe('varHides', () => {
	it('leaves a 50/50 on 4 and 5 cards, and 2 to find among 4 on 6 cards', () => {
		for (const rules of TIERS) {
			for (const q of generateMatch(players, rules.tier, 9)) {
				const hidden = varHides(q, 3)
				for (const i of q.odd) expect(hidden).not.toContain(i)
				expect(q.cards.length - hidden.length).toBe(q.odd.length === 2 ? 4 : 2)
			}
		}
	})
})

describe('a match', () => {
	it('plays through 10 questions and summarises', () => {
		const questions = generateMatch(players, 1, 5)
		let m = startMatch(1, 'mid', questions, 5)
		for (let i = 0; i < QUESTIONS_PER_MATCH; i++) {
			const q = currentQuestion(m)!
			m = i < 8 ? answer(m, q.odd, 0.6) : timeUp(m)
		}
		expect(isFinished(m)).toBe(true)
		const s = summarise(m)
		expect(s.correct).toBe(8)
		expect(s.result).toBe('W')
		expect(s.score[0]).toBeGreaterThan(s.score[1])
	})

	it('marks a wrong pick and needs both odd ones in the Champions League', () => {
		const questions = generateMatch(players, 5, 11)
		let m = startMatch(5, 'mid', questions, 11)
		const q = currentQuestion(m)!
		m = answer(m, [q.odd[0]!], 0.5)
		expect(m.answers[0]!.correct).toBe(false)
		const q2 = currentQuestion(m)!
		m = answer(m, [...q2.odd].reverse(), 0.5)
		expect(m.answers[1]!.correct).toBe(true)
	})

	it('allows VAR once a match', () => {
		let m = startMatch(0, 'mid', generateMatch(players, 0, 2), 2)
		m = useVar(m)
		expect(m.varOn).toBe(0)
		expect(m.varHidden).toHaveLength(2)
		m = answer(m, currentQuestion(m)!.odd, 1)
		expect(m.varHidden).toEqual([])
		expect(useVar(m)).toBe(m)
	})
})
