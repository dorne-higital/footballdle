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
		SplashScreen: {
			launchShowDuration: 0,
			backgroundColor: '#07130d',
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
