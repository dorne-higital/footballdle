// Card and crest styling per club: a home-shirt colour, readable text on it, and a
// three-letter code. Clubs not listed (e.g. after promotion) get a neutral style.
//
// Crests (components/cards/ClubCrest.vue) are our own simple badges: a broad shape and the
// club's colours with its code. Deliberately no emblems (cannons, birds, lions…) or other
// parts of the real crests, which are the clubs' trademarks.
export type CrestShape = 'shield' | 'round' | 'square'
export type CrestPattern = 'plain' | 'stripes' | 'halves' | 'band' | 'hoop'
export interface ClubCrest {
	shape: CrestShape
	pattern: CrestPattern
	/** Second colour for the pattern */
	alt: string
	/** Outline colour */
	trim: string
}
export interface ClubStyle {
	code: string
	bg: string
	fg: string
	crest?: ClubCrest
}

const CRESTS: Record<string, ClubCrest> = {
	'Arsenal': { shape: 'shield', pattern: 'plain', alt: '#ffffff', trim: '#c9a227' },
	'Aston Villa': { shape: 'shield', pattern: 'halves', alt: '#95bfe5', trim: '#f2c94c' },
	'Bournemouth': { shape: 'square', pattern: 'stripes', alt: '#111111', trim: '#111111' },
	'Brentford': { shape: 'round', pattern: 'stripes', alt: '#ffffff', trim: '#111111' },
	'Brighton & Hove Albion': { shape: 'round', pattern: 'stripes', alt: '#ffffff', trim: '#0057b8' },
	'Chelsea': { shape: 'round', pattern: 'hoop', alt: '#d1a33a', trim: '#d1a33a' },
	'Coventry City': { shape: 'shield', pattern: 'plain', alt: '#ffffff', trim: '#0b1f2e' },
	'Crystal Palace': { shape: 'shield', pattern: 'halves', alt: '#c4122e', trim: '#ffffff' },
	'Everton': { shape: 'shield', pattern: 'plain', alt: '#ffffff', trim: '#ffffff' },
	'Fulham': { shape: 'shield', pattern: 'band', alt: '#111111', trim: '#111111' },
	'Hull City': { shape: 'shield', pattern: 'stripes', alt: '#111111', trim: '#111111' },
	'Ipswich Town': { shape: 'shield', pattern: 'band', alt: '#ffffff', trim: '#d71920' },
	'Leeds United': { shape: 'shield', pattern: 'band', alt: '#ffcd00', trim: '#1d428a' },
	'Liverpool': { shape: 'shield', pattern: 'plain', alt: '#00b2a9', trim: '#f6eb61' },
	'Manchester City': { shape: 'round', pattern: 'hoop', alt: '#1c2c5b', trim: '#1c2c5b' },
	'Manchester United': { shape: 'shield', pattern: 'band', alt: '#fbe122', trim: '#111111' },
	'Newcastle': { shape: 'round', pattern: 'stripes', alt: '#ffffff', trim: '#41b6e6' },
	'Nottingham Forest': { shape: 'square', pattern: 'plain', alt: '#ffffff', trim: '#ffffff' },
	'Sunderland': { shape: 'shield', pattern: 'stripes', alt: '#ffffff', trim: '#111111' },
	'Tottenham': { shape: 'shield', pattern: 'band', alt: '#ffffff', trim: '#ffffff' },
}

const CLUBS: Record<string, ClubStyle> = {
	'Arsenal': { code: 'ARS', bg: '#db0007', fg: '#ffffff' },
	'Aston Villa': { code: 'AVL', bg: '#670e36', fg: '#ffffff' },
	'Bournemouth': { code: 'BOU', bg: '#b50e12', fg: '#ffffff' },
	'Brentford': { code: 'BRE', bg: '#e30613', fg: '#ffffff' },
	'Brighton & Hove Albion': { code: 'BHA', bg: '#0057b8', fg: '#ffffff' },
	'Chelsea': { code: 'CHE', bg: '#034694', fg: '#ffffff' },
	'Coventry City': { code: 'COV', bg: '#59cbe8', fg: '#0b1f2e' },
	'Crystal Palace': { code: 'CRY', bg: '#1b458f', fg: '#ffffff' },
	'Everton': { code: 'EVE', bg: '#003399', fg: '#ffffff' },
	'Fulham': { code: 'FUL', bg: '#f5f5f5', fg: '#111111' },
	'Hull City': { code: 'HUL', bg: '#f5a12d', fg: '#111111' },
	'Ipswich Town': { code: 'IPS', bg: '#0044a9', fg: '#ffffff' },
	'Leeds United': { code: 'LEE', bg: '#f5f5f5', fg: '#1d428a' },
	'Liverpool': { code: 'LIV', bg: '#c8102e', fg: '#ffffff' },
	'Manchester City': { code: 'MCI', bg: '#6cabdd', fg: '#0b1f2e' },
	'Manchester United': { code: 'MUN', bg: '#da291c', fg: '#ffffff' },
	'Newcastle': { code: 'NEW', bg: '#241f20', fg: '#ffffff' },
	'Nottingham Forest': { code: 'NFO', bg: '#dd0000', fg: '#ffffff' },
	'Sunderland': { code: 'SUN', bg: '#eb172b', fg: '#ffffff' },
	'Tottenham': { code: 'TOT', bg: '#132257', fg: '#ffffff' },
}

export function clubStyle(club: string): ClubStyle {
	const style = CLUBS[club] ?? { code: club.slice(0, 3).toUpperCase(), bg: '#24352d', fg: '#eaf5ee' }
	return { ...style, crest: CRESTS[club] ?? { shape: 'shield', pattern: 'plain', alt: style.fg, trim: style.fg } }
}
