export default defineEventHandler(async (event) => {
	const { endpoint } = await readBody(event)
	if (!endpoint) throw createError({ statusCode: 400, message: 'Missing endpoint' })

	const storage = useStorage('push-subs')
	const key = Buffer.from(endpoint).toString('base64url').slice(0, 64)
	await storage.removeItem(key)

	return { ok: true }
})
