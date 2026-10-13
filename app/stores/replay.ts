import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { isValidFootballer } from '../composables/useFootballers'
import { getUKDateString } from '../utils/dateStreak'
import { readSavedObject } from '../utils/storage'
import { currentSeason, useCardsStore } from './cards'
import { usePurchasesStore } from './purchases'

// Player Cards: replaying a missed card. One a day, only once today's Daily is
// finished, and it costs a hint (free with Pro). Normal Daily rules; no stats, streaks
// or Game Center scores, just the card.
interface SavedReplay {
	date: string
	id: string
	guesses: string[]
	over: boolean
	win: boolean
}

const STORAGE_KEY = 'footballdle-replay'
const MAX_GUESSES = 6

export const useReplayStore = defineStore('replay', () => {
	const today = getUKDateString()
	const state = ref<SavedReplay | null>(null)
	const currentGuess = ref('')
	const errorMessage = ref('')
	let errorTimer: ReturnType<typeof setTimeout> | null = null

	function load() {
		const s = readSavedObject<SavedReplay>(STORAGE_KEY)
		state.value =
			s && s.date === today && typeof s.id === 'string'
				? { date: s.date, id: s.id, guesses: Array.isArray(s.guesses) ? s.guesses : [], over: !!s.over, win: !!s.win }
				: null
	}
	if (import.meta.client) load()

	function save() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
		} catch {}
	}

	const dailyFinished = () => {
		const g = readSavedObject('footballdle-game')
		return g?.date === today && !!g.gameOver
	}

	/** Why a new replay can't start right now ('' when it can) */
	const blocker = computed(() => {
		const purchases = usePurchasesStore()
		if (!currentSeason()) return 'No card season yet.'
		if (!dailyFinished()) return "Finish today's Daily to unlock a replay."
		if (state.value?.over) return "You've used today's replay. Another one tomorrow."
		if (state.value) return ''
		if (!purchases.isPro && purchases.hintBank <= 0) return 'A replay costs a hint, and your bank is empty.'
		return ''
	})

	const season = computed(() => currentSeason())
	const card = computed(() => (state.value ? season.value?.season.cards[state.value.id] : undefined))
	const answer = computed(() => card.value?.surname.toUpperCase() ?? '')

	/** Starts (paying a hint) or resumes a replay of this card. False if it can't. */
	function start(id: string): boolean {
		if (state.value?.id === id) return true
		if (blocker.value || state.value) return false
		const label = season.value?.label
		if (!label || !useCardsStore().missedIds(label).has(id)) return false
		if (!usePurchasesStore().spendHint()) return false
		state.value = { date: today, id, guesses: [], over: false, win: false }
		save()
		return true
	}

	function setError(msg: string) {
		errorMessage.value = msg
		if (errorTimer) clearTimeout(errorTimer)
		errorTimer = setTimeout(() => (errorMessage.value = ''), 1800)
	}

	function onKey(key: string) {
		const s = state.value
		if (!s || s.over) return
		const len = answer.value.length
		if (key === 'BACKSPACE') currentGuess.value = currentGuess.value.slice(0, -1)
		else if (key === 'ENTER') submit()
		else if (/^[A-Z]$/.test(key) && currentGuess.value.length < len) currentGuess.value += key
	}

	function submit() {
		const s = state.value
		if (!s || s.over) return
		const guess = currentGuess.value.toUpperCase()
		if (guess.length !== answer.value.length) return setError(`Must be ${answer.value.length} letters`)
		if (!isValidFootballer(guess)) return setError('Not a current Premier League surname')
		if (s.guesses.includes(guess)) return setError('Already guessed!')
		s.guesses.push(guess)
		currentGuess.value = ''
		if (guess === answer.value) {
			s.over = true
			s.win = true
			useCardsStore().collectReplay(s.id, s.guesses.length)
		} else if (s.guesses.length >= MAX_GUESSES) {
			s.over = true
		}
		save()
	}

	return { state, card, answer, currentGuess, errorMessage, blocker, maxGuesses: MAX_GUESSES, load, start, onKey }
})
