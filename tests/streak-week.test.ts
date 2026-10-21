import { describe, expect, it } from 'vitest'
import { streakWeek } from '../app/utils/dateStreak'

const states = (streak: number, playedToday: boolean) => streakWeek(streak, playedToday, '21/10/2026').map(d => d.state)

describe('streakWeek', () => {
	it('ends on today and names the days', () => {
		const week = streakWeek(3, true, '21/10/2026')
		expect(week).toHaveLength(7)
		expect(week.map(d => d.weekday)).toEqual(['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'])
		expect(week[6]!.isToday).toBe(true)
	})

	it('a run including today, with the day before it missed', () => {
		expect(states(3, true)).toEqual(['unknown', 'unknown', 'unknown', 'missed', 'played', 'played', 'played'])
	})

	it('not played yet today: the run ends yesterday and today is pending', () => {
		expect(states(3, false)).toEqual(['unknown', 'unknown', 'missed', 'played', 'played', 'played', 'today'])
	})

	it('a streak longer than a week fills every day', () => {
		expect(states(24, true)).toEqual(Array(7).fill('played'))
		expect(states(24, false)).toEqual([...Array(6).fill('played'), 'today'])
	})

	it('no streak: nothing claimed except today', () => {
		expect(states(0, false)).toEqual([...Array(6).fill('unknown'), 'today'])
	})

	it('works across a month and a clock change', () => {
		expect(streakWeek(1, true, '01/11/2026').map(d => d.weekday)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
	})
})
