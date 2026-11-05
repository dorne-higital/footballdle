import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getUKDateString, wasYesterday } from '../utils/dateStreak'
import { useModeStatsStore } from './modeStats'
import { usePurchasesStore } from './purchases'

const STORAGE_KEY = 'footballdle-play-streak'

interface PlayStreakState {
	current: number
	best: number
	/** DD/MM/YYYY of the last day any game was finished (or a shield covered) */
	lastDate: string
	/** Streak Shields held (1.3, F6) */
	shields?: number
	/** The day a shield last covered, DD/MM/YYYY, and whether the home has said so */
	shieldedDate?: string
	shieldSeen?: boolean
	/** Days in a row actually played, never shielded: what the Matchday trophies count */
	realCurrent?: number
	realBest?: number
}

// Streak Shields: one earned for every 7 days of Matchday streak, held up to 2 (3 with
// Pro). Missing a single day spends one automatically, so the streak carries on. They only
// protect the Matchday streak, never a mode's win streak, and the Matchday trophies count
// real days played (realBest), so a shield can't earn one.
export const SHIELD_EVERY = 7
export const SHIELD_CAP = 2
export const SHIELD_CAP_PRO = 3

/** DD/MM/YYYY, a whole number of calendar days after (or before) another */
export function shiftUKDate(dateStr: string, days: number): string {
	const [d, m, y] = dateStr.split('/').map(Number)
	const t = new Date(Date.UTC(y!, m! - 1, d! + days))
	return `${String(t.getUTCDate()).padStart(2, '0')}/${String(t.getUTCMonth() + 1).padStart(2, '0')}/${t.getUTCFullYear()}`
}

// "Matchday streak": consecutive days on which at least one game (Daily, Scout, Spot
// or The Grid; stores/grid.ts marks its own) was finished, win or lose. The per-mode win streaks live in
// modeStats; this one rewards turning up.
export const usePlayStreakStore = defineStore('playStreak', () => {
	const current = ref(0)
	const best = ref(0)
	const lastDate = ref('')
	const shields = ref(0)
	const shieldedDate = ref('')
	const shieldSeen = ref(true)
	const realCurrent = ref(0)
	const realBest = ref(0)
	let loaded = false
	const shieldCap = () => (usePurchasesStore().isPro ? SHIELD_CAP_PRO : SHIELD_CAP)

	// A streak only counts while it's still alive: played today or yesterday
	const activeStreak = computed(() => {
		const today = getUKDateString()
		return lastDate.value === today || (lastDate.value && wasYesterday(lastDate.value, today)) ? current.value : 0
	})
	const playedToday = computed(() => lastDate.value === getUKDateString())

	function save() {
		try {
			const state: PlayStreakState = {
				current: current.value,
				best: best.value,
				lastDate: lastDate.value,
				shields: shields.value,
				shieldedDate: shieldedDate.value,
				shieldSeen: shieldSeen.value,
				realCurrent: realCurrent.value,
				realBest: realBest.value,
			}
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
		realCurrent.value = current.value
		realBest.value = best.value
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
				shields.value = state.shields || 0
				shieldedDate.value = state.shieldedDate || ''
				shieldSeen.value = state.shieldSeen !== false
				// Before shields existed every day was a real one
				realCurrent.value = state.realCurrent ?? current.value
				realBest.value = state.realBest ?? best.value
				spendShield()
				return
			}
		} catch {}
		seedFromModeStats()
	}

	/** Exactly one day missed and a shield in hand: it covers yesterday, so the streak is
	 *  still alive today. Runs when the streak loads (the app reloads at UK midnight) and
	 *  before a game counts. */
	function spendShield(today = getUKDateString()) {
		if (!lastDate.value || current.value < 1 || shields.value < 1) return
		const yesterday = shiftUKDate(today, -1)
		if (lastDate.value !== shiftUKDate(today, -2)) return
		shields.value--
		lastDate.value = yesterday
		shieldedDate.value = yesterday
		shieldSeen.value = false
		realCurrent.value = 0
		save()
	}

	/** Call when any game is finished */
	function markPlayed(dateStr = getUKDateString()) {
		load()
		spendShield(dateStr)
		if (lastDate.value === dateStr) return
		const continues = !!lastDate.value && wasYesterday(lastDate.value, dateStr)
		current.value = continues ? current.value + 1 : 1
		best.value = Math.max(best.value, current.value)
		// A shielded day breaks the real run, which restarts today
		realCurrent.value = continues && shieldedDate.value !== lastDate.value ? realCurrent.value + 1 : 1
		realBest.value = Math.max(realBest.value, realCurrent.value)
		if (current.value % SHIELD_EVERY === 0) shields.value = Math.min(shieldCap(), shields.value + 1)
		lastDate.value = dateStr
		save()
	}

	/** The home's "Streak saved" note has been seen */
	function dismissShieldNote() {
		shieldSeen.value = true
		save()
	}

	return {
		current,
		best,
		lastDate,
		activeStreak,
		playedToday,
		shields,
		shieldedDate,
		shieldSeen,
		realBest,
		load,
		markPlayed,
		spendShield,
		dismissShieldNote,
	}
})
