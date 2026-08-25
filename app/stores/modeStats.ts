import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wasYesterday } from '../utils/dateStreak'

export type ModeId = 'daily' | 'scout' | 'spotball' | 'challenge'

export interface ModeStats {
	gamesPlayed: number
	wins: number
	losses: number
	currentStreak: number
	maxStreak: number
	lastPlayedDate: string
	guessDistribution: Record<string, number>
	recentForm: boolean[]
	bestTime?: number
	totalTime?: number
}

const RECENT_FORM_LIMIT = 10

function defaultStats(): ModeStats {
	return {
		gamesPlayed: 0,
		wins: 0,
		losses: 0,
		currentStreak: 0,
		maxStreak: 0,
		lastPlayedDate: '',
		guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
		recentForm: [],
	}
}

// One Pinia store instance per mode, keyed by id — repeated calls with the
// same modeId return the same underlying store (Pinia caches by store id).
export function useModeStatsStore(modeId: ModeId) {
	return defineStore(`modeStats-${modeId}`, () => {
		const stats = ref<ModeStats>(defaultStats())

		const winPercentage = computed(() => {
			if (stats.value.gamesPlayed === 0) return 0
			return Math.round((stats.value.wins / stats.value.gamesPlayed) * 100)
		})

		// unlimitedPerDay modes (Challenge) can be played more than once a day:
		// every game is recorded, but the streak only advances once per calendar
		// day, and a later same-day loss doesn't wipe a streak already earned
		// today. Daily/Scout (default) keep the original one-game-a-day guard.
		function updateStats(
			win: boolean,
			guessCount?: number,
			dateStr?: string,
			extra?: { timeUsed?: number; unlimitedPerDay?: boolean },
		) {
			const timeUsed = extra?.timeUsed
			const unlimitedPerDay = extra?.unlimitedPerDay ?? false

			if (!unlimitedPerDay && dateStr && stats.value.lastPlayedDate === dateStr) return

			stats.value.gamesPlayed++
			stats.value.recentForm.push(win)
			if (stats.value.recentForm.length > RECENT_FORM_LIMIT) stats.value.recentForm.shift()

			if (win) {
				stats.value.wins++
				const alreadyStreakedToday = unlimitedPerDay && !!dateStr && stats.value.lastPlayedDate === dateStr
				if (!alreadyStreakedToday) {
					const hadYesterday =
						stats.value.lastPlayedDate && dateStr ? wasYesterday(stats.value.lastPlayedDate, dateStr) : false
					const isFirst = !stats.value.lastPlayedDate
					if (isFirst || hadYesterday) {
						stats.value.currentStreak++
					} else {
						stats.value.currentStreak = 1
					}
					if (stats.value.currentStreak > stats.value.maxStreak) {
						stats.value.maxStreak = stats.value.currentStreak
					}
				}
				if (guessCount && guessCount >= 1 && guessCount <= 6) {
					const key = String(guessCount)
					stats.value.guessDistribution[key] = (stats.value.guessDistribution[key] || 0) + 1
				}
				if (timeUsed !== undefined) {
					if (!stats.value.bestTime || timeUsed < stats.value.bestTime) {
						stats.value.bestTime = timeUsed
					}
				}
			} else {
				stats.value.losses++
				const alreadyStreakedToday = unlimitedPerDay && !!dateStr && stats.value.lastPlayedDate === dateStr
				if (!alreadyStreakedToday) {
					stats.value.currentStreak = 0
				}
			}

			if (timeUsed !== undefined) {
				stats.value.totalTime = (stats.value.totalTime || 0) + timeUsed
			}

			if (dateStr) stats.value.lastPlayedDate = dateStr
			saveStats()
		}

		function resetStats() {
			stats.value = defaultStats()
			saveStats()
		}

		function saveStats() {
			localStorage.setItem(`footballdle-stats-${modeId}`, JSON.stringify(stats.value))
		}

		function loadStats() {
			const saved = localStorage.getItem(`footballdle-stats-${modeId}`)
			if (saved) {
				const parsed = JSON.parse(saved)
				stats.value = {
					...defaultStats(),
					...parsed,
					guessDistribution: parsed.guessDistribution || defaultStats().guessDistribution,
					recentForm: parsed.recentForm || [],
				}
			}
		}

		return {
			stats,
			winPercentage,
			updateStats,
			resetStats,
			saveStats,
			loadStats,
		}
	})()
}
