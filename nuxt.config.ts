// https://nuxt.com/docs/api/configuration/nuxt-config

// APP_TARGET=ios builds the bundle that ships inside the Capacitor iOS app:
// a client-only SPA with no AdSense, Buy Me a Coffee or Google Analytics
// (Apple rejects external tip links, and AdSense doesn't run in native apps).
const isApp = process.env.APP_TARGET === 'ios'
// The app's look (layouts, Matchday home, tab bar, Floodlights theme), on the app and the
// website alike. WEB_SHELL=old builds the website's previous look, as a fallback
const appShell = isApp || process.env.WEB_SHELL !== 'old'

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
	// Nuxt's dev server crashes with ssr: false ("No entry found in rollupOptions.input");
	// its newer Vite mode doesn't, so yarn dev:app uses that. Builds are untouched
	$development: isApp ? { experimental: { viteEnvironmentApi: true } } : {},
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
			appShell,
			googleAnalyticsId: isApp ? '' : process.env.GOOGLE_ANALYTICS_ID || '',
			// RevenueCat *public* Apple key (appl_...), safe to ship in the app
			revenuecatAppleKey: isApp ? process.env.REVENUECAT_APPLE_KEY || '' : '',
		},
	},

	// Optional: Add meta tags for Google Analytics
	app: {
		...(isApp ? { pageTransition: { name: 'app-slide', mode: 'out-in' } } : {}),
		head: {
			...(isApp ? { viewport: 'width=device-width, initial-scale=1, viewport-fit=cover' } : {}),
			// app-web: the app look on the website (a phone-width column on big screens)
			...(appShell ? { htmlAttrs: { class: isApp ? 'app-shell' : 'app-shell app-web' } } : {}),
			link: [
				...(isApp ? [] : [{ rel: 'preconnect', href: 'https://www.googletagmanager.com' }]),
				{ rel: 'manifest', href: '/manifest.json' },
				{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
			],
			meta: [
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
