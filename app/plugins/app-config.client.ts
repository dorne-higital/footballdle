import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { vouchFor } from '../utils/trustedClock'

// iOS app: on launch and on resume, reads footballdle.co.uk/app-config.json. Its Date
// header is the trusted clock for Player Cards; its minBuild drives a gentle "update
// available" sheet (at most once a day, never blocking play).
const CONFIG_URL = 'https://footballdle.co.uk/app-config.json'
const PROMPT_KEY = 'footballdle-update-prompt'

export default defineNuxtPlugin(() => {
	if (!useRuntimeConfig().public.isApp) return
	const prompt = useState<{ message: string; storeUrl: string } | null>('update-prompt', () => null)

	async function check() {
		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), 4000)
		try {
			const res = await fetch(CONFIG_URL, { cache: 'no-store', signal: controller.signal })
			const date = res.headers.get('Date')
			if (date) vouchFor(new Date(date))
			const config = await res.json()
			if (!Capacitor.isNativePlatform() || !Number(config.minBuild)) return
			const { build } = await App.getInfo()
			if (Number(build) >= Number(config.minBuild)) return
			const today = new Date().toDateString()
			if (localStorage.getItem(PROMPT_KEY) === today) return
			localStorage.setItem(PROMPT_KEY, today)
			prompt.value = { message: String(config.message || 'A new version is available.'), storeUrl: String(config.storeUrl || '') }
		} catch {
			// Offline or slow: try again next time
		} finally {
			clearTimeout(timer)
		}
	}

	check()
	if (Capacitor.isNativePlatform()) App.addListener('resume', check).catch(() => {})
})
