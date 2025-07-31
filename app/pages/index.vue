<template>
	<div>
		<!-- Intro Screen -->
		<IntroScreen
			v-if="gameStore.showIntro"
			:can-play="gameStore.canPlay"
			:countdown="gameStore.countdown"
			:stats="statsStore.stats"
			:win-percentage="statsStore.winPercentage"
			@start-game="gameStore.startGame"
			@show-info="modalsStore.openInfo"
			@show-settings="modalsStore.openSettings"
		/>

		<!-- Game Screen -->
		<div v-else>
			<HeaderNav 
				@show-info="modalsStore.openInfo" 
				@show-settings="modalsStore.openSettings" 
				@show-stats="modalsStore.openStats" 
			/>
			
			<button @click="gameStore.showIntro = true" class="back-to-menu">
				← Back to Menu
			</button>

			<GameBoard 
				:guesses="gameStore.guesses" 
				:answer="gameStore.answer" 
				:maxGuesses="gameStore.maxGuesses" 
				:currentGuess="gameStore.currentGuess" 
			/>

			<Keyboard 
				:disabled="gameStore.gameOver" 
				:guesses="gameStore.guesses" 
				:answer="gameStore.answer" 
				:maxGuesses="gameStore.maxGuesses"
				:currentGuess="gameStore.currentGuess"
				@key="handleKeyboardKey" 
			/>
		</div>

		<!-- Game Over Modal -->
		<BaseModal
			v-if="gameStore.showGameOverModal"
			:show="gameStore.showGameOverModal"
			:heading="gameStore.isWin ? 'Well played!' : 'Better luck next time!'"
			variant="small"
			@close="gameStore.closeGameOverModal"
		>
			<template #body>
				<div class="game-over-section">
					<h4 v-if="gameStore.isWin">You win!</h4>
					<h4 v-else>You lose!</h4>
					<p>The answer was <strong class="answer">{{ gameStore.answer }}</strong></p>
					<button @click="handleShare" class="button primary share">Share</button>
				</div>
			</template>

			<template #footer>
				<div v-if="gameStore.getNextGameTime">
					<p class="caption">Next game in:</p>
					<h3>{{ gameStore.countdown }}</h3>
				</div>
			</template>
		</BaseModal>

		<!-- Info Modal -->
		<BaseModal
			v-if="modalsStore.showInfo"
			heading="How to play"
			variant="small"
			align="left"
			@close="modalsStore.closeInfo"
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
			v-if="modalsStore.showSettings"
			heading="Settings"
			variant="small"
			@close="modalsStore.closeSettings"
		>
			<template #body>
				<div class="settings-section">
					<div class="setting-item">
						<label for="theme-toggle">Dark Mode</label>

						<button 
							:class="['theme-toggle', { active: themeStore.isDarkTheme }]"
							@click="themeStore.toggleTheme"
						>
							<div class="toggle-slider"></div>
						</button>
					</div>

					<div class="setting-item">
						<label for="theme-toggle">High Contrast</label>

						<button 
							:class="['theme-toggle', { active: themeStore.isHighContrast }]"
							@click="themeStore.toggleHighContrast"
						>
							<div class="toggle-slider"></div>
						</button>
					</div>
				</div>
			</template>
		</BaseModal>

		<!-- Stats Modal -->
		<BaseModal
			v-if="modalsStore.showStats"
			heading="Statistics"
			variant="small"
			@close="modalsStore.closeStats"
		>
			<template #body>
				<div class="stats-section">
					<div class="stats-grid">
						<div class="stat-card">
							<h3>{{ statsStore.stats.gamesPlayed }}</h3>
							<p>Games Played</p>
						</div>
						<div class="stat-card">
							<h3>{{ statsStore.stats.wins }}</h3>
							<p>Wins</p>
						</div>
						<div class="stat-card">
							<h3>{{ statsStore.stats.currentStreak }}</h3>
							<p>Current Streak</p>
						</div>
						<div class="stat-card">
							<h3>{{ statsStore.stats.maxStreak }}</h3>
							<p>Max Streak</p>
						</div>
					</div>
					
					<div class="win-rate">
						<h3>Win Rate</h3>
						<div class="progress-bar">
							<div 
								class="progress-fill" 
								:style="{ width: `${statsStore.winPercentage}%` }"
							></div>
						</div>
						<p>{{ statsStore.winPercentage }}%</p>
					</div>
				</div>
			</template>
		</BaseModal>
	</div>
</template>

<script setup lang="ts">
	import { watch, onMounted, onUnmounted } from 'vue'
	import { useGameStore } from '../stores/game'
	import { useStatsStore } from '../stores/stats'
	import { useThemeStore } from '../stores/theme'
	import { useModalsStore } from '../stores/modals'
	import { useShare } from '../composables/useShare'

	// ============================================================================
	// STORES
	// ============================================================================
	const gameStore = useGameStore()
	const statsStore = useStatsStore()
	const themeStore = useThemeStore()
	const modalsStore = useModalsStore()
	const { onShare } = useShare()

	// ============================================================================
	// LIFECYCLE HOOKS
	// ============================================================================
	onMounted(() => {
		themeStore.loadThemeSettings()
		statsStore.loadStats()
		gameStore.loadState()
		gameStore.startCountdown()
	})

	onUnmounted(() => {
		gameStore.stopCountdown()
	})

	// ============================================================================
	// WATCHERS
	// ============================================================================
	watch(() => gameStore.getUKDateString(), (newDate, oldDate) => {
		if (newDate !== oldDate) {
			gameStore.resetGame()
			location.reload()
		}
	})

	// ============================================================================
	// EVENT HANDLERS
	// ============================================================================
	function handleShare() {
		onShare(gameStore.guesses, gameStore.answer, gameStore.isWin, gameStore.todayStr)
	}

	function handleKeyboardKey(key: string) {
		gameStore.onKeyboardKey(key)
		// Update stats when game ends
		if (gameStore.gameOver && gameStore.showGameOverModal) {
			statsStore.updateStats(gameStore.isWin)
		}
	}
</script>

<style scoped lang="scss">
	// ============================================================================
	// BACK TO MENU BUTTON
	// ============================================================================
	.back-to-menu {
		position: absolute;
		top: 1rem;
		left: 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		color: var(--text-primary);
		padding: 0.5rem 1rem;
		border-radius: var(--global-border-radius);
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
		z-index: 10;
		
		&:hover {
			background: var(--bg-primary);
			border-color: var(--border-hover);
		}
	}

	// ============================================================================
	// GAME OVER MODAL
	// ============================================================================
	.game-over-section {
		text-align: center;
		
		h4 {
			color: var(--text-primary);
			margin-bottom: 1rem;
			font-size: 1.5rem;
		}
		
		.answer {
			color: var(--primary-color);
			font-weight: 700;
		}
		
		.share {
			margin-top: 1rem;
		}
	}

	// ============================================================================
	// INFO MODAL
	// ============================================================================
	.info-section {
		p {
			margin-bottom: 1rem;
			line-height: 1.6;
		}
		
		.examples {
			margin: 1.5rem 0;
			
			.example {
				display: flex;
				gap: 0.25rem;
				margin-bottom: 0.5rem;
				
				.letter {
					width: 2rem;
					height: 2rem;
					border: 2px solid var(--border);
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: 700;
					font-size: 0.9rem;
					
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
	}

	// ============================================================================
	// SETTINGS MODAL
	// ============================================================================
	.settings-section {
		width: 100%;

		.setting-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 1rem;
			width: 100%;
			
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