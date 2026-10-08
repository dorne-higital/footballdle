<template>
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
			class="mode-tabs"
			role="tablist"
			aria-label="Game mode"
		>
			<button
				v-for="m in modes"
				:key="m.id"
				type="button"
				role="tab"
				:aria-selected="selected === m.id"
				:class="{ active: selected === m.id }"
				@click="selected = m.id"
			>
				{{ m.label }}
			</button>
		</div>

		<p
			v-if="!current.store.stats.gamesPlayed"
			class="empty-mode"
		>
			<Icon
				name="solar:football-linear"
				size="1.6rem"
			/>
			No {{ current.label }} games yet. Your stats show up here after your first one.
		</p>
		<SeasonFormDashboard
			v-else
			:key="selected"
			:primary-stats="current.primary"
			:win-percentage="current.store.winPercentage"
			:distribution="selected === 'spotball' ? undefined : current.store.stats.guessDistribution"
			:score-histogram="selected === 'spotball' ? spotHistogram : undefined"
			:recent-form="current.store.stats.recentForm"
		/>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'
	import { useModeStatsStore } from '../../stores/modeStats'
	import { usePlayStreakStore } from '../../stores/playStreak'
	import { SPOT_TIER_LABELS } from '../../utils/spotTiers'
	import { readSavedObject } from '../../utils/storage'
	import SeasonFormDashboard from './SeasonFormDashboard.vue'

	// The one Stats view (tab and sheet): Matchday streak, then the same breakdown for
	// whichever mode is picked. Opened from inside a game, that game is picked first.
	type ModeId = 'daily' | 'scout' | 'spotball' | 'challenge'
	const stores = {
		daily: useModeStatsStore('daily'),
		scout: useModeStatsStore('scout'),
		spotball: useModeStatsStore('spotball'),
		challenge: useModeStatsStore('challenge'),
	}
	const playStreak = usePlayStreakStore()
	const route = useRoute()

	const basics = (id: ModeId) => [
		{ label: 'Games', value: stores[id].stats.gamesPlayed },
		{ label: 'Wins', value: stores[id].stats.wins },
		{ label: 'Streak', value: stores[id].stats.currentStreak },
		{ label: 'Max Streak', value: stores[id].stats.maxStreak },
	]

	const modes = computed(() =>
		[
			{ id: 'daily' as const, label: 'Daily', primary: basics('daily') },
			{ id: 'scout' as const, label: 'Scout', primary: basics('scout') },
			{ id: 'spotball' as const, label: 'Spot', primary: basics('spotball') },
			{
				id: 'challenge' as const,
				label: 'Challenge',
				primary: [
					{ label: 'Challenges', value: stores.challenge.stats.gamesPlayed },
					{ label: 'Wins', value: stores.challenge.stats.wins },
					{ label: 'Best Streak', value: stores.challenge.stats.maxStreak },
					{ label: 'Best Time', value: `${stores.challenge.stats.bestTime || 0}s` },
				],
			},
		].map(m => ({ ...m, store: stores[m.id] })),
	)

	function modeForRoute(path: string): ModeId {
		if (path.startsWith('/play/scout-report')) return 'scout'
		if (path.startsWith('/play/spot-the-baller')) return 'spotball'
		return 'daily'
	}
	const selected = ref<ModeId>(modeForRoute(route.path))
	const current = computed(() => modes.value.find(m => m.id === selected.value)!)

	const spotTiers = ref<Record<string, number>>({})
	const spotHistogram = computed(() =>
		SPOT_TIER_LABELS.map((label, i) => ({ label, count: Number(spotTiers.value[String(i + 1)]) || 0 })),
	)

	onMounted(() => {
		for (const store of Object.values(stores)) store.loadStats()
		playStreak.load()
		spotTiers.value = readSavedObject<Record<string, number>>('footballdle-spot-tiers') ?? {}
	})
</script>

<style scoped lang="scss">
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
	}

	.mode-tabs {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		display: grid;
		gap: 0.2rem;
		grid-template-columns: repeat(4, 1fr);
		padding: 0.2rem;

		button {
			background: none;
			border: 0;
			border-radius: 0.7rem;
			color: var(--text-secondary);
			cursor: pointer;
			font: inherit;
			font-size: 0.85rem;
			font-weight: 700;
			min-height: 40px;

			&.active {
				background: var(--primary-color);
				color: var(--on-success);
			}
		}
	}

	.empty-mode {
		align-items: center;
		color: var(--text-secondary);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 1.5rem 1rem;
		text-align: center;
	}
</style>
