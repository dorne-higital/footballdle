<template>
	<div class="get-app">
		<main class="get-app-main">
			<p class="eyebrow">Footballdle</p>
			<h1>Footballdle is on iPhone</h1>
			<p class="lede">
				A new footballer to find every day, plus Scout Report, Spot the Baller and the weekly Grid. Player Cards,
				57 trophies and Game Center leaderboards.
			</p>
			<a
				v-if="APP_STORE_LIVE"
				:href="APP_STORE_URL"
				class="store-link"
				@click="trackClick"
			>
				<Icon
					name="ri:apple-fill"
					size="1.2rem"
				/>
				Get it on the App Store
			</a>
			<NuxtLink
				to="/"
				class="web-link"
			>
				Or play on the web
				<Icon
					name="solar:alt-arrow-right-linear"
					size="1rem"
				/>
			</NuxtLink>
		</main>
	</div>
</template>

<script setup lang="ts">
	import { onMounted } from 'vue'
	import { APP_STORE_LIVE, APP_STORE_URL } from '../utils/appStore'
	import { useAnalytics } from '../composables/useAnalytics'

	// footballdle.co.uk/app: the link in shares from the iPhone app. iPhones and iPads go
	// straight to the App Store; anyone else (Android, a computer) lands here and can play
	// on the web instead
	useHead({
		title: 'Footballdle on iPhone',
		meta: [{ name: 'robots', content: 'noindex' }],
	})

	const { trackGetApp } = useAnalytics()
	const trackClick = () => trackGetApp('store_click')

	onMounted(() => {
		if (!APP_STORE_LIVE) return
		const ua = navigator.userAgent
		// iPadOS reports itself as a Mac, so a Mac with a touch screen is an iPad
		const isApple = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
		if (isApple) {
			trackGetApp('redirect')
			window.location.replace(APP_STORE_URL)
		}
	})
</script>

<style scoped lang="scss">
	.get-app {
		display: flex;
		justify-content: center;
		padding: 3rem 1.25rem;
		width: 100%;
	}

	.get-app-main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 26rem;
		text-align: center;
	}

	.eyebrow {
		color: var(--primary-color);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.16em;
		margin: 0;
		text-transform: uppercase;
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(1.8rem, 8vw, 2.4rem);
		line-height: 1.05;
		margin: 0;
		text-wrap: balance;
	}

	.lede {
		color: var(--text-secondary);
		margin: 0;
	}

	.store-link {
		align-items: center;
		align-self: center;
		background: var(--primary-color);
		border-radius: 999px;
		color: var(--on-primary);
		display: inline-flex;
		font-weight: 800;
		gap: 0.5rem;
		margin-top: 0.5rem;
		padding: 0.8rem 1.4rem;
		text-decoration: none;
	}

	.web-link {
		align-items: center;
		align-self: center;
		color: var(--text-primary);
		display: inline-flex;
		font-weight: 700;
		gap: 0.25rem;
		text-decoration: none;
	}
</style>
