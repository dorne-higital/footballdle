import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalsStore = defineStore('modals', () => {
	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const showInfo = ref(false)
	const showSettings = ref(false)
	const showStats = ref(false)

	// ============================================================================
	// MODAL FUNCTIONS
	// ============================================================================
	function openInfo() {
		closeAll()
		showInfo.value = true
	}

	function closeInfo() {
		showInfo.value = false
	}

	function openSettings() {
		closeAll()
		showSettings.value = true
	}

	function closeSettings() {
		showSettings.value = false
	}

	function openStats() {
		closeAll()
		showStats.value = true
	}

	function closeStats() {
		showStats.value = false
	}

	function closeAll() {
		showInfo.value = false
		showSettings.value = false
		showStats.value = false
	}

	return {
		// State
		showInfo,
		showSettings,
		showStats,
		
		// Functions
		openInfo,
		closeInfo,
		openSettings,
		closeSettings,
		openStats,
		closeStats,
		closeAll,
	}
}) 