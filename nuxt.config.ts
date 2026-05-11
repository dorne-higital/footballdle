// https://nuxt.com/docs/api/configuration/nuxt-config

function getSolutionRoutes(): string[] {
	const routes: string[] = []
	const cursor = new Date(2026, 0, 1) // epoch: 1 Jan 2026
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	while (cursor <= today) {
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
	modules: ['@nuxt/fonts', '@nuxt/icon', '@pinia/nuxt'],

	icon: {
		clientBundle: {
			scan: true,
		},
	},

	fonts: {
		families: [
			{ name: 'Cairo', provider: 'google', weights: [400, 700], display: 'swap', preload: true },
			{ name: 'Inter', provider: 'google', weights: [200, 400, 500, 700], display: 'swap' },
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
		compressPublicAssets: true,
		minify: true,
		prerender: {
			routes: getSolutionRoutes(),
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

	// Google Analytics configuration
	runtimeConfig: {
		public: {
			googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
		},
	},

	// Optional: Add meta tags for Google Analytics
	app: {
		head: {
			link: [
				{ rel: 'preconnect', href: 'https://www.googletagmanager.com' },
				{ rel: 'dns-prefetch', href: 'https://cdnjs.buymeacoffee.com' },
				{ rel: 'manifest', href: '/manifest.json' },
				{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
			],
			meta: [
				{ name: 'theme-color', content: '#dc2626' },
				{ name: 'apple-mobile-web-app-capable', content: 'yes' },
				{ name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
				{ name: 'apple-mobile-web-app-title', content: 'Footballdle' },
			],
			script: [
				{
					innerHTML: `(function(){var t=localStorage.getItem('footballdle-theme');if(t==='dark')document.documentElement.classList.add('dark');else if(t==='greyscale')document.documentElement.classList.add('greyscale');else if(t==='pastel')document.documentElement.classList.add('theme-pastel');})();`,
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
