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

/** When the next puzzles go live (UK midnight), in the device's own time: "midnight"
 *  in the UK, otherwise e.g. "8:00 am" */
export function nextPuzzleTimeLabel(now = new Date()): string {
	const uk = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: 'numeric', day: 'numeric' })
		.formatToParts(now)
		.reduce<Record<string, number>>((acc, p) => (p.type === 'literal' ? acc : { ...acc, [p.type]: Number(p.value) }), {})
	// Midnight UTC on the next UK day, moved back by however far UK clocks are ahead
	const guess = Date.UTC(uk.year!, uk.month! - 1, uk.day! + 1)
	const ukHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: 'numeric', hourCycle: 'h23' }).format(guess))
	const at = new Date(guess - ukHour * 3600_000)
	const local = at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
	const ukLocal = at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZone: 'Europe/London' })
	return local === ukLocal ? 'midnight' : local
}

/** The real instant of the next UK midnight (new puzzles), on any device timezone.
 *  Measured UK wall clock to UK wall clock, then added to the real now. */
export function nextUKMidnight(now = new Date()): Date {
	const uk = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }))
	const next = new Date(uk)
	next.setHours(24, 0, 0, 0)
	return new Date(now.getTime() + (next.getTime() - uk.getTime()))
}

export type StreakDayState = 'played' | 'missed' | 'unknown' | 'today'
export interface StreakDay {
	/** Day of the week, e.g. "Mon" */
	weekday: string
	isToday: boolean
	state: StreakDayState
}

/** The last 7 days for the Matchday streak card, oldest first, from what the streak
 *  store keeps (the streak and whether today is played). Days in the current run are
 *  played, the day before it was missed, anything older isn't known; today is 'today'
 *  until a game is finished. */
export function streakWeek(streak: number, playedToday: boolean, todayStr: string): StreakDay[] {
	const [d, m, y] = todayStr.split('/').map(Number)
	// The run covers days back from today (or from yesterday if today isn't played yet)
	const runFrom = playedToday ? 0 : 1
	const runTo = streak > 0 ? runFrom + streak - 1 : -1
	const days: StreakDay[] = []
	for (let back = 6; back >= 0; back--) {
		const date = new Date(Date.UTC(y!, m! - 1, d! - back))
		let state: StreakDayState = 'unknown'
		if (back === 0 && !playedToday) state = 'today'
		else if (back >= runFrom && back <= runTo) state = 'played'
		else if (streak > 0 && back === runTo + 1) state = 'missed'
		days.push({ weekday: date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }), isToday: back === 0, state })
	}
	return days
}
