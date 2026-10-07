
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getChallengeFootballerByIndex, useChallengeFootballers } from '../composables/useChallengeFootballers'
import { useModeStatsStore } from './modeStats'
import { getUKDateString } from '../utils/dateStreak'
import { readSavedObject } from '../utils/storage'
import { useHaptics } from '../composables/useHaptics'

const { isValidChallengeFootballer } = useChallengeFootballers()

export const useChallengeStore = defineStore('challenge', () => {
	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const isUnlocked = ref(false)
	const isActive = ref(false)
	// Where this install starts in the shuffled answer list: random, so mates don't all
	// get the same sequence and spoil it for each other
	const sessionGameIndex = ref(Math.floor(Math.random() * 10_000))
	// Challenges won since entering Challenge mode (shown as the session score)
	const sessionWins = ref(0)
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

	const errorMessage = ref('')
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

	const challengeStatsStore = useModeStatsStore('challenge')

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const canPlay = computed(() => !gameOver.value && timeRemaining.value > 0 && !isPaused.value)
	const timeFormatted = computed(() => {
		const minutes = Math.floor(timeRemaining.value / 60)
		const seconds = timeRemaining.value % 60
		return `${minutes}:${seconds.toString().padStart(2, '0')}`
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

		currentAnswer.value = getChallengeFootballerByIndex(sessionGameIndex.value)
		sessionGameIndex.value++

		startTimer()
		saveChallengeState()
	}

	function submitGuess(guess: string) {
		if (gameOver.value || timeRemaining.value <= 0) return

		guess = guess.trim().toUpperCase()
		if (guess.length !== 5) {
			setError('Must be 5 letters')
			return
		}

		if (!isValidChallengeFootballer(guess)) {
			setError("Not a current Premier League surname")
			return
		}

		if (guesses.value.map(g => g.toUpperCase()).includes(guess)) {
			setError('Already guessed!')
			return
		}

		guesses.value.push(guess)

		if (guess.toUpperCase() === currentAnswer.value.toUpperCase()) {
			isWin.value = true
			sessionWins.value++
			gameOver.value = true
			showGameOverModal.value = true
			stopTimer()
			recordChallengeResult(true, guesses.value.length)
			if (import.meta.client) {
				try {
					const timeUsed = 45 - timeRemaining.value
					;(window as any).gtag('event', 'challenge_win', {
						event_category: 'challenge',
						event_label: 'challenge_mode',
						value: timeUsed,
					})
				} catch {}
			}
		} else if (guesses.value.length >= maxGuesses) {
			isWin.value = false
			gameOver.value = true
			showGameOverModal.value = true
			stopTimer()
			recordChallengeResult(false)
			if (import.meta.client) {
				try {
					const timeUsed = 45 - timeRemaining.value
					;(window as any).gtag('event', 'challenge_loss', {
						event_category: 'challenge',
						event_label: 'challenge_mode',
						value: timeUsed,
					})
				} catch {}
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
		isActive.value = false
		sessionWins.value = 0
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
		stopTimer()
		if (isPaused.value) return

		timerInterval.value = setInterval(() => {
			if (isPaused.value) return

			timeRemaining.value--
			// Saved every tick so a relaunch can't hand back a fuller clock
			if (timeRemaining.value > 0) saveChallengeState()
			// A light tick for each of the last 3 seconds
			if (timeRemaining.value > 0 && timeRemaining.value <= 3) haptics.select()
			if (timeRemaining.value <= 0) {
				isWin.value = false
				gameOver.value = true
				showGameOverModal.value = true
				stopTimer()
				recordChallengeResult(false)
				if (import.meta.client) {
					try {
						;(window as any).gtag('event', 'challenge_loss', {
							event_category: 'challenge',
							event_label: 'time_up',
							value: 45,
						})
					} catch {}
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

	/** Leaving the screen or backgrounding the app: the clock stops where it is
	 *  (unlike togglePause, nothing on screen changes) */
	function pauseTimer() {
		if (!timerInterval.value) return
		stopTimer()
		saveChallengeState()
	}

	/** Back on the challenge screen: carry on from the time that was left */
	function resumeTimer() {
		if (!isActive.value || gameOver.value || isPaused.value || timeRemaining.value <= 0 || timerInterval.value) return
		startTimer()
	}

	// ============================================================================
	// STATS FUNCTIONS
	// ============================================================================
	// Challenge allows unlimited plays per day, so stats accrue on every game
	// while the streak only advances once per calendar day — see modeStats.ts.
	function recordChallengeResult(win: boolean, guessCount?: number) {
		const timeUsed = 45 - timeRemaining.value
		challengeStatsStore.updateStats(win, guessCount, getUKDateString(), {
			timeUsed,
			unlimitedPerDay: true,
		})
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
			sessionGameIndex: sessionGameIndex.value,
			sessionWins: sessionWins.value,
		}
		localStorage.setItem('footballdle-challenge', JSON.stringify(state))
	}

	function loadChallengeState() {
		const state = readSavedObject('footballdle-challenge')
		if (state) {
			isUnlocked.value = state.isUnlocked || false
			isActive.value = state.isActive || false
			currentAnswer.value = state.currentAnswer || ''
			guesses.value = Array.isArray(state.guesses) ? state.guesses : []
			currentGuess.value = state.currentGuess || ''
			gameOver.value = state.gameOver || false
			isWin.value = state.isWin || false
			timeRemaining.value = state.timeRemaining || 45
			isPaused.value = state.isPaused || false
			// Old saves all started at 0 (same order for everyone), so only keep a real position
			if (state.sessionGameIndex > 0) sessionGameIndex.value = state.sessionGameIndex
			sessionWins.value = state.sessionWins || 0
			// The clock isn't restarted here: the challenge screen calls resumeTimer
			// once it's actually showing
		}
	}

	function resetDaily() {
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
		sessionGameIndex,
		sessionWins,
		currentAnswer,
		guesses,
		currentGuess,
		maxGuesses,
		gameOver,
		isWin,
		timeRemaining,
		showGameOverModal,
		isPaused,
		errorMessage,

		// Computed
		canPlay,
		timeFormatted,

		// Functions
		setError,
		unlockChallenge,
		startChallenge,
		submitGuess,
		onKeyboardKey,
		endChallenge,
		closeGameOverModal,
		togglePause,
		pauseTimer,
		resumeTimer,
		startTimer,
		stopTimer,
		saveChallengeState,
		loadChallengeState,
		resetDaily,
	}
})
