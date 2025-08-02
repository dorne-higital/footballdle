<template>
	<div>
		<!-- Loading Overlay -->
		<div v-if="isLoading" class="loading-overlay">
			<div class="loading-content">
				<Loader />
			</div>
		</div>
		<!-- Intro Screen -->
		<IntroScreen
			v-if="gameStore.showIntro"
			:can-play="gameStore.canPlay"
			:countdown="gameStore.countdown"
			:challenge-unlocked="challengeStore.isUnlocked"
			:stats="statsStore.stats"
			:win-percentage="statsStore.winPercentage"
			@start-game="gameStore.startGame"
			@start-challenge="handleStartChallenge"
			@show-info="modalsStore.openInfo"
			@show-settings="modalsStore.openSettings"
			@show-stats="modalsStore.openStats"
		/>

		<!-- Game Screen -->
		<div v-else-if="!challengeStore.isActive">
			<HeaderNav 
				@show-info="modalsStore.openInfo" 
				@show-settings="modalsStore.openSettings" 
				@show-stats="modalsStore.openStats" 
			/>
			
			<button @click="handleBackToMenu" class="back-to-menu">
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

		<!-- Challenge Screen -->
		<div v-else-if="challengeStore.isActive">
			<ChallengeModal
				:guesses="challengeStore.guesses"
				:current-guess="challengeStore.currentGuess"
				:max-guesses="challengeStore.maxGuesses"
				:answer="challengeStore.currentAnswer"
				:time-remaining="challengeStore.timeRemaining"
				:time-formatted="challengeStore.timeFormatted"
				:can-play="challengeStore.canPlay"
				:is-paused="challengeStore.isPaused"
				:game-over="challengeStore.gameOver"
				@key="handleChallengeKey"
				@end-challenge="handleEndChallenge"
				@toggle-pause="challengeStore.togglePause"
				@play-again="challengeStore.startChallenge"
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
					<!-- Stats Toggle -->
					<div class="stats-toggle">
						<button 
							:class="['toggle-btn', { active: activeStatsTab === 'daily' }]"
							@click="activeStatsTab = 'daily'"
						>
							Daily
						</button>
						<button 
							v-if="challengeStore.challengeStats.gamesPlayed > 0"
							:class="['toggle-btn', { active: activeStatsTab === 'challenge' }]"
							@click="activeStatsTab = 'challenge'"
						>
							Challenge
						</button>
					</div>

					<!-- Daily Game Stats -->
					<div v-if="activeStatsTab === 'daily'" class="stats-content">
						<div class="stats-grid">
							<div class="stat-card">
								<h3>{{ statsStore.stats.gamesPlayed }}</h3>
								<p class="caption">Games Played</p>
							</div>
							<div class="stat-card">
								<h3>{{ statsStore.stats.wins }}</h3>
								<p class="caption">Wins</p>
							</div>
							<div class="stat-card">
								<h3>{{ statsStore.stats.currentStreak }}</h3>
								<p class="caption">Current Streak</p>
							</div>
							<div class="stat-card">
								<h3>{{ statsStore.stats.maxStreak }}</h3>
								<p class="caption">Max Streak</p>
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

					<!-- Challenge Stats -->
					<div v-if="activeStatsTab === 'challenge'" class="stats-content">
						<div class="stats-grid">
							<div class="stat-card">
								<h3>{{ challengeStore.challengeStats.gamesPlayed }}</h3>
								<p class="caption">Challenges</p>
							</div>
							<div class="stat-card">
								<h3>{{ challengeStore.challengeStats.wins }}</h3>
								<p class="caption">Wins</p>
							</div>
							<div class="stat-card">
								<h3>{{ challengeStore.challengeStats.maxStreak }}</h3>
								<p class="caption">Best Streak</p>
							</div>
							<div class="stat-card">
								<h3>{{ challengeStore.challengeStats.bestTime }}s</h3>
								<p class="caption">Best Time</p>
							</div>
							<!-- <div class="stat-card">
								<h3>{{ Math.floor(challengeStore.challengeStats.totalTime / 60) }}m {{ challengeStore.challengeStats.totalTime % 60 }}s</h3>
								<p>Total Time</p>
							</div> -->
						</div>
						
						<div class="win-rate">
							<h3>Challenge Win Rate</h3>
							<div class="progress-bar">
								<div 
									class="progress-fill" 
									:style="{ width: `${challengeStore.winPercentage}%` }"
								></div>
							</div>
							<p>{{ challengeStore.winPercentage }}%</p>
						</div>
					</div>
				</div>
			</template>
		</BaseModal>

		<!-- Challenge Game Over Modal -->
		<BaseModal
			v-if="challengeStore.showGameOverModal"
			:show="challengeStore.showGameOverModal"
			:heading="challengeStore.isWin ? 'Challenge Complete!' : 'Time\'s Up!'"
			variant="small"
			@close="challengeStore.closeGameOverModal"
		>
			<template #body>
				<div class="challenge-game-over-section">
					<h4 v-if="challengeStore.isWin">You solved it in {{ 45 - challengeStore.timeRemaining }} seconds!</h4>
					<h4 v-else>Better luck next time!</h4>
					<p>The answer was <strong class="answer">{{ challengeStore.currentAnswer }}</strong></p>
					<div class="challenge-buttons">
						<button @click="challengeStore.startChallenge" class="button primary">
							Play Again
						</button>
						<button @click="handleEndChallenge" class="button secondary">
							Back to Menu
						</button>
					</div>
				</div>
			</template>
		</BaseModal>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
	import HeaderNav from '../components/HeaderNav.vue'
	import GameBoard from '../components/GameBoard.vue'
	import Keyboard from '../components/Keyboard.vue'
	import BaseModal from '../components/BaseModal.vue'
	import IntroScreen from '../components/IntroScreen.vue'
	import ChallengeModal from '../components/ChallengeModal.vue'
	import { useGameStore } from '../stores/game'
	import { useStatsStore } from '../stores/stats'
	import { useThemeStore } from '../stores/theme'
	import { useModalsStore } from '../stores/modals'
	import { useChallengeStore } from '../stores/challenge'
	import { useShare } from '../composables/useShare'

	// ============================================================================
	// STORES
	// ============================================================================
	const gameStore = useGameStore()
	const statsStore = useStatsStore()
	const themeStore = useThemeStore()
	const modalsStore = useModalsStore()
	const challengeStore = useChallengeStore()
	const { onShare } = useShare()

	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const activeStatsTab = ref('daily')
	const isLoading = ref(false)

	// ============================================================================
	// LIFECYCLE HOOKS
	// ============================================================================
	onMounted(() => {
		themeStore.loadThemeSettings()
		statsStore.loadStats()
		gameStore.loadState()
		gameStore.startCountdown()
		
		// Load challenge state
		challengeStore.loadChallengeState()
		challengeStore.loadChallengeStats()
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
			challengeStore.resetDaily()
			location.reload()
		}
	})

	// Watch for game completion to unlock challenge mode
	watch(() => gameStore.gameOver, (isGameOver) => {
		if (isGameOver) {
			challengeStore.unlockChallenge()
		}
	})

	// Reset stats tab to daily when stats modal opens
	watch(() => modalsStore.showStats, (showStats) => {
		if (showStats) {
			activeStatsTab.value = 'daily'
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
		// Update stats when game ends and unlock challenge mode
		if (gameStore.gameOver && gameStore.showGameOverModal) {
			statsStore.updateStats(gameStore.isWin)
			// Unlock challenge mode when game is completed
			challengeStore.unlockChallenge()
		}
	}

	function handleStartChallenge() {
		challengeStore.startChallenge()
		gameStore.showIntro = false
	}

	function handleEndChallenge() {
		challengeStore.endChallenge()
		gameStore.showIntro = true
	}

	function handleChallengeKey(key: string) {
		challengeStore.onKeyboardKey(key)
	}

	function handleBackToMenu() {
		isLoading.value = true
		setTimeout(() => {
			location.reload()
		}, 1000)
	}
</script>

<style scoped lang="scss">
	// ============================================================================
	// LOADING OVERLAY
	// ============================================================================
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--bg-gradient);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;

		.loading-content {
			text-align: center;
			color: var(--text-primary);
			position: relative;
			width: 100%;
			height: 100%;
		}
	}

	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translate(-50%, -50%) translateY(0);
		}
		40% {
			transform: translate(-50%, -50%) translateY(-80px);
		}
		60% {
			transform: translate(-50%, -50%) translateY(-40px);
		}
	}

	@keyframes shadow {
		0%, 20%, 50%, 80%, 100% {
			transform: translate(-50%, -50%) scaleX(1);
			opacity: 0.3;
		}
		40% {
			transform: translate(-50%, -50%) scaleX(0.3);
			opacity: 0.1;
		}
		60% {
			transform: translate(-50%, -50%) scaleX(0.6);
			opacity: 0.2;
		}
	}

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
	.stats-toggle {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		border-bottom: 1px solid var(--border);
		padding-bottom: 1rem;
		
		.toggle-btn {
			flex: 1;
			padding: 0.75rem 1rem;
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: var(--global-border-radius);
			color: var(--text-secondary);
			cursor: pointer;
			transition: all 0.2s;
			font-weight: 500;
			
			&:hover {
				background: var(--bg-secondary);
				border-color: var(--border-hover);
			}
			
			&.active {
				background: var(--primary-color);
				border-color: var(--primary-color);
				color: white;
			}
		}
	}

	.stats-content {
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
	}



	// ============================================================================
	// CHALLENGE GAME OVER MODAL
	// ============================================================================
	.challenge-game-over-section {
		text-align: center;
		
		h4 {
			color: var(--text-primary);
			margin-bottom: 1rem;
			font-size: 1.5rem;
		}
		
		.answer {
			color: var(--tertiary-color);
			font-weight: 700;
		}
		
		.challenge-buttons {
			display: flex;
			gap: 1rem;
			justify-content: center;
			margin-top: 1.5rem;
		}
	}
</style> 