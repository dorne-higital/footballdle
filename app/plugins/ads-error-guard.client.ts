// Third-party ad scripts (AdSense) can throw uncaught errors asynchronously —
// e.g. a duplicate adsbygoogle.push() during a dev-mode hydration remount.
// Nuxt's default crash handling treats any uncaught window error as fatal and
// replaces the whole page with the error screen. An ad failing to load should
// never take the game down, so swallow ad-script errors before Nuxt sees them.
export default defineNuxtPlugin(() => {
	window.addEventListener(
		'error',
		(event) => {
			const fromAdsbygoogle =
				event.message?.includes('adsbygoogle') || event.filename?.includes('googlesyndication')
			if (fromAdsbygoogle) {
				event.stopImmediatePropagation()
				event.preventDefault()
			}
		},
		true,
	)
})
