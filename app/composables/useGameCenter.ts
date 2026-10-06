import { ref } from 'vue'
import { Capacitor, registerPlugin } from '@capacitor/core'

// Native side: ios/App/App/GameCenterPlugin.swift
interface GameCenterPlugin {
	authenticate(): Promise<{ authenticated: boolean; error?: string }>
	submitScore(options: { leaderboardId: string; score: number }): Promise<void>
	showLeaderboards(options?: { leaderboardId?: string }): Promise<void>
}

const GameCenter = registerPlugin<GameCenterPlugin>('GameCenter')

// Shared across callers: one Game Center session per app launch
const isAuthenticated = ref(false)
const lastError = ref('')

export function useGameCenter() {
	const isAvailable = Capacitor.getPlatform() === 'ios'

	async function authenticate() {
		if (!isAvailable) return false
		try {
			const result = await GameCenter.authenticate()
			isAuthenticated.value = result.authenticated
			lastError.value = result.error ?? ''
		} catch (error: any) {
			isAuthenticated.value = false
			lastError.value = error?.message ?? String(error)
		}
		return isAuthenticated.value
	}

	// Game Center keeps each player's best, so resubmitting the same score is harmless
	function submitScore(leaderboardId: string, score: number) {
		if (!isAuthenticated.value || score <= 0) return
		GameCenter.submitScore({ leaderboardId, score }).catch(() => {})
	}

	// Opened from a tap, so failures are shown rather than swallowed
	async function showLeaderboards(leaderboardId?: string) {
		if (!isAvailable) return
		if (!isAuthenticated.value && !(await authenticate())) {
			window.alert(
				`Couldn't sign in to Game Center${lastError.value ? `: ${lastError.value}` : ''}.\n\n` +
					'Check you are signed in under Settings → Game Center, then try again.',
			)
			return
		}
		try {
			await GameCenter.showLeaderboards(leaderboardId ? { leaderboardId } : {})
		} catch (error: any) {
			window.alert(`Couldn't open the leaderboards: ${error?.message ?? error}`)
		}
	}

	return { isAvailable, isAuthenticated, lastError, authenticate, submitScore, showLeaderboards }
}
