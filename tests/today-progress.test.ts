import { describe, expect, it } from 'vitest'
import { nextToPlay } from '../app/composables/useTodayProgress'

const m = (daily: string, scout: string, spot: string) =>
	({ daily: { status: daily }, scout: { status: scout }, spot: { status: spot } }) as any

describe('nextToPlay', () => {
	it('starts with the Daily', () => {
		expect(nextToPlay(m('new', 'new', 'new'))).toBe('daily')
		expect(nextToPlay(m('playing', 'won', 'new'))).toBe('daily')
	})

	it('moves on in play order once a game is finished, win or lose', () => {
		expect(nextToPlay(m('won', 'new', 'new'))).toBe('scout')
		expect(nextToPlay(m('lost', 'playing', 'new'))).toBe('scout')
		expect(nextToPlay(m('won', 'lost', 'new'))).toBe('spot')
		expect(nextToPlay(m('lost', 'won', 'playing'))).toBe('spot')
	})

	it('skips a game already finished out of order', () => {
		expect(nextToPlay(m('won', 'new', 'won'))).toBe('scout')
		expect(nextToPlay(m('new', 'won', 'won'))).toBe('daily')
	})

	it('is null when all three are done', () => {
		expect(nextToPlay(m('won', 'lost', 'won'))).toBeNull()
	})
})
