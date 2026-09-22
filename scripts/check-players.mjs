// Fetches the current PL squads and diffs them against the committed player
// lists (app/composables/useFootballers.ts and useChallengeFootballers.ts).
// Read-only: prints a report, never writes to those files. Their arrays feed
// a seeded shuffle that maps calendar dates to daily answers, so re-ordering
// or replacing them isn't safe to automate — see the "never change this seed"
// comments in useFootballers.ts / useChallengeFootballers.ts.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const API_TOKEN = 'f425457f0ccb4f5cb2b99e8574ebb762'

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

const clubNameMap = {
	'Brighton Hove': 'Brighton & Hove Albion',
	Nottingham: 'Nottingham Forest',
	'Man United': 'Manchester United',
	'Man City': 'Manchester City',
	Wolves: 'Wolverhampton Wanderers',
	Spurs: 'Tottenham Hotspur',
}

function normaliseClub(name) {
	return clubNameMap[name] || name
}

function extractSurname(fullName) {
	const parts = fullName.trim().split(' ')
	const raw = parts[parts.length - 1]
	const stripped = raw.replace(/'/g, '')
	if (!/^[a-zA-Z]+$/.test(stripped)) return null
	return stripped.toLowerCase()
}

async function fetchSquads() {
	const res = await fetch('https://api.football-data.org/v4/competitions/PL/teams?season=2025', {
		headers: { 'X-Auth-Token': API_TOKEN },
	})
	if (!res.ok) {
		console.error(`API error ${res.status}:`, await res.text())
		process.exit(1)
	}
	const data = await res.json()
	return data.teams || []
}

// ---- Parse committed data files (regex, not a TS import — keeps this a
// plain Node script with no build step) ----

function extractBlock(source, startMarker, closer = ']') {
	const start = source.indexOf(startMarker)
	if (start === -1) throw new Error(`Could not find "${startMarker}"`)
	const bodyStart = start + startMarker.length
	const end = source.indexOf(`\n${closer}`, bodyStart)
	if (end === -1) throw new Error(`Could not find closing "${closer}" after "${startMarker}"`)
	return source.slice(bodyStart, end)
}

function parseFootballersFile() {
	const source = readFileSync(join(ROOT, 'app/composables/useFootballers.ts'), 'utf8')

	const groupsBlock = extractBlock(source, 'const POSITION_GROUPS: Record<Position, PositionGroup> = {', '}')
	const groups = {}
	const groupRe = /(?:'([^']+)'|([A-Za-z][\w-]*))\s*:\s*'([^']+)'/g
	let gm
	while ((gm = groupRe.exec(groupsBlock))) {
		groups[gm[1] || gm[2]] = gm[3]
	}

	const arrayBlock = extractBlock(source, 'export const footballers: Footballer[] = [')
	const entryRe =
		/\{\s*name:\s*'([a-z]+)',\s*club:\s*'([^']*)',\s*nationality:\s*'([^']*)',\s*position:\s*'([^']*)'\s*\}/g
	const list = []
	let m
	while ((m = entryRe.exec(arrayBlock))) {
		list.push({ name: m[1], club: m[2], nationality: m[3], position: m[4] })
	}
	return { list, groups }
}

function parseChallengeFile() {
	const source = readFileSync(join(ROOT, 'app/composables/useChallengeFootballers.ts'), 'utf8')
	const arrayBlock = extractBlock(source, 'const challengeFootballers = [')
	const names = [...arrayBlock.matchAll(/'([A-Z]+)'/g)].map((m) => m[1])
	return names
}

// ---- Build "fresh" lists from the API using the same rules as the fetch scripts ----

function buildFreshLists(teams) {
	const six = []
	const five = []
	for (const team of teams) {
		const club = normaliseClub(team.shortName || team.name)
		for (const player of team.squad || []) {
			const surname = extractSurname(player.name)
			if (!surname) continue
			if (surname.length === 6) {
				six.push({
					name: surname,
					club,
					nationality: player.nationality || 'Unknown',
					position: positionMap[player.position] || player.position || 'Unknown',
				})
			} else if (surname.length === 5) {
				five.push({ name: surname.toUpperCase(), club })
			}
		}
	}
	six.sort((a, b) => a.name.localeCompare(b.name))
	five.sort((a, b) => a.name.localeCompare(b.name))
	const dedupe = (arr, key) => {
		const seen = new Set()
		return arr.filter((p) => (seen.has(p[key]) ? false : (seen.add(p[key]), true)))
	}
	return { six: dedupe(six, 'name'), five: dedupe(five, 'name') }
}

// ---- Diffing ----

function diffFootballers(stored, groups, fresh) {
	const storedMap = new Map(stored.map((p) => [p.name, p]))
	const freshMap = new Map(fresh.map((p) => [p.name, p]))

	const added = fresh.filter((p) => !storedMap.has(p.name))
	const removed = stored.filter((p) => !freshMap.has(p.name))
	const changed = []

	for (const f of fresh) {
		const s = storedMap.get(f.name)
		if (!s) continue
		const fieldDiffs = []
		if (s.club !== f.club) fieldDiffs.push(`club: '${s.club}' -> '${f.club}'`)
		if (s.nationality !== f.nationality) fieldDiffs.push(`nationality: '${s.nationality}' -> '${f.nationality}'`)

		// Compare broad position groups (both sides run through the same
		// POSITION_GROUPS table) rather than raw labels — the API's raw
		// position can be a specific label ('Right Winger') or a generic one
		// ('Forward'), and those aren't meant to match textually.
		const storedGroup = groups[s.position]
		const freshGroup = groups[f.position]
		if (!freshGroup) {
			fieldDiffs.push(
				`position: API returned '${f.position}', which isn't in POSITION_GROUPS — classify manually`,
			)
		} else if (storedGroup && storedGroup !== freshGroup) {
			fieldDiffs.push(`position group: '${storedGroup}' (stored as '${s.position}') -> '${freshGroup}' (API says '${f.position}')`)
		}
		if (fieldDiffs.length) changed.push({ name: f.name, diffs: fieldDiffs })
	}

	return { added, removed, changed }
}

function diffChallenge(stored, fresh) {
	const storedSet = new Set(stored)
	const freshSet = new Set(fresh.map((p) => p.name))
	const added = fresh.filter((p) => !storedSet.has(p.name))
	const removed = stored.filter((n) => !freshSet.has(n))
	return { added, removed }
}

// ---- Report ----

function printFootballerReport(diff) {
	console.log('Fetch Players (6-letter surnames)')
	console.log(`  + added:   ${diff.added.length}`)
	console.log(`  - removed: ${diff.removed.length}`)
	console.log(`  ~ changed: ${diff.changed.length}`)
	console.log()

	if (diff.added.length) {
		console.log('  Added:')
		for (const p of diff.added) {
			console.log(`    + ${p.name} — ${p.club}, ${p.nationality}, ${p.position}`)
		}
		console.log()
	}
	if (diff.removed.length) {
		console.log('  Removed:')
		for (const p of diff.removed) {
			console.log(`    - ${p.name} — was ${p.club}, ${p.nationality}, ${p.position}`)
		}
		console.log()
	}
	if (diff.changed.length) {
		console.log('  Changed:')
		for (const p of diff.changed) {
			console.log(`    ~ ${p.name}`)
			for (const d of p.diffs) console.log(`        ${d}`)
		}
		console.log()
	}
}

function printChallengeReport(diff) {
	console.log('Challenge Players (5-letter surnames)')
	console.log(`  + added:   ${diff.added.length}`)
	console.log(`  - removed: ${diff.removed.length}`)
	console.log()

	if (diff.added.length) {
		console.log('  Added:')
		for (const p of diff.added) console.log(`    + ${p.name} — ${p.club}`)
		console.log()
	}
	if (diff.removed.length) {
		console.log('  Removed:')
		for (const n of diff.removed) console.log(`    - ${n}`)
		console.log()
	}
}

async function main() {
	console.log('Fetching Premier League squads...\n')
	const teams = await fetchSquads()
	console.log(`Got ${teams.length} teams\n`)

	const { list: storedSix, groups } = parseFootballersFile()
	const storedFive = parseChallengeFile()
	const { six: freshSix, five: freshFive } = buildFreshLists(teams)

	const footballerDiff = diffFootballers(storedSix, groups, freshSix)
	const challengeDiff = diffChallenge(storedFive, freshFive)

	printFootballerReport(footballerDiff)
	printChallengeReport(challengeDiff)

	const totalChanges =
		footballerDiff.added.length +
		footballerDiff.removed.length +
		footballerDiff.changed.length +
		challengeDiff.added.length +
		challengeDiff.removed.length

	if (totalChanges === 0) {
		console.log('No differences found — both lists are up to date.')
	} else {
		console.log(
			`${totalChanges} total difference(s) found. Nothing was written — re-run scripts/fetch-players.mjs / scripts/fetch-challenge-players.mjs and edit the composables by hand if you want to apply changes (adding/reordering entries shifts the seeded daily-answer mapping for every date, so review before touching existing rows).`,
		)
	}
}

main()
