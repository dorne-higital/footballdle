import { roster } from './useFootballers'

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

export function getChallengeFootballerByIndex(idx: number): string {
	const len = shuffledChallengeFootballers.length
	const safeIdx = ((idx % len) + len) % len
	return shuffledChallengeFootballers[safeIdx] || ''
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
