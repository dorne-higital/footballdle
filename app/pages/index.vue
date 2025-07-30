<template>
	<div>
		<HeaderNav 
			@show-info="showInfo = true" 
			@show-settings="showSettings = true" 
			@show-stats="showStats = true" 
		/>

		<GameBoard 
			:guesses="guesses" 
			:answer="answer || ''" 
			:maxGuesses="maxGuesses" 
			:currentGuess="currentGuess" 
		/>

		<Keyboard 
			:disabled="gameOver" 
			:guesses="guesses" 
			:answer="answer || ''" 
			:maxGuesses="maxGuesses"
			:currentGuess="currentGuess"
			@key="onKeyboardKey" 
		/>

		<!-- Game Over Modal -->
		<BaseModal
			v-if="showGameOverModal"
			:show="showGameOverModal"
			:heading="isWin ? 'Well played!' : 'Better luck next time!'"
			variant="small"
			@close="showGameOverModal = false"
		>
			<template #body>
				<div class="game-over-section">
					<h4 v-if="isWin">You win!</h4>
					<h4 v-else>You lose!</h4>
					<p>The answer was <strong class="answer">{{ answer }}</strong></p>
					<button @click="onShare" class="button primary">Share</button>
				</div>
			</template>

			<template #footer>
				<div v-if="nextGameTime">
					<p class="caption">Next game in:</p>
					<h3>{{ countdown }}</h3>
				</div>
			</template>
		</BaseModal>

		<!-- Info Modal -->
		<BaseModal
			v-if="showInfo"
			heading="How to play"
			variant="small"
			align="left"
			@close="showInfo = false"
		>
			<template #body>
				<div class="info-section">
					<p>Guess the 6-letter Premier League footballer in 6 tries.</p>

					<p>Each guess much be a valid Premier League footballer playing in the 25/26 season.</p>

					<p>The colour of the letter indicates how close your guess is to the answer:</p>

					<p class="caption"><strong>Examples</strong></p>

					<div class="examples">
						<span class="example">
							<span class="letter">P</span>
							<span class="letter correct">A</span>
							<span class="letter">L</span>
							<span class="letter">M</span>
							<span class="letter">E</span>
							<span class="letter">R</span>
						</span>
						<p class="caption">The letter <strong>A</strong> is in the answer and in the correct position.</p>

						<span class="example">
							<span class="letter">D</span>
							<span class="letter">E</span>
							<span class="letter">L</span>
							<span class="letter">I</span>
							<span class="letter present">G</span>
							<span class="letter">T</span>
						</span>
						<p class="caption">The letter <strong>G</strong> is in the answer but in the wrong position.</p>

						<span class="example">
							<span class="letter">E</span>
							<span class="letter">L</span>
							<span class="letter">A</span>
							<span class="letter absent">N</span>
							<span class="letter">G</span>
							<span class="letter">A</span>
						</span>
						<p class="caption">The letter <strong>N</strong> is not in the answer.</p>
					</div>

					<p>A new player is revealed every day at midnight.</p>
				</div>
			</template>
		</BaseModal>

		<!-- Settings Modal -->
		<BaseModal
			v-if="showSettings"
			heading="Settings"
			variant="small"
			@close="showSettings = false"
		>
			<template #body>
				<div class="settings-section">
					<div class="setting-item">
						<label for="theme-toggle">Dark Mode</label>
						<button 
							id="theme-toggle"
							@click="toggleTheme" 
							:class="['theme-toggle', { 'active': isDarkTheme }]"
						>
							<span class="toggle-slider"></span>
						</button>
					</div>
					<div class="setting-item">
						<label for="high-contrast-toggle">High Contrast</label>
						<button 
							id="high-contrast-toggle"
							@click="toggleHighContrast" 
							:class="['theme-toggle', { 'active': isHighContrast }]"
						>
							<span class="toggle-slider"></span>
						</button>
					</div>
				</div>
			</template>
		</BaseModal>

		<!-- Stats Modal -->
		<BaseModal
			v-if="showStats"
			heading="Statistics"
			variant="small"
			@close="showStats = false"
		>
			<template #body>
				<div class="stats-grid">
					<div class="stat-card">
						<h3 class="stat-number">{{ stats.gamesPlayed }}</h3>
						<p class="caption">Games Played</p>
					</div>
					
					<div class="stat-card">
						<h3 class="stat-number">{{ stats.wins }}</h3>
						<p class="caption">Wins</p>
					</div>
					
					<div class="stat-card">
						<h3 class="stat-number">{{ stats.losses }}</h3>
						<p class="caption">Losses</p>
					</div>
					
					<div class="stat-card">
						<h3 class="stat-number">{{ winPercentage }}%</h3>
						<p class="caption">Win Rate</p>
					</div>

					<div class="stat-card">
						<h3 class="stat-number">{{ stats.currentStreak }}</h3>
						<p class="caption">Current Streak</p>
					</div>
					
					<div class="stat-card">
						<h3 class="stat-number">{{ stats.maxStreak }}</h3>
						<p class="caption">Best Streak</p>
					</div>
				</div>
			</template>
		</BaseModal>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
	import { footballers, getAnswerForDay } from '../composables/useFootballers'
	// import HeaderNav from '../components/HeaderNav.vue'
	// import BaseModal from '../components/BaseModal.vue'
	// import Keyboard from '../components/Keyboard.vue'
	// import GameBoard from '../components/GameBoard.vue'

	function getUKDateString() {
		const now = new Date()
		return now.toLocaleDateString('en-GB', { timeZone: 'Europe/London' })
	}

	function getNextGameTime() {
		// Get current time in UK
		const now = new Date()
		const ukNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }))
		// Set to next midnight UK time
		ukNow.setHours(0, 0, 0, 0)
		ukNow.setDate(ukNow.getDate() + 1)
		return ukNow
	}

	const todayStr = getUKDateString() || ''
	const answer = getAnswerForDay(todayStr) || ''
	const nextGameTime = getNextGameTime()

	// Game state
	const guesses = ref<string[]>([])
	const currentGuess = ref('')
	const maxGuesses = 6
	const gameOver = ref(false)
	const isWin = ref(false)
	const showGameOverModal = ref(false)

	// Modal state
	const showInfo = ref(false)
	const showSettings = ref(false)
	const showStats = ref(false)

	// Stats state
	const stats = ref({
		gamesPlayed: 0,
		wins: 0,
		losses: 0,
		currentStreak: 0,
		maxStreak: 0,
	})

	// Theme state
	const isDarkTheme = ref(false)
	const isHighContrast = ref(false)

	// Countdown state
	const countdown = ref('')
	let countdownInterval: any

	const winPercentage = computed(() => {
		if (stats.value.gamesPlayed === 0) return 0
		return Math.round((stats.value.wins / stats.value.gamesPlayed) * 100)
	})

	onMounted(() => {
		updateCountdown()
		countdownInterval = setInterval(updateCountdown, 1000)
		
		// Load saved theme settings
		const savedTheme = localStorage.getItem('footballdle-theme')
		const savedHighContrast = localStorage.getItem('footballdle-high-contrast')
		
		if (savedTheme === 'dark') {
			isDarkTheme.value = true
		}
		
		if (savedHighContrast === 'true') {
			isHighContrast.value = true
		}
		
		applyTheme()
		
		// Load saved game state
		const savedStats = localStorage.getItem('footballdle-stats')
		if (savedStats) {
			stats.value = JSON.parse(savedStats)
		}
		
		const savedGame = localStorage.getItem('footballdle-game')
		if (savedGame) {
			const { date, guesses: savedGuesses, gameOver: savedOver, isWin: savedWin } = JSON.parse(savedGame)
			if (date === todayStr) {
				guesses.value = savedGuesses
				gameOver.value = savedOver
				isWin.value = savedWin
				if (savedOver) {
					showGameOverModal.value = true
				}
			}
		}
	})

	onUnmounted(() => {
		clearInterval(countdownInterval)
	})

	function updateCountdown() {
		if (!nextGameTime) return
		const now = new Date()
		const nextGame = typeof nextGameTime === 'string'
			? new Date(nextGameTime)
			: nextGameTime
		const diff = nextGame.getTime() - now.getTime()
		if (diff <= 0) {
			countdown.value = '00:00:00'
			return
		}
		const hours = Math.floor(diff / 1000 / 60 / 60)
		const minutes = Math.floor((diff / 1000 / 60) % 60)
		const seconds = Math.floor((diff / 1000) % 60)
		countdown.value = `${hours.toString().padStart(2, '0')}:${minutes
			.toString()
			.padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	}

	function saveState() {
		localStorage.setItem('footballdle-stats', JSON.stringify(stats.value))
		localStorage.setItem('footballdle-game', JSON.stringify({
			date: todayStr,
			guesses: guesses.value,
			gameOver: gameOver.value,
			isWin: isWin.value,
		}))
	}

	function submitGuess(guess: string) {
		if (gameOver.value) return // Prevent guess if game is over
		guess = guess.trim().toUpperCase()
		if (guess.length !== 6) {
			alert('Guess must be 6 letters!')
			return
		}
		// Case-insensitive check for valid footballer
		const validNames = footballers.map(name => name.toUpperCase())
		if (!validNames.includes(guess)) {
			alert('Not a valid footballer surname!')
			return
		}
		// Case-insensitive duplicate guess check
		if (guesses.value.map(g => g.toUpperCase()).includes(guess)) {
			alert('Already guessed!')
			return
		}
		guesses.value.push(guess)
		// Case-insensitive win check
		if (guess === answer.toUpperCase()) {
			isWin.value = true
			gameOver.value = true
			showGameOverModal.value = true
			updateStats(true)
		} else if (guesses.value.length >= maxGuesses) {
			isWin.value = false
			gameOver.value = true
			showGameOverModal.value = true
			updateStats(false)
		}
		currentGuess.value = ''
		saveState()
	}

	function updateStats(win: boolean) {
		stats.value.gamesPlayed++
		if (win) {
			stats.value.wins++
			stats.value.currentStreak++
			if (stats.value.currentStreak > stats.value.maxStreak) {
				stats.value.maxStreak = stats.value.currentStreak
			}
		} else {
			stats.value.losses++
			stats.value.currentStreak = 0
		}
	}

	function onKeyboardKey(key: string) {
		if (gameOver.value) return // Prevent input if game is over
		if (key === 'ENTER') {
			submitGuess(currentGuess.value)
		} else if (key === 'BACKSPACE') {
			currentGuess.value = currentGuess.value.slice(0, -1)
		} else if (/^[A-Z]$/.test(key) && currentGuess.value.length < 6) {
			currentGuess.value += key
		}
	}

	function onShare() {
		// Build emoji grid
		const grid = guesses.value.map(guess => {
			return guess.split('').map((char, i) => {
				if ((answer || '')[i] && char === (answer || '')[i]) return '🟩'
				if ((answer || '').includes(char)) return '🟨'
				return '⬛'
			}).join('')
		}).join('\n')
		const text = `Footballdle ${todayStr}\n${isWin.value ? guesses.value.length : 'X'}/6\n${grid}`
		navigator.clipboard.writeText(text)
		alert('Result copied to clipboard!')
	}

	function toggleTheme() {
		isDarkTheme.value = !isDarkTheme.value
		applyTheme()
		saveThemeSettings()
	}

	function toggleHighContrast() {
		isHighContrast.value = !isHighContrast.value
		applyTheme()
		saveThemeSettings()
	}

	function applyTheme() {
		const root = document.documentElement
  
		// Remove all theme classes first
		root.classList.remove('dark', 'high-contrast')
  
		// Apply dark theme
		if (isDarkTheme.value) {
			root.classList.add('dark')
		}
  
		// Apply high contrast theme
		if (isHighContrast.value) {
			root.classList.add('high-contrast')
		}
	}

	function saveThemeSettings() {
		localStorage.setItem('footballdle-theme', isDarkTheme.value ? 'dark' : 'light')
		localStorage.setItem('footballdle-high-contrast', isHighContrast.value ? 'true' : 'false')
	}

	function resetGameHistory() {
		if (confirm('Are you sure you want to reset all game history? This cannot be undone.')) {
			localStorage.removeItem('footballdle-stats')
			localStorage.removeItem('footballdle-game')
			localStorage.removeItem('footballdle-theme')
			
			// Reset all state
			stats.value = {
				gamesPlayed: 0,
				wins: 0,
				losses: 0,
				currentStreak: 0,
				maxStreak: 0,
			}
			guesses.value = []
			currentGuess.value = ''
			gameOver.value = false
			isWin.value = false
			showGameOverModal.value = false
			isDarkTheme.value = false
			applyTheme()
			
			alert('Game history has been reset!')
		}
	}

	watch(() => getUKDateString(), (newDate, oldDate) => {
		if (newDate !== oldDate) {
			guesses.value = []
			gameOver.value = false
			isWin.value = false
			showGameOverModal.value = false
			saveState()
			location.reload()
		}
	})
</script>

<style scoped lang="scss">
	// ============================================================================
	// GAME OVER MODAL
	// ============================================================================
	.game-over-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;

		.answer {
			text-transform: uppercase;
		}
	}

	// ============================================================================
	// INFO MODAL
	// ============================================================================
	.info-section {
		display: flex;
		flex-direction: column;
		gap: .5rem;

		.examples {
			display: flex;
			flex-direction: column;
			gap: .5rem;

			.example {
				display: flex;
				gap: .25rem;

				.letter {
					align-items: center;
					background: var(--bg-secondary);
					border: 1px solid var(--border);
					border-radius: var(--global-border-radius);
					display: flex;
					height: 2rem;
					justify-content: center;
					line-height: 3rem;
					margin: 0 0.1rem;
					transition: background 0.2s, color 0.2s;
					width: 2rem;

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
						background: var(--color-absent);
						border-color: var(--color-absent);
						color: #fff;
					}
				}
			}

			.caption {
				border-bottom: 1px solid var(--border);
				padding-bottom: .5rem;
			}
		}
	}

	// ============================================================================
	// SETTINGS MODAL
	// ============================================================================
	.settings-section {
		margin-bottom: 2rem;
		width: 100%;
		
		h3 {
			margin-bottom: 1rem;
			font-size: 1.2rem;
			font-weight: 600;
		}

		.setting-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 1rem;
			
			label {
				font-weight: 500;
			}
			
			p {
				margin: 0;
				color: var(--text-secondary);
			}

			.theme-toggle {
				position: relative;
				width: 50px;
				height: 24px;
				background: #ccc;
				border: none;
				border-radius: 12px;
				cursor: pointer;
				transition: background 0.3s;
				
				&.active {
					background: var(--primary-color);
				}
				
				.toggle-slider {
					position: absolute;
					top: 2px;
					left: 2px;
					width: 20px;
					height: 20px;
					background: var(--bg-gradient);
					border-radius: 50%;
					transition: transform 0.3s;
				}
				
				&.active .toggle-slider {
					transform: translateX(26px);
				}
			}

			.button {
				color: var(--border);
				padding: 0.5rem 1rem;
				border: none;
				border-radius: var(--global-border-radius);
				font-weight: 500;
				cursor: pointer;
				transition: all 0.2s;
				
				&.danger {
					background: #dc3545;
					color: white;
					
					&:hover {
						background: #c82333;
					}
				}
				
				&.tertiary {
					background: var(--tertiary-color);
					color: white;
					
					&:hover {
						background: var(--accent-color);
					}
				}
			}
		}
	}

	// ============================================================================
	// STATS MODAL
	// ============================================================================
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;

		.stat-card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--global-border-radius);
			padding: 1.5rem;
			text-align: center;
			transition: all 0.2s;
			
			&:hover {
				border-color: var(--border-hover);
				transform: translateY(-2px);
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
			}
		}
	}
</style> 