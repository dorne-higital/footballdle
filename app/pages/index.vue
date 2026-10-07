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

		<!-- Stats Modal -->
		<PitchCardModal
			v-if="modalsStore.showStats"
			heading="Statistics"
			accent="info"
			variant="small"
			@close="modalsStore.closeStats"
		>
			<template #body>
				<div class="hub-stats-modal">
					<div class="play-streak-card">
						<Icon
							name="solar:fire-bold"
							size="1.6rem"
							class="flame"
						/>
						<div class="play-streak-text">
							<h4>Matchday streak</h4>
							<p>Days in a row you've finished a game, win or lose</p>
						</div>
						<div class="play-streak-numbers">
							<strong>{{ playStreak.activeStreak }}</strong>
							<span>Best {{ playStreak.best }}</span>
						</div>
					</div>
					<div
						v-for="mode in modeSummaries"
						:key="mode.label"
						class="mode-row"
					>
						<div class="mode-row-top">
							<h4>{{ mode.label }}</h4>
							<span
								v-if="mode.currentStreak > 0"
								class="streak-tag"
							>
								<Icon
									name="solar:fire-bold"
									size="0.85rem"
								/>
								{{ mode.currentStreak }}
							</span>
						</div>
						<div class="mode-row-stats">
							<span><strong>{{ mode.gamesPlayed }}</strong> played</span>
							<span><strong>{{ mode.winRate }}%</strong> win rate</span>
						</div>
					</div>
				</div>
			</template>
		</PitchCardModal>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, computed, defineAsyncComponent } from 'vue'
	import { useModeStatsStore } from '../stores/modeStats'
	import { useModalsStore } from '../stores/modals'
	import { usePlayStreakStore } from '../stores/playStreak'
	import { useAnalytics } from '../composables/useAnalytics'
	import { useHead } from 'nuxt/app'
	import ModeSelectHub from '../components/hub/ModeSelectHub.vue'
	import HubStatsStrip from '../components/hub/HubStatsStrip.vue'
	import AppHome from '../components/app/AppHome.vue'
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
	const scoutStatsStore = useModeStatsStore('scout')
	const spotballStatsStore = useModeStatsStore('spotball')
	const modalsStore = useModalsStore()
	const playStreak = usePlayStreakStore()
	const { trackBuyMeCoffee } = useAnalytics()

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

	function handleBuyMeCoffee(location: string) {
		trackBuyMeCoffee(location)
		if (import.meta.client) {
			const btn = document.querySelector('#bmc-wbtn') as HTMLElement | null
			btn?.click()
		}
	}

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

	.hub-stats-modal {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;

		.play-streak-card {
			align-items: center;
			background: color-mix(in srgb, var(--tertiary-color) 12%, var(--bg-secondary));
			border: 1px solid color-mix(in srgb, var(--tertiary-color) 35%, transparent);
			border-radius: var(--global-border-radius);
			display: flex;
			gap: 0.75rem;
			padding: 0.9rem 1rem;
			text-align: left;

			.flame {
				color: var(--tertiary-color);
				flex-shrink: 0;
			}

			.play-streak-text {
				flex: 1;

				h4 {
					margin: 0;
				}

				p {
					color: var(--text-secondary);
					font-size: 0.78rem;
					margin: 0.15rem 0 0;
				}
			}

			.play-streak-numbers {
				align-items: flex-end;
				display: flex;
				flex-direction: column;

				strong {
					font-family: var(--font-display);
					font-size: 1.6rem;
					line-height: 1;
				}

				span {
					color: var(--text-secondary);
					font-size: 0.72rem;
				}
			}
		}

		.mode-row {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--global-border-radius);
			padding: 0.9rem 1rem;
		}

		.mode-row-top {
			align-items: center;
			display: flex;
			justify-content: space-between;
			margin-bottom: 0.4rem;

			h4 {
				color: var(--text-primary);
				font-family: var(--font-display);
				font-size: 0.95rem;
				font-weight: 700;
				margin: 0;
			}
		}

		.streak-tag {
			align-items: center;
			color: var(--tertiary-color);
			display: inline-flex;
			font-family: var(--font-mono);
			font-size: 0.8rem;
			font-weight: 700;
			gap: 0.25rem;
		}

		.mode-row-stats {
			color: var(--text-secondary);
			display: flex;
			font-size: 0.82rem;
			gap: 1.25rem;

			strong {
				color: var(--text-primary);
				font-family: var(--font-mono);
			}
		}
	}
</style>
