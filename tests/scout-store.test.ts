import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useScoutReportStore } from '../app/stores/scoutReport'
import { comparePrice, priceOf, regionOf, scoutBrief } from '../app/utils/scoutClues'
import { answerSchedule, fromSnapshot, getPositionGroup, roster } from '../app/composables/useFootballers'

const storage = new Map<string, string>()
globalThis.localStorage = {
	getItem: (k: string) => storage.get(k) ?? null,
	setItem: (k: string, v: string) => void storage.set(k, v),
	removeItem: (k: string) => void storage.delete(k),
	clear: () => storage.clear(),
	key: () => null,
	length: 0,
} as Storage

// A day from the frozen schedule (the answer and brief can't change when squads do), with
// the expectations worked out from that day's answer, so the weekly player update can't
// break this test. Picked: a target with a priced rival at another club in the same region
// who plays in the same line, so one guess exercises club, position and price together.
const { start, answers, briefs = [] } = answerSchedule.scout
const pick = (() => {
	for (let i = answers.length - 60; i < answers.length; i++) {
		const answer = fromSnapshot(answers[i]!)
		const region = regionOf(answer.club)
		const answerPrice = priceOf(answer.name)
		if (!region || !briefs[i] || answerPrice === null) continue
		const rival = roster.find(p =>
			p.known && p.club !== answer.club && regionOf(p.club) === region
			&& getPositionGroup(p.position) === getPositionGroup(answer.position)
			&& p.nationality !== answer.nationality
			&& priceOf(p.name) !== null && priceOf(p.name) !== answerPrice)
		if (rival) return { puzzle: start + i, answer, rival, answerPrice, brief: scoutBrief(answer, briefs[i]) }
	}
	throw new Error('No suitable Scout day in the schedule')
})()
const dayOf = (puzzle: number) => new Date(Date.UTC(2026, 0, puzzle, 12))

describe('Scout Report store (1.3 rules)', () => {
	beforeEach(() => {
		storage.clear()
		vi.useFakeTimers()
		vi.setSystemTime(dayOf(pick.puzzle))
		setActivePinia(createPinia())
	})

	it('starts with the frozen brief, which fills the dossier', () => {
		const scout = useScoutReportStore()
		expect(scout.answer.toLowerCase()).toBe(pick.answer.name.toLowerCase())
		expect(scout.brief).toEqual(pick.brief)
		const facts = pick.brief!.facts
		expect(scout.dossier.club.region).toBe(facts.includes('region') ? regionOf(pick.answer.club) : undefined)
		expect(!!scout.dossier.nation.continent).toBe(facts.includes('continent'))
		expect(scout.dossier.position.found).toBe(facts.includes('position') ? getPositionGroup(pick.answer.position) : undefined)
	})

	it('a rival in the same region and line, with a price arrow', () => {
		const scout = useScoutReportStore()
		scout.submitGuess(pick.rival.name)
		const [row] = scout.guessResults
		expect(row!.club.state).toBe('present')
		expect(row!.position.state).toBe('correct')
		const guessPrice = priceOf(pick.rival.name)!
		const { arrow } = comparePrice(guessPrice, pick.answerPrice)
		expect(row!.price?.arrow).toBe(arrow)
		expect(scout.dossier.club.ruledOut).toEqual([pick.rival.club])
		expect(scout.dossier.nation.ruledOut).toEqual([pick.rival.nationality])
		expect(scout.dossier.position.found).toBe(getPositionGroup(pick.answer.position))
		const price = scout.dossier.price!
		if (arrow === 'down') expect(price.max).toBe(guessPrice - 1)
		else expect(price.min).toBe(guessPrice + 1)
	})

	it('hints skip what the brief already said', () => {
		const scout = useScoutReportStore()
		for (let i = 0; i < 5; i++) scout.unlockHint()
		const labels = scout.hints.map(h => h.label)
		if (pick.brief!.facts.includes('continent')) expect(labels).not.toContain('Continent')
		if (pick.brief!.facts.includes('position')) expect(labels).not.toContain('Position')
		expect(scout.canPurchaseHint).toBe(false)
	})
})
