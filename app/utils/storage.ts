/** A saved object from localStorage, or null if it's missing. Anything that isn't a
 *  JSON object (corrupt, truncated, or the wrong shape) is removed so it can't crash
 *  the app on every launch; the game then starts that mode fresh. */
export function readSavedObject<T extends object = Record<string, any>>(key: string): Partial<T> | null {
	let raw: string | null
	try {
		raw = localStorage.getItem(key)
	} catch {
		return null
	}
	if (!raw) return null
	try {
		const parsed = JSON.parse(raw)
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
	} catch {}
	console.warn(`Ignoring unreadable saved data: ${key}`)
	try {
		localStorage.removeItem(key)
	} catch {}
	return null
}
