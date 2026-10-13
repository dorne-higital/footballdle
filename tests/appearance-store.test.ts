import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }))
vi.mock('@capacitor/status-bar', () => ({ StatusBar: { setStyle: async () => {} }, Style: { Light: 'LIGHT', Dark: 'DARK' } }))

// Just enough of the browser for the store: storage, the root element and matchMedia
const storage = new Map<string, string>()
globalThis.localStorage = {
	getItem: (k: string) => storage.get(k) ?? null,
	setItem: (k: string, v: string) => void storage.set(k, v),
	removeItem: (k: string) => void storage.delete(k),
	clear: () => storage.clear(),
	key: () => null,
	length: 0,
} as Storage

const classes = new Set<string>()
const vars = new Map<string, string>()
globalThis.document = {
	documentElement: {
		classList: { toggle: (c: string, on: boolean) => (on ? classes.add(c) : classes.delete(c)) },
		style: {
			setProperty: (k: string, v: string) => void vars.set(k, v),
			removeProperty: (k: string) => void vars.delete(k),
			colorScheme: '',
		},
	},
} as unknown as Document
globalThis.window = { matchMedia: () => ({ matches: false, addEventListener: () => {} }) } as unknown as Window & typeof globalThis

let isApp = true
vi.stubGlobal('useRuntimeConfig', () => ({ public: { isApp, appShell: true } }))

const { useAppearanceStore } = await import('../app/stores/appearance')
const { usePurchasesStore } = await import('../app/stores/purchases')

function fresh() {
	setActivePinia(createPinia())
	const appearance = useAppearanceStore()
	appearance.init()
	return { appearance, purchases: usePurchasesStore() }
}

describe('appearance store: Theme Library', () => {
	beforeEach(() => {
		storage.clear()
		classes.clear()
		vars.clear()
		isApp = true
	})

	it('starts on Floodlights with no theme colours set', () => {
		const { appearance } = fresh()
		expect(appearance.selectedId).toBe('floodlights')
		expect(vars.size).toBe(0)
		expect(classes.has('app-light')).toBe(false)
	})

	it('free themes switch straight on and are remembered', () => {
		const { appearance } = fresh()
		appearance.choose('pastel')
		expect(appearance.selectedId).toBe('pastel')
		expect(vars.get('--bg-primary')).toBe('#eef6fc')
		expect(classes.has('app-light')).toBe(true)
		expect(storage.get('footballdle-app-theme')).toBe('pastel')
		const again = fresh().appearance
		expect(again.activeTheme?.id).toBe('pastel')
	})

	it('Floodlights and Light clear the theme and its colours', () => {
		const { appearance } = fresh()
		appearance.choose('greyscale')
		appearance.choose('light')
		expect(appearance.theme).toBeNull()
		expect(appearance.appearance).toBe('light')
		expect(vars.size).toBe(0)
		expect(classes.has('app-light')).toBe(true)
	})

	it('a locked theme is only tried on, and trying ends without changing the saved one', () => {
		const { appearance } = fresh()
		appearance.choose('retro')
		expect(appearance.preview).toBe('retro')
		expect(vars.get('--primary-color')).toBe('#ff4f9a')
		expect(vars.get('--font-display')).toContain('Bungee')
		expect(storage.has('footballdle-app-theme')).toBe(false)
		appearance.endPreview()
		expect(appearance.preview).toBeNull()
		expect(vars.size).toBe(0)
	})

	it('buying while trying it on keeps it', async () => {
		const { appearance, purchases } = fresh()
		appearance.choose('golden')
		purchases.ownedThemes = ['theme_golden']
		await nextTick()
		expect(appearance.preview).toBeNull()
		expect(appearance.theme).toBe('golden')
		expect(storage.get('footballdle-app-theme')).toBe('golden')
	})

	it('the Colour Pack unlocks all six colours, and Pro unlocks everything', () => {
		const { appearance, purchases } = fresh()
		purchases.ownedThemes = ['theme_colours']
		appearance.choose('lemon')
		expect(appearance.theme).toBe('lemon')
		appearance.choose('night')
		expect(appearance.preview).toBe('night')
		purchases.isPro = true
		appearance.choose('night')
		expect(appearance.theme).toBe('night')
	})

	it('falls back to Floodlights if the purchase goes (a refund)', async () => {
		const { appearance, purchases } = fresh()
		purchases.ownedThemes = ['theme_chalk']
		appearance.choose('chalk')
		expect(appearance.activeTheme?.id).toBe('chalk')
		purchases.ownedThemes = []
		await nextTick()
		expect(appearance.activeTheme).toBeNull()
		expect(vars.size).toBe(0)
	})

	it('keeps paid themes to the app: on the website they can only be tried on', () => {
		isApp = false
		const { appearance, purchases } = fresh()
		purchases.ownedThemes = ['theme_retro']
		appearance.choose('retro')
		expect(appearance.theme).toBeNull()
		expect(appearance.preview).toBe('retro')
	})
})
