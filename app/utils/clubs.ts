// Card and crest styling per club: a home-shirt colour, readable text on it, and a
// three-letter code. Clubs not listed (e.g. after promotion) get a neutral style.
export interface ClubStyle {
	code: string
	bg: string
	fg: string
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
	return CLUBS[club] ?? { code: club.slice(0, 3).toUpperCase(), bg: '#24352d', fg: '#eaf5ee' }
}
