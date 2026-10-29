import { describe, expect, it } from 'vitest'
import { SHARE_LINK, useShare } from '../app/composables/useShare'

// The full-time panel's Share button sends the same text as the result sheet,
// for a win or a loss
describe('Full-time share text', () => {
	it('a Daily loss shares X/6 and the app link', () => {
		const text = useShare().getShareText(['GNONTO', 'SALIBA'], 'MINTEH', false, '#294', 0)
		expect(text).toContain('X/6')
		expect(text).toContain(SHARE_LINK)
	})

	it('a Daily win only mentions the streak once it is more than a day', () => {
		const one = useShare().getShareText(['MINTEH'], 'MINTEH', true, '#294', 1)
		const many = useShare().getShareText(['MINTEH'], 'MINTEH', true, '#294', 24)
		expect(one).not.toContain('day streak')
		expect(many).toContain('24 day streak')
	})
})
