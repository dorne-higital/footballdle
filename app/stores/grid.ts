import { defineStore } from 'pinia'
import { track } from '../utils/appGlance'
import { usePlayStreakStore } from './playStreak'
import { computed, ref } from 'vue'
import { roster } from '../composables/useFootballers'
import weeksData from '../data/grid-weeks.json'
import practiceData from '../data/grid-practice.json'
import {
	MAX_WRONG, checkGuess, emptySquare, gridKey, gridPoints, hintAnswer, isLocked, mulberry32, pickPracticeGrid,
	readPracticeGrids, revealAnswer, shownSurname, squarePoints, weekIndex, weekStart,
	type GridDeal, type GridPlayer, type GuessResult, type PracticeFile, type SquareState,
} from '../utils/grid'

// The Grid: Grid Week (five grids every Saturday, the same for everyone) and unlimited
// practice grids. Saved on the device only. Nothing here runs on the server: load() is
// called from onMounted, so the website's prerendered page never deals or reads storage.

const SAVE_KEY = 'footballdle-grid'
const STATS_KEY = 'footballdle-grid-stats'
/** A grid counts as a win (for trophies) with at least this many squares solved */
export const GRID_WIN_SQUARES = 5
const RECENT_PRACTICE = 30

const players = roster as unknown as GridPlayer[] // players.json carries the Grid's fields too
const weeks = weeksData as { epoch: string; weeks: GridDeal[][] }
let practicePool: ReturnType<typeof readPracticeGrids> | null = null

export interface GridProgress {
	deal: GridDeal
	squares: SquareState[]
	done: boolean
	/** Stats already counted for this grid, so a reload can't count it twice */
	recorded: boolean
}

interface GridSave {
	v: 1
	weekIndex: number
	week: GridProgress[]
	practice: GridProgress | null
	recentPractice: string[]
}

export interface GridWeekResult {
	start: string
	points: number
	solved: number
}

export interface GridStats {
	/** Finished grids (weekly and practice): what trophies count as games played */
	gamesPlayed: number
	/** Finished grids with GRID_WIN_SQUARES or more solved */
	wins: number
	perfectGrids: number
	practicePlayed: number
	bestPracticePoints: number
	/** Past Grid Weeks with any squares played, newest last */
	weeks: GridWeekResult[]
}

export const emptyGridStats = (): GridStats => ({ gamesPlayed: 0, wins: 0, perfectGrids: 0, practicePlayed: 0, bestPracticePoints: 0, weeks: [] })

const newProgress = (deal: GridDeal): GridProgress => ({ deal, squares: Array.from({ length: 9 }, emptySquare), done: false, recorded: false })

function todayUK(): string {
	return new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/London' })
}

function readJSON<T>(key: string): T | null {
	try {
		const raw = localStorage.getItem(key)
		return raw ? (JSON.parse(raw) as T) : null
	} catch {
		return null
	}
}

function writeJSON(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value))
	} catch {}
}

const solvedCount = (g: GridProgress) => g.squares.filter(s => s.player).length
const isFinished = (g: GridProgress) => g.squares.every(s => s.player || isLocked(s))

export const useGridStore = defineStore('grid', () => {
	const ready = ref(false)
	const save = ref<GridSave | null>(null)
	const stats = ref<GridStats>(emptyGridStats())
	/** Which grid is open: 0-4 for this week's grids, 'practice', or null for the hub */
	const active = ref<number | 'practice' | null>(null)
	const selected = ref<number | null>(null)
	const lastResult = ref<{ result: GuessResult; name?: string; square: number } | null>(null)

	// ---------------------------------------------------------------- reading
	const thisWeek = computed(() => save.value?.week ?? [])
	const weekStartLabel = computed(() => (save.value ? weekStart(weeks.epoch, save.value.weekIndex) : ''))
	const nextDrop = computed(() => (save.value ? weekStart(weeks.epoch, save.value.weekIndex + 1) : ''))
	const weekPoints = computed(() => thisWeek.value.reduce((sum, g) => sum + gridPoints(g.squares), 0))
	const weekSolved = computed(() => thisWeek.value.reduce((sum, g) => sum + solvedCount(g), 0))
	const weekDone = computed(() => thisWeek.value.length > 0 && thisWeek.value.every(g => g.done))
	const bestWeek = computed(() => Math.max(0, weekPoints.value, ...stats.value.weeks.map(w => w.points)))
	/** False when the schedule has run out (an app build that hasn't been updated in two years) */
	const hasWeek = computed(() => thisWeek.value.length > 0)

	const current = computed<GridProgress | null>(() => {
		if (!save.value || active.value === null) return null
		return active.value === 'practice' ? save.value.practice : (save.value.week[active.value] ?? null)
	})
	const currentPoints = computed(() => (current.value ? gridPoints(current.value.squares) : 0))
	const usedNames = computed(() => current.value?.squares.map(s => s.player).filter((n): n is string => !!n) ?? [])

	/** A hint can be given for the selected square (and so is worth spending one on) */
	const canHintSelected = computed(() => {
		const g = current.value
		const i = selected.value
		if (!g || g.done || i === null) return false
		const s = g.squares[i]!
		if (s.player || s.hinted || isLocked(s)) return false
		return !!hintAnswer(players, g.deal, g.squares, i)
	})

	// ---------------------------------------------------------------- saving
	function persist() {
		if (save.value) writeJSON(SAVE_KEY, save.value)
		writeJSON(STATS_KEY, stats.value)
	}

	function record(g: GridProgress, practice: boolean) {
		if (g.recorded) return
		g.recorded = true
		const solved = solvedCount(g)
		const s = stats.value
		s.gamesPlayed++
		if (solved >= GRID_WIN_SQUARES) s.wins++
		if (gridPoints(g.squares) === 900) s.perfectGrids++
		if (practice) {
			s.practicePlayed++
			s.bestPracticePoints = Math.max(s.bestPracticePoints, gridPoints(g.squares))
		}
	}

	/** Reads the save and moves on to the current Grid Week. Client only. */
	function load() {
		stats.value = { ...emptyGridStats(), ...(readJSON<GridStats>(STATS_KEY) ?? {}) }
		const saved = readJSON<GridSave>(SAVE_KEY)
		const index = Math.max(0, weekIndex(weeks.epoch, todayUK()))
		let next: GridSave = saved?.v === 1 ? saved : { v: 1, weekIndex: -1, week: [], practice: null, recentPractice: [] }
		if (next.weekIndex !== index) {
			// A new week: the old one goes into the stats if any of it was played
			if (next.week.length) {
				const solved = next.week.reduce((sum, g) => sum + solvedCount(g), 0)
				const played = next.week.some(g => g.squares.some(s => s.player || s.wrong))
				next.week.filter(g => played && g.squares.some(s => s.player || s.wrong)).forEach(g => record(g, false))
				if (played) stats.value.weeks.push({ start: weekStart(weeks.epoch, next.weekIndex), points: next.week.reduce((sum, g) => sum + gridPoints(g.squares), 0), solved })
			}
			next = { ...next, weekIndex: index, week: (weeks.weeks[index] ?? []).map(newProgress) }
		}
		save.value = next
		ready.value = true
		persist()
	}

	// ---------------------------------------------------------------- playing
	function open(target: number | 'practice') {
		if (!save.value) return
		if (target === 'practice' && !save.value.practice) newPractice()
		active.value = target
		selected.value = null
		lastResult.value = null
	}

	function close() {
		active.value = null
		selected.value = null
		lastResult.value = null
	}

	function select(i: number | null) {
		selected.value = i
		lastResult.value = null
	}

	function finishIfComplete(g: GridProgress) {
		if (!g.done && isFinished(g)) finish()
	}

	/** Checks a guess for the selected square. Unknown names cost nothing. */
	function guess(name: string): GuessResult | null {
		const g = current.value
		const i = selected.value
		if (!g || g.done || i === null) return null
		const square = g.squares[i]!
		if (square.player || isLocked(square)) return null
		const { result, player } = checkGuess(players, g.deal, i, name, usedNames.value)
		lastResult.value = { result, name: player?.name, square: i }
		if (result === 'correct') {
			square.player = player!.name
			selected.value = null
		} else if (result === 'wrong' || result === 'repeat') {
			square.wrong = Math.min(MAX_WRONG, square.wrong + 1)
			if (isLocked(square)) selected.value = null
		}
		finishIfComplete(g)
		persist()
		return result
	}

	/** Gives a hint for the selected square (the caller has already spent one). */
	function hint(): boolean {
		const g = current.value
		const i = selected.value
		if (!g || i === null) return false
		const answer = hintAnswer(players, g.deal, g.squares, i)
		if (!answer) return false
		const square = g.squares[i]!
		square.hinted = true
		track('hint.used', { mode: 'grid' })
		square.hintLetter = shownSurname(answer.name).charAt(0).toUpperCase()
		try {
			// Remembered for the hint trophy, like the other modes
			localStorage.setItem('footballdle-hint-used', '1')
		} catch {}
		persist()
		return true
	}

	/** Ends the open grid: unsolved squares score 0 and show an answer */
	function finish() {
		const g = current.value
		if (!g || g.done) return
		g.done = true
		record(g, active.value === 'practice')
		// A grid has no win or loss: the points out of 900 say how it went
		track('game.finished', { mode: 'grid', kind: active.value === 'practice' ? 'practice' : 'weekly', score: String(gridPoints(g.squares)) })
		// Finishing any grid, weekly or practice, keeps the Matchday streak going (the week
		// rolling over records unfinished grids too, but that isn't playing today)
		usePlayStreakStore().markPlayed()
		selected.value = null
		persist()
	}

	function newPractice() {
		if (!save.value) return
		const old = save.value.practice
		if (old && !old.recorded && old.squares.some(s => s.player || s.wrong)) record(old, true)
		practicePool ??= readPracticeGrids(practiceData as PracticeFile)
		const deal = pickPracticeGrid(practicePool, mulberry32((Math.random() * 2 ** 32) >>> 0), save.value.recentPractice)
		save.value.practice = newProgress(deal)
		save.value.recentPractice = [...save.value.recentPractice, gridKey(deal)].slice(-RECENT_PRACTICE)
		selected.value = null
		lastResult.value = null
		persist()
	}

	/** One answer for each square the player didn't get, once the grid is finished */
	function answerFor(i: number): string | null {
		const g = current.value
		if (!g?.done || g.squares[i]!.player) return null
		return revealAnswer(players, g.deal, i, usedNames.value)
	}

	return {
		ready, save, stats, active, selected, lastResult,
		thisWeek, weekStartLabel, nextDrop, weekPoints, weekSolved, weekDone, bestWeek, hasWeek,
		current, currentPoints, usedNames, canHintSelected,
		load, open, close, select, guess, hint, finish, newPractice, answerFor,
		squarePoints, solvedCount,
	}
})
