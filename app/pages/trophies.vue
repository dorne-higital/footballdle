<template>
	<div class="trophies">
		<section
			class="summary-card"
			aria-label="Achievement progress"
		>
			<div class="summary-numbers">
				<p class="summary-headline">{{ earnedCount }}/{{ ACHIEVEMENTS.length }} unlocked</p>
				<p class="summary-points">{{ earnedPoints }} / {{ TOTAL_ACHIEVEMENT_POINTS }} points</p>
			</div>
			<div
				class="bar"
				role="progressbar"
				:aria-valuenow="earnedCount"
				aria-valuemin="0"
				:aria-valuemax="ACHIEVEMENTS.length"
			>
				<span :style="{ width: `${(earnedCount / ACHIEVEMENTS.length) * 100}%` }"></span>
			</div>
			<p
				v-if="earnedCount === ACHIEVEMENTS.length"
				class="summary-done"
			>
				You've unlocked every trophy.
			</p>
		</section>

		<!-- Something to aim for first, then what's been won, then the rest by mode -->
		<section
			v-if="shelves.nearly.length"
			class="group"
		>
			<h2>{{ shelves.nearlyIsStart ? 'Where to start' : 'Nearly there' }}</h2>
			<ul>
				<TrophyRow
					v-for="item in shelves.nearly"
					:key="item.id"
					:item="item"
				/>
			</ul>
		</section>

		<section
			v-if="shelves.unlocked.length"
			class="shelf"
			aria-label="Unlocked trophies"
		>
			<h2>
				Unlocked
				<span>{{ shelves.unlocked.length }}</span>
			</h2>
			<ul>
				<li
					v-for="item in shelves.unlocked"
					:key="item.id"
					:aria-label="`${item.title}, ${item.points} points. ${item.earnedText}`"
				>
					<div aria-hidden="true">
						<img
							:src="`/achievements/${item.id}.jpg`"
							alt=""
							width="56"
							height="56"
							loading="lazy"
						/>
						<p>{{ item.title }}</p>
					</div>
				</li>
			</ul>
		</section>

		<section
			v-if="gameCenter.isAvailable"
			class="gc-card"
			aria-label="Game Center"
		>
			<p class="gc-status">
				<Icon
					:name="gameCenter.isAuthenticated.value ? 'solar:check-circle-bold' : 'solar:danger-circle-linear'"
					size="1rem"
				/>
				{{
					gameCenter.isAuthenticated.value
						? 'Signed in to Game Center'
						: 'Not signed in to Game Center. Your trophies still count here.'
				}}
			</p>
			<div class="gc-buttons">
				<button
					type="button"
					@click="gameCenter.showLeaderboards()"
				>
					<Icon
						name="solar:cup-star-linear"
						size="1.1rem"
					/>
					Leaderboards
				</button>
				<button
					type="button"
					@click="gameCenter.showAchievements()"
				>
					<Icon
						name="solar:medal-ribbons-star-linear"
						size="1.1rem"
					/>
					Game Center
				</button>
			</div>
		</section>

		<template
			v-for="group in shelves.groups"
			:key="group.title"
		>
			<section
				v-if="group.items.length"
				class="group"
			>
				<h2>
					{{ group.title }}
					<span>{{ group.earned }}/{{ group.total }}</span>
				</h2>
				<ul>
					<TrophyRow
						v-for="item in group.items"
						:key="item.id"
						:item="item"
					/>
				</ul>
			</section>
		</template>
	</div>
</template>

<script setup lang="ts">
	import { trackScreen } from '../utils/appGlance'
	import { computed, onMounted } from 'vue'
	import { useModeStatsStore } from '../stores/modeStats'
	import { useGameCenter } from '../composables/useGameCenter'
	import {
		ACHIEVEMENTS,
		TOTAL_ACHIEVEMENT_POINTS,
		achievementProgress,
		buildAchievementContext,
		trophyShelves,
	} from '../utils/achievements'
	import TrophyRow from '../components/app/TrophyRow.vue'

	// iOS app only: the website has no Game Center
	if (!useRuntimeConfig().public.appShell) await navigateTo('/', { replace: true })

	useHead({ title: 'Trophies' })

	const daily = useModeStatsStore('daily')
	const scout = useModeStatsStore('scout')
	const spotball = useModeStatsStore('spotball')
	const challenge = useModeStatsStore('challenge')
	const gameCenter = useGameCenter()

	onMounted(() => {
		trackScreen('trophies')
		for (const store of [daily, scout, spotball, challenge]) store.loadStats()
	})

	const progress = computed(() => {
		const ctx = buildAchievementContext({
			daily: daily.stats,
			scout: scout.stats,
			spot: spotball.stats,
			challenge: challenge.stats,
		})
		return achievementProgress(ctx)
	})

	const shelves = computed(() => trophyShelves(progress.value))

	const earned = computed(() => ACHIEVEMENTS.filter((a) => (progress.value[a.id] ?? 0) >= 100))
	const earnedCount = computed(() => earned.value.length)
	const earnedPoints = computed(() => earned.value.reduce((sum, a) => sum + a.points, 0))
</script>

<style scoped lang="scss">
	.trophies {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 0 auto;
		max-width: 32rem;
		padding: 0.75rem 1rem calc(env(safe-area-inset-bottom) + 2rem);
	}

	.summary-card,
	.gc-card,
	.group ul,
	.shelf ul {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.25rem;
	}

	.summary-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.1rem;
	}

	.summary-numbers {
		align-items: baseline;
		display: flex;
		justify-content: space-between;
	}

	.summary-headline {
		font-family: var(--font-display);
		font-size: 1.4rem;
		margin: 0;
	}

	.summary-points {
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-variant-numeric: tabular-nums;
		margin: 0;
	}

	.bar {
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
		border-radius: 999px;
		height: 0.6rem;
		overflow: hidden;

		span {
			background: var(--pitchcard-accent-win);
			border-radius: inherit;
			display: block;
			height: 100%;
		}
	}

	.gc-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
	}

	.gc-status {
		align-items: center;
		color: var(--text-secondary);
		display: flex;
		font-size: 0.85rem;
		gap: 0.4rem;
		margin: 0;
	}

	.gc-buttons {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: 1fr 1fr;

		button {
			align-items: center;
			background: color-mix(in srgb, var(--pitchcard-accent-win) 14%, transparent);
			border: 0;
			border-radius: 0.9rem;
			color: var(--pitchcard-accent-win);
			cursor: pointer;
			display: flex;
			font: inherit;
			font-weight: 700;
			gap: 0.4rem;
			justify-content: center;
			padding: 0.75rem;

			&:active {
				transform: scale(0.97);
			}
		}
	}

	.summary-done {
		color: var(--tertiary-color);
		font-size: 0.9rem;
		font-weight: 700;
		margin: 0;
	}

	.group,
	.shelf {
		h2 {
			align-items: baseline;
			display: flex;
			font-family: var(--font-display);
			font-size: 1rem;
			justify-content: space-between;
			margin: 0.5rem 0.25rem 0.5rem;

			span {
				color: var(--text-secondary);
				font-family: inherit;
				font-size: 0.85rem;
			}
		}

		ul {
			list-style: none;
			margin: 0;
			padding: 0.25rem 0;
		}
	}

	// Won trophies as a badge grid, four across (no sideways scroller)
	.shelf ul {
		display: grid;
		gap: 0.75rem 0.25rem;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		list-style: none;
		margin: 0;
		padding: 0.9rem 0.5rem;

		div {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: 0.35rem;
		}

		img {
			border-radius: 50%;
			height: 3.5rem;
			width: 3.5rem;
		}

		p {
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			display: -webkit-box;
			font-size: 0.72rem;
			font-weight: 700;
			line-height: 1.2;
			margin: 0;
			overflow: hidden;
			text-align: center;
		}
	}
</style>
