import { footballers, getPuzzleNumber, getPositionGroup, type Footballer } from './useFootballers'
import { getConfederation } from './useConfederations'

// Fixed seed — never change this or all past daily round sets will shift
const SPOT_SHUFFLE_SEED = 20260104
const ROUNDS_PER_MATCH = 10
const OPTIONS_PER_ROUND = 4

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

// Shuffled once at module load — order is deterministic and permanent
const shuffledSpotFootballers = seededShuffle(footballers, SPOT_SHUFFLE_SEED)

export interface SpotRound {
	target: Footballer
	options: Footballer[]
}

// How confusable a candidate is with the target — distractors are drawn from
// the highest scorers so a round can't be solved off a single clue chip; the
// player has to weigh club, position and nationality together.
function similarity(a: Footballer, b: Footballer): number {
	let score = 0
	if (a.club === b.club) score += 2
	if (a.position === b.position) score += 1
	else if (getPositionGroup(a.position) === getPositionGroup(b.position)) score += 1
	if (a.nationality === b.nationality) score += 1
	else if (
		getConfederation(a.nationality) !== null &&
		getConfederation(a.nationality) === getConfederation(b.nationality)
	) {
		score += 1
	}
	return score
}

function pickDistractors(target: Footballer, seed: number, count: number): Footballer[] {
	const scored = footballers
		.filter((p) => p.name !== target.name)
		.map((player) => ({ player, score: similarity(target, player) }))
		.sort((a, b) => b.score - a.score)
	const shortlist = scored.slice(0, count * 3).map((s) => s.player)
	return seededShuffle(shortlist, seed).slice(0, count)
}

function buildRound(target: Footballer, roundSeed: number): SpotRound {
	const distractors = pickDistractors(target, roundSeed, OPTIONS_PER_ROUND - 1)
	const options = seededShuffle([target, ...distractors], roundSeed + 1)
	return { target, options }
}

const roundsCache = new Map<string, SpotRound[]>()

// A daily set of 10 rounds, drawn from a rolling window over the permanent
// shuffled roster so every player sees the same 10 targets on a given day.
export function getSpotRoundsForDay(dateStr: string): SpotRound[] {
	if (roundsCache.has(dateStr)) return roundsCache.get(dateStr)!

	const puzzleNumber = getPuzzleNumber(dateStr)
	const len = shuffledSpotFootballers.length
	const startIdx = (((puzzleNumber - 1) * ROUNDS_PER_MATCH) % len + len) % len

	const targets: Footballer[] = []
	for (let i = 0; i < ROUNDS_PER_MATCH; i++) {
		targets.push(shuffledSpotFootballers[(startIdx + i) % len]!)
	}

	const rounds = targets.map((target, i) => buildRound(target, puzzleNumber * 1000 + i))
	roundsCache.set(dateStr, rounds)
	return rounds
}

export const SPOT_ROUNDS_PER_MATCH = ROUNDS_PER_MATCH
export const SPOT_ROUND_TIME = 8
