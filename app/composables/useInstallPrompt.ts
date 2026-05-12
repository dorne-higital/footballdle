import { ref, onMounted, onUnmounted } from 'vue'

export function useInstallPrompt() {
	const deferredPrompt = ref<any>(null)
	const canInstall = ref(false)
	const isIOS = ref(false)
	const isInstalled = ref(false)

	function onBeforeInstallPrompt(e: Event) {
		e.preventDefault()
		deferredPrompt.value = e
		canInstall.value = true
	}

	async function install(): Promise<boolean> {
		if (!deferredPrompt.value) return false
		deferredPrompt.value.prompt()
		const { outcome } = await deferredPrompt.value.userChoice
		deferredPrompt.value = null
		canInstall.value = false
		return outcome === 'accepted'
	}

	onMounted(() => {
		isInstalled.value = window.matchMedia('(display-mode: standalone)').matches
		isIOS.value = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
		window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
	})

	onUnmounted(() => {
		window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
	})

	return { canInstall, isIOS, isInstalled, install }
}
