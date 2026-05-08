<template>
	<section
		:class="componentName"
		class="game-board"
	>
		<div
			class="toast"
			:class="{ visible: errorMessage }"
		>
			{{ errorMessage }}
		</div>

		<div
			v-for="i in maxGuesses"
			:key="i"
			:class="[
				'guess-row',
				{ 'active-row': !gameOver && i - 1 === guesses.length },
				{ shake: shaking && i - 1 === guesses.length },
			]"
		>
			<span
				v-for="j in 6"
				:key="j"
				:class="['letter', { animate: shouldAnimate(i - 1, j - 1) }, feedbackClass(i - 1, j - 1)]"
				:style="getAnimationDelay(i - 1, j - 1)"
			>
				{{ getRowGuess(i - 1)[j - 1] || '' }}
			</span>
		</div>
	</section>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue'

	const props = withDefaults(
		defineProps<{
			componentName?: string
			guesses: string[]
			answer: string
			maxGuesses: number
			currentGuess?: string
			gameOver?: boolean
			errorMessage?: string
		}>(),
		{
			componentName: 'game-board',
			gameOver: false,
			errorMessage: '',
		},
	)

	const shaking = ref(false)

	watch(
		() => props.errorMessage,
		(msg) => {
			if (msg) {
				shaking.value = true
				setTimeout(() => {
					shaking.value = false
				}, 500)
			}
		},
	)

	function feedbackClass(guessIdx: number, charIdx: number) {
		const guess = getRowGuess(guessIdx)
		if (!guess) return ''
		const char = guess[charIdx]
		if (!char) return ''
		if (guessIdx >= props.guesses.length) return ''

		const answerUpper = props.answer.toUpperCase()
		const guessUpper = guess.toUpperCase()
		const result = processWordFeedback(guessUpper, answerUpper)
		return result[charIdx]
	}

	function processWordFeedback(guess: string, answer: string): string[] {
		const result = new Array(guess.length).fill('absent')
		const answerArray = answer.split('')

		for (let i = 0; i < guess.length; i++) {
			if (guess[i] === answerArray[i]) {
				result[i] = 'correct'
				answerArray[i] = 'USED'
			}
		}

		for (let i = 0; i < guess.length; i++) {
			if (result[i] !== 'correct') {
				const letter = guess[i]
				if (letter) {
					const index = answerArray.indexOf(letter)
					if (index !== -1) {
						result[i] = 'present'
						answerArray[index] = 'USED'
					}
				}
			}
		}

		return result
	}

	function getRowGuess(i: number) {
		if (i < props.guesses.length) return props.guesses[i] || ''.padEnd(6, ' ')
		if (i === props.guesses.length && props.currentGuess) return props.currentGuess.padEnd(6, ' ')
		return ''.padEnd(6, ' ')
	}

	function shouldAnimate(guessIdx: number, charIdx: number) {
		return guessIdx < props.guesses.length && props.guesses[guessIdx]?.[charIdx]
	}

	function getAnimationDelay(guessIdx: number, charIdx: number) {
		if (!shouldAnimate(guessIdx, charIdx)) return {}
		return { animationDelay: `${charIdx * 0.1}s` }
	}
</script>

<style scoped lang="scss">
	.game-board {
		padding: 1rem 0;
		position: relative;

		.toast {
			background: var(--text-primary);
			border-radius: var(--global-border-radius);
			color: var(--bg-secondary);
			font-size: 0.85rem;
			font-weight: 600;
			left: 50%;
			opacity: 0;
			padding: 0.5rem 1.1rem;
			pointer-events: none;
			position: absolute;
			top: 0;
			transform: translateX(-50%) translateY(-4px);
			transition:
				opacity 0.15s,
				transform 0.15s;
			white-space: nowrap;
			z-index: 10;

			&.visible {
				opacity: 1;
				transform: translateX(-50%) translateY(0);
			}
		}

		.guess-row {
			display: flex;
			justify-content: center;
			margin-bottom: 0.5rem;

			&.shake {
				animation: shake 0.5s ease-in-out;
			}

			.letter {
				align-items: center;
				background: var(--bg-primary);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				display: flex;
				height: 3rem;
				justify-content: center;
				line-height: 3rem;
				margin: 0 0.1rem;
				perspective: 1000px;
				transform-style: preserve-3d;
				transition:
					background 0.2s,
					color 0.2s;
				width: 3rem;

				&.animate {
					animation: flip-in 0.6s ease-in-out forwards;
				}

				&.correct {
					animation: correct-reveal 0.6s ease-in-out forwards;
				}

				&.present {
					animation: present-reveal 0.6s ease-in-out forwards;
				}

				&.absent {
					animation: absent-reveal 0.6s ease-in-out forwards;
				}
			}

			&.active-row .letter:not(.correct, .present, .absent) {
				border-color: var(--text-secondary);
			}
		}
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}

		20% {
			transform: translateX(-6px);
		}

		40% {
			transform: translateX(6px);
		}

		60% {
			transform: translateX(-4px);
		}

		80% {
			transform: translateX(4px);
		}
	}

	@keyframes flip-in {
		0% {
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
			transform: rotateX(0deg);
		}

		50% {
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
			transform: rotateX(90deg);
		}

		100% {
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
			transform: rotateX(0deg);
		}
	}

	@keyframes correct-reveal {
		0% {
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
			transform: rotateX(0deg) scale(1);
		}

		50% {
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
			transform: rotateX(90deg) scale(1.1);
		}

		100% {
			background: var(--color-success);
			border-color: var(--color-success);
			color: #fff;
			transform: rotateX(0deg) scale(1);
		}
	}

	@keyframes present-reveal {
		0% {
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
			transform: rotateX(0deg) scale(1);
		}

		50% {
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
			transform: rotateX(90deg) scale(1.05);
		}

		100% {
			background: var(--color-present);
			border-color: var(--color-present);
			color: #fff;
			transform: rotateX(0deg) scale(1);
		}
	}

	@keyframes absent-reveal {
		0% {
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
			transform: rotateX(0deg) scale(1);
		}

		50% {
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
			transform: rotateX(90deg) scale(0.95);
		}

		100% {
			background: var(--color-absent);
			border-color: var(--color-absent);
			color: #fff;
			transform: rotateX(0deg) scale(1);
		}
	}
</style>
