// Nationality → confederation, hand-maintained against the current roster's
// ~34 nationalities (see useFootballers.ts). Used by Scout Report to award
// partial credit on nationality guesses that share a confederation with the
// answer. When adding a player with a new nationality, add it here too —
// the dev-time warning below catches gaps but doesn't fix them.
export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC'

const NATIONALITY_CONFEDERATION: Record<string, Confederation> = {
	England: 'UEFA',
	Wales: 'UEFA',
	Scotland: 'UEFA',
	'Northern Ireland': 'UEFA',
	Ireland: 'UEFA',
	France: 'UEFA',
	Germany: 'UEFA',
	Netherlands: 'UEFA',
	Belgium: 'UEFA',
	Spain: 'UEFA',
	Italy: 'UEFA',
	Sweden: 'UEFA',
	Denmark: 'UEFA',
	Portugal: 'UEFA',
	Greece: 'UEFA',
	Hungary: 'UEFA',
	Latvia: 'UEFA',
	Switzerland: 'UEFA',
	Ukraine: 'UEFA',
	Ecuador: 'CONMEBOL',
	Brazil: 'CONMEBOL',
	Argentina: 'CONMEBOL',
	Uruguay: 'CONMEBOL',
	Jamaica: 'CONCACAF',
	Haiti: 'CONCACAF',
	Cameroon: 'CAF',
	Nigeria: 'CAF',
	'Ivory Coast': 'CAF',
	Senegal: 'CAF',
	'South Africa': 'CAF',
	'Congo DR': 'CAF',
	Tunisia: 'CAF',
	Gambia: 'CAF',
	Japan: 'AFC',
}

export function getConfederation(nationality: string): Confederation | null {
	const confederation = NATIONALITY_CONFEDERATION[nationality]
	if (!confederation && import.meta.dev) {
		// eslint-disable-next-line no-console
		console.warn(`[useConfederations] No confederation mapped for nationality "${nationality}" — add it to useConfederations.ts.`)
	}
	return confederation ?? null
}
