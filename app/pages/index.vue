<template>
	<div class="hub-page">
		<ModeSelectHub :daily-streak="statsStore.stats.currentStreak" />

		<!-- Settings Modal -->
		<PitchCardModal
			v-if="modalsStore.showSettings"
			heading="Settings"
			accent="info"
			variant="small"
			@close="modalsStore.closeSettings"
		>
			<template #body>
				<ThemePickerSettings @buy-coffee="handleBuyMeCoffee" />
			</template>
		</PitchCardModal>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, defineAsyncComponent } from 'vue'
	import { useModeStatsStore } from '../stores/modeStats'
	import { useModalsStore } from '../stores/modals'
	import { useAnalytics } from '../composables/useAnalytics'
	import { useHead } from 'nuxt/app'
	import ModeSelectHub from '../components/hub/ModeSelectHub.vue'
	import ThemePickerSettings from '../components/shared/ThemePickerSettings.vue'

	definePageMeta({ layout: 'play' })

	const PitchCardModal = defineAsyncComponent(() => import('../components/shared/PitchCardModal.vue'))

	useHead({
		title: 'Footballdle | Daily Premier League Football Games',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk' }],
		meta: [
			{
				name: 'description',
				content:
					'Footballdle is a collection of free daily Premier League football guessing games — Daily Wordle-style puzzles, Scout Report, Spot the Baller and more. Pick a mode, build a streak.',
			},
			{
				name: 'keywords',
				content:
					'football wordle, premier league wordle, footballdle, guess the footballer, daily football game, football puzzle games, soccer wordle',
			},
			{ name: 'author', content: 'Footballdle' },
			{ name: 'robots', content: 'index, follow' },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:title', content: 'Footballdle | Daily Premier League Football Games' },
			{
				property: 'og:description',
				content: 'Pick a mode, guess the footballer, build a streak — free daily Premier League football games.',
			},
			{ property: 'og:image', content: 'https://footballdle.co.uk/og-image.png' },
			{ property: 'og:url', content: 'https://footballdle.co.uk' },
			{ property: 'og:site_name', content: 'Footballdle' },
			{ name: 'twitter:card', content: 'summary_large_image' },
			{ name: 'twitter:title', content: 'Footballdle | Daily Premier League Football Games' },
			{
				name: 'twitter:description',
				content: 'Pick a mode, guess the footballer, build a streak — free daily Premier League football games.',
			},
			{ name: 'twitter:image', content: 'https://footballdle.co.uk/og-image.png' },
		],
		script: [
			{
				type: 'application/ld+json',
				children: JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'WebSite',
					name: 'Footballdle',
					url: 'https://footballdle.co.uk',
					description: 'A collection of free daily Premier League football guessing games.',
				}),
			},
		],
	})

	const statsStore = useModeStatsStore('daily')
	const modalsStore = useModalsStore()
	const { trackBuyMeCoffee } = useAnalytics()

	function handleBuyMeCoffee(location: string) {
		trackBuyMeCoffee(location)
		if (import.meta.client) {
			const btn = document.querySelector('#bmc-wbtn') as HTMLElement | null
			btn?.click()
		}
	}

	onMounted(() => {
		statsStore.loadStats()
	})
</script>

<style scoped lang="scss">
	.hub-page {
		height: 100%;
		overflow-y: auto;
		width: 100%;
	}
</style>
