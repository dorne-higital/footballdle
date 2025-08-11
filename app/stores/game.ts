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
	const gameInProgress = ref(false)

	// Countdown state
	const countdown = ref('')
	let countdownInterval: any

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const canPlay = computed(() => {
		// If game is over (completed or lost), we can't play again
		if (gameOver.value) {
			return false
		}
		
		// Check if we have a saved game for today
		const savedGame = localStorage.getItem('footballdle-game')
		if (savedGame) {
			const { date } = JSON.parse(savedGame)
			// If we have a saved game for today, we can't start a new game
			if (date === todayStr) {
				return false
			}
		}
		// If no saved game for today, we can play
		return true
	})

	const hasGameInProgress = computed(() => {
		// First check if we have a game in progress in memory
		if (guesses.value.length > 0 && !gameOver.value) {
			return true
		}
		
		// Fallback to localStorage check
		const savedGame = localStorage.getItem('footballdle-game')
		if (savedGame) {
			const { date, guesses: savedGuesses, gameOver: savedOver } = JSON.parse(savedGame)
			// Check if we have a game for today that's not finished
			// A game is "in progress" if it has guesses but is NOT game over
			return date === todayStr && savedGuesses.length > 0 && !savedOver
		}
		return false
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
		gameInProgress.value = false
		
		// Save daily completion to Firebase for cross-device sync
		const authStore = useAuthStore()
		if (authStore.isAuthenticated && authStore.user) {
			try {
				const { saveDailyGame } = useFirestore()
				saveDailyGame(authStore.user.uid, todayStr, {
					completed: true,
					guesses: guesses.value,
					isWin: true,
					completedAt: new Date()
				}).catch(() => {
					// Silent fail - don't break the game
				})
			} catch (error) {
				// Silent fail - don't break the game
			}
		}
	} else if (guesses.value.length >= maxGuesses) {
		isWin.value = false
		gameOver.value = true
		showGameOverModal.value = true
		gameInProgress.value = false
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
		saveState()
	}

	function startGame() {
		showIntro.value = false
		gameInProgress.value = true
		saveState()
	}

	function closeGameOverModal() {
		showGameOverModal.value = false
	}

	function resumeGame() {
		showIntro.value = false
		gameInProgress.value = true
		// Load the saved game state
		loadState()
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
			currentGuess: currentGuess.value,
			gameOver: gameOver.value,
			isWin: isWin.value,
			gameInProgress: gameInProgress.value,
			showIntro: showIntro.value,
		}
		localStorage.setItem('footballdle-game', JSON.stringify(gameState))
	}

	function loadState() {
		const savedGame = localStorage.getItem('footballdle-game')
		if (savedGame) {
			const { 
				date, 
				guesses: savedGuesses, 
				currentGuess: savedCurrentGuess,
				gameOver: savedOver, 
				isWin: savedWin,
				gameInProgress: savedInProgress,
				showIntro: savedShowIntro
			} = JSON.parse(savedGame)
			
			if (date === todayStr) {
				guesses.value = savedGuesses || []
				currentGuess.value = savedCurrentGuess || ''
				gameOver.value = savedOver || false
				isWin.value = savedWin || false
				gameInProgress.value = savedInProgress || false
				showIntro.value = savedShowIntro !== undefined ? savedShowIntro : true
				
				// Don't show game over modal on load - let the resume modal handle it
				showGameOverModal.value = false
			}
		}
	}

	function resetGameState() {
		guesses.value = []
		currentGuess.value = ''
		gameOver.value = false
		isWin.value = false
		showGameOverModal.value = false
		showIntro.value = true
		gameInProgress.value = false
	}

	function resetGame() {
		resetGameState()
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
		gameInProgress,
		countdown,
		answer,
		todayStr,
		
		// Computed
		canPlay,
		hasGameInProgress,
		
		// Functions
		submitGuess,
		onKeyboardKey,
		startGame,
		closeGameOverModal,
		resumeGame,
		updateCountdown,
		startCountdown,
		stopCountdown,
		saveState,
		loadState,
		resetGame,
		resetGameState,
		getUKDateString,
		getNextGameTime,
	}
}) 