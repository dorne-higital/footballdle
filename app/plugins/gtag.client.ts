import { createGtag } from 'vue-gtag'

export default defineNuxtPlugin((nuxtApp) => {
	// Only run on client side
	if (process.client) {
		// Get the Google Analytics ID from environment variables
		const gaId = useRuntimeConfig().public.googleAnalyticsId
		
		if (gaId) {
			const gtag = createGtag({
				config: {
					id: gaId,
					// Optional: Configure additional settings
					debug_mode: process.env.NODE_ENV === 'development',
					send_page_view: true,
				},
			})
			
			nuxtApp.vueApp.use(gtag)
			
			// Log when ready
			console.log('Google Analytics is ready!')
		}
	}
}) 