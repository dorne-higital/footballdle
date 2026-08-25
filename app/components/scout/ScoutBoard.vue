<template>
	<div class="scout-board">
		<div
			v-if="results.length"
			class="board-header"
		>
			<span>Player</span>
			<span>Club</span>
			<span>Nation</span>
			<span>Position</span>
		</div>

		<div class="rows">
			<ScoutRow
				v-for="(result, i) in results"
				:key="i"
				:result="result"
			/>
		</div>

		<p
			v-if="errorMessage"
			class="error-toast"
		>
			{{ errorMessage }}
		</p>

		<ScoutAutocomplete
			:disabled="gameOver"
			@guess="$emit('guess', $event)"
		/>

		<p class="guesses-left">{{ maxGuesses - results.length }} guesses left</p>
	</div>
</template>

<script setup lang="ts">
	import ScoutRow from './ScoutRow.vue'
	import ScoutAutocomplete from './ScoutAutocomplete.vue'
	import type { ScoutGuessResult } from '../../stores/scoutReport'

	defineProps<{
		results: ScoutGuessResult[]
		maxGuesses: number
		gameOver: boolean
		errorMessage?: string
	}>()

	defineEmits<{ guess: [name: string] }>()
</script>

<style scoped lang="scss">
	.scout-board {
		display: flex;
		flex-direction: column;
		width: 100%;

		.board-header {
			display: grid;
			gap: 0.4rem;
			grid-template-columns: 1.1fr 1fr 1fr 1fr;
			margin-bottom: 0.5rem;

			span {
				color: var(--text-secondary);
				font-family: var(--font-display);
				font-size: 0.66rem;
				font-weight: 700;
				letter-spacing: 0.08em;
				text-align: center;
				text-transform: uppercase;
			}
		}

		.rows {
			margin-bottom: 0.75rem;
			max-height: 42vh;
			overflow-y: auto;
		}

		.error-toast {
			background: var(--text-primary);
			border-radius: var(--global-border-radius);
			color: var(--bg-secondary);
			font-size: 0.82rem;
			font-weight: 600;
			margin: 0 0 0.6rem;
			padding: 0.45rem 0.9rem;
			text-align: center;
		}

		.guesses-left {
			color: var(--text-secondary);
			font-family: var(--font-mono);
			font-size: 0.75rem;
			margin: 0.5rem 0 0;
			text-align: center;
		}
	}
</style>
