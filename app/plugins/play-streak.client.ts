import { watch } from 'vue'
import { useModeStatsStore } from '../stores/modeStats'
import { usePlayStreakStore } from '../stores/playStreak'

// Counts any finished game (win or lose, any mode) towards the Matchday streak
export default defineNuxtPlugin(() => {
	const playStreak = usePlayStreakStore()
	playStreak.load()

	for (const id of ['daily', 'scout', 'spotball', 'challenge'] as const) {
		const store = useModeStatsStore(id)
		store.loadStats()
		watch(
			() => store.stats.gamesPlayed,
			(now, before) => {
				if (now > before) playStreak.markPlayed()
			},
		)
	}
})
