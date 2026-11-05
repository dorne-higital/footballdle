import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getAnswerForDay, getDisplayNumber, isValidFootballer } from '../composables/useFootballers'
import { getUKDateString } from '../utils/dateStreak'
import { readSavedObject } from '../utils/storage'
import { shiftUKDate } from './playStreak'
import { usePurchasesStore } from './purchases'
import { track } from '../utils/appGlance'

// Puzzle archive (1.3, F3): past Dailies, from #1 up to yesterday, never today's. The last
// FREE_DAYS cost a hint each to open (free with Pro); older ones are Pro only. Normal Daily
// rules, six guesses, but no stats, streaks, cards, trophies or Game Center.
export interface ArchiveGame {
	guesses: string[]
	over: boolean
	win: boolean
}

const STORAGE_KEY = 'footballdle-archive'
const MAX_GUESSES = 6
export const FREE_DAYS = 7

export type ArchiveAccess = 'open' | 'hint' | 'pro'

export interface ArchiveDay {
	/** DD/MM/YYYY */
	date: string
	/** YYYY-MM-DD, for the URL */
	iso: string
	number: number
	game: ArchiveGame | null
	access: ArchiveAccess
}

const toIso = (date: string) => date.split('/').reverse().join('-')
const fromIso = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : '')

export const useArchiveStore = defineStore('archive', () => {
	const today = getUKDateString()
	const games = ref<Record<string, ArchiveGame>>({})
	const active = ref('')
	const currentGuess = ref('')
	const errorMessage = ref('')
	let errorTimer: ReturnType<typeof setTimeout> | null = null

	function load() {
		const saved = readSavedObject<Record<string, ArchiveGame>>(STORAGE_KEY)
		games.value = saved && typeof saved === 'object' ? (saved as Record<string, ArchiveGame>) : {}
	}
	if (import.meta.client) load()

	function save() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(games.value))
		} catch {}
	}

	/** Every archive day, newest first */
	const days = computed<ArchiveDay[]>(() => {
		const purchases = usePurchasesStore()
		const list: ArchiveDay[] = []
		for (let back = 1; ; back++) {
			const date = shiftUKDate(today, -back)
			const number = getDisplayNumber(date)
			if (!number) break
			const game = games.value[date] ?? null
			const access: ArchiveAccess = game || purchases.isPro ? 'open' : back <= FREE_DAYS ? 'hint' : 'pro'
			list.push({ date, iso: toIso(date), number, game, access })
		}
		return list
	})

	const day = (iso: string) => days.value.find(d => d.iso === iso)
	const game = computed(() => (active.value ? games.value[active.value] ?? null : null))
	const answer = computed(() => (active.value ? getAnswerForDay(active.value).toUpperCase() : ''))
	const activeDay = computed(() => (active.value ? days.value.find(d => d.date === active.value) ?? null : null))

	/** Opens (paying a hint if it needs one) or resumes a past Daily. False if it can't. */
	function start(iso: string): boolean {
		const date = fromIso(iso)
		const d = date && days.value.find(x => x.date === date)
		if (!d) return false
		active.value = date
		currentGuess.value = ''
		if (games.value[date]) return true
		if (d.access === 'pro') return false
		if (!usePurchasesStore().spendHint()) return false
		games.value = { ...games.value, [date]: { guesses: [], over: false, win: false } }
		save()
		return true
	}

	function setError(msg: string) {
		errorMessage.value = msg
		if (errorTimer) clearTimeout(errorTimer)
		errorTimer = setTimeout(() => (errorMessage.value = ''), 1800)
	}

	function onKey(key: string) {
		const g = game.value
		if (!g || g.over) return
		if (key === 'BACKSPACE') currentGuess.value = currentGuess.value.slice(0, -1)
		else if (key === 'ENTER') submit()
		else if (/^[A-Z]$/.test(key) && currentGuess.value.length < answer.value.length) currentGuess.value += key
	}

	function submit() {
		const g = game.value
		if (!g || g.over) return
		const guess = currentGuess.value.toUpperCase()
		if (guess.length !== answer.value.length) return setError(`Must be ${answer.value.length} letters`)
		// The answer always counts, even if that player has since left the league
		if (guess !== answer.value && !isValidFootballer(guess)) return setError('Not a current Premier League surname')
		if (g.guesses.includes(guess)) return setError('Already guessed!')
		g.guesses.push(guess)
		currentGuess.value = ''
		if (guess === answer.value) g.over = g.win = true
		else if (g.guesses.length >= MAX_GUESSES) g.over = true
		if (g.over) track('archive.finished', { result: g.win ? 'won' : 'lost' })
		save()
	}

	return { games, days, day, active, activeDay, game, answer, currentGuess, errorMessage, maxGuesses: MAX_GUESSES, load, start, onKey }
})
