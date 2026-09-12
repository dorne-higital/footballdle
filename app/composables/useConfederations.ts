// Nationality → confederation, hand-maintained against the full roster's
// 68 nationalities (see useAllFootballers.ts). Used by Scout Report to award
// partial credit on nationality guesses that share a confederation with the
// answer. When adding a player with a new nationality, add it here too —
// the dev-time warning below catches gaps but doesn't fix them.
export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC'

const NATIONALITY_CONFEDERATION: Record<string, Confederation> = {
	Albania: 'UEFA',
	Armenia: 'UEFA',
	Austria: 'UEFA',
	Belgium: 'UEFA',
	Bulgaria: 'UEFA',
	Croatia: 'UEFA',
	'Czech Republic': 'UEFA',
	Denmark: 'UEFA',
	England: 'UEFA',
	France: 'UEFA',
	Georgia: 'UEFA',
	Germany: 'UEFA',
	Greece: 'UEFA',
	Hungary: 'UEFA',
	Iceland: 'UEFA',
	Ireland: 'UEFA',
	Italy: 'UEFA',
	Latvia: 'UEFA',
	Lithuania: 'UEFA',
	Netherlands: 'UEFA',
	'Northern Ireland': 'UEFA',
	Norway: 'UEFA',
	Poland: 'UEFA',
	Portugal: 'UEFA',
	Romania: 'UEFA',
	Russia: 'UEFA',
	Scotland: 'UEFA',
	Serbia: 'UEFA',
	Slovakia: 'UEFA',
	Slovenia: 'UEFA',
	Spain: 'UEFA',
	Sweden: 'UEFA',
	Switzerland: 'UEFA',
	Turkey: 'UEFA',
	Ukraine: 'UEFA',
	Wales: 'UEFA',

	Argentina: 'CONMEBOL',
	Brazil: 'CONMEBOL',
	Colombia: 'CONMEBOL',
	Ecuador: 'CONMEBOL',
	Paraguay: 'CONMEBOL',
	Uruguay: 'CONMEBOL',
	Venezuela: 'CONMEBOL',

	Haiti: 'CONCACAF',
	Jamaica: 'CONCACAF',
	Mexico: 'CONCACAF',
	'Trinidad & Tobago': 'CONCACAF',
	USA: 'CONCACAF',

	Algeria: 'CAF',
	'Burkina Faso': 'CAF',
	Cameroon: 'CAF',
	'Congo DR': 'CAF',
	Egypt: 'CAF',
	Gambia: 'CAF',
	Ghana: 'CAF',
	'Guinea-Bissau': 'CAF',
	'Ivory Coast': 'CAF',
	Mali: 'CAF',
	Morocco: 'CAF',
	Mozambique: 'CAF',
	Nigeria: 'CAF',
	Senegal: 'CAF',
	'South Africa': 'CAF',
	Tunisia: 'CAF',

	Japan: 'AFC',
	'South Korea': 'AFC',
	Uzbekistan: 'AFC',

	'New Zealand': 'OFC',
}

export function getConfederation(nationality: string): Confederation | null {
	const confederation = NATIONALITY_CONFEDERATION[nationality]
	if (!confederation && import.meta.dev) {
		// eslint-disable-next-line no-console
		console.warn(`[useConfederations] No confederation mapped for nationality "${nationality}" — add it to useConfederations.ts.`)
	}
	return confederation ?? null
}
