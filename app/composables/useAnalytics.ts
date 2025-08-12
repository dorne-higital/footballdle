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

	// Individual theme tracking functions for clearer separation
	const trackThemeLight = () => {
		if (process.client) {
			event('theme_set_light', {
				event_category: 'ui',
				event_label: 'light_theme',
			})
		}
	}

	const trackThemeDark = () => {
		if (process.client) {
			event('theme_set_dark', {
				event_category: 'ui',
				event_label: 'dark_theme',
			})
		}
	}

	const trackThemeGreyscale = () => {
		if (process.client) {
			event('theme_set_greyscale', {
				event_category: 'ui',
				event_label: 'greyscale_theme',
			})
		}
	}

	const trackThemePastel = () => {
		if (process.client) {
			event('theme_set_pastel', {
				event_category: 'ui',
				event_label: 'pastel_theme',
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
				custom_parameter_1: modalName, // Additional parameter for easier filtering
			})
		}
	}

	// Individual modal tracking functions for clearer separation
	const trackInfoModal = () => {
		if (process.client) {
			event('modal_info_open', {
				event_category: 'ui',
				event_label: 'info_modal',
			})
		}
	}

	const trackSettingsModal = () => {
		if (process.client) {
			event('modal_settings_open', {
				event_category: 'ui',
				event_label: 'settings_modal',
			})
		}
	}

	const trackStatsModal = () => {
		if (process.client) {
			event('modal_stats_open', {
				event_category: 'ui',
				event_label: 'stats_modal',
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
		trackThemeLight,
		trackThemeDark,
		trackThemeGreyscale,
		trackThemePastel,
		trackShare,
		trackModalOpen,
		trackInfoModal,
		trackSettingsModal,
		trackStatsModal,
		trackHomeClick,
		trackSessionTime,
	}
} 