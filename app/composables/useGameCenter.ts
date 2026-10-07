import { ref } from 'vue'
import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core'

// Native side: ios/App/App/GameCenterPlugin.swift
interface GameCenterPlugin {
	authenticate(): Promise<{ authenticated: boolean; error?: string }>
	submitScore(options: { leaderboardId: string; score: number }): Promise<void>
	reportAchievements(options: { achievements: { id: string; percent: number }[] }): Promise<void>
	showLeaderboards(options?: { leaderboardId?: string }): Promise<void>
	showAchievements(): Promise<void>
	addListener(event: 'authChanged', handler: (data: { authenticated: boolean }) => void): Promise<PluginListenerHandle>
}

const GameCenter = registerPlugin<GameCenterPlugin>('GameCenter')

// Shared across callers: one Game Center session per app launch
const isAuthenticated = ref(false)
const lastError = ref('')
let watchingAuth = false

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

	// Follows sign-ins that happen later in the session (from iOS Settings or the
	// Game Center sheet), so scores and achievements start going up straight away
	function watchAuth() {
		if (!isAvailable || watchingAuth) return
		watchingAuth = true
		GameCenter.addListener('authChanged', ({ authenticated }) => {
			isAuthenticated.value = authenticated
			if (authenticated) lastError.value = ''
		}).catch(() => {})
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
	async function openDashboard(what: 'leaderboards' | 'achievements', leaderboardId?: string) {
		if (!isAvailable) return
		if (!isAuthenticated.value && !(await authenticate(10000))) {
			window.alert(
				`Couldn't sign in to Game Center${lastError.value ? `: ${lastError.value}` : ''}.\n\n` +
					'Check you are signed in under Settings → Game Center, then try again.',
			)
			return
		}
		try {
			if (what === 'achievements') await GameCenter.showAchievements()
			else await GameCenter.showLeaderboards(leaderboardId ? { leaderboardId } : {})
		} catch (error: any) {
			window.alert(`Couldn't open Game Center: ${error?.message ?? error}`)
		}
	}

	const showLeaderboards = (leaderboardId?: string) => openDashboard('leaderboards', leaderboardId)
	const showAchievements = () => openDashboard('achievements')

	return { isAvailable, isAuthenticated, lastError, authenticate, watchAuth, submitScore, reportAchievements, showLeaderboards, showAchievements }
}
