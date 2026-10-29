import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { BUILT_IN_THEMES, THEME_VARIABLE_NAMES, getTheme, themeVariables, type Theme } from '../utils/themes'
import { usePurchasesStore } from './purchases'

// The app look (app and website): Floodlights (dark) / Light / Match iPhone, plus the Theme
// Library (utils/themes.ts). The old website theme picker is stores/theme.ts.
export type Appearance = 'dark' | 'light' | 'system'
const APPEARANCE_KEY = 'footballdle-app-appearance'
// A library theme's id, or nothing for Floodlights / Light (which follow `appearance`)
const THEME_KEY = 'footballdle-app-theme'

export const useAppearanceStore = defineStore('appearance', () => {
	const appearance = ref<Appearance>('dark')
	const systemLight = ref(false)
	const theme = ref<string | null>(null)
	// A locked theme being tried on in Settings; cleared when Settings closes
	const preview = ref<string | null>(null)

	const purchases = usePurchasesStore()
	const isApp = useRuntimeConfig().public.isApp

	/** Free themes are for everyone; paid ones need the purchase (or Pro), and only in the app */
	function canUse(t: Theme) {
		if (t.tier === 'free') return true
		return isApp && !!t.productId && purchases.ownsThemeProduct(t.productId)
	}

	// A library theme that's been refunded (or Pro lost) falls back to Floodlights / Light
	const activeTheme = computed<Theme | null>(() => {
		const id = preview.value ?? theme.value
		const t = id ? getTheme(id) : undefined
		if (!t || BUILT_IN_THEMES.includes(t.id)) return null
		return preview.value === t.id || canUse(t) ? t : null
	})

	const isLight = computed(() =>
		activeTheme.value
			? activeTheme.value.mode === 'light'
			: appearance.value === 'light' || (appearance.value === 'system' && systemLight.value),
	)

	/** Which card is ticked in the library */
	const selectedId = computed(() => {
		if (activeTheme.value && !preview.value) return activeTheme.value.id
		if (appearance.value === 'system') return null
		return appearance.value === 'light' ? 'light' : 'floodlights'
	})

	function apply() {
		const root = document.documentElement
		root.classList.toggle('app-light', isLight.value)
		for (const name of THEME_VARIABLE_NAMES) root.style.removeProperty(name)
		const t = activeTheme.value
		root.classList.toggle('app-themed', !!t)
		// Greyscale drops the game colours too (assets/_app-shell.scss)
		root.classList.toggle('app-greyscale', t?.id === 'greyscale')
		if (t) for (const [name, value] of Object.entries(themeVariables(t))) root.style.setProperty(name, value)
		root.style.colorScheme = isLight.value ? 'light' : 'dark'
		// Style.Light = dark status bar text, for light backgrounds
		if (Capacitor.isNativePlatform()) {
			StatusBar.setStyle({ style: isLight.value ? Style.Light : Style.Dark }).catch(() => {})
		}
	}

	function save() {
		try {
			localStorage.setItem(APPEARANCE_KEY, appearance.value)
			if (theme.value) localStorage.setItem(THEME_KEY, theme.value)
			else localStorage.removeItem(THEME_KEY)
		} catch {}
	}

	/** Floodlights / Light / Match iPhone */
	function set(value: Appearance) {
		appearance.value = value
		theme.value = null
		preview.value = null
		save()
		apply()
	}

	/** Picks a theme card: Floodlights and Light set the appearance, the rest the theme */
	function choose(id: string) {
		if (id === 'floodlights' || id === 'light') return set(id === 'light' ? 'light' : 'dark')
		const t = getTheme(id)
		if (!t) return
		if (!canUse(t)) {
			preview.value = id
			apply()
			return
		}
		theme.value = id
		preview.value = null
		save()
		apply()
	}

	function endPreview() {
		if (!preview.value) return
		preview.value = null
		apply()
	}

	function init() {
		try {
			const saved = localStorage.getItem(APPEARANCE_KEY)
			if (saved === 'light' || saved === 'system' || saved === 'dark') appearance.value = saved
			const savedTheme = localStorage.getItem(THEME_KEY)
			if (savedTheme && getTheme(savedTheme)) theme.value = savedTheme
		} catch {}
		const media = window.matchMedia('(prefers-color-scheme: light)')
		systemLight.value = media.matches
		media.addEventListener('change', (e) => {
			systemLight.value = e.matches
			apply()
		})
		apply()
		// Purchases arriving (or a refund) change what's allowed; a buy ends the preview
		watch(
			() => [purchases.isPro, purchases.ownedThemes],
			() => {
				const t = preview.value ? getTheme(preview.value) : undefined
				if (t && canUse(t)) {
					theme.value = t.id
					preview.value = null
					save()
				}
				apply()
			},
		)
	}

	return { appearance, theme, preview, isLight, activeTheme, selectedId, canUse, set, choose, endPreview, init }
})
