import { afterEach, describe, expect, it, vi } from 'vitest'
import { pickPlayerList, readPlayerList, PLAYER_LIST_KEY } from '../app/utils/playerList'

const player = (i: number) => ({ name: `Player ${i}`, club: 'Arsenal', nationality: 'England', position: 'Midfielder', lastName: `player${i}`, fplType: 3 })
const list = (n: number) => Array.from({ length: n }, (_, i) => player(i))
const bundled = list(500)

function savedList(file: unknown) {
	const store = new Map([[PLAYER_LIST_KEY, JSON.stringify(file)]])
	vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null })
}

afterEach(() => vi.unstubAllGlobals())

describe('player list', () => {
	it('accepts a proper list and rejects broken ones', () => {
		expect(readPlayerList({ updated: '2026-11-03', players: list(600) })?.players).toHaveLength(600)
		expect(readPlayerList({ updated: '2026-11-03', players: list(50) })).toBeNull()
		expect(readPlayerList({ updated: 'last week', players: list(600) })).toBeNull()
		expect(readPlayerList({ updated: '2026-11-03', players: [...list(599), { name: 'No club' }] })).toBeNull()
		expect(readPlayerList('<html>Not found</html>')).toBeNull()
	})

	it('the app uses a saved list that is newer than the built-in one', () => {
		savedList({ updated: '2026-11-03', players: list(610) })
		expect(pickPlayerList(bundled, '2026-10-26', true).players).toHaveLength(610)
	})

	it('keeps the built-in list when the saved one is older or the same age', () => {
		savedList({ updated: '2026-10-20', players: list(610) })
		expect(pickPlayerList(bundled, '2026-10-26', true).players).toBe(bundled)
		savedList({ updated: '2026-10-26', players: list(610) })
		expect(pickPlayerList(bundled, '2026-10-26', true).players).toBe(bundled)
	})

	it('the website always uses its built-in list', () => {
		savedList({ updated: '2026-11-03', players: list(610) })
		expect(pickPlayerList(bundled, '2026-10-26', false).players).toBe(bundled)
	})

	it('a corrupt saved list falls back to the built-in one', () => {
		vi.stubGlobal('localStorage', { getItem: () => '{not json' })
		expect(pickPlayerList(bundled, '2026-10-26', true).players).toBe(bundled)
	})
})
