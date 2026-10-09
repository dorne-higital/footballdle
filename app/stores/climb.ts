import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import playersData from '../data/players.json'
import { readSavedObject } from '../utils/storage'
import { generateMatch, restCount, seededRandom, TIER_NAMES, type ClimbPlayer } from '../utils/climb/questions'
import {
	answer as answerQuestion,
	isFinished,
	startMatch,
	summarise,
	targetsFor,
	timeUp as timeUpQuestion,
	useVar as useVarOn,
	type MatchState,
	type OpponentStanding,
	type Result,
	type Targets,
} from '../utils/climb/match'
import {
	clubById,
	CL_TIER,
	currentMatchweek,
	newSeason,
	nextKnockout,
	nextTier,
	outcomeFor,
	playMatchweek,
	standing,
	table,
	withPlayoff,
	YOU,
	type Club,
	type Fixture,
	type Outcome,
	type Season,
} from '../utils/climb/league'
import { usePurchasesStore } from './purchases'

// The Climb (iOS app, 1.2): your club's seasons from the National League up. Questions,
// matches and leagues come from utils/climb/*; this store keeps the save, plays matches
// through and decides what happens at the end of a season.
export type YourClub = Pick<Club, 'name' | 'code' | 'bg' | 'fg' | 'alt' | 'shape' | 'pattern'>

type MatchKind = 'league' | 'playoff' | 'knockout' | 'pens'

interface LiveMatch {
	kind: MatchKind
	/** League matchweek (index); knockout round index for knockouts */
	round: number
	opponent: string
	state: MatchState
	/** Penalties: the tie they settle and what the other side scored */
	pens?: { tie: 'playoff' | 'knockout'; theirs: number }
}

export interface LastResult {
	kind: MatchKind
	opponent: string
	score: [number, number]
	result: Result
	correct: number
	targets: Targets
	/** League: the other results that matchweek */
	others: Fixture[]
	posBefore: number
	posAfter: number
	/** Penalties: your total against theirs */
	pens?: { yours: number; theirs: number; won: boolean }
}

export interface SeasonEnd {
	tier: number
	outcome: Outcome
	/** Won the league (or the Champions League) */
	title: boolean
	hints: number
	next: number
	/** Went up through the play-off final */
	playoffWon?: boolean
	/** Champions League: how far you got */
	clRound?: string
	/** Earned promotion past the leagues switched on in this build */
	capped?: boolean
}

interface Saved {
	v: 1
	club: YourClub | null
	season: Season | null
	seasons: number
	/** Titles won by tier */
	titles: Record<number, number>
	history: { tier: number; number: number; position: number; kind: Outcome['kind'] }[]
	live: LiveMatch | null
	last: LastResult | null
	end: SeasonEnd | null
	/** Players seen in recent matches, newest last, rested from the next one */
	recent?: string[]
	/** Trophy cards won: id -> times won and the season first won */
	trophies?: Record<string, { count: number; first: number }>
}

const STORAGE_KEY = 'footballdle-climb'
/** Hints for winning each league, National League to Champions League */
export const TITLE_HINTS = [1, 1, 1, 2, 3, 4] as const
/** Leagues switched on in this build: the first TestFlight only has the first two */
export const MAX_TIER = 1
const PENS_QUESTIONS = 5

/** The trophy cards to collect: a title for each league, plus three specials */
export const TROPHY_CARDS = [
	...TIER_NAMES.map((name, tier) => ({ id: `title-${tier}`, name, kind: 'title' as const, tier, how: `Win the ${name}` })),
	{ id: 'playoff', name: 'Play-off winners', kind: 'special' as const, tier: -1, how: 'Go up through the play-off final' },
	{ id: 'invincibles', name: 'Invincibles', kind: 'special' as const, tier: -1, how: 'Go a whole season unbeaten' },
	{ id: 'perfect', name: 'Perfect 10', kind: 'special' as const, tier: -1, how: 'Get all 10 right in a match' },
]

const players = playersData as ClimbPlayer[]
const empty = (): Saved => ({ v: 1, club: null, season: null, seasons: 0, titles: {}, history: [], live: null, last: null, end: null })

export const useClimbStore = defineStore('climb', () => {
	const saved = ref<Saved>(empty())
	let loaded = false

	function load() {
		if (loaded || !import.meta.client) return
		loaded = true
		const s = readSavedObject<Saved>(STORAGE_KEY)
		if (s?.v === 1) saved.value = { ...empty(), ...s }
		// Titles won before trophy cards existed become their cards
		if (!saved.value.trophies) {
			saved.value.trophies = Object.fromEntries(
				Object.entries(saved.value.titles).filter(([, n]) => n > 0).map(([tier, n]) => [`title-${tier}`, { count: n, first: 1 }]),
			)
		}
	}
	function persist() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.value))
		} catch {}
	}
	if (import.meta.client) watch(saved, persist, { deep: true })

	const season = computed(() => saved.value.season)
	const tier = computed(() => season.value?.tier ?? 0)
	const tierName = computed(() => TIER_NAMES[tier.value] ?? '')
	const rows = computed(() => (season.value ? table(season.value) : []))
	const position = computed(() => rows.value.findIndex(r => r.id === YOU) + 1)

	/** What the hub shows next */
	const nextUp = computed<'setup' | 'season-end' | 'league' | 'playoff' | 'knockout'>(() => {
		const s = season.value
		if (!saved.value.club || !s) return 'setup'
		if (saved.value.end) return 'season-end'
		if (s.playoff && s.playoff.hg === undefined) return 'playoff'
		const ko = s.knockouts?.at(-1)
		if (ko && ko.fixture.hg === undefined) return 'knockout'
		return 'league'
	})

	/** Your next opponent and what you need against them */
	const nextFixture = computed(() => {
		const s = season.value
		if (!s) return null
		let opponentId: string | undefined
		let home = true
		let label = ''
		if (nextUp.value === 'playoff') {
			opponentId = s.playoff!.away
			label = 'Play-off final'
		} else if (nextUp.value === 'knockout') {
			const ko = s.knockouts!.at(-1)!
			opponentId = ko.fixture.away
			label = ko.round
		} else {
			const mw = currentMatchweek(s)
			const f = mw >= 0 ? s.fixtures[mw]!.find(x => x.home === YOU || x.away === YOU) : undefined
			if (!f) return null
			home = f.home === YOU
			opponentId = home ? f.away : f.home
			label = `Week ${mw + 1} of ${s.fixtures.length}`
		}
		const opponent = clubById(s, opponentId!)!
		const opp: OpponentStanding = nextUp.value === 'league' ? standing(s, opponent.id) : 'mid'
		return { opponent, home, label, standing: opp, targets: targetsFor(s.tier, opp) }
	})

	function createClub(club: YourClub) {
		const seed = Math.floor(Math.random() * 1_000_000)
		saved.value = { ...empty(), club, season: newSeason(0, 1, seed), seasons: 1 }
	}

	function matchSeed(kind: MatchKind, round: number): number {
		const s = season.value!
		return s.seed * 1000 + s.number * 97 + round * 13 + ['league', 'playoff', 'knockout', 'pens'].indexOf(kind)
	}

	/** Starts (or resumes) your next match */
	function kickOff(): LiveMatch | null {
		if (saved.value.live) return saved.value.live
		const s = season.value
		const next = nextFixture.value
		if (!s || !next) return null
		const kind: MatchKind = nextUp.value === 'playoff' ? 'playoff' : nextUp.value === 'knockout' ? 'knockout' : 'league'
		const round = kind === 'league' ? currentMatchweek(s) : kind === 'knockout' ? s.knockouts!.length - 1 : 0
		const seed = matchSeed(kind, round)
		saved.value.last = null
		const questions = generateMatch(players, s.tier, seed, undefined, saved.value.recent)
		remember(questions, s.tier)
		saved.value.live = { kind, round, opponent: next.opponent.id, state: startMatch(s.tier, next.standing, questions, seed) }
		return saved.value.live
	}

	function remember(questions: { cards: ClimbPlayer[] }[], tier: number) {
		const seen = [...(saved.value.recent ?? []), ...questions.flatMap(q => q.cards.map(c => c.name))]
		saved.value.recent = seen.slice(-restCount(players, tier))
	}

	function award(id: string) {
		const trophies = (saved.value.trophies ??= {})
		const had = trophies[id]
		trophies[id] = { count: (had?.count ?? 0) + 1, first: had?.first ?? saved.value.seasons }
	}

	function answer(picked: number[], timeLeft: number) {
		const live = saved.value.live
		if (live) live.state = answerQuestion(live.state, picked, timeLeft)
	}
	function timeUp() {
		const live = saved.value.live
		if (live) live.state = timeUpQuestion(live.state)
	}
	/** VAR spends one hint from the shared bank (free with Pro). False if there are none. */
	function useVar(): boolean {
		const live = saved.value.live
		if (!live || live.state.varOn !== null) return false
		if (!usePurchasesStore().spendHint()) return false
		live.state = useVarOn(live.state)
		return true
	}

	/** Records a finished match and moves the season on */
	function finishMatch() {
		const live = saved.value.live
		const s = season.value
		if (!live || !s || !isFinished(live.state)) return
		const sum = summarise(live.state)
		const before = table(s).findIndex(r => r.id === YOU) + 1
		if (live.kind !== 'pens' && sum.correct === live.state.questions.length) award('perfect')
		const last: LastResult = { kind: live.kind, opponent: live.opponent, score: sum.score, result: sum.result, correct: sum.correct, targets: sum.targets, others: [], posBefore: before, posAfter: before }
		saved.value.live = null

		if (live.kind === 'league') {
			const next = playMatchweek(s, live.round, sum.score)
			saved.value.season = next
			last.others = next.fixtures[live.round]!.filter(f => f.home !== YOU && f.away !== YOU)
			last.posAfter = table(next).findIndex(r => r.id === YOU) + 1
			saved.value.last = last
			if (currentMatchweek(next) < 0) leagueOver()
			return
		}

		if (live.kind === 'pens') {
			const yours = sum.correct
			const theirs = live.pens!.theirs
			// Level after five: sudden death, which the shooter who didn't miss last wins
			const lastRight = live.state.answers.at(-1)?.correct ?? false
			const won = yours > theirs || (yours === theirs && lastRight)
			last.pens = { yours, theirs, won }
			last.score = scoreOfTie(live.pens!.tie)
			last.result = won ? 'W' : 'L'
			saved.value.last = last
			settleTie(live.pens!.tie, won)
			return
		}

		// Play-off final or knockout tie
		const tie = live.kind === 'playoff' ? 'playoff' : 'knockout'
		setTieScore(tie, sum.score)
		saved.value.last = last
		if (sum.result === 'D') {
			const rng = seededRandom(live.state.seed + 77)
			const theirs = 2 + Math.floor(rng() * 3)
			const seed = matchSeed('pens', live.round)
			saved.value.live = {
				kind: 'pens',
				round: live.round,
				opponent: live.opponent,
				state: startMatch(s.tier, 'mid', generateMatch(players, s.tier, seed, PENS_QUESTIONS, saved.value.recent), seed),
				pens: { tie, theirs },
			}
			return
		}
		settleTie(tie, sum.result === 'W')
	}

	function tieFixture(tie: 'playoff' | 'knockout'): Fixture | undefined {
		const s = season.value!
		return tie === 'playoff' ? s.playoff : s.knockouts?.at(-1)?.fixture
	}
	function setTieScore(tie: 'playoff' | 'knockout', score: [number, number]) {
		const f = tieFixture(tie)
		if (f) Object.assign(f, { hg: score[0], ag: score[1] })
	}
	function scoreOfTie(tie: 'playoff' | 'knockout'): [number, number] {
		const f = tieFixture(tie)
		return [f?.hg ?? 0, f?.ag ?? 0]
	}

	function settleTie(tie: 'playoff' | 'knockout', won: boolean) {
		const s = season.value!
		const f = tieFixture(tie)
		if (f && f.hg === f.ag) f.pens = won ? YOU : f.away
		if (tie === 'playoff') {
			endSeason(outcomeFor(s), { playoffWon: won })
			return
		}
		const round = s.knockouts!.at(-1)!.round
		if (!won) return endSeason(outcomeFor(s), { clRound: round })
		if (round === 'Final') return endSeason(outcomeFor(s), { clRound: 'Winners', title: true })
		saved.value.season = nextKnockout(s)
	}

	/** League or group finished: a play-off, knockouts, or straight to the season's end */
	function leagueOver() {
		const s = season.value!
		const outcome = outcomeFor(s)
		if (outcome.kind === 'playoff') {
			saved.value.season = withPlayoff(s)
			return
		}
		if (outcome.kind === 'cl-knockouts') {
			saved.value.season = nextKnockout(s)
			return
		}
		endSeason(outcome, outcome.kind === 'cl-group-out' ? { clRound: 'Group stage' } : {})
	}

	function endSeason(outcome: Outcome, extra: { playoffWon?: boolean; clRound?: string; title?: boolean }) {
		const s = season.value!
		const title = extra.title ?? outcome.kind === 'champions'
		const hints = title ? TITLE_HINTS[s.tier] ?? 0 : 0
		if (hints) usePurchasesStore().grantHints(hints)
		if (title) {
			saved.value.titles[s.tier] = (saved.value.titles[s.tier] ?? 0) + 1
			award(`title-${s.tier}`)
		}
		if (extra.playoffWon) award('playoff')
		const you = table(s).find(r => r.id === YOU)
		if (s.tier !== CL_TIER && you && you.played > 0 && you.lost === 0) award('invincibles')
		saved.value.history.push({ tier: s.tier, number: s.number, position: outcome.position, kind: outcome.kind })
		let next = nextTier(s, outcome, extra.playoffWon)
		const capped = next > MAX_TIER && next !== s.tier
		if (next > MAX_TIER) next = Math.min(MAX_TIER, s.tier)
		saved.value.end = { tier: s.tier, outcome, title, hints, next, playoffWon: extra.playoffWon, clRound: extra.clRound, capped }
	}

	/** After the season-end screen: the next season, in whatever league you've earned */
	function startNextSeason() {
		const end = saved.value.end
		if (!end) return
		saved.value.seasons++
		saved.value.season = newSeason(end.next, saved.value.seasons, Math.floor(Math.random() * 1_000_000))
		saved.value.end = null
		saved.value.last = null
	}

	/** How far a save has got, to pick the newer of two copies */
	function progressOf(x: Saved): number {
		const played = x.season ? table(x.season).find(r => r.id === YOU)?.played ?? 0 : 0
		return x.seasons * 1000 + played + (x.end ? 500 : 0)
	}

	/** A backup (iCloud): a season can't be merged, so whichever copy has got further wins */
	function mergeBackup(raw: string | null | undefined): boolean {
		if (!raw) return false
		load()
		let other: Saved
		try {
			other = JSON.parse(raw)
		} catch {
			return false
		}
		if (other?.v !== 1 || !other.club) return false
		if (saved.value.club && progressOf(other) <= progressOf(saved.value)) return false
		saved.value = { ...empty(), ...other }
		return true
	}

	function clubOf(id: string): YourClub | Club | undefined {
		if (id === YOU) return saved.value.club ?? undefined
		return season.value ? clubById(season.value, id) : undefined
	}

	return {
		saved,
		season,
		tier,
		tierName,
		rows,
		position,
		nextUp,
		nextFixture,
		load,
		createClub,
		kickOff,
		answer,
		timeUp,
		useVar,
		finishMatch,
		startNextSeason,
		clubOf,
		mergeBackup,
		CL_TIER,
	}
})
