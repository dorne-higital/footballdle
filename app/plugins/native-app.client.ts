import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { watch } from 'vue'
import { useThemeStore } from '../stores/theme'

// Native-only setup for the iOS app; does nothing on the website.
export default defineNuxtPlugin(() => {
	if (!Capacitor.isNativePlatform()) return

	const themeStore = useThemeStore()

	// Style.Dark = light status bar text, for dark backgrounds
	watch(
		() => themeStore.currentTheme,
		(theme) => {
			StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light }).catch(() => {})
		},
		{ immediate: true },
	)
})
