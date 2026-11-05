import { describe, expect, it } from 'vitest'
import { readOfferingMeta, themesWorth } from '../app/utils/offering'

describe('RevenueCat Offering copy', () => {
	it('reads a banner and badges, ignoring anything malformed', () => {
		expect(readOfferingMeta({ banner: '  Weekend sale: Pro £6.99 ', badges: { fh15: 'Best value', fh5: 3, fh1: '  ' }, other: true })).toEqual({
			banner: 'Weekend sale: Pro £6.99',
			badges: { fh15: 'Best value' },
		})
		expect(readOfferingMeta(null)).toEqual({ banner: '', badges: {} })
		expect(readOfferingMeta({ banner: 42, badges: 'nope' })).toEqual({ banner: '', badges: {} })
	})

	it('keeps copy short enough for the shop', () => {
		const { banner, badges } = readOfferingMeta({ banner: 'x'.repeat(200), badges: { fh15: 'y'.repeat(50) } })
		expect(banner).toHaveLength(80)
		expect(badges.fh15).toHaveLength(20)
	})
})

describe('what the themes are worth on their own', () => {
	const themes = ['a', 'b', 'c']
	const p = (identifier: string, price: number, currencyCode = 'GBP') => ({ identifier, price, currencyCode })

	it('adds up every theme in the store currency', () => {
		expect(themesWorth([p('a', 0.99), p('b', 0.99), p('c', 2.99), p('pro', 9.99)], themes)).toBe('£4.97')
		expect(themesWorth([p('a', 0.99, 'USD'), p('b', 0.99, 'USD'), p('c', 2.99, 'USD')], themes)).toBe('US$4.97')
	})

	it('says nothing rather than undercount', () => {
		expect(themesWorth([p('a', 0.99), p('b', 0.99)], themes)).toBe('')
		expect(themesWorth([p('a', 0.99), p('b', 0.99, 'USD'), p('c', 2.99)], themes)).toBe('')
	})
})
