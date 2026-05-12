import { getWebPush } from '../../utils/webpush'

export default defineTask({
	meta: { name: 'push:daily', description: 'Send daily puzzle reminder notifications' },
	async run() {
		const storage = useStorage('push-subs')
		const keys = await storage.getKeys()
		if (!keys.length) return { result: 'no subscribers' }

		const wp = getWebPush()
		const payload = JSON.stringify({
			title: 'Footballdle ⚽ Daily Puzzle',
			body: "Today's 6-letter Premier League footballer is waiting — can you guess it?",
			url: 'https://footballdle.co.uk',
		})

		const results = await Promise.allSettled(
			keys.map(async (key) => {
				const sub = await storage.getItem<any>(key)
				if (!sub) return
				try {
					await wp.sendNotification(sub, payload)
				} catch (err: any) {
					// 410 Gone = subscription expired, clean it up
					if (err?.statusCode === 410) await storage.removeItem(key)
				}
			}),
		)

		const sent = results.filter((r) => r.status === 'fulfilled').length
		return { result: `sent to ${sent}/${keys.length} subscribers` }
	},
})
