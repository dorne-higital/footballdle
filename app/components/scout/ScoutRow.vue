<template>
	<div class="scout-row">
		<div class="cell name-cell">{{ result.name }}</div>
		<div :class="['cell', 'chip', result.club.state]">{{ result.club.value }}</div>
		<div :class="['cell', 'chip', result.nationality.state]">{{ result.nationality.value }}</div>
		<div :class="['cell', 'chip', result.position.state]">{{ result.position.value }}</div>
	</div>
</template>

<script setup lang="ts">
	import type { ScoutGuessResult } from '../../stores/scoutReport'

	defineProps<{
		result: ScoutGuessResult
	}>()
</script>

<style scoped lang="scss">
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
</style>
