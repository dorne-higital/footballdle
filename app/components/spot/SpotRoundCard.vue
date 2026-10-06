<template>
	<!-- iOS app: scouting card up top, quiz-style answers at the bottom -->
	<div
		v-if="$config.public.isApp"
		class="spot-round-card app-round"
	>
		<section class="scout-card">
			<div class="card-top">
				<div class="round-info">
					<span class="round-label">Round {{ roundNumber }} of {{ totalRounds }}</span>
					<span class="score">Score {{ score }}</span>
				</div>
				<div
					:class="['app-timer', { urgent: timeRemaining <= 3 }]"
					role="timer"
					:aria-label="`${secondsLeft} seconds left`"
				>
					<svg
						viewBox="0 0 120 120"
						aria-hidden="true"
					>
						<circle
							class="ring-track"
							cx="60"
							cy="60"
							r="52"
						/>
						<circle
							class="ring-arc"
							cx="60"
							cy="60"
							r="52"
							:stroke-dasharray="`${timerArc} ${RING_LENGTH}`"
							transform="rotate(-90 60 60)"
						/>
					</svg>
					<span class="seconds">{{ secondsLeft }}</span>
				</div>
			</div>

			<div
				class="mystery"
				aria-hidden="true"
			>
				<Icon
					name="solar:user-bold"
					class="silhouette"
				/>
				<span class="question">?</span>
			</div>

			<h2 class="who">Who's this player?</h2>

			<div class="stats">
				<div
					v-for="stat in stats"
					:key="stat.label"
					class="stat"
				>
					<Icon
						:name="stat.icon"
						size="1.1rem"
					/>
					<span class="stat-label">{{ stat.label }}</span>
					<span class="stat-value">{{ stat.value }}</span>
				</div>
			</div>
		</section>

		<div class="answers">
			<button
				v-for="(option, i) in round.options"
				:key="option.name"
				type="button"
				:class="['answer', optionState(option.name)]"
				:disabled="revealState !== 'idle'"
				@click="$emit('pick', option.name)"
			>
				<span class="letter">{{ 'ABCD'[i] }}</span>
				<span class="answer-name">{{ option.name }}</span>
				<Icon
					v-if="optionState(option.name) === 'correct'"
					name="solar:check-circle-bold"
					size="1.3rem"
				/>
				<Icon
					v-else-if="optionState(option.name) === 'wrong'"
					name="solar:close-circle-bold"
					size="1.3rem"
				/>
			</button>
		</div>
	</div>

	<div
		v-else
		class="spot-round-card"
	>
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
	import { computed } from 'vue'
	import type { SpotRound } from '../../composables/useSpotFootballers'

	const props = withDefaults(
		defineProps<{
			round: SpotRound
			revealState: 'idle' | 'correct' | 'wrong'
			timeRemaining: number
			roundTime: number
			pickedName?: string | null
			roundNumber?: number
			totalRounds?: number
			score?: number
		}>(),
		{
			pickedName: null,
			roundNumber: 1,
			totalRounds: 10,
			score: 0,
		},
	)

	defineEmits<{ pick: [name: string] }>()

	// iOS app countdown ring
	const RING_LENGTH = 2 * Math.PI * 52
	const timerArc = computed(() => RING_LENGTH * Math.max(0, props.timeRemaining / props.roundTime))
	const secondsLeft = computed(() => Math.max(0, Math.ceil(props.timeRemaining)))

	const stats = computed(() => [
		{ label: 'Club', value: props.round.target.club, icon: 'solar:shield-linear' },
		{ label: 'Nation', value: props.round.target.nationality, icon: 'solar:earth-linear' },
		{ label: 'Position', value: props.round.target.position, icon: 'solar:user-linear' },
	])

	function optionState(name: string) {
		if (props.revealState === 'idle') return ''
		if (name === props.round.target.name) return 'correct'
		if (props.revealState === 'wrong' && name === props.pickedName) return 'wrong'
		return 'faded'
	}
</script>

<style scoped lang="scss">
	.app-round {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;
		width: 100%;

		.scout-card {
			background:
				radial-gradient(ellipse 90% 60% at 50% 0%, color-mix(in srgb, var(--color-success) 14%, transparent), transparent 70%),
				var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 1.4rem;
			display: flex;
			flex-direction: column;
			flex: 1;
			gap: 0.85rem;
			min-height: 0;
			padding: 1rem;
		}

		.mystery {
			align-items: center;
			align-self: center;
			aspect-ratio: 1;
			background:
				radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--color-success) 22%, transparent), transparent 70%),
				color-mix(in srgb, var(--text-primary) 5%, transparent);
			border: 2px solid color-mix(in srgb, var(--color-success) 35%, transparent);
			border-radius: 50%;
			display: flex;
			flex: 1 1 auto;
			justify-content: center;
			max-height: 9rem;
			min-height: 4rem;
			overflow: hidden;
			position: relative;

			.silhouette {
				color: color-mix(in srgb, var(--text-primary) 18%, transparent);
				height: 78%;
				margin-top: 22%;
				width: 78%;
			}

			.question {
				color: var(--color-success);
				font-family: var(--font-display);
				font-size: 2.2rem;
				position: absolute;
				top: 18%;
			}
		}

		.card-top {
			align-items: center;
			display: flex;
			justify-content: space-between;
		}

		.round-info {
			display: flex;
			flex-direction: column;
			gap: 0.15rem;
			text-align: left;
		}

		.round-label {
			color: var(--color-success);
			font-size: 0.7rem;
			font-weight: 800;
			letter-spacing: 0.12em;
			text-transform: uppercase;
		}

		.score {
			color: var(--text-secondary);
			font-size: 0.85rem;
			font-variant-numeric: tabular-nums;
			font-weight: 700;
		}

		.app-timer {
			display: grid;
			flex-shrink: 0;
			height: 3.6rem;
			place-items: center;
			width: 3.6rem;

			svg {
				grid-area: 1 / 1;
				height: 100%;
				width: 100%;
			}

			.ring-track {
				fill: none;
				stroke: color-mix(in srgb, var(--color-success) 16%, transparent);
				stroke-width: 12;
			}

			.ring-arc {
				fill: none;
				stroke: var(--color-success);
				stroke-linecap: round;
				stroke-width: 12;
				transition:
					stroke-dasharray 1s linear,
					stroke 0.2s ease;
			}

			.seconds {
				font-family: var(--font-display);
				font-size: 1.35rem;
				font-variant-numeric: tabular-nums;
				grid-area: 1 / 1;
				line-height: 1;
			}

			&.urgent {
				animation: pulse 0.5s ease-in-out infinite alternate;

				.ring-arc {
					stroke: var(--pitchcard-accent-loss);
				}

				.seconds {
					color: var(--pitchcard-accent-loss);
				}
			}
		}

		.who {
			font-family: var(--font-display);
			font-size: 1.5rem;
			font-weight: 400;
			line-height: 1.1;
			margin: 0;
			text-align: center;
		}

		.stats {
			display: grid;
			gap: 0.45rem;
			grid-template-columns: 1.3fr 1fr 1fr;
		}

		.stat {
			background: color-mix(in srgb, var(--text-primary) 7%, transparent);
			border-radius: 0.9rem;
			display: flex;
			flex-direction: column;
			gap: 0.15rem;
			min-width: 0;
			padding: 0.6rem;
			text-align: left;

			.iconify {
				color: var(--color-success);
				margin-bottom: 0.15rem;
			}
		}

		.stat-label {
			color: var(--text-secondary);
			font-size: 0.6rem;
			font-weight: 800;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}

		.stat-value {
			display: -webkit-box;
			font-size: 0.85rem;
			font-weight: 700;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			line-height: 1.15;
			overflow: hidden;
			-webkit-box-orient: vertical;
		}

		.answers {
			display: flex;
			flex-direction: column;
			flex-shrink: 0;
			gap: 0.55rem;
		}

		.answer {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 1.1rem;
			color: var(--text-primary);
			cursor: pointer;
			display: flex;
			font: inherit;
			gap: 0.75rem;
			min-height: 3.5rem;
			padding: 0.5rem 1rem 0.5rem 0.6rem;
			text-align: left;
			transition:
				background 0.15s ease,
				border-color 0.15s ease,
				opacity 0.2s ease,
				transform 0.1s ease;

			&:active:not(:disabled) {
				transform: scale(0.98);
			}

			&:disabled {
				cursor: default;
			}

			.letter {
				align-items: center;
				background: color-mix(in srgb, var(--text-primary) 9%, transparent);
				border-radius: 0.7rem;
				color: var(--text-secondary);
				display: flex;
				flex-shrink: 0;
				font-size: 0.8rem;
				font-weight: 800;
				height: 2.3rem;
				justify-content: center;
				width: 2.3rem;
			}

			.answer-name {
				flex: 1;
				font-family: var(--font-display);
				font-size: 1.05rem;
				min-width: 0;
				text-transform: capitalize;
			}

			&.correct {
				background: var(--color-success);
				border-color: var(--color-success);
				color: #06140d;

				.letter {
					background: rgb(0 0 0 / 12%);
					color: inherit;
				}
			}

			&.wrong {
				background: var(--pitchcard-accent-loss);
				border-color: var(--pitchcard-accent-loss);
				color: #2a0a07;

				.letter {
					background: rgb(0 0 0 / 12%);
					color: inherit;
				}
			}

			&.faded {
				opacity: 0.45;
			}
		}
	}

	// Short screens (iPhone SE and friends): drop the silhouette and tighten up
	@media (max-height: 760px) {
		.app-round {
			gap: 0.6rem;

			.scout-card {
				flex: 0 0 auto;
				gap: 0.6rem;
				padding: 0.75rem;
			}

			.mystery,
			.stat .iconify {
				display: none;
			}

			.app-timer {
				height: 3rem;
				width: 3rem;
			}

			.who {
				font-size: 1.2rem;
			}

			.stat {
				padding: 0.45rem 0.55rem;
			}

			.answers {
				gap: 0.45rem;
				margin-top: auto;
			}

			.answer {
				min-height: 3rem;

				.letter {
					height: 2rem;
					width: 2rem;
				}
			}
		}
	}

	@keyframes pulse {
		from {
			transform: scale(1);
		}

		to {
			transform: scale(1.08);
		}
	}

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
				color: var(--on-success, #fff);
			}

			&.wrong {
				background: var(--pitchcard-accent-loss);
				border-color: var(--pitchcard-accent-loss);
				color: #fff;
			}
		}
	}
</style>
