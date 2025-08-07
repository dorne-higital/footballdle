// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@nuxt/fonts', '@nuxt/icon', '@pinia/nuxt'],
	
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
			script: [
				{
					src: 'https://www.googletagmanager.com/gtag/js?id=' + (process.env.GOOGLE_ANALYTICS_ID || ''),
					async: true,
				},
			],
		},
	},
})