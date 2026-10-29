<template>
	<!-- iOS app (1.3): one line per guess, four marks (C N P £: square for right, round for close); the dossier holds the detail -->
	<div
		v-if="$config.public.appShell"
		:class="['scout-mini', { solved }]"
		role="group"
		:aria-label="spokenRow"
	>
		<span class="guess-number">{{ index + 1 }}</span>
		<span class="mini-name">{{ result.name }}</span>
		<span
			v-if="result.price"
			:class="['mini-price', result.price.state]"
			aria-hidden="true"
			>{{ result.price.value }}{{ result.price.arrow === 'up' ? ' ↑' : result.price.arrow === 'down' ? ' ↓' : '' }}</span
		>
		<span
			class="dots"
			aria-hidden="true"
		>
			<i
				v-for="attr in attrs"
				:key="attr.label"
				:class="attr.state"
				>{{ attr.short }}</i
			>
		</span>
	</div>

	<div
		v-else
		class="scout-row"
	>
		<div class="cell name-cell">{{ result.name }}</div>
		<div
			:class="['cell', 'chip', result.club.state]"
			:aria-label="`Club: ${result.club.value}, ${SPOKEN[result.club.state]}`"
		>
			{{ result.club.value }}
		</div>
		<div
			:class="['cell', 'chip', result.nationality.state]"
			:aria-label="`Nation: ${result.nationality.value}, ${SPOKEN[result.nationality.state]}`"
		>
			{{ result.nationality.value }}
		</div>
		<div
			:class="['cell', 'chip', result.position.state]"
			:aria-label="`Position: ${result.position.value}, ${SPOKEN[result.position.state]}`"
		>
			{{ result.position.value }}
		</div>
		<div
			:class="['cell', 'chip', result.price?.state ?? 'none']"
			:aria-label="result.price ? `Fantasy price: ${result.price.value}, ${SPOKEN[result.price.state]}${ARROW_SPOKEN[result.price.arrow ?? 'none']}` : 'Fantasy price unknown'"
		>
			{{ result.price ? `${result.price.value}${result.price.arrow === 'up' ? ' ↑' : result.price.arrow === 'down' ? ' ↓' : ''}` : '–' }}
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import type { AttributeState, ScoutGuessResult } from '../../stores/scoutReport'

	const props = withDefaults(
		defineProps<{
			result: ScoutGuessResult
			index?: number
		}>(),
		{ index: 0 },
	)

	const attrs = computed(() => [
		{ label: 'Club', short: 'C', ...props.result.club },
		{ label: 'Nation', short: 'N', ...props.result.nationality },
		{ label: 'Position', short: 'P', ...props.result.position },
		...(props.result.price ? [{ label: 'Fantasy price', short: '£', ...props.result.price }] : []),
	])

	// Club, nation and position decide it; the price just follows the player
	const solved = computed(() => attrs.value.slice(0, 3).every(a => a.state === 'correct'))

	const ARROW_SPOKEN = { up: ', target costs more', down: ', target costs less', none: '' } as const
	const spokenRow = computed(() => {
		const parts = attrs.value.map(a => `${a.label} ${a.value}, ${SPOKEN[a.state]}${a.label === 'Fantasy price' ? ARROW_SPOKEN[a.arrow ?? 'none'] : ''}`)
		return `Guess ${props.index + 1}: ${props.result.name}${solved.value ? ', solved' : ''}. ${parts.join('. ')}`
	})

	// VoiceOver: "Nation: France, close"
	const SPOKEN: Record<AttributeState, string> = { correct: 'right', present: 'close', absent: 'wrong' }
</script>

<style scoped lang="scss">
	.scout-mini {
		align-items: center;
		animation: card-in 0.35s ease-out;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.8rem;
		display: flex;
		flex-shrink: 0;
		gap: 0.5rem;
		min-height: 2.5rem;
		padding: 0.4rem 0.6rem;

		&.solved {
			border-color: color-mix(in srgb, var(--color-success) 60%, transparent);
		}

		.guess-number {
			align-items: center;
			background: color-mix(in srgb, var(--text-primary) 10%, transparent);
			border-radius: 50%;
			color: var(--text-secondary);
			display: flex;
			flex-shrink: 0;
			font-size: 0.68rem;
			font-variant-numeric: tabular-nums;
			font-weight: 800;
			height: 1.3rem;
			justify-content: center;
			width: 1.3rem;
		}

		.mini-name {
			flex: 1;
			font-size: 0.85rem;
			text-align: left;
			font-weight: 700;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			text-transform: capitalize;
			white-space: nowrap;
		}

		.mini-price {
			color: var(--text-secondary);
			flex-shrink: 0;
			font-size: 0.72rem;
			font-variant-numeric: tabular-nums;
			font-weight: 700;

			&.present {
				color: var(--color-present);
			}

			&.correct {
				color: var(--color-success);
			}
		}

		.dots {
			display: flex;
			flex-shrink: 0;
			gap: 0.2rem;

			i {
				align-items: center;
				animation: chip-reveal 0.45s ease-in-out both;
				background: color-mix(in srgb, var(--text-primary) 14%, transparent);
				border-radius: 0.25rem;
				color: var(--text-secondary);
				display: flex;
				font-size: 0.55rem;
				font-style: normal;
				font-weight: 800;
				height: 1rem;
				justify-content: center;
				line-height: 1;
				width: 1rem;

				&:nth-child(2) {
					animation-delay: 0.08s;
				}

				&:nth-child(3) {
					animation-delay: 0.16s;
				}

				&:nth-child(4) {
					animation-delay: 0.24s;
				}

				&.correct {
					background: var(--color-success);
					color: var(--on-success);
				}

				// Close is round, so it doesn't differ from right by colour alone
				&.present {
					background: var(--color-present);
					border-radius: 50%;
					color: var(--on-present);
				}
			}
		}
	}

	.scout-row {
		display: grid;
		gap: 0.4rem;
		grid-template-columns: 1.1fr 1fr 1fr 1fr 0.8fr;
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
				position: relative;

				// Close chips get the board's corner dot
				&::after {
					background: currentColor;
					border-radius: 50%;
					content: '';
					height: 0.3rem;
					position: absolute;
					right: 0.25rem;
					top: 0.25rem;
					width: 0.3rem;
				}
			}

			&.absent {
				background: var(--color-absent);
			}

			&.none {
				background: var(--bg-secondary);
				color: var(--text-secondary);
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
