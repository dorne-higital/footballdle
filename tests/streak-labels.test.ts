import { describe, expect, it } from 'vitest'
import { dayWord, matchdayStreakSpoken, modeStreakSpoken } from '../app/utils/streakLabels'
import { useShare } from '../app/composables/useShare'

describe('Streak labels', () => {
	it('says day or days', () => {
		expect(dayWord(0)).toBe('days')
		expect(dayWord(1)).toBe('day')
		expect(dayWord(2)).toBe('days')
	})

	it('names the Matchday streak for VoiceOver, with a nudge when today is not played yet', () => {
		expect(matchdayStreakSpoken(0, false)).toBe('No Matchday streak yet')
		expect(matchdayStreakSpoken(12, true)).toBe('Matchday streak, 12 days')
		expect(matchdayStreakSpoken(1, true)).toBe('Matchday streak, 1 day')
		expect(matchdayStreakSpoken(12, false)).toBe('Matchday streak, 12 days. Play any game today to keep it')
	})

	it('names a mode streak as a win streak', () => {
		expect(modeStreakSpoken('Spot', 6)).toBe('Spot win streak, 6 days')
	})

	it('keeps the flame for a mode streak in shares', () => {
		expect(useShare().getShareText(['MINTEH'], 'MINTEH', true, '#294', 5)).toContain(' 🔥 5 day streak')
	})
})
