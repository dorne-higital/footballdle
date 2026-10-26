// Freezes each upcoming day's Scout brief into app/data/schedule.json (scout.briefs), so
// every copy of the game shows the same brief whatever player list it has (the app can
// download a newer list than the one it was built with). Run by `yarn update-players`
// after it writes the players and schedule; runs under vite-node for the JSON imports.
//
// APPEND-ONLY, like the answers: a day that already has a brief keeps it. Past days are
// left empty (the game works one out if it ever needs to).

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fromSnapshot, getPuzzleNumber, type Snapshot } from '../app/composables/useFootballers'
import { briefCode, pickBriefPair } from '../app/utils/scoutClues'
import { getUKDateString } from '../app/utils/dateStreak'

const SCHEDULE_PATH = join(dirname(fileURLToPath(import.meta.url)), '../app/data/schedule.json')

const schedule = JSON.parse(readFileSync(SCHEDULE_PATH, 'utf8'))
const scout = schedule.scout as { start: number; answers: Snapshot[]; briefs?: string[] }
const briefs = scout.briefs ?? []
const from = getPuzzleNumber(getUKDateString()) - 1 - scout.start

let added = 0
for (let i = 0; i < scout.answers.length; i++) {
	if (briefs[i]) continue
	briefs[i] = ''
	if (i < from) continue
	const pair = pickBriefPair(fromSnapshot(scout.answers[i]!))
	if (pair) {
		briefs[i] = briefCode(pair)
		added++
	}
}
scout.briefs = briefs.slice(0, scout.answers.length)
writeFileSync(SCHEDULE_PATH, `${JSON.stringify(schedule)}\n`)
console.log(`Scout briefs: ${added} frozen (${scout.briefs.filter(Boolean).length} in the schedule)`)
