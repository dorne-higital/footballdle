import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
	attribute,
	generateMatch,
	generateQuestion,
	MIN_KNOWN,
	poolsFor,
	positionGroup,
	rankByFame,
	seededRandom,
	solve,
	TIERS,
	type ClimbPlayer,
	type LinkType,
} from '../app/utils/climb/questions'

const players: ClimbPlayer[] = JSON.parse(readFileSync(new URL('../app/data/players.json', import.meta.url), 'utf8'))
const ranked = rankByFame(players)
const PER_TIER = 2000

// An independent brute-force check of a question: which groups of the right size share any link
function linkedGroups(cards: ClimbPlayer[], groupSize: number): number[][] {
	const out: number[][] = []
	const n = cards.length
	for (let mask = 0; mask < 1 << n; mask++) {
		const idx = [...Array(n).keys()].filter(i => mask & (1 << i))
		if (idx.length !== groupSize) continue
		const shares = (['club', 'nation', 'position'] as LinkType[]).some(t => new Set(idx.map(i => attribute(cards[i]!, t))).size === 1)
		if (shares) out.push(idx)
	}
	return out
}

describe('positionGroup', () => {
	it('maps detailed positions onto the four FPL ones', () => {
		expect(positionGroup('Left-Back')).toBe('Defender')
		expect(positionGroup('Central Midfield')).toBe('Midfielder')
		expect(positionGroup('Centre-Forward')).toBe('Forward')
		expect(positionGroup('Goalkeeper')).toBe('Goalkeeper')
	})
})

describe('rankByFame', () => {
	it('puts the most owned or most expensive players first', () => {
		const top = ranked.slice(0, 20)
		const maxPop = Math.max(...players.map(p => p.pop ?? 0))
		const maxCost = Math.max(...players.map(p => p.cost ?? 0))
		expect(top.some(p => p.pop === maxPop)).toBe(true)
		expect(top.some(p => p.cost === maxCost)).toBe(true)
	})
})

describe('solve', () => {
	const p = (name: string, club: string, nationality: string, position: string): ClimbPlayer => ({ name, club, nationality, position })
	it('finds the single odd one out', () => {
		const cards = [p('a', 'X', 'England', 'Defender'), p('b', 'X', 'France', 'Forward'), p('c', 'X', 'Spain', 'Goalkeeper'), p('d', 'Y', 'Brazil', 'Midfielder')]
		expect(solve(cards, 1)).toEqual([3])
	})
	it('rejects a question with two possible answers', () => {
		// a, b, c share a club; b, c, d share a nation
		const cards = [p('a', 'X', 'England', 'Defender'), p('b', 'X', 'France', 'Forward'), p('c', 'X', 'France', 'Goalkeeper'), p('d', 'Y', 'France', 'Midfielder')]
		expect(solve(cards, 1)).toBeNull()
	})
})

describe.each(TIERS.map(rules => [rules.tier, rules] as const))('tier %i', (_tier, rules) => {
	const pools = poolsFor(ranked, rules)
	const poolNames = new Set(pools.pool.map(p => p.name))
	const questions = Array.from({ length: PER_TIER }, (_, i) => generateQuestion(pools, rules, seededRandom(rules.tier * 100000 + i)))

	it('always builds a question', () => {
		expect(questions.every(Boolean)).toBe(true)
	})

	it('every question has exactly one answer', () => {
		for (const q of questions) {
			const groups = linkedGroups(q!.cards, rules.cards - rules.oddOnes)
			expect(groups).toHaveLength(1)
			const odd = q!.cards.map((_, i) => i).filter(i => !groups[0]!.includes(i))
			expect(odd).toEqual(q!.odd)
		}
	})

	it('uses the tier\'s card count, links and player pool', () => {
		for (const q of questions) {
			expect(q!.cards).toHaveLength(rules.cards)
			expect(q!.odd).toHaveLength(rules.oddOnes)
			expect(rules.links).toContain(q!.link.type)
			if (q!.link.type === 'position' && rules.positions) expect(rules.positions).toContain(q!.link.value)
			for (const card of q!.cards) expect(poolNames.has(card.name)).toBe(true)
		}
	})

	it(`shows at least ${MIN_KNOWN} well-known players`, () => {
		for (const q of questions) expect(q!.cards.filter(c => pools.known.has(c.name)).length).toBeGreaterThanOrEqual(MIN_KNOWN)
	})
})

describe('generateMatch', () => {
	it('gives 10 questions with no player repeated, the same for the same seed', () => {
		for (const rules of TIERS) {
			const match = generateMatch(players, rules.tier, 42)
			expect(match).toHaveLength(10)
			const names = match.flatMap(q => q.cards.map(c => c.name))
			expect(new Set(names).size).toBe(names.length)
			expect(generateMatch(players, rules.tier, 42)).toEqual(match)
		}
	})

	it('down-weights England in nation links', () => {
		let nation = 0
		let england = 0
		for (let seed = 0; seed < 300; seed++) {
			for (const q of generateMatch(players, 2, seed)) {
				if (q.link.type !== 'nation') continue
				nation++
				if (q.link.value === 'England') england++
			}
		}
		expect(nation).toBeGreaterThan(0)
		expect(england / nation).toBeLessThan(0.3)
	})
})
