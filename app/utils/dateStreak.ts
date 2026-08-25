export function getUKDateString(): string {
	return new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/London' })
}

// Both args are DD/MM/YYYY strings.
export function wasYesterday(prevDateStr: string, todayStr: string): boolean {
	const [pd, pm, py] = prevDateStr.split('/').map(Number)
	const [td, tm, ty] = todayStr.split('/').map(Number)
	const prev = new Date(py, pm - 1, pd)
	const today = new Date(ty, tm - 1, td)
	return today.getTime() - prev.getTime() === 24 * 60 * 60 * 1000
}
