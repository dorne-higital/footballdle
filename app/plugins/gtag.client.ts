import VueGtag from 'vue-gtag'

export default defineNuxtPlugin((nuxtApp) => {
	// Only run on client side
	if (process.client) {
		// Get the Google Analytics ID from environment variables
		const gaId = useRuntimeConfig().public.googleAnalyticsId
		
		if (gaId) {
			nuxtApp.vueApp.use(VueGtag, {
				config: {
					id: gaId,
					// Optional: Configure additional settings
					debug_mode: process.env.NODE_ENV === 'development',
					send_page_view: true,
				},
				// Optional: Custom page view tracking
				onReady() {
					console.log('Google Analytics is ready!')
				},
			})
		}
	}
}) 