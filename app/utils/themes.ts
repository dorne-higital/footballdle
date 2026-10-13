// The Theme Library (1.3). Floodlights and Light are the app's own look (assets/_app-shell.scss);
// every other theme is a set of colours laid over it as CSS variables (stores/appearance.ts).
// Paid themes are one-off App Store purchases (utils/appStore.ts THEME_PRODUCT_IDS); Pro
// unlocks all of them. Spec: THEMES.md.

import { THEME_PRODUCT_IDS } from './appStore'

export type ThemeTier = 'free' | 'paid' | 'pack'
export type ThemeMode = 'dark' | 'light'

export interface ThemeColours {
	bg: string
	bg2: string
	raised: string
	key: string
	text: string
	text2: string
	primary: string
	onPrimary: string
	success: string
	onSuccess: string
	present: string
	onPresent: string
	absent: string
	onAbsent: string
	border: string
	red: string
	blue: string
}

export interface Theme {
	id: string
	name: string
	tier: ThemeTier
	mode: ThemeMode
	blurb: string
	/** App Store product that unlocks it (pack themes share the Colour Pack) */
	productId?: string
	colours: ThemeColours
	/** Heading font, when the theme brings its own (bundled in nuxt.config.ts) */
	display?: string
	radius?: number
	/** A texture painted behind every screen */
	pattern?: string
}

// The two built-in looks. Their colours here only draw the picker previews; the app itself
// uses the stylesheet so nothing changes for people who never open the library.
const FLOODLIGHTS: ThemeColours = {
	bg: '#07130d', bg2: '#0f2219', raised: '#163126', key: '#1e3329', text: '#eaf5ee', text2: '#8fa89a',
	primary: '#2fe08a', onPrimary: '#04130b', success: '#2fe08a', onSuccess: '#04130b', present: '#f2b84b',
	onPresent: '#1b1203', absent: '#24352d', onAbsent: '#eaf5ee', border: 'rgb(255 255 255 / 8%)', red: '#ff8a80', blue: '#6ea8ff',
}
const LIGHT: ThemeColours = {
	bg: '#f2f6f3', bg2: '#ffffff', raised: '#ffffff', key: '#dbe5df', text: '#10231a', text2: '#55695e',
	primary: '#128d53', onPrimary: '#04130b', success: '#22b36b', onSuccess: '#04130b', present: '#e3a72f',
	onPresent: '#1b1203', absent: '#7b8b82', onAbsent: '#ffffff', border: 'rgb(16 35 26 / 11%)', red: '#c9483d', blue: '#2f6fd6',
}

export const THEMES: Theme[] = [
	// ---------------------------------------------------------------- free
	{ id: 'floodlights', name: 'Floodlights', tier: 'free', mode: 'dark', blurb: 'Night pitch, bright green.', colours: FLOODLIGHTS },
	{ id: 'light', name: 'Light', tier: 'free', mode: 'light', blurb: 'Clean greens on a pale pitch.', colours: LIGHT },
	{
		id: 'pastel', name: 'Pastel', tier: 'free', mode: 'light', blurb: 'Sky blue, soft mint and peach.', radius: 16,
		colours: {
			bg: '#eef6fc', bg2: '#ffffff', raised: '#ffffff', key: '#dbe9f5', text: '#24324a', text2: '#6c7a90',
			primary: '#2b8fd6', onPrimary: '#ffffff', success: '#3cc495', onSuccess: '#06281b', present: '#f6b54a',
			onPresent: '#3a2503', absent: '#94a3b8', onAbsent: '#ffffff', border: '#cfe3f3', red: '#e25563', blue: '#2b8fd6',
		},
		pattern: 'radial-gradient(circle at 92% 4%, #ffe3d6 0 8rem, transparent 16rem), radial-gradient(circle at 6% 96%, #d8f3e8 0 7rem, transparent 15rem)',
	},
	{
		id: 'greyscale', name: 'Greyscale', tier: 'free', mode: 'light', blurb: 'No colour at all. Right, close and wrong by shade.', radius: 10,
		colours: {
			bg: '#f4f4f4', bg2: '#ffffff', raised: '#ffffff', key: '#e2e2e2', text: '#111111', text2: '#5e5e5e',
			primary: '#111111', onPrimary: '#ffffff', success: '#1c1c1c', onSuccess: '#ffffff', present: '#8a8a8a',
			onPresent: '#ffffff', absent: '#cfcfcf', onAbsent: '#111111', border: '#cfcfcf', red: '#111111', blue: '#444444',
		},
	},

	// ---------------------------------------------------------------- paid, £0.99 each
	{
		id: 'retro', name: 'Retro 90s', tier: 'paid', mode: 'dark', productId: THEME_PRODUCT_IDS.retro,
		blurb: 'Shell suits and away kits, with a zig-zag print.', display: "'Bungee', 'Archivo Black', sans-serif", radius: 12,
		colours: {
			bg: '#1c1446', bg2: '#2a1f63', raised: '#35287a', key: '#35287a', text: '#fbf5ff', text2: '#b3a6e0',
			primary: '#ff4f9a', onPrimary: '#1c1446', success: '#1fd6c4', onSuccess: '#062a27', present: '#ffd23f',
			onPresent: '#2b2100', absent: '#43367f', onAbsent: '#fbf5ff', border: 'rgb(255 255 255 / 12%)', red: '#ff6b6b', blue: '#7ab8ff',
		},
		pattern: 'repeating-linear-gradient(135deg, transparent 0 22px, rgb(31 214 196 / 8%) 22px 30px, transparent 30px 52px, rgb(255 79 154 / 8%) 52px 60px)',
	},
	{
		id: 'chalk', name: 'Tactics Chalkboard', tier: 'paid', mode: 'dark', productId: THEME_PRODUCT_IDS.chalk,
		blurb: 'Chalk on the dressing-room board.', display: "'Permanent Marker', 'Archivo Black', cursive", radius: 10,
		colours: {
			bg: '#1e2a25', bg2: '#26342e', raised: '#2f3e37', key: '#2f3e37', text: '#f2f0e6', text2: '#a6b0a8',
			primary: '#f2f0e6', onPrimary: '#1e2a25', success: '#8fd9a8', onSuccess: '#0f2418', present: '#f5d576',
			onPresent: '#2c2306', absent: '#3b4a43', onAbsent: '#f2f0e6', border: 'rgb(242 240 230 / 18%)', red: '#f28b82', blue: '#9cc9f5',
		},
		pattern: 'radial-gradient(circle at 50% 55%, transparent 0 7.4rem, rgb(242 240 230 / 6%) 7.5rem 7.65rem, transparent 7.75rem), linear-gradient(180deg, transparent calc(55% - 1px), rgb(242 240 230 / 6%) calc(55% - 1px) calc(55% + 1px), transparent calc(55% + 1px)), radial-gradient(ellipse at 20% 30%, rgb(242 240 230 / 5%), transparent 45%)',
	},
	{
		id: 'sunday', name: 'Sunday League', tier: 'paid', mode: 'light', productId: THEME_PRODUCT_IDS.sunday,
		blurb: 'Mud, grass and the orange winter ball.', radius: 12,
		colours: {
			bg: '#e8e0cf', bg2: '#f7f2e7', raised: '#fffaf0', key: '#d9cfb9', text: '#2c2418', text2: '#6f6249',
			primary: '#d9620f', onPrimary: '#ffffff', success: '#4c8f3a', onSuccess: '#ffffff', present: '#e8b923',
			onPresent: '#2c2106', absent: '#9a8b6e', onAbsent: '#ffffff', border: 'rgb(44 36 24 / 14%)', red: '#c4472f', blue: '#3b6fb6',
		},
		pattern: 'radial-gradient(circle at 10% 92%, rgb(110 84 46 / 20%) 0 2.5rem, transparent 5rem), radial-gradient(circle at 85% 80%, rgb(110 84 46 / 14%) 0 1.6rem, transparent 3.6rem), radial-gradient(circle at 72% 10%, rgb(110 84 46 / 10%) 0 1.2rem, transparent 2.8rem)',
	},
	{
		id: 'night', name: 'Night Match', tier: 'paid', mode: 'dark', productId: THEME_PRODUCT_IDS.night,
		blurb: 'Midweek under the lights.', radius: 14,
		colours: {
			bg: '#070b1f', bg2: '#10173a', raised: '#18214d', key: '#18214d', text: '#eef1ff', text2: '#8b95c4',
			primary: '#4cc9ff', onPrimary: '#04122a', success: '#4cc9ff', onSuccess: '#04122a', present: '#ff6fb5',
			onPresent: '#2a0618', absent: '#232c5a', onAbsent: '#eef1ff', border: 'rgb(255 255 255 / 10%)', red: '#ff7a7a', blue: '#4cc9ff',
		},
		pattern: 'linear-gradient(155deg, rgb(140 200 255 / 14%) 0, transparent 34%), linear-gradient(205deg, rgb(140 200 255 / 14%) 0, transparent 34%)',
	},
	{
		id: 'golden', name: 'Golden Boot', tier: 'paid', mode: 'dark', productId: THEME_PRODUCT_IDS.golden,
		blurb: 'Black and gold, with silver for close.', display: "'Abril Fatface', Georgia, serif", radius: 12,
		colours: {
			bg: '#0f0d09', bg2: '#1b1711', raised: '#251f16', key: '#251f16', text: '#f6edd7', text2: '#a8997a',
			primary: '#e2b33f', onPrimary: '#1a1306', success: '#e2b33f', onSuccess: '#1a1306', present: '#c7ccd3',
			onPresent: '#1b1d20', absent: '#2e271c', onAbsent: '#f6edd7', border: 'rgb(226 179 63 / 22%)', red: '#e07a5f', blue: '#9db7d6',
		},
		pattern: 'radial-gradient(ellipse at 50% -10%, rgb(226 179 63 / 20%), transparent 55%)',
	},
	{
		id: 'programme', name: 'Classic Programme', tier: 'paid', mode: 'light', productId: THEME_PRODUCT_IDS.programme,
		blurb: 'Newsprint, ink and club red.', display: "'Alfa Slab One', Georgia, serif", radius: 5,
		colours: {
			bg: '#efe7d3', bg2: '#faf5e8', raised: '#fffaf0', key: '#e2d8c0', text: '#1c1913', text2: '#6c6350',
			primary: '#b0261f', onPrimary: '#ffffff', success: '#2d6a40', onSuccess: '#ffffff', present: '#d29a1e',
			onPresent: '#231703', absent: '#8f8676', onAbsent: '#ffffff', border: 'rgb(28 25 19 / 30%)', red: '#b0261f', blue: '#2a4f86',
		},
		pattern: 'radial-gradient(rgb(28 25 19 / 6%) 1px, transparent 1.2px) 0 0 / 7px 7px',
	},

	// ---------------------------------------------------------------- Colour Pack, £2.99 for all six
	{
		id: 'ocean', name: 'Ocean', tier: 'pack', mode: 'dark', productId: THEME_PRODUCT_IDS.colourPack, blurb: 'Deep sea blue and aqua.',
		colours: {
			bg: '#04192b', bg2: '#0b2740', raised: '#12344f', key: '#12344f', text: '#e6f3ff', text2: '#86a5c0',
			primary: '#2ec5d3', onPrimary: '#032027', success: '#2ec5d3', onSuccess: '#032027', present: '#ffb648',
			onPresent: '#2a1a02', absent: '#1b3a55', onAbsent: '#e6f3ff', border: 'rgb(255 255 255 / 10%)', red: '#ff8a80', blue: '#6ec1ff',
		},
	},
	{
		id: 'berry', name: 'Berry', tier: 'pack', mode: 'dark', productId: THEME_PRODUCT_IDS.colourPack, blurb: 'Dark plum, hot pink.',
		colours: {
			bg: '#1f0a1c', bg2: '#2e1029', raised: '#3d1636', key: '#3d1636', text: '#fdeefa', text2: '#c193b8',
			primary: '#ff4fb0', onPrimary: '#2a0420', success: '#5ee0a0', onSuccess: '#062619', present: '#ffc542',
			onPresent: '#2b1e00', absent: '#4a1f43', onAbsent: '#fdeefa', border: 'rgb(255 255 255 / 10%)', red: '#ff8a80', blue: '#9ab8ff',
		},
	},
	{
		id: 'crimson', name: 'Crimson', tier: 'pack', mode: 'dark', productId: THEME_PRODUCT_IDS.colourPack, blurb: 'Dark red, a bit of menace.',
		colours: {
			bg: '#1c0909', bg2: '#2b0f0f', raised: '#3a1515', key: '#3a1515', text: '#fff0ee', text2: '#c79a95',
			primary: '#ff5a4e', onPrimary: '#2a0402', success: '#57d68d', onSuccess: '#062514', present: '#ffc04d',
			onPresent: '#2b1b00', absent: '#4a1c1a', onAbsent: '#fff0ee', border: 'rgb(255 255 255 / 10%)', red: '#ff8a80', blue: '#9ab8ff',
		},
	},
	{
		id: 'tangerine', name: 'Tangerine', tier: 'pack', mode: 'light', productId: THEME_PRODUCT_IDS.colourPack, blurb: 'Warm, light, orange.',
		colours: {
			bg: '#fff3e8', bg2: '#ffffff', raised: '#ffffff', key: '#ffe0c4', text: '#3a1d06', text2: '#7f5636',
			primary: '#e9650f', onPrimary: '#ffffff', success: '#2fae6a', onSuccess: '#06281b', present: '#f7c23a',
			onPresent: '#3a2700', absent: '#b8977a', onAbsent: '#ffffff', border: '#f6d6b8', red: '#c9483d', blue: '#2f6fd6',
		},
	},
	{
		id: 'lemon', name: 'Lemon', tier: 'pack', mode: 'light', productId: THEME_PRODUCT_IDS.colourPack, blurb: 'Bright yellow, black buttons.',
		colours: {
			bg: '#fff8c9', bg2: '#fffdf0', raised: '#ffffff', key: '#f5ea9e', text: '#2d2a10', text2: '#6b6540',
			primary: '#2d2a10', onPrimary: '#ffe94a', success: '#3caf5c', onSuccess: '#06281b', present: '#e8b400',
			onPresent: '#2d2400', absent: '#aaa27a', onAbsent: '#ffffff', border: '#ebdf94', red: '#c9483d', blue: '#2f6fd6',
		},
	},
	{
		id: 'lilac', name: 'Lilac', tier: 'pack', mode: 'light', productId: THEME_PRODUCT_IDS.colourPack, blurb: 'Soft purple, calm.',
		colours: {
			bg: '#f4f0fc', bg2: '#ffffff', raised: '#ffffff', key: '#e4dbf6', text: '#2a2140', text2: '#6b6088',
			primary: '#7b5cd6', onPrimary: '#ffffff', success: '#35b88a', onSuccess: '#06281b', present: '#f0a640',
			onPresent: '#2f1d02', absent: '#a497c4', onAbsent: '#ffffff', border: '#ddd2f3', red: '#c9483d', blue: '#5a7fe0',
		},
	},
]

export const BUILT_IN_THEMES = ['floodlights', 'light']
export const getTheme = (id: string) => THEMES.find(t => t.id === id)

/** The CSS variables a library theme sets, mapped onto the app's existing tokens */
export function themeVariables(theme: Theme): Record<string, string> {
	const c = theme.colours
	const dark = theme.mode === 'dark'
	const vars: Record<string, string> = {
		'--text-primary': c.text,
		'--text-secondary': c.text2,
		'--bg-primary': c.bg,
		'--bg-secondary': c.bg2,
		'--bg-gradient': `linear-gradient(160deg, ${c.bg} 0%, ${c.bg2} 100%)`,
		'--primary-color': c.primary,
		'--secondary-color': c.text,
		'--accent-color': c.primary,
		'--tertiary-color': c.present,
		'--color-success': c.success,
		'--color-present': c.present,
		'--color-absent': c.absent,
		'--on-success': c.onSuccess,
		'--on-present': c.onPresent,
		'--on-primary': c.onPrimary,
		'--on-absent': c.onAbsent,
		'--color-gradient': `linear-gradient(135deg, ${c.success} 0%, color-mix(in srgb, ${c.success} 75%, #000) 100%)`,
		'--subtle-gradient': `linear-gradient(135deg, ${c.raised} 0%, ${c.bg2} 100%)`,
		'--border': c.border,
		'--border-hover': c.primary,
		'--turf-base': c.bg,
		'--turf-stripe': c.bg2,
		'--touchline-color': c.border,
		'--pitchcard-accent-win': c.success,
		'--pitchcard-accent-loss': c.red,
		'--pitchcard-accent-neutral': c.text,
		'--pitchcard-accent-info': c.text2,
		'--scoreboard-bg': `color-mix(in srgb, ${c.bg} 55%, ${c.bg2})`,
		'--scoreboard-fg': c.text,
		'--scoreboard-accent': c.primary,
		'--fl-raised': c.raised,
		'--fl-blue': c.blue,
		'--fl-red': c.red,
		'--fl-glow': `color-mix(in srgb, ${c.primary} 16%, transparent)`,
		'--fl-key': c.key,
		'--fl-key-pressed': `color-mix(in srgb, ${c.key} 80%, ${c.text})`,
		'--fl-grabber': `color-mix(in srgb, ${c.text} 22%, transparent)`,
		'--fl-shadow': dark ? 'rgb(0 0 0 / 60%)' : `color-mix(in srgb, ${c.text} 18%, transparent)`,
		'--theme-pattern': theme.pattern ?? 'none',
	}
	if (theme.display) vars['--font-display'] = theme.display
	if (theme.radius) vars['--global-border-radius'] = `${theme.radius}px`
	return vars
}

/** Every variable any theme can set, so switching back clears them all */
export const THEME_VARIABLE_NAMES = [
	...Object.keys(themeVariables(THEMES[2]!)),
	'--font-display',
	'--global-border-radius',
]
