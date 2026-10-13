import { describe, expect, it } from 'vitest'
import players from '../app/data/players.json'
import weeksFile from '../app/data/grid-weeks.json'
import {
	allFairGrids, checkFair, checkGuess, emptySquare, gridKey, gridPoints, hintAnswer, isLocked, mulberry32,
	pickPracticeGrid, pickWeek, revealAnswer, shownSurname, squareOf, squarePoints, weekIndex, weekStart,
	type GridDeal, type GridPlayer,
} from '../app/utils/grid'

const roster = players as GridPlayer[]
const grids = allFairGrids(roster)

describe('fair grids', () => {
	it('finds the expected number with current squads', () => {
		expect(grids.length).toBeGreaterThan(2000)
	})

	it('every listed grid passes the fairness check', () => {
		for (const g of grids.slice(0, 300)) expect(checkFair(roster, g).ok).toBe(true)
	})

	it('has at most one non-country row', () => {
		for (const g of grids) expect(g.rows.filter(r => !r.startsWith('nat:')).length).toBeLessThanOrEqual(1)
	})
})

describe('practice grids', () => {
	it('are the same for the same seed', () => {
		expect(pickPracticeGrid(grids, mulberry32(7))).toEqual(pickPracticeGrid(grids, mulberry32(7)))
	})

	it('cap England and vary a lot', () => {
		const rng = mulberry32(1)
		const recent: string[] = []
		let england = 0
		const seen = new Set<string>()
		for (let i = 0; i < 2000; i++) {
			const g = pickPracticeGrid(grids, rng, recent)
			expect(recent).not.toContain(gridKey(g))
			recent.push(gridKey(g))
			if (recent.length > 30) recent.shift()
			if (g.rows.includes('nat:England')) england++
			seen.add(gridKey(g))
		}
		expect(england / 2000).toBeLessThan(0.5)
		expect(seen.size).toBeGreaterThan(1000)
	})
})

describe('Grid Week', () => {
	const weeks = weeksFile.weeks as GridDeal[][]

	it('starts on a Saturday and counts weeks from it', () => {
		expect(new Date(Date.UTC(2026, 9, 10)).getUTCDay()).toBe(6)
		expect(weekIndex(weeksFile.epoch, '10/10/2026')).toBe(0)
		expect(weekIndex(weeksFile.epoch, '16/10/2026')).toBe(0)
		expect(weekIndex(weeksFile.epoch, '17/10/2026')).toBe(1)
		expect(weekStart(weeksFile.epoch, 1)).toBe('17/10/2026')
	})

	it('plans five fair grids a week, never repeating a grid', () => {
		const keys = new Set<string>()
		for (const week of weeks) {
			expect(week).toHaveLength(5)
			for (const g of week) {
				expect(checkFair(roster, g).ok).toBe(true)
				expect(keys.has(gridKey(g))).toBe(false)
				keys.add(gridKey(g))
			}
		}
	})

	it('pickWeek marks its grids as used', () => {
		const used = new Set<string>()
		const week = pickWeek(grids, mulberry32(3), used)
		expect(used.size).toBe(5)
		week.forEach(g => expect(used.has(gridKey(g))).toBe(true))
	})
})

describe('guesses and points', () => {
	const deal = weeksFile.weeks[0]![0] as GridDeal
	const { club, row } = squareOf(deal, 0)
	const right = roster.find(p => p.club === club && checkGuess(roster, deal, 0, p.name, []).result === 'correct')!

	it('checks guesses, accent-insensitively', () => {
		expect(checkGuess(roster, deal, 0, right.name.toUpperCase(), []).result).toBe('correct')
		expect(checkGuess(roster, deal, 0, 'martin odegaard', []).result).not.toBe('unknown')
		expect(checkGuess(roster, deal, 0, 'not a footballer', []).result).toBe('unknown')
		expect(checkGuess(roster, deal, 0, right.name, [right.name]).result).toBe('repeat')
		expect(club && row).toBeTruthy()
	})

	it('scores 100 first time, 25 less per miss, 50 less with a hint, 0 unsolved', () => {
		expect(squarePoints({ ...emptySquare(), player: 'x' })).toBe(100)
		expect(squarePoints({ ...emptySquare(), player: 'x', wrong: 2 })).toBe(50)
		expect(squarePoints({ ...emptySquare(), player: 'x', hinted: true })).toBe(50)
		expect(squarePoints({ ...emptySquare(), player: 'x', hinted: true, wrong: 3 })).toBe(0)
		expect(squarePoints({ ...emptySquare(), wrong: 1 })).toBe(0)
		expect(isLocked({ ...emptySquare(), wrong: 4 })).toBe(true)
		expect(gridPoints(Array.from({ length: 9 }, () => ({ ...emptySquare(), player: 'x' })))).toBe(900)
	})

	it('hints point at an answer that keeps the grid fillable', () => {
		const squares = Array.from({ length: 9 }, () => emptySquare())
		for (let i = 0; i < 9; i++) {
			const p = hintAnswer(roster, deal, squares, i)
			expect(p).not.toBeNull()
			expect(checkGuess(roster, deal, i, p!.name, []).result).toBe('correct')
		}
	})

	it('reveals an answer for an unsolved square, and the shown surname', () => {
		expect(revealAnswer(roster, deal, 0, [])).toBeTruthy()
		expect(shownSurname('virgil van dijk')).toBe('van dijk')
		expect(shownSurname('richarlison')).toBe('richarlison')
	})
})
