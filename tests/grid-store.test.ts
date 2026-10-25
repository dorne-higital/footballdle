import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import players from '../app/data/players.json'
import { checkGuess, squareOf, type GridPlayer } from '../app/utils/grid'
import { useGridStore } from '../app/stores/grid'
import { usePlayStreakStore } from '../app/stores/playStreak'
import { getUKDateString } from '../app/utils/dateStreak'

// A fake localStorage the store can use, kept between "reloads"
const storage = new Map<string, string>()
globalThis.localStorage = {
	getItem: (k: string) => storage.get(k) ?? null,
	setItem: (k: string, v: string) => void storage.set(k, v),
	removeItem: (k: string) => void storage.delete(k),
	clear: () => storage.clear(),
	key: () => null,
	length: 0,
} as Storage

const roster = players as GridPlayer[]

function reload() {
	setActivePinia(createPinia())
	const grid = useGridStore()
	grid.load()
	return grid
}

function answerFor(grid: ReturnType<typeof useGridStore>, square: number, wrong = false) {
	const deal = grid.current!.deal
	return roster.find(p => (checkGuess(roster, deal, square, p.name, grid.usedNames).result === 'correct') !== wrong)!.name
}

describe('grid store', () => {
	beforeEach(() => {
		storage.clear()
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-10-13T12:00:00Z'))
	})

	it('deals this week\'s five grids', () => {
		const grid = reload()
		expect(grid.thisWeek).toHaveLength(5)
		expect(grid.weekStartLabel).toBe('10/10/2026')
		expect(grid.nextDrop).toBe('17/10/2026')
	})

	it('scores guesses and survives a reload', () => {
		let grid = reload()
		grid.open(0)
		grid.select(0)
		expect(grid.guess(answerFor(grid, 0))).toBe('correct')
		grid.select(1)
		expect(grid.guess(answerFor(grid, 1, true))).toMatch(/wrong|repeat/)
		expect(grid.guess('not a footballer at all')).toBe('unknown')
		expect(grid.guess(answerFor(grid, 1))).toBe('correct')
		expect(grid.currentPoints).toBe(175)

		grid = reload()
		grid.open(0)
		expect(grid.currentPoints).toBe(175)
		expect(grid.weekPoints).toBe(175)
	})

	it('locks a square after four misses', () => {
		const grid = reload()
		grid.open(1)
		grid.select(4)
		for (let k = 0; k < 4; k++) {
			grid.select(4)
			grid.guess(answerFor(grid, 4, true))
		}
		expect(grid.current!.squares[4]!.wrong).toBe(4)
		grid.select(4)
		expect(grid.guess(answerFor(grid, 4))).toBeNull()
	})

	it('finishing records stats once and reveals answers', () => {
		let grid = reload()
		grid.open(2)
		grid.finish()
		expect(grid.current!.done).toBe(true)
		expect(grid.answerFor(0)).toBeTruthy()
		expect(grid.stats.gamesPlayed).toBe(1)
		grid = reload()
		grid.open(2)
		grid.finish()
		expect(grid.stats.gamesPlayed).toBe(1)
	})

	it('finishing a grid keeps the Matchday streak going', () => {
		const grid = reload()
		const playStreak = usePlayStreakStore()
		expect(playStreak.lastDate).toBe('')
		grid.open('practice')
		grid.finish()
		expect(playStreak.lastDate).toBe(getUKDateString())
		expect(playStreak.current).toBe(1)
	})

	it('moves on to the next week and keeps the old score', () => {
		let grid = reload()
		grid.open(0)
		grid.select(0)
		grid.guess(answerFor(grid, 0))
		vi.setSystemTime(new Date('2026-10-17T09:00:00Z'))
		grid = reload()
		expect(grid.weekStartLabel).toBe('17/10/2026')
		expect(grid.weekPoints).toBe(0)
		expect(grid.stats.weeks).toEqual([{ start: '10/10/2026', points: 100, solved: 1 }])
		expect(grid.bestWeek).toBe(100)
	})

	it('hints give a letter and practice deals fresh grids', () => {
		const grid = reload()
		grid.open('practice')
		const first = grid.current!.deal
		grid.select(3)
		expect(grid.canHintSelected).toBe(true)
		expect(grid.hint()).toBe(true)
		expect(grid.current!.squares[3]!.hintLetter).toMatch(/^[A-Z]$/)
		grid.select(3)
		grid.guess(answerFor(grid, 3))
		expect(grid.currentPoints).toBe(50)
		grid.newPractice()
		expect(grid.current!.deal).not.toEqual(first)
		expect(squareOf(grid.current!.deal, 0).club).toBeTruthy()
	})
})
