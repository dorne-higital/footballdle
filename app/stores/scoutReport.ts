import { defineStore } from 'pinia'
import { readSavedObject } from '../utils/storage'
import { ref, computed } from 'vue'
import { useHaptics } from '../composables/useHaptics'
import { getDisplayNumber, getPositionGroup, getPuzzleNumber, type Footballer } from '../composables/useFootballers'
import {
	getScoutAnswerForDay,
	getScoutAnswerPlayerForDay,
	getScoutBriefCodeForDay,
	isValidFullFootballer,
	getFullPlayerData,
	searchFullFootballers,
	normaliseKey,
} from '../composables/useAllFootballers'
import { getConfederation, type Confederation } from '../composables/useConfederations'
import {
	CONTINENTS as CONTINENT_NAMES,
	PRICE_CLOSE,
	PRICE_RANGE,
	comparePrice,
	formatPrice,
	positionsAreNear,
	priceOf,
	regionOf,
	scoutBrief,
	type Region,
} from '../utils/scoutClues'
import type { PositionGroup } from '../composables/useFootballers'
import { getUKDateString, nextUKMidnight } from '../utils/dateStreak'

export type AttributeState = 'correct' | 'present' | 'absent'

export interface ScoutHint {
	label: string
	value: string
	icon: string
	/** A word or two before the value in the compact hint row (e.g. "Nation A…") */
	short?: string
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
	/** Price only: whether the target costs more or less */
	arrow?: 'up' | 'down' | null
}

export interface ScoutGuessResult {
	name: string
	club: AttributeChip
	nationality: AttributeChip
	position: AttributeChip
	/** Fantasy price; missing when either player's price isn't known */
	price?: AttributeChip
}

/** What the guesses (and the brief) have taught so far, for the target dossier */
export interface ScoutDossier {
	club: { found?: string; region?: Region; ruledOut: string[] }
	nation: { found?: string; continent?: string; ruledOut: string[] }
	position: { found?: PositionGroup; ruledOut: PositionGroup[] }
	/** In tenths of a million; null when the target's price isn't known */
	price: { found?: number; min: number; max: number } | null
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

	// Was UK wall-clock time read as device time: wrong by the offset outside the UK
	const getNextGameTime = () => nextUKMidnight()
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

			// The roster only has broad positions now (FPL's four), so a stray detailed one
			// like 'Central Midfield' is shown and compared as its group
			const guessPosition = getPositionGroup(player.position) ?? player.position
			const answerPosition = getPositionGroup(answerPlayer.position) ?? answerPlayer.position

			// Close: a club in the same region, a neighbouring position (1.3)
			const answerRegion = regionOf(answerPlayer.club)
			const sameRegion = player.club !== answerPlayer.club && !!answerRegion && regionOf(player.club) === answerRegion
			const guessPrice = priceOf(player.name)
			const answerPrice = priceOf(answerPlayer.name)
			const price = guessPrice !== null && answerPrice !== null ? comparePrice(guessPrice, answerPrice) : null

			return {
				name: player.name,
				club: {
					value: player.club,
					state: compareAttribute(player.club, answerPlayer.club, sameRegion),
				},
				nationality: {
					value: player.nationality,
					state: compareAttribute(player.nationality, answerPlayer.nationality, sameConfederation),
				},
				position: {
					value: guessPosition,
					state: compareAttribute(guessPosition, answerPosition, positionsAreNear(guessPosition, answerPosition)),
				},
				...(price && guessPrice !== null ? { price: { value: formatPrice(guessPrice), state: price.state, arrow: price.arrow } } : {}),
			}
		})
	})

	// The scout's brief: two facts about today's target, before any guess
	const brief = computed(() => {
		const player = getScoutAnswerPlayerForDay(todayStr)
		return player ? scoutBrief(player, getScoutBriefCodeForDay(todayStr)) : null
	})

	// Everything learned so far, from the brief and every guess, for the dossier
	const dossier = computed<ScoutDossier>(() => {
		const answerPrice = (() => {
			const player = getScoutAnswerPlayerForDay(todayStr)
			return player ? priceOf(player.name) : null
		})()
		const d: ScoutDossier = {
			club: { region: brief.value?.region, ruledOut: [] },
			nation: {
				continent: brief.value?.continent ? CONTINENT_NAMES[brief.value.continent].name : undefined,
				ruledOut: [],
			},
			position: { found: brief.value?.position, ruledOut: [] },
			price: answerPrice === null ? null : { ...PRICE_RANGE },
		}
		for (const r of guessResults.value) {
			if (r.club.state === 'correct') d.club.found = r.club.value
			else {
				if (r.club.state === 'present') d.club.region = regionOf(r.club.value) ?? d.club.region
				if (!d.club.ruledOut.includes(r.club.value)) d.club.ruledOut.push(r.club.value)
			}
			if (r.nationality.state === 'correct') d.nation.found = r.nationality.value
			else {
				const confederation = getConfederation(r.nationality.value)
				if (r.nationality.state === 'present' && confederation) d.nation.continent = CONTINENT_NAMES[confederation].name
				if (!d.nation.ruledOut.includes(r.nationality.value)) d.nation.ruledOut.push(r.nationality.value)
			}
			const position = r.position.value as PositionGroup
			if (r.position.state === 'correct') d.position.found = position
			else if (!d.position.ruledOut.includes(position)) d.position.ruledOut.push(position)
			if (d.price && r.price) {
				const guess = priceOf(r.name)
				if (guess === null) continue
				if (r.price.state === 'correct') d.price.found = guess
				else {
					if (r.price.arrow === 'up') d.price.min = Math.max(d.price.min, guess + 1)
					if (r.price.arrow === 'down') d.price.max = Math.min(d.price.max, guess - 1)
					if (r.price.state === 'present') {
						d.price.min = Math.max(d.price.min, guess - PRICE_CLOSE)
						d.price.max = Math.min(d.price.max, guess + PRICE_CLOSE)
					}
				}
			}
		}
		return d
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
		// Stored and compared as the roster's own spelling, so 'joao pedro' is the same
		// guess (and the same answer) as 'João Pedro'
		const canonical = getFullPlayerData(trimmed)?.name ?? trimmed
		const key = normaliseKey(canonical)
		if (guesses.value.some((g) => normaliseKey(g) === key)) {
			setError('Already guessed!')
			return
		}
		guesses.value.push(canonical)

		if (key === normaliseKey(answer)) {
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
	// Clues the brief already gave are skipped, so a hint always tells you something new
	const order = clueOrder(getPuzzleNumber(todayStr)).filter(kind => {
		const facts = brief.value?.facts ?? []
		if (kind === 'continent') return !facts.includes('continent')
		if (kind === 'position') return !facts.includes('position')
		return true
	})

	function clueFor(kind: ScoutClue, player: Footballer): ScoutHint {
		const parts = player.name.trim().split(/\s+/)
		const initial = (word = '') => `${word.charAt(0).toUpperCase()}…`
		switch (kind) {
			case 'continent': {
				const confederation = getConfederation(player.nationality)
				return { label: 'Continent', value: confederation ? CONTINENTS[confederation] : 'Unknown', icon: 'solar:earth-linear' }
			}
			case 'nation':
				return { label: 'Nation starts with', short: 'Nation', value: initial(player.nationality), icon: 'solar:flag-linear' }
			case 'position':
				return { label: 'Position', value: getPositionGroup(player.position) ?? player.position, icon: 'solar:football-linear' }
			case 'first':
				// One-name players (e.g. a Brazilian known by a single name) get the length instead
				return parts.length > 1
					? { label: 'First name starts with', short: 'First name', value: initial(parts[0]), icon: 'solar:user-linear' }
					: { label: 'Name length', short: 'Name', value: `${parts[0]!.length} letters`, icon: 'solar:user-linear' }
			case 'surname':
				return { label: 'Surname starts with', short: 'Surname', value: initial(parts[parts.length - 1]), icon: 'solar:text-square-linear' }
		}
	}

	const hints = computed<ScoutHint[]>(() => {
		const player = getScoutAnswerPlayerForDay(todayStr)
		if (!player) return []
		return order.slice(0, purchasedHints.value).map(kind => clueFor(kind, player))
	})

	const canPurchaseHint = computed(() => !gameOver.value && purchasedHints.value < Math.min(MAX_HINTS, order.length))
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
		brief,
		dossier,

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
