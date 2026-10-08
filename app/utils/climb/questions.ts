// The Climb: Odd One Out questions. Each question shows a few players; all but one (two in
// the Champions League) share a link (the same club, nation or position) and the player taps
// the odd one out. Plain TypeScript with no Nuxt imports, so tests/climb-questions.test.ts
// can generate thousands of questions and prove every one has exactly one answer.

export interface ClimbPlayer {
	name: string
	club: string
	nationality: string
	position: string
	pop?: number
	cost?: number
	minutes?: number
}

export type LinkType = 'club' | 'nation' | 'position'

export interface TierRules {
	/** 0 = National League … 5 = Champions League */
	tier: number
	/** Share of players (most famous first) the tier draws from */
	poolShare: number
	/** Links the group can share */
	links: LinkType[]
	/** Position links limited to these until all positions are allowed */
	positions?: string[]
	cards: 4 | 5 | 6
	oddOnes: 1 | 2
	/** Odd ones chosen to look like they belong (sharing something with part of the group) */
	decoys: boolean
}

export interface Question {
	cards: ClimbPlayer[]
	/** Indexes into cards of the odd one(s) out */
	odd: number[]
	link: { type: LinkType; value: string }
}

export const TIER_NAMES = ['National League', 'League Two', 'League One', 'Championship', 'Premier League', 'Champions League'] as const

export const TIERS: TierRules[] = [
	{ tier: 0, poolShare: 0.09, links: ['club'], cards: 4, oddOnes: 1, decoys: false },
	{ tier: 1, poolShare: 0.21, links: ['club', 'nation'], cards: 4, oddOnes: 1, decoys: false },
	{ tier: 2, poolShare: 0.39, links: ['club', 'nation', 'position'], positions: ['Goalkeeper', 'Defender'], cards: 4, oddOnes: 1, decoys: false },
	{ tier: 3, poolShare: 0.5, links: ['club', 'nation', 'position'], cards: 4, oddOnes: 1, decoys: true },
	{ tier: 4, poolShare: 0.66, links: ['club', 'nation', 'position'], cards: 5, oddOnes: 1, decoys: true },
	{ tier: 5, poolShare: 1, links: ['club', 'nation', 'position'], cards: 6, oddOnes: 2, decoys: true },
]

/** Every question shows at least this many well-known players, even in the Champions League */
export const MIN_KNOWN = 2
/** "Well known" = within the League Two pool */
const KNOWN_SHARE = 0.21
/** England has a third of the players, so nation links pick it less often */
const ENGLAND_WEIGHT = 0.35

/** FPL's four positions (a few players come through with detailed ones) */
export function positionGroup(position: string): string {
	const p = position.toLowerCase()
	if (p.includes('keeper')) return 'Goalkeeper'
	if (p.includes('back') || p.includes('defen')) return 'Defender'
	if (p.includes('forward') || p.includes('striker') || p.includes('wing')) return 'Forward'
	return 'Midfielder'
}

export function attribute(player: ClimbPlayer, type: LinkType): string {
	if (type === 'club') return player.club
	if (type === 'nation') return player.nationality
	return positionGroup(player.position)
}

/** Most famous first: the better of a player's ownership rank and price rank, so expensive or
 *  injured stars with low ownership still count as famous */
export function rankByFame(players: ClimbPlayer[]): ClimbPlayer[] {
	const byPop = [...players].sort((a, b) => (b.pop ?? 0) - (a.pop ?? 0))
	const byCost = [...players].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0))
	const popRank = new Map(byPop.map((p, i) => [p.name, i]))
	const costRank = new Map(byCost.map((p, i) => [p.name, i]))
	const score = (p: ClimbPlayer) => Math.min(popRank.get(p.name)!, costRank.get(p.name)!)
	return [...players].sort((a, b) => score(a) - score(b) || (b.pop ?? 0) - (a.pop ?? 0) || a.name.localeCompare(b.name))
}

/** A small seeded random number generator (mulberry32), so a level's questions can be repeated */
export function seededRandom(seed: number): () => number {
	let s = seed >>> 0
	return () => {
		s = (s + 0x6d2b79f5) >>> 0
		let t = s
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

const pick = <T>(rng: () => number, list: T[]): T => list[Math.floor(rng() * list.length)]!

function pickWeighted<T>(rng: () => number, list: T[], weight: (item: T) => number): T {
	const total = list.reduce((n, item) => n + weight(item), 0)
	let r = rng() * total
	for (const item of list) {
		r -= weight(item)
		if (r <= 0) return item
	}
	return list[list.length - 1]!
}

function shuffle<T>(rng: () => number, list: T[]): T[] {
	const out = [...list]
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1))
		;[out[i], out[j]] = [out[j]!, out[i]!]
	}
	return out
}

function subsets<T>(list: T[], size: number): T[][] {
	if (size === 0) return [[]]
	if (list.length < size) return []
	const [first, ...rest] = list
	return [...subsets(rest, size - 1).map(s => [first!, ...s]), ...subsets(rest, size)]
}

/** Does this set of players share a club, a nation or a position? Checked across all three
 *  whatever the tier allows, because a player can't know which links are in play */
function shareAnyLink(group: ClimbPlayer[]): boolean {
	return (['club', 'nation', 'position'] as LinkType[]).some(type => new Set(group.map(p => attribute(p, type))).size === 1)
}

/** The odd one(s) out if exactly one group of the right size shares a link, otherwise null.
 *  This is the fairness check: a question with two possible answers is never shown. */
export function solve(cards: ClimbPlayer[], oddOnes: number): number[] | null {
	const indexes = cards.map((_, i) => i)
	const linked = subsets(indexes, cards.length - oddOnes).filter(group => shareAnyLink(group.map(i => cards[i]!)))
	if (linked.length !== 1) return null
	const group = new Set(linked[0])
	return indexes.filter(i => !group.has(i))
}

export interface Pools {
	pool: ClimbPlayer[]
	known: Set<string>
}

export function poolsFor(ranked: ClimbPlayer[], rules: TierRules): Pools {
	const pool = ranked.slice(0, Math.max(12, Math.round(ranked.length * rules.poolShare)))
	const known = new Set(ranked.slice(0, Math.round(ranked.length * KNOWN_SHARE)).map(p => p.name))
	return { pool, known }
}

const MAX_TRIES = 400

/** One question for a tier, or null if none could be built (shouldn't happen with real data) */
export function generateQuestion(pools: Pools, rules: TierRules, rng: () => number, avoid: Set<string> = new Set()): Question | null {
	const groupSize = rules.cards - rules.oddOnes
	const usable = pools.pool.filter(p => !avoid.has(p.name))
	for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
		const type = pick(rng, rules.links)
		const values = new Map<string, ClimbPlayer[]>()
		for (const p of usable) {
			const value = attribute(p, type)
			if (type === 'position' && rules.positions && !rules.positions.includes(value)) continue
			values.set(value, [...(values.get(value) ?? []), p])
		}
		const options = [...values].filter(([, members]) => members.length >= groupSize)
		if (!options.length) continue
		const [value, members] = pickWeighted(rng, options, ([v]) => (type === 'nation' && v === 'England' ? ENGLAND_WEIGHT : 1))
		const group = shuffle(rng, members).slice(0, groupSize)
		const outsiders = usable.filter(p => attribute(p, type) !== value)
		const odd: ClimbPlayer[] = []
		for (let i = 0; i < rules.oddOnes; i++) {
			const candidates = outsiders.filter(p => !odd.includes(p))
			// A decoy shares something (club, nation or position) with part of the group
			const decoys = rules.decoys
				? candidates.filter(p => (['club', 'nation', 'position'] as LinkType[]).some(t => t !== type && group.some(g => attribute(g, t) === attribute(p, t))))
				: []
			odd.push(pick(rng, decoys.length ? decoys : candidates))
		}
		const cards = shuffle(rng, [...group, ...odd])
		if (cards.filter(p => pools.known.has(p.name)).length < Math.min(MIN_KNOWN, cards.length)) continue
		const answer = solve(cards, rules.oddOnes)
		if (!answer) continue
		return { cards, odd: answer, link: { type, value } }
	}
	return null
}

/** A match's questions: no player twice and no link used twice in the same match */
export function generateMatch(players: ClimbPlayer[], tier: number, seed: number, count = 10): Question[] {
	const rules = TIERS[tier]!
	const pools = poolsFor(rankByFame(players), rules)
	const rng = seededRandom(seed)
	const used = new Set<string>()
	const links = new Set<string>()
	const questions: Question[] = []
	for (let i = 0; questions.length < count && i < count * 20; i++) {
		const q = generateQuestion(pools, rules, rng, used)
		if (!q) break
		const linkKey = `${q.link.type}:${q.link.value}`
		if (links.has(linkKey) && i < count * 10) continue
		links.add(linkKey)
		q.cards.forEach(p => used.add(p.name))
		questions.push(q)
	}
	return questions
}
