import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setHapticsEnabled } from '../composables/useHaptics'

// Settings > Accessibility: saved on the device, applied to <html> so plain CSS can follow
// (data-contrast, data-text-size). See assets/_accessibility.scss.
// Large is as far as the Daily board and keyboard still fit on an iPhone SE
export type TextSize = 'default' | 'large'
export const TEXT_SIZES: { id: TextSize; label: string }[] = [
	{ id: 'default', label: 'Default' },
	{ id: 'large', label: 'Large' },
]

const CONTRAST_KEY = 'footballdle-high-contrast'
const HAPTICS_KEY = 'footballdle-haptics'
const TEXT_SIZE_KEY = 'footballdle-text-size'
const RELAXED_KEY = 'footballdle-relaxed-timer'

export const useAccessibilityStore = defineStore('accessibility', () => {
	/** Orange and blue tiles instead of green and amber (close letters carry a dot in every theme) */
	const highContrast = ref(false)
	const haptics = ref(true)
	const textSize = ref<TextSize>('default')
	/** Spot the Baller: longer rounds; scores stay off its Game Center leaderboard */
	const relaxedTimer = ref(false)

	function apply() {
		if (!import.meta.client) return
		const root = document.documentElement
		if (highContrast.value) root.dataset.contrast = 'high'
		else delete root.dataset.contrast
		if (textSize.value === 'default') delete root.dataset.textSize
		else root.dataset.textSize = textSize.value
		setHapticsEnabled(haptics.value)
	}

	function save() {
		try {
			localStorage.setItem(CONTRAST_KEY, highContrast.value ? '1' : '0')
			localStorage.setItem(HAPTICS_KEY, haptics.value ? '1' : '0')
			localStorage.setItem(TEXT_SIZE_KEY, textSize.value)
			localStorage.setItem(RELAXED_KEY, relaxedTimer.value ? '1' : '0')
		} catch {}
	}

	function load() {
		try {
			highContrast.value = localStorage.getItem(CONTRAST_KEY) === '1'
			haptics.value = localStorage.getItem(HAPTICS_KEY) !== '0'
			const size = localStorage.getItem(TEXT_SIZE_KEY)
			if (TEXT_SIZES.some(s => s.id === size)) textSize.value = size as TextSize
			relaxedTimer.value = localStorage.getItem(RELAXED_KEY) === '1'
		} catch {}
		apply()
	}

	function update(patch: Partial<{ highContrast: boolean; haptics: boolean; textSize: TextSize; relaxedTimer: boolean }>) {
		if (patch.highContrast !== undefined) highContrast.value = patch.highContrast
		if (patch.haptics !== undefined) haptics.value = patch.haptics
		if (patch.textSize !== undefined) textSize.value = patch.textSize
		if (patch.relaxedTimer !== undefined) relaxedTimer.value = patch.relaxedTimer
		save()
		apply()
	}

	return { highContrast, haptics, textSize, relaxedTimer, load, update }
})
