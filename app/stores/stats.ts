import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useFirestore } from '../composables/useFirestore'

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
		lastGameCompleted: null as string | null,
	})

	const isLoading = ref(false)

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
	async function updateStats(win: boolean) {
		stats.value.gamesPlayed++
		if (win) {
			stats.value.wins++
			stats.value.currentStreak++
			if (stats.value.currentStreak > stats.value.maxStreak) {
				stats.value.maxStreak = stats.value.currentStreak
			}
			// Add last game completed date for cross-device sync
			stats.value.lastGameCompleted = new Date().toDateString()
		} else {
			stats.value.losses++
			stats.value.currentStreak = 0
		}
		
		// Save stats based on user authentication status
		await saveStats()
	}

	async function resetStats() {
		stats.value = {
			gamesPlayed: 0,
			wins: 0,
			losses: 0,
			currentStreak: 0,
			maxStreak: 0,
			lastGameCompleted: null,
		}
		await saveStats()
	}

	// ============================================================================
	// SAVE/LOAD FUNCTIONS
	// ============================================================================
	async function saveStats() {
		const authStore = useAuthStore()
		
		if (authStore.isAuthenticated && authStore.user) {
			// Save to Firebase for authenticated users
			try {
				const { saveGameStats } = useFirestore()
				await saveGameStats(authStore.user.uid, stats.value)
			} catch (error) {
				// Fallback to localStorage if Firebase fails
				saveStatsToLocal()
			}
		} else {
			// Save to localStorage for guests
			saveStatsToLocal()
		}
	}

	async function loadStats() {
		const authStore = useAuthStore()
		
		if (authStore.isAuthenticated && authStore.user) {
			// Load from Firebase for authenticated users
			try {
				isLoading.value = true
				const { getGameStats } = useFirestore()
				const firebaseStats = await getGameStats(authStore.user.uid)
				
				if (firebaseStats) {
					stats.value = {
						gamesPlayed: firebaseStats.gamesPlayed || 0,
						wins: firebaseStats.wins || 0,
						losses: firebaseStats.losses || 0,
						currentStreak: firebaseStats.currentStreak || 0,
						maxStreak: firebaseStats.maxStreak || 0,
						lastGameCompleted: firebaseStats.lastGameCompleted || null,
					}
				} else {
					// Initialize with default values
					stats.value = {
						gamesPlayed: 0,
						wins: 0,
						losses: 0,
						currentStreak: 0,
						maxStreak: 0,
						lastGameCompleted: null,
					}
				}
			} catch (error) {
				// Fallback to localStorage if Firebase fails
				loadStatsFromLocal()
			} finally {
				isLoading.value = false
			}
		} else {
			// Load from localStorage for guests
			loadStatsFromLocal()
		}
	}

	// ============================================================================
	// LOCAL STORAGE FUNCTIONS (for guests and fallback)
	// ============================================================================
	function saveStatsToLocal() {
		localStorage.setItem('footballdle-stats', JSON.stringify(stats.value))
	}

	function loadStatsFromLocal() {
		const savedStats = localStorage.getItem('footballdle-stats')
		if (savedStats) {
			stats.value = JSON.parse(savedStats)
		}
	}

	// ============================================================================
	// MIGRATION FUNCTIONS
	// ============================================================================
	async function migrateLocalStatsToFirebase() {
		const authStore = useAuthStore()
		
		if (!authStore.isAuthenticated || !authStore.user) {
			return
		}

		try {
			// Check if user already has Firebase stats
			const { getGameStats, saveGameStats } = useFirestore()
			const firebaseStats = await getGameStats(authStore.user.uid)
			
			if (firebaseStats) {
				return
			}

			// Load local stats
			const savedStats = localStorage.getItem('footballdle-stats')
			if (savedStats) {
				const localStats = JSON.parse(savedStats)
				
				// Save to Firebase
				await saveGameStats(authStore.user.uid, localStats)
				
				// Update current stats
				stats.value = localStats
			}
		} catch (error) {
			// Silent fail
		}
	}

	return {
		// State
		stats,
		isLoading,
		
		// Computed
		winPercentage,
		
		// Functions
		updateStats,
		resetStats,
		saveStats,
		loadStats,
		migrateLocalStatsToFirebase,
	}
}) 