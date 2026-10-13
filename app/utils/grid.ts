// The Grid's engine: rows, fair grids, picking grids, checking guesses and points.
// Pure TypeScript with no imports, so the app, the tests and the schedule script
// (scripts/plan-grid-weeks.ts, run with node --experimental-strip-types) all share it.

export interface GridPlayer {
	name: string
	club: string
	nationality: string
	fplType: number
	cost: number
	known: boolean
	pop: number
}

/** A row down the side: a country, or one of the few non-country rows */
export type RowId = string // 'nat:France' | 'pos:GK' | 'pos:FWD' | 'price:70'

export interface GridDeal {
	clubs: [string, string, string]
	rows: [RowId, RowId, RowId]
}

export interface FairGrid extends GridDeal {
	/** Squares with exactly one well-known answer */
	singles: number
	england: boolean
}

export const OTHER_ROWS: RowId[] = ['pos:GK', 'pos:FWD', 'price:70']
export const TOP_COUNTRIES = 10
/** Wrong guesses a square can take; the next one locks it at 0 */
export const MAX_WRONG = 4
export const SQUARE_POINTS = 100
export const WRONG_COST = 25
export const HINT_COST = 50
export const GRIDS_PER_WEEK = 5

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

export function isCountryRow(row: RowId): boolean {
	return row.startsWith('nat:')
}

export function rowLabel(row: RowId): string {
	if (isCountryRow(row)) return row.slice(4)
	if (row === 'pos:GK') return 'Goalkeeper'
	if (row === 'pos:FWD') return 'Forward'
	if (row === 'price:70') return 'Priced £7m+'
	return row
}

export function rowKind(row: RowId): string {
	if (isCountryRow(row)) return 'Country'
	if (row.startsWith('pos:')) return 'Position'
	return 'Price'
}

export function fitsRow(p: GridPlayer, row: RowId): boolean {
	if (isCountryRow(row)) return p.nationality === row.slice(4)
	if (row === 'pos:GK') return p.fplType === 1
	if (row === 'pos:FWD') return p.fplType === 4
	if (row === 'price:70') return p.cost >= 70
	return false
}

/** The rows grids are made from: the most common countries (ties broken by name, so the
 *  list doesn't depend on file order), then the non-country rows */
export function gridRows(players: GridPlayer[]): RowId[] {
	const counts = new Map<string, number>()
	for (const p of players) counts.set(p.nationality, (counts.get(p.nationality) ?? 0) + 1)
	const countries = [...counts.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.slice(0, TOP_COUNTRIES)
		.map(([n]) => `nat:${n}`)
	return [...countries, ...OTHER_ROWS]
}

export function gridClubs(players: GridPlayer[]): string[] {
	return [...new Set(players.map(p => p.club))].sort()
}

// ---------------------------------------------------------------------------
// Answers and fairness
// ---------------------------------------------------------------------------

/** Every player who fits a square, most famous first */
export function answersFor(players: GridPlayer[], club: string, row: RowId): GridPlayer[] {
	return players.filter(p => p.club === club && fitsRow(p, row)).sort((a, b) => b.pop - a.pop)
}

/** Square index (0-8, row by row) to its club and row */
export function squareOf(deal: GridDeal, i: number): { club: string; row: RowId } {
	return { club: deal.clubs[i % 3]!, row: deal.rows[Math.floor(i / 3)]! }
}

/** Can the given squares each get a different player? candidates[k] lists the names that
 *  fit square k. A simple augmenting-path matching: at most 9 squares, so it's instant. */
export function hasDistinctFill(candidates: string[][]): boolean {
	const owner = new Map<string, number>()
	const tryAssign = (k: number, seen: Set<string>): boolean => {
		for (const name of candidates[k]!) {
			if (seen.has(name)) continue
			seen.add(name)
			const current = owner.get(name)
			if (current === undefined || tryAssign(current, seen)) {
				owner.set(name, k)
				return true
			}
		}
		return false
	}
	return candidates.every((_, k) => tryAssign(k, new Set()))
}

/** A grid is fair when every square has a well-known answer, it has at most one
 *  non-country row, and nine different well-known players can fill it */
export function checkFair(players: GridPlayer[], deal: GridDeal): { ok: boolean; singles: number } {
	if (deal.rows.filter(r => !isCountryRow(r)).length > 1) return { ok: false, singles: 0 }
	const candidates: string[][] = []
	let singles = 0
	for (let i = 0; i < 9; i++) {
		const { club, row } = squareOf(deal, i)
		const known = answersFor(players, club, row).filter(p => p.known).map(p => p.name)
		if (!known.length) return { ok: false, singles: 0 }
		if (known.length === 1) singles++
		candidates.push(known)
	}
	return { ok: hasDistinctFill(candidates), singles }
}

/** Every fair grid (clubs and rows in sorted order). About 2,800 with current squads. */
export function allFairGrids(players: GridPlayer[]): FairGrid[] {
	const clubs = gridClubs(players)
	const rows = gridRows(players)
	// Well-known players per (club, row), worked out once
	const known = new Map<string, string[]>()
	for (const c of clubs) for (const r of rows) known.set(`${c}|${r}`, answersFor(players, c, r).filter(p => p.known).map(p => p.name))
	const out: FairGrid[] = []
	for (let a = 0; a < clubs.length; a++)
		for (let b = a + 1; b < clubs.length; b++)
			for (let c = b + 1; c < clubs.length; c++) {
				const cs = [clubs[a]!, clubs[b]!, clubs[c]!]
				for (let x = 0; x < rows.length; x++)
					for (let y = x + 1; y < rows.length; y++)
						for (let z = y + 1; z < rows.length; z++) {
							const rs = [rows[x]!, rows[y]!, rows[z]!]
							if (rs.filter(r => !isCountryRow(r)).length > 1) continue
							const candidates: string[][] = []
							let singles = 0
							let ok = true
							for (const r of rs)
								for (const cl of cs) {
									const k = known.get(`${cl}|${r}`)!
									if (!k.length) {
										ok = false
										break
									}
									if (k.length === 1) singles++
									candidates.push(k)
								}
							if (!ok || !hasDistinctFill(candidates)) continue
							out.push({ clubs: cs as GridDeal['clubs'], rows: rs as GridDeal['rows'], singles, england: rs.includes('nat:England') })
						}
			}
	return out
}

const keyCache = new WeakMap<object, string>()

/** The same grid whatever order its clubs and rows are in */
export function gridKey(deal: GridDeal): string {
	let key = keyCache.get(deal)
	if (!key) {
		key = `${[...deal.clubs].sort().join(',')}|${[...deal.rows].sort().join(',')}`
		keyCache.set(deal, key)
	}
	return key
}

// ---------------------------------------------------------------------------
// Picking grids
// ---------------------------------------------------------------------------

export function mulberry32(seed: number): () => number {
	let a = seed >>> 0
	return () => {
		a = (a + 0x6d2b79f5) >>> 0
		let t = a
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

function shuffled<T>(arr: readonly T[], rng: () => number): T[] {
	const a = [...arr]
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1))
		;[a[i], a[j]] = [a[j]!, a[i]!]
	}
	return a
}

/** Puts the clubs and rows in a random order, so the same grid doesn't always look alike */
export function arrange(grid: GridDeal, rng: () => number): GridDeal {
	return { clubs: shuffled(grid.clubs, rng) as GridDeal['clubs'], rows: shuffled(grid.rows, rng) as GridDeal['rows'] }
}

/** England is in most fair grids, so it's capped: about 4 grids in 10 */
export const ENGLAND_SHARE = 0.4

/** A practice grid: random, England capped, and none of the recently played grids */
export function pickPracticeGrid(grids: FairGrid[], rng: () => number, recent: string[] = []): GridDeal {
	const avoid = new Set(recent)
	const fresh = grids.filter(g => !avoid.has(gridKey(g)))
	const pool = fresh.length ? fresh : grids
	const wantEngland = rng() < ENGLAND_SHARE
	const preferred = pool.filter(g => g.england === wantEngland)
	const from = preferred.length ? preferred : pool
	return arrange(from[Math.floor(rng() * from.length)]!, rng)
}

/** Five grids for one week, never a grid used in an earlier week (`used` is updated).
 *  Ideally no club twice and England in at most two; some clubs only have well-known
 *  English players, so those limits relax a step at a time when a week can't meet them. */
export function pickWeek(grids: FairGrid[], rng: () => number, used: Set<string>): GridDeal[] {
	const fresh = grids.filter(g => !used.has(gridKey(g)))
	const levels = [
		{ england: 2, perClub: 1 },
		{ england: 3, perClub: 1 },
		{ england: 3, perClub: 2 },
		{ england: GRIDS_PER_WEEK, perClub: 2 },
	]
	for (const level of levels) {
		for (let attempt = 0; attempt < 60; attempt++) {
			const week: FairGrid[] = []
			const clubCount = new Map<string, number>()
			let england = 0
			for (const g of shuffled(fresh, rng)) {
				if (week.length === GRIDS_PER_WEEK) break
				if (g.clubs.some(c => (clubCount.get(c) ?? 0) >= level.perClub)) continue
				if (g.england && england >= level.england) continue
				if (week.some(w => gridKey(w) === gridKey(g))) continue
				week.push(g)
				g.clubs.forEach(c => clubCount.set(c, (clubCount.get(c) ?? 0) + 1))
				if (g.england) england++
			}
			if (week.length === GRIDS_PER_WEEK) {
				week.forEach(g => used.add(gridKey(g)))
				return week.map(g => arrange(g, rng))
			}
		}
	}
	throw new Error('Could not plan a fair Grid Week from the current squads')
}

// ---------------------------------------------------------------------------
// Weeks
// ---------------------------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000

function utcDay(ddmmyyyy: string): number {
	const [d, m, y] = ddmmyyyy.split('/').map(Number)
	return Date.UTC(y!, m! - 1, d!)
}

function ddmmyyyy(ms: number): string {
	const d = new Date(ms)
	return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
}

/** Grid Week runs Saturday to Friday (UK dates). The week's number from the epoch Saturday. */
export function weekIndex(epoch: string, today: string): number {
	return Math.floor((utcDay(today) - utcDay(epoch)) / (7 * DAY))
}

/** The Saturday a week starts on */
export function weekStart(epoch: string, index: number): string {
	return ddmmyyyy(utcDay(epoch) + index * 7 * DAY)
}

// ---------------------------------------------------------------------------
// Guesses, hints and points
// ---------------------------------------------------------------------------

const TRANSLIT: Record<string, string> = { ø: 'o', đ: 'd', ł: 'l', ı: 'i', æ: 'ae', œ: 'oe', ß: 'ss', ð: 'd', þ: 'th' }

/** Accent-insensitive key, so "odegaard" finds "ødegaard" (same rule as the other modes) */
export function nameKey(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/[øđłıæœßðþ]/g, c => TRANSLIT[c]!)
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
}

export type GuessResult = 'correct' | 'wrong' | 'repeat' | 'unknown'

/** Checks a guess for a square. `unknown` (not a player in the game) costs nothing. */
export function checkGuess(players: GridPlayer[], deal: GridDeal, square: number, name: string, used: string[]): { result: GuessResult; player?: GridPlayer } {
	const key = nameKey(name)
	const player = players.find(p => nameKey(p.name) === key)
	if (!player) return { result: 'unknown' }
	if (used.includes(player.name)) return { result: 'repeat', player }
	const { club, row } = squareOf(deal, square)
	return { result: player.club === club && fitsRow(player, row) ? 'correct' : 'wrong', player }
}

export interface SquareState {
	player: string | null
	wrong: number
	hinted: boolean
	hintLetter: string | null
}

export function emptySquare(): SquareState {
	return { player: null, wrong: 0, hinted: false, hintLetter: null }
}

export function isLocked(s: SquareState): boolean {
	return !s.player && s.wrong >= MAX_WRONG
}

/** 100 for a first-time answer, minus 25 per wrong guess and 50 for a hint; 0 if unsolved */
export function squarePoints(s: SquareState): number {
	if (!s.player) return 0
	return Math.max(0, SQUARE_POINTS - WRONG_COST * s.wrong - (s.hinted ? HINT_COST : 0))
}

export function gridPoints(squares: SquareState[]): number {
	return squares.reduce((sum, s) => sum + squarePoints(s), 0)
}

/** The surname as shown (everything after the first name), for hint letters */
export function shownSurname(name: string): string {
	const parts = name.trim().split(/\s+/)
	return parts.length > 1 ? parts.slice(1).join(' ') : parts[0]!
}

/** The answer a hint points at for a square: the most famous well-known player who fits,
 *  isn't used, and still leaves the other open squares fillable. Null if there's none. */
export function hintAnswer(players: GridPlayer[], deal: GridDeal, squares: SquareState[], square: number): GridPlayer | null {
	const used = new Set(squares.map(s => s.player).filter((n): n is string => !!n))
	const open = squares.map((s, i) => i).filter(i => !squares[i]!.player && !isLocked(squares[i]!) && i !== square)
	const knownFor = (i: number) => {
		const { club, row } = squareOf(deal, i)
		return answersFor(players, club, row).filter(p => p.known && !used.has(p.name))
	}
	for (const candidate of knownFor(square)) {
		const others = open.map(i => knownFor(i).map(p => p.name).filter(n => n !== candidate.name))
		if (hasDistinctFill(others)) return candidate
	}
	return null
}

/** One answer to show for a square left unsolved, once the grid is finished */
export function revealAnswer(players: GridPlayer[], deal: GridDeal, square: number, used: string[]): string | null {
	const { club, row } = squareOf(deal, square)
	return answersFor(players, club, row).find(p => !used.includes(p.name))?.name ?? null
}
