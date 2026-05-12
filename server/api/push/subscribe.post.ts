export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	if (!body?.endpoint) throw createError({ statusCode: 400, message: 'Invalid subscription' })

	const storage = useStorage('push-subs')
	// key by a hash of the endpoint to avoid filesystem-unsafe characters
	const key = Buffer.from(body.endpoint).toString('base64url').slice(0, 64)
	await storage.setItem(key, body)

	return { ok: true }
})
