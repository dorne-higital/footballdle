import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

// Taptic feedback in the iOS app; silently does nothing on the website
const native = Capacitor.isNativePlatform()

export function useHaptics() {
	return {
		tap: () => native && Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),
		select: () => native && Haptics.selectionStart().then(() => Haptics.selectionEnd()).catch(() => {}),
		success: () => native && Haptics.notification({ type: NotificationType.Success }).catch(() => {}),
		error: () => native && Haptics.notification({ type: NotificationType.Error }).catch(() => {}),
	}
}
