<template>
	<!-- Website on a computer: today's progress and your stats beside the board (the game
	     pages show it from 1024px wide; phones and the app never do) -->
	<aside class="game-side-panel">
		<section
			class="side-card today"
			aria-label="Today's progress"
		>
			<ActivityRings
				:rings="rings"
				:size="72"
				:stroke="8"
				label="Today's progress across Daily, Scout Report and Spot the Baller"
			/>
			<ul>
				<li
					v-for="item in modes"
					:key="item.key"
				>
					<NuxtLink
						:to="{ path: item.path, query: { start: item.done ? 'result' : 'play' } }"
						:class="['mode-link', { current: item.key === mode }]"
						:aria-current="item.key === mode ? 'page' : undefined"
					>
						<span
							class="dot"
							:style="{ background: item.color }"
						></span>
						<span class="mode-name">{{ item.name }}</span>
						<span class="mode-state">{{ item.label }}</span>
					</NuxtLink>
				</li>
			</ul>
		</section>

		<section
			class="side-card"
			:aria-label="`Your ${title} stats`"
		>
			<p class="side-title">Your {{ title }}</p>
			<div class="stat-row">
				<div class="stat">
					<span class="stat-value">{{ stats.stats.gamesPlayed }}</span>
					<span class="stat-label">Played</span>
				</div>
				<div class="stat">
					<span class="stat-value">{{ stats.winPercentage }}%</span>
					<span class="stat-label">Won</span>
				</div>
				<div class="stat">
					<span class="stat-value streak">{{ stats.stats.currentStreak }}</span>
					<span class="stat-label">Streak</span>
				</div>
				<div class="stat">
					<span class="stat-value">{{ stats.stats.maxStreak }}</span>
					<span class="stat-label">Best</span>
				</div>
			</div>

			<div
				v-if="mode !== 'spotball'"
				class="distribution"
				aria-label="Guess distribution"
			>
				<div
					v-for="row in distribution"
					:key="row.guesses"
					class="dist-row"
				>
					<span class="dist-n">{{ row.guesses }}</span>
					<span class="dist-bar"><span :style="{ width: `${row.width}%` }"></span></span>
					<span class="dist-count">{{ row.count }}</span>
				</div>
			</div>
		</section>

		<NuxtLink
			to="/how-to-play"
			class="side-link"
		>
			<Icon
				name="solar:question-circle-linear"
				size="1.1rem"
			/>
			How to play
		</NuxtLink>
	</aside>
</template>

<script setup lang="ts">
	import { computed, onMounted, watch } from 'vue'
	import ActivityRings from './ActivityRings.vue'
	import { useModeStatsStore } from '../../stores/modeStats'
	import { useTodayProgress } from '../../composables/useTodayProgress'

	const props = withDefaults(
		defineProps<{
			mode: 'daily' | 'scout' | 'spotball'
			/** Changes whenever the game moves on (a guess, a round), to refresh today's progress */
			revision?: number
		}>(),
		{ revision: 0 },
	)

	const RING_COLORS = { daily: 'var(--game-daily)', scout: 'var(--game-scout)', spot: 'var(--game-spot)' }
	const progress = useTodayProgress()
	const stats = useModeStatsStore(props.mode)
	const title = computed(() => ({ daily: 'Daily', scout: 'Scout Report', spotball: 'Spot the Baller' })[props.mode])

	onMounted(() => {
		progress.refresh()
		stats.loadStats()
	})
	watch(() => props.revision, () => progress.refresh())

	const done = (status: string) => status === 'won' || status === 'lost'
	const modes = computed(() => [
		{ key: 'daily', name: 'Daily', path: '/play/daily', color: RING_COLORS.daily, label: progress.daily.value.label, done: done(progress.daily.value.status) },
		{ key: 'scout', name: 'Scout Report', path: '/play/scout-report', color: RING_COLORS.scout, label: progress.scout.value.label, done: done(progress.scout.value.status) },
		{ key: 'spotball', name: 'Spot the Baller', path: '/play/spot-the-baller', color: RING_COLORS.spot, label: progress.spot.value.label, done: done(progress.spot.value.status) },
	])
	const rings = computed(() => [
		{ progress: progress.daily.value.progress, color: RING_COLORS.daily },
		{ progress: progress.scout.value.progress, color: RING_COLORS.scout },
		{ progress: progress.spot.value.progress, color: RING_COLORS.spot },
	])

	const distribution = computed(() => {
		const dist = stats.stats.guessDistribution || {}
		const most = Math.max(1, ...Object.values(dist).map(Number))
		return ['1', '2', '3', '4', '5', '6'].map(g => ({
			guesses: g,
			count: Number(dist[g] || 0),
			width: Math.max(4, (Number(dist[g] || 0) / most) * 100),
		}))
	})
</script>

<style scoped lang="scss">
	.game-side-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 20rem;
	}

	.side-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		padding: 1.1rem;
	}

	.today {
		align-items: center;
		flex-direction: row;

		ul {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: 0.15rem;
			list-style: none;
			margin: 0;
			min-width: 0;
			padding: 0;
		}
	}

	.mode-link {
		align-items: center;
		border-radius: 0.6rem;
		color: var(--text-primary);
		display: flex;
		font-size: 0.85rem;
		font-weight: 700;
		gap: 0.5rem;
		padding: 0.35rem 0.45rem;
		text-decoration: none;

		&:hover,
		&.current {
			background: var(--fl-raised);
		}
	}

	.dot {
		border-radius: 50%;
		flex: none;
		height: 0.5rem;
		width: 0.5rem;
	}

	.mode-name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.mode-state {
		color: var(--text-secondary);
		font-size: 0.78rem;
		white-space: nowrap;
	}

	.side-title {
		color: var(--primary-color);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		margin: 0;
		text-transform: uppercase;
	}

	.stat-row {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	.stat {
		align-items: center;
		background: var(--fl-raised);
		border-radius: 0.75rem;
		display: flex;
		flex-direction: column;
		padding: 0.55rem 0.25rem;
	}

	.stat-value {
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-variant-numeric: tabular-nums;

		&.streak {
			color: var(--tertiary-color);
		}
	}

	.stat-label {
		color: var(--text-secondary);
		font-size: 0.66rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.distribution {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.dist-row {
		align-items: center;
		display: flex;
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
		font-weight: 800;
		gap: 0.6rem;
	}

	.dist-n {
		width: 0.7rem;
	}

	.dist-bar {
		background: var(--fl-raised);
		border-radius: 999px;
		flex: 1;
		height: 0.5rem;
		overflow: hidden;

		span {
			background: var(--primary-color);
			border-radius: 999px;
			display: block;
			height: 100%;
		}
	}

	.dist-count {
		color: var(--text-secondary);
		text-align: right;
		width: 1.5rem;
	}

	.side-link {
		align-items: center;
		color: var(--text-secondary);
		display: inline-flex;
		font-size: 0.85rem;
		font-weight: 700;
		gap: 0.4rem;
		padding: 0 0.3rem;
		text-decoration: none;

		&:hover {
			color: var(--text-primary);
		}
	}
</style>
