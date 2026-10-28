<template>
	<div class="scout-board">
		<ScoutDossier
			v-if="$config.public.appShell"
			:brief="brief"
			:dossier="dossier"
			:guess-count="results.length"
			:max-guesses="maxGuesses"
			:game-over="gameOver"
			:explain-price="explainPrice && results.some(r => r.price)"
		/>
		<p
			v-else-if="brief"
			class="web-brief"
		>
			<b>Scout's brief:</b> “{{ brief.text }}”
		</p>
		<!-- iOS app: how many guesses are left and what close means, above the guesses -->
		<div
			v-if="$config.public.appShell && !gameOver"
			class="board-meta"
		>
			<p class="guesses-count">{{ guessesLeft }}</p>
			<p class="legend">
				<i
					class="close-mark"
					aria-hidden="true"
				></i>
				Close: same region, continent or line, within £1m
			</p>
		</div>
		<div
			v-if="results.length && !$config.public.appShell"
			class="board-header"
		>
			<span>Player</span>
			<span>Club</span>
			<span>Nation</span>
			<span>Position</span>
			<span>Price</span>
		</div>

		<div
			ref="rowsEl"
			class="rows"
		>
			<ScoutRow
				v-for="(result, i) in results"
				:key="i"
				:result="result"
				:index="i"
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

		<p
			v-if="!$config.public.appShell"
			class="guesses-left"
		>
			{{ maxGuesses - results.length }} guesses left
		</p>
	</div>
</template>

<script setup lang="ts">
	import { computed, nextTick, ref, watch } from 'vue'
	import ScoutRow from './ScoutRow.vue'
	import ScoutAutocomplete from './ScoutAutocomplete.vue'
	import ScoutDossier from './ScoutDossier.vue'
	import type { ScoutDossier as Dossier, ScoutGuessResult } from '../../stores/scoutReport'
	import type { ScoutBrief } from '../../utils/scoutClues'

	const props = defineProps<{
		results: ScoutGuessResult[]
		brief: ScoutBrief | null
		dossier: Dossier
		explainPrice?: boolean
		maxGuesses: number
		gameOver: boolean
		errorMessage?: string
	}>()

	defineEmits<{ guess: [name: string] }>()

	const guessesLeft = computed(() => {
		const n = props.maxGuesses - props.results.length
		return `${n} ${n === 1 ? 'guess' : 'guesses'} left`
	})

	// Keep the newest guess in view when the list is taller than the screen
	const rowsEl = ref<HTMLElement | null>(null)
	watch(
		() => props.results.length,
		async () => {
			await nextTick()
			const latest = rowsEl.value?.children[props.results.length - 1] as HTMLElement | undefined
			latest?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
		},
	)
</script>

<style scoped lang="scss">
	.scout-board {
		display: flex;
		flex-direction: column;
		width: 100%;

		.board-header {
			display: grid;
			gap: 0.4rem;
			grid-template-columns: 1.1fr 1fr 1fr 1fr 0.8fr;
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

		.board-meta {
			display: flex;
			flex-direction: column;
			gap: 0.15rem;
			margin: 0 0 0.5rem;
			padding: 0 0.25rem;
			text-align: left;
		}

		.guesses-count {
			color: var(--text-primary);
			font-size: 0.8125rem;
			font-variant-numeric: tabular-nums;
			font-weight: 700;
			margin: 0;
		}

		.legend {
			align-items: center;
			color: var(--text-secondary);
			display: flex;
			font-size: 0.8125rem;
			gap: 0.35rem;
			line-height: 1.3;
			margin: 0;
			text-wrap: balance;

			// Round, like the close marks on each guess
			.close-mark {
				background: var(--color-present);
				border-radius: 50%;
				display: inline-block;
				flex-shrink: 0;
				height: 0.75rem;
				width: 0.75rem;
			}
		}

		.web-brief {
			background: color-mix(in srgb, var(--color-present) 12%, var(--bg-secondary));
			border: 1px solid color-mix(in srgb, var(--color-present) 40%, var(--border));
			border-radius: var(--global-border-radius);
			font-size: 0.9rem;
			margin: 0 0 0.75rem;
			padding: 0.55rem 0.8rem;
			text-align: center;

			b {
				color: var(--color-present);
			}
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
