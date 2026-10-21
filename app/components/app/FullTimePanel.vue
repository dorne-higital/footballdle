<template>
	<section
		class="full-time-panel"
		aria-label="Game finished"
	>
		<p class="ft-line">
			<span :class="['ft-badge', isWin ? 'win' : 'loss']">FT</span>
			{{ summary }}
		</p>
		<p
			v-if="countdown"
			class="ft-next"
		>
			New puzzles in <strong>{{ countdown }}</strong>
		</p>
		<div class="ft-actions">
			<button
				type="button"
				class="ft-btn primary"
				@click="$emit('result')"
			>
				<Icon
					name="solar:document-text-linear"
					size="1.1rem"
				/>
				See result
			</button>
			<NuxtLink
				:to="next.to"
				class="ft-btn"
			>
				<Icon
					:name="next.icon"
					size="1.1rem"
				/>
				{{ next.label }}
			</NuxtLink>
		</div>
	</section>
</template>

<script setup lang="ts">
	import { computed, onMounted } from 'vue'
	import { useTodayProgress } from '../../composables/useTodayProgress'
	import { useGridStore } from '../../stores/grid'

	// iOS app: shown under a finished game's board in place of the controls, so a
	// finished game opens on your own result rather than the website's intro page
	defineProps<{ summary: string; isWin: boolean; countdown?: string }>()
	defineEmits<{ result: [] }>()

	// What to play next: the next daily game not finished today, then this week's Grid
	// if any of it is left, otherwise back to the Matchday
	const progress = useTodayProgress()
	const grid = useGridStore()
	onMounted(() => {
		progress.refresh()
		grid.load()
	})
	const unfinished = (status: string) => status === 'new' || status === 'playing'
	const next = computed(() => {
		if (unfinished(progress.daily.value.status))
			return { label: 'Play the Daily', to: '/play/daily?start=play', icon: 'solar:calendar-linear' }
		if (unfinished(progress.scout.value.status))
			return { label: 'Play Scout Report', to: '/play/scout-report?start=play', icon: 'solar:magnifer-linear' }
		if (unfinished(progress.spot.value.status))
			return { label: 'Play Spot the Baller', to: '/play/spot-the-baller?start=play', icon: 'solar:eye-linear' }
		if (grid.ready && !grid.weekDone) return { label: 'Play The Grid', to: '/play/grid', icon: 'solar:widget-4-linear' }
		return { label: 'Back to Matchday', to: '/', icon: 'solar:home-2-linear' }
	})
</script>

<style scoped lang="scss">
	.full-time-panel {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.1rem;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		gap: 0.6rem;
		margin: 0.6rem 0.5rem 0;
		padding: 0.9rem 1rem;
		text-align: left;
	}

	.ft-line {
		align-items: center;
		display: flex;
		font-weight: 800;
		gap: 0.55rem;
		margin: 0;
	}

	.ft-badge {
		border-radius: 0.4rem;
		font-family: var(--font-display);
		font-size: 0.75rem;
		padding: 0.15rem 0.4rem;

		&.win {
			background: var(--color-success);
			color: var(--bg-primary);
		}

		&.loss {
			background: var(--color-absent);
			color: var(--text-primary);
		}
	}

	.ft-next {
		color: var(--text-secondary);
		font-size: 0.85rem;
		margin: 0;

		strong {
			color: var(--text-primary);
			font-variant-numeric: tabular-nums;
		}
	}

	.ft-actions {
		display: flex;
		gap: 0.5rem;
	}

	.ft-btn {
		align-items: center;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		flex: 1;
		font: inherit;
		font-size: 0.92rem;
		font-weight: 700;
		gap: 0.4rem;
		justify-content: center;
		min-height: 44px;
		text-decoration: none;

		&.primary {
			background: var(--primary-color);
			border-color: var(--primary-color);
			color: var(--bg-primary);
		}

		&:active {
			transform: scale(0.98);
		}
	}
</style>
