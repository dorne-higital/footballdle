import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const isDarkTheme = ref(false)
	const isHighContrast = ref(false)

	// ============================================================================
	// THEME FUNCTIONS
	// ============================================================================
	function toggleTheme() {
		isDarkTheme.value = !isDarkTheme.value
		applyTheme()
		saveThemeSettings()
	}

	function toggleHighContrast() {
		isHighContrast.value = !isHighContrast.value
		applyTheme()
		saveThemeSettings()
	}

	function applyTheme() {
		const root = document.documentElement

		// Remove all theme classes first
		root.classList.remove('dark', 'high-contrast')

		// Apply dark theme
		if (isDarkTheme.value) {
			root.classList.add('dark')
		}

		// Apply high contrast theme
		if (isHighContrast.value) {
			root.classList.add('high-contrast')
		}
	}

	function saveThemeSettings() {
		localStorage.setItem('footballdle-theme', isDarkTheme.value ? 'dark' : 'light')
		localStorage.setItem('footballdle-high-contrast', isHighContrast.value ? 'true' : 'false')
	}

	function loadThemeSettings() {
		const savedTheme = localStorage.getItem('footballdle-theme')
		const savedHighContrast = localStorage.getItem('footballdle-high-contrast')

		if (savedTheme === 'dark') {
			isDarkTheme.value = true
		}

		if (savedHighContrast === 'true') {
			isHighContrast.value = true
		}

		applyTheme()
	}

	function resetThemeSettings() {
		localStorage.removeItem('footballdle-theme')
		localStorage.removeItem('footballdle-high-contrast')
		isDarkTheme.value = false
		isHighContrast.value = false
		applyTheme()
	}

	return {
		// State
		isDarkTheme,
		isHighContrast,
		
		// Functions
		toggleTheme,
		toggleHighContrast,
		applyTheme,
		saveThemeSettings,
		loadThemeSettings,
		resetThemeSettings,
	}
}) 