import { useAppearanceStore } from '../stores/appearance'

// Applies the app's Dark / Light choice before the first screen paints
export default defineNuxtPlugin(() => {
	if (!useRuntimeConfig().public.appShell) return
	useAppearanceStore().init()
})
