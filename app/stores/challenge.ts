import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useChallengeFootballers } from '../composables/useChallengeFootballers'

const { challengeFootballers, getRandomChallengeFootballer, isValidChallengeFootballer } = useChallengeFootballers()

export const useChallengeStore = defineStore('challenge', () => {
	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const isUnlocked = ref(false)
	const isActive = ref(false)
	const currentAnswer = ref('')
	const guesses = ref<string[]>([])
	const currentGuess = ref('')
	const maxGuesses = 6
	const gameOver = ref(false)
	const isWin = ref(false)
	const timeRemaining = ref(45)
	const timerInterval = ref<any>(null)
	const showGameOverModal = ref(false)
	const isPaused = ref(false)

	// Challenge stats (separate from regular stats)
	const challengeStats = ref({
		gamesPlayed: 0,
		wins: 0,
		losses: 0,
		currentStreak: 0,
		maxStreak: 0,
		bestTime: 0, // Best time to solve in seconds
		totalTime: 0, // Total time played
	})

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const canPlay = computed(() => !gameOver.value && timeRemaining.value > 0 && !isPaused.value)
	const timeFormatted = computed(() => {
		const minutes = Math.floor(timeRemaining.value / 60)
		const seconds = timeRemaining.value % 60
		return `${minutes}:${seconds.toString().padStart(2, '0')}`
	})
	const winPercentage = computed(() => {
		if (challengeStats.value.gamesPlayed === 0) return 0
		return Math.round((challengeStats.value.wins / challengeStats.value.gamesPlayed) * 100)
	})

	// ============================================================================
	// CHALLENGE FUNCTIONS
	// ============================================================================
	function unlockChallenge() {
		isUnlocked.value = true
		saveChallengeState()
	}

	function startChallenge() {
		isActive.value = true
		gameOver.value = false
		isWin.value = false
		guesses.value = []
		currentGuess.value = ''
		timeRemaining.value = 45
		showGameOverModal.value = false
		isPaused.value = false
		
		// Generate random 5-letter player
		currentAnswer.value = getRandomChallengeFootballer()
		
		// Start timer
		startTimer()
		saveChallengeState()
	}

	function submitGuess(guess: string) {
		if (gameOver.value || timeRemaining.value <= 0) return
		
		guess = guess.trim().toUpperCase()
		if (guess.length !== 5) {
			alert('Challenge mode: Guess must be 5 letters!')
			return
		}
		
		// Check if it's a valid 5-letter footballer
		if (!isValidChallengeFootballer(guess)) {
			alert('Not a valid 5-letter footballer surname!')
			return
		}
		
		// Check for duplicate guesses
		if (guesses.value.includes(guess)) {
			alert('Already guessed!')
			return
		}
		
		guesses.value.push(guess)
		
		// Check win condition (case-insensitive comparison)
		if (guess.toUpperCase() === currentAnswer.value.toUpperCase()) {
			isWin.value = true
			gameOver.value = true
			showGameOverModal.value = true
			stopTimer()
			updateChallengeStats(true)
			// Track challenge win
			if (process.client) {
				try {
					const timeUsed = 45 - timeRemaining.value
					;(window as any).gtag('event', 'challenge_win', {
						event_category: 'challenge',
						event_label: 'challenge_mode',
						value: timeUsed,
					})
				} catch (error) {
					// Silently fail if analytics is not available
				}
			}
		} else if (guesses.value.length >= maxGuesses) {
			isWin.value = false
			gameOver.value = true
			showGameOverModal.value = true
			stopTimer()
			updateChallengeStats(false)
			// Track challenge loss
			if (process.client) {
				try {
					const timeUsed = 45 - timeRemaining.value
					;(window as any).gtag('event', 'challenge_loss', {
						event_category: 'challenge',
						event_label: 'challenge_mode',
						value: timeUsed,
					})
				} catch (error) {
					// Silently fail if analytics is not available
				}
			}
		}
		
		currentGuess.value = ''
		saveChallengeState()
	}

	function onKeyboardKey(key: string) {
		if (gameOver.value || timeRemaining.value <= 0 || isPaused.value) return
		
		if (key === 'ENTER') {
			submitGuess(currentGuess.value)
		} else if (key === 'BACKSPACE') {
			currentGuess.value = currentGuess.value.slice(0, -1)
		} else if (/^[A-Z]$/.test(key) && currentGuess.value.length < 5) {
			currentGuess.value += key
		}
	}

	function endChallenge() {
		// Track challenge abandonment if not completed
		if (isActive.value && !gameOver.value && timeRemaining.value > 0) {
			const timeUsed = 45 - timeRemaining.value
			// We'll track this in the main component
		}
		
		isActive.value = false
		gameOver.value = false
		isWin.value = false
		guesses.value = []
		currentGuess.value = ''
		showGameOverModal.value = false
		isPaused.value = false
		stopTimer()
		saveChallengeState()
	}

	function closeGameOverModal() {
		showGameOverModal.value = false
	}

	function togglePause() {
		isPaused.value = !isPaused.value
		if (isPaused.value) {
			stopTimer()
		} else {
			startTimer()
		}
		saveChallengeState()
	}

	// ============================================================================
	// TIMER FUNCTIONS
	// ============================================================================
	function startTimer() {
		stopTimer() // Clear any existing timer
		if (isPaused.value) return // Don't start timer if paused
		
		timerInterval.value = setInterval(() => {
			if (isPaused.value) return // Don't countdown if paused
			
			timeRemaining.value--
			if (timeRemaining.value <= 0) {
				// Time's up!
				isWin.value = false
				gameOver.value = true
				showGameOverModal.value = true
				stopTimer()
				updateChallengeStats(false)
				// Track challenge loss due to time
				if (process.client) {
					try {
						const timeUsed = 45 - timeRemaining.value
						;(window as any).gtag('event', 'challenge_loss', {
							event_category: 'challenge',
							event_label: 'challenge_mode',
							value: timeUsed,
						})
					} catch (error) {
						// Silently fail if analytics is not available
					}
				}
				saveChallengeState()
			}
		}, 1000)
	}

	function stopTimer() {
		if (timerInterval.value) {
			clearInterval(timerInterval.value)
			timerInterval.value = null
		}
	}

	// ============================================================================
	// STATS FUNCTIONS
	// ============================================================================
	function updateChallengeStats(win: boolean) {
		challengeStats.value.gamesPlayed++
		
		if (win) {
			challengeStats.value.wins++
			challengeStats.value.currentStreak++
			if (challengeStats.value.currentStreak > challengeStats.value.maxStreak) {
				challengeStats.value.maxStreak = challengeStats.value.currentStreak
			}
			
			// Update best time if this was faster
			const timeUsed = 45 - timeRemaining.value
			if (challengeStats.value.bestTime === 0 || timeUsed < challengeStats.value.bestTime) {
				challengeStats.value.bestTime = timeUsed
			}
		} else {
			challengeStats.value.losses++
			challengeStats.value.currentStreak = 0
		}
		
		// Update total time
		challengeStats.value.totalTime += (45 - timeRemaining.value)
		
		saveChallengeStats()
	}

	function resetChallengeStats() {
		challengeStats.value = {
			gamesPlayed: 0,
			wins: 0,
			losses: 0,
			currentStreak: 0,
			maxStreak: 0,
			bestTime: 0,
			totalTime: 0,
		}
		saveChallengeStats()
	}

	// ============================================================================
	// LOCAL STORAGE FUNCTIONS
	// ============================================================================
	function saveChallengeState() {
		const state = {
			isUnlocked: isUnlocked.value,
			isActive: isActive.value,
			currentAnswer: currentAnswer.value,
			guesses: guesses.value,
			currentGuess: currentGuess.value,
			gameOver: gameOver.value,
			isWin: isWin.value,
			timeRemaining: timeRemaining.value,
			isPaused: isPaused.value,
		}
		localStorage.setItem('footballdle-challenge', JSON.stringify(state))
	}

	function loadChallengeState() {
		const saved = localStorage.getItem('footballdle-challenge')
		if (saved) {
			const state = JSON.parse(saved)
			isUnlocked.value = state.isUnlocked || false
			isActive.value = state.isActive || false
			currentAnswer.value = state.currentAnswer || ''
			guesses.value = state.guesses || []
			currentGuess.value = state.currentGuess || ''
			gameOver.value = state.gameOver || false
			isWin.value = state.isWin || false
			timeRemaining.value = state.timeRemaining || 45
			isPaused.value = state.isPaused || false
			
			// If challenge was active and not paused, restart timer
			if (isActive.value && !gameOver.value && timeRemaining.value > 0 && !isPaused.value) {
				startTimer()
			}
		}
	}

	function saveChallengeStats() {
		localStorage.setItem('footballdle-challenge-stats', JSON.stringify(challengeStats.value))
	}

	function loadChallengeStats() {
		const saved = localStorage.getItem('footballdle-challenge-stats')
		if (saved) {
			challengeStats.value = JSON.parse(saved)
		}
	}

	function resetDaily() {
		// Reset challenge state daily (but keep stats)
		isActive.value = false
		gameOver.value = false
		isWin.value = false
		guesses.value = []
		currentGuess.value = ''
		timeRemaining.value = 45
		isPaused.value = false
		stopTimer()
		saveChallengeState()
	}

	return {
		// State
		isUnlocked,
		isActive,
		currentAnswer,
		guesses,
		currentGuess,
		maxGuesses,
		gameOver,
		isWin,
		timeRemaining,
		showGameOverModal,
		isPaused,
		challengeStats,
		
		// Computed
		canPlay,
		timeFormatted,
		winPercentage,
		
		// Functions
		unlockChallenge,
		startChallenge,
		submitGuess,
		onKeyboardKey,
		endChallenge,
		closeGameOverModal,
		togglePause,
		startTimer,
		stopTimer,
		updateChallengeStats,
		resetChallengeStats,
		saveChallengeState,
		loadChallengeState,
		saveChallengeStats,
		loadChallengeStats,
		resetDaily,
	}
}) 