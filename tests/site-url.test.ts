import { describe, expect, it } from 'vitest'
import { pageUrl } from '../app/utils/siteUrl'

// Canonicals must name the address Netlify serves (with a trailing slash), never one that redirects
describe('pageUrl', () => {
	it('adds one trailing slash', () => {
		expect(pageUrl('/')).toBe('https://footballdle.co.uk/')
		expect(pageUrl('/play/daily')).toBe('https://footballdle.co.uk/play/daily/')
		expect(pageUrl('/play/daily/')).toBe('https://footballdle.co.uk/play/daily/')
		expect(pageUrl('/solution/2026-11-04')).toBe('https://footballdle.co.uk/solution/2026-11-04/')
	})
})
