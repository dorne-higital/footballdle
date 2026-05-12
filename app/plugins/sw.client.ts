export default defineNuxtPlugin(async () => {
	if ('serviceWorker' in navigator) {
		try {
			await navigator.serviceWorker.register('/sw.js')
		} catch {
			// SW registration failed — push notifications won't be available
		}
	}
})
