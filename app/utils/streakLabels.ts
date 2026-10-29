// Words for the two streaks, so the screen and VoiceOver say the same thing everywhere.
// The Matchday streak counts days with any game finished; a mode streak counts wins in a row

export const dayWord = (n: number) => (n === 1 ? 'day' : 'days')

export function matchdayStreakSpoken(n: number, playedToday: boolean): string {
	if (n <= 0) return 'No Matchday streak yet'
	const base = `Matchday streak, ${n} ${dayWord(n)}`
	return playedToday ? base : `${base}. Play any game today to keep it`
}

export const modeStreakSpoken = (mode: string, n: number) => `${mode} win streak, ${n} ${dayWord(n)}`
