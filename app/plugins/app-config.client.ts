import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { vouchFor } from '../utils/trustedClock'
import { readSaleConfig, type SaleConfig } from '../utils/sale'

// On launch (and on resume in the iOS app), reads app-config.json. Its Date header is the
// trusted clock for Player Cards, in the app and on the website; in the app its minBuild
// also drives a gentle "update available" sheet (at most once a day, never blocking play),
// and its `sale` labels a flash sale (utils/sale.ts).
const CONFIG_URL = 'https://footballdle.co.uk/app-config.json'
const PROMPT_KEY = 'footballdle-update-prompt'

export default defineNuxtPlugin(() => {
	const { appShell, isApp } = useRuntimeConfig().public
	if (!appShell) return
	// The website asks its own server; the app asks the website
	const url = isApp ? CONFIG_URL : '/app-config.json'
	const prompt = useState<{ message: string; storeUrl: string } | null>('update-prompt', () => null)
	const sale = useState<SaleConfig | null>('store-sale', () => null)

	async function check() {
		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), 4000)
		try {
			const res = await fetch(url, { cache: 'no-store', signal: controller.signal })
			const date = res.headers.get('Date')
			if (date) vouchFor(new Date(date))
			const config = await res.json()
			sale.value = readSaleConfig(config.sale)
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
