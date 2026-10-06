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

		<section
			v-for="group in groups"
			:key="group.title"
			class="group"
		>
			<h2>
				{{ group.title }}
				<span>{{ group.earned }}/{{ group.items.length }}</span>
			</h2>
			<ul>
				<li
					v-for="item in group.items"
					:key="item.id"
					:class="['trophy', { earned: item.earned }]"
				>
					<div class="badge">
						<img
							v-if="!item.secret"
							:src="`/achievements/${item.id}.jpg`"
							alt=""
							width="56"
							height="56"
							loading="lazy"
						/>
						<Icon
							v-if="!item.earned"
							name="solar:lock-keyhole-minimalistic-bold"
							size="1.1rem"
							class="lock"
						/>
					</div>
					<div class="trophy-text">
						<p class="trophy-title">{{ item.secret ? 'Hidden trophy' : item.title }}</p>
						<p class="trophy-goal">
							{{ item.secret ? 'Keep playing to find out.' : item.earned ? item.earnedText : item.goal }}
						</p>
						<div
							v-if="!item.earned && item.percent > 0"
							class="bar small"
						>
							<span :style="{ width: `${item.percent}%` }"></span>
						</div>
					</div>
					<span class="points">{{ item.points }}</span>
				</li>
			</ul>
		</section>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted } from 'vue'
	import { useModeStatsStore } from '../stores/modeStats'
	import { useGameCenter } from '../composables/useGameCenter'
	import {
		ACHIEVEMENTS,
		ACHIEVEMENT_GROUPS,
		TOTAL_ACHIEVEMENT_POINTS,
		buildAchievementContext,
	} from '../utils/achievements'

	// iOS app only: the website has no Game Center
	if (!useRuntimeConfig().public.isApp) await navigateTo('/', { replace: true })

	useHead({ title: 'Trophies' })

	const daily = useModeStatsStore('daily')
	const scout = useModeStatsStore('scout')
	const spotball = useModeStatsStore('spotball')
	const challenge = useModeStatsStore('challenge')
	const gameCenter = useGameCenter()

	onMounted(() => {
		for (const store of [daily, scout, spotball, challenge]) store.loadStats()
	})

	const progress = computed(() => {
		const ctx = buildAchievementContext({
			daily: daily.stats,
			scout: scout.stats,
			spot: spotball.stats,
			challenge: challenge.stats,
		})
		return Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, Math.round(a.progress(ctx))]))
	})

	const groups = computed(() =>
		ACHIEVEMENT_GROUPS.map((group) => {
			const items = group.achievements.map((a) => {
				const percent = progress.value[a.id] ?? 0
				const earned = percent >= 100
				return {
					id: a.id,
					title: a.title,
					goal: a.goal,
					earnedText: a.earned,
					points: a.points,
					percent,
					earned,
					secret: !!a.hidden && !earned,
				}
			})
			return { title: group.title, items, earned: items.filter(i => i.earned).length }
		}),
	)

	const earned = computed(() => ACHIEVEMENTS.filter(a => (progress.value[a.id] ?? 0) >= 100))
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
	.group ul {
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

		&.small {
			height: 0.3rem;
			margin-top: 0.4rem;
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

	.group {
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

	.trophy {
		align-items: center;
		display: flex;
		gap: 0.85rem;
		padding: 0.65rem 1rem;

		& + .trophy {
			border-top: 1px solid var(--border);
		}

		.badge {
			align-items: center;
			background: color-mix(in srgb, var(--text-primary) 6%, transparent);
			border-radius: 50%;
			display: flex;
			flex-shrink: 0;
			height: 3.5rem;
			justify-content: center;
			position: relative;
			width: 3.5rem;

			img {
				border-radius: 50%;
				filter: grayscale(1) brightness(0.45);
				height: 100%;
				width: 100%;
			}

			.lock {
				color: var(--text-secondary);
				position: absolute;
			}
		}

		&.earned .badge img {
			filter: none;
		}

		.trophy-text {
			flex: 1;
			min-width: 0;
		}

		.trophy-title {
			font-weight: 800;
			margin: 0;
		}

		.trophy-goal {
			color: var(--text-secondary);
			font-size: 0.85rem;
			line-height: 1.3;
			margin: 0.1rem 0 0;
		}

		.points {
			color: var(--text-secondary);
			font-size: 0.85rem;
			font-variant-numeric: tabular-nums;
			font-weight: 700;
		}

		&.earned .points {
			color: var(--tertiary-color);
		}
	}
</style>
