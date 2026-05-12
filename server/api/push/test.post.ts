import { getWebPush } from '../../utils/webpush'

export default defineEventHandler(async () => {
	const storage = useStorage('push-subs')
	const keys = await storage.getKeys()

	if (!keys.length) return { ok: false, message: 'No subscribers found' }

	const wp = getWebPush()
	const payload = JSON.stringify({
		title: 'Footballdle ⚽ Test Notification',
		body: "This is a test — notifications are working!",
		url: 'https://footballdle.co.uk',
	})

	let sent = 0
	for (const key of keys) {
		const sub = await storage.getItem<any>(key)
		if (!sub) continue
		try {
			await wp.sendNotification(sub, payload)
			sent++
		} catch (err: any) {
			if (err?.statusCode === 410) await storage.removeItem(key)
		}
	}

	return { ok: true, message: `Sent to ${sent} subscriber(s)` }
})
