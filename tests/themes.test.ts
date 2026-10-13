import { describe, expect, it } from 'vitest'
import { THEMES, THEME_VARIABLE_NAMES, themeVariables } from '../app/utils/themes'
import { THEME_PRODUCT_IDS } from '../app/utils/appStore'

// Relative luminance contrast (WCAG), for #rrggbb colours
function contrast(a: string, b: string) {
	const lum = (hex: string) => {
		const [r, g, bl] = [1, 3, 5].map((i) => {
			const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255
			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
		})
		return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!
	}
	const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
	return (hi! + 0.05) / (lo! + 0.05)
}

describe('Theme Library', () => {
	it('has 16 themes with unique ids: 4 free, 6 paid, 6 in the Colour Pack', () => {
		expect(new Set(THEMES.map(t => t.id)).size).toBe(16)
		expect(THEMES.filter(t => t.tier === 'free')).toHaveLength(4)
		expect(THEMES.filter(t => t.tier === 'paid')).toHaveLength(6)
		expect(THEMES.filter(t => t.tier === 'pack')).toHaveLength(6)
	})

	it('sells every paid theme on its own product and the pack on one', () => {
		const paid = THEMES.filter(t => t.tier === 'paid').map(t => t.productId)
		expect(new Set(paid).size).toBe(6)
		for (const id of paid) expect(Object.values(THEME_PRODUCT_IDS)).toContain(id)
		for (const t of THEMES.filter(t => t.tier === 'pack')) expect(t.productId).toBe(THEME_PRODUCT_IDS.colourPack)
		for (const t of THEMES.filter(t => t.tier === 'free')) expect(t.productId).toBeUndefined()
	})

	it('keeps text readable: body text and tile letters', () => {
		for (const t of THEMES) {
			const c = t.colours
			expect(contrast(c.text, c.bg), `${t.id} text`).toBeGreaterThanOrEqual(7)
			expect(contrast(c.text2, c.bg), `${t.id} secondary text`).toBeGreaterThanOrEqual(3.5)
			expect(contrast(c.onSuccess, c.success), `${t.id} right tiles`).toBeGreaterThanOrEqual(3)
			expect(contrast(c.onPresent, c.present), `${t.id} close tiles`).toBeGreaterThanOrEqual(3)
			expect(contrast(c.onPrimary, c.primary), `${t.id} buttons`).toBeGreaterThanOrEqual(3)
		}
	})

	// By colour or by shade (Light's green and grey are near the same brightness, like
	// most light themes; Greyscale is shade only)
	it('tells right, close and wrong apart', () => {
		const rgb = (hex: string) => [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16))
		const apart = (a: string, b: string) => {
			const [x, y] = [rgb(a), rgb(b)]
			return Math.hypot(...x.map((v, i) => v - y[i]!)) > 90 || contrast(a, b) > 2
		}
		for (const t of THEMES) {
			const { success, present, absent } = t.colours
			expect(apart(success, absent), `${t.id} right vs wrong`).toBe(true)
			expect(apart(present, absent), `${t.id} close vs wrong`).toBe(true)
			expect(apart(success, present), `${t.id} right vs close`).toBe(true)
		}
	})

	it('sets the same variables for every theme, so switching clears them all', () => {
		for (const t of THEMES) {
			for (const name of Object.keys(themeVariables(t))) expect(THEME_VARIABLE_NAMES).toContain(name)
		}
	})
})
