import type { ModeStats } from '../stores/modeStats'
import { getUKDateString } from './dateStreak'

// Game Center achievements. Each `id` must exist with the same Achievement ID in
// App Store Connect, along with the title, descriptions, points and badge
// (badges: app-store/achievements/<id>.png).

export interface AchievementContext {
	daily: ModeStats
	scout: ModeStats
	spot: ModeStats
	challenge: ModeStats
	today: string
	spotPerfectGames: number
	hintUsed: boolean
}

export interface Achievement {
	id: string
	title: string
	/** Shown before it's earned */
	goal: string
	/** Shown once earned */
	earned: string
	points: number
	hidden?: boolean
	/** 0–100. Count-based ones report partial progress for Game Center's progress bar. */
	progress: (ctx: AchievementContext) => number
}

const towards = (value: number, target: number) => Math.min(100, (value / target) * 100)
const solvedIn = (stats: ModeStats, guesses: number) => (stats.guessDistribution[String(guesses)] ?? 0) > 0 ? 100 : 0
const wonToday = (stats: ModeStats, today: string) =>
	stats.lastPlayedDate === today && stats.recentForm[stats.recentForm.length - 1] === true
const allModes = (ctx: AchievementContext) => [ctx.daily, ctx.scout, ctx.spot, ctx.challenge]

export const ACHIEVEMENTS: Achievement[] = [
	// Daily
	{ id: 'fd_daily_first_win', title: 'Off the Mark', goal: 'Win your first Daily.', earned: 'You won your first Daily.', points: 10, progress: c => towards(c.daily.wins, 1) },
	{ id: 'fd_daily_wins_10', title: 'Into Double Figures', goal: 'Win 10 Dailies.', earned: 'You won 10 Dailies.', points: 20, progress: c => towards(c.daily.wins, 10) },
	{ id: 'fd_daily_wins_50', title: 'Half Century', goal: 'Win 50 Dailies.', earned: 'You won 50 Dailies.', points: 40, progress: c => towards(c.daily.wins, 50) },
	{ id: 'fd_daily_wins_100', title: 'Centurion', goal: 'Win 100 Dailies.', earned: 'You won 100 Dailies.', points: 60, progress: c => towards(c.daily.wins, 100) },
	{ id: 'fd_daily_streak_3', title: 'Hat-Trick', goal: 'Win the Daily 3 days in a row.', earned: 'You won the Daily 3 days in a row.', points: 10, progress: c => towards(c.daily.maxStreak, 3) },
	{ id: 'fd_daily_streak_7', title: 'Week In, Week Out', goal: 'Win the Daily 7 days in a row.', earned: 'You won the Daily 7 days in a row.', points: 20, progress: c => towards(c.daily.maxStreak, 7) },
	{ id: 'fd_daily_streak_30', title: 'Player of the Month', goal: 'Win the Daily 30 days in a row.', earned: 'You won the Daily 30 days in a row.', points: 50, progress: c => towards(c.daily.maxStreak, 30) },
	{ id: 'fd_daily_streak_100', title: 'Club Legend', goal: 'Win the Daily 100 days in a row.', earned: 'You won the Daily 100 days in a row.', points: 100, progress: c => towards(c.daily.maxStreak, 100) },
	{ id: 'fd_daily_one_guess', title: 'Worldie', goal: 'Solve the Daily with your first guess.', earned: 'You solved the Daily with your first guess.', points: 50, hidden: true, progress: c => solvedIn(c.daily, 1) },
	{ id: 'fd_daily_two_guess', title: 'Clinical Finish', goal: 'Solve the Daily in two guesses.', earned: 'You solved the Daily in two guesses.', points: 25, progress: c => solvedIn(c.daily, 2) },
	{ id: 'fd_daily_last_gasp', title: 'Last-Minute Winner', goal: 'Solve the Daily with your sixth and final guess.', earned: 'You solved the Daily with your final guess.', points: 15, progress: c => solvedIn(c.daily, 6) },

	// Scout Report
	{ id: 'fd_scout_first_win', title: 'Scouting Mission', goal: 'Win your first Scout Report.', earned: 'You won your first Scout Report.', points: 10, progress: c => towards(c.scout.wins, 1) },
	{ id: 'fd_scout_wins_25', title: 'Chief Scout', goal: 'Win 25 Scout Reports.', earned: 'You won 25 Scout Reports.', points: 30, progress: c => towards(c.scout.wins, 25) },
	{ id: 'fd_scout_streak_7', title: 'Eye for Talent', goal: 'Win the Scout Report 7 days in a row.', earned: 'You won the Scout Report 7 days in a row.', points: 25, progress: c => towards(c.scout.maxStreak, 7) },
	{ id: 'fd_scout_two_guess', title: 'Spotted Early', goal: 'Solve the Scout Report in two guesses.', earned: 'You solved the Scout Report in two guesses.', points: 25, progress: c => solvedIn(c.scout, 2) },

	// Spot the Baller
	{ id: 'fd_spot_first_win', title: 'Spotted', goal: 'Win your first Spot the Baller.', earned: 'You won your first Spot the Baller.', points: 10, progress: c => towards(c.spot.wins, 1) },
	{ id: 'fd_spot_perfect', title: 'Perfect 10', goal: 'Get all 10 rounds right in Spot the Baller.', earned: 'You got all 10 rounds right in Spot the Baller.', points: 50, progress: c => towards(c.spotPerfectGames, 1) },
	{ id: 'fd_spot_streak_7', title: 'Sharp Eyes', goal: 'Win Spot the Baller 7 days in a row.', earned: 'You won Spot the Baller 7 days in a row.', points: 25, progress: c => towards(c.spot.maxStreak, 7) },

	// Challenge
	{ id: 'fd_challenge_first_win', title: 'Against the Clock', goal: 'Win a Challenge game.', earned: 'You won a Challenge game.', points: 15, progress: c => towards(c.challenge.wins, 1) },
	{ id: 'fd_challenge_quickfire', title: 'Quickfire', goal: 'Win a Challenge game in under 15 seconds.', earned: 'You won a Challenge game in under 15 seconds.', points: 40, progress: c => (c.challenge.bestTime !== undefined && c.challenge.bestTime < 15 ? 100 : 0) },
	{ id: 'fd_challenge_wins_25', title: 'Extra Time Specialist', goal: 'Win 25 Challenge games.', earned: 'You won 25 Challenge games.', points: 30, progress: c => towards(c.challenge.wins, 25) },

	// Across every mode
	{ id: 'fd_all_treble', title: 'The Treble', goal: 'Win the Daily, Scout Report and Spot the Baller on the same day.', earned: 'You won all three daily modes on the same day.', points: 40, progress: c => ([c.daily, c.scout, c.spot].every(s => wonToday(s, c.today)) ? 100 : 0) },
	{ id: 'fd_all_games_100', title: 'Season Ticket Holder', goal: 'Play 100 games across every mode.', earned: 'You played 100 games across every mode.', points: 30, progress: c => towards(allModes(c).reduce((n, s) => n + s.gamesPlayed, 0), 100) },
	{ id: 'fd_all_wins_250', title: 'Hall of Famer', goal: 'Win 250 games across every mode.', earned: 'You won 250 games across every mode.', points: 75, progress: c => towards(allModes(c).reduce((n, s) => n + s.wins, 0), 250) },
	{ id: 'fd_hint_first', title: 'Tactical Review', goal: 'Use a hint in the Daily.', earned: 'You used a hint in the Daily.', points: 5, progress: c => (c.hintUsed ? 100 : 0) },
]

// Sections for the in-app Trophies screen, matched on the ID prefix
export const ACHIEVEMENT_GROUPS = [
	{ title: 'Daily', prefix: 'fd_daily_' },
	{ title: 'Scout Report', prefix: 'fd_scout_' },
	{ title: 'Spot the Baller', prefix: 'fd_spot_' },
	{ title: 'Challenge', prefix: 'fd_challenge_' },
	{ title: 'Across every mode', prefix: 'fd_all_', extra: ['fd_hint_first'] },
].map(group => ({
	title: group.title,
	achievements: ACHIEVEMENTS.filter(a => a.id.startsWith(group.prefix) || group.extra?.includes(a.id)),
}))

export const TOTAL_ACHIEVEMENT_POINTS = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0)

/** Context from the mode stats plus the extras the stats stores don't track */
export function buildAchievementContext(stats: Pick<AchievementContext, 'daily' | 'scout' | 'spot' | 'challenge'>): AchievementContext {
	let spotPerfectGames = 0
	let hintUsed = false
	try {
		spotPerfectGames = JSON.parse(localStorage.getItem('footballdle-spot-tiers') || 'null')?.['6'] ?? 0
		hintUsed = localStorage.getItem('footballdle-hint-used') === '1'
	} catch {}
	return { ...stats, today: getUKDateString(), spotPerfectGames, hintUsed }
}

const BEST_KEY = 'footballdle-achievement-best'

/** Progress per achievement, 0-100, that never goes backwards: rounded down (249/250
 *  is 99%, not done) and kept at its best, so a one-day trophy like The Treble stays
 *  earned once hit. Mirrors Game Center, which never un-earns either. */
export function achievementProgress(ctx: AchievementContext): Record<string, number> {
	let best: Record<string, number> = {}
	try {
		best = JSON.parse(localStorage.getItem(BEST_KEY) || 'null') ?? {}
		// Anything already reported to Game Center counts as reached
		const sent = JSON.parse(localStorage.getItem('footballdle-achievements-sent') || 'null') ?? {}
		for (const [id, pct] of Object.entries(sent)) best[id] = Math.max(best[id] ?? 0, Number(pct) || 0)
	} catch {}
	let changed = false
	const result: Record<string, number> = {}
	for (const a of ACHIEVEMENTS) {
		const live = Math.min(100, Math.floor(a.progress(ctx)))
		const value = Math.max(live, best[a.id] ?? 0)
		if (value !== (best[a.id] ?? 0)) changed = true
		result[a.id] = value
	}
	if (changed) {
		try {
			localStorage.setItem(BEST_KEY, JSON.stringify(result))
		} catch {}
	}
	return result
}
