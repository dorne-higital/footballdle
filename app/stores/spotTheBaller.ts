import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSpotRoundsForDay, SPOT_ROUNDS_PER_MATCH, SPOT_ROUND_TIME, type SpotRound } from '../composables/useSpotFootballers'
import { getDisplayNumber } from '../composables/useFootballers'
import { useModeStatsStore } from './modeStats'
import { getUKDateString } from '../utils/dateStreak'
import { useHaptics } from '../composables/useHaptics'

export interface SpotRoundResult {
	picked: string | null
	correct: boolean
}

// Score (0-10 correct rounds) mapped to a 1-6 tier so it slots into the
// existing guessDistribution bucketing (modeStats.ts only records keys '1'-'6').
const SCORE_TIERS = [
	{ min: 0, tier: 1, label: 'Rookie Scout' },
	{ min: 2, tier: 2, label: 'Grafter' },
	{ min: 4, tier: 3, label: 'Solid Read' },
	{ min: 6, tier: 4, label: 'Sharp Eye' },
	{ min: 8, tier: 5, label: 'Elite Scout' },
	{ min: 10, tier: 6, label: 'Perfect 10' },
]

export function getScoreTier(score: number): number {
	return [...SCORE_TIERS].reverse().find((t) => score >= t.min)!.tier
}

export function getScoreLabel(score: number): string {
	return [...SCORE_TIERS].reverse().find((t) => score >= t.min)!.label
}

export const SPOT_TIER_LABELS = SCORE_TIERS.map((t) => t.label)

const WIN_THRESHOLD = 6

// How long a revealed answer stays up before the next round. A miss gets longer, so
// there's time to take in who it actually was (a tap skips ahead).
const REVEAL_MS = { correct: 900, wrong: 1800 }

export const useSpotTheBallerStore = defineStore('spotTheBaller', () => {
	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const todayStr = getUKDateString() || ''
	const rounds = getSpotRoundsForDay(todayStr)
	// The public number (#1 from the restart), for display and sharing only
	const puzzleNumber = getDisplayNumber(todayStr)
	const maxGuesses = SPOT_ROUNDS_PER_MATCH

	const roundIndex = ref(0)
	const score = ref(0)
	const roundResults = ref<SpotRoundResult[]>([])
	const revealState = ref<'idle' | 'correct' | 'wrong'>('idle')
	const timeRemaining = ref(SPOT_ROUND_TIME)
	const haptics = useHaptics()
	let timerInterval: ReturnType<typeof setInterval> | null = null
	// A match picked up again (relaunch, back from another screen or the background)
	// waits for a tap before its clock runs, so nobody lands on a ticking round
	const awaitingResume = ref(false)
	let advanceTimer: ReturnType<typeof setTimeout> | null = null

	const gameOver = ref(false)
	const isWin = ref(false)
	const showGameOverModal = ref(false)
	const showIntro = ref(true)

	const statsStore = useModeStatsStore('spotball')

	// Own tier histogram, tracked independently of modeStats' guessDistribution
	// — that field only records on wins, but a score tier is meaningful on a
	// loss too (tiers 1-3 are exactly the losing outcomes).
	const tierHistogram = ref<Record<string, number>>({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 })

	function loadTierHistogram() {
		const saved = localStorage.getItem('footballdle-spot-tiers')
		if (saved) {
			tierHistogram.value = { ...tierHistogram.value, ...JSON.parse(saved) }
		}
	}

	function saveTierHistogram() {
		localStorage.setItem('footballdle-spot-tiers', JSON.stringify(tierHistogram.value))
	}

	// Countdown to next day's puzzle — same "next puzzle at UK midnight" pattern as Daily/Scout.
	const countdown = ref('')
	let countdownInterval: ReturnType<typeof setInterval> | null = null

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
		const savedGame = localStorage.getItem('footballdle-spot')
		if (savedGame) {
			const { date, gameOver: savedGameOver } = JSON.parse(savedGame)
			if (date === todayStr) return !savedGameOver
		}
		return true
	})

	const currentRound = computed<SpotRound | undefined>(() => rounds[roundIndex.value])
	const roundProgress = computed(() => `Round ${Math.min(roundIndex.value + 1, maxGuesses)}/${maxGuesses}`)
	const scoreTier = computed(() => getScoreTier(score.value))
	const scoreLabel = computed(() => getScoreLabel(score.value))

	// ============================================================================
	// GAME LOGIC
	// ============================================================================
	function startGame() {
		showIntro.value = false
		awaitingResume.value = false
		roundIndex.value = 0
		score.value = 0
		roundResults.value = []
		revealState.value = 'idle'
		gameOver.value = false
		isWin.value = false
		showGameOverModal.value = false
		startRoundTimer()
		saveState()
	}

	function pickOption(name: string) {
		if (gameOver.value || revealState.value !== 'idle') return
		const round = currentRound.value
		if (!round) return

		stopRoundTimer()
		const correct = name.toUpperCase() === round.target.name.toUpperCase()
		revealState.value = correct ? 'correct' : 'wrong'
		roundResults.value.push({ picked: name, correct })
		if (correct) score.value++
		if (correct) haptics.success()
		else haptics.error()
		saveState()

		advanceTimer = setTimeout(() => advanceRound(), correct ? REVEAL_MS.correct : REVEAL_MS.wrong)
	}

	function handleTimeout() {
		if (gameOver.value || revealState.value !== 'idle') return
		stopRoundTimer()
		revealState.value = 'wrong'
		roundResults.value.push({ picked: null, correct: false })
		haptics.error()
		saveState()

		advanceTimer = setTimeout(() => advanceRound(), REVEAL_MS.wrong)
	}

	/** Tap during the reveal to move on straight away */
	function skipReveal() {
		if (!advanceTimer) return
		clearTimeout(advanceTimer)
		advanceRound()
	}

	function advanceRound(startTimer = true) {
		advanceTimer = null
		if (roundIndex.value + 1 >= maxGuesses) {
			finishGame()
			return
		}
		roundIndex.value++
		revealState.value = 'idle'
		timeRemaining.value = SPOT_ROUND_TIME
		if (startTimer) startRoundTimer()
		saveState()
	}

	function finishGame() {
		gameOver.value = true
		isWin.value = score.value >= WIN_THRESHOLD
		showGameOverModal.value = true
		statsStore.updateStats(isWin.value, undefined, todayStr)
		const tierKey = String(scoreTier.value)
		tierHistogram.value[tierKey] = (tierHistogram.value[tierKey] || 0) + 1
		saveTierHistogram()
		saveState()
	}

	function closeGameOverModal() {
		showGameOverModal.value = false
	}

	// ============================================================================
	// ROUND TIMER
	// ============================================================================
	function startRoundTimer(from = SPOT_ROUND_TIME) {
		stopRoundTimer()
		timeRemaining.value = from
		timerInterval = setInterval(() => {
			timeRemaining.value--
			if (timeRemaining.value <= 0) {
				handleTimeout()
			} else {
				// A light tick for each of the last 3 seconds
				if (timeRemaining.value <= 3) haptics.select()
				// Saved every tick so a relaunch can't hand back a fuller clock
				saveState()
			}
		}, 1000)
	}

	function stopRoundTimer() {
		if (timerInterval) {
			clearInterval(timerInterval)
			timerInterval = null
		}
	}

	/** Leaving the screen or backgrounding the app: the clock stops where it is.
	 *  A pick that was mid-reveal is settled so the next round waits, unstarted. */
	function pauseRound() {
		stopRoundTimer()
		if (advanceTimer) {
			clearTimeout(advanceTimer)
			advanceRound(false)
		}
		if (roundResults.value.length || roundIndex.value) saveState()
	}

	/** Back on screen: hold the round until the player taps to carry on */
	function resumeRound() {
		if (gameOver.value || showIntro.value || revealState.value !== 'idle' || timerInterval) return
		if (roundResults.value.length > roundIndex.value) return
		awaitingResume.value = true
	}

	/** The tap: the clock picks up from where it stopped */
	function continueRound() {
		if (!awaitingResume.value) return
		awaitingResume.value = false
		if (gameOver.value || showIntro.value || revealState.value !== 'idle' || timerInterval) return
		if (roundResults.value.length > roundIndex.value) return
		startRoundTimer(timeRemaining.value > 0 ? timeRemaining.value : SPOT_ROUND_TIME)
	}

	// ============================================================================
	// NEXT-PUZZLE COUNTDOWN
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
			roundIndex: roundIndex.value,
			score: score.value,
			roundResults: roundResults.value,
			gameOver: gameOver.value,
			isWin: isWin.value,
			showIntro: showIntro.value,
			timeRemaining: timeRemaining.value,
		}
		localStorage.setItem('footballdle-spot', JSON.stringify(state))
	}

	function loadState() {
		const saved = localStorage.getItem('footballdle-spot')
		if (saved) {
			const parsed = JSON.parse(saved)
			if (parsed.date === todayStr) {
				roundIndex.value = parsed.roundIndex ?? 0
				score.value = parsed.score ?? 0
				roundResults.value = parsed.roundResults ?? []
				gameOver.value = parsed.gameOver ?? false
				isWin.value = parsed.isWin ?? false
				showGameOverModal.value = false
				showIntro.value = gameOver.value
				if (!gameOver.value) {
					// Left mid-reveal: that round is answered, so move on to the next one
					if (roundResults.value.length > roundIndex.value) {
						roundIndex.value = roundResults.value.length - 1
						advanceRound(false)
						if (gameOver.value) return
					} else {
						const t = Number(parsed.timeRemaining)
						timeRemaining.value = t > 0 && t <= SPOT_ROUND_TIME ? t : SPOT_ROUND_TIME
					}
					revealState.value = 'idle'
					awaitingResume.value = true
				}
			}
		}
	}

	return {
		// State
		rounds,
		maxGuesses,
		roundIndex,
		score,
		roundResults,
		revealState,
		timeRemaining,
		gameOver,
		isWin,
		showGameOverModal,
		showIntro,
		countdown,
		todayStr,
		puzzleNumber,
		tierHistogram,

		// Computed
		canPlay,
		currentRound,
		roundProgress,
		scoreTier,
		scoreLabel,

		// Functions
		startGame,
		pickOption,
		pauseRound,
		resumeRound,
		continueRound,
		awaitingResume,
		skipReveal,
		closeGameOverModal,
		startCountdown,
		stopCountdown,
		updateCountdown,
		saveState,
		loadState,
		loadTierHistogram,
		getNextGameTime,
	}
})
