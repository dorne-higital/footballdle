import { roster, getAnswerForDay } from './useFootballers'
import { getUKDateString } from '../utils/dateStreak'

const CHALLENGE_SHUFFLE_SEED = 20260102

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

// 5-letter Premier League surnames for Challenge mode, from app/data/players.json
// (yarn update-players). Answers are players people have heard of; any current
// player's 5-letter surname is a valid guess.
const challengeAnswers = [
	...new Set(roster.filter(p => p.dailyKnown && p.lastName.length === 5).map(p => p.lastName.toUpperCase())),
]
const challengeFootballers = [...new Set(roster.filter(p => p.lastName.length === 5).map(p => p.lastName.toUpperCase()))]

// Create a Set for O(1) lookups
const challengeFootballerSet = new Set(challengeFootballers)

// Shuffled once at module load; games run through it in order
const shuffledChallengeFootballers = seededShuffle(challengeAnswers, CHALLENGE_SHUFFLE_SEED)

// On 5-letter Daily days the two modes share surnames, so Challenge never serves a
// Daily answer from the last week or the next three (no free win, no spoilers)
const DAILY_SKIP_BACK = 7
const DAILY_SKIP_AHEAD = 21

function nearbyDailyAnswers(): Set<string> {
	const [d, m, y] = getUKDateString().split('/').map(Number)
	const names = new Set<string>()
	for (let offset = -DAILY_SKIP_BACK; offset <= DAILY_SKIP_AHEAD; offset++) {
		const day = new Date(Date.UTC(y!, m! - 1, d! + offset))
		const dateStr = `${String(day.getUTCDate()).padStart(2, '0')}/${String(day.getUTCMonth() + 1).padStart(2, '0')}/${day.getUTCFullYear()}`
		names.add(getAnswerForDay(dateStr).toUpperCase())
	}
	return names
}

let skip: { date: string; names: Set<string> } | null = null

export function getChallengeFootballerByIndex(idx: number): string {
	const today = getUKDateString()
	if (skip?.date !== today) skip = { date: today, names: nearbyDailyAnswers() }
	const len = shuffledChallengeFootballers.length
	// Step past excluded names at pick time, so everyone's order stays the same
	for (let step = 0; step < len; step++) {
		const name = shuffledChallengeFootballers[((((idx + step) % len) + len) % len)] || ''
		if (!skip.names.has(name)) return name
	}
	return shuffledChallengeFootballers[((idx % len) + len) % len] || ''
}

export function useChallengeFootballers() {
	function isValidChallengeFootballer(name: string): boolean {
		return challengeFootballerSet.has(name.toUpperCase())
	}

	return {
		challengeFootballers,
		isValidChallengeFootballer,
	}
}
