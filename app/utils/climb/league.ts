// The Climb: seasons. Made-up clubs, a double round-robin fixture list, the other results
// simulated from team ratings, the table, and what a final position means (promotion,
// play-off, relegation, the Champions League). Plain TypeScript for tests/climb-league.test.ts.
import { seededRandom } from './questions'
import type { Result } from './match'

export const YOU = 'you'

/** Teams per league, National League to Premier League. The Champions League is a group of 4. */
export const LEAGUE_SIZES = [6, 8, 10, 12, 20] as const
export const CL_TIER = 5
export const PL_TIER = 4

export interface Club {
	id: string
	name: string
	code: string
	bg: string
	fg: string
	alt: string
	shape: 'shield' | 'round' | 'square'
	pattern: 'plain' | 'stripes' | 'halves' | 'band' | 'hoop'
	/** 0-1, AI strength (unused for you) */
	rating: number
}

export interface Fixture {
	home: string
	away: string
	/** Goals, once played */
	hg?: number
	ag?: number
	/** A knockout settled on penalties: the winner */
	pens?: string
}

export interface Season {
	tier: number
	/** How many seasons this save has played, for new opponents each time */
	number: number
	seed: number
	clubs: Club[]
	/** Matchweek by matchweek */
	fixtures: Fixture[][]
	/** Champions League only: knockout rounds after the group */
	knockouts?: { round: 'Quarter-final' | 'Semi-final' | 'Final'; fixture: Fixture }[]
	/** Lower leagues: the play-off final if you finished 2nd */
	playoff?: Fixture
}

export interface Row {
	id: string
	played: number
	won: number
	drawn: number
	lost: number
	gf: number
	ga: number
	gd: number
	points: number
}

const TOWNS = ['Harrowgate', 'Castleford', 'Millbrook', 'Wexley', 'Portmere', 'Bramley', 'Stanholt', 'Ashcombe', 'Kingsmere', 'Redbridge', 'Hollins', 'Dunmore', 'Fernley', 'Calder', 'Westwick', 'Thornbury', 'Oakhurst', 'Marlow', 'Brackenridge', 'Elsworth', 'Langholm', 'Whitcombe', 'Norbury', 'Sedgefield', 'Halstead', 'Penrith Vale', 'Corby Heath', 'Ravensworth', 'Stoneleigh', 'Alderton', 'Bexford', 'Glenmoor', 'Hartfield', 'Kirkby Moor', 'Lowestoke', 'Merriton', 'Pendle', 'Rothmere', 'Saltcote', 'Tamworth Green']
const SUFFIXES = ['Athletic', 'Town', 'United', 'Rovers', 'City', 'Albion', 'Wanderers', 'County', 'FC', 'Borough']
const ELITE = ['Real Montserra', 'Inter Valtori', 'Sporting Aldena', 'Olympique Marveil', 'Dynamo Kravets', 'Ajax Veldhoven', 'Bayern Ostberg', 'Atlético Soria', 'Benfica Arruda', 'Juventus Torvale', 'Celtic Strath', 'Zenit Volga']
const COLOURS: [string, string, string][] = [
	['#7a1f2b', '#e9d9b8', '#e9d9b8'], ['#1d3f8a', '#ffffff', '#ffffff'], ['#f5f5f5', '#111111', '#111111'], ['#e3a21a', '#111111', '#111111'],
	['#5b2a86', '#ffffff', '#f2c94c'], ['#0f6b4a', '#ffffff', '#ffffff'], ['#b31b1b', '#ffffff', '#ffffff'], ['#111111', '#ffffff', '#f2c94c'],
	['#0b5394', '#ffffff', '#f2c94c'], ['#c0392b', '#ffffff', '#111111'], ['#2c3e50', '#ecf0f1', '#e74c3c'], ['#16a085', '#ffffff', '#111111'],
	['#8e44ad', '#ffffff', '#ffffff'], ['#d35400', '#ffffff', '#111111'], ['#27ae60', '#ffffff', '#ffffff'], ['#1b2a49', '#ffffff', '#c9a227'],
]
const SHAPES: Club['shape'][] = ['shield', 'shield', 'round', 'square']
const PATTERNS: Club['pattern'][] = ['plain', 'stripes', 'halves', 'band', 'hoop']

function shuffle<T>(rng: () => number, list: T[]): T[] {
	const out = [...list]
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1))
		;[out[i], out[j]] = [out[j]!, out[i]!]
	}
	return out
}

function codeFor(name: string, taken: Set<string>): string {
	const letters = name.replace(/[^A-Za-z ]/g, '').toUpperCase()
	const words = letters.split(' ').filter(Boolean)
	const candidates = [words.map(w => w[0]).join('').slice(0, 3), letters.replace(/ /g, '').slice(0, 3), `${words[0]!.slice(0, 2)}${words[words.length - 1]![0]}`]
	for (const c of candidates) if (c.length >= 2 && !taken.has(c)) return c
	let n = 2
	while (taken.has(`${letters.slice(0, 2)}${n}`)) n++
	return `${letters.slice(0, 2)}${n}`
}

/** How spread out the opponents are by tier: the lower leagues have a weaker top end, so a
 *  newcomer winning half their games still has a shout */
const TIER_STRENGTH = [0.7, 0.78, 0.86, 0.93, 1] as const

/** The made-up opponents for a season. Ratings spread from strong to weak with some noise. */
export function makeClubs(count: number, seed: number, elite = false, strength = 1): Club[] {
	const rng = seededRandom(seed)
	const names = elite
		? shuffle(rng, ELITE).slice(0, count)
		: shuffle(rng, TOWNS).slice(0, count).map(town => `${town} ${SUFFIXES[Math.floor(rng() * SUFFIXES.length)]}`)
	const colours = shuffle(rng, COLOURS)
	const taken = new Set<string>(['YOU'])
	return names.map((name, i) => {
		const code = codeFor(name, taken)
		taken.add(code)
		const [bg, fg, alt] = colours[i % colours.length]!
		const spread = count > 1 ? 1 - i / (count - 1) : 0.5
		return {
			id: `c${i}`,
			name,
			code,
			bg,
			fg,
			alt,
			shape: SHAPES[Math.floor(rng() * SHAPES.length)]!,
			pattern: PATTERNS[Math.floor(rng() * PATTERNS.length)]!,
			rating: Math.max(0, Math.min(1, (spread * 0.85 + rng() * 0.15) * strength)),
		}
	})
}

/** Circle-method double round robin: everyone plays everyone home and away */
export function makeFixtures(ids: string[], seed: number): Fixture[][] {
	const rng = seededRandom(seed)
	const teams = shuffle(rng, ids)
	if (teams.length % 2) teams.push('bye')
	const n = teams.length
	const rounds: Fixture[][] = []
	const rot = [...teams]
	for (let r = 0; r < n - 1; r++) {
		const round: Fixture[] = []
		for (let i = 0; i < n / 2; i++) {
			const a = rot[i]!
			const b = rot[n - 1 - i]!
			if (a === 'bye' || b === 'bye') continue
			round.push(r % 2 ? { home: b, away: a } : { home: a, away: b })
		}
		rounds.push(round)
		rot.splice(1, 0, rot.pop()!)
	}
	const second = rounds.map(round => round.map(f => ({ home: f.away, away: f.home })))
	return [...rounds, ...second]
}

/** Goals from a Poisson draw */
function poisson(rng: () => number, mean: number): number {
	const l = Math.exp(-mean)
	let k = 0
	let p = 1
	do {
		k++
		p *= rng()
	} while (p > l && k < 10)
	return k - 1
}

/** A result between two AI clubs */
export function simulate(home: Club, away: Club, rng: () => number): [number, number] {
	const diff = home.rating - away.rating
	return [poisson(rng, Math.max(0.25, 1.45 + 1.6 * diff)), poisson(rng, Math.max(0.2, 1.1 - 1.6 * diff))]
}

export function newSeason(tier: number, number: number, seed: number): Season {
	if (tier === CL_TIER) {
		const clubs = makeClubs(3, seed, true).map(c => ({ ...c, rating: 0.55 + c.rating * 0.4 }))
		return { tier, number, seed, clubs, fixtures: makeFixtures([YOU, ...clubs.map(c => c.id)], seed + 1), knockouts: [] }
	}
	const clubs = makeClubs(LEAGUE_SIZES[tier]! - 1, seed, false, TIER_STRENGTH[tier])
	return { tier, number, seed, clubs, fixtures: makeFixtures([YOU, ...clubs.map(c => c.id)], seed + 1) }
}

export const clubById = (s: Season, id: string): Club | undefined => s.clubs.find(c => c.id === id)

/** The matchweek you play next (index), or -1 when the league or group is finished */
export function currentMatchweek(s: Season): number {
	return s.fixtures.findIndex(round => round.some(f => f.hg === undefined))
}

export function yourFixture(s: Season, matchweek: number): Fixture | undefined {
	return s.fixtures[matchweek]?.find(f => f.home === YOU || f.away === YOU)
}

/** Records your result for the matchweek (your goals first) and simulates everyone else's */
export function playMatchweek(s: Season, matchweek: number, yourScore: [number, number]): Season {
	const rng = seededRandom(s.seed * 31 + matchweek * 7919)
	const fixtures = s.fixtures.map((round, i) => {
		if (i !== matchweek) return round
		return round.map(f => {
			if (f.home === YOU) return { ...f, hg: yourScore[0], ag: yourScore[1] }
			if (f.away === YOU) return { ...f, hg: yourScore[1], ag: yourScore[0] }
			const [hg, ag] = simulate(clubById(s, f.home)!, clubById(s, f.away)!, rng)
			return { ...f, hg, ag }
		})
	})
	return { ...s, fixtures }
}

export function table(s: Season): Row[] {
	const rows = new Map<string, Row>([YOU, ...s.clubs.map(c => c.id)].map(id => [id, { id, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }]))
	for (const round of s.fixtures) {
		for (const f of round) {
			if (f.hg === undefined || f.ag === undefined) continue
			const h = rows.get(f.home)!
			const a = rows.get(f.away)!
			h.played++
			a.played++
			h.gf += f.hg
			h.ga += f.ag
			a.gf += f.ag
			a.ga += f.hg
			if (f.hg > f.ag) {
				h.won++
				a.lost++
				h.points += 3
			} else if (f.hg < f.ag) {
				a.won++
				h.lost++
				a.points += 3
			} else {
				h.drawn++
				a.drawn++
				h.points++
				a.points++
			}
		}
	}
	const rating = (id: string) => clubById(s, id)?.rating ?? 0.5
	return [...rows.values()]
		.map(r => ({ ...r, gd: r.gf - r.ga }))
		.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || rating(b.id) - rating(a.id))
}

/** Where an opponent sits, which moves your target: top two, bottom, or in between. Before a
 *  ball is kicked everyone is level, so nobody counts as top or bottom. */
export function standing(s: Season, id: string): 'top' | 'mid' | 'bottom' {
	const rows = table(s)
	if (!rows.some(r => r.played > 0)) return 'mid'
	const order = rows.map(r => r.id)
	const i = order.indexOf(id)
	if (s.tier === CL_TIER || i < 0) return 'mid'
	if (i <= 1) return 'top'
	if (i === order.length - 1) return 'bottom'
	return 'mid'
}

export type Outcome =
	| { kind: 'champions'; position: 1; promoted: boolean }
	| { kind: 'playoff'; position: 2 }
	| { kind: 'europe'; position: number }
	| { kind: 'relegated'; position: number }
	| { kind: 'stay'; position: number }
	| { kind: 'cl-group-out'; position: number }
	| { kind: 'cl-knockouts'; position: number }

/** What your final league (or group) position means */
export function outcomeFor(s: Season): Outcome {
	const position = table(s).findIndex(r => r.id === YOU) + 1
	const size = s.clubs.length + 1
	if (s.tier === CL_TIER) return position <= 2 ? { kind: 'cl-knockouts', position } : { kind: 'cl-group-out', position }
	if (position === 1) return { kind: 'champions', position: 1, promoted: s.tier < PL_TIER }
	if (s.tier === PL_TIER) {
		if (position <= 4) return { kind: 'europe', position }
		if (position > size - 3) return { kind: 'relegated', position }
		return { kind: 'stay', position }
	}
	if (position === 2) return { kind: 'playoff', position: 2 }
	if (position === size && s.tier > 0) return { kind: 'relegated', position }
	return { kind: 'stay', position }
}

/** The tier your next season is played in */
export function nextTier(s: Season, outcome: Outcome, wonPlayoff = false): number {
	switch (outcome.kind) {
		case 'champions':
			return s.tier === PL_TIER ? CL_TIER : s.tier + 1
		case 'europe':
			return CL_TIER
		case 'playoff':
			return wonPlayoff ? s.tier + 1 : s.tier
		case 'relegated':
			return s.tier - 1
		case 'cl-group-out':
		case 'cl-knockouts':
			return PL_TIER
		default:
			return s.tier
	}
}

const ROUNDS = ['Quarter-final', 'Semi-final', 'Final'] as const

/** Champions League: the next knockout tie after the group (or after winning the last one) */
export function nextKnockout(s: Season): Season {
	const done = s.knockouts ?? []
	if (done.length >= ROUNDS.length) return s
	const rng = seededRandom(s.seed + 500 + done.length)
	const opponent = makeClubs(1, s.seed + 900 + done.length, true)[0]!
	const club = { ...opponent, id: `k${done.length}`, rating: 0.7 + rng() * 0.3 }
	return { ...s, clubs: [...s.clubs, club], knockouts: [...done, { round: ROUNDS[done.length]!, fixture: { home: YOU, away: club.id } }] }
}

/** Lower leagues: the play-off final against whoever finished 3rd */
export function withPlayoff(s: Season): Season {
	const third = table(s)[2]!.id
	return { ...s, playoff: { home: YOU, away: third } }
}

/** Your result in a one-off tie (play-off or knockout); a draw goes to penalties */
export function tieResult(f: Fixture): Result | 'pens-won' | 'pens-lost' | null {
	if (f.hg === undefined || f.ag === undefined) return null
	if (f.hg !== f.ag) return f.hg > f.ag ? 'W' : 'L'
	if (!f.pens) return 'D'
	return f.pens === YOU ? 'pens-won' : 'pens-lost'
}
