// The player list. Every build carries app/data/players.json; the iOS app can also use a
// newer list downloaded from the website (plugins/player-list-update.client.ts), saved on the
// phone and used from the next launch, so squads stay fresh without an app update.
// Answers are frozen in schedule.json, so a newer list never changes anyone's puzzle.

export const PLAYER_LIST_URL = 'https://footballdle.co.uk/players.json'
export const PLAYER_LIST_KEY = 'footballdle-player-list'
// Anything this short is a broken download, not the league
const MIN_PLAYERS = 400

export interface PlayerListFile<P> {
	/** YYYY-MM-DD, from app/data/meta.json when the list was made */
	updated: string
	players: P[]
}

const isText = (v: unknown) => typeof v === 'string' && v.length > 0

/** A downloaded or saved list we're happy to play with, or null */
export function readPlayerList<P>(raw: unknown): PlayerListFile<P> | null {
	if (!raw || typeof raw !== 'object') return null
	const { updated, players } = raw as Record<string, unknown>
	if (typeof updated !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(updated)) return null
	if (!Array.isArray(players) || players.length < MIN_PLAYERS) return null
	const ok = players.every((p) => {
		if (!p || typeof p !== 'object') return false
		const { name, club, nationality, position, lastName, fplType } = p as Record<string, unknown>
		// fplType: The Grid's position rows read it
		return [name, club, nationality, position, lastName].every(isText) && typeof fplType === 'number'
	})
	return ok ? { updated, players: players as P[] } : null
}

/** The saved download when it's newer than the built-in list, else the built-in one */
export function pickPlayerList<P>(bundled: P[], bundledUpdated: string, native: boolean): { players: P[]; updated: string } {
	if (native && typeof localStorage !== 'undefined') {
		try {
			const saved = readPlayerList<P>(JSON.parse(localStorage.getItem(PLAYER_LIST_KEY) || 'null'))
			if (saved && saved.updated > bundledUpdated) return saved
		} catch {}
	}
	return { players: bundled, updated: bundledUpdated }
}
