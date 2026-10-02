import { ref } from 'vue'
import { Capacitor, registerPlugin } from '@capacitor/core'

// Native side: ios/App/App/GameCenterPlugin.swift
interface GameCenterPlugin {
	authenticate(): Promise<{ authenticated: boolean }>
	submitScore(options: { leaderboardId: string; score: number }): Promise<void>
	showLeaderboards(options?: { leaderboardId?: string }): Promise<void>
}

const GameCenter = registerPlugin<GameCenterPlugin>('GameCenter')

// Shared across callers: one Game Center session per app launch
const isAuthenticated = ref(false)

export function useGameCenter() {
	const isAvailable = Capacitor.getPlatform() === 'ios'

	async function authenticate() {
		if (!isAvailable) return false
		try {
			const { authenticated } = await GameCenter.authenticate()
			isAuthenticated.value = authenticated
		} catch {
			isAuthenticated.value = false
		}
		return isAuthenticated.value
	}

	// Game Center keeps each player's best, so resubmitting the same score is harmless
	function submitScore(leaderboardId: string, score: number) {
		if (!isAuthenticated.value || score <= 0) return
		GameCenter.submitScore({ leaderboardId, score }).catch(() => {})
	}

	async function showLeaderboards(leaderboardId?: string) {
		if (!isAvailable) return
		if (!isAuthenticated.value && !(await authenticate())) return
		await GameCenter.showLeaderboards(leaderboardId ? { leaderboardId } : {}).catch(() => {})
	}

	return { isAvailable, isAuthenticated, authenticate, submitScore, showLeaderboards }
}
