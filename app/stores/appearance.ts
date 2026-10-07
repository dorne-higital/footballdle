import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

// iOS app only: Dark (Floodlights) / Light / Match iPhone. The website keeps its own
// theme picker (stores/theme.ts).
export type Appearance = 'dark' | 'light' | 'system'
const APPEARANCE_KEY = 'footballdle-app-appearance'

export const useAppearanceStore = defineStore('appearance', () => {
	const appearance = ref<Appearance>('dark')
	const systemLight = ref(false)

	const isLight = computed(() => appearance.value === 'light' || (appearance.value === 'system' && systemLight.value))

	function apply() {
		document.documentElement.classList.toggle('app-light', isLight.value)
		// Style.Light = dark status bar text, for light backgrounds
		if (Capacitor.isNativePlatform()) {
			StatusBar.setStyle({ style: isLight.value ? Style.Light : Style.Dark }).catch(() => {})
		}
	}

	function set(value: Appearance) {
		appearance.value = value
		try {
			localStorage.setItem(APPEARANCE_KEY, value)
		} catch {}
		apply()
	}

	function init() {
		try {
			const saved = localStorage.getItem(APPEARANCE_KEY)
			if (saved === 'light' || saved === 'system' || saved === 'dark') appearance.value = saved
		} catch {}
		const media = window.matchMedia('(prefers-color-scheme: light)')
		systemLight.value = media.matches
		media.addEventListener('change', (e) => {
			systemLight.value = e.matches
			apply()
		})
		apply()
	}

	return { appearance, isLight, set, init }
})
