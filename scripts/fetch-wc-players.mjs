import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const API_TOKEN = 'f425457f0ccb4f5cb2b99e8574ebb762'
const __dirname = dirname(fileURLToPath(import.meta.url))

const continentMap = {
	Algeria: 'Africa',
	Argentina: 'South America',
	Australia: 'Oceania',
	Austria: 'Europe',
	Belgium: 'Europe',
	'Bosnia-Herzegovina': 'Europe',
	Brazil: 'South America',
	Canada: 'North America',
	'Cape Verde Islands': 'Africa',
	Colombia: 'South America',
	'Congo DR': 'Africa',
	Croatia: 'Europe',
	'Curaçao': 'North America',
	Czechia: 'Europe',
	Ecuador: 'South America',
	Egypt: 'Africa',
	England: 'Europe',
	France: 'Europe',
	Germany: 'Europe',
	Ghana: 'Africa',
	Haiti: 'North America',
	Iran: 'Asia',
	Iraq: 'Asia',
	'Ivory Coast': 'Africa',
	Japan: 'Asia',
	Jordan: 'Asia',
	Mexico: 'North America',
	Morocco: 'Africa',
	Netherlands: 'Europe',
	'New Zealand': 'Oceania',
	Norway: 'Europe',
	Panama: 'North America',
	Paraguay: 'South America',
	Portugal: 'Europe',
	Qatar: 'Asia',
	'Saudi Arabia': 'Asia',
	Scotland: 'Europe',
	Senegal: 'Africa',
	'South Africa': 'Africa',
	'South Korea': 'Asia',
	Spain: 'Europe',
	Sweden: 'Europe',
	Switzerland: 'Europe',
	Tunisia: 'Africa',
	Turkey: 'Europe',
	'United States': 'North America',
	Uruguay: 'South America',
	Uzbekistan: 'Asia',
}

const positionMap = {
	Goalkeeper: 'Goalkeeper',
	GOALKEEPER: 'Goalkeeper',
	Defence: 'Defender',
	DEFENCE: 'Defender',
	Defender: 'Defender',
	Midfield: 'Midfielder',
	MIDFIELD: 'Midfielder',
	Midfielder: 'Midfielder',
	Offence: 'Forward',
	OFFENCE: 'Forward',
	Attack: 'Forward',
	ATTACK: 'Forward',
	ATTACKER: 'Forward',
	Attacker: 'Forward',
	Forward: 'Forward',
}

function stripAccents(str) {
	return str.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function extractSurname(fullName) {
	const parts = fullName.trim().split(' ')
	const raw = parts[parts.length - 1]
	const stripped = stripAccents(raw).replace(/'/g, '')
	if (!/^[a-zA-Z]+$/.test(stripped)) return null
	return stripped.toLowerCase()
}

async function fetchWCPlayers() {
	console.log('Fetching FIFA World Cup 2026 squads...\n')

	const res = await fetch('https://api.football-data.org/v4/competitions/WC/teams?season=2026', {
		headers: { 'X-Auth-Token': API_TOKEN },
	})

	if (!res.ok) {
		console.error(`API error ${res.status}:`, await res.text())
		process.exit(1)
	}

	const data = await res.json()
	const teams = data.teams || []
	console.log(`Got ${teams.length} national teams\n`)

	const players = []

	for (const team of teams) {
		const country = team.name || team.shortName || 'Unknown'

		for (const player of team.squad || []) {
			const surname = extractSurname(player.name)
			if (!surname || surname.length < 4) continue

			const born = player.dateOfBirth ? parseInt(player.dateOfBirth.slice(0, 4), 10) || 0 : 0

			players.push({
				name: surname,
				fullName: player.name,
				country,
				nationality: player.nationality || country,
				position: positionMap[player.position] || player.position || 'Unknown',
				born,
				continent: continentMap[country] || 'Unknown',
			})
		}
	}

	// Sort alphabetically, dedupe by name (keep first occurrence)
	players.sort((a, b) => a.name.localeCompare(b.name))
	const seen = new Set()
	const unique = players.filter((p) => {
		if (seen.has(p.name)) return false
		seen.add(p.name)
		return true
	})

	const withBorn = unique.filter((p) => p.born > 0).length
	console.log(`Found ${unique.length} unique players (${withBorn} with birth year)\n`)

	const escape = (s) => s.replace(/'/g, "\\'")

	const dataLines = unique.map(
		(p) =>
			`\t{ name: '${escape(p.name)}', fullName: '${escape(p.fullName)}', country: '${escape(p.country)}', nationality: '${escape(p.nationality)}', position: '${escape(p.position)}', born: ${p.born}, continent: '${escape(p.continent)}' },`,
	)

	const output = `// THIS FILE IS AUTO-GENERATED — run scripts/fetch-wc-players.mjs to regenerate

export interface WCFootballer {
\tname: string
\tfullName: string
\tcountry: string
\tnationality: string
\tposition: string
\tborn: number
\tcontinent: string
}

export const wcFootballers: WCFootballer[] = [
${dataLines.join('\n')}
]

// Fast O(1) lookups
const wcSet = new Set(wcFootballers.map((f) => f.name.toUpperCase()))
const wcMap = new Map(wcFootballers.map((f) => [f.name.toUpperCase(), f]))
const answerCache = new Map<string, string>()

const WC_EPOCH = '02/06/2026'
const WC_SHUFFLE_SEED = 20260602

function seededShuffle<T>(arr: T[], seed: number): T[] {
\tconst result = [...arr]
\tlet s = seed >>> 0
\tfor (let i = result.length - 1; i > 0; i--) {
\t\ts = (Math.imul(s, 1664525) + 1013904223) >>> 0
\t\tconst j = s % (i + 1)
\t\t;[result[i], result[j]] = [result[j]!, result[i]!]
\t}
\treturn result
}

const shuffledWC = seededShuffle(wcFootballers, WC_SHUFFLE_SEED)

export function getWCPuzzleNumber(dateStr: string): number {
\tconst [d1, m1, y1] = WC_EPOCH.split('/').map(Number)
\tconst [d2, m2, y2] = dateStr.split('/').map(Number)
\tconst epochDate = new Date(y1!, m1! - 1, d1)
\tconst todayDate = new Date(y2!, m2! - 1, d2)
\tconst diff = Math.round((todayDate.getTime() - epochDate.getTime()) / (24 * 60 * 60 * 1000))
\treturn diff + 1
}

export function getWCAnswerForDay(dateStr: string): string {
\tif (answerCache.has(dateStr)) return answerCache.get(dateStr)!
\tconst idx = getWCPuzzleNumber(dateStr) - 1
\tconst safeIdx = ((idx % shuffledWC.length) + shuffledWC.length) % shuffledWC.length
\tconst answer = shuffledWC[safeIdx]?.name || ''
\tanswerCache.set(dateStr, answer)
\treturn answer
}

export function isValidWCFootballer(name: string): boolean {
\treturn wcSet.has(name.toUpperCase())
}

export function getWCPlayerData(name: string): WCFootballer | undefined {
\treturn wcMap.get(name.toUpperCase())
}

export function getWCSuggestions(query: string, limit = 8): WCFootballer[] {
\tif (!query || query.length < 2) return []
\tconst q = query.toUpperCase()
\tconst startsWith = wcFootballers.filter((f) => f.name.toUpperCase().startsWith(q))
\tconst contains = wcFootballers.filter(
\t\t(f) => !f.name.toUpperCase().startsWith(q) && f.name.toUpperCase().includes(q),
\t)
\treturn [...startsWith, ...contains].slice(0, limit)
}
`

	const outputPath = join(__dirname, '../app/composables/useWCFootballers.ts')
	writeFileSync(outputPath, output, 'utf8')
	console.log(`Written to ${outputPath}`)
}

fetchWCPlayers()
