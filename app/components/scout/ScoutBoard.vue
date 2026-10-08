<template>
	<div class="scout-board">
		<div
			v-if="results.length && !$config.public.isApp"
			class="board-header"
		>
			<span>Player</span>
			<span>Club</span>
			<span>Nation</span>
			<span>Position</span>
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
			<!-- iOS app: slim placeholders for the guesses still to come -->
			<template v-if="$config.public.isApp && !gameOver">
				<div
					v-for="n in maxGuesses - results.length"
					:key="`empty-${n}`"
					class="empty-card"
					aria-hidden="true"
				>
					<span class="guess-number">{{ results.length + n }}</span>
					{{ n === 1 ? 'Search for a player below' : `Guess ${results.length + n}` }}
				</div>
			</template>
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

		<div
			v-if="$config.public.isApp"
			class="app-footer"
		>
			<div
				class="guess-dots"
				:aria-label="`${maxGuesses - results.length} guesses left`"
			>
				<span
					v-for="n in maxGuesses"
					:key="n"
					:class="{ used: n <= results.length }"
				></span>
			</div>
			<p class="legend"><i class="amber"></i> Same continent</p>
		</div>
		<p
			v-else
			class="guesses-left"
		>
			{{ maxGuesses - results.length }} guesses left
		</p>
	</div>
</template>

<script setup lang="ts">
	import { nextTick, ref, watch } from 'vue'
	import ScoutRow from './ScoutRow.vue'
	import ScoutAutocomplete from './ScoutAutocomplete.vue'
	import type { ScoutGuessResult } from '../../stores/scoutReport'

	const props = defineProps<{
		results: ScoutGuessResult[]
		maxGuesses: number
		gameOver: boolean
		errorMessage?: string
	}>()

	defineEmits<{ guess: [name: string] }>()

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

		.empty-row {
			display: grid;
			gap: 0.4rem;
			grid-template-columns: 1.1fr 1fr 1fr 1fr;
			margin-bottom: 0.4rem;

			span {
				border: 1.5px dashed var(--border);
				border-radius: calc(var(--global-border-radius) - 4px);
				min-height: 2.6rem;
			}
		}

		.empty-card {
			align-items: center;
			border: 1px dashed var(--border);
			border-radius: 1.1rem;
			color: var(--text-secondary);
			display: flex;
			flex-shrink: 0;
			font-size: 0.8rem;
			gap: 0.5rem;
			min-height: 2.75rem;
			padding: 0 0.75rem;

			.guess-number {
				align-items: center;
				border: 1px solid var(--border);
				border-radius: 50%;
				display: flex;
				font-size: 0.7rem;
				font-weight: 800;
				height: 1.35rem;
				justify-content: center;
				width: 1.35rem;
			}
		}

		.app-footer {
			align-items: center;
			display: flex;
			justify-content: space-between;
			margin-top: 0.6rem;
			padding: 0 0.25rem;
		}

		.guess-dots {
			display: flex;
			gap: 0.3rem;

			span {
				background: var(--pitchcard-accent-win, var(--color-success));
				border-radius: 50%;
				height: 0.5rem;
				width: 0.5rem;

				&.used {
					background: color-mix(in srgb, var(--text-primary) 18%, transparent);
				}
			}
		}

		.legend {
			align-items: center;
			color: var(--text-secondary);
			display: flex;
			font-size: 0.7rem;
			gap: 0.35rem;
			margin: 0;

			.amber {
				background: var(--color-present);
				border-radius: 0.2rem;
				display: inline-block;
				height: 0.6rem;
				width: 0.6rem;
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
