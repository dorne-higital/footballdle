const API_TOKEN = 'f425457f0ccb4f5cb2b99e8574ebb762'

const nationalityMap = {
	'England': 'English', 'France': 'French', 'Spain': 'Spanish', 'Germany': 'German',
	'Italy': 'Italian', 'Netherlands': 'Dutch', 'Portugal': 'Portuguese', 'Brazil': 'Brazilian',
	'Argentina': 'Argentine', 'Uruguay': 'Uruguayan', 'Colombia': 'Colombian', 'Paraguay': 'Paraguayan',
	'Wales': 'Welsh', 'Scotland': 'Scottish', 'Ireland': 'Irish', 'Republic of Ireland': 'Irish',
	'Northern Ireland': 'Northern Irish', 'Belgium': 'Belgian', 'Switzerland': 'Swiss',
	'Denmark': 'Danish', 'Sweden': 'Swedish', 'Norway': 'Norwegian', 'Finland': 'Finnish',
	'Poland': 'Polish', 'Czech Republic': 'Czech', 'Slovakia': 'Slovak', 'Hungary': 'Hungarian',
	'Croatia': 'Croatian', 'Serbia': 'Serbian', 'Albania': 'Albanian', 'Greece': 'Greek',
	'Turkey': 'Turkish', 'Ukraine': 'Ukrainian', 'Japan': 'Japanese', 'South Korea': 'South Korean',
	'Australia': 'Australian', 'Canada': 'Canadian', 'United States': 'American', 'USA': 'American',
	'Cameroon': 'Cameroonian', 'Nigeria': 'Nigerian', 'Ghana': 'Ghanaian', 'Senegal': 'Senegalese',
	"Côte d'Ivoire": 'Ivorian', 'Ivory Coast': 'Ivorian', 'Morocco': 'Moroccan', 'Egypt': 'Egyptian',
	'Mali': 'Malian', 'Gambia': 'Gambian', 'Jamaica': 'Jamaican', 'Romania': 'Romanian',
	'Bulgaria': 'Bulgarian', 'Slovenia': 'Slovenian', 'Kosovo': 'Kosovar', 'Iceland': 'Icelandic',
	'DR Congo': 'Congolese', 'Congo': 'Congolese', 'Gabon': 'Gabonese', 'Togo': 'Togolese',
	'Cape Verde': 'Cape Verdean', 'Guinea': 'Guinean', 'Burkina Faso': 'Burkinabé',
	'Sierra Leone': 'Sierra Leonean', 'North Macedonia': 'Macedonian', 'Montenegro': 'Montenegrin',
	'Bosnia and Herzegovina': 'Bosnian', 'Austria': 'Austrian', 'Ecuador': 'Ecuadorian',
	'Chile': 'Chilean', 'Mexico': 'Mexican', 'Venezuela': 'Venezuelan', 'Peru': 'Peruvian',
	'Mozambique': 'Mozambican', 'Tanzania': 'Tanzanian', 'Zimbabwe': 'Zimbabwean',
}

const positionMap = {
	'Goalkeeper': 'Goalkeeper', 'GOALKEEPER': 'Goalkeeper',
	'Defence': 'Defender', 'DEFENCE': 'Defender', 'Defender': 'Defender',
	'Midfield': 'Midfielder', 'MIDFIELD': 'Midfielder', 'Midfielder': 'Midfielder',
	'Offence': 'Forward', 'OFFENCE': 'Forward',
	'Attack': 'Forward', 'ATTACK': 'Forward', 'ATTACKER': 'Forward', 'Attacker': 'Forward',
	'Forward': 'Forward',
}

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
	// Strip apostrophes (O'Riley → oriley) but reject anything else non-alpha
	// e.g. accented chars like Sánchez, Bayındır are excluded since players can't type them
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
			if (!surname || surname.length !== 6) continue

			players.push({
				name: surname,
				club: normaliseClub(team.shortName || team.name),
				nationality: nationalityMap[player.nationality] || player.nationality || 'Unknown',
				position: positionMap[player.position] || 'Midfielder',
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

	console.log(`Found ${unique.length} players with 6-letter surnames:\n`)

	// Print as TypeScript array ready to paste
	const lines = unique.map(p =>
		`\t{ name: '${p.name}', club: '${p.club}', nationality: '${p.nationality}', position: '${p.position}' },`
	)

	console.log('export const footballers: Footballer[] = [')
	console.log(lines.join('\n'))
	console.log(']')
}

fetchPLPlayers()
