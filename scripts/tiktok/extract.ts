// Everything the videos can be made from, written to .tiktok/data.json:
// - Daily, Scout Report and Spot the Baller: finished days only (never today or later)
// - The Grid: practice grids, which are never anyone's weekly puzzle
// Run with vite-node (it needs the app's JSON imports): see run.sh.

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { answerSchedule, fromSnapshot, getPositionGroup, getPuzzleNumber, roster } from '../../app/composables/useFootballers'
import { getUKDateString } from '../../app/utils/dateStreak'
import { continentOf, formatPrice, priceOf, regionOf, scoutBrief } from '../../app/utils/scoutClues'
import { answersFor, readPracticeGrids, rowLabel, squareOf, type GridDeal, type GridPlayer } from '../../app/utils/grid'

const ROOT = join(import.meta.dirname, '../..')
const OUT = process.argv[2] ?? join(ROOT, '.tiktok/data.json')
const today = getPuzzleNumber(getUKDateString())
const title = (s: string) => s.replace(/(^|[\s'-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase())
const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
const popOf = (name: string) => roster.find(p => p.name.toLowerCase() === name.toLowerCase())?.pop ?? 0

// ---------------------------------------------------------------- Daily
// Wordle colours for a guess: g right spot, a in the word, x not in it
function score(guess: string, answer: string) {
	const res = Array(guess.length).fill('x'), left: Record<string, number> = {}
	for (let i = 0; i < answer.length; i++) { if (guess[i] === answer[i]) res[i] = 'g'; else left[answer[i]!] = (left[answer[i]!] ?? 0) + 1 }
	for (let i = 0; i < guess.length; i++) if (res[i] !== 'g' && left[guess[i]!]) { res[i] = 'a'; left[guess[i]!]-- }
	return res.join('')
}
const dailyPool = roster.filter(p => p.dailyKnown)
const daily = []
const dl = answerSchedule.daily
for (let p = today - 1; p >= Math.max(dl.start, today - 120); p--) {
	const snap = dl.answers[p - dl.start]; if (!snap) continue
	const f = fromSnapshot(snap)
	const word = strip(f.name.split(' ').pop()!)
	if (word.length < 5 || word.length > 6) continue
	// Three wrong guesses: real surnames of the same length, getting warmer
	const cands = [...new Set(dailyPool.map(x => strip(x.lastName)).filter(w => w.length === word.length && w !== word && /^[A-Z]+$/.test(w)))]
	const ranked = cands.map(w => { const s = score(w, word); return { w, n: [...s].reduce((a, c) => a + (c === 'g' ? 2 : c === 'a' ? 1 : 0), 0) } })
	const pick = (lo: number, hi: number, k: number) => { const xs = ranked.filter(o => o.n >= lo && o.n <= hi); return xs.length ? xs[(p * 7919 + k * 31) % xs.length]!.w : null }
	const guesses = [pick(0, 1, 1), pick(2, 3, 2), pick(4, 7, 3)].filter(Boolean) as string[]
	if (guesses.length < 3) continue
	const full = roster.find(x => strip(x.lastName) === word && x.club === f.club)
	daily.push({ key: `daily:${p}`, puzzle: p, name: title(full?.name ?? f.name), pop: full?.pop ?? 0, word, guesses })
}

// ---------------------------------------------------------------- Scout Report
const scout = []
const sc = answerSchedule.scout
for (let p = today - 1; p >= Math.max(sc.start, today - 365); p--) {
	const snap = sc.answers[p - sc.start]; if (!snap) continue
	const f = fromSnapshot(snap)
	const brief = scoutBrief(f, sc.briefs?.[p - sc.start] || undefined)
	if (!brief || priceOf(f.name) === null) continue
	// Three guesses getting warmer: anywhere, then same continent or region, then same club or line in the region
	const known = roster.filter(x => x.known && x.name !== snap[0] && priceOf(x.name) !== null)
	const pick = (ok: (x: typeof roster[number]) => boolean, k: number) => { const xs = known.filter(ok).sort((a, b) => b.pop - a.pop).slice(0, 12); return xs.length ? xs[(p * 13 + k) % xs.length]!.name : null }
	const cont = continentOf(f.nationality), reg = regionOf(f.club), grp = getPositionGroup(f.position)
	const g1 = pick(x => continentOf(x.nationality) !== cont && regionOf(x.club) !== reg, 1)
	const g2 = pick(x => x.name !== g1 && (continentOf(x.nationality) === cont || regionOf(x.club) === reg), 2)
	const g3 = pick(x => x.name !== g1 && x.name !== g2 && (x.club === f.club || (regionOf(x.club) === reg && getPositionGroup(x.position) === grp)), 3)
	if (!g1 || !g2 || !g3) continue
	scout.push({ key: `scout:${p}`, puzzle: p, guesses: [g1, g2, g3, snap[0]], name: title(f.name), pop: popOf(f.name), brief: brief.text, price: formatPrice(priceOf(f.name)!) })
}

// ---------------------------------------------------------------- Spot the Baller (first three rounds of a day)
const spot = []
const sp = answerSchedule.spot
for (let p = today - 1; p >= Math.max(sp.start, today - 365); p--) {
	const day = sp.days[p - sp.start]; if (!day) continue
	const rounds = day.slice(0, 3).map(r => ({ name: title(r.target[0]), options: r.options.map(title) }))
	spot.push({ key: `spot:${p}`, puzzle: p, rounds, fame: day.slice(0, 3).reduce((a, r) => a + popOf(r.target[0]), 0) })
}

// ---------------------------------------------------------------- The Grid (practice grids, nine different players)
const players = roster as unknown as GridPlayer[]
const practice = readPracticeGrids(JSON.parse(readFileSync(join(ROOT, 'app/data/grid-practice.json'), 'utf8')))
const grid = []
for (const g of practice) {
	const deal: GridDeal = { clubs: g.clubs, rows: g.rows }
	// Fewest options first, so tight squares get their pick before busy ones
	const order = [...Array(9).keys()].map(i => ({ i, ans: answersFor(players, squareOf(deal, i).club, squareOf(deal, i).row).sort((a, b) => b.pop - a.pop) })).sort((a, b) => a.ans.length - b.ans.length)
	const used = new Set<string>(), squares: { answer: string; raw: string }[] = []
	let ok = true
	for (const { i, ans } of order) {
		const p = ans.find(a => !used.has(a.name))
		if (!p) { ok = false; break }
		used.add(p.name); squares[i] = { answer: title(p.name), raw: p.name }
	}
	if (!ok) continue
	grid.push({ key: `grid:${deal.clubs.join('|')}:${deal.rows.join('|')}`, clubs: deal.clubs, rowIds: deal.rows, rows: deal.rows.map(r => rowLabel(r)), squares, fame: squares.reduce((a, s) => a + popOf(s.raw), 0) })
}

writeFileSync(OUT, JSON.stringify({ today, daily, scout, spot, grid }))
console.log(`Past puzzles to choose from: ${daily.length} Daily, ${scout.length} Scout Report, ${spot.length} Spot the Baller days, ${grid.length} practice grids`)
