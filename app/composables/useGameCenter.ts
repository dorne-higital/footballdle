import { ref } from 'vue'
import { Capacitor, registerPlugin } from '@capacitor/core'

// Native side: ios/App/App/GameCenterPlugin.swift
interface GameCenterPlugin {
	authenticate(): Promise<{ authenticated: boolean; error?: string }>
	submitScore(options: { leaderboardId: string; score: number }): Promise<void>
	reportAchievements(options: { achievements: { id: string; percent: number }[] }): Promise<void>
	showLeaderboards(options?: { leaderboardId?: string }): Promise<void>
}

const GameCenter = registerPlugin<GameCenterPlugin>('GameCenter')

// Shared across callers: one Game Center session per app launch
const isAuthenticated = ref(false)
const lastError = ref('')

export function useGameCenter() {
	const isAvailable = Capacitor.getPlatform() === 'ios'

	// GameKit can sit on a sign-in it never shows, so a tap never waits forever
	async function authenticate(timeoutMs = 0) {
		if (!isAvailable) return false
		try {
			const signIn = GameCenter.authenticate()
			const result = timeoutMs
				? await Promise.race([
						signIn,
						new Promise<{ authenticated: boolean; error?: string }>(resolve =>
							setTimeout(() => resolve({ authenticated: false, error: 'Game Center didn\'t respond' }), timeoutMs),
						),
					])
				: await signIn
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

	async function reportAchievements(achievements: { id: string; percent: number }[]) {
		if (!isAuthenticated.value || !achievements.length) return false
		try {
			await GameCenter.reportAchievements({ achievements })
			return true
		} catch {
			return false
		}
	}

	// Opened from a tap, so failures are shown rather than swallowed
	async function showLeaderboards(leaderboardId?: string) {
		if (!isAvailable) return
		if (!isAuthenticated.value && !(await authenticate(10000))) {
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

	return { isAvailable, isAuthenticated, lastError, authenticate, submitScore, reportAchievements, showLeaderboards }
}
