<template>
	<div class="spot-round-card">
		<div class="timer-track">
			<div
				class="timer-fill"
				:class="{ urgent: timeRemaining <= 3 }"
				:style="{ width: `${(timeRemaining / roundTime) * 100}%` }"
			/>
		</div>

		<p class="prompt">Who is this?</p>

		<div class="clue-chips">
			<span class="chip">
				<Icon
					name="solar:shield-linear"
					size="0.85rem"
				/>
				{{ round.target.club }}
			</span>
			<span class="chip">
				<Icon
					name="solar:earth-linear"
					size="0.85rem"
				/>
				{{ round.target.nationality }}
			</span>
			<span class="chip">
				<Icon
					name="solar:user-linear"
					size="0.85rem"
				/>
				{{ round.target.position }}
			</span>
		</div>

		<div class="options-grid">
			<button
				v-for="option in round.options"
				:key="option.name"
				type="button"
				class="option-btn"
				:class="{
					correct: revealState !== 'idle' && option.name === round.target.name,
					wrong: revealState === 'wrong' && option.name === pickedName,
				}"
				:disabled="revealState !== 'idle'"
				@click="$emit('pick', option.name)"
			>
				{{ option.name }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { SpotRound } from '../../composables/useSpotFootballers'

	withDefaults(
		defineProps<{
			round: SpotRound
			revealState: 'idle' | 'correct' | 'wrong'
			timeRemaining: number
			roundTime: number
			pickedName?: string | null
		}>(),
		{
			pickedName: null,
		},
	)

	defineEmits<{ pick: [name: string] }>()
</script>

<style scoped lang="scss">
	.spot-round-card {
		display: flex;
		flex-direction: column;
		width: 100%;

		.timer-track {
			background: var(--turf-base);
			border-radius: 999px;
			height: 6px;
			margin-bottom: 0.9rem;
			overflow: hidden;
			width: 100%;

			.timer-fill {
				background: var(--primary-color);
				border-radius: 999px;
				height: 100%;
				transition: width 1s linear, background 0.2s ease;

				&.urgent {
					background: var(--pitchcard-accent-loss);
				}
			}
		}

		.prompt {
			color: var(--text-secondary);
			font-family: var(--font-display);
			font-size: 0.72rem;
			font-weight: 700;
			letter-spacing: 0.1em;
			margin: 0 0 0.6rem;
			text-align: center;
			text-transform: uppercase;
		}

		.clue-chips {
			display: flex;
			flex-wrap: wrap;
			gap: 0.4rem;
			justify-content: center;
			margin-bottom: 1.1rem;

			.chip {
				align-items: center;
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: 999px;
				color: var(--text-primary);
				display: inline-flex;
				font-size: 0.78rem;
				font-weight: 600;
				gap: 0.35rem;
				padding: 0.4rem 0.75rem;

				.iconify {
					color: var(--primary-color);
					flex-shrink: 0;
				}
			}
		}

		.options-grid {
			display: grid;
			gap: 0.6rem;
			grid-template-columns: repeat(2, 1fr);
		}

		.option-btn {
			background: var(--bg-secondary);
			border: 2px solid var(--border);
			border-radius: calc(var(--global-border-radius) - 2px);
			color: var(--text-primary);
			cursor: pointer;
			font-family: var(--font-display);
			font-size: 0.95rem;
			font-weight: 700;
			padding: 0.9rem 0.6rem;
			text-align: center;
			text-transform: capitalize;
			transition: all 0.15s ease;

			&:hover:not(:disabled) {
				border-color: var(--border-hover);
				transform: translateY(-1px);
			}

			&:disabled {
				cursor: default;
			}

			&.correct {
				background: var(--color-success);
				border-color: var(--color-success);
				color: #fff;
			}

			&.wrong {
				background: var(--pitchcard-accent-loss);
				border-color: var(--pitchcard-accent-loss);
				color: #fff;
			}
		}
	}
</style>
