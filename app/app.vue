<template>
  <NuxtPage />
</template> 

<style lang="scss">
@import '../assets/main.scss';
</style>

<script setup>
import { useAuthStore } from './stores/auth'

// Preload critical resources
useHead({
	link: [
		{
			rel: 'preconnect',
			href: 'https://www.googletagmanager.com',
		},
		{
			rel: 'dns-prefetch',
			href: 'https://www.googletagmanager.com',
		},
	],
	// Performance optimizations
	htmlAttrs: {
		lang: 'en',
	},
	bodyAttrs: {
		class: 'antialiased',
	},
})

// Performance monitoring
if (process.client) {
	// Monitor Core Web Vitals
	window.addEventListener('load', () => {
		// Report LCP
		new PerformanceObserver((entryList) => {
			for (const entry of entryList.getEntries()) {
				if (entry.entryType === 'largest-contentful-paint') {
			
				}
			}
		}).observe({ entryTypes: ['largest-contentful-paint'] })

		// Report FID
		new PerformanceObserver((entryList) => {
			for (const entry of entryList.getEntries()) {
				if (entry.entryType === 'first-input') {
			
				}
			}
		}).observe({ entryTypes: ['first-input'] })
	})
}

// Auth initialization
const authStore = useAuthStore()

onMounted(() => {
	// Initialize Firebase auth
	authStore.initializeAuth()
	
	// Check if user is on home page and not authenticated (but not guest)
	setTimeout(() => {

		
		if (window.location.pathname === '/' && !authStore.isLoading && !authStore.isAuthenticated && !authStore.isGuest) {
			window.location.href = '/login'
		}
	}, 2000) // Wait 2 seconds for auth to initialize
})
</script>