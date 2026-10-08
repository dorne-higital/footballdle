// https://nuxt.com/docs/api/configuration/nuxt-config

// APP_TARGET=ios builds the bundle that ships inside the Capacitor iOS app:
// a client-only SPA with no AdSense, Buy Me a Coffee or Google Analytics
// (Apple rejects external tip links, and AdSense doesn't run in native apps).
const isApp = process.env.APP_TARGET === 'ios'

// Applies the saved theme before first paint to avoid a light-mode flash
const themeBootScript = `(function(){var t=localStorage.getItem('footballdle-theme');if(t==='dark')document.documentElement.classList.add('dark');else if(t==='greyscale')document.documentElement.classList.add('greyscale');else if(t==='pastel')document.documentElement.classList.add('theme-pastel');})();`

function getSolutionRoutes(): string[] {
	const routes: string[] = []
	const cursor = new Date(2026, 0, 1) // epoch: 1 Jan 2026
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	// Up to yesterday: today's page would give away today's answer
	while (cursor < today) {
		const y = cursor.getFullYear()
		const m = String(cursor.getMonth() + 1).padStart(2, '0')
		const d = String(cursor.getDate()).padStart(2, '0')
		routes.push(`/solution/${y}-${m}-${d}`)
		cursor.setDate(cursor.getDate() + 1)
	}
	return routes
}

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	ssr: !isApp,
	modules: ['@nuxt/fonts', '@nuxt/icon', '@pinia/nuxt'],

	icon: {
		clientBundle: {
			// .ts too: icon names live in stores and utils (hint clues, app tabs), and
			// anything missed would be fetched from the network at runtime
			scan: { globInclude: ['**/*.{vue,ts}'] },
		},
	},

	fonts: {
		families: [
			{ name: 'Jost', provider: 'google', weights: [500, 600, 700, 800], display: 'swap', preload: true },
			{ name: 'Inter', provider: 'google', weights: [200, 400, 500, 700], display: 'swap' },
			// iOS app "Floodlights" look (assets/_app-shell.scss)
			{ name: 'Archivo Black', provider: 'google', weights: [400], display: 'swap' },
			{ name: 'Manrope', provider: 'google', weights: [500, 600, 700, 800], display: 'swap' },
		],
		defaults: {
			fallbacks: { serif: ['Georgia'], 'sans-serif': ['Arial'] },
		},
	},

	// Pre-render the sitemap so it works on static deployments too
	routeRules: {
		'/sitemap.xml': { prerender: true },
	},

	// Build optimizations + pre-render all solution pages so they exist as static HTML
	nitro: {
		compressPublicAssets: !isApp,
		minify: true,
		prerender: {
			routes: isApp ? [] : ['/play/daily', '/play/scout-report', '/play/spot-the-baller', ...getSolutionRoutes()],
		},

	},

	vite: {
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ['vue', 'pinia'],
					},
				},
			},
		},
		optimizeDeps: {
			include: ['vue', 'pinia'],
		},
	},

	runtimeConfig: {
		public: {
			isApp,
			googleAnalyticsId: isApp ? '' : process.env.GOOGLE_ANALYTICS_ID || '',
			adsensePublisherId: isApp ? '' : process.env.ADSENSE_PUBLISHER_ID || '',
			adsenseSlotId: isApp ? '' : process.env.ADSENSE_SLOT_ID || '',
			// RevenueCat *public* Apple key (appl_...), safe to ship in the app
			revenuecatAppleKey: isApp ? process.env.REVENUECAT_APPLE_KEY || '' : '',
			// The Climb (1.2, replacing Challenge in the app): hidden unless CLIMB=1 at build time
			climbEnabled: isApp && process.env.CLIMB === '1',
		},
	},

	// Optional: Add meta tags for Google Analytics
	app: {
		...(isApp ? { pageTransition: { name: 'app-slide', mode: 'out-in' } } : {}),
		head: {
			...(isApp
				? {
						viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
						htmlAttrs: { class: 'app-shell' },
					}
				: {}),
			link: [
				...(isApp ? [] : [{ rel: 'preconnect', href: 'https://www.googletagmanager.com' }]),
				{ rel: 'manifest', href: '/manifest.json' },
				{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
			],
			meta: [
				...(isApp ? [] : [{ name: 'google-adsense-account', content: 'ca-pub-8134902947215331' }]),
				{ name: 'theme-color', content: '#dc2626' },
				{ name: 'apple-mobile-web-app-capable', content: 'yes' },
				{ name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
				{ name: 'apple-mobile-web-app-title', content: 'Footballdle' },
			],
			script: isApp ? [
				{
					innerHTML: themeBootScript,
				},
			] : [
				{
					innerHTML: `window.adBreak=window.adBreak||function(o){(window.adsbygoogle=window.adsbygoogle||[]).push({breaksData:[o]})};window.adConfig=window.adConfig||function(o){(window.adsbygoogle=window.adsbygoogle||[]).push({breaksData:[o]})};`,
				},
				{
					type: 'application/ld+json',
					innerHTML: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'WebSite',
						name: 'Footballdle',
						url: 'https://footballdle.co.uk',
					}),
				},
				{
					innerHTML: themeBootScript,
				},
				{
					src: 'https://www.googletagmanager.com/gtag/js?id=' + (process.env.GOOGLE_ANALYTICS_ID || ''),
					async: true,
				},
				{
					innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.GOOGLE_ANALYTICS_ID || ''}');`,
				},
				{
					src: 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js',
					'data-name': 'BMC-Widget',
					'data-cfasync': 'false',
					'data-id': 'dhorne92E',
					'data-description': 'Support me on Buy me a coffee!',
					'data-color': '#FF5F5F',
					'data-position': 'Right',
					'data-x_margin': '18',
					'data-y_margin': '18',
					defer: true,
				},
			],
		},
	},
})
