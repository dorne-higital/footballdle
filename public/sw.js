self.addEventListener('push', (event) => {
	const data = event.data?.json() ?? {}
	event.waitUntil(
		self.registration.showNotification(data.title || 'Footballdle ⚽', {
			body: data.body || "Today's puzzle is ready — come guess the player!",
			icon: '/android-chrome-192x192.png',
			badge: '/favicon-32x32.png',
			tag: 'footballdle-daily',
			renotify: true,
			data: { url: data.url || 'https://footballdle.co.uk' },
		}),
	)
})

self.addEventListener('notificationclick', (event) => {
	event.notification.close()
	event.waitUntil(
		clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((list) => {
				const existing = list.find((c) => c.url.includes('footballdle.co.uk') && 'focus' in c)
				if (existing) return existing.focus()
				return clients.openWindow(event.notification.data?.url || 'https://footballdle.co.uk')
			}),
	)
})
