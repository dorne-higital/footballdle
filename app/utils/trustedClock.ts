import { ref } from 'vue'

// The newest date (DD/MM/YYYY, UK) a server has vouched for. Player Cards only count a
// day up to one after it, so moving the phone's clock forward can't farm cards; anything
// later waits as "pending" until the app next gets online.
const KEY = 'footballdle-trusted-date'

function read(): string {
	try {
		return localStorage.getItem(KEY) || ''
	} catch {
		return ''
	}
}

export const trustedDate = ref(import.meta.client ? read() : '')
/** Goes up on every server response, so checks run even when the date hasn't changed */
export const serverChecks = ref(0)

const toUK = (d: Date) => d.toLocaleDateString('en-GB', { timeZone: 'Europe/London' })
const order = (s: string) => {
	const [d, m, y] = s.split('/').map(Number)
	return (y ?? 0) * 10000 + (m ?? 0) * 100 + (d ?? 0)
}

/** Records a server's Date header; keeps whichever date is newest */
export function vouchFor(serverDate: Date) {
	if (Number.isNaN(serverDate.getTime())) return
	const uk = toUK(serverDate)
	if (!trustedDate.value || order(uk) > order(trustedDate.value)) {
		trustedDate.value = uk
		try {
			localStorage.setItem(KEY, uk)
		} catch {}
	}
	serverChecks.value++
}

/** True when a date is no more than a day past the trusted one */
export function isTrusted(dateStr: string): boolean {
	if (!trustedDate.value) return false
	const [d, m, y] = trustedDate.value.split('/').map(Number)
	const next = toUK(new Date(Date.UTC(y!, m! - 1, d! + 1, 12)))
	return order(dateStr) <= order(next)
}
