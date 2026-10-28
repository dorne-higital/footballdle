import { describe, expect, it } from 'vitest'
import { ACHIEVEMENTS, STARTER_TROPHIES, trophyShelves } from '../app/utils/achievements'

describe('trophyShelves', () => {
	it('points a new player at the first win in each mode', () => {
		const s = trophyShelves({})
		expect(s.nearlyIsStart).toBe(true)
		expect(s.nearly.map(i => i.id)).toEqual(STARTER_TROPHIES.slice(0, 3))
		expect(s.unlocked).toEqual([])
		// Every trophy is shown exactly once
		expect(s.nearly.length + s.groups.reduce((n, g) => n + g.items.length, 0)).toBe(ACHIEVEMENTS.length)
	})

	it('puts the closest trophies first, cheaper first on a tie, and tops up from the starters', () => {
		const counted = ACHIEVEMENTS.filter(a => !a.hidden).slice(5, 7)
		const s = trophyShelves({ [counted[0]!.id]: 40, [counted[1]!.id]: 40, fd_daily_first_win: 100 })
		expect(s.nearlyIsStart).toBe(false)
		const [a, b] = [...counted].sort((x, y) => x.points - y.points)
		expect(s.nearly.slice(0, 2).map(i => i.id)).toEqual([a!.id, b!.id])
		// The Daily's first win is earned, so the top-up skips it
		expect(s.nearly[2]!.id).toBe('fd_scout_first_win')
		expect(s.unlocked.map(i => i.id)).toEqual(['fd_daily_first_win'])
	})

	it('never suggests a hidden trophy, and keeps won ones out of the groups', () => {
		const hidden = ACHIEVEMENTS.find(a => a.hidden)!
		const s = trophyShelves({ [hidden.id]: 50, fd_daily_first_win: 100 })
		expect(s.nearly.some(i => i.id === hidden.id)).toBe(false)
		const daily = s.groups.find(g => g.title === 'Daily')!
		expect(daily.items.some(i => i.id === 'fd_daily_first_win')).toBe(false)
		expect(daily.earned).toBe(1)
		expect(daily.total).toBeGreaterThan(daily.items.length)
	})

	it('has nothing left to aim for once everything is won', () => {
		const s = trophyShelves(Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, 100])))
		expect(s.nearly).toEqual([])
		expect(s.unlocked).toHaveLength(ACHIEVEMENTS.length)
		expect(s.groups.every(g => g.items.length === 0)).toBe(true)
	})
})
