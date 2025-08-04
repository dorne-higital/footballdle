<template>
	<div :class="componentName">
		<div class="row">
			<button 
				v-for="key in row1" 
				:key="key" 
				@click="press(key)" 
				:disabled="disabled"
				:class="getKeyFeedback(key)"
			>{{ key }}</button>
		</div>
		<div class="row">
			<button 
				v-for="key in row2" 
				:key="key" 
				@click="press(key)" 
				:disabled="disabled"
				:class="getKeyFeedback(key)"
			>{{ key }}</button>
		</div>
		<div class="row">
			<button @click="press('ENTER')" :disabled="disabled" data-key="ENTER" class="enter">ENTER</button>
			<button 
				v-for="key in row3" 
				:key="key" 
				@click="press(key)" 
				:disabled="disabled"
				:class="getKeyFeedback(key)"
			>{{ key }}</button>
			<button @click="press('BACKSPACE')" :disabled="disabled" data-key="BACKSPACE">⌫</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, onUnmounted, watch, toRef } from 'vue'

	const props = withDefaults(
		defineProps < {
			componentName?: string,
			disabled?: boolean,
			guesses?: string[],
			answer?: string
		}>(),
		{
			componentName: 'keyboard',
			guesses: () => [],
			answer: ''
		}
	)

	const emit = defineEmits(['key'])
	const row1 = ['Q','W','E','R','T','Y','U','I','O','P']
	const row2 = ['A','S','D','F','G','H','J','K','L']
	const row3 = ['Z','X','C','V','B','N','M']

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
			if (result[i] !== 'correct') { // Skip already correct positions
				const letter = guess[i]
				if (letter) { // TypeScript safety check
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
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
		padding: 0 .5rem;

		.row {
			display: flex;
			justify-content: center;
			gap: 0.5rem;

			button {
				flex: 1 1 0;
				max-width: 48px;
				height: 58px;
				background: #d3d6da;
				border: none;
				border-radius: 6px;
				font-size: 1.5rem;
				color: #222;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 1px 2px rgba(0,0,0,0.08);
				transition: background 0.1s, color 0.1s;
				cursor: pointer;
				user-select: none;

				&:active {
					background: #b5b8ba;
				}

				&:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}

				&[data-key='ENTER'],
				&[data-key='BACKSPACE'] {
					flex: 1.5 1 0;
					max-width: 72px;
					font-size: .8rem;
					padding: 0 2px;
				}

				&[data-key='BACKSPACE'] {
					font-size: 1.4rem;
				}

				&.correct {
					background: var(--color-success);
					color: #fff;
				}

				&.present {
					background: var(--color-present);
					color: #fff;
				}

				&.absent {
					background: var(--color-absent);
					color: #fff;
				}
			}
		}
	}
</style> 