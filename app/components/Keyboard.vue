<template>
	<div :class="componentName">
		<div class="row">
			<button
				v-for="key in row1"
				:key="key"
				@click="press(key)"
				:disabled="disabled"
				:class="getKeyFeedback(key)"
			>
				{{ key }}
			</button>
		</div>
		<div class="row">
			<button
				v-for="key in row2"
				:key="key"
				@click="press(key)"
				:disabled="disabled"
				:class="getKeyFeedback(key)"
			>
				{{ key }}
			</button>
		</div>
		<div class="row">
			<button
				@click="press('ENTER')"
				:disabled="disabled"
				data-key="ENTER"
				class="enter"
			>
				ENTER
			</button>
			<button
				v-for="key in row3"
				:key="key"
				@click="press(key)"
				:disabled="disabled"
				:class="getKeyFeedback(key)"
			>
				{{ key }}
			</button>
			<button
				@click="press('BACKSPACE')"
				:disabled="disabled"
				data-key="BACKSPACE"
			>
				⌫
			</button>
		</div>
		<div
			v-if="showSpace"
			class="row"
		>
			<button
				data-key="SPACE"
				:disabled="disabled"
				@click="press(' ')"
			>
				SPACE
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, onUnmounted, watch, toRef } from 'vue'

	const props = withDefaults(
		defineProps<{
			componentName?: string
			disabled?: boolean
			guesses?: string[]
			answer?: string
			showSpace?: boolean
		}>(),
		{
			componentName: 'keyboard',
			guesses: () => [],
			answer: '',
			showSpace: false,
		},
	)

	const emit = defineEmits(['key'])
	const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']
	const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']
	const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M']

	const disabledRef = toRef(props, 'disabled')

	function getKeyFeedback(key: string): string {
		if (!props.answer || props.guesses.length === 0) return ''

		const answerUpper = props.answer.toUpperCase()
		const keyUpper = key.toUpperCase()

		// Check if this key appears in any submitted guess
		let isCorrect = false
		let isPresent = false
		let isAbsent = false

		for (const guess of props.guesses) {
			const guessUpper = guess.toUpperCase()
			const result = processWordFeedback(guessUpper, answerUpper)

			// Check if this key appears in the result
			for (let i = 0; i < guessUpper.length; i++) {
				if (guessUpper[i] === keyUpper) {
					if (result[i] === 'correct') {
						isCorrect = true
					} else if (result[i] === 'present') {
						isPresent = true
					} else {
						isAbsent = true
					}
				}
			}
		}

		// Priority: correct > present > absent
		if (isCorrect) return 'correct'
		if (isPresent) return 'present'
		if (isAbsent) return 'absent'

		return ''
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
					const index = answerArray.indexOf(letter)
					if (index !== -1) {
						result[i] = 'present'
						answerArray[index] = 'USED' // Mark this instance as used
					}
				}
			}
		}

		return result
	}

	function press(key: string) {
		if (disabledRef.value) return
		emit('key', key)
	}
	function handlePhysicalKey(e: KeyboardEvent) {
		if (disabledRef.value) return
		if (e.key === 'Enter') {
			emit('key', 'ENTER')
		} else if (e.key === 'Backspace') {
			emit('key', 'BACKSPACE')
		} else if (e.key === ' ' && props.showSpace) {
			e.preventDefault()
			emit('key', ' ')
		} else if (/^[a-zA-Z]$/.test(e.key) && e.key.length === 1) {
			emit('key', e.key.toUpperCase())
		}
	}

	onMounted(() => {
		window.addEventListener('keydown', handlePhysicalKey)
	})
	onUnmounted(() => {
		window.removeEventListener('keydown', handlePhysicalKey)
	})
</script>

<style scoped lang="scss">
	.keyboard {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0 auto;
		max-width: 500px;
		padding: 0;
		width: 100%;

		.row {
			display: flex;
			gap: 0.3rem;
			justify-content: center;

			button {
				align-items: center;
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: 8px;
				color: var(--text-primary);
				cursor: pointer;
				display: flex;
				flex: 1 1 0;
				font-family: var(--font-body);
				font-size: clamp(1rem, 2.3vh, 1.35rem);
				font-weight: 600;
				height: clamp(40px, 7vh, 58px);
				justify-content: center;
				transition:
					background 0.1s,
					color 0.1s,
					border-color 0.1s;
				user-select: none;
				width: 48px;

				&:active {
					background: color-mix(in srgb, var(--primary-color) 10%, var(--bg-secondary));
					border-color: var(--border-hover);
				}

				&:disabled {
					cursor: not-allowed;
					opacity: 0.5;
				}

				&[data-key='ENTER'],
				&[data-key='BACKSPACE'] {
					color: var(--text-secondary);
					flex: 1.5 1 0;
					font-family: var(--font-display);
					font-size: 0.7rem;
					font-weight: 600;
					letter-spacing: 0.04em;
					max-width: 76px;
					padding: 0 4px;
					text-transform: uppercase;
				}

				&[data-key='SPACE'] {
					color: var(--text-secondary);
					flex: 1;
					font-family: var(--font-display);
					font-size: 0.7rem;
					font-weight: 600;
					letter-spacing: 0.08em;
					max-width: none;
					text-transform: uppercase;
					width: 100%;
				}

				&[data-key='BACKSPACE'] {
					font-size: 1.2rem;
				}

				&.correct {
					background: var(--color-success);
					border-color: var(--color-success);
					color: #fff;
				}

				&.present {
					background: var(--color-present);
					border-color: var(--color-present);
					color: #fff;
				}

				&.absent {
					background: color-mix(in srgb, var(--text-secondary) 20%, var(--bg-secondary));
					border-color: color-mix(in srgb, var(--text-secondary) 20%, var(--bg-secondary));
					color: var(--text-secondary);
				}
			}
		}
	}
</style>
