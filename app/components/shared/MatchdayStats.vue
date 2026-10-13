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

		<!-- The Grid keeps its own stats (weeks and points rather than wins and streaks) -->
		<div
			v-if="selected === 'grid'"
			class="grid-stats"
		>
			<div class="grid-stat-row">
				<div
					v-for="item in gridStats"
					:key="item.label"
					class="grid-stat"
				>
					<strong>{{ item.value }}</strong>
					<span>{{ item.label }}</span>
				</div>
			</div>
			<div
				v-if="recentWeeks.length"
				class="grid-weeks"
				aria-label="Recent Grid Weeks"
			>
				<div
					v-for="week in recentWeeks"
					:key="week.start"
					class="grid-week"
				>
					<span class="gw-date">{{ week.label }}</span>
					<span class="gw-bar"><span :style="{ width: `${(week.points / 4500) * 100}%` }"></span></span>
					<span class="gw-points">{{ week.points.toLocaleString('en-GB') }}</span>
				</div>
			</div>
			<p
				v-else
				class="empty-mode"
			>
				Play this week's grids to start your Grid Week record.
			</p>
		</div>
		<p
			v-else-if="!current.store?.stats.gamesPlayed"
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
			:win-percentage="current.store!.winPercentage"
			:distribution="selected === 'spotball' ? undefined : current.store!.stats.guessDistribution"
			:score-histogram="selected === 'spotball' ? spotHistogram : undefined"
			:recent-form="current.store!.stats.recentForm"
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
	import { useGridStore } from '../../stores/grid'

	// The one Stats view (tab and sheet): Matchday streak, then the same breakdown for
	// whichever mode is picked. Opened from inside a game, that game is picked first.
	type ModeId = 'daily' | 'scout' | 'spotball' | 'grid'
	const stores = {
		daily: useModeStatsStore('daily'),
		scout: useModeStatsStore('scout'),
		spotball: useModeStatsStore('spotball'),
	}
	const grid = useGridStore()
	const playStreak = usePlayStreakStore()
	const route = useRoute()

	const basics = (id: Exclude<ModeId, 'grid'>) => [
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
			{ id: 'grid' as const, label: 'Grid', primary: [] },
		].map(m => ({ ...m, store: m.id === 'grid' ? null : stores[m.id] })),
	)

	const gridStats = computed(() => [
		{ label: 'This week', value: grid.weekPoints.toLocaleString('en-GB') },
		{ label: 'Best week', value: grid.bestWeek.toLocaleString('en-GB') },
		{ label: 'Weeks played', value: grid.stats.weeks.length },
		{ label: 'Grids finished', value: grid.stats.gamesPlayed },
		{ label: 'Perfect grids', value: grid.stats.perfectGrids },
		{ label: 'Practice grids', value: grid.stats.practicePlayed },
	])
	const recentWeeks = computed(() =>
		grid.stats.weeks.slice(-6).reverse().map(w => {
			const [d, m, y] = w.start.split('/').map(Number)
			const label = new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
			return { ...w, label }
		}),
	)

	function modeForRoute(path: string): ModeId {
		if (path.startsWith('/play/scout-report')) return 'scout'
		if (path.startsWith('/play/spot-the-baller')) return 'spotball'
		if (path.startsWith('/play/grid')) return 'grid'
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
		grid.load()
		playStreak.load()
		spotTiers.value = readSavedObject<Record<string, number>>('footballdle-spot-tiers') ?? {}
	})
</script>

<style scoped lang="scss">
	.grid-stats {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.grid-stat-row {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.grid-stat {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.85rem;
		display: flex;
		flex-direction: column;
		padding: 0.65rem 0.25rem;
		text-align: center;

		strong {
			font-family: var(--font-display);
			font-size: 1.2rem;
			font-variant-numeric: tabular-nums;
		}

		span {
			color: var(--text-secondary);
			font-size: 0.68rem;
			font-weight: 800;
			letter-spacing: 0.05em;
			text-transform: uppercase;
		}
	}

	.grid-weeks {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		padding: 0.85rem;
	}

	.grid-week {
		align-items: center;
		display: flex;
		font-size: 0.82rem;
		font-variant-numeric: tabular-nums;
		font-weight: 800;
		gap: 0.6rem;
	}

	.gw-date {
		color: var(--text-secondary);
		width: 3.4rem;
	}

	.gw-bar {
		background: var(--fl-raised, var(--border));
		border-radius: 999px;
		flex: 1;
		height: 0.5rem;
		overflow: hidden;

		span {
			background: var(--primary-color);
			display: block;
			height: 100%;
		}
	}

	.gw-points {
		text-align: right;
		width: 3rem;
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
				color: var(--on-primary);
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
