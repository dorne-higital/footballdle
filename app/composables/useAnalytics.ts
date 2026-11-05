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

	const trackGameStart = (isReturningPlayer: boolean = false, mode: string = 'daily_game') => {
		if (import.meta.client) {
			event('game_start', {
				event_category: 'game',
				event_label: mode,
				player_type: isReturningPlayer ? 'returning' : 'new',
			})
		}
	}

	const trackGameWin = (guesses: number, mode: string = 'daily_game') => {
		if (import.meta.client) {
			event('game_win', {
				event_category: 'game',
				event_label: mode,
				guess_count: guesses,
				value: guesses,
			})
		}
	}

	const trackGameLoss = (guesses: number, mode: string = 'daily_game') => {
		if (import.meta.client) {
			event('game_loss', {
				event_category: 'game',
				event_label: mode,
				guess_count: guesses,
				value: guesses,
			})
		}
	}

	const trackGameAbandon = (guesses: number, mode: string = 'daily_game') => {
		if (import.meta.client) {
			event('game_abandon', {
				event_category: 'game',
				event_label: mode,
				guess_count: guesses,
				value: guesses,
			})
		}
	}

	const trackGuessSubmitted = (guessNumber: number, mode: string = 'daily_game') => {
		if (import.meta.client) {
			event('guess_submitted', {
				event_category: 'game',
				event_label: mode,
				guess_number: guessNumber,
			})
		}
	}

	const trackIntroButtonClick = (action: 'play_now' | 'resume_game') => {
		if (import.meta.client) {
			event('intro_button_click', {
				event_category: 'engagement',
				event_label: action,
			})
		}
	}

	const trackStatsTabSwitch = (tab: 'daily') => {
		if (import.meta.client) {
			event('stats_tab_switch', {
				event_category: 'ui',
				event_label: tab,
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

	/** footballdle.co.uk/app: an iPhone sent to the App Store, or the App Store button tapped */
	const trackGetApp = (action: 'redirect' | 'store_click') => {
		if (import.meta.client) {
			event('get_app', { event_category: 'engagement', event_label: action })
		}
	}

	/** An answer page's "Play it before you peek" button: access is open, hint or pro */
	const trackAnswerPagePlay = (access: string) => {
		if (import.meta.client) {
			event('answer_page_play', { event_category: 'engagement', event_label: access })
		}
	}

	return {
		trackAnswerPagePlay,
		trackGetApp,
		trackGameStart,
		trackGameWin,
		trackGameLoss,
		trackGameAbandon,
		trackGuessSubmitted,
		trackIntroButtonClick,
		trackStatsTabSwitch,
		trackThemeChange,
		trackShare,
		trackModalOpen,
		trackInfoModal,
		trackSettingsModal,
		trackStatsModal,
		trackHomeClick,
		trackSessionTime,
	}
}
