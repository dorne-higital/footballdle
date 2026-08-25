import type { ModeStats } from '../stores/modeStats'

const MIGRATION_GUARD_KEY = 'footballdle-stats-migrated-v2'

interface MigrateOpts {
	extraFields?: string[]
}

function migrateOne(oldKey: string, newKey: string, opts?: MigrateOpts) {
	// Never clobber a v2 store that's already written to this key.
	if (localStorage.getItem(newKey)) return

	const oldValue = localStorage.getItem(oldKey)
	if (!oldValue) return

	try {
		const old = JSON.parse(oldValue)
		const migrated: ModeStats = {
			gamesPlayed: old.gamesPlayed || 0,
			wins: old.wins || 0,
			losses: old.losses || 0,
			currentStreak: old.currentStreak || 0,
			maxStreak: old.maxStreak || 0,
			lastPlayedDate: old.lastPlayedDate || '',
			guessDistribution: old.guessDistribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
			recentForm: [],
		}
		for (const field of opts?.extraFields || []) {
			if (old[field] !== undefined) (migrated as any)[field] = old[field]
		}
		localStorage.setItem(newKey, JSON.stringify(migrated))
	} catch {
		// Malformed legacy blob — leave it in place, new key stays unset,
		// the mode's store falls back to its own defaults on load.
	}
}

export default defineNuxtPlugin(() => {
	if (!import.meta.client) return
	if (localStorage.getItem(MIGRATION_GUARD_KEY)) return

	migrateOne('footballdle-stats', 'footballdle-stats-daily')
	migrateOne('footballdle-challenge-stats', 'footballdle-stats-challenge', {
		extraFields: ['bestTime', 'totalTime'],
	})
	// Scout Report and Spot the Baller have no legacy key — nothing to migrate;
	// they initialize to their own defaults on first loadStats().

	localStorage.setItem(MIGRATION_GUARD_KEY, '1')
})
