import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const currentTheme = ref('light') // 'light', 'dark', 'high-contrast', 'pastel', 'chrome', 'glass'

	// ============================================================================
	// THEME FUNCTIONS
	// ============================================================================
	function setTheme(theme: string) {
		currentTheme.value = theme
		applyTheme()
		saveThemeSettings()
	}

	function applyTheme() {
		const root = document.documentElement

		// Remove all theme classes first
		root.classList.remove('dark', 'high-contrast', 'theme-pastel', 'theme-chrome', 'theme-glass')

		// Apply the selected theme
		switch (currentTheme.value) {
			case 'dark':
				root.classList.add('dark')
				break
			case 'high-contrast':
				root.classList.add('high-contrast')
				break
			case 'pastel':
				root.classList.add('theme-pastel')
				break
			case 'chrome':
				root.classList.add('theme-chrome')
				break
			case 'glass':
				root.classList.add('theme-glass')
				break
			default:
				// Light theme (default) - no additional classes needed
				break
		}
	}

	function saveThemeSettings() {
		localStorage.setItem('footballdle-theme', currentTheme.value)
	}

	function loadThemeSettings() {
		const savedTheme = localStorage.getItem('footballdle-theme')
		if (savedTheme && ['light', 'dark', 'high-contrast', 'pastel', 'chrome', 'glass'].includes(savedTheme)) {
			currentTheme.value = savedTheme
		}
		applyTheme()
	}

	function resetThemeSettings() {
		localStorage.removeItem('footballdle-theme')
		currentTheme.value = 'light'
		applyTheme()
	}

	return {
		// State
		currentTheme,
		
		// Functions
		setTheme,
		applyTheme,
		saveThemeSettings,
		loadThemeSettings,
		resetThemeSettings,
	}
}) 