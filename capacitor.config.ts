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
	},
}

export default config
