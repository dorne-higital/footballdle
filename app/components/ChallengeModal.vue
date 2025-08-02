<template>
	<div class="challenge-game">
		<!-- Navigation Header -->
		<div class="challenge-nav">
			<button @click="endChallenge" class="nav-button">
				<Icon 
					name="solar:alt-arrow-left-linear"
					size="1rem" 
				/>

				Back to Menu
			</button>
			<button 
				v-if="!gameOver" 
				@click="togglePause" 
				class="pause-button" 
				:class="{ 'paused': isPaused }"
			>
				<Icon 
					v-if="!isPaused"
					name="solar:alarm-pause-linear"
					size="1rem" 
				/>
				<Icon 
					v-else
					name="solar:play-circle-linear"
					size="1rem" 
				/>

				{{ isPaused ? 'Play' : 'Pause' }}
			</button>

			<button 
				v-else 
				@click="playAgain" 
				class="play-again-button"
			>
				Play Again

				<Icon 
					name="solar:play-circle-linear"
					size="1rem" 
				/>
			</button>
		</div>

		<!-- Header with timer -->
		<div class="challenge-header">
			<h1>⚡ Challenge Mode</h1>
			<div class="timer" :class="{ 'warning': timeRemaining <= 10, 'danger': timeRemaining <= 5 }">
				{{ timeFormatted }}
			</div>
		</div>

		<!-- Game Board (5 letters, 6 rows) -->
		<div class="game-board">
			<div v-for="i in maxGuesses" :key="i" class="guess-row">
				<span
					v-for="j in 5"
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
		<div v-if="isPaused" class="pause-overlay" @click="togglePause">
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
		return props.guesses[guessIdx]
	}
	if (guessIdx === props.guesses.length) {
		return props.currentGuess
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
	const charUpper = char.toUpperCase()
	if (charUpper === answerUpper[charIdx]) return 'correct'
	if (answerUpper.includes(charUpper)) return 'present'
	return 'absent'
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
.challenge-game {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	padding: 1rem;
	gap: 2rem;
	background: var(--bg-gradient);
	position: relative;
}

.challenge-nav {
	position: absolute;
	top: 1rem;
	left: 1rem;
	right: 1rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	z-index: 10;

	.nav-button, .pause-button, .play-again-button {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		color: var(--text-primary);
		padding: 0.5rem 1rem;
		border-radius: var(--global-border-radius);
		cursor: pointer;
		display: flex;
		gap: 0.5rem;
		font-size: 0.9rem;
		transition: all 0.2s;
		
		&:hover {
			background: var(--bg-primary);
			border-color: var(--border-hover);
		}
	}
}

.challenge-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	max-width: 400px;
	
	h1 {
		margin: 0;
		color: var(--text-primary);
		font-size: 1.5rem;
		font-weight: 700;
	}
	
	.timer {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
		font-family: monospace;
		
		&.warning {
			color: var(--color-present);
		}
		
		&.danger {
			color: #dc2626;
			animation: pulse 1s 10s;
		}
	}
}

.game-board {
	.guess-row {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 0.25rem;
		justify-content: center;
		
		.letter {
			width: 3.5rem;
			height: 3.5rem;
			border: 2px solid var(--border);
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: 700;
			font-size: 1.2rem;
			text-transform: uppercase;
			background: var(--bg-secondary);
			color: var(--text-primary);
			transition: all 0.2s;
			transform-style: preserve-3d;
			perspective: 1000px;
			
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






@keyframes flipIn {
	0% { transform: rotateX(0deg); }
	50% { transform: rotateX(90deg); }
	100% { transform: rotateX(0deg); }
}

.pause-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	backdrop-filter: blur(8px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	cursor: pointer;

	.pause-content {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 2rem;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

		h2 {
			align-items: center;
			color: var(--text-primary);
			display: flex;
			gap: .5rem;
			margin-bottom: 0.5rem;

			svg {
				width: 1.5rem;
			}
		}

		p {
			color: var(--text-secondary);
			margin: 0;
			font-size: 1rem;
		}
	}
}

@keyframes pulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.5; }
}
</style> 