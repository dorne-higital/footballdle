import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { footballers, getAnswerForDay, isValidFootballer } from '../composables/useFootballers'

export const useGameStore = defineStore('game', () => {
	// ============================================================================
	// UTILITY FUNCTIONS
	// ============================================================================
	function getUKDateString() {
		const now = new Date()
		return now.toLocaleDateString('en-GB', { timeZone: 'Europe/London' })
	}

	function getNextGameTime() {
		// Get current time in UK
		const now = new Date()
		const ukNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }))
		// Set to next midnight UK time
		ukNow.setHours(0, 0, 0, 0)
		ukNow.setDate(ukNow.getDate() + 1)
		return ukNow
	}

	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const todayStr = getUKDateString() || ''
	const answer = getAnswerForDay(todayStr) || ''
	const nextGameTime = getNextGameTime()

	// Game state
	const guesses = ref<string[]>([])
	const currentGuess = ref('')
	const maxGuesses = 6
	const gameOver = ref(false)
	const isWin = ref(false)
	const showGameOverModal = ref(false)
	const showIntro = ref(true)

	// Countdown state
	const countdown = ref('')
	let countdownInterval: any

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const canPlay = computed(() => {
		// Check if we have a saved game for today
		const savedGame = localStorage.getItem('footballdle-game')
		if (savedGame) {
			const { date, gameOver: savedGameOver } = JSON.parse(savedGame)
			// If we have a saved game for today, check if it's completed
			if (date === todayStr) {
				// Only prevent playing if the game is actually completed (won or lost)
				return !savedGameOver
			}
		}
		// If no saved game for today, we can play
		return true
	})

	// ============================================================================
	// GAME LOGIC FUNCTIONS
	// ============================================================================
	function submitGuess(guess: string) {
		if (gameOver.value) return // Prevent guess if game is over
		guess = guess.trim().toUpperCase()
		if (guess.length !== 6) {
			alert('Guess must be 6 letters!')
			return
		}
		// Use optimized validation function
		if (!isValidFootballer(guess)) {
			alert('Not a valid footballer surname!')
			return
		}
		// Case-insensitive duplicate guess check
		if (guesses.value.map(g => g.toUpperCase()).includes(guess)) {
			alert('Already guessed!')
			return
		}
		guesses.value.push(guess)
		// Case-insensitive win check
		if (guess === answer.toUpperCase()) {
			isWin.value = true
			gameOver.value = true
			showGameOverModal.value = true
		} else if (guesses.value.length >= maxGuesses) {
			isWin.value = false
			gameOver.value = true
			showGameOverModal.value = true
		}
		currentGuess.value = ''
		saveState()
	}

	function onKeyboardKey(key: string) {
		if (gameOver.value) return // Prevent input if game is over
		if (key === 'ENTER') {
			submitGuess(currentGuess.value)
		} else if (key === 'BACKSPACE') {
			currentGuess.value = currentGuess.value.slice(0, -1)
		} else if (/^[A-Z]$/.test(key) && currentGuess.value.length < 6) {
			currentGuess.value += key
		}
	}

	function startGame() {
		showIntro.value = false
	}

	function closeGameOverModal() {
		showGameOverModal.value = false
		// Don't change showIntro - let the user decide when to go back to menu
	}

	// ============================================================================
	// COUNTDOWN FUNCTIONS
	// ============================================================================
	function updateCountdown() {
		if (!nextGameTime) return
		const now = new Date()
		const nextGame = typeof nextGameTime === 'string'
			? new Date(nextGameTime)
			: nextGameTime
		const diff = nextGame.getTime() - now.getTime()
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
	}

	function stopCountdown() {
		if (countdownInterval) {
			clearInterval(countdownInterval)
		}
	}

	// ============================================================================
	// LOCAL STORAGE FUNCTIONS
	// ============================================================================
	function saveState() {
		const gameState = {
			date: todayStr,
			guesses: guesses.value,
			gameOver: gameOver.value,
			isWin: isWin.value,
		}
		localStorage.setItem('footballdle-game', JSON.stringify(gameState))
	}

	function loadState() {
		const savedGame = localStorage.getItem('footballdle-game')
		if (savedGame) {
			const { date, guesses: savedGuesses, gameOver: savedOver, isWin: savedWin } = JSON.parse(savedGame)
			if (date === todayStr) {
				guesses.value = savedGuesses
				gameOver.value = savedOver
				isWin.value = savedWin
				// Don't show game over modal on load - let the intro screen handle it
				showGameOverModal.value = false
				
				// If game is completed, show intro screen
				// If game is not completed, keep intro hidden so user can continue
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

	return {
		// State
		guesses,
		currentGuess,
		maxGuesses,
		gameOver,
		isWin,
		showGameOverModal,
		showIntro,
		countdown,
		answer,
		todayStr,
		
		// Computed
		canPlay,
		
		// Functions
		submitGuess,
		onKeyboardKey,
		startGame,
		closeGameOverModal,
		updateCountdown,
		startCountdown,
		stopCountdown,
		saveState,
		loadState,
		resetGame,
		getUKDateString,
		getNextGameTime,
	}
}) 