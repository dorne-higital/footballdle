import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Close must never differ from right by colour alone (Greyscale and colour-blind players)
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

function contrast(a: string, b: string) {
	const lum = (hex: string) => {
		const [r, g, bl] = [1, 3, 5].map(i => {
			const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255
			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
		})
		return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!
	}
	const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
	return (hi! + 0.05) / (lo! + 0.05)
}

describe('close cue', () => {
	it('puts a dot on close letters on the board and the keyboard', () => {
		for (const file of ['app/components/GameBoard.vue', 'app/components/Keyboard.vue']) {
			expect(read(file)).toMatch(/&\.present \{[^}]*?&::after \{/)
		}
	})

	it('fades the board dot in with the flip, so it never shows a close letter early', () => {
		const board = read('app/components/GameBoard.vue')
		expect(board).toMatch(/animation: close-cue-in[^;]*;\s*animation-delay: inherit;/)
		expect(board).toContain('.letter.present::after')
	})

	it('letters the Scout marks and makes close round', () => {
		const row = read('app/components/scout/ScoutRow.vue')
		for (const short of ["short: 'C'", "short: 'N'", "short: 'P'", "short: '£'"]) expect(row).toContain(short)
		expect(row).toMatch(/&\.present \{\s*background: var\(--color-present\);\s*border-radius: 50%;/)
	})

	it('keeps the dot for close only in High-contrast, with the dot visible on the blue tile', () => {
		const a11y = read('assets/_accessibility.scss')
		expect(a11y).not.toContain('.letter.correct')
		const present = a11y.match(/--color-present: (#[0-9a-f]{6})/)![1]!
		const onPresent = a11y.match(/--on-present: (#[0-9a-f]{6})/)![1]!
		expect(contrast(present, onPresent)).toBeGreaterThanOrEqual(3)
	})
})
