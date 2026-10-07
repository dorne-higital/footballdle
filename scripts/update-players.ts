// Refreshes the player data for every mode and extends the answer schedule.
//
//   yarn update-players            fetch fresh squads, write the data, extend the schedule
//   yarn update-players --dry-run  print the report only
//
// Sources
// - Official Fantasy Premier League data (no key): the complete current roster,
//   updated through every transfer window, plus minutes and ownership so answers
//   are players people have actually heard of.
// - football-data.org: nationalities (FPL doesn't publish them).
//
// Outputs (both committed, both read by app/composables/use*Footballers.ts)
// - app/data/players.json   every current Premier League player
// - app/data/schedule.json  the answer for each date, per mode. APPEND-ONLY: existing
//   dates are never rewritten, so today's answer, past solutions, and app builds already
//   in people's hands all stay in sync. New players only become answers on new dates.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getConfederation } from '../app/composables/useConfederations.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PLAYERS_PATH = join(ROOT, 'app/data/players.json')
const SCHEDULE_PATH = join(ROOT, 'app/data/schedule.json')
const META_PATH = join(ROOT, 'app/data/meta.json')
const DRY_RUN = process.argv.includes('--dry-run')
// Re-plan the schedule from the saved players.json without fetching anything
const OFFLINE = process.argv.includes('--offline')
// Re-plan every upcoming Daily answer (from tomorrow), e.g. after changing how they're picked
const REPLAN_DAILY = process.argv.includes('--replan-daily')

// football-data.org free-tier token (it only reads public squad lists)
const FOOTBALL_DATA_TOKEN = process.env.FOOTBALL_DATA_TOKEN || 'f425457f0ccb4f5cb2b99e8574ebb762'

// How far ahead to schedule answers. App builds carry the schedule, so this is how long
// an un-updated app stays in step with the website.
const HORIZON_DAYS = 60
// Answers aren't repeated within this many days
const NO_REPEAT_DAYS = { daily: 150, scout: 150 }
const SPOT_ROUNDS = 10
const SPOT_OPTIONS = 4
const SPOT_NO_REPEAT_DAYS = 30

// A player is "known" (eligible as an answer) once they've played a few games or are
// widely picked in FPL; everyone else is still a valid guess
const KNOWN_MIN_MINUTES = 180
const KNOWN_MIN_OWNERSHIP = 0.5
// The Daily only has 6-letter surnames to choose from, so its bar is lower: anyone who
// has played this season or is picked by a few FPL managers
const DAILY_MIN_OWNERSHIP = 0.2

type Position = string
interface Player {
	name: string
	club: string
	nationality: string
	position: Position
	/** Surname as typed in the letter grids: lowercase, no accents or punctuation.
	 *  The Daily uses 6-letter ones, Challenge mode 5-letter ones. */
	lastName: string
	/** Eligible as a Scout / Spot answer */
	known: boolean
	/** Eligible as a Daily (6-letter) or Challenge (5-letter) answer */
	dailyKnown: boolean
	/** Sort key: higher = better known */
	pop: number
	/** FPL's short display name ('Saka', 'Alisson', 'B.Fernandes'): how fans refer to them */
	webName?: string
	/** FPL price in tenths (55 = £5.5m): the best 'have people heard of them' signal, since
	 *  it holds up for injured stars when minutes and ownership don't */
	cost?: number
	/** FPL position code: 1 goalkeeper, 2 defender, 3 midfielder, 4 forward */
	fplType?: number
	/** League minutes this season */
	minutes?: number
}
/** [name, club, nationality, position] — a frozen copy of the player as they were that day */
type Snapshot = [string, string, string, string]
interface SpotRoundEntry {
	target: Snapshot
	options: string[]
}
interface Schedule {
	epoch: string
	daily: { start: number; answers: Snapshot[] }
	scout: { start: number; answers: Snapshot[] }
	spot: { start: number; days: SpotRoundEntry[][] }
}

// FPL short names / football-data short names → the club names the game displays
const CLUB_NAMES: Record<string, string> = {
	'Man City': 'Manchester City',
	'Man Utd': 'Manchester United',
	'Man United': 'Manchester United',
	"Nott'm Forest": 'Nottingham Forest',
	Nottingham: 'Nottingham Forest',
	Spurs: 'Tottenham',
	Tottenham: 'Tottenham',
	Brighton: 'Brighton & Hove Albion',
	'Brighton Hove': 'Brighton & Hove Albion',
	Leeds: 'Leeds United',
	Wolves: 'Wolverhampton',
}
const club = (name: string) => CLUB_NAMES[name] ?? name

// Keep one spelling per country, matching the names already in the game
const NATIONALITY_NAMES: Record<string, string> = {
	"Cote d'Ivoire": 'Ivory Coast',
	"Côte d'Ivoire": 'Ivory Coast',
	'DR Congo': 'Congo DR',
}
const nation = (name: string) => NATIONALITY_NAMES[name] ?? name

// Players neither source gives a nationality for (matched by key(name)). Only add
// ones you're sure of: a wrong nation is worse than 'Unknown' in Scout.
const NATIONALITY_OVERRIDES: Record<string, string> = {
	'ali al hamadi': 'Iraq',
	'amario cozier-duberry': 'England',
	'christantus uche': 'Nigeria',
	'diego coppola': 'Italy',
	'jahnoah markelo': 'Netherlands',
	'norman bassette': 'Belgium',
}

const FPL_POSITIONS: Record<number, Position> = { 1: 'Goalkeeper', 2: 'Defender', 3: 'Midfielder', 4: 'Forward' }
const POSITION_GROUPS: Record<string, string> = {
	Goalkeeper: 'Goalkeeper',
	Defender: 'Defender',
	'Centre-Back': 'Defender',
	'Left-Back': 'Defender',
	'Right-Back': 'Defender',
	Midfielder: 'Midfielder',
	'Defensive Midfield': 'Midfielder',
	'Central Midfield': 'Midfielder',
	'Attacking Midfield': 'Midfielder',
	'Left Midfield': 'Midfielder',
	Forward: 'Forward',
	'Centre-Forward': 'Forward',
	'Right Winger': 'Forward',
	'Left Winger': 'Forward',
}
const group = (p: Position) => POSITION_GROUPS[p] ?? p

// Letters NFD doesn't split into base + accent (same map as useAllFootballers.ts)
const TRANSLIT: Record<string, string> = { ø: 'o', đ: 'd', ł: 'l', ı: 'i', æ: 'ae', œ: 'oe', ß: 'ss', ð: 'd', þ: 'th' }

/** Lowercase, accent-free, single-spaced — for matching only */
const key = (s: string) =>
	s
		.toLowerCase()
		.replace(/[øđłıæœßðþ]/g, c => TRANSLIT[c]!)
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z\s'-]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
const tokens = (s: string) => key(s).split(/[\s-]+/).filter(Boolean)

const lastName = (name: string) => (tokens(name).pop() ?? '').replace(/[^a-z]/g, '')

function seededShuffle<T>(arr: T[], seed: number): T[] {
	const result = [...arr]
	let s = seed >>> 0
	for (let i = result.length - 1; i > 0; i--) {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0
		const j = s % (i + 1)
		;[result[i], result[j]] = [result[j]!, result[i]!]
	}
	return result
}

const snapshot = (p: Pick<Player, 'name' | 'club' | 'nationality' | 'position'>): Snapshot => [
	p.name,
	p.club,
	p.nationality,
	p.position,
]
/** Fit to be a Daily answer: the six letters have to be the name people actually call
 *  them. Leaves out double-barrelled and multi-part surnames (Lewis-Skelly, Strand
 *  Larsen, De Cuyper) and players known by another name (Alisson, Bruno G.). */
// Known by their first name even though FPL shows the surname ('A.Becker')
const KNOWN_BY_FIRST_NAME = new Set(['alisson becker'])

function dailyEligible(p: Player): boolean {
	if (KNOWN_BY_FIRST_NAME.has(key(p.name))) return false
	// Backup and third-choice keepers: FPL prices them under £4.5m. A cheap keeper who's
	// actually playing (three full games or more this season) still counts.
	if (p.fplType === 1 && p.cost !== undefined && p.cost < 45 && (p.minutes ?? 0) < 270) return false
	const parts = p.name.trim().split(/\s+/)
	if (parts.length !== 2 || parts[1]!.includes('-')) return false
	if (!p.webName) return true
	// 'B.Fernandes' -> 'fernandes'; 'Alisson' stays 'alisson' and doesn't match 'becker'
	const shown = tokens(p.webName.replace(/\./g, ' ')).pop() ?? ''
	return shown.replace(/[^a-z]/g, '') === p.lastName
}

// The Daily board is six letters, so its answers are surnames, not full names
const dailySnapshot = (p: Player): Snapshot => [p.lastName, p.club, p.nationality, p.position]
const DAILY_ANSWER = /^[a-z]{6}$/

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------
async function fetchJson(url: string, headers: Record<string, string> = {}) {
	const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (footballdle player update)', ...headers } })
	if (!res.ok) throw new Error(`${url} → ${res.status} ${await res.text()}`)
	return res.json()
}

function currentSeason() {
	const now = new Date()
	return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
}

// ---------------------------------------------------------------------------
// Build the roster
// ---------------------------------------------------------------------------
function buildRoster(fpl: any, fd: any, previous: Map<string, Player>): Player[] {
	const fplClubs = new Map<number, string>(fpl.teams.map((t: any) => [t.id, club(t.name)]))

	// football-data squads grouped by club, for nationality
	const fdByClub = new Map<string, { name: string; nationality: string }[]>()
	for (const team of fd.teams) {
		const list = (team.squad || []).map((p: any) => ({ name: p.name, nationality: p.nationality && nation(p.nationality) }))
		fdByClub.set(club(team.shortName || team.name), list)
	}

	// FPL "region" ids → nationality, learnt from players matched in both sources
	const regionVotes = new Map<number, Map<string, number>>()

	const matched: { e: any; fdMatch?: { name: string; nationality: string } }[] = []
	for (const e of fpl.elements) {
		const clubName = fplClubs.get(e.team)!
		const fplTokens = new Set([
			...tokens(`${e.first_name} ${e.second_name}`),
			...tokens(e.web_name),
			...tokens(e.known_name || ''),
		])
		const candidates = fdByClub.get(clubName) || []
		const fdMatch =
			candidates.find(c => key(c.name) === key(`${e.first_name} ${e.second_name}`)) ||
			candidates.find(c => tokens(c.name).every(t => fplTokens.has(t))) ||
			candidates.find(c => {
				const t = tokens(c.name)
				return t.length > 1 && fplTokens.has(t[t.length - 1]!) && fplTokens.has(t[0]!)
			}) ||
			// Same club and surname, different spelling of the first name (Yankuba / Yankubah)
			(() => {
				const bySurname = candidates.filter(c => tokens(c.name).pop() === tokens(e.second_name).pop())
				return bySurname.length === 1 ? bySurname[0] : undefined
			})()
		if (fdMatch?.nationality && e.region) {
			const votes = regionVotes.get(e.region) ?? new Map()
			votes.set(fdMatch.nationality, (votes.get(fdMatch.nationality) ?? 0) + 1)
			regionVotes.set(e.region, votes)
		}
		matched.push({ e, fdMatch })
	}
	const regionNationality = new Map<number, string>()
	for (const [region, votes] of regionVotes) {
		regionNationality.set(region, [...votes.entries()].sort((a, b) => b[1] - a[1])[0]![0])
	}

	const roster: Player[] = []
	for (const { e, fdMatch } of matched) {
		const secondWords = String(e.second_name).trim().split(/\s+/)
		const displayName =
			fdMatch?.name ||
			e.known_name ||
			(secondWords.length <= 2 ? `${e.first_name} ${e.second_name}` : `${e.first_name} ${e.web_name}`)
		const name = displayName.toLowerCase().trim()
		const prev = previous.get(key(name))
		const coarse = FPL_POSITIONS[e.element_type] ?? 'Midfielder'
		// Keep a detailed position we already had (e.g. Centre-Back) if it still fits
		const position = prev && group(prev.position) === coarse ? prev.position : coarse
		const nationality =
			fdMatch?.nationality || regionNationality.get(e.region) || NATIONALITY_OVERRIDES[key(name)] || prev?.nationality || 'Unknown'
		const minutes = Number(e.minutes) || 0
		const ownership = Number(e.selected_by_percent) || 0
		const known =
			nationality !== 'Unknown' &&
			e.status !== 'u' &&
			(minutes >= KNOWN_MIN_MINUTES || ownership >= KNOWN_MIN_OWNERSHIP)
		const dailyKnown =
			nationality !== 'Unknown' && e.status !== 'u' && (minutes > 0 || ownership >= DAILY_MIN_OWNERSHIP)
		roster.push({
			name,
			club: fplClubs.get(e.team)!,
			nationality,
			position,
			lastName: lastName(name),
			known,
			dailyKnown,
			pop: Math.round(minutes + ownership * 100),
			webName: String(e.web_name || ''),
			cost: Number(e.now_cost) || 0,
			fplType: Number(e.element_type) || 0,
			minutes,
		})
	}

	// Most famous first, so duplicates resolve to the better-known player
	roster.sort((a, b) => b.pop - a.pop || a.name.localeCompare(b.name))
	const seen = new Set<string>()
	return roster.filter(p => (seen.has(key(p.name)) ? false : (seen.add(key(p.name)), true)))
}

// ---------------------------------------------------------------------------
// Extend the schedule (append-only)
// ---------------------------------------------------------------------------
function puzzleNumberFor(date: Date, epoch: string) {
	const [d, m, y] = epoch.split('/').map(Number)
	const epochDate = new Date(y!, m! - 1, d)
	const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
	return Math.round((day.getTime() - epochDate.getTime()) / 86400000) + 1
}

function extendAnswers(
	list: { start: number; answers: Snapshot[] },
	pool: Player[],
	lastPuzzle: number,
	noRepeat: number,
	seed: number,
	snap: (p: Player) => Snapshot = snapshot,
	weight?: (p: Player) => number,
	gapShare = 0.8,
) {
	let added = 0
	// Never ask for a gap longer than most of the pool, or picks would run dry
	const gap = Math.min(noRepeat, Math.floor(pool.length * gapShare))
	while (list.start + list.answers.length - 1 < lastPuzzle) {
		const puzzle = list.start + list.answers.length
		const recent = new Set(list.answers.slice(-gap).map(s => key(s[0])))
		const candidates = pool.filter(p => !recent.has(key(snap(p)[0])))
		const from = candidates.length ? candidates : pool
		const pick = weight ? weightedPick(from, weight, seed + puzzle) : seededShuffle(from, seed + puzzle)[0]!
		list.answers.push(snap(pick))
		added++
	}
	return added
}

/** Deterministic weighted choice: the same seed always gives the same player */
function weightedPick(from: Player[], weight: (p: Player) => number, seed: number): Player {
	const sorted = [...from].sort((a, b) => a.name.localeCompare(b.name))
	const weights = sorted.map(p => Math.max(0, weight(p)))
	const total = weights.reduce((a, b) => a + b, 0)
	let s = seed >>> 0
	for (let i = 0; i < 3; i++) s = (Math.imul(s, 1664525) + 1013904223) >>> 0
	let r = (s / 2 ** 32) * total
	for (let i = 0; i < sorted.length; i++) {
		r -= weights[i]!
		if (r < 0) return sorted[i]!
	}
	return sorted[sorted.length - 1]!
}

// Daily picks lean towards players people know: weight rises with FPL price, so a
// £10m star turns up far more often than a £4.5m squad player (who still can)
const dailyWeight = (p: Player) => Math.max(1, (p.cost || 45) - 38) ** 2

function similarity(a: Player, b: Player) {
	let score = 0
	if (a.club === b.club) score += 2
	if (a.position === b.position || group(a.position) === group(b.position)) score += 1
	if (a.nationality === b.nationality) score += 1
	else if (getConfederation(a.nationality) && getConfederation(a.nationality) === getConfederation(b.nationality)) {
		score += 1
	}
	return score
}

function extendSpot(spot: Schedule['spot'], pool: Player[], roster: Player[], lastPuzzle: number) {
	let added = 0
	while (spot.start + spot.days.length - 1 < lastPuzzle) {
		const puzzle = spot.start + spot.days.length
		const recent = new Set(spot.days.slice(-SPOT_NO_REPEAT_DAYS).flat().map(r => key(r.target[0])))
		const candidates = pool.filter(p => !recent.has(key(p.name)))
		const targets = seededShuffle(candidates.length >= SPOT_ROUNDS ? candidates : pool, 20260104 + puzzle).slice(
			0,
			SPOT_ROUNDS,
		)
		spot.days.push(
			targets.map((target, i) => {
				const roundSeed = puzzle * 1000 + i
				const shortlist = roster
					.filter(p => p.known && p.name !== target.name)
					.map(p => ({ p, score: similarity(target, p) }))
					.sort((a, b) => b.score - a.score || b.p.pop - a.p.pop)
					.slice(0, (SPOT_OPTIONS - 1) * 3)
					.map(s => s.p)
				const distractors = seededShuffle(shortlist, roundSeed).slice(0, SPOT_OPTIONS - 1)
				const options = seededShuffle([target, ...distractors], roundSeed + 1).map(p => p.name)
				return { target: snapshot(target), options }
			}),
		)
		added++
	}
	return added
}

// ---------------------------------------------------------------------------
async function main() {
	const season = currentSeason()
	console.log(OFFLINE ? 'Offline: re-planning from app/data/players.json' : `Fetching ${season}/${String(season + 1).slice(2)} squads…`)
	const previousPlayers: Player[] = existsSync(PLAYERS_PATH) ? JSON.parse(readFileSync(PLAYERS_PATH, 'utf8')) : []
	let roster = previousPlayers
	if (!OFFLINE) {
		const [fpl, fd] = await Promise.all([
			fetchJson('https://fantasy.premierleague.com/api/bootstrap-static/'),
			fetchJson(`https://api.football-data.org/v4/competitions/PL/teams?season=${season}`, {
				'X-Auth-Token': FOOTBALL_DATA_TOKEN,
			}),
		])
		const previous = new Map(previousPlayers.map(p => [key(p.name), p]))
		roster = buildRoster(fpl, fd, previous)
	}

	const before = new Set(previousPlayers.map(p => key(p.name)))
	const after = new Set(roster.map(p => key(p.name)))
	const joined = roster.filter(p => !before.has(key(p.name)))
	const left = previousPlayers.filter(p => !after.has(key(p.name)))
	const known = roster.filter(p => p.known)
	const dailyPool = roster.filter(p => p.dailyKnown && p.lastName.length === 6 && dailyEligible(p))

	console.log(`\nClubs: ${[...new Set(roster.map(p => p.club))].sort().join(', ')}`)
	const challengePool = roster.filter(p => p.dailyKnown && p.lastName.length === 5)
	console.log(
		`Players: ${roster.length} (${known.length} Scout/Spot answers, ${dailyPool.length} Daily, ${challengePool.length} Challenge)`,
	)
	console.log(`Unknown nationality: ${roster.filter(p => p.nationality === 'Unknown').map(p => p.name).join(', ') || 'none'}`)
	console.log(`No confederation for: ${[...new Set(roster.map(p => p.nationality))].filter(n => n !== 'Unknown' && !getConfederation(n)).join(', ') || 'none'}`)
	console.log(`Joined since last update: ${joined.length}${joined.length ? ` (e.g. ${joined.slice(0, 12).map(p => p.name).join(', ')})` : ''}`)
	console.log(`Left since last update: ${left.length}${left.length ? ` (e.g. ${left.slice(0, 12).map(p => p.name).join(', ')})` : ''}`)

	if (!existsSync(SCHEDULE_PATH)) throw new Error('app/data/schedule.json is missing; it must exist before extending')
	const schedule: Schedule = JSON.parse(readFileSync(SCHEDULE_PATH, 'utf8'))
	const today = puzzleNumberFor(new Date(), schedule.epoch)
	const lastPuzzle = today + HORIZON_DAYS
	// Past and today's answers are locked; a malformed future Daily answer (e.g. a
	// full name) is dropped along with everything after it and planned again
	// Also re-plan upcoming answers whose player no longer qualifies (see dailyEligible)
	const ineligible = (a: Snapshot) => {
		const p = roster.find(r => r.lastName === a[0] && r.club === a[1])
		return !!p && !dailyEligible(p)
	}
	const badDaily = schedule.daily.answers.findIndex(
		(a, i) =>
			!DAILY_ANSWER.test(a[0]) || (schedule.daily.start + i > today && (REPLAN_DAILY || ineligible(a))),
	)
	if (badDaily !== -1) {
		const puzzle = schedule.daily.start + badDaily
		if (puzzle <= today) throw new Error(`Daily #${puzzle} (${schedule.daily.answers[badDaily]![0]}) is live and not a 6-letter surname`)
		const dropped = schedule.daily.answers.splice(badDaily).length
		console.log(`Re-planning ${dropped} Daily answers from #${puzzle} (malformed, or the player no longer qualifies)`)
	}
	// A shorter no-repeat gap than Scout so the weighting has room to favour well-known names
	const addedDaily = extendAnswers(schedule.daily, dailyPool, lastPuzzle, NO_REPEAT_DAYS.daily, 20260101, dailySnapshot, dailyWeight, 0.5)
	const stillBad = schedule.daily.answers.filter(a => !DAILY_ANSWER.test(a[0]))
	if (stillBad.length) throw new Error(`Daily answers must be 6-letter surnames: ${stillBad.map(a => a[0]).join(', ')}`)
	const addedScout = extendAnswers(schedule.scout, known, lastPuzzle, NO_REPEAT_DAYS.scout, 20260102)
	const addedSpot = extendSpot(schedule.spot, known, roster, lastPuzzle)
	console.log(`\nSchedule extended to puzzle #${lastPuzzle}: +${addedDaily} Daily, +${addedScout} Scout, +${addedSpot} Spot days`)

	if (DRY_RUN) {
		console.log('\nDry run: nothing written.')
		return
	}
	writeFileSync(SCHEDULE_PATH, `${JSON.stringify(schedule)}\n`)
	if (OFFLINE) {
		console.log('\nWrote app/data/schedule.json (offline: players.json and meta.json untouched)')
		return
	}
	writeFileSync(PLAYERS_PATH, `${JSON.stringify(roster, null, '\t')}\n`)
	const meta = { season: `${season}/${String(season + 1).slice(2)}`, updated: new Date().toISOString().slice(0, 10) }
	writeFileSync(META_PATH, `${JSON.stringify(meta, null, '\t')}\n`)
	console.log('\nWrote app/data/players.json, schedule.json and meta.json')
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
