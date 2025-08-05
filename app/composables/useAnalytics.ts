import { useGtag } from 'vue-gtag'

export const useAnalytics = () => {
	const { event } = useGtag()

	// Track game events
	const trackGameStart = () => {
		event('game_start', {
			event_category: 'game',
			event_label: 'daily_game',
		})
	}

	const trackGameWin = (guesses: number) => {
		event('game_win', {
			event_category: 'game',
			event_label: 'daily_game',
			value: guesses,
		})
	}

	const trackGameLoss = (guesses: number) => {
		event('game_loss', {
			event_category: 'game',
			event_label: 'daily_game',
			value: guesses,
		})
	}

	const trackChallengeStart = () => {
		event('challenge_start', {
			event_category: 'challenge',
			event_label: 'challenge_mode',
		})
	}

	const trackChallengeWin = (timeUsed: number) => {
		event('challenge_win', {
			event_category: 'challenge',
			event_label: 'challenge_mode',
			value: timeUsed,
		})
	}

	const trackChallengeLoss = (timeUsed: number) => {
		event('challenge_loss', {
			event_category: 'challenge',
			event_label: 'challenge_mode',
			value: timeUsed,
		})
	}

	// Track theme changes
	const trackThemeChange = (theme: string) => {
		event('theme_change', {
			event_category: 'ui',
			event_label: theme,
		})
	}

	// Track share events
	const trackShare = (platform?: string) => {
		event('share', {
			event_category: 'social',
			event_label: platform || 'unknown',
		})
	}

	// Track modal opens
	const trackModalOpen = (modalName: string) => {
		event('modal_open', {
			event_category: 'ui',
			event_label: modalName,
		})
	}

	return {
		trackGameStart,
		trackGameWin,
		trackGameLoss,
		trackChallengeStart,
		trackChallengeWin,
		trackChallengeLoss,
		trackThemeChange,
		trackShare,
		trackModalOpen,
	}
} 