import { defineStore } from 'pinia'
import { readSavedObject } from '../utils/storage'
import { ref, computed } from 'vue'
import { getAnswerForDay, getAnswerPlayerForDay, isValidFootballer, getDisplayNumber } from '../composables/useFootballers'
import { useHaptics } from '../composables/useHaptics'

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
	// The public number (#1 from the restart), for display and sharing only
	const puzzleNumber = getDisplayNumber(todayStr)
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
	const purchasedHints = ref(0)
	const haptics = useHaptics()
	const isApp = !!useRuntimeConfig().public.isApp
	let errorTimer: ReturnType<typeof setTimeout> | null = null

	function setError(msg: string) {
		errorMessage.value = msg
		haptics.error()
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
	// The app only reveals clues through hints, up to five; the website also unlocks the
	// first three as you guess (club after guess 2, nationality after 3, position after 4)
	const MAX_APP_HINTS = 5

	const hints = computed(() => {
		const player = getAnswerPlayerForDay(todayStr)
		if (!player) return []

		const surname = answer.toUpperCase()
		const clues = [
			{ label: 'Club', value: player.club, icon: 'solar:shield-linear' },
			{ label: 'Nation', value: player.nationality, icon: 'solar:earth-linear' },
			{ label: 'Position', value: player.position, icon: 'solar:football-linear' },
			{ label: 'Starts with', value: surname.slice(0, 1), icon: 'solar:text-square-linear' },
			{ label: 'Starts with', value: surname.slice(0, 2), icon: 'solar:text-square-linear' },
		]
		const unlocked = isApp
			? purchasedHints.value
			: Math.min(3, Math.max(0, guesses.value.length + purchasedHints.value - 1))

		// The second letter hint replaces the first rather than sitting beside it
		const shown = clues.slice(0, unlocked)
		if (unlocked >= 5) shown.splice(3, 1)
		return shown
	})

	const canPurchaseHint = computed(() =>
		!gameOver.value &&
		(isApp ? purchasedHints.value < MAX_APP_HINTS : guesses.value.length + purchasedHints.value < 4),
	)

	function unlockHint() {
		purchasedHints.value++
		haptics.tap()
		saveState()
		// Remembered for the "Tactical Review" Game Center achievement
		localStorage.setItem('footballdle-hint-used', '1')
	}

	// Derived from the store's own reactive `gameOver` ref rather than reading
	// localStorage directly — a computed with no reactive dependencies only
	// evaluates once and never updates, so completing today's game wouldn't
	// flip this to false until a full page reload. `gameOver` already gets
	// hydrated from localStorage on mount (see loadState) and flips live when
	// a game finishes (see submitGuess), so this stays in sync either way.
	const canPlay = computed(() => !gameOver.value)

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
			setError("Not a current Premier League surname")
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
			purchasedHints: purchasedHints.value,
		}
		localStorage.setItem('footballdle-game', JSON.stringify(gameState))
	}

	function loadState() {
		const saved = readSavedObject('footballdle-game')
		if (saved) {
			const { date, guesses: savedGuesses, gameOver: savedOver, isWin: savedWin, purchasedHints: savedPurchasedHints } = saved
			if (date === todayStr) {
				guesses.value = Array.isArray(savedGuesses) ? savedGuesses : []
				gameOver.value = !!savedOver
				isWin.value = !!savedWin
				purchasedHints.value = Number(savedPurchasedHints) || 0
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
		purchasedHints,
		canPlay,
		canPurchaseHint,

		// Functions
		submitGuess,
		onKeyboardKey,
		startGame,
		closeGameOverModal,
		unlockHint,
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
