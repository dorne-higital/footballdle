// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@nuxt/fonts', '@nuxt/icon', '@pinia/nuxt'],

	// Pre-render the sitemap so it works on static deployments too
	routeRules: {
		'/sitemap.xml': { prerender: true },
	},

	// Build optimizations
	nitro: {
		compressPublicAssets: true,
		minify: true,
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
					src: 'https://www.googletagmanager.com/gtag/js?id=' + (process.env.GOOGLE_ANALYTICS_ID || ''),
					async: true,
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
