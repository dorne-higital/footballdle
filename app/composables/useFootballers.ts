export type Position = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'

export interface Footballer {
	name: string
	club: string
	nationality: string
	position: Position
}

export const footballers: Footballer[] = [
	{ name: 'abbott', club: 'Nottingham Forest', nationality: 'English', position: 'Midfielder' },
	{ name: 'ampadu', club: 'Leeds United', nationality: 'Welsh', position: 'Midfielder' },
	{ name: 'angulo', club: 'Sunderland', nationality: 'Ecuadorian', position: 'Midfielder' },
	{ name: 'austin', club: 'Tottenham', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'bailey', club: 'Aston Villa', nationality: 'Jamaican', position: 'Midfielder' },
	{ name: 'baleba', club: 'Brighton & Hove Albion', nationality: 'Cameroonian', position: 'Midfielder' },
	{ name: 'barnes', club: 'Newcastle', nationality: 'English', position: 'Midfielder' },
	{ name: 'bassey', club: 'Fulham', nationality: 'Nigerian', position: 'Midfielder' },
	{ name: 'botman', club: 'Newcastle', nationality: 'Dutch', position: 'Midfielder' },
	{ name: 'brooks', club: 'Wolverhampton', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'cairns', club: 'Leeds United', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'canvot', club: 'Crystal Palace', nationality: 'French', position: 'Defender' },
	{ name: 'cherki', club: 'Manchester City', nationality: 'French', position: 'Midfielder' },
	{ name: 'chiesa', club: 'Liverpool', nationality: 'Italian', position: 'Midfielder' },
	{ name: 'cirkin', club: 'Sunderland', nationality: 'Latvia', position: 'Midfielder' },
	{ name: 'cuenca', club: 'Fulham', nationality: 'Spanish', position: 'Midfielder' },
	{ name: 'cullen', club: 'Burnley', nationality: 'Irish', position: 'Midfielder' },
	{ name: 'cuyper', club: 'Brighton & Hove Albion', nationality: 'Belgian', position: 'Defender' },
	{ name: 'darlow', club: 'Leeds United', nationality: 'Welsh', position: 'Goalkeeper' },
	{ name: 'davies', club: 'Liverpool', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'deligt', club: 'Manchester United', nationality: 'Dutch', position: 'Defender' },
	{ name: 'diallo', club: 'Manchester United', nationality: 'Ivorian', position: 'Midfielder' },
	{ name: 'diarra', club: 'Sunderland', nationality: 'Senegalese', position: 'Midfielder' },
	{ name: 'disasi', club: 'West Ham', nationality: 'French', position: 'Midfielder' },
	{ name: 'dowman', club: 'Arsenal', nationality: 'English', position: 'Midfielder' },
	{ name: 'edozie', club: 'Wolverhampton', nationality: 'English', position: 'Midfielder' },
	{ name: 'elanga', club: 'Newcastle', nationality: 'Swedish', position: 'Midfielder' },
	{ name: 'essugo', club: 'Chelsea', nationality: 'Portuguese', position: 'Midfielder' },
	{ name: 'felipe', club: 'West Ham', nationality: 'Brazilian', position: 'Forward' },
	{ name: 'fofana', club: 'Chelsea', nationality: 'French', position: 'Midfielder' },
	{ name: 'foster', club: 'Burnley', nationality: 'South Africa', position: 'Midfielder' },
	{ name: 'fraser', club: 'Wolverhampton', nationality: 'English', position: 'Midfielder' },
	{ name: 'garcia', club: 'Aston Villa', nationality: 'Spanish', position: 'Midfielder' },
	{ name: 'garner', club: 'Everton', nationality: 'English', position: 'Midfielder' },
	{ name: 'george', club: 'Everton', nationality: 'English', position: 'Midfielder' },
	{ name: 'gnonto', club: 'Leeds United', nationality: 'Italian', position: 'Midfielder' },
	{ name: 'gordon', club: 'Liverpool', nationality: 'English', position: 'Midfielder' },
	{ name: 'gracey', club: 'Wolverhampton', nationality: 'Northern Irish', position: 'Goalkeeper' },
	{ name: 'graham', club: 'Everton', nationality: 'Northern Irish', position: 'Forward' },
	{ name: 'gunter', club: 'Tottenham', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'harris', club: 'Newcastle', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'heaton', club: 'Manchester United', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'heaven', club: 'Manchester United', nationality: 'English', position: 'Midfielder' },
	{ name: 'heskey', club: 'Manchester City', nationality: 'English', position: 'Forward' },
	{ name: 'hickey', club: 'Brentford', nationality: 'Scottish', position: 'Midfielder' },
	{ name: 'howell', club: 'Brighton & Hove Albion', nationality: 'English', position: 'Forward' },
	{ name: 'hughes', club: 'Crystal Palace', nationality: 'English', position: 'Midfielder' },
	{ name: 'isidor', club: 'Sunderland', nationality: 'French', position: 'Midfielder' },
	{ name: 'janelt', club: 'Brentford', nationality: 'German', position: 'Midfielder' },
	{ name: 'jensen', club: 'Brentford', nationality: 'Danish', position: 'Midfielder' },
	{ name: 'justin', club: 'Leeds United', nationality: 'English', position: 'Midfielder' },
	{ name: 'kamada', club: 'Crystal Palace', nationality: 'Japanese', position: 'Midfielder' },
	{ name: 'kamara', club: 'Aston Villa', nationality: 'French', position: 'Midfielder' },
	{ name: 'kayode', club: 'Brentford', nationality: 'Italian', position: 'Midfielder' },
	{ name: 'kerkez', club: 'Liverpool', nationality: 'Hungarian', position: 'Midfielder' },
	{ name: 'kilman', club: 'West Ham', nationality: 'English', position: 'Midfielder' },
	{ name: 'kporha', club: 'Crystal Palace', nationality: 'English', position: 'Midfielder' },
	{ name: 'krafth', club: 'Newcastle', nationality: 'Swedish', position: 'Midfielder' },
	{ name: 'kroupi', club: 'Bournemouth', nationality: 'French', position: 'Midfielder' },
	{ name: 'laffey', club: 'Liverpool', nationality: 'English', position: 'Midfielder' },
	{ name: 'larsen', club: 'Burnley', nationality: 'Danish', position: 'Midfielder' },
	{ name: 'mainoo', club: 'Manchester United', nationality: 'English', position: 'Midfielder' },
	{ name: 'mandas', club: 'Bournemouth', nationality: 'Greek', position: 'Goalkeeper' },
	{ name: 'mateta', club: 'Crystal Palace', nationality: 'French', position: 'Midfielder' },
	{ name: 'mayers', club: 'West Ham', nationality: 'English', position: 'Defender' },
	{ name: 'mbeumo', club: 'Manchester United', nationality: 'Cameroonian', position: 'Midfielder' },
	{ name: 'mcatee', club: 'Nottingham Forest', nationality: 'English', position: 'Midfielder' },
	{ name: 'mcgill', club: 'Brighton & Hove Albion', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'mcginn', club: 'Aston Villa', nationality: 'Scottish', position: 'Midfielder' },
	{ name: 'mcneil', club: 'Everton', nationality: 'English', position: 'Midfielder' },
	{ name: 'mejbri', club: 'Burnley', nationality: 'Tunisia', position: 'Midfielder' },
	{ name: 'merino', club: 'Arsenal', nationality: 'Spanish', position: 'Midfielder' },
	{ name: 'mheuka', club: 'Chelsea', nationality: 'English', position: 'Forward' },
	{ name: 'milner', club: 'Brighton & Hove Albion', nationality: 'English', position: 'Midfielder' },
	{ name: 'minteh', club: 'Brighton & Hove Albion', nationality: 'Gambian', position: 'Midfielder' },
	{ name: 'mitoma', club: 'Brighton & Hove Albion', nationality: 'Japanese', position: 'Midfielder' },
	{ name: 'morato', club: 'Nottingham Forest', nationality: 'Brazilian', position: 'Midfielder' },
	{ name: 'moreno', club: 'Nottingham Forest', nationality: 'German', position: 'Goalkeeper' },
	{ name: 'mudryk', club: 'Chelsea', nationality: 'Ukrainian', position: 'Midfielder' },
	{ name: 'mundle', club: 'Sunderland', nationality: 'English', position: 'Midfielder' },
	{ name: 'murphy', club: 'Newcastle', nationality: 'English', position: 'Midfielder' },
	{ name: 'ndiaye', club: 'Everton', nationality: 'Senegalese', position: 'Midfielder' },
	{ name: 'nelson', club: 'Brentford', nationality: 'English', position: 'Midfielder' },
	{ name: 'nmecha', club: 'Leeds United', nationality: 'German', position: 'Midfielder' },
	{ name: 'oakley', club: 'Aston Villa', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'obrien', club: 'Everton', nationality: 'Irish', position: 'Midfielder' },
	{ name: 'okafor', club: 'Leeds United', nationality: 'Swiss', position: 'Midfielder' },
	{ name: 'orford', club: 'West Ham', nationality: 'English', position: 'Midfielder' },
	{ name: 'oriley', club: 'Brighton & Hove Albion', nationality: 'Danish', position: 'Midfielder' },
	{ name: 'oriola', club: 'Brighton & Hove Albion', nationality: 'English', position: 'Midfielder' },
	{ name: 'palmer', club: 'Chelsea', nationality: 'English', position: 'Midfielder' },
	{ name: 'porter', club: 'Arsenal', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'pouani', club: 'Burnley', nationality: 'English', position: 'Forward' },
	{ name: 'ramsay', club: 'Liverpool', nationality: 'Scottish', position: 'Midfielder' },
	{ name: 'ramsey', club: 'Newcastle', nationality: 'English', position: 'Midfielder' },
	{ name: 'ranson', club: 'Arsenal', nationality: 'English', position: 'Midfielder' },
	{ name: 'rodney', club: 'Crystal Palace', nationality: 'English', position: 'Midfielder' },
	{ name: 'rogers', club: 'Aston Villa', nationality: 'English', position: 'Midfielder' },
	{ name: 'romero', club: 'Tottenham', nationality: 'Argentine', position: 'Midfielder' },
	{ name: 'rutter', club: 'Brighton & Hove Albion', nationality: 'French', position: 'Midfielder' },
	{ name: 'sadiki', club: 'Sunderland', nationality: 'Congolese', position: 'Defender' },
	{ name: 'saliba', club: 'Arsenal', nationality: 'French', position: 'Midfielder' },
	{ name: 'salmon', club: 'Arsenal', nationality: 'English', position: 'Defender' },
	{ name: 'sancho', club: 'Aston Villa', nationality: 'English', position: 'Midfielder' },
	{ name: 'santos', club: 'Chelsea', nationality: 'Brazilian', position: 'Midfielder' },
	{ name: 'savona', club: 'Nottingham Forest', nationality: 'Italian', position: 'Midfielder' },
	{ name: 'schade', club: 'Brentford', nationality: 'German', position: 'Midfielder' },
	{ name: 'senesi', club: 'Bournemouth', nationality: 'Argentine', position: 'Midfielder' },
	{ name: 'shahar', club: 'Newcastle', nationality: 'English', position: 'Defender' },
	{ name: 'shield', club: 'Brentford', nationality: 'English', position: 'Midfielder' },
	{ name: 'simons', club: 'Tottenham', nationality: 'Dutch', position: 'Midfielder' },
	{ name: 'spence', club: 'Tottenham', nationality: 'English', position: 'Midfielder' },
	{ name: 'steele', club: 'Brighton & Hove Albion', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'stones', club: 'Manchester City', nationality: 'English', position: 'Midfielder' },
	{ name: 'tanaka', club: 'Leeds United', nationality: 'Japanese', position: 'Midfielder' },
	{ name: 'tasker', club: 'Brighton & Hove Albion', nationality: 'English', position: 'Defender' },
	{ name: 'timber', club: 'Arsenal', nationality: 'Dutch', position: 'Midfielder' },
	{ name: 'todibo', club: 'West Ham', nationality: 'French', position: 'Midfielder' },
	{ name: 'tonali', club: 'Newcastle', nationality: 'Italian', position: 'Midfielder' },
	{ name: 'torres', club: 'Aston Villa', nationality: 'Spanish', position: 'Midfielder' },
	{ name: 'tzimas', club: 'Brighton & Hove Albion', nationality: 'Greek', position: 'Midfielder' },
	{ name: 'udogie', club: 'Tottenham', nationality: 'Italian', position: 'Midfielder' },
	{ name: 'ugarte', club: 'Manchester United', nationality: 'Uruguayan', position: 'Midfielder' },
	{ name: 'walker', club: 'Burnley', nationality: 'English', position: 'Midfielder' },
	{ name: 'wilson', club: 'Fulham', nationality: 'Welsh', position: 'Midfielder' },
	{ name: 'wright', club: 'Aston Villa', nationality: 'English', position: 'Goalkeeper' },
	{ name: 'yeremy', club: 'Crystal Palace', nationality: 'Spanish', position: 'Forward' },
]

// Fast O(1) lookups
const footballerSet = new Set(footballers.map((f) => f.name.toUpperCase()))
const footballerMap = new Map(footballers.map((f) => [f.name.toUpperCase(), f]))

// Cache for memoized daily answers
const answerCache = new Map<string, string>()

const EPOCH = '01/01/2026' // DD/MM/YYYY — Puzzle #1 launch date

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
	const hash = Array.from(dateStr).reduce((acc, c) => acc + c.charCodeAt(0), 0)
	const answer = footballers[hash % footballers.length]?.name || ''
	answerCache.set(dateStr, answer)
	return answer
}

export function isValidFootballer(name: string): boolean {
	return footballerSet.has(name.toUpperCase())
}

export function getPlayerData(name: string): Footballer | undefined {
	return footballerMap.get(name.toUpperCase())
}
