import { getConfederation, type Confederation } from '../composables/useConfederations'
import { getPositionGroup, roster, type Footballer, type PositionGroup } from '../composables/useFootballers'
import { normaliseKey } from '../composables/useAllFootballers'

// Scout Report's clue rules (1.3): clubs are close by region, positions by neighbouring
// line, nations by continent, plus a fantasy price with higher/lower. And the daily
// scout's brief: two facts about the target, picked so a steady number of players fit.

export type Region = 'london' | 'north-west' | 'north-east' | 'midlands' | 'south'

export const REGION_NAMES: Record<Region, { short: string; phrase: string }> = {
	'london': { short: 'London', phrase: 'London' },
	'north-west': { short: 'North West', phrase: 'the North West' },
	'north-east': { short: 'NE & Yorkshire', phrase: 'the North East and Yorkshire' },
	'midlands': { short: 'Midlands', phrase: 'the Midlands' },
	'south': { short: 'South & East', phrase: 'the South and East' },
}

const CLUB_REGIONS: Record<string, Region> = {
	'Arsenal': 'london',
	'Brentford': 'london',
	'Chelsea': 'london',
	'Crystal Palace': 'london',
	'Fulham': 'london',
	'Tottenham': 'london',
	'Everton': 'north-west',
	'Liverpool': 'north-west',
	'Manchester City': 'north-west',
	'Manchester United': 'north-west',
	'Hull City': 'north-east',
	'Leeds United': 'north-east',
	'Newcastle': 'north-east',
	'Sunderland': 'north-east',
	'Aston Villa': 'midlands',
	'Coventry City': 'midlands',
	'Nottingham Forest': 'midlands',
	'Bournemouth': 'south',
	'Brighton & Hove Albion': 'south',
	'Ipswich Town': 'south',
}

export function regionOf(club: string): Region | null {
	return CLUB_REGIONS[club] ?? null
}

// Three-letter codes for the dossier's club lists
export const CLUB_CODES: Record<string, string> = {
	'Arsenal': 'ARS', 'Aston Villa': 'AVL', 'Bournemouth': 'BOU', 'Brentford': 'BRE',
	'Brighton & Hove Albion': 'BHA', 'Chelsea': 'CHE', 'Coventry City': 'COV', 'Crystal Palace': 'CRY',
	'Everton': 'EVE', 'Fulham': 'FUL', 'Hull City': 'HUL', 'Ipswich Town': 'IPS',
	'Leeds United': 'LEE', 'Liverpool': 'LIV', 'Manchester City': 'MCI', 'Manchester United': 'MUN',
	'Newcastle': 'NEW', 'Nottingham Forest': 'NFO', 'Sunderland': 'SUN', 'Tottenham': 'TOT',
}
export const clubCode = (club: string) => CLUB_CODES[club] ?? club.slice(0, 3).toUpperCase()

/** The clubs in a region, for the dossier ("NEW · SUN · LEE · HUL") */
export function clubsIn(region: Region): string[] {
	return Object.entries(CLUB_REGIONS).filter(([, r]) => r === region).map(([club]) => club)
}

export const CONTINENTS: Record<Confederation, { name: string; adjective: string }> = {
	UEFA: { name: 'Europe', adjective: 'European' },
	CONMEBOL: { name: 'South America', adjective: 'South American' },
	CONCACAF: { name: 'North America', adjective: 'North American' },
	CAF: { name: 'Africa', adjective: 'African' },
	AFC: { name: 'Asia', adjective: 'Asian' },
	OFC: { name: 'Oceania', adjective: 'Oceanian' },
}

export function continentOf(nationality: string): Confederation | null {
	return getConfederation(nationality)
}

// Defence, midfield and attack are neighbours in that order; a goalkeeper is only ever a goalkeeper
const LINES: PositionGroup[] = ['Defender', 'Midfielder', 'Forward']
export function positionsAreNear(a: PositionGroup, b: PositionGroup): boolean {
	if (a === b) return false
	const i = LINES.indexOf(a)
	const j = LINES.indexOf(b)
	return i >= 0 && j >= 0 && Math.abs(i - j) === 1
}

/** Fantasy price in tenths of a million (55 = £5.5m), from the current squads; null if unknown */
const priceByName = new Map(roster.filter(p => p.cost).map(p => [normaliseKey(p.name), p.cost!]))
export function priceOf(name: string): number | null {
	return priceByName.get(normaliseKey(name)) ?? null
}
export const formatPrice = (tenths: number) => `£${(tenths / 10).toFixed(1)}m`

/** Cheapest and dearest player in the squads, the ends of the dossier's price bar */
const prices = roster.map(p => p.cost ?? 0).filter(c => c > 0)
export const PRICE_RANGE = { min: Math.min(...prices), max: Math.max(...prices) }

/** Within £1m counts as close */
export const PRICE_CLOSE = 10

export function comparePrice(guess: number, answer: number): { state: 'correct' | 'present' | 'absent'; arrow: 'up' | 'down' | null } {
	if (guess === answer) return { state: 'correct', arrow: null }
	return { state: Math.abs(guess - answer) <= PRICE_CLOSE ? 'present' : 'absent', arrow: answer > guess ? 'up' : 'down' }
}

// ---------------------------------------------------------------------------- the brief

export type BriefFact = 'continent' | 'position' | 'region'
export interface ScoutBrief {
	facts: BriefFact[]
	text: string
	continent?: Confederation
	position?: PositionGroup
	region?: Region
}

// The players a brief is measured against: the ones the Scout answers are drawn from
const briefPool = roster
	.filter(p => p.known)
	.map(p => ({ continent: continentOf(p.nationality), position: getPositionGroup(p.position), region: regionOf(p.club) }))

const PAIRS: [BriefFact, BriefFact][] = [
	['region', 'continent'],
	['region', 'position'],
	['continent', 'position'],
]
// Aim for about this many players fitting the brief: enough to need real scouting
const BRIEF_TARGET = 45

const POSITION_NOUNS: Record<PositionGroup, string> = {
	Goalkeeper: 'goalkeeper',
	Defender: 'defender',
	Midfielder: 'midfielder',
	Forward: 'forward',
}
// "an African", but "a European" (it starts with a "you" sound)
const article = (word: string) => (/^[aeiou]/i.test(word) && !/^eu/i.test(word) ? 'an' : 'a')

export function scoutBrief(answer: Footballer): ScoutBrief | null {
	const facts = {
		continent: continentOf(answer.nationality) ?? undefined,
		position: getPositionGroup(answer.position),
		region: regionOf(answer.club) ?? undefined,
	}
	let best: { pair: [BriefFact, BriefFact]; fit: number } | null = null
	for (const pair of PAIRS) {
		if (pair.some(f => facts[f] === undefined)) continue
		const fit = briefPool.filter(p => pair.every(f => p[f] === facts[f])).length
		if (!best || Math.abs(fit - BRIEF_TARGET) < Math.abs(best.fit - BRIEF_TARGET)) best = { pair, fit }
	}
	if (!best) return null
	const has = (f: BriefFact) => best!.pair.includes(f)
	const position = POSITION_NOUNS[facts.position]
	const adjective = facts.continent ? CONTINENTS[facts.continent].adjective : ''
	const place = facts.region ? REGION_NAMES[facts.region].phrase : ''
	let text: string
	if (has('region') && has('continent')) text = `We're after ${article(adjective)} ${adjective} at a club in ${place}.`
	else if (has('region') && has('position')) text = `${article(position).replace(/^a/, 'A')} ${position} at a club in ${place} has caught our eye.`
	else text = `We're after ${article(adjective)} ${adjective} ${position}.`
	return {
		facts: best.pair,
		text,
		continent: has('continent') ? facts.continent : undefined,
		position: has('position') ? facts.position : undefined,
		region: has('region') ? facts.region : undefined,
	}
}
