import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStatsStore = defineStore('stats', () => {
	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const stats = ref({
		gamesPlayed: 0,
		wins: 0,
		losses: 0,
		currentStreak: 0,
		maxStreak: 0,
		lastPlayedDate: '',
		guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 } as Record<string, number>,
	})

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const winPercentage = computed(() => {
		if (stats.value.gamesPlayed === 0) return 0
		return Math.round((stats.value.wins / stats.value.gamesPlayed) * 100)
	})

	// ============================================================================
	// STATS FUNCTIONS
	// ============================================================================
	function wasYesterday(prevDateStr: string, todayStr: string): boolean {
		// Both are DD/MM/YYYY format
		const [pd, pm, py] = prevDateStr.split('/').map(Number)
		const [td, tm, ty] = todayStr.split('/').map(Number)
		const prev = new Date(py, pm - 1, pd)
		const today = new Date(ty, tm - 1, td)
		return today.getTime() - prev.getTime() === 24 * 60 * 60 * 1000
	}

	function updateStats(win: boolean, guessCount?: number, dateStr?: string) {
		// Prevent duplicate recording if already saved for this date
		if (dateStr && stats.value.lastPlayedDate === dateStr) return

		stats.value.gamesPlayed++

		if (win) {
			stats.value.wins++
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
			if (guessCount && guessCount >= 1 && guessCount <= 6) {
				const key = String(guessCount)
				stats.value.guessDistribution[key] = (stats.value.guessDistribution[key] || 0) + 1
			}
		} else {
			stats.value.losses++
			stats.value.currentStreak = 0
		}

		if (dateStr) stats.value.lastPlayedDate = dateStr
		saveStats()
	}

	function resetStats() {
		stats.value = {
			gamesPlayed: 0,
			wins: 0,
			losses: 0,
			currentStreak: 0,
			maxStreak: 0,
			lastPlayedDate: '',
			guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
		}
		saveStats()
	}

	// ============================================================================
	// LOCAL STORAGE FUNCTIONS
	// ============================================================================
	function saveStats() {
		localStorage.setItem('footballdle-stats', JSON.stringify(stats.value))
	}

	function loadStats() {
		const savedStats = localStorage.getItem('footballdle-stats')
		if (savedStats) {
			const parsed = JSON.parse(savedStats)
			stats.value = {
				...stats.value,
				...parsed,
				// Migrate old saves that don't have these fields
				guessDistribution: parsed.guessDistribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
				lastPlayedDate: parsed.lastPlayedDate || '',
			}
		}
	}

	return {
		// State
		stats,

		// Computed
		winPercentage,

		// Functions
		updateStats,
		resetStats,
		saveStats,
		loadStats,
	}
})
