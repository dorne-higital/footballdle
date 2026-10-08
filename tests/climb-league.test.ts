import { describe, expect, it } from 'vitest'
import { seededRandom } from '../app/utils/climb/questions'
import {
	CL_TIER,
	currentMatchweek,
	LEAGUE_SIZES,
	makeClubs,
	makeFixtures,
	newSeason,
	nextKnockout,
	nextTier,
	outcomeFor,
	playMatchweek,
	PL_TIER,
	standing,
	table,
	tieResult,
	withPlayoff,
	YOU,
	type Season,
} from '../app/utils/climb/league'

/** Plays a whole season where you win, draw or lose with the given chances */
function playSeason(tier: number, n: number, win: number, draw: number): Season {
	let s = newSeason(tier, n, 1000 + n * 13)
	const rng = seededRandom(n * 7 + 1)
	for (let mw = currentMatchweek(s); mw >= 0; mw = currentMatchweek(s)) {
		const r = rng()
		s = playMatchweek(s, mw, r < win ? [2, 1] : r < win + draw ? [1, 1] : [0, 1])
	}
	return s
}

/** A season where you finish in a chosen spot: you beat or lose to everyone as needed */
function finishAt(tier: number, wantTop: boolean): Season {
	let s = newSeason(tier, 1, 77)
	for (let mw = currentMatchweek(s); mw >= 0; mw = currentMatchweek(s)) s = playMatchweek(s, mw, wantTop ? [6, 0] : [0, 6])
	return s
}

describe('fixtures', () => {
	it.each(LEAGUE_SIZES.map(n => [n]))('%i teams: everyone plays everyone home and away, once a week', n => {
		const ids = [YOU, ...Array.from({ length: n - 1 }, (_, i) => `c${i}`)]
		const rounds = makeFixtures(ids, 5)
		expect(rounds).toHaveLength(2 * (n - 1))
		for (const round of rounds) {
			const playing = round.flatMap(f => [f.home, f.away])
			expect(new Set(playing).size).toBe(playing.length)
			expect(playing).toHaveLength(n)
		}
		const pairs = new Map<string, number>()
		for (const f of rounds.flat()) pairs.set(`${f.home}>${f.away}`, (pairs.get(`${f.home}>${f.away}`) ?? 0) + 1)
		for (const a of ids) for (const b of ids) if (a !== b) expect(pairs.get(`${a}>${b}`)).toBe(1)
	})
})

describe('clubs', () => {
	it('have unique names and codes', () => {
		const clubs = makeClubs(19, 3)
		expect(new Set(clubs.map(c => c.name)).size).toBe(19)
		expect(new Set(clubs.map(c => c.code)).size).toBe(19)
	})
})

describe('table', () => {
	it('adds up: 3 for a win, 1 for a draw, goal difference matches', () => {
		const s = playSeason(1, 3, 0.5, 0.3)
		const rows = table(s)
		const games = s.fixtures.flat().length
		expect(rows.reduce((n, r) => n + r.played, 0)).toBe(games * 2)
		for (const r of rows) {
			expect(r.points).toBe(r.won * 3 + r.drawn)
			expect(r.gd).toBe(r.gf - r.ga)
		}
		for (let i = 1; i < rows.length; i++) expect(rows[i - 1]!.points).toBeGreaterThanOrEqual(rows[i]!.points)
	})
})

describe('outcomes', () => {
	it('top of a lower league is champions and promoted', () => {
		const s = finishAt(0, true)
		expect(outcomeFor(s)).toMatchObject({ kind: 'champions', promoted: true })
		expect(nextTier(s, outcomeFor(s))).toBe(1)
	})
	it('no relegation from the National League; bottom of League Two goes down', () => {
		expect(outcomeFor(finishAt(0, false)).kind).toBe('stay')
		const s = finishAt(1, false)
		expect(outcomeFor(s).kind).toBe('relegated')
		expect(nextTier(s, outcomeFor(s))).toBe(0)
	})
	it('Premier League: champions and top 4 go to the Champions League, bottom 3 go down', () => {
		const top = finishAt(PL_TIER, true)
		expect(outcomeFor(top).kind).toBe('champions')
		expect(nextTier(top, outcomeFor(top))).toBe(CL_TIER)
		const bottom = finishAt(PL_TIER, false)
		expect(outcomeFor(bottom)).toMatchObject({ kind: 'relegated', position: 20 })
	})
	it('2nd plays a play-off final against 3rd', () => {
		for (let n = 0; n < 200; n++) {
			const s = playSeason(1, n, 0.6, 0.25)
			const o = outcomeFor(s)
			if (o.kind !== 'playoff') continue
			const p = withPlayoff(s).playoff!
			expect(p.away).toBe(table(s)[2]!.id)
			expect(nextTier(s, o, true)).toBe(2)
			expect(nextTier(s, o, false)).toBe(1)
			return
		}
		throw new Error('no play-off in 200 seasons')
	})
})

describe('standing', () => {
	it('is level for everyone before a ball is kicked', () => {
		const s = newSeason(2, 1, 8)
		for (const c of s.clubs) expect(standing(s, c.id)).toBe('mid')
	})
	it('top two are "top", last is "bottom"', () => {
		const s = playSeason(2, 4, 0.5, 0.3)
		const order = table(s).map(r => r.id)
		const opp = order.filter(id => id !== YOU)
		for (const id of opp) {
			const i = order.indexOf(id)
			expect(standing(s, id)).toBe(i <= 1 ? 'top' : i === order.length - 1 ? 'bottom' : 'mid')
		}
	})
})

describe('Champions League', () => {
	it('is a group of 4, then up to three knockout ties', () => {
		let s = newSeason(CL_TIER, 1, 9)
		expect(s.clubs).toHaveLength(3)
		expect(s.fixtures).toHaveLength(6)
		s = nextKnockout(nextKnockout(nextKnockout(s)))
		expect(s.knockouts!.map(k => k.round)).toEqual(['Quarter-final', 'Semi-final', 'Final'])
		expect(nextKnockout(s)).toBe(s)
	})
	it('a drawn tie goes to penalties', () => {
		expect(tieResult({ home: YOU, away: 'k0', hg: 1, ag: 1 })).toBe('D')
		expect(tieResult({ home: YOU, away: 'k0', hg: 1, ag: 1, pens: YOU })).toBe('pens-won')
		expect(tieResult({ home: YOU, away: 'k0', hg: 2, ag: 1 })).toBe('W')
	})
})

describe('balance', () => {
	it.each([0, 1, 2, 3, 4])('tier %i: a strong player usually wins it, a weak one never does', tier => {
		let strong = 0
		let weak = 0
		const seasons = 150
		for (let n = 0; n < seasons; n++) {
			if (outcomeFor(playSeason(tier, n, 0.7, 0.25)).kind === 'champions') strong++
			if (outcomeFor(playSeason(tier, n, 0.1, 0.2)).kind === 'champions') weak++
		}
		expect(strong / seasons).toBeGreaterThan(0.55)
		expect(weak).toBe(0)
	})
})
