import { useAccessibilityStore } from '../stores/accessibility'

// Settings > Accessibility: high-contrast tiles, text size and haptics, before the first screen
export default defineNuxtPlugin(() => {
	useAccessibilityStore().load()
})
