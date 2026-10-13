// Plans Grid Week: five grids every Saturday, the same for everyone.
//
//   node --experimental-strip-types --no-warnings scripts/plan-grid-weeks.ts
//
// Writes app/data/grid-practice.json (every fair grid, for practice; rebuilt each run)
// and app/data/grid-weeks.json. The weeks file is APPEND-ONLY, like the Daily schedule: weeks already
// planned are never changed (people may be mid-week on them, and app builds already out
// there carry them), so a squad update only affects weeks planned after it. Run it after
// `yarn update-players` to keep about two years planned ahead.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { allFairGrids, gridClubs, gridKey, gridRows, mulberry32, pickWeek, weekIndex, type GridDeal, type GridPlayer } from '../app/utils/grid.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PLAYERS_PATH = join(ROOT, 'app/data/players.json')
const WEEKS_PATH = join(ROOT, 'app/data/grid-weeks.json')
const PRACTICE_PATH = join(ROOT, 'app/data/grid-practice.json')
// The first Saturday of Grid Week
const EPOCH = '10/10/2026'
const WEEKS_AHEAD = 104

interface WeeksFile {
	epoch: string
	weeks: GridDeal[][]
}

const players: GridPlayer[] = JSON.parse(readFileSync(PLAYERS_PATH, 'utf8'))
const file: WeeksFile = existsSync(WEEKS_PATH) ? JSON.parse(readFileSync(WEEKS_PATH, 'utf8')) : { epoch: EPOCH, weeks: [] }

const today = new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/London' })
const target = Math.max(0, weekIndex(file.epoch, today)) + WEEKS_AHEAD

const grids = allFairGrids(players)
const used = new Set(file.weeks.flat().map(gridKey))
const before = file.weeks.length
while (file.weeks.length < target) {
	const index = file.weeks.length
	file.weeks.push(pickWeek(grids, mulberry32(20261010 + index * 7919), used))
}

writeFileSync(WEEKS_PATH, JSON.stringify(file))

// Practice: every fair grid as club and row indexes, so the app needn't work them out
const clubs = gridClubs(players)
const rows = gridRows(players)
writeFileSync(PRACTICE_PATH, JSON.stringify({
	clubs,
	rows,
	grids: grids.map(g => [...g.clubs.map(c => clubs.indexOf(c)), ...g.rows.map(r => rows.indexOf(r)), g.singles]),
}))
const englandGrids = grids.filter(g => g.england).length
console.log(`Fair grids with current squads: ${grids.length} (${englandGrids} with England, ${grids.filter(g => g.rows.every(r => r.startsWith('nat:'))).length} countries only)`)
console.log(`Grid Week: ${before} weeks kept, ${file.weeks.length - before} added, ${file.weeks.length} planned from ${file.epoch}`)
if (grids.length < 300) {
	console.error('Warning: fewer than 300 fair grids. Check the squads before planning more weeks.')
	process.exitCode = 1
}
