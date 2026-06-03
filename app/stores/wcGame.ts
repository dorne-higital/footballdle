import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
	getWCAnswerForDay,
	isValidWCFootballer,
	getWCPlayerData,
	getWCPuzzleNumber,
} from '../composables/useWCFootballers'
import { useWCStatsStore } from './wcStats'

export const useWCGameStore = defineStore('wcGame', () => {
	function getUKDateString() {
		const now = new Date()
		return now.toLocaleDateString('en-GB', { timeZone: 'Europe/London' })
	}

	// ============================================================================
	// STATE
	// ============================================================================
	const todayStr = getUKDateString()
	const answer = getWCAnswerForDay(todayStr)
	const puzzleNumber = getWCPuzzleNumber(todayStr)

	const guesses = ref<string[]>([])
	const currentInput = ref('')
	const maxGuesses = 6
	const gameOver = ref(false)
	const isWin = ref(false)
	const showGameOverModal = ref(false)
	const errorMessage = ref('')
	let errorTimer: ReturnType<typeof setTimeout> | null = null

	function setError(msg: string) {
		errorMessage.value = msg
		if (errorTimer) clearTimeout(errorTimer)
		errorTimer = setTimeout(() => {
			errorMessage.value = ''
		}, 2000)
	}

	// ============================================================================
	// COMPUTED
	// ============================================================================

	// ============================================================================
	// ACTIONS
	// ============================================================================
	function submitGuess(guess: string) {
		if (gameOver.value) return
		guess = guess.trim().toLowerCase()
		if (!guess) return
		if (!isValidWCFootballer(guess)) {
			setError('Not a valid World Cup player')
			return
		}
		if (guesses.value.map((g) => g.toLowerCase()).includes(guess)) {
			setError('Already guessed!')
			return
		}
		guesses.value.push(guess)
		currentInput.value = ''

		if (guess === answer.toLowerCase()) {
			isWin.value = true
			gameOver.value = true
			showGameOverModal.value = true
			useWCStatsStore().updateStats(true, guesses.value.length, todayStr)
		} else if (guesses.value.length >= maxGuesses) {
			isWin.value = false
			gameOver.value = true
			showGameOverModal.value = true
			useWCStatsStore().updateStats(false, guesses.value.length, todayStr)
		}
		saveState()
	}

	function closeGameOverModal() {
		showGameOverModal.value = false
	}

	// ============================================================================
	// PERSISTENCE
	// ============================================================================
	function saveState() {
		const state = {
			date: todayStr,
			guesses: guesses.value,
			gameOver: gameOver.value,
			isWin: isWin.value,
		}
		localStorage.setItem('footballdle-wc-game', JSON.stringify(state))
	}

	function loadState() {
		const saved = localStorage.getItem('footballdle-wc-game')
		if (!saved) return
		const { date, guesses: g, gameOver: over, isWin: win } = JSON.parse(saved)
		if (date === todayStr) {
			guesses.value = g
			gameOver.value = over
			isWin.value = win
		}
	}

	return {
		todayStr,
		answer,
		puzzleNumber,
		guesses,
		currentInput,
		maxGuesses,
		gameOver,
		isWin,
		showGameOverModal,
		errorMessage,
		submitGuess,
		closeGameOverModal,
		saveState,
		loadState,
	}
})
