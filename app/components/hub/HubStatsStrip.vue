<template>
	<div
		v-if="totalGames > 0"
		class="hub-stats-strip"
	>
		<div class="stat-block">
			<span class="value">{{ totalGames }}</span>
			<span class="label">Total games</span>
		</div>
		<div class="stat-block">
			<span class="value">{{ combinedWinRate }}%</span>
			<span class="label">Combined win rate</span>
		</div>
		<div
			v-if="bestStreak"
			class="stat-block"
		>
			<span class="value">
				<Icon
					name="solar:fire-bold"
					size="1.1rem"
				/>
				{{ bestStreak.streak }}
			</span>
			<span class="label">{{ bestStreak.label }} streak</span>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'

	interface ModeSummary {
		label: string
		gamesPlayed: number
		wins: number
		currentStreak: number
	}

	const props = defineProps<{
		modes: ModeSummary[]
	}>()

	const totalGames = computed(() => props.modes.reduce((sum, m) => sum + m.gamesPlayed, 0))
	const totalWins = computed(() => props.modes.reduce((sum, m) => sum + m.wins, 0))
	const combinedWinRate = computed(() =>
		totalGames.value > 0 ? Math.round((totalWins.value / totalGames.value) * 100) : 0,
	)

	const bestStreak = computed(() => {
		const withStreak = props.modes.filter((m) => m.currentStreak > 0)
		if (!withStreak.length) return null
		return withStreak.reduce((best, m) => (m.currentStreak > best.currentStreak ? m : best))
	})
</script>

<style scoped lang="scss">
	.hub-stats-strip {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		display: flex;
		margin: 1.25rem auto 0;
		max-width: 960px;
		width: 100%;

		.stat-block {
			border-right: 1px solid var(--border);
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: 0.25rem;
			padding: 1rem 1.25rem;
			text-align: center;

			&:last-child {
				border-right: none;
			}

			.value {
				align-items: center;
				color: var(--text-primary);
				display: flex;
				font-family: var(--font-mono);
				font-size: 1.4rem;
				font-weight: 700;
				gap: 0.3rem;
				justify-content: center;

				.iconify {
					color: var(--tertiary-color);
				}
			}

			.label {
				color: var(--text-secondary);
				font-family: var(--font-display);
				font-size: 0.68rem;
				font-weight: 700;
				letter-spacing: 0.08em;
				text-transform: uppercase;
			}
		}

		@media (width <= 600px) {
			flex-direction: column;

			.stat-block {
				border-bottom: 1px solid var(--border);
				border-right: none;

				&:last-child {
					border-bottom: none;
				}
			}
		}
	}
</style>
