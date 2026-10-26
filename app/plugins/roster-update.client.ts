import { Capacitor } from '@capacitor/core'
import { rosterUpdated } from '../composables/useFootballers'
import { readRosterFile, ROSTER_KEY, ROSTER_URL } from '../utils/rosterSource'

// iOS app: after launch, quietly fetches the website's latest player list (refreshed every
// week by .github/workflows/update-players.yml) and saves it when it's newer than the one
// in use. It's picked up at the next launch, never mid-game. Offline, slow, or a file that
// looks wrong: nothing changes and the app keeps the list it has.
export default defineNuxtPlugin((nuxtApp) => {
	if (!Capacitor.isNativePlatform()) return

	async function refresh() {
		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), 15000)
		try {
			const res = await fetch(ROSTER_URL, { cache: 'no-store', signal: controller.signal })
			if (!res.ok) return
			const file = readRosterFile(await res.json())
			if (!file || file.updated <= rosterUpdated) return
			localStorage.setItem(ROSTER_KEY, JSON.stringify(file))
		} catch {
			// Try again next launch
		} finally {
			clearTimeout(timer)
		}
	}

	// After the first screen is up, so it never slows the launch
	nuxtApp.hook('app:mounted', () => {
		setTimeout(refresh, 3000)
	})
})
