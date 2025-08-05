export const useAnalytics = () => {
	// Only use gtag on client side
	let event: any = () => {}
	
	if (process.client) {
		try {
			// Use the global gtag function directly
			event = (eventName: string, params: any) => {
				if (typeof window !== 'undefined' && (window as any).gtag) {
					(window as any).gtag('event', eventName, params)
				}
			}
		} catch (error) {
			// Silently fail if gtag is not available
		}
	}

	// Track game events
	const trackGameStart = () => {
		if (process.client) {
			event('game_start', {
				event_category: 'game',
				event_label: 'daily_game',
			})
		}
	}

	const trackGameWin = (guesses: number) => {
		if (process.client) {
			event('game_win', {
				event_category: 'game',
				event_label: 'daily_game',
				value: guesses,
			})
		}
	}

	const trackGameLoss = (guesses: number) => {
		if (process.client) {
			event('game_loss', {
				event_category: 'game',
				event_label: 'daily_game',
				value: guesses,
			})
		}
	}

	const trackGameAbandon = (guesses: number) => {
		if (process.client) {
			event('game_abandon', {
				event_category: 'game',
				event_label: 'daily_game',
				value: guesses,
			})
		}
	}

	const trackChallengeStart = () => {
		if (process.client) {
			event('challenge_start', {
				event_category: 'challenge',
				event_label: 'challenge_mode',
			})
		}
	}

	const trackChallengeWin = (timeUsed: number) => {
		if (process.client) {
			event('challenge_win', {
				event_category: 'challenge',
				event_label: 'challenge_mode',
				value: timeUsed,
			})
		}
	}

	const trackChallengeLoss = (timeUsed: number) => {
		if (process.client) {
			event('challenge_loss', {
				event_category: 'challenge',
				event_label: 'challenge_mode',
				value: timeUsed,
			})
		}
	}

	const trackChallengeAbandon = (timeUsed: number) => {
		if (process.client) {
			event('challenge_abandon', {
				event_category: 'challenge',
				event_label: 'challenge_mode',
				value: timeUsed,
			})
		}
	}

	// Track theme changes
	const trackThemeChange = (theme: string) => {
		if (process.client) {
			event('theme_change', {
				event_category: 'ui',
				event_label: theme,
			})
		}
	}

	// Track share events
	const trackShare = (platform?: string) => {
		if (process.client) {
			event('share', {
				event_category: 'social',
				event_label: platform || 'unknown',
			})
		}
	}

	// Track modal opens
	const trackModalOpen = (modalName: string) => {
		if (process.client) {
			event('modal_open', {
				event_category: 'ui',
				event_label: modalName,
			})
		}
	}

	// Track home button clicks
	const trackHomeClick = (location: string) => {
		if (process.client) {
			event('home_click', {
				event_category: 'navigation',
				event_label: location,
			})
		}
	}

	// Track session timing
	const trackSessionTime = (duration: number) => {
		if (process.client) {
			event('session_time', {
				event_category: 'engagement',
				event_label: 'session_duration',
				value: duration,
			})
		}
	}

	return {
		trackGameStart,
		trackGameWin,
		trackGameLoss,
		trackGameAbandon,
		trackChallengeStart,
		trackChallengeWin,
		trackChallengeLoss,
		trackChallengeAbandon,
		trackThemeChange,
		trackShare,
		trackModalOpen,
		trackHomeClick,
		trackSessionTime,
	}
} 