import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
	// Must match the Bundle ID registered in the Apple Developer portal
	appId: 'uk.co.footballdle.app',
	appName: 'Footballdle',
	// Output of `yarn build:app` (nuxt generate with APP_TARGET=ios)
	webDir: '.output/public',
	ios: {
		contentInset: 'never',
		backgroundColor: '#07130d',
	},
	plugins: {
		// AppLoader.vue takes over with an identical frame and hides this as soon as
		// the web view is up, so there's no flash; 3s is only a fallback
		SplashScreen: {
			launchAutoHide: true,
			launchShowDuration: 3000,
			backgroundColor: '#07130d',
			showSpinner: false,
		},
		// Shrink the web view above the keyboard instead of letting iOS scroll the
		// whole page up when a text field is focused (Scout Report search)
		Keyboard: {
			resize: 'native',
			resizeOnFullScreen: true,
		},
	},
}

export default config
