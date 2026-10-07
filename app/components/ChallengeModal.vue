<template>
	<div class="challenge-game">
		<!-- Navigation Header -->
		<div class="challenge-nav">
			<!-- Ring timer: drains over 45s, amber from 10s, red from 5s -->
			<div
				class="timer"
				:class="{ warning: timeRemaining <= 10, danger: timeRemaining <= 5 }"
				role="timer"
				:aria-label="`${timeRemaining} seconds left`"
			>
				<svg
					viewBox="0 0 44 44"
					aria-hidden="true"
				>
					<circle
						class="track"
						cx="22"
						cy="22"
						r="19"
					/>
					<circle
						class="fill"
						cx="22"
						cy="22"
						r="19"
						:style="{ strokeDashoffset: `${119.4 * (1 - Math.max(0, timeRemaining) / 45)}` }"
					/>
				</svg>
				<span>{{ Math.max(0, timeRemaining) }}</span>
			</div>

			<div class="session">
				<span class="session-label">This session</span>
				<strong>{{ sessionWins ?? 0 }} won</strong>
			</div>

			<div class="cta-buttons">
				<button
					v-if="!gameOver"
					type="button"
					class="nav-btn"
					@click="togglePause"
				>
					<Icon
						name="solar:pause-linear"
						size="1.1rem"
					/>
					Pause
				</button>
				<button
					v-else
					type="button"
					class="nav-btn"
					@click="playAgain"
				>
					<Icon
						name="solar:play-linear"
						size="1.1rem"
					/>
					Next
				</button>
				<button
					type="button"
					class="nav-btn"
					@click="endChallenge"
				>
					<Icon
						name="solar:close-circle-linear"
						size="1.1rem"
					/>
					End
				</button>
			</div>
		</div>

		<p
			v-if="!guesses.length && !gameOver"
			class="rules"
		>
			Guess the 5-letter Premier League surname. Six tries, 45 seconds.
		</p>

		<!-- Error Toast -->
		<div
			class="challenge-toast"
			:class="{ visible: errorMessage }"
		>
			{{ errorMessage }}
		</div>

		<!-- Game Board (5 letters, 6 rows) -->
		<div class="game-board">
			<div
				v-for="i in maxGuesses"
				:key="i"
				class="guess-row"
			>
				<span
					v-for="j in 5"
					:key="j"
					:class="['letter', { animate: shouldAnimate(i - 1, j - 1) }, feedbackClass(i - 1, j - 1)]"
					:style="getAnimationDelay(i - 1, j - 1)"
				>
					{{ getRowGuess(i - 1)[j - 1] || '' }}
				</span>
			</div>
		</div>

		<!-- Keyboard (using existing component) -->
		<Keyboard
			:disabled="!canPlay || isPaused"
			:guesses="guesses"
			:answer="answer"
			:maxGuesses="maxGuesses"
			:currentGuess="currentGuess"
			@key="onKeyPress"
		/>

		<!-- Pause Overlay -->
		<div
			v-if="isPaused"
			class="pause-overlay"
			@click="togglePause"
		>
			<div class="pause-content">
				<h2>
					<Icon
						name="solar:alarm-pause-linear"
						size="1.5rem"
					/>
					Paused
				</h2>
				<p>Click anywhere to resume</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	const props = defineProps<{
		guesses: string[]
		currentGuess: string
		maxGuesses: number
		answer: string
		timeRemaining: number
		timeFormatted: string
		canPlay: boolean
		isPaused: boolean
		gameOver: boolean
		errorMessage?: string
		sessionWins?: number
	}>()

	const emit = defineEmits(['key', 'end-challenge', 'toggle-pause', 'play-again'])

	function onKeyPress(key: string) {
		if (props.isPaused) return // Don't process keys when paused
		emit('key', key)
	}

	function endChallenge() {
		emit('end-challenge')
	}

	function togglePause() {
		emit('toggle-pause')
	}

	function playAgain() {
		emit('play-again')
	}

	function getRowGuess(guessIdx: number) {
		if (guessIdx < props.guesses.length) {
			return props.guesses[guessIdx] || ''
		}
		if (guessIdx === props.guesses.length) {
			return props.currentGuess || ''
		}
		return ''
	}

	function feedbackClass(guessIdx: number, charIdx: number) {
		const guess = getRowGuess(guessIdx)
		if (!guess) return ''
		const char = guess[charIdx]
		if (!char) return ''
		// Only color submitted guesses
		if (guessIdx >= props.guesses.length) return ''

		const answerUpper = props.answer.toUpperCase()
		const guessUpper = guess.toUpperCase()

		// Process the entire word to get the correct feedback for each position
		const result = processWordFeedback(guessUpper, answerUpper)
		return result[charIdx]
	}

	function processWordFeedback(guess: string, answer: string): string[] {
		const result = new Array(guess.length).fill('absent')
		const answerArray = answer.split('')

		// Step 1: Mark all correct positions first
		for (let i = 0; i < guess.length; i++) {
			if (guess[i] === answerArray[i]) {
				result[i] = 'correct'
				answerArray[i] = 'USED' // Mark as used
			}
		}

		// Step 2: Mark present positions (only for letters not already used)
		for (let i = 0; i < guess.length; i++) {
			if (result[i] !== 'correct') {
				// Skip already correct positions
				const letter = guess[i]
				if (letter) {
					// TypeScript safety check
					// Check if this letter exists in unused positions of the answer
					const index = answerArray.indexOf(letter)
					if (index !== -1) {
						result[i] = 'present'
						answerArray[index] = 'USED' // Mark this instance as used
					}
					// If not found, it remains 'absent' (which is the default)
				}
			}
		}

		return result
	}

	function shouldAnimate(guessIdx: number, charIdx: number) {
		return guessIdx < props.guesses.length && props.guesses[guessIdx]?.[charIdx]
	}

	function getAnimationDelay(guessIdx: number, charIdx: number) {
		if (!shouldAnimate(guessIdx, charIdx)) return {}
		const delay = charIdx * 0.1
		return { animationDelay: `${delay}s` }
	}
</script>

<style scoped lang="scss">
	.challenge-toast {
		background: var(--text-primary);
		border-radius: var(--global-border-radius);
		color: var(--bg-secondary);
		font-size: 0.85rem;
		font-weight: 600;
		left: 50%;
		opacity: 0;
		padding: 0.5rem 1rem;
		pointer-events: none;
		position: absolute;
		top: 4rem;
		transform: translateX(-50%) translateY(-4px);
		transition:
			opacity 0.2s,
			transform 0.2s;
		white-space: nowrap;
		z-index: 100;

		&.visible {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.challenge-game {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;

		.keyboard {
			flex-shrink: 0;
			padding-bottom: 0.5rem;
		}

		.challenge-nav {
			align-items: center;
			display: flex;
			justify-content: space-between;
			padding: 0.5rem 1rem;
			width: 100%;

			gap: 0.75rem;

			.timer {
				--ring: var(--color-success);
				color: var(--ring);
				flex-shrink: 0;
				height: 3.4rem;
				position: relative;
				width: 3.4rem;

				svg {
					height: 100%;
					transform: rotate(-90deg);
					width: 100%;
				}

				circle {
					fill: none;
					stroke-width: 4;
				}

				.track {
					stroke: color-mix(in srgb, var(--text-primary) 12%, transparent);
				}

				.fill {
					stroke: currentColor;
					stroke-dasharray: 119.4;
					stroke-linecap: round;
					transition:
						stroke-dashoffset 1s linear,
						stroke 0.3s;
				}

				span {
					display: grid;
					font-family: var(--font-display);
					font-size: 1.15rem;
					font-variant-numeric: tabular-nums;
					inset: 0;
					place-items: center;
					position: absolute;
				}

				&.warning {
					--ring: var(--color-present);
				}

				&.danger {
					--ring: #ff6b6b;
				}
			}

			.session {
				display: flex;
				flex: 1;
				flex-direction: column;
				line-height: 1.2;
				text-align: left;

				.session-label {
					color: var(--text-secondary);
					font-size: 0.7rem;
					font-weight: 700;
					letter-spacing: 0.06em;
					text-transform: uppercase;
				}

				strong {
					font-size: 1rem;
				}
			}

			.cta-buttons {
				align-items: center;
				display: flex;
				gap: 0.4rem;
				justify-content: center;
			}

			.nav-btn {
				align-items: center;
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: 0.8rem;
				color: var(--text-primary);
				cursor: pointer;
				display: flex;
				font: inherit;
				font-size: 0.8rem;
				font-weight: 700;
				gap: 0.3rem;
				min-height: 40px;
				padding: 0 0.7rem;
			}
		}

		.rules {
			color: var(--text-secondary);
			font-size: 0.82rem;
			margin: 0;
			padding: 0 1rem;
			text-align: center;
		}

		.game-board {
			flex: 1;
			min-height: 0;
			overflow: hidden;
			padding: 1rem 0;

			.guess-row {
				display: flex;
				gap: 0.25rem;
				justify-content: center;
				margin-bottom: 0.25rem;

				.letter {
					align-items: center;
					background: var(--bg-secondary);
					border: 2px solid var(--border);
					color: var(--text-primary);
					display: flex;
					font-size: 1.2rem;
					font-weight: 700;
					border-radius: 0.7rem;
					height: 3rem;
					justify-content: center;
					perspective: 1000px;
					text-transform: uppercase;
					transform-style: preserve-3d;
					transition: all 0.2s;
					width: 3rem;

					&.animate {
						animation: flipIn 0.6s ease-in-out forwards;
					}

					&.correct {
						background: var(--color-success);
						border-color: var(--color-success);
						color: white;
					}

					&.present {
						background: var(--color-present);
						border-color: var(--color-present);
						color: white;
					}

					&.absent {
						background: var(--color-absent);
						border-color: var(--color-absent);
						color: white;
					}
				}
			}
		}

		.pause-overlay {
			align-items: center;
			backdrop-filter: blur(8px);
			background: rgb(0 0 0 / 80%);
			cursor: pointer;
			display: flex;
			inset: 0;
			justify-content: center;
			position: fixed;
			z-index: 1000;

			.pause-content {
				align-items: center;
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				box-shadow: 0 8px 32px rgb(0 0 0 / 30%);
				display: flex;
				flex-direction: column;
				gap: 1rem;
				padding: 2rem;
				text-align: center;

				h2 {
					align-items: center;
					color: var(--text-primary);
					display: flex;
					gap: 0.5rem;
					margin-bottom: 0.5rem;

					svg {
						width: 1.5rem;
					}
				}

				p {
					color: var(--text-secondary);
					font-size: 1rem;
					margin: 0;
				}
			}
		}
	}

	@keyframes flipIn {
		0% {
			transform: rotateX(0deg);
		}

		50% {
			transform: rotateX(90deg);
		}

		100% {
			transform: rotateX(0deg);
		}
	}
</style>
