import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import type { ScoutGuessResult } from '../stores/scoutReport'

export type TileState = 'correct' | 'present' | 'absent'

/** Wordle colouring with letter counts: greens first, then each remaining letter of
 *  the answer can make one yellow. Matches the board, including repeated letters. */
export function tileStates(guess: string, answer: string): TileState[] {
	const g = guess.toUpperCase().split('')
	const a = answer.toUpperCase().split('')
	const states: TileState[] = g.map((c, i) => (c === a[i] ? 'correct' : 'absent'))
	const left: Record<string, number> = {}
	a.forEach((c, i) => {
		if (g[i] !== c) left[c] = (left[c] ?? 0) + 1
	})
	g.forEach((c, i) => {
		if (states[i] === 'correct' || !left[c]) return
		states[i] = 'present'
		left[c]!--
	})
	return states
}

const EMOJI: Record<TileState, string> = { correct: '🟩', present: '🟨', absent: '⬛' }
// Settings > Accessibility > High-contrast tiles: shares match the orange and blue board
const HIGH_CONTRAST_EMOJI: Record<TileState, string> = { correct: '🟧', present: '🟦', absent: '⬛' }
const highContrast = () => import.meta.client && document.documentElement.dataset.contrast === 'high'
const emoji = (state: TileState) => (highContrast() ? HIGH_CONTRAST_EMOJI : EMOJI)[state] ?? '⬛'
/** The link at the end of every share. From the iPhone app it's footballdle.co.uk/app,
 *  which sends iPhones to the App Store and everyone else to the website (pages/app.vue);
 *  from the website, the website itself */
export const SHARE_LINK = Capacitor.isNativePlatform() ? 'footballdle.co.uk/app' : 'footballdle.co.uk'
const streakLine = (streak?: number) => (streak && streak > 1 ? ` 🔥 ${streak} day streak` : '')

export function useShare() {
	function getShareText(guesses: string[], answer: string, isWin: boolean, label: string, streak?: number): string {
		const grid = guesses.map(guess => tileStates(guess, answer).map(emoji).join('')).join('\n')
		return `Footballdle ⚽ ${label}\n${isWin ? guesses.length : 'X'}/6${streakLine(streak)}\n\n${grid}\n\n${SHARE_LINK}`
	}

	/** One row per guess: club, nation, position */
	function getScoutShareText(results: ScoutGuessResult[], isWin: boolean, maxGuesses: number, puzzle: number | null, streak?: number) {
		const grid = results
			.map(r => [r.club, r.nationality, r.position].map(c => emoji(c.state as TileState)).join(''))
			.join('\n')
		return `Footballdle Scout Report 🔎${puzzle ? ` #${puzzle}` : ''}\n${isWin ? results.length : 'X'}/${maxGuesses}${streakLine(streak)}\n\n${grid}\n\n${SHARE_LINK}`
	}

	/** relaxed: played with Settings > Accessibility > Relaxed timer, marked with ⏱️ */
	function getSpotShareText(results: { correct: boolean }[], score: number, rounds: number, puzzle: number | null, streak?: number, relaxed = false) {
		const [hit, miss] = highContrast() ? ['🟠', '⚫'] : ['🟢', '🔴']
		const dots = results.map(r => (r.correct ? hit : miss)).join('')
		return `Footballdle Spot the Baller 👀${puzzle ? ` #${puzzle}` : ''}${relaxed ? ' ⏱️' : ''}\n${score}/${rounds}${streakLine(streak)}\n\n${dots}\n\n${SHARE_LINK}`
	}

	/** All of today's games in one message, once the Daily, Scout Report and Spot the
	 *  Baller are finished: each one's result, plus this week's Grid points if played */
	function getMatchdayShareText(m: {
		puzzle: number | null
		streak: number
		daily: { guesses: string[]; answer: string; isWin: boolean }
		scout: { results: ScoutGuessResult[]; isWin: boolean; maxGuesses: number }
		spot: { results: boolean[]; score: number; rounds: number; relaxed?: boolean }
		gridPoints?: number
	}) {
		const [hit, miss] = highContrast() ? ['🟠', '⚫'] : ['🟢', '🔴']
		const dailyRows = m.daily.guesses.map(g => tileStates(g, m.daily.answer).map(emoji).join('')).join('\n')
		const scoutRows = m.scout.results.map(r => [r.club, r.nationality, r.position].map(c => emoji(c.state as TileState)).join('')).join('\n')
		const lines = [
			`Footballdle Matchday${m.puzzle ? ` #${m.puzzle}` : ''}${streakLine(m.streak)}`,
			'',
			`⚽ Daily ${m.daily.isWin ? m.daily.guesses.length : 'X'}/6`,
			dailyRows,
			'',
			`🔎 Scout Report ${m.scout.isWin ? m.scout.results.length : 'X'}/${m.scout.maxGuesses}`,
			scoutRows,
			'',
			`👀 Spot the Baller ${m.spot.score}/${m.spot.rounds}${m.spot.relaxed ? ' ⏱️' : ''}`,
			m.spot.results.map(r => (r ? hit : miss)).join(''),
		]
		if (m.gridPoints) lines.push('', `🧩 Grid Week ${m.gridPoints.toLocaleString('en-GB')} / 4,500`)
		lines.push('', SHARE_LINK)
		return lines.join('\n')
	}

	/** iOS app: the native share sheet (returns false, nothing was copied). Website:
	 *  copies to the clipboard and returns true for a "Copied!" toast. */
	async function shareText(text: string): Promise<boolean> {
		if (Capacitor.isNativePlatform()) {
			await Share.share({ text }).catch(() => {})
			return false
		}
		try {
			await navigator.clipboard.writeText(text)
			return true
		} catch {
			return false
		}
	}

	async function onShare(guesses: string[], answer: string, isWin: boolean, label: string, streak?: number): Promise<boolean> {
		return shareText(getShareText(guesses, answer, isWin, label, streak))
	}

	function onShareTwitter(guesses: string[], answer: string, isWin: boolean, label: string, streak?: number) {
		const text = getShareText(guesses, answer, isWin, label, streak)
		window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
	}

	return { onShare, onShareTwitter, getShareText, getScoutShareText, getSpotShareText, getMatchdayShareText, shareText }
}
