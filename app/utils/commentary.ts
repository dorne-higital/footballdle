// One line of Matchday commentary once all three daily games are played, e.g.
// "Clinical: 2/6 in the Daily and a perfect Spot". Built from the scores only, so it
// never gives an answer away. The verdict also heads the Matchday share card.

export interface MatchdayResults {
	daily: { isWin: boolean; guesses: number }
	scout: { isWin: boolean; guesses: number; maxGuesses: number }
	spot: { score: number; rounds: number }
}

export interface Commentary {
	/** One or two words, e.g. "Clinical" */
	verdict: string
	/** The rest of the line, e.g. "2/6 in the Daily and a perfect Spot" */
	line: string
}

export function matchdayCommentary({ daily, scout, spot }: MatchdayResults): Commentary {
	const perfectSpot = spot.rounds > 0 && spot.score === spot.rounds
	const goodSpot = spot.score >= Math.ceil(spot.rounds * 0.8)
	const spotBit = perfectSpot ? 'a perfect Spot' : `${spot.score}/${spot.rounds} in Spot`

	if (daily.isWin && scout.isWin && perfectSpot) return { verdict: 'Flawless', line: 'all three won and a perfect Spot' }
	if (daily.isWin && daily.guesses <= 2) {
		const extra = perfectSpot || goodSpot ? ` and ${spotBit}` : scout.isWin && scout.guesses <= 2 ? ` and a ${scout.guesses}/${scout.maxGuesses} Scout Report` : ''
		return { verdict: 'Clinical', line: `${daily.guesses}/6 in the Daily${extra}` }
	}
	if (daily.isWin && scout.isWin) {
		return { verdict: 'Full points', line: `the Daily in ${daily.guesses}, the Scout Report in ${scout.guesses} and ${spotBit}` }
	}
	if (!daily.isWin && !scout.isWin) {
		return goodSpot
			? { verdict: 'Rescued', line: `${spotBit} after the Daily and the Scout Report got away` }
			: { verdict: 'One to forget', line: 'the Daily and the Scout Report both got away. Tomorrow’s another game' }
	}
	if (daily.isWin && daily.guesses === 6) return { verdict: 'Last gasp', line: `the Daily won with the final guess, plus ${spotBit}` }
	if (!daily.isWin) return { verdict: 'Bounced back', line: `the Daily got away, but the Scout Report fell in ${scout.guesses}` }
	return { verdict: 'Job done', line: `the Daily in ${daily.guesses}, ${spotBit}, and the Scout Report got away` }
}

/** "Clinical: 2/6 in the Daily and a perfect Spot" */
export const commentaryText = (c: Commentary) => `${c.verdict}: ${c.line}`
