import { Capacitor, registerPlugin } from '@capacitor/core'

// AppGlance analytics, iPhone app only (ios/App/App/AppGlancePlugin.swift). Called right
// where each thing happens. Does nothing on the website and in tests, and never waits or
// throws. Names are a fixed set (product and mode go in metadata, never in the name), and
// nothing personal or typed by the player goes in.
interface AppGlancePlugin {
	track(options: { name: string; metadata?: Record<string, string> }): Promise<void>
	trackScreen(options: { name: string }): Promise<void>
	setUserProperties(options: { properties: Record<string, string> }): Promise<void>
}

const AppGlance = registerPlugin<AppGlancePlugin>('AppGlance')

export function track(name: string, metadata?: Record<string, string>) {
	if (Capacitor.isNativePlatform()) AppGlance.track({ name, metadata }).catch(() => {})
}

/** Records screen.<name> */
export function trackScreen(name: string) {
	if (Capacitor.isNativePlatform()) AppGlance.trackScreen({ name }).catch(() => {})
}

export function setUserProperties(properties: Record<string, string>) {
	if (Capacitor.isNativePlatform()) AppGlance.setUserProperties({ properties }).catch(() => {})
}
