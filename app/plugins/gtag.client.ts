import { createGtag } from 'vue-gtag'

export default defineNuxtPlugin((nuxtApp) => {
	// Only run on client side
	if (process.client) {
		// Get the Google Analytics ID from environment variables
		const gaId = useRuntimeConfig().public.googleAnalyticsId
		
		if (gaId) {
			const gtag = createGtag({
				tagId: gaId,
				config: {
					debug_mode: process.env.NODE_ENV === 'development',
					send_page_view: true,
				},
			})
			
			nuxtApp.vueApp.use(gtag)
		} else {
			console.warn('Google Analytics ID not found. Please check your .env file.')
		}
	}
}) 