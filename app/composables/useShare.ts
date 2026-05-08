export function useShare() {
	function getShareText(guesses: string[], answer: string, isWin: boolean, label: string): string {
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
		return `Footballdle ⚽ ${label}\n${isWin ? guesses.length : 'X'}/6\n\n${grid}\n\nfootballdle.co.uk`
	}

	async function onShare(guesses: string[], answer: string, isWin: boolean, label: string): Promise<boolean> {
		const text = getShareText(guesses, answer, isWin, label)
		try {
			await navigator.clipboard.writeText(text)
			return true
		} catch {
			return false
		}
	}

	function onShareTwitter(guesses: string[], answer: string, isWin: boolean, label: string) {
		const text = getShareText(guesses, answer, isWin, label)
		window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
	}

	return { onShare, onShareTwitter, getShareText }
}
