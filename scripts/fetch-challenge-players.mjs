const API_TOKEN = 'f425457f0ccb4f5cb2b99e8574ebb762'

const clubNameMap = {
	'Brighton Hove': 'Brighton & Hove Albion',
	'Nottingham': 'Nottingham Forest',
	'Man United': 'Manchester United',
	'Man City': 'Manchester City',
	'Wolves': 'Wolverhampton Wanderers',
	'Spurs': 'Tottenham Hotspur',
}

function normaliseClub(name) {
	return clubNameMap[name] || name
}

function extractSurname(fullName) {
	const parts = fullName.trim().split(' ')
	const raw = parts[parts.length - 1]
	// Strip apostrophes (O'Hara → ohara) but reject anything else non-alpha
	const stripped = raw.replace(/'/g, '')
	if (!/^[a-zA-Z]+$/.test(stripped)) return null
	return stripped.toLowerCase()
}

async function fetchPLPlayers() {
	console.log('Fetching Premier League squads...\n')

	const res = await fetch('https://api.football-data.org/v4/competitions/PL/teams?season=2025', {
		headers: { 'X-Auth-Token': API_TOKEN },
	})

	if (!res.ok) {
		console.error(`API error ${res.status}:`, await res.text())
		process.exit(1)
	}

	const data = await res.json()
	const teams = data.teams || []
	console.log(`Got ${teams.length} teams\n`)

	const players = []

	for (const team of teams) {
		for (const player of team.squad || []) {
			const surname = extractSurname(player.name)
			if (!surname || surname.length !== 5) continue

			players.push({
				name: surname.toUpperCase(),
				club: normaliseClub(team.shortName || team.name),
			})
		}
	}

	// Sort alphabetically, dedupe by name (keep first occurrence)
	players.sort((a, b) => a.name.localeCompare(b.name))
	const seen = new Set()
	const unique = players.filter(p => {
		if (seen.has(p.name)) return false
		seen.add(p.name)
		return true
	})

	console.log(`Found ${unique.length} players with 5-letter surnames:\n`)

	// Print as TypeScript array ready to paste into useChallengeFootballers.ts
	const lines = unique.map(p => `\t'${p.name}',`)

	console.log('const challengeFootballers = [')
	console.log(lines.join('\n'))
	console.log(']')
}

fetchPLPlayers()
