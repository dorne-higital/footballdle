import type { Footballer } from './useFootballers'
import { answerSchedule, fromSnapshot, getPuzzleNumber, recentFrom, roster } from './useFootballers'

// Letters that don't decompose into base letter + accent, so NFD alone leaves them
// ("odegaard" has to find "ødegaard")
const TRANSLIT: Record<string, string> = { ø: 'o', đ: 'd', ł: 'l', ı: 'i', æ: 'ae', œ: 'oe', ß: 'ss', ð: 'd', þ: 'th' }

// Full first+last name roster (no letter-count restriction), used by Scout Report and
// Spot the Baller — both pick a player via autocomplete/multiple choice rather than
// typing into a fixed-length grid like Daily. Current players (app/data/players.json,
// most famous first) plus recent Scout / Spot answers, so today's always resolves.
export const allFootballers: Footballer[] = (() => {
	const seen = new Set<string>()
	const list: Footballer[] = []
	const add = (f: Footballer) => {
		const k = normaliseKey(f.name)
		if (!seen.has(k)) {
			seen.add(k)
			list.push(f)
		}
	}
	for (const p of roster) add({ name: p.name, club: p.club, nationality: p.nationality, position: p.position })
	for (const a of answerSchedule.scout.answers.slice(Math.max(0, recentFrom - answerSchedule.scout.start))) {
		add(fromSnapshot(a))
	}
	for (const day of answerSchedule.spot.days.slice(Math.max(0, recentFrom - answerSchedule.spot.start))) {
		for (const r of day) add(fromSnapshot(r.target))
	}
	return list
})()

// Diacritic-insensitive comparison key — search/validation shouldn't require
// typing accented characters (e.g. "traore" should find "traoré"); the
// accented form is still what's displayed and stored.
function normaliseKey(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/[øđłıæœßðþ]/g, (c) => TRANSLIT[c]!)
		.toUpperCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
}

const allFootballerSet = new Set(allFootballers.map((f) => normaliseKey(f.name)))
const allFootballerMap = new Map(allFootballers.map((f) => [normaliseKey(f.name), f]))

export function isValidFullFootballer(name: string): boolean {
	return allFootballerSet.has(normaliseKey(name))
}

export function getFullPlayerData(name: string): Footballer | undefined {
	return allFootballerMap.get(normaliseKey(name))
}

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

// Only used past the end of the schedule: a deterministic pick from known players
const SCOUT_SHUFFLE_SEED = 20260102
const scoutFallbackPool = seededShuffle(
	roster.filter(p => p.known).map(p => p.name),
	SCOUT_SHUFFLE_SEED,
)

/** The Scout answer for a date, with its attributes as they were that day */
export function getScoutAnswerPlayerForDay(dateStr: string): Footballer | undefined {
	const puzzle = getPuzzleNumber(dateStr)
	const scheduled = answerSchedule.scout.answers[puzzle - answerSchedule.scout.start]
	if (scheduled) return fromSnapshot(scheduled)
	const len = scoutFallbackPool.length
	return getFullPlayerData(scoutFallbackPool[(((puzzle - 1) % len) + len) % len] ?? '')
}

export function getScoutAnswerForDay(dateStr: string): string {
	return getScoutAnswerPlayerForDay(dateStr)?.name ?? ''
}

// Player-name suggestions for an autocomplete input, filtered by a
// diacritic-insensitive substring match, excluding already-guessed names.
export function searchFullFootballers(query: string, excludeNames: string[], limit = 8): Footballer[] {
	const q = normaliseKey(query)
	if (!q) return []
	const excluded = new Set(excludeNames.map(normaliseKey))
	return allFootballers.filter((f) => normaliseKey(f.name).includes(q) && !excluded.has(normaliseKey(f.name))).slice(0, limit)
}
