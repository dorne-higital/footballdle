import { defineStore } from 'pinia'
import { readSavedObject } from '../utils/storage'
import { ref, computed } from 'vue'
import { useHaptics } from '../composables/useHaptics'
import { getDisplayNumber, getPositionGroup, getPuzzleNumber } from '../composables/useFootballers'
import {
	getScoutAnswerForDay,
	getScoutAnswerPlayerForDay,
	isValidFullFootballer,
	getFullPlayerData,
	searchFullFootballers,
} from '../composables/useAllFootballers'
import { getConfederation, type Confederation } from '../composables/useConfederations'
import { getUKDateString } from '../utils/dateStreak'

export type AttributeState = 'correct' | 'present' | 'absent'

export interface ScoutHint {
	label: string
	value: string
	icon: string
}

type ScoutClue = 'continent' | 'nation' | 'position' | 'first' | 'surname'
const SCOUT_CLUES: ScoutClue[] = ['continent', 'nation', 'position', 'first', 'surname']
// Named for the "Revealing the …" line while a hint can still be undone
const CLUE_NAMES: Record<ScoutClue, string> = {
	continent: 'continent',
	nation: "nation's first letter",
	position: 'position',
	first: "first name's first letter",
	surname: "surname's first letter",
}
const CONTINENTS: Record<Confederation, string> = {
	UEFA: 'Europe',
	CONMEBOL: 'South America',
	CONCACAF: 'North America',
	CAF: 'Africa',
	AFC: 'Asia',
	OFC: 'Oceania',
}
const MAX_HINTS = 5

// Same order for everyone on a given day, but a different order each day
function clueOrder(puzzle: number): ScoutClue[] {
	const result = [...SCOUT_CLUES]
	let s = (puzzle * 2654435761) >>> 0
	for (let i = result.length - 1; i > 0; i--) {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0
		const j = s % (i + 1)
		;[result[i], result[j]] = [result[j]!, result[i]!]
	}
	return result
}

export interface AttributeChip {
	value: string
	state: AttributeState
}

export interface ScoutGuessResult {
	name: string
	club: AttributeChip
	nationality: AttributeChip
	position: AttributeChip
}

export const useScoutReportStore = defineStore('scoutReport', () => {
	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const todayStr = getUKDateString() || ''
	const answer = getScoutAnswerForDay(todayStr) || ''
	// The public number (#1 from the restart), for display and sharing only
	const puzzleNumber = getDisplayNumber(todayStr)

	const guesses = ref<string[]>([])
	const maxGuesses = 6
	const gameOver = ref(false)
	const isWin = ref(false)
	const showGameOverModal = ref(false)
	const showIntro = ref(true)
	const errorMessage = ref('')
	const purchasedHints = ref(0)
	const haptics = useHaptics()
	let errorTimer: ReturnType<typeof setTimeout> | null = null

	function setError(msg: string) {
		errorMessage.value = msg
		haptics.error()
		if (errorTimer) clearTimeout(errorTimer)
		errorTimer = setTimeout(() => {
			errorMessage.value = ''
		}, 1800)
	}

	// Countdown state — same "next puzzle at UK midnight" pattern as Daily.
	const countdown = ref('')
	let countdownInterval: any

	function getNextGameTime() {
		const now = new Date()
		const ukNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }))
		ukNow.setHours(0, 0, 0, 0)
		ukNow.setDate(ukNow.getDate() + 1)
		return ukNow
	}
	const nextGameTime = getNextGameTime()

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const canPlay = computed(() => {
		if (!import.meta.client) return true
		const saved = readSavedObject('footballdle-scout')
		if (saved?.date === todayStr) return !saved.gameOver
		return true
	})

	function compareAttribute(guessValue: string, answerValue: string, sameGroup: boolean): AttributeState {
		if (guessValue === answerValue) return 'correct'
		if (sameGroup) return 'present'
		return 'absent'
	}

	// One row per guess, with each attribute compared against the answer.
	const guessResults = computed<ScoutGuessResult[]>(() => {
		// The answer as frozen on the day (it may have moved club since)
		const answerPlayer = getScoutAnswerPlayerForDay(todayStr)
		if (!answerPlayer) return []
		const isAnswer = (name: string) => getFullPlayerData(name)?.name === getFullPlayerData(answer)?.name

		return guesses.value.map((name) => {
			const player = isAnswer(name) ? answerPlayer : getFullPlayerData(name)
			if (!player) {
				return {
					name,
					club: { value: '?', state: 'absent' as const },
					nationality: { value: '?', state: 'absent' as const },
					position: { value: '?', state: 'absent' as const },
				}
			}

			const sameConfederation =
				player.nationality !== answerPlayer.nationality &&
				getConfederation(player.nationality) !== null &&
				getConfederation(player.nationality) === getConfederation(answerPlayer.nationality)

			const samePositionGroup =
				player.position !== answerPlayer.position &&
				getPositionGroup(player.position) === getPositionGroup(answerPlayer.position)

			return {
				name: player.name,
				club: {
					value: player.club,
					state: compareAttribute(player.club, answerPlayer.club, false),
				},
				nationality: {
					value: player.nationality,
					state: compareAttribute(player.nationality, answerPlayer.nationality, sameConfederation),
				},
				position: {
					value: player.position,
					state: compareAttribute(player.position, answerPlayer.position, samePositionGroup),
				},
			}
		})
	})

	// ============================================================================
	// GAME LOGIC
	// ============================================================================
	function submitGuess(name: string) {
		if (gameOver.value) return
		const trimmed = name.trim()
		if (!trimmed) return
		if (!isValidFullFootballer(trimmed)) {
			setError("Not in this season's Premier League squads")
			return
		}
		if (guesses.value.some((g) => g.toUpperCase() === trimmed.toUpperCase())) {
			setError('Already guessed!')
			return
		}
		guesses.value.push(trimmed)

		if (trimmed.toUpperCase() === answer.toUpperCase()) {
			isWin.value = true
			gameOver.value = true
			showGameOverModal.value = true
		} else if (guesses.value.length >= maxGuesses) {
			isWin.value = false
			gameOver.value = true
			showGameOverModal.value = true
		}
		// Full time has its own buzz (native-app plugin), so only mid-game guesses tap
		if (!gameOver.value) haptics.tap()
		saveState()
	}

	function startGame() {
		showIntro.value = false
	}

	function closeGameOverModal() {
		showGameOverModal.value = false
	}

	// ============================================================================
	// COUNTDOWN
	// ============================================================================
	function updateCountdown() {
		if (!nextGameTime) return
		const now = new Date()
		const diff = nextGameTime.getTime() - now.getTime()
		if (diff <= 0) {
			countdown.value = '00:00:00'
			return
		}
		const hours = Math.floor(diff / 1000 / 60 / 60)
		const minutes = Math.floor((diff / 1000 / 60) % 60)
		const seconds = Math.floor((diff / 1000) % 60)
		countdown.value = `${hours.toString().padStart(2, '0')}:${minutes
			.toString()
			.padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	}

	function startCountdown() {
		updateCountdown()
		countdownInterval = setInterval(updateCountdown, 1000)
		document.addEventListener('visibilitychange', onVisibilityChange)
	}

	function stopCountdown() {
		if (countdownInterval) clearInterval(countdownInterval)
		document.removeEventListener('visibilitychange', onVisibilityChange)
	}

	function onVisibilityChange() {
		if (document.hidden) {
			if (countdownInterval) clearInterval(countdownInterval)
		} else {
			updateCountdown()
			countdownInterval = setInterval(updateCountdown, 1000)
		}
	}

	// ============================================================================
	// LOCAL STORAGE
	// ============================================================================
	function saveState() {
		const state = {
			date: todayStr,
			guesses: guesses.value,
			gameOver: gameOver.value,
			isWin: isWin.value,
			purchasedHints: purchasedHints.value,
		}
		localStorage.setItem('footballdle-scout', JSON.stringify(state))
	}

	function loadState() {
		const saved = readSavedObject('footballdle-scout')
		if (saved) {
			const { date, guesses: savedGuesses, gameOver: savedOver, isWin: savedWin, purchasedHints: savedHints } = saved
			if (date === todayStr) {
				guesses.value = Array.isArray(savedGuesses) ? savedGuesses : []
				gameOver.value = !!savedOver
				isWin.value = !!savedWin
				purchasedHints.value = Math.min(MAX_HINTS, Number(savedHints) || 0)
				showGameOverModal.value = false
				showIntro.value = savedOver
			}
		}
	}

	function resetGame() {
		guesses.value = []
		gameOver.value = false
		isWin.value = false
		purchasedHints.value = 0
		showGameOverModal.value = false
		showIntro.value = true
		saveState()
	}

	// ============================================================================
	// HINTS (iOS app; same bank as the Daily)
	// ============================================================================
	const order = clueOrder(getPuzzleNumber(todayStr))

	function clueFor(kind: ScoutClue, player: { name: string; nationality: string; position: string }): ScoutHint {
		const parts = player.name.trim().split(/\s+/)
		const initial = (word = '') => `${word.charAt(0).toUpperCase()}…`
		switch (kind) {
			case 'continent': {
				const confederation = getConfederation(player.nationality)
				return { label: 'Continent', value: confederation ? CONTINENTS[confederation] : 'Unknown', icon: 'solar:earth-linear' }
			}
			case 'nation':
				return { label: 'Nation starts with', value: initial(player.nationality), icon: 'solar:flag-linear' }
			case 'position':
				return { label: 'Position', value: player.position, icon: 'solar:football-linear' }
			case 'first':
				// One-name players (e.g. a Brazilian known by a single name) get the length instead
				return parts.length > 1
					? { label: 'First name starts with', value: initial(parts[0]), icon: 'solar:user-linear' }
					: { label: 'Name length', value: `${parts[0]!.length} letters`, icon: 'solar:user-linear' }
			case 'surname':
				return { label: 'Surname starts with', value: initial(parts[parts.length - 1]), icon: 'solar:text-square-linear' }
		}
	}

	const hints = computed<ScoutHint[]>(() => {
		const player = getScoutAnswerPlayerForDay(todayStr)
		if (!player) return []
		return order.slice(0, purchasedHints.value).map(kind => clueFor(kind, player))
	})

	const canPurchaseHint = computed(() => !gameOver.value && purchasedHints.value < MAX_HINTS)
	const nextClueName = computed(() => CLUE_NAMES[order[purchasedHints.value]!] ?? 'next clue')

	function unlockHint() {
		if (!canPurchaseHint.value) return
		purchasedHints.value++
		haptics.tap()
		saveState()
		// Remembered for the "Tactical Review" Game Center achievement
		localStorage.setItem('footballdle-hint-used', '1')
	}

	// Player-name suggestions for the autocomplete input, filtered by query,
	// excluding names already guessed this round.
	function searchPlayers(query: string, limit = 8) {
		return searchFullFootballers(query, guesses.value, limit)
	}

	return {
		// State
		guesses,
		maxGuesses,
		gameOver,
		isWin,
		showGameOverModal,
		showIntro,
		countdown,
		answer,
		todayStr,
		puzzleNumber,
		errorMessage,
		purchasedHints,
		hints,
		canPurchaseHint,
		nextClueName,
		unlockHint,

		// Computed
		canPlay,
		guessResults,

		// Functions
		submitGuess,
		startGame,
		closeGameOverModal,
		updateCountdown,
		startCountdown,
		stopCountdown,
		saveState,
		loadState,
		resetGame,
		searchPlayers,
		getUKDateString,
		getNextGameTime,
	}
})
