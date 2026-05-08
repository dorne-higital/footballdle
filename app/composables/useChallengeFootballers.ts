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

// 5-letter Premier League footballer surnames for challenge mode
const challengeFootballers = [
	'ABBEY',
	'ADAMS',
	'AGYEI',
	'AJALA',
	'ALABI',
	'AYARI',
	'AZNOU',
	'BAKWA',
	'BARRY',
	'BATES',
	'BENTT',
	'BERGE',
	'BEYER',
	'BIJOL',
	'BIZOT',
	'BLAKE',
	'BOGLE',
	'BOWEN',
	'BROJA',
	'BROWN',
	'BUENO',
	'BYRAM',
	'CASEY',
	'CLARK',
	'CLYNE',
	'CREWE',
	'CUNHA',
	'DALOT',
	'DANNS',
	'DANSO',
	'DELAP',
	'DERRY',
	'DIGNE',
	'DIOUF',
	'DIXON',
	'DORGU',
	'EKDAL',
	'FODEN',
	'GAKPO',
	'GOMES',
	'GOMEZ',
	'GRUEV',
	'GUSTO',
	'HANKS',
	'HARDY',
	'HECKE',
	'HENRY',
	'IWOBI',
	'JAMES',
	'JESUS',
	'JONES',
	'KANTE',
	'KEANE',
	'KONSA',
	'KUDUS',
	'LACEY',
	'LAVIA',
	'LEONI',
	'LERMA',
	'LEWIS',
	'LUCCA',
	'LUCKY',
	'MARCH',
	'MARSH',
	'MILEY',
	'MINGS',
	'MOORE',
	'MOUNT',
	'MUANI',
	'MUNIZ',
	'NALLO',
	'NDOYE',
	'NEAVE',
	'NOBLE',
	'NOURI',
	'NUNES',
	'NYONI',
	'NYPAN',
	'ONANA',
	'ONIEN',
	'OSULA',
	'PAULA',
	'PECSI',
	'PEDRO',
	'PERRI',
	'PIRES',
	'PIROE',
	'PORRO',
	'POTTS',
	'RAYAN',
	'RODON',
	'RODRI',
	'ROEFS',
	'ROUTH',
	'RUDDY',
	'SALAH',
	'SAMBA',
	'SCOTT',
	'SILVA',
	'SMITH',
	'SOLER',
	'SOUZA',
	'STACH',
	'TALBI',
	'THIAW',
	'WALSH',
	'WEISS',
	'WELCH',
	'WHITE',
	'WILEY',
	'WIRTZ',
	'WISSA',
	'WOLFE',
	'XHAKA',
	'YATES',
]

// Create a Set for O(1) lookups
const challengeFootballerSet = new Set(challengeFootballers)

// Shuffled once at module load — order is deterministic and permanent
const shuffledChallengeFootballers = seededShuffle(challengeFootballers, CHALLENGE_SHUFFLE_SEED)

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
