import { ref } from 'vue'
import { getUKDateString } from '../utils/dateStreak'
import { getAnswerForDay, getAnswerPlayerForDay, type Footballer } from './useFootballers'
import { getScoutAnswerForDay } from './useAllFootballers'
import { SPOT_ROUNDS_PER_MATCH } from './useSpotFootballers'

export type TileState = 'correct' | 'present' | 'absent'

export interface ModeProgress {
	status: 'new' | 'playing' | 'won' | 'lost'
	/** 0–1, drives the activity ring */
	progress: number
	/** Short status line, e.g. "Guess 3 of 6" */
	label: string
}

const MAX_GUESSES = 6

function readSaved(key: string): any | null {
	try {
		const saved = JSON.parse(localStorage.getItem(key) || 'null')
		return saved && saved.date === getUKDateString() ? saved : null
	} catch {
		return null
	}
}

function guessProgress(saved: any, noun = 'guess'): ModeProgress {
	const count: number = saved?.guesses?.length ?? 0
	if (saved?.gameOver) {
		return saved.isWin
			? { status: 'won', progress: 1, label: `Solved in ${count}` }
			: { status: 'lost', progress: 1, label: 'Missed it today' }
	}
	if (count > 0) {
		return { status: 'playing', progress: count / MAX_GUESSES, label: `${noun} ${count + 1} of ${MAX_GUESSES}` }
	}
	return { status: 'new', progress: 0, label: 'Not played' }
}

// Feedback colours for a guess, matching the board's duplicate-letter rules
function scoreGuess(guess: string, answer: string): TileState[] {
	const result: TileState[] = Array(guess.length).fill('absent')
	const remaining = answer.toUpperCase().split('')
	const letters = guess.toUpperCase().split('')
	letters.forEach((ch, i) => {
		if (ch === remaining[i]) {
			result[i] = 'correct'
			remaining[i] = ''
		}
	})
	letters.forEach((ch, i) => {
		if (result[i] === 'correct') return
		const at = remaining.indexOf(ch)
		if (at !== -1) {
			result[i] = 'present'
			remaining[at] = ''
		}
	})
	return result
}

// Today's state of every mode, read straight from each game's saved progress so the
// home screen doesn't have to load (and start timers in) the game stores themselves.
export function useTodayProgress() {
	const daily = ref<ModeProgress>(guessProgress(null))
	const scout = ref<ModeProgress>(guessProgress(null))
	const spot = ref<ModeProgress>({ status: 'new', progress: 0, label: 'Not played' })
	const dailyLastGuess = ref<TileState[]>([])
	// Filled in once each game is finished, for the home screen's full-time cards
	const dailyGuesses = ref<string[]>([])
	const dailyAnswer = ref<Footballer | null>(null)
	const scoutAnswer = ref('')
	const spotResults = ref<boolean[]>([])

	function refresh() {
		const savedDaily = readSaved('footballdle-game')
		daily.value = guessProgress(savedDaily, 'Guess')
		const last = savedDaily?.guesses?.at(-1)
		dailyLastGuess.value = last ? scoreGuess(last, getAnswerForDay(getUKDateString()) || '') : []
		dailyGuesses.value = savedDaily?.guesses ?? []
		dailyAnswer.value = savedDaily?.gameOver ? (getAnswerPlayerForDay(getUKDateString()) ?? null) : null

		const savedScout = readSaved('footballdle-scout')
		scout.value = guessProgress(savedScout, 'Guess')
		scoutAnswer.value = savedScout?.gameOver ? getScoutAnswerForDay(getUKDateString()) : ''

		const savedSpot = readSaved('footballdle-spot')
		spotResults.value = savedSpot?.gameOver ? (savedSpot.roundResults ?? []).map((r: any) => !!r?.correct) : []
		if (savedSpot?.gameOver) {
			spot.value = { status: 'won', progress: 1, label: `Scored ${savedSpot.score ?? 0}` }
		} else if (savedSpot && (savedSpot.roundIndex ?? 0) > 0) {
			const round = savedSpot.roundIndex
			spot.value = {
				status: 'playing',
				progress: round / SPOT_ROUNDS_PER_MATCH,
				label: `Round ${round + 1} of ${SPOT_ROUNDS_PER_MATCH}`,
			}
		} else {
			spot.value = { status: 'new', progress: 0, label: 'Not played' }
		}
	}

	return { daily, scout, spot, dailyLastGuess, dailyGuesses, dailyAnswer, scoutAnswer, spotResults, refresh }
}
