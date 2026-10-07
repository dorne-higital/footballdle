<template>
	<div class="hub-page">
		<AppHome v-if="$config.public.isApp" />
		<template v-else>
			<ModeSelectHub
				:daily-streak="statsStore.stats.currentStreak"
				:scout-streak="scoutStatsStore.stats.currentStreak"
				:spotball-streak="spotballStatsStore.stats.currentStreak"
			/>

			<HubStatsStrip :modes="modeSummaries" />
		</template>

		<HubSheets />
	</div>
</template>

<script setup lang="ts">
	import { onMounted, computed } from 'vue'
	import { useModeStatsStore } from '../stores/modeStats'
	import { useHead } from 'nuxt/app'
	import ModeSelectHub from '../components/hub/ModeSelectHub.vue'
	import HubStatsStrip from '../components/hub/HubStatsStrip.vue'
	import AppHome from '../components/app/AppHome.vue'
	import HubSheets from '../components/shared/HubSheets.vue'

	definePageMeta({ layout: 'play' })

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
	const scoutStatsStore = useModeStatsStore('scout')
	const spotballStatsStore = useModeStatsStore('spotball')

	const modeSummaries = computed(() => [
		{
			label: 'Daily',
			gamesPlayed: statsStore.stats.gamesPlayed,
			wins: statsStore.stats.wins,
			currentStreak: statsStore.stats.currentStreak,
			winRate: statsStore.winPercentage,
		},
		{
			label: 'Scout Report',
			gamesPlayed: scoutStatsStore.stats.gamesPlayed,
			wins: scoutStatsStore.stats.wins,
			currentStreak: scoutStatsStore.stats.currentStreak,
			winRate: scoutStatsStore.winPercentage,
		},
		{
			label: 'Spot the Baller',
			gamesPlayed: spotballStatsStore.stats.gamesPlayed,
			wins: spotballStatsStore.stats.wins,
			currentStreak: spotballStatsStore.stats.currentStreak,
			winRate: spotballStatsStore.winPercentage,
		},
	])

	onMounted(() => {
		statsStore.loadStats()
		scoutStatsStore.loadStats()
		spotballStatsStore.loadStats()
	})
</script>

<style scoped lang="scss">
	.hub-page {
		height: 100%;
		overflow-y: auto;
		width: 100%;
	}
</style>
