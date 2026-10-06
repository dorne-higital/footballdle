<template>
	<!-- iOS app: a card per guess, with labelled attribute tiles -->
	<div
		v-if="$config.public.isApp"
		:class="['scout-card', { solved }]"
	>
		<div class="card-head">
			<span class="guess-number">{{ index + 1 }}</span>
			<span class="card-name">{{ result.name }}</span>
			<Icon
				v-if="solved"
				name="solar:check-circle-bold"
				size="1.1rem"
				class="solved-icon"
			/>
		</div>
		<div class="attrs">
			<div
				v-for="attr in attrs"
				:key="attr.label"
				:class="['attr', attr.state]"
			>
				<span class="attr-label">{{ attr.label }}</span>
				<span class="attr-value">{{ attr.value }}</span>
			</div>
		</div>
	</div>

	<div
		v-else
		class="scout-row"
	>
		<div class="cell name-cell">{{ result.name }}</div>
		<div :class="['cell', 'chip', result.club.state]">{{ result.club.value }}</div>
		<div :class="['cell', 'chip', result.nationality.state]">{{ result.nationality.value }}</div>
		<div :class="['cell', 'chip', result.position.state]">{{ result.position.value }}</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import type { ScoutGuessResult } from '../../stores/scoutReport'

	const props = withDefaults(
		defineProps<{
			result: ScoutGuessResult
			index?: number
		}>(),
		{ index: 0 },
	)

	const attrs = computed(() => [
		{ label: 'Club', ...props.result.club },
		{ label: 'Nation', ...props.result.nationality },
		{ label: 'Position', ...props.result.position },
	])

	const solved = computed(() => attrs.value.every(a => a.state === 'correct'))
</script>

<style scoped lang="scss">
	.scout-card {
		animation: card-in 0.35s ease-out;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.1rem;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		gap: 0.5rem;
		padding: 0.6rem;

		&.solved {
			border-color: color-mix(in srgb, var(--color-success) 60%, transparent);
		}

		.card-head {
			align-items: center;
			display: flex;
			gap: 0.5rem;
			padding: 0 0.15rem;
		}

		.guess-number {
			align-items: center;
			background: color-mix(in srgb, var(--text-primary) 10%, transparent);
			border-radius: 50%;
			color: var(--text-secondary);
			display: flex;
			flex-shrink: 0;
			font-size: 0.7rem;
			font-variant-numeric: tabular-nums;
			font-weight: 800;
			height: 1.35rem;
			justify-content: center;
			width: 1.35rem;
		}

		.card-name {
			flex: 1;
			font-family: var(--font-display);
			font-size: 0.95rem;
			min-width: 0;
			overflow: hidden;
			text-align: left;
			text-overflow: ellipsis;
			text-transform: capitalize;
			white-space: nowrap;
		}

		.solved-icon {
			color: var(--color-success);
		}

		.attrs {
			display: grid;
			gap: 0.35rem;
			grid-template-columns: 1.25fr 1fr 1fr;
		}

		.attr {
			animation: chip-reveal 0.45s ease-in-out both;
			border-radius: 0.75rem;
			color: #fff;
			display: flex;
			flex-direction: column;
			gap: 0.1rem;
			justify-content: center;
			min-height: 2.9rem;
			min-width: 0;
			padding: 0.35rem 0.5rem;

			&:nth-child(2) {
				animation-delay: 0.08s;
			}

			&:nth-child(3) {
				animation-delay: 0.16s;
			}

			&.correct {
				background: var(--color-success);
				color: #06140d;
			}

			&.present {
				background: var(--color-present);
				color: #1d1403;
			}

			&.absent {
				background: color-mix(in srgb, var(--text-primary) 9%, transparent);
			}
		}

		.attr-label {
			font-size: 0.6rem;
			font-weight: 800;
			letter-spacing: 0.08em;
			opacity: 0.7;
			text-transform: uppercase;
		}

		.attr-value {
			display: -webkit-box;
			font-size: 0.8rem;
			font-weight: 700;
			hyphens: none;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			line-height: 1.15;
			overflow: hidden;
			overflow-wrap: normal;
			-webkit-box-orient: vertical;
		}
	}

	.scout-row {
		display: grid;
		gap: 0.4rem;
		grid-template-columns: 1.1fr 1fr 1fr 1fr;
		margin-bottom: 0.4rem;

		.cell {
			align-items: center;
			border-radius: calc(var(--global-border-radius) - 4px);
			display: flex;
			font-size: 0.72rem;
			font-weight: 600;
			justify-content: center;
			line-height: 1.2;
			min-height: 2.6rem;
			padding: 0.35rem 0.4rem;
			text-align: center;
			word-break: break-word;
		}

		.name-cell {
			background: var(--bg-secondary);
			border: 2px solid var(--text-primary);
			color: var(--text-primary);
			font-family: var(--font-display);
			font-weight: 700;
			text-transform: capitalize;
		}

		.chip {
			animation: chip-reveal 0.45s ease-in-out forwards;
			color: #fff;

			&.correct {
				background: var(--color-success);
			}

			&.present {
				background: var(--color-present);
			}

			&.absent {
				background: var(--color-absent);
			}
		}
	}

	@keyframes chip-reveal {
		0% {
			opacity: 0;
			transform: scale(0.9) translateY(-4px);
		}

		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@keyframes card-in {
		0% {
			opacity: 0;
			transform: translateY(6px);
		}

		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
