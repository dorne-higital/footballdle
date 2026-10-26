import { describe, expect, it } from 'vitest'
import { readSaleConfig, saleFor } from '../app/utils/sale'

const sale = readSaleConfig({ until: '2026-12-28T23:59:59Z', regular: { pro: { GBP: 9.99, USD: 9.99 } } })
const during = Date.parse('2026-12-27T12:00:00Z')

describe('flash sale labels', () => {
	it('labels a product priced below its regular price, with the old price', () => {
		const label = saleFor({ identifier: 'pro', price: 6.99, currencyCode: 'GBP' }, sale, during)
		expect(label?.was).toContain('9.99')
	})

	it('shows nothing once the sale has ended', () => {
		expect(saleFor({ identifier: 'pro', price: 6.99, currencyCode: 'GBP' }, sale, Date.parse('2026-12-29T00:00:00Z'))).toBeNull()
	})

	it('shows nothing when the App Store price is back to normal', () => {
		expect(saleFor({ identifier: 'pro', price: 9.99, currencyCode: 'GBP' }, sale, during)).toBeNull()
	})

	it('shows nothing for a currency or product the sale does not list', () => {
		expect(saleFor({ identifier: 'pro', price: 6.99, currencyCode: 'JPY' }, sale, during)).toBeNull()
		expect(saleFor({ identifier: 'fh5', price: 0.99, currencyCode: 'GBP' }, sale, during)).toBeNull()
	})

	it('ignores a missing or broken sale in the config', () => {
		expect(readSaleConfig(undefined)).toBeNull()
		expect(readSaleConfig({ until: 'soon', regular: {} })).toBeNull()
		expect(readSaleConfig({ until: '2026-12-28T23:59:59Z' })).toBeNull()
		expect(saleFor({ identifier: 'pro', price: 6.99, currencyCode: 'GBP' }, null, during)).toBeNull()
	})
})
