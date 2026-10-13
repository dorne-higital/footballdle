import { useModalsStore } from '../stores/modals'

// Sheets belong to the screen they were opened on: without this, a sheet left open
// (or opened on a screen that can't show it) pops up on the next screen by itself
export default defineNuxtPlugin(() => {
	const router = useRouter()
	router.afterEach((to, from) => {
		if (to.path !== from.path) useModalsStore().closeAll()
	})
})
