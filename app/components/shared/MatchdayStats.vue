<template>
	<div class="hub-stats-modal">
		<!-- Matchday streak: the number and the last 7 days, today dashed until a game is finished -->
		<section
			:class="['play-streak-card', { cold: !playStreak.playedToday }]"
			aria-label="Matchday streak"
		>
			<div class="streak-top">
				<p class="streak-count">
					<strong>{{ playStreak.activeStreak }}</strong>
					<span>day Matchday streak</span>
				</p>
				<span class="best-chip">Best <b>{{ playStreak.best }}</b></span>
			</div>
			<ol class="streak-days">
				<li
					v-for="(day, i) in week"
					:key="i"
					:class="['streak-day', day.state]"
					:aria-label="`${day.isToday ? 'Today' : day.weekday}: ${DAY_SPOKEN[day.state]}`"
				>
					<span
						class="streak-dot"
						aria-hidden="true"
					>
						<svg
							v-if="day.state === 'played'"
							viewBox="0 0 12 12"
						>
							<path
								d="M2.5 6.2l2.3 2.3 4.7-5"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</span>
					<span
						class="streak-label"
						aria-hidden="true"
					>{{ day.isToday ? 'Today' : day.weekday.charAt(0) }}</span>
				</li>
			</ol>
			<p :class="['streak-foot', { warn: !playStreak.playedToday && playStreak.activeStreak > 0 }]">{{ streakFoot }}</p>
		</section>

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
	import { getUKDateString, streakWeek, type StreakDayState } from '../../utils/dateStreak'
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

	// The streak card's week of ticks, and the line under it
	const week = computed(() => streakWeek(playStreak.activeStreak, playStreak.playedToday, getUKDateString()))
	const DAY_SPOKEN: Record<StreakDayState, string> = { played: 'played', missed: 'missed', unknown: 'not played', today: 'not played yet' }
	const streakFoot = computed(() => {
		if (playStreak.playedToday) return 'Finish any game, win or lose, to add a day.'
		if (playStreak.activeStreak > 0) return `Play any game today to make it ${playStreak.activeStreak + 1}.`
		return 'Finish any game today to start a streak.'
	})

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
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 1.1rem;
			display: grid;
			gap: 0.75rem;
			padding: 0.9rem 1rem;
			text-align: left;
		}

		.streak-top {
			align-items: center;
			display: flex;
			gap: 0.75rem;
			justify-content: space-between;
		}

		.streak-count {
			align-items: baseline;
			display: flex;
			flex-wrap: wrap;
			gap: 0 0.5rem;
			margin: 0;

			strong {
				color: var(--tertiary-color);
				font-family: var(--font-display);
				font-size: 2.1rem;
				line-height: 1;
			}

			span {
				color: var(--text-primary);
				font-size: 0.9rem;
				font-weight: 700;
			}
		}

		.cold .streak-count strong {
			color: var(--text-secondary);
		}

		.best-chip {
			background: color-mix(in srgb, var(--text-primary) 6%, transparent);
			border: 1px solid var(--border);
			border-radius: 999px;
			color: var(--text-secondary);
			flex-shrink: 0;
			font-size: 0.78rem;
			font-weight: 700;
			padding: 0.3rem 0.7rem;

			b {
				color: var(--text-primary);
			}
		}

		.streak-days {
			display: grid;
			gap: 0.4rem;
			grid-template-columns: repeat(7, 1fr);
			list-style: none;
			margin: 0;
			padding: 0;
		}

		.streak-day {
			color: var(--text-secondary);
			display: grid;
			font-size: 0.7rem;
			font-weight: 700;
			gap: 0.3rem;
			justify-items: center;
		}

		.streak-dot {
			aspect-ratio: 1;
			background: color-mix(in srgb, var(--text-primary) 6%, transparent);
			border: 1px solid var(--border);
			border-radius: 0.6rem;
			display: grid;
			max-width: 2.2rem;
			place-items: center;
			width: 100%;

			svg {
				height: 0.9rem;
				width: 0.9rem;
			}
		}

		.played .streak-dot {
			background: var(--tertiary-color);
			border-color: var(--tertiary-color);
			color: #2a1a02;
		}

		.missed .streak-dot {
			background: transparent;
		}

		.today .streak-dot {
			background: transparent;
			border: 2px dashed var(--tertiary-color);
		}

		.streak-foot {
			color: var(--text-secondary);
			font-size: 0.8rem;
			margin: 0;

			&.warn {
				color: var(--tertiary-color);
				font-weight: 700;
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
