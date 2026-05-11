import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAnswerForDay, isValidFootballer, getPlayerData, getPuzzleNumber } from '../composables/useFootballers'

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
	const puzzleNumber = getPuzzleNumber(todayStr)
	const nextGameTime = getNextGameTime()

	// Game state
	const guesses = ref<string[]>([])
	const currentGuess = ref('')
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

	// Countdown state
	const countdown = ref('')
	let countdownInterval: any

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const hints = computed(() => {
		const player = getPlayerData(answer)
		if (!player) return []

		const revealed: { label: string; value: string; icon: string }[] = []
		if (guesses.value.length >= 2) revealed.push({ label: '', value: player.club, icon: 'solar:shield-linear' })
		if (guesses.value.length >= 3)
			revealed.push({ label: '', value: player.nationality, icon: 'solar:earth-linear' })
		if (guesses.value.length >= 4)
			revealed.push({ label: '', value: player.position, icon: 'solar:football-linear' })

		return revealed
	})

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
			setError('Must be 6 letters')
			return
		}
		if (!isValidFootballer(guess)) {
			setError('Not a valid footballer')
			return
		}
		if (guesses.value.map((g) => g.toUpperCase()).includes(guess)) {
			setError('Already guessed!')
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
		const nextGame = typeof nextGameTime === 'string' ? new Date(nextGameTime) : nextGameTime
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
		document.addEventListener('visibilitychange', onVisibilityChange)
	}

	function stopCountdown() {
		if (countdownInterval) {
			clearInterval(countdownInterval)
		}
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
		puzzleNumber,
		errorMessage,

		// Computed
		hints,
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
