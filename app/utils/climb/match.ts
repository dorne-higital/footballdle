// The Climb: one match. Ten Odd One Out questions; how many you get right against the
// opponent's target decides win, draw or loss, and right answers plus speed make the
// scoreline. Plain TypeScript (no Nuxt) so tests/climb-match.test.ts covers the rules.
import { seededRandom, TIERS, type Question } from './questions'

export const QUESTIONS_PER_MATCH = 10
/** Seconds to answer each question, by tier (National League first) */
export const QUESTION_SECONDS = [10, 9, 8, 7, 7, 7] as const

export type Result = 'W' | 'D' | 'L'
/** Where the opponent sits in the table, which moves the target by one */
export type OpponentStanding = 'top' | 'mid' | 'bottom'

export interface Targets {
	/** Right answers needed to win */
	win: number
	/** Right answers needed for a draw */
	draw: number
}

/** 8 to win in the first two leagues, 9 from League One; one more against a top-two side,
 *  one fewer against the bottom side. A draw is the two below the win line. */
export function targetsFor(tier: number, opponent: OpponentStanding): Targets {
	const base = tier < 2 ? 8 : 9
	const shift = opponent === 'top' ? 1 : opponent === 'bottom' ? -1 : 0
	const win = Math.min(QUESTIONS_PER_MATCH, base + shift)
	return { win, draw: win - 2 }
}

export function resultFor(correct: number, targets: Targets): Result {
	if (correct >= targets.win) return 'W'
	if (correct >= targets.draw) return 'D'
	return 'L'
}

export interface Course {
	/** The best result still possible */
	best: Result
	/** Wrong answers you can still afford and win (only when a win is possible) */
	spare: number
	message: string
}

/** The live "on course for" banner during a match */
export function courseFor(answered: number, correct: number, targets: Targets): Course {
	const left = QUESTIONS_PER_MATCH - answered
	const maxCorrect = correct + left
	if (maxCorrect >= targets.win) {
		const spare = maxCorrect - targets.win
		if (correct >= targets.win) return { best: 'W', spare, message: 'The win is yours, keep going for goals' }
		const message = spare === 0 ? 'On for a win, no mistakes allowed' : spare === 1 ? 'On for a win, one mistake to spare' : `On for a win, ${spare} mistakes to spare`
		return { best: 'W', spare, message }
	}
	if (maxCorrect >= targets.draw) return { best: 'D', spare: 0, message: correct >= targets.draw ? 'A draw is safe, the win has gone' : 'Hang on for a draw' }
	return { best: 'L', spare: 0, message: 'Play for pride: score what you can' }
}

/** A believable scoreline for the result: more right answers and quicker ones mean bigger
 *  wins; a perfect match keeps a clean sheet. Seeded, so a finished match always shows the same. */
export function scorelineFor(correct: number, targets: Targets, speed: number, seed: number): [number, number] {
	const rng = seededRandom(seed)
	const result = resultFor(correct, targets)
	const quick = speed > 0.5 ? 1 : 0
	if (result === 'W') {
		const against = correct === QUESTIONS_PER_MATCH ? 0 : rng() < 0.55 ? 1 : rng() < 0.7 ? 0 : 2
		const margin = Math.min(4, 1 + (correct - targets.win) + quick)
		return [against + margin, against]
	}
	if (result === 'D') {
		const goals = correct === targets.win - 1 ? (rng() < 0.6 ? 1 : 2) : rng() < 0.5 ? 0 : 1
		return [goals, goals]
	}
	const goalsFor = correct >= targets.draw - 2 && rng() < 0.6 ? 1 : 0
	const margin = Math.min(4, 1 + Math.max(0, targets.draw - 1 - correct) / 2)
	return [goalsFor, goalsFor + Math.round(margin)]
}

/** VAR (a hint): which wrong cards to hide so the question is a 50/50. Four cards lose two,
 *  five lose three; the Champions League's six cards (two odd ones out) lose two. */
export function varHides(question: Question, seed: number): number[] {
	const rng = seededRandom(seed)
	const odd = new Set(question.odd)
	const others = question.cards.map((_, i) => i).filter(i => !odd.has(i))
	const remove = question.odd.length === 2 ? 2 : question.cards.length - 2
	for (let i = others.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1))
		;[others[i], others[j]] = [others[j]!, others[i]!]
	}
	return others.slice(0, remove).sort((a, b) => a - b)
}

export interface Answer {
	/** Cards tapped (empty when time ran out) */
	picked: number[]
	correct: boolean
	/** Share of the clock left when answered, 0-1 */
	timeLeft: number
}

export interface MatchState {
	tier: number
	opponent: OpponentStanding
	seed: number
	questions: Question[]
	answers: Answer[]
	/** Question VAR was used on, if any (once a match) */
	varOn: number | null
	varHidden: number[]
}

export function startMatch(tier: number, opponent: OpponentStanding, questions: Question[], seed: number): MatchState {
	if (!TIERS[tier]) throw new Error(`No tier ${tier}`)
	return { tier, opponent, seed, questions, answers: [], varOn: null, varHidden: [] }
}

export const currentQuestion = (m: MatchState): Question | undefined => m.questions[m.answers.length]
export const isFinished = (m: MatchState): boolean => m.answers.length >= m.questions.length

/** Records an answer to the current question. Right only if exactly the odd card(s) were picked. */
export function answer(m: MatchState, picked: number[], timeLeft: number): MatchState {
	const q = currentQuestion(m)
	if (!q) return m
	const correct = picked.length === q.odd.length && q.odd.every(i => picked.includes(i))
	return { ...m, answers: [...m.answers, { picked: [...picked], correct, timeLeft: Math.max(0, Math.min(1, timeLeft)) }], varHidden: [] }
}

export const timeUp = (m: MatchState): MatchState => answer(m, [], 0)

/** Uses VAR on the current question. Returns the same state if it's already been used. */
export function useVar(m: MatchState): MatchState {
	const q = currentQuestion(m)
	if (!q || m.varOn !== null) return m
	return { ...m, varOn: m.answers.length, varHidden: varHides(q, m.seed + m.answers.length) }
}

export interface Summary {
	correct: number
	targets: Targets
	result: Result
	score: [number, number]
	course: Course
}

export function summarise(m: MatchState): Summary {
	const correct = m.answers.filter(a => a.correct).length
	const targets = targetsFor(m.tier, m.opponent)
	const right = m.answers.filter(a => a.correct)
	const speed = right.length ? right.reduce((n, a) => n + a.timeLeft, 0) / right.length : 0
	return {
		correct,
		targets,
		result: resultFor(correct, targets),
		score: scorelineFor(correct, targets, speed, m.seed),
		course: courseFor(m.answers.length, correct, targets),
	}
}
