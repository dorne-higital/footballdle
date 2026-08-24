export const useAnalytics = () => {
	let event: any = () => {}

	if (import.meta.client) {
		try {
			event = (eventName: string, params: any) => {
				if (typeof window !== 'undefined' && (window as any).gtag) {
					(window as any).gtag('event', eventName, params)
				}
			}
		} catch (error) {
			// gtag not available
		}
	}

	const trackGameStart = (isReturningPlayer: boolean = false) => {
		if (import.meta.client) {
			event('game_start', {
				event_category: 'game',
				event_label: 'daily_game',
				player_type: isReturningPlayer ? 'returning' : 'new',
			})
		}
	}

	const trackGameWin = (guesses: number) => {
		if (import.meta.client) {
			event('game_win', {
				event_category: 'game',
				event_label: 'daily_game',
				guess_count: guesses,
				value: guesses,
			})
		}
	}

	const trackGameLoss = (guesses: number) => {
		if (import.meta.client) {
			event('game_loss', {
				event_category: 'game',
				event_label: 'daily_game',
				guess_count: guesses,
				value: guesses,
			})
		}
	}

	const trackGameAbandon = (guesses: number) => {
		if (import.meta.client) {
			event('game_abandon', {
				event_category: 'game',
				event_label: 'daily_game',
				guess_count: guesses,
				value: guesses,
			})
		}
	}

	const trackGuessSubmitted = (guessNumber: number) => {
		if (import.meta.client) {
			event('guess_submitted', {
				event_category: 'game',
				event_label: 'daily_game',
				guess_number: guessNumber,
			})
		}
	}

	const trackIntroButtonClick = (action: 'play_now' | 'resume_game' | 'challenge_play') => {
		if (import.meta.client) {
			event('intro_button_click', {
				event_category: 'engagement',
				event_label: action,
			})
		}
	}

	const trackStatsTabSwitch = (tab: 'daily' | 'challenge') => {
		if (import.meta.client) {
			event('stats_tab_switch', {
				event_category: 'ui',
				event_label: tab,
			})
		}
	}

	const trackChallengeStart = () => {
		if (import.meta.client) {
			event('challenge_start', {
				event_category: 'challenge',
				event_label: 'challenge_mode',
			})
		}
	}

	const trackChallengeWin = (timeUsed: number) => {
		if (import.meta.client) {
			event('challenge_win', {
				event_category: 'challenge',
				event_label: 'challenge_mode',
				time_used: timeUsed,
				value: timeUsed,
			})
		}
	}

	const trackChallengeLoss = (timeUsed: number) => {
		if (import.meta.client) {
			event('challenge_loss', {
				event_category: 'challenge',
				event_label: 'challenge_mode',
				time_used: timeUsed,
				value: timeUsed,
			})
		}
	}

	const trackChallengeAbandon = (timeUsed: number) => {
		if (import.meta.client) {
			event('challenge_abandon', {
				event_category: 'challenge',
				event_label: 'challenge_mode',
				time_used: timeUsed,
				value: timeUsed,
			})
		}
	}

	const trackChallengePlayAgain = () => {
		if (import.meta.client) {
			event('challenge_play_again', {
				event_category: 'challenge',
				event_label: 'challenge_mode',
			})
		}
	}

	const trackThemeChange = (theme: string) => {
		if (import.meta.client) {
			event('theme_change', {
				event_category: 'ui',
				event_label: theme,
			})
		}
	}

	const trackThemeLight = () => {
		if (import.meta.client) {
			event('theme_set_light', { event_category: 'ui', event_label: 'light_theme' })
		}
	}

	const trackThemeDark = () => {
		if (import.meta.client) {
			event('theme_set_dark', { event_category: 'ui', event_label: 'dark_theme' })
		}
	}

	const trackThemeGreyscale = () => {
		if (import.meta.client) {
			event('theme_set_greyscale', { event_category: 'ui', event_label: 'greyscale_theme' })
		}
	}

	const trackThemePastel = () => {
		if (import.meta.client) {
			event('theme_set_pastel', { event_category: 'ui', event_label: 'pastel_theme' })
		}
	}

	const trackShare = (platform?: string) => {
		if (import.meta.client) {
			event('share', {
				event_category: 'social',
				event_label: platform || 'unknown',
			})
		}
	}

	const trackModalOpen = (modalName: string) => {
		if (import.meta.client) {
			event('modal_open', {
				event_category: 'ui',
				event_label: modalName,
			})
		}
	}

	const trackInfoModal = () => {
		if (import.meta.client) {
			event('modal_info_open', { event_category: 'ui', event_label: 'info_modal' })
		}
	}

	const trackSettingsModal = () => {
		if (import.meta.client) {
			event('modal_settings_open', { event_category: 'ui', event_label: 'settings_modal' })
		}
	}

	const trackStatsModal = () => {
		if (import.meta.client) {
			event('modal_stats_open', { event_category: 'ui', event_label: 'stats_modal' })
		}
	}

	const trackHomeClick = (location: string) => {
		if (import.meta.client) {
			event('home_click', {
				event_category: 'navigation',
				event_label: location,
			})
		}
	}

	const trackSessionTime = (duration: number) => {
		if (import.meta.client) {
			event('session_time', {
				event_category: 'engagement',
				event_label: 'session_duration',
				value: duration,
			})
		}
	}

	const trackBuyMeCoffee = (location: string) => {
		if (import.meta.client) {
			event('buy_me_coffee_click', {
				event_category: 'monetisation',
				event_label: location,
			})
		}
	}

	return {
		trackGameStart,
		trackGameWin,
		trackGameLoss,
		trackGameAbandon,
		trackGuessSubmitted,
		trackIntroButtonClick,
		trackStatsTabSwitch,
		trackChallengeStart,
		trackChallengeWin,
		trackChallengeLoss,
		trackChallengeAbandon,
		trackChallengePlayAgain,
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
		trackBuyMeCoffee,
	}
}
