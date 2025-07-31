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
	function updateStats(win: boolean) {
		stats.value.gamesPlayed++
		if (win) {
			stats.value.wins++
			stats.value.currentStreak++
			if (stats.value.currentStreak > stats.value.maxStreak) {
				stats.value.maxStreak = stats.value.currentStreak
			}
		} else {
			stats.value.losses++
			stats.value.currentStreak = 0
		}
		saveStats()
	}

	function resetStats() {
		stats.value = {
			gamesPlayed: 0,
			wins: 0,
			losses: 0,
			currentStreak: 0,
			maxStreak: 0,
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
			stats.value = JSON.parse(savedStats)
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