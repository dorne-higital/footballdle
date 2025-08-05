<template>
	<section 
		:class="componentName"
	>
		<div 
			v-for="i in maxGuesses" 
			:key="i" 
			class="guess-row"
		>
			<span 
				v-for="j in 6" 
				:key="j" 
				:class="[
					'letter',
					{ 'animate': shouldAnimate(i-1, j-1) },
					feedbackClass(i-1, j-1)
				]"
				:style="getAnimationDelay(i-1, j-1)"
			>
				{{ getRowGuess(i-1)[j-1] || '' }}
			</span>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps < {
			componentName?: string,
			guesses: string[],
			answer: string,
			maxGuesses: number,
			currentGuess?: string
		}>(),
		{
			componentName: 'game-board'
		}
	)

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
			if (result[i] !== 'correct') { // Skip already correct positions
				const letter = guess[i]
				if (letter) { // TypeScript safety check
					// Check if this letter exists in unused positions of the answer
					const index = answerArray.indexOf(letter)
					if (index !== -1) {
						result[i] = 'present'
						answerArray[index] = 'USED' // Mark this instance as used
					} else {
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
		// Only animate letters in completed guesses (not current guess)
		return guessIdx < props.guesses.length && props.guesses[guessIdx]?.[charIdx]
	}

	function getAnimationDelay(guessIdx: number, charIdx: number) {
		if (!shouldAnimate(guessIdx, charIdx)) return {}
		
		// Stagger animation: each letter animates 0.1s after the previous one
		const delay = charIdx * 0.1
		return {
			animationDelay: `${delay}s`
		}
	}


</script>

<style scoped lang="scss">
	.game-board {
		padding: 1rem 0;

		.guess-row {
			display: flex;
			justify-content: center;
			margin-bottom: 0.5rem;

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
				transition: background 0.2s, color 0.2s;
				width: 3rem;
				transform-style: preserve-3d;
				perspective: 1000px;

				&.animate {
					animation: flipIn 0.6s ease-in-out forwards;
				}

				// Feedback classes - only apply after animation starts
				&.correct {
					animation: correctReveal 0.6s ease-in-out forwards;
				}

				&.present {
					animation: presentReveal 0.6s ease-in-out forwards;
				}

				&.absent {
					animation: absentReveal 0.6s ease-in-out forwards;
				}
			}
		}
	}

	// Flip animation for letter reveal
	@keyframes flipIn {
		0% {
			transform: rotateX(0deg);
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
		}
		50% {
			transform: rotateX(90deg);
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
		}
		100% {
			transform: rotateX(0deg);
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
		}
	}

	// Correct letter animation (green)
	@keyframes correctReveal {
		0% {
			transform: rotateX(0deg) scale(1);
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
		}
		50% {
			transform: rotateX(90deg) scale(1.1);
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
		}
		100% {
			transform: rotateX(0deg) scale(1);
			background: var(--color-success);
			border-color: var(--color-success);
			color: #fff;
		}
	}

	// Present letter animation (yellow)
	@keyframes presentReveal {
		0% {
			transform: rotateX(0deg) scale(1);
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
		}
		50% {
			transform: rotateX(90deg) scale(1.05);
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
		}
		100% {
			transform: rotateX(0deg) scale(1);
			background: var(--color-present);
			border-color: var(--color-present);
			color: #fff;
		}
	}

	// Absent letter animation (grey)
	@keyframes absentReveal {
		0% {
			transform: rotateX(0deg) scale(1);
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
		}
		50% {
			transform: rotateX(90deg) scale(0.95);
			background: var(--bg-secondary);
			border-color: var(--border);
			color: var(--text-primary);
		}
		100% {
			transform: rotateX(0deg) scale(1);
			background: var(--color-absent);
			border-color: var(--color-absent);
			color: #fff;
		}
	}
</style> 