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
const streakLine = (streak?: number) => (streak && streak > 1 ? ` 🔥 ${streak} day streak` : '')

export function useShare() {
	function getShareText(guesses: string[], answer: string, isWin: boolean, label: string, streak?: number): string {
		const grid = guesses.map(guess => tileStates(guess, answer).map(s => EMOJI[s]).join('')).join('\n')
		return `Footballdle ⚽ ${label}\n${isWin ? guesses.length : 'X'}/6${streakLine(streak)}\n\n${grid}\n\nfootballdle.co.uk`
	}

	/** One row per guess: club, nation, position */
	function getScoutShareText(results: ScoutGuessResult[], isWin: boolean, maxGuesses: number, puzzle: number, streak?: number) {
		const grid = results
			.map(r => [r.club, r.nationality, r.position].map(c => EMOJI[c.state as TileState] ?? '⬛').join(''))
			.join('\n')
		return `Footballdle Scout Report 🔎 #${puzzle}\n${isWin ? results.length : 'X'}/${maxGuesses}${streakLine(streak)}\n\n${grid}\n\nfootballdle.co.uk`
	}

	function getSpotShareText(results: { correct: boolean }[], score: number, rounds: number, puzzle: number, streak?: number) {
		const dots = results.map(r => (r.correct ? '🟢' : '🔴')).join('')
		return `Footballdle Spot the Baller 👀 #${puzzle}\n${score}/${rounds}${streakLine(streak)}\n\n${dots}\n\nfootballdle.co.uk`
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

	return { onShare, onShareTwitter, getShareText, getScoutShareText, getSpotShareText, shareText }
}
