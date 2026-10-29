import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { THEMES } from '../app/utils/themes'

// Each game's colour (fix 10) is used for labels on the page and as a button fill, so it
// has to read on the dark and light backgrounds, and its button text has to read on it
const scss = readFileSync(new URL('../assets/_app-shell.scss', import.meta.url), 'utf8')

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

// The Floodlights block, then the Light one (each sets its own --game-* and backgrounds)
function block(n: number) {
	const starts = [...scss.matchAll(/--game-daily:/g)].map(m => m.index!)
	const text = scss.slice(0, starts[n]! + 400)
	const last = (name: string) => [...text.matchAll(new RegExp(`--${name}: (#[0-9a-f]{3,6})\\b`, 'g'))].at(-1)![1]!
	const full = (hex: string) => (hex.length === 4 ? `#${[...hex.slice(1)].map(c => c + c).join('')}` : hex)
	return (name: string) => full(last(name))
}

describe('game colours', () => {
	for (const [n, look] of [[0, 'Floodlights'], [1, 'Light']] as const) {
		const v = block(n)
		for (const game of ['daily', 'scout', 'spot', 'grid']) {
			it(`${look}: ${game} reads on the page, and its button text reads on it`, () => {
				const colour = v(`game-${game}`)
				expect(contrast(colour, v('bg-primary'))).toBeGreaterThanOrEqual(3.5)
				expect(contrast(colour, v('bg-secondary'))).toBeGreaterThanOrEqual(3.5)
				expect(contrast(v('on-game'), colour)).toBeGreaterThanOrEqual(3)
			})
		}
	}

	it('never reuses the colours that mean close or a miss', () => {
		const v = block(0)
		const games = ['daily', 'scout', 'spot', 'grid'].map(g => v(`game-${g}`))
		expect(games).not.toContain(v('color-present'))
		expect(games).not.toContain(v('fl-red'))
		expect(games).not.toContain(v('tertiary-color'))
	})

	it('Greyscale still has a Greyscale theme to switch them off for', () => {
		expect(THEMES.some(t => t.id === 'greyscale')).toBe(true)
		expect(scss).toContain('html.app-shell.app-greyscale')
	})
})
