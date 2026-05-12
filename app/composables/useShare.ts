export function useShare() {
	function getShareText(guesses: string[], answer: string, isWin: boolean, label: string, streak?: number): string {
		const grid = guesses
			.map(guess =>
				guess
					.split('')
					.map((char, i) => {
						if (answer[i] && char.toUpperCase() === answer[i].toUpperCase()) return '🟩'
						if (answer.toUpperCase().includes(char.toUpperCase())) return '🟨'
						return '⬛'
					})
					.join(''),
			)
			.join('\n')
		const streakLine = streak && streak > 1 ? ` 🔥 ${streak} day streak` : ''
		return `Footballdle ⚽ ${label}\n${isWin ? guesses.length : 'X'}/6${streakLine}\n\n${grid}\n\nfootballdle.co.uk`
	}

	async function onShare(guesses: string[], answer: string, isWin: boolean, label: string, streak?: number): Promise<boolean> {
		const text = getShareText(guesses, answer, isWin, label, streak)
		try {
			await navigator.clipboard.writeText(text)
			return true
		} catch {
			return false
		}
	}

	function onShareTwitter(guesses: string[], answer: string, isWin: boolean, label: string, streak?: number) {
		const text = getShareText(guesses, answer, isWin, label, streak)
		window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
	}

	return { onShare, onShareTwitter, getShareText }
}
