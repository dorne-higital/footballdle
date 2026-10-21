import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

// Taptic feedback in the iOS app; silently does nothing on the website
const native = Capacitor.isNativePlatform()
// Settings > Accessibility > Haptics (stores/accessibility.ts sets it at launch)
let enabled = true
export function setHapticsEnabled(on: boolean) {
	enabled = on
}
const on = () => native && enabled

export function useHaptics() {
	return {
		tap: () => on() && Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),
		select: () => on() && Haptics.selectionStart().then(() => Haptics.selectionEnd()).catch(() => {}),
		success: () => on() && Haptics.notification({ type: NotificationType.Success }).catch(() => {}),
		error: () => on() && Haptics.notification({ type: NotificationType.Error }).catch(() => {}),
	}
}
