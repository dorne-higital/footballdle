export type Position =
	| 'Goalkeeper'
	| 'Defender'
	| 'Midfielder'
	| 'Forward'
	| 'Centre-Back'
	| 'Defensive Midfield'
	| 'Right Winger'
	| 'Left Winger'
	| 'Left Midfield'
	| 'Attacking Midfield'
	| 'Left-Back'
	| 'Right-Back'
	| 'Central Midfield'
	| 'Centre-Forward'
	| 'Unknown'
	| 'null'

export interface Footballer {
	name: string
	club: string
	nationality: string
	position: Position
}

export const footballers: Footballer[] = [
	{ name: 'abbott', club: 'Nottingham Forest', nationality: 'England', position: 'Centre-Back' },
	{ name: 'ampadu', club: 'Leeds United', nationality: 'Wales', position: 'Defensive Midfield' },
	{ name: 'angulo', club: 'Sunderland', nationality: 'Ecuador', position: 'Midfielder' },
	{ name: 'austin', club: 'Tottenham', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'bailey', club: 'Aston Villa', nationality: 'Jamaica', position: 'Right Winger' },
	{ name: 'baleba', club: 'Brighton & Hove Albion', nationality: 'Cameroon', position: 'Defensive Midfield' },
	{ name: 'barnes', club: 'Newcastle', nationality: 'England', position: 'Left Winger' },
	{ name: 'bassey', club: 'Fulham', nationality: 'Nigeria', position: 'Centre-Back' },
	{ name: 'botman', club: 'Newcastle', nationality: 'Netherlands', position: 'Centre-Back' },
	{ name: 'brooks', club: 'Wolverhampton', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'cairns', club: 'Leeds United', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'canvot', club: 'Crystal Palace', nationality: 'France', position: 'Defender' },
	{ name: 'cherki', club: 'Manchester City', nationality: 'France', position: 'Attacking Midfield' },
	{ name: 'chiesa', club: 'Liverpool', nationality: 'Italy', position: 'Right Winger' },
	{ name: 'cirkin', club: 'Sunderland', nationality: 'Latvia', position: 'Left-Back' },
	{ name: 'cuenca', club: 'Fulham', nationality: 'Spain', position: 'Centre-Back' },
	{ name: 'cullen', club: 'Burnley', nationality: 'Ireland', position: 'Defensive Midfield' },
	{ name: 'cuyper', club: 'Brighton & Hove Albion', nationality: 'Belgium', position: 'Defender' },
	{ name: 'darlow', club: 'Leeds United', nationality: 'Wales', position: 'Goalkeeper' },
	{ name: 'davies', club: 'Liverpool', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'diallo', club: 'Manchester United', nationality: 'Ivory Coast', position: 'Right Winger' },
	{ name: 'diarra', club: 'Sunderland', nationality: 'Senegal', position: 'Central Midfield' },
	{ name: 'disasi', club: 'West Ham', nationality: 'France', position: 'Centre-Back' },
	{ name: 'dowman', club: 'Arsenal', nationality: 'England', position: 'Midfielder' },
	{ name: 'edozie', club: 'Wolverhampton', nationality: 'England', position: 'Midfielder' },
	{ name: 'elanga', club: 'Newcastle', nationality: 'Sweden', position: 'Right Winger' },
	{ name: 'essugo', club: 'Chelsea', nationality: 'Portugal', position: 'Defensive Midfield' },
	{ name: 'felipe', club: 'West Ham', nationality: 'Brazil', position: 'Forward' },
	{ name: 'fofana', club: 'Chelsea', nationality: 'France', position: 'Centre-Back' },
	{ name: 'foster', club: 'Burnley', nationality: 'South Africa', position: 'Centre-Forward' },
	{ name: 'fraser', club: 'Wolverhampton', nationality: 'England', position: 'Centre-Forward' },
	{ name: 'garcia', club: 'Aston Villa', nationality: 'Spain', position: 'Right-Back' },
	{ name: 'garner', club: 'Everton', nationality: 'England', position: 'Defensive Midfield' },
	{ name: 'george', club: 'Everton', nationality: 'England', position: 'Left Winger' },
	{ name: 'gnonto', club: 'Leeds United', nationality: 'Italy', position: 'Right Winger' },
	{ name: 'gordon', club: 'Liverpool', nationality: 'England', position: 'Right Winger' },
	{ name: 'gracey', club: 'Wolverhampton', nationality: 'Northern Ireland', position: 'Goalkeeper' },
	{ name: 'graham', club: 'Everton', nationality: 'Northern Ireland', position: 'Forward' },
	{ name: 'gunter', club: 'Tottenham', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'harris', club: 'Newcastle', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'heaton', club: 'Manchester United', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'heaven', club: 'Manchester United', nationality: 'England', position: 'Centre-Back' },
	{ name: 'heskey', club: 'Manchester City', nationality: 'England', position: 'Forward' },
	{ name: 'hickey', club: 'Brentford', nationality: 'Scotland', position: 'Right-Back' },
	{ name: 'howell', club: 'Brighton & Hove Albion', nationality: 'England', position: 'Forward' },
	{ name: 'hughes', club: 'Crystal Palace', nationality: 'England', position: 'Central Midfield' },
	{ name: 'isidor', club: 'Sunderland', nationality: 'France', position: 'Centre-Forward' },
	{ name: 'janelt', club: 'Brentford', nationality: 'Germany', position: 'Defensive Midfield' },
	{ name: 'jensen', club: 'Brentford', nationality: 'Denmark', position: 'Central Midfield' },
	{ name: 'justin', club: 'Leeds United', nationality: 'England', position: 'Right-Back' },
	{ name: 'kamada', club: 'Crystal Palace', nationality: 'Japan', position: 'Attacking Midfield' },
	{ name: 'kamara', club: 'Aston Villa', nationality: 'France', position: 'Defensive Midfield' },
	{ name: 'kayode', club: 'Brentford', nationality: 'Italy', position: 'Right-Back' },
	{ name: 'kerkez', club: 'Liverpool', nationality: 'Hungary', position: 'Left-Back' },
	{ name: 'kilman', club: 'West Ham', nationality: 'England', position: 'Centre-Back' },
	{ name: 'kporha', club: 'Crystal Palace', nationality: 'England', position: 'Right-Back' },
	{ name: 'krafth', club: 'Newcastle', nationality: 'Sweden', position: 'Right-Back' },
	{ name: 'kroupi', club: 'Bournemouth', nationality: 'France', position: 'Centre-Forward' },
	{ name: 'laffey', club: 'Liverpool', nationality: 'England', position: 'Midfielder' },
	{ name: 'larsen', club: 'Burnley', nationality: 'Denmark', position: 'Left Winger' },
	{ name: 'mainoo', club: 'Manchester United', nationality: 'England', position: 'Central Midfield' },
	{ name: 'mandas', club: 'Bournemouth', nationality: 'Greece', position: 'Goalkeeper' },
	{ name: 'mateta', club: 'Crystal Palace', nationality: 'France', position: 'Centre-Forward' },
	{ name: 'mayers', club: 'West Ham', nationality: 'England', position: 'Defender' },
	{ name: 'mbeumo', club: 'Manchester United', nationality: 'Cameroon', position: 'Right Winger' },
	{ name: 'mcatee', club: 'Nottingham Forest', nationality: 'England', position: 'Attacking Midfield' },
	{ name: 'mcgill', club: 'Brighton & Hove Albion', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'mcginn', club: 'Aston Villa', nationality: 'Scotland', position: 'Central Midfield' },
	{ name: 'mcneil', club: 'Everton', nationality: 'England', position: 'Attacking Midfield' },
	{ name: 'mejbri', club: 'Burnley', nationality: 'Tunisia', position: 'Attacking Midfield' },
	{ name: 'merino', club: 'Arsenal', nationality: 'Spain', position: 'Central Midfield' },
	{ name: 'mheuka', club: 'Chelsea', nationality: 'England', position: 'Forward' },
	{ name: 'milner', club: 'Brighton & Hove Albion', nationality: 'England', position: 'Central Midfield' },
	{ name: 'minteh', club: 'Brighton & Hove Albion', nationality: 'Gambia', position: 'Right Winger' },
	{ name: 'mitoma', club: 'Brighton & Hove Albion', nationality: 'Japan', position: 'Left Winger' },
	{ name: 'morato', club: 'Nottingham Forest', nationality: 'Brazil', position: 'Centre-Back' },
	{ name: 'moreno', club: 'Nottingham Forest', nationality: 'Germany', position: 'Goalkeeper' },
	{ name: 'mudryk', club: 'Chelsea', nationality: 'Ukraine', position: 'Left Winger' },
	{ name: 'mundle', club: 'Sunderland', nationality: 'England', position: 'Left Winger' },
	{ name: 'murphy', club: 'Newcastle', nationality: 'England', position: 'Right Winger' },
	{ name: 'ndiaye', club: 'Everton', nationality: 'Senegal', position: 'Left Winger' },
	{ name: 'nelson', club: 'Brentford', nationality: 'England', position: 'Right Winger' },
	{ name: 'nmecha', club: 'Leeds United', nationality: 'Germany', position: 'Centre-Forward' },
	{ name: 'oakley', club: 'Aston Villa', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'obrien', club: 'Everton', nationality: 'Ireland', position: 'Centre-Back' },
	{ name: 'okafor', club: 'Leeds United', nationality: 'Switzerland', position: 'Left Winger' },
	{ name: 'orford', club: 'West Ham', nationality: 'England', position: 'Central Midfield' },
	{ name: 'oriley', club: 'Brighton & Hove Albion', nationality: 'Denmark', position: 'Central Midfield' },
	{ name: 'oriola', club: 'Brighton & Hove Albion', nationality: 'England', position: 'Midfielder' },
	{ name: 'palmer', club: 'Chelsea', nationality: 'England', position: 'Attacking Midfield' },
	{ name: 'porter', club: 'Arsenal', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'pouani', club: 'Burnley', nationality: 'England', position: 'Forward' },
	{ name: 'ramsay', club: 'Liverpool', nationality: 'Scotland', position: 'Right-Back' },
	{ name: 'ramsey', club: 'Newcastle', nationality: 'England', position: 'Left Midfield' },
	{ name: 'ranson', club: 'Arsenal', nationality: 'England', position: 'Unknown' },
	{ name: 'rodney', club: 'Crystal Palace', nationality: 'England', position: 'Defensive Midfield' },
	{ name: 'rogers', club: 'Aston Villa', nationality: 'England', position: 'Attacking Midfield' },
	{ name: 'romero', club: 'Tottenham', nationality: 'Argentina', position: 'Centre-Back' },
	{ name: 'rutter', club: 'Brighton & Hove Albion', nationality: 'France', position: 'Centre-Forward' },
	{ name: 'sadiki', club: 'Sunderland', nationality: 'DR Congo', position: 'Defender' },
	{ name: 'saliba', club: 'Arsenal', nationality: 'France', position: 'Centre-Back' },
	{ name: 'salmon', club: 'Arsenal', nationality: 'England', position: 'Defender' },
	{ name: 'sancho', club: 'Aston Villa', nationality: 'England', position: 'Left Winger' },
	{ name: 'santos', club: 'Chelsea', nationality: 'Brazil', position: 'Central Midfield' },
	{ name: 'savona', club: 'Nottingham Forest', nationality: 'Italy', position: 'Right-Back' },
	{ name: 'schade', club: 'Brentford', nationality: 'Germany', position: 'Left Winger' },
	{ name: 'senesi', club: 'Bournemouth', nationality: 'Argentina', position: 'Centre-Back' },
	{ name: 'shahar', club: 'Newcastle', nationality: 'England', position: 'Defender' },
	{ name: 'shield', club: 'Brentford', nationality: 'England', position: 'Midfielder' },
	{ name: 'simons', club: 'Tottenham', nationality: 'Netherlands', position: 'Attacking Midfield' },
	{ name: 'spence', club: 'Tottenham', nationality: 'England', position: 'Right-Back' },
	{ name: 'steele', club: 'Brighton & Hove Albion', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'stones', club: 'Manchester City', nationality: 'England', position: 'Centre-Back' },
	{ name: 'tanaka', club: 'Leeds United', nationality: 'Japan', position: 'Central Midfield' },
	{ name: 'tasker', club: 'Brighton & Hove Albion', nationality: 'England', position: 'Defender' },
	{ name: 'timber', club: 'Arsenal', nationality: 'Netherlands', position: 'Right-Back' },
	{ name: 'todibo', club: 'West Ham', nationality: 'France', position: 'Centre-Back' },
	{ name: 'tonali', club: 'Newcastle', nationality: 'Italy', position: 'Central Midfield' },
	{ name: 'torres', club: 'Aston Villa', nationality: 'Spain', position: 'Centre-Back' },
	{ name: 'tzimas', club: 'Brighton & Hove Albion', nationality: 'Greece', position: 'Centre-Forward' },
	{ name: 'udogie', club: 'Tottenham', nationality: 'Italy', position: 'Left-Back' },
	{ name: 'ugarte', club: 'Manchester United', nationality: 'Uruguay', position: 'Defensive Midfield' },
	{ name: 'walker', club: 'Burnley', nationality: 'England', position: 'Right-Back' },
	{ name: 'wilson', club: 'Fulham', nationality: 'Wales', position: 'Right Winger' },
	{ name: 'wright', club: 'Aston Villa', nationality: 'England', position: 'Goalkeeper' },
	{ name: 'yeremy', club: 'Crystal Palace', nationality: 'Spain', position: 'Forward' },
]

// Fast O(1) lookups
const footballerSet = new Set(footballers.map((f) => f.name.toUpperCase()))
const footballerMap = new Map(footballers.map((f) => [f.name.toUpperCase(), f]))

// Cache for memoized daily answers
const answerCache = new Map<string, string>()

const EPOCH = '01/01/2026' // DD/MM/YYYY — Puzzle #1 launch date

// Fixed seed — never change this or all past answers will shift
const SHUFFLE_SEED = 20260101

function seededShuffle<T>(arr: T[], seed: number): T[] {
	const result = [...arr]
	let s = seed >>> 0
	for (let i = result.length - 1; i > 0; i--) {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0
		const j = s % (i + 1)
		;[result[i], result[j]] = [result[j]!, result[i]!]
	}
	return result
}

// Shuffled once at module load — order is deterministic and permanent
const shuffledFootballers = seededShuffle(footballers, SHUFFLE_SEED)

export function getPuzzleNumber(dateStr: string): number {
	const [d1, m1, y1] = EPOCH.split('/').map(Number)
	const [d2, m2, y2] = dateStr.split('/').map(Number)
	const epochDate = new Date(y1!, m1! - 1, d1)
	const todayDate = new Date(y2!, m2! - 1, d2)
	const diff = Math.round((todayDate.getTime() - epochDate.getTime()) / (24 * 60 * 60 * 1000))
	return diff + 1
}

export function getAnswerForDay(dateStr: string): string {
	if (answerCache.has(dateStr)) return answerCache.get(dateStr)!
	const idx = getPuzzleNumber(dateStr) - 1 // 0-indexed
	const safeIdx = ((idx % shuffledFootballers.length) + shuffledFootballers.length) % shuffledFootballers.length
	const answer = shuffledFootballers[safeIdx]?.name || ''
	answerCache.set(dateStr, answer)
	return answer
}

export function isValidFootballer(name: string): boolean {
	return footballerSet.has(name.toUpperCase())
}

export function getPlayerData(name: string): Footballer | undefined {
	return footballerMap.get(name.toUpperCase())
}
