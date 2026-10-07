export function getUKDateString(): string {
	return new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/London' })
}

// Both args are DD/MM/YYYY strings.
export function wasYesterday(prevDateStr: string, todayStr: string): boolean {
	const [pd, pm, py] = prevDateStr.split('/').map(Number)
	const [td, tm, ty] = todayStr.split('/').map(Number)
	// Calendar days in UTC: local midnights are 23h or 25h apart across a clock
	// change, which used to break every streak the day after
	return Date.UTC(ty, tm - 1, td) - Date.UTC(py, pm - 1, pd) === 24 * 60 * 60 * 1000
}
