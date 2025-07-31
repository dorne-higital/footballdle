export function useShare() {
	function onShare(guesses: string[], answer: string, isWin: boolean, todayStr: string) {
		// Build emoji grid
		const grid = guesses.map(guess => {
			return guess.split('').map((char, i) => {
				// Check if letter is in correct position
				if (answer[i] && char.toUpperCase() === answer[i].toUpperCase()) {
					return '🟩'
				}
				// Check if letter exists in answer but wrong position
				if (answer.toUpperCase().includes(char.toUpperCase())) {
					return '🟨'
				}
				// Letter not in answer
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