import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
	getScoutAnswerForDay,
	isValidFootballer,
	getPlayerData,
	getPuzzleNumber,
	getPositionGroup,
	footballers,
} from '../composables/useFootballers'
import { getConfederation } from '../composables/useConfederations'
import { getUKDateString } from '../utils/dateStreak'

export type AttributeState = 'correct' | 'present' | 'absent'

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
	const puzzleNumber = getPuzzleNumber(todayStr)

	const guesses = ref<string[]>([])
	const maxGuesses = 6
	const gameOver = ref(false)
	const isWin = ref(false)
	const showGameOverModal = ref(false)
	const showIntro = ref(true)
	const errorMessage = ref('')
	let errorTimer: ReturnType<typeof setTimeout> | null = null

	function setError(msg: string) {
		errorMessage.value = msg
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
		const savedGame = localStorage.getItem('footballdle-scout')
		if (savedGame) {
			const { date, gameOver: savedGameOver } = JSON.parse(savedGame)
			if (date === todayStr) return !savedGameOver
		}
		return true
	})

	function compareAttribute(guessValue: string, answerValue: string, sameGroup: boolean): AttributeState {
		if (guessValue === answerValue) return 'correct'
		if (sameGroup) return 'present'
		return 'absent'
	}

	// One row per guess, with each attribute compared against the answer.
	const guessResults = computed<ScoutGuessResult[]>(() => {
		const answerPlayer = getPlayerData(answer)
		if (!answerPlayer) return []

		return guesses.value.map((name) => {
			const player = getPlayerData(name)
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
				getPositionGroup(player.position) !== 'Unknown' &&
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
		if (!isValidFootballer(trimmed)) {
			setError('Not a valid footballer')
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
		}
		localStorage.setItem('footballdle-scout', JSON.stringify(state))
	}

	function loadState() {
		const saved = localStorage.getItem('footballdle-scout')
		if (saved) {
			const { date, guesses: savedGuesses, gameOver: savedOver, isWin: savedWin } = JSON.parse(saved)
			if (date === todayStr) {
				guesses.value = savedGuesses
				gameOver.value = savedOver
				isWin.value = savedWin
				showGameOverModal.value = false
				showIntro.value = savedOver
			}
		}
	}

	function resetGame() {
		guesses.value = []
		gameOver.value = false
		isWin.value = false
		showGameOverModal.value = false
		showIntro.value = true
		saveState()
	}

	// Player-name suggestions for the autocomplete input, filtered by query,
	// excluding names already guessed this round.
	function searchPlayers(query: string, limit = 8) {
		const q = query.trim().toUpperCase()
		if (!q) return []
		const guessedUpper = new Set(guesses.value.map((g) => g.toUpperCase()))
		return footballers
			.filter((f) => f.name.toUpperCase().includes(q) && !guessedUpper.has(f.name.toUpperCase()))
			.slice(0, limit)
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
