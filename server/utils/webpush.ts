import webpush from 'web-push'

let initialised = false

export function getWebPush() {
	if (!initialised) {
		const config = useRuntimeConfig()
		webpush.setVapidDetails(
			config.vapidSubject,
			config.public.vapidPublicKey,
			config.vapidPrivateKey,
		)
		initialised = true
	}
	return webpush
}
