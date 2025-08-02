// 5-letter Premier League footballer surnames for challenge mode
const challengeFootballers = [
	'SALAH', 'BRUNO', 'MESSI',
]

export function useChallengeFootballers() {
	function getRandomChallengeFootballer(): string {
		const randomIndex = Math.floor(Math.random() * challengeFootballers.length)
		return challengeFootballers[randomIndex]
	}

	function isValidChallengeFootballer(name: string): boolean {
		return challengeFootballers.includes(name.toUpperCase())
	}

	return {
		challengeFootballers,
		getRandomChallengeFootballer,
		isValidChallengeFootballer,
	}
} 