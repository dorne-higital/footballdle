import { describe, expect, it } from 'vitest'
import { answerSchedule, fromSnapshot } from '../app/composables/useFootballers'
import { scoutBrief } from '../app/utils/scoutClues'

describe('frozen Scout briefs', () => {
	const { answers, briefs = [] } = answerSchedule.scout

	it('has a brief code for every upcoming day, lined up with the answers', () => {
		expect(briefs.length).toBe(answers.length)
		expect(briefs.slice(-30).every(code => ['rc', 'rp', 'cp'].includes(code))).toBe(true)
	})

	it('a frozen brief reads the same as the one worked out from the same player list', () => {
		const last = answers.length - 1
		for (let i = last - 20; i <= last; i++) {
			const answer = fromSnapshot(answers[i]!)
			expect(scoutBrief(answer, briefs[i])).toEqual(scoutBrief(answer))
		}
	})

	it('ignores a broken code and works the brief out instead', () => {
		const answer = fromSnapshot(answers[answers.length - 1]!)
		expect(scoutBrief(answer, 'zz')).toEqual(scoutBrief(answer))
	})
})
