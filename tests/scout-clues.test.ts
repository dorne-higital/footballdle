import { describe, expect, it } from 'vitest'
import { comparePrice, positionsAreNear, regionOf, scoutBrief, priceOf } from '../app/utils/scoutClues'

describe('Scout Report clues', () => {
	it('clubs share a region', () => {
		expect(regionOf('Sunderland')).toBe('north-east')
		expect(regionOf('Newcastle')).toBe(regionOf('Sunderland'))
		expect(regionOf('Arsenal')).not.toBe(regionOf('Sunderland'))
	})

	it('neighbouring positions are close, goalkeepers never', () => {
		expect(positionsAreNear('Midfielder', 'Defender')).toBe(true)
		expect(positionsAreNear('Midfielder', 'Forward')).toBe(true)
		expect(positionsAreNear('Defender', 'Forward')).toBe(false)
		expect(positionsAreNear('Goalkeeper', 'Defender')).toBe(false)
		expect(positionsAreNear('Defender', 'Defender')).toBe(false)
	})

	it('price: right, close within £1m, with an arrow towards the answer', () => {
		expect(comparePrice(50, 50)).toEqual({ state: 'correct', arrow: null })
		expect(comparePrice(57, 50)).toEqual({ state: 'present', arrow: 'down' })
		expect(comparePrice(42, 50)).toEqual({ state: 'present', arrow: 'up' })
		expect(comparePrice(156, 50)).toEqual({ state: 'absent', arrow: 'down' })
	})

	it("Kevin Danso's brief: a European at a North East club", () => {
		const brief = scoutBrief({ name: 'kevin danso', club: 'Sunderland', nationality: 'Austria', position: 'Defender' })
		expect(brief?.facts.sort()).toEqual(['continent', 'region'])
		expect(brief?.text).toBe("We're after a European at a club in the North East and Yorkshire.")
		expect(brief?.position).toBeUndefined()
		expect(priceOf('kevin danso')).toBe(50)
	})

	it('every known player gets a brief', () => {
		// a brief needs at least two known facts; all current clubs have a region
		const brief = scoutBrief({ name: 'x', club: 'Arsenal', nationality: 'England', position: 'Forward' })
		expect(brief).not.toBeNull()
		expect(brief!.text.length).toBeGreaterThan(10)
	})
})
