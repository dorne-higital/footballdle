import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getUKDateString, wasYesterday } from '../utils/dateStreak'
import { useModeStatsStore } from './modeStats'

const STORAGE_KEY = 'footballdle-play-streak'

interface PlayStreakState {
	current: number
	best: number
	/** DD/MM/YYYY of the last day any game was finished */
	lastDate: string
}

// "Matchday streak": consecutive days on which at least one game (Daily, Scout,
// Spot or Challenge) was finished, win or lose. The per-mode win streaks live in
// modeStats; this one rewards turning up.
export const usePlayStreakStore = defineStore('playStreak', () => {
	const current = ref(0)
	const best = ref(0)
	const lastDate = ref('')
	let loaded = false

	// A streak only counts while it's still alive: played today or yesterday
	const activeStreak = computed(() => {
		const today = getUKDateString()
		return lastDate.value === today || (lastDate.value && wasYesterday(lastDate.value, today)) ? current.value : 0
	})
	const playedToday = computed(() => lastDate.value === getUKDateString())

	function save() {
		try {
			const state: PlayStreakState = { current: current.value, best: best.value, lastDate: lastDate.value }
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
		} catch {}
	}

	/** First run: start from existing history rather than zero. A daily win streak of N
	 *  means N consecutive days played, so it's a safe lower bound. */
	function seedFromModeStats() {
		const today = getUKDateString()
		const modes = (['daily', 'scout', 'spotball'] as const).map((id) => {
			const store = useModeStatsStore(id)
			store.loadStats()
			return store.stats
		})
		const alive = (date: string) => !!date && (date === today || wasYesterday(date, today))
		const recent = modes.filter(s => alive(s.lastPlayedDate))
		const anyToday = recent.some(s => s.lastPlayedDate === today)
		// A streak that ended yesterday carries on if something else was played today
		const runs = recent.map(s => s.currentStreak + (anyToday && s.lastPlayedDate !== today && s.currentStreak > 0 ? 1 : 0))
		current.value = recent.length ? Math.max(1, ...runs) : 0
		best.value = Math.max(current.value, ...modes.map(s => s.maxStreak))
		lastDate.value = anyToday ? today : recent.length ? recent[0]!.lastPlayedDate : ''
		save()
	}

	function load() {
		if (loaded || !import.meta.client) return
		loaded = true
		try {
			const saved = localStorage.getItem(STORAGE_KEY)
			if (saved) {
				const state = JSON.parse(saved) as PlayStreakState
				current.value = state.current || 0
				best.value = state.best || 0
				lastDate.value = state.lastDate || ''
				return
			}
		} catch {}
		seedFromModeStats()
	}

	/** Call when any game is finished */
	function markPlayed(dateStr = getUKDateString()) {
		load()
		if (lastDate.value === dateStr) return
		current.value = lastDate.value && wasYesterday(lastDate.value, dateStr) ? current.value + 1 : 1
		best.value = Math.max(best.value, current.value)
		lastDate.value = dateStr
		save()
	}

	return { current, best, lastDate, activeStreak, playedToday, load, markPlayed }
})
