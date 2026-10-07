// The iOS app's top-level screens: each shows the tab bar and no back button
export const APP_TABS = [
	{ to: '/', label: 'Play', icon: 'solar:play-circle-linear', iconActive: 'solar:play-circle-bold' },
	{ to: '/stats', label: 'Stats', icon: 'solar:chart-2-linear', iconActive: 'solar:chart-2-bold' },
	{ to: '/trophies', label: 'Trophies', icon: 'solar:cup-star-linear', iconActive: 'solar:cup-star-bold' },
	{ to: '/settings', label: 'Settings', icon: 'solar:settings-linear', iconActive: 'solar:settings-bold' },
] as const

/** The tab a path belongs to, or null for screens that sit above the tabs */
export function tabFor(path: string): string | null {
	const p = path.replace(/\/+$/, '') || '/'
	return APP_TABS.some(t => t.to === p) ? p : null
}
