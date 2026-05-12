import { ref, onMounted } from 'vue'

export function usePushNotifications() {
	const config = useRuntimeConfig()

	const isSupported = ref(false)

	onMounted(() => {
		isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
	})

	async function getSubscription(): Promise<PushSubscription | null> {
		if (!isSupported.value) return null
		const reg = await navigator.serviceWorker.ready
		return reg.pushManager.getSubscription()
	}

	async function isSubscribed(): Promise<boolean> {
		const sub = await getSubscription()
		return !!sub
	}

	async function subscribe(): Promise<boolean> {
		if (!isSupported.value) return false
		const permission = await Notification.requestPermission()
		if (permission !== 'granted') return false
		const reg = await navigator.serviceWorker.ready
		const sub = await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: config.public.vapidPublicKey,
		})
		await $fetch('/api/push/subscribe', { method: 'POST', body: sub.toJSON() })
		return true
	}

	async function unsubscribe(): Promise<void> {
		const sub = await getSubscription()
		if (!sub) return
		await $fetch('/api/push/unsubscribe', { method: 'POST', body: { endpoint: sub.endpoint } })
		await sub.unsubscribe()
	}

	return { isSupported, isSubscribed, subscribe, unsubscribe }
}
