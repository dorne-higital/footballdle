import { getUKDateString } from '../utils/dateStreak'

// Every game store fixes "today" when it's created, so an app (or tab) left open
// past UK midnight would keep serving yesterday's puzzles with a 00:00:00 clock.
// When the day has moved on, reload: progress is already saved and every store
// starts again on the new day. Checked on returning to the app and once a minute.
export default defineNuxtPlugin(() => {
	const loadedOn = getUKDateString()
	let reloading = false

	function check() {
		if (reloading || document.hidden || getUKDateString() === loadedOn) return
		reloading = true
		window.location.reload()
	}

	document.addEventListener('visibilitychange', check)
	window.addEventListener('focus', check)
	setInterval(check, 60_000)
})
