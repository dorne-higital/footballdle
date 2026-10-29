import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { track, trackScreen, setUserProperties } from '../app/utils/appGlance'

// AppGlance analytics: never sends off the iPhone app (website, tests), and every event
// name is a fixed, lowercase, dotted name with no values baked into it
function sources(dir: string): string[] {
	return readdirSync(dir).flatMap(f => {
		const p = join(dir, f)
		return statSync(p).isDirectory() ? sources(p) : /\.(ts|vue)$/.test(f) ? [p] : []
	})
}
const calls = sources(new URL('../app', import.meta.url).pathname)
	.flatMap(f => [...readFileSync(f, 'utf8').matchAll(/\btrack(Screen)?\((['"`])([^'"`]*)\2/g)].map(m => ({ screen: !!m[1], name: m[3]! })))

describe('AppGlance', () => {
	it('does nothing outside the app, and never throws', () => {
		expect(() => {
			track('game.finished', { mode: 'daily' })
			trackScreen('matchday')
			setUserProperties({ plan: 'free' })
		}).not.toThrow()
	})

	it('uses fixed lowercase dotted event names, never built from a value', () => {
		const events = calls.filter(c => !c.screen).map(c => c.name)
		expect(events.length).toBeGreaterThan(5)
		for (const name of events) expect(name).toMatch(/^[a-z]+(\.[a-z_]+)*$/)
		expect(new Set(events)).toEqual(
			new Set([
				'game.finished',
				'hint.used',
				'card.replay',
				'purchase',
				'code.sheet_opened',
				'theme.changed',
				'paywall.viewed',
				'share',
				'matchday.completed',
			]),
		)
	})

	it('names each tracked screen with a plain word', () => {
		const screens = new Set(calls.filter(c => c.screen).map(c => c.name))
		expect(screens).toEqual(new Set(['matchday', 'daily', 'scout', 'spot', 'grid', 'cards', 'trophies', 'hint_shop']))
	})
})
