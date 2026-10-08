// Score (0-10 correct rounds) mapped to a 1-6 tier so it slots into the
// existing guessDistribution bucketing (modeStats.ts only records keys '1'-'6').
const SCORE_TIERS = [
	{ min: 0, tier: 1, label: 'Rookie Scout' },
	{ min: 2, tier: 2, label: 'Grafter' },
	{ min: 4, tier: 3, label: 'Solid Read' },
	{ min: 6, tier: 4, label: 'Sharp Eye' },
	{ min: 8, tier: 5, label: 'Elite Scout' },
	{ min: 10, tier: 6, label: 'Perfect 10' },
]

export function getScoreTier(score: number): number {
	return [...SCORE_TIERS].reverse().find((t) => score >= t.min)!.tier
}

export function getScoreLabel(score: number): string {
	return [...SCORE_TIERS].reverse().find((t) => score >= t.min)!.label
}

export const SPOT_TIER_LABELS = SCORE_TIERS.map((t) => t.label)
