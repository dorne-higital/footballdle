export function useShare() {
	function onShare(guesses: string[], answer: string, isWin: boolean, todayStr: string) {
		// Build emoji grid
		const grid = guesses.map(guess => {
			return guess.split('').map((char, i) => {
				if (answer[i] && char === answer[i]) return '🟩'
				if (answer.includes(char)) return '🟨'
				return '⬛'
			}).join('')
		}).join('\n')
		const text = `Footballdle ${todayStr}\n${isWin ? guesses.length : 'X'}/6\n${grid}`
		navigator.clipboard.writeText(text)
		alert('Result copied to clipboard!')
	}

	return {
		onShare,
	}
} 