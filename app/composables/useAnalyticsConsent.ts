import { useState } from 'nuxt/app'

// Website only (UK GDPR and PECR): Google Analytics loads only after the visitor taps
// Accept. The choice is kept in localStorage; the head script in nuxt.config.ts reads it on
// every visit and loads GA straight away for people who accepted before.
export const CONSENT_KEY = 'footballdle-analytics-consent'
export type ConsentChoice = 'granted' | 'denied' | null

declare global {
	interface Window {
		footballdleLoadAnalytics?: () => void
	}
}

function readChoice(): ConsentChoice {
	try {
		const v = localStorage.getItem(CONSENT_KEY)
		return v === 'granted' || v === 'denied' ? v : null
	} catch {
		return null
	}
}

export function useAnalyticsConsent() {
	// undefined until read on the client, so the server never renders the bar
	const choice = useState<ConsentChoice | undefined>('analytics-consent', () => undefined)

	const load = () => {
		if (import.meta.client && choice.value === undefined) choice.value = readChoice()
	}

	const set = (value: 'granted' | 'denied') => {
		choice.value = value
		try {
			localStorage.setItem(CONSENT_KEY, value)
		} catch {
			// private mode: the choice lasts for this visit only
		}
		if (value === 'granted') window.footballdleLoadAnalytics?.()
	}

	// From the privacy policy: ask again. Analytics already running stops on the next visit
	const reset = () => {
		try {
			localStorage.removeItem(CONSENT_KEY)
		} catch {
			// nothing stored
		}
		choice.value = null
	}

	return { choice, load, set, reset }
}
