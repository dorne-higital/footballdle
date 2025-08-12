<template>
	<div class="page-container">
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
			:has-incomplete-game="hasIncompleteGame"
			:stats="statsStore.stats"
			:win-percentage="statsStore.winPercentage"
			@start-game="handleStartGame"
			@start-challenge="handleStartChallenge"
			@show-info="handleShowInfo"
			@show-settings="handleShowSettings"
			@show-stats="handleShowStats"
		/>

		<!-- Game Screen -->
		<div v-else-if="!challengeStore.isActive" class="game-screen">
			<HeaderNav 
				:show-back-button="true"
				@show-info="handleShowInfo" 
				@show-settings="handleShowSettings" 
				@show-stats="handleShowStats" 
				@back-to-menu="handleBackToMenu"
			/>

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
				
					<div class="info-footer">
						<p class="caption">
							Footballdle is a word game inspired by Wordle. It is not affiliated with the Premier League or any other football club.
						</p>

						<p class="caption">
							If you spot any missing players, get in touch and I can add them right away.
						</p>

					</div>
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
					<div class="setting-group">
						<label>Choose Theme</label>
						<p>Select your preferred theme</p>
						
						<div class="theme-grid">
							<button 
								:class="['theme-option', { active: themeStore.currentTheme === 'light' }]"
								@click="themeStore.setTheme('light')"
							>
								<div class="theme-preview light">
									<div class="preview-header"></div>
									<div class="preview-content">
										<div class="preview-tile"></div>
										<div class="preview-tile correct"></div>
										<div class="preview-tile"></div>
									</div>
								</div>
								<span class="theme-name">Light</span>
							</button>
							
							<button 
								:class="['theme-option', { active: themeStore.currentTheme === 'dark' }]"
								@click="themeStore.setTheme('dark')"
							>
								<div class="theme-preview dark">
									<div class="preview-header"></div>
									<div class="preview-content">
										<div class="preview-tile"></div>
										<div class="preview-tile correct"></div>
										<div class="preview-tile"></div>
									</div>
								</div>
								<span class="theme-name">Dark</span>
							</button>
							
							<button 
								:class="['theme-option', { active: themeStore.currentTheme === 'greyscale' }]"
								@click="themeStore.setTheme('greyscale')"
							>
								<div class="theme-preview greyscale">
									<div class="preview-header"></div>
									<div class="preview-content">
										<div class="preview-tile"></div>
										<div class="preview-tile correct"></div>
										<div class="preview-tile"></div>
									</div>
								</div>
								<span class="theme-name">Greyscale</span>
							</button>
							
							<button 
								:class="['theme-option', { active: themeStore.currentTheme === 'pastel' }]"
								@click="themeStore.setTheme('pastel')"
							>
								<div class="theme-preview pastel">
									<div class="preview-header"></div>
									<div class="preview-content">
										<div class="preview-tile"></div>
										<div class="preview-tile correct"></div>
										<div class="preview-tile"></div>
									</div>
								</div>
								<span class="theme-name">Pastel</span>
							</button>
						</div>
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
						<div class="toggle-container">
							<button 
								:class="['toggle-btn', { active: activeStatsTab === 'daily' }]"
								@click="activeStatsTab = 'daily'"
							>
								<Icon name="solar:calendar-linear" size="1rem" />
								<span>Daily</span>
							</button>
							<button 
								v-if="challengeStore.challengeStats.gamesPlayed > 0"
								:class="['toggle-btn', { active: activeStatsTab === 'challenge' }]"
								@click="activeStatsTab = 'challenge'"
							>
								<Icon name="solar:lightning-linear" size="1rem" />
								<span>Challenge</span>
							</button>
						</div>
					</div>

					<!-- Stats Content Container -->
					<div class="stats-content-container">
						<!-- Daily Game Stats -->
						<div 
							:class="['stats-content', { active: activeStatsTab === 'daily' }]"
						>
							<div class="stats-grid">
								<div class="stat-card">
									<h3>{{ statsStore.stats.gamesPlayed }}</h3>
									<p class="caption">Games</p>
								</div>
								<div class="stat-card">
									<h3>{{ statsStore.stats.wins }}</h3>
									<p class="caption">Wins</p>
								</div>
								<div class="stat-card">
									<h3>{{ statsStore.stats.currentStreak }}</h3>
									<p class="caption">Streak</p>
								</div>
								<div class="stat-card">
									<h3>{{ statsStore.stats.maxStreak }}</h3>
									<p class="caption">Max Streak</p>
								</div>
							</div>
							
							<div class="win-rate">
								<div class="progress-bar">
									<div 
										class="progress-fill" 
										:style="{ width: `${statsStore.winPercentage}%` }"
									></div>
								</div>
								<p>{{ statsStore.winPercentage }}% win rate</p>
							</div>
						</div>

						<!-- Challenge Stats -->
						<div 
							:class="['stats-content', { active: activeStatsTab === 'challenge' }]"
						>
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
							</div>
							
							<div class="win-rate">
								<div class="progress-bar">
									<div 
										class="progress-fill" 
										:style="{ width: `${challengeStore.winPercentage}%` }"
									></div>
								</div>
								<p>{{ challengeStore.winPercentage }}% win rate</p>
							</div>
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
						<nuxt-link @click="handleEndChallenge" class="button link">
							<Icon 
								name="solar:alt-arrow-left-linear"
								size="1rem" 
							/>

							Home
						</nuxt-link>

						<button @click="challengeStore.startChallenge" class="button primary full">
							Play Again
						</button>
					</div>
				</div>
			</template>
		</BaseModal>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
	import { useGameStore } from '../stores/game'
	import { useStatsStore } from '../stores/stats'
	import { useThemeStore } from '../stores/theme'
	import { useModalsStore } from '../stores/modals'
	import { useChallengeStore } from '../stores/challenge'
	import { useShare } from '../composables/useShare'
	import { useAnalytics } from '../composables/useAnalytics'
	import { useHead } from 'nuxt/app'

	useHead({
		title: 'Footballdle | Guess the Premier League footballer',
		meta: [
			{
				name: 'description',
				content: 'Guess the 6-letter Premier League footballer in 6 tries.'
			},
			{
				name: 'keywords',
				content: 'Premier League, Wordle, Football Game, Soccer Puzzle, Daily Game'
			},
			{
				name: 'author',
				content: 'Footballdle'
			},
			{
				name: 'robots',
				content: 'index, follow'
			},
			{
				name: 'og:title',
				content: 'Footballdle | Guess the Premier League footballer'
			},
			{
				name: 'og:description',
				content: 'Guess the 6-letter Premier League footballer in 6 tries.'
			},
			{
			property: 'og:image',
			content: 'https://footballdle.co.uk/og-image.png'
			},
			{
			property: 'og:url',
			content: 'https://footballdle.co.uk'
			}
		],
	})

	// ============================================================================
	// STORES
	// ============================================================================
	const gameStore = useGameStore()
	const statsStore = useStatsStore()
	const themeStore = useThemeStore()
	const modalsStore = useModalsStore()
	const challengeStore = useChallengeStore()
	const { onShare } = useShare()
	
	// Analytics tracking functions (client-side only)
	const trackGameStart = () => {
		try {
			const { trackGameStart: track } = useAnalytics()
			track()
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	const trackGameWin = (guesses: number) => {
		try {
			const { trackGameWin: track } = useAnalytics()
			track(guesses)
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	const trackGameLoss = (guesses: number) => {
		try {
			const { trackGameLoss: track } = useAnalytics()
			track(guesses)
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	const trackGameAbandon = (guesses: number) => {
		try {
			const { trackGameAbandon: track } = useAnalytics()
			track(guesses)
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	const trackChallengeStart = () => {
		try {
			const { trackChallengeStart: track } = useAnalytics()
			track()
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	const trackChallengeWin = (timeUsed: number) => {
		try {
			const { trackChallengeWin: track } = useAnalytics()
			track(timeUsed)
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	const trackChallengeLoss = (timeUsed: number) => {
		try {
			const { trackChallengeLoss: track } = useAnalytics()
			track(timeUsed)
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	const trackChallengeAbandon = (timeUsed: number) => {
		try {
			const { trackChallengeAbandon: track } = useAnalytics()
			track(timeUsed)
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	const trackShare = (platform?: string) => {
		try {
			const { trackShare: track } = useAnalytics()
			track(platform)
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	const trackModalOpen = (modalName: string) => {
		try {
			const { trackModalOpen: track } = useAnalytics()
			track(modalName)
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	const trackHomeClick = (location: string) => {
		try {
			const { trackHomeClick: track } = useAnalytics()
			track(location)
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	const trackSessionTime = (duration: number) => {
		try {
			const { trackSessionTime: track } = useAnalytics()
			track(duration)
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}

	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const activeStatsTab = ref('daily')
	const isLoading = ref(false)
	const sessionStartTime = ref(Date.now())

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const hasIncompleteGame = computed(() => {
		// Check if there's a saved game for today that's not completed
		// Use the game store state instead of reading from localStorage for reactivity
		if (gameStore.guesses.length > 0 && !gameStore.gameOver) {
			return true
		}
		return false
	})

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
		
		// Track session start
		sessionStartTime.value = Date.now()
	})
	
	// Track session time when leaving
	onUnmounted(() => {
		const sessionDuration = Math.floor((Date.now() - sessionStartTime.value) / 1000)
		trackSessionTime(sessionDuration)
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
	watch(() => gameStore.showGameOverModal, (showModal) => {
		if (showModal && gameStore.gameOver) {
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
		trackShare('native')
	}

	function handleKeyboardKey(key: string) {
		gameStore.onKeyboardKey(key)
		// Update stats when game ends
		if (gameStore.gameOver && gameStore.showGameOverModal) {
			statsStore.updateStats(gameStore.isWin)
			
			// Track game completion
			if (gameStore.isWin) {
				trackGameWin(gameStore.guesses.length)
			} else {
				trackGameLoss(gameStore.guesses.length)
			}
		}
	}

	function handleStartGame() {
		gameStore.startGame()
		trackGameStart()
	}

	function handleStartChallenge() {
		challengeStore.startChallenge()
		gameStore.showIntro = false
		trackChallengeStart()
	}

	function handleEndChallenge() {
		// Track challenge abandonment if not completed
		if (challengeStore.isActive && !challengeStore.gameOver && challengeStore.timeRemaining > 0) {
			const timeUsed = 45 - challengeStore.timeRemaining
			trackChallengeAbandon(timeUsed)
		}
		
		challengeStore.endChallenge()
		gameStore.showIntro = true
	}

	function handleChallengeKey(key: string) {
		challengeStore.onKeyboardKey(key)
	}

	function handleShowInfo() {
		modalsStore.openInfo()
		try {
			const { trackInfoModal } = useAnalytics()
			trackInfoModal()
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	function handleShowSettings() {
		modalsStore.openSettings()
		try {
			const { trackSettingsModal } = useAnalytics()
			trackSettingsModal()
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	function handleShowStats() {
		modalsStore.openStats()
		try {
			const { trackStatsModal } = useAnalytics()
			trackStatsModal()
		} catch (error) {
			// Silently fail if analytics is not available
		}
	}
	
	function handleBackToMenu() {
		// Track game abandonment if game is in progress
		if (gameStore.guesses.length > 0 && !gameStore.gameOver) {
			trackGameAbandon(gameStore.guesses.length)
		}
		
		// Track home click
		trackHomeClick('game_screen')
		
		// If game is completed, force refresh to ensure proper state
		if (gameStore.gameOver) {
			isLoading.value = true
			setTimeout(() => {
				location.reload()
			}, 500)
		} else {
			// Show intro screen for incomplete games
			gameStore.showIntro = true
		}
	}
</script>

<style scoped lang="scss">
	.page-container {
		display: flex;
		align-items: stretch;
		justify-content: center;
		background: var(--bg-gradient);
		padding: 1rem;
		height: 100dvh;
		position: relative;

		.game-screen {
			align-content: center;
			background: var(--bg-secondary);
			border-radius: var(--global-border-radius);
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
			border: 1px solid var(--border);
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			max-width: 500px;
			padding: 1rem;
			text-align: center;
			width: 100%;
		}
	}

	
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
	// GAME OVER MODAL
	// ============================================================================
	.game-over-section {
		text-align: center;
		width: 100%;
		
		h4 {
			color: var(--text-primary);
			margin-bottom: 1rem;
			font-size: 1.5rem;
		}
		
		.answer {
			color: var(--primary-color);
			font-weight: 700;
			letter-spacing: .05rem;
			text-transform: uppercase;
		}
		
		.share {
			justify-content: center;
			margin-top: 1rem;
			width: 50%;
		}
	}

	// ============================================================================
	// INFO MODAL
	// ============================================================================
	.info-section {
		max-height: 60vh;

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

		.info-footer {
			border-top: 1px solid var(--border);
			padding-top: 1rem;
		}
	}

	// ============================================================================
	// SETTINGS MODAL
	// ============================================================================
	.settings-section {
		width: 100%;

		.setting-group {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: 2rem;
			width: 100%;
			
			label {
				font-weight: 600;
				margin-bottom: 0.5rem;
				color: var(--text-primary);
				font-size: 1.1rem;
			}
			
			p {
				margin: 0 0 1rem 0;
				color: var(--text-secondary);
				font-size: 0.9rem;
			}

			.theme-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
				gap: 1rem;
				width: 100%;
				
				.theme-option {
					background: var(--bg-secondary);
					border: 2px solid var(--border);
					border-radius: var(--global-border-radius);
					padding: 1rem;
					cursor: pointer;
					transition: all 0.3s ease;
					text-align: center;
					position: relative;
					overflow: hidden;
					
					&:hover {
						border-color: var(--primary-color);
						transform: translateY(-2px);
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
					}
					
					&.active {
						border-color: var(--primary-color);
						background: var(--primary-color);
						color: white;
						font-weight: 600;
						transform: translateY(-2px);
						box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
					}
					
					.theme-preview {
						width: 100%;
						height: 60px;
						border-radius: calc(var(--global-border-radius) - 2px);
						overflow: hidden;
						margin-bottom: 0.5rem;
						
						.preview-header {
							height: 20px;
							background: var(--bg-primary);
							border-bottom: 1px solid var(--border);
						}
						
						.preview-content {
							height: 40px;
							display: flex;
							align-items: center;
							justify-content: center;
							gap: 0.25rem;
							padding: 0.5rem;
							background: var(--bg-secondary);
							
							.preview-tile {
								width: 1.5rem;
								height: 1.5rem;
								border: 1px solid var(--border);
								border-radius: 2px;
								background: var(--bg-primary);
								
								&.correct {
									background: var(--primary-color);
									border-color: var(--primary-color);
								}
							}
						}
						
						// Theme-specific preview colors
						&.light {
							.preview-header {
								background: #f8fafc;
							}
							.preview-content {
								background: #ffffff;
								.preview-tile {
									background: #f8fafc;
									border-color: #e5e7eb;
									&.correct {
										background: #dc2626;
										border-color: #dc2626;
									}
								}
							}
						}
						
						&.dark {
							.preview-header {
								background: #0f172a;
							}
							.preview-content {
								background: #1e293b;
								.preview-tile {
									background: #0f172a;
									border-color: #334155;
									&.correct {
										background: #ef4444;
										border-color: #ef4444;
									}
								}
							}
						}
						
						&.greyscale {
							.preview-header {
								background: #ffffff;
							}
							.preview-content {
								background: #f0f0f0;
								.preview-tile {
									background: #ffffff;
									border-color: #000000;
									&.correct {
										background: #dc2626;
										border-color: #dc2626;
									}
								}
							}
						}
						
						&.pastel {
							.preview-header {
								background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
							}
							.preview-content {
								background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
								.preview-tile {
									background: #f0f9ff;
									border-color: #bae6fd;
									&.correct {
										background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
										border-color: #0ea5e9;
									}
								}
							}
						}
					}
					
					.theme-name {
						font-size: 0.9rem;
						font-weight: 500;
						display: block;
					}
				}
			}
		}
	}

	// ============================================================================
	// STATS MODAL
	// ============================================================================
	.stats-section {
		width: 80%;

		.stats-toggle {
			margin-bottom: .5rem;
			border-bottom: 1px solid var(--border);
			padding-bottom: .5rem;
			
			.toggle-container {
				display: flex;
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				padding: 0.25rem;
				gap: 0.25rem;
				
				.toggle-btn {
					flex: 1;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 0.5rem;
					padding: 0.75rem 1rem;
					background: transparent;
					border: none;
					border-radius: calc(var(--global-border-radius) - 2px);
					color: var(--text-secondary);
					cursor: pointer;
					transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
					font-weight: 500;
					font-size: 0.9rem;
					position: relative;
					overflow: hidden;
					
					&::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						background: var(--primary-color);
						opacity: 0;
						transition: opacity 0.3s ease;
						z-index: 0;
					}
					
					svg, span {
						position: relative;
						z-index: 1;
						transition: all 0.3s ease;
					}
					
					&:hover {
						color: var(--text-primary);
						transform: translateY(-1px);
						
						&::before {
							opacity: 0.1;
						}
					}
					
					&.active {
						color: white;
						
						&::before {
							opacity: 1;
						}
						
						svg {
							transform: scale(1.1);
						}
					}
				}
			}
		}

		.stats-content-container {
			position: relative;
			min-height: 300px;

			.stats-content {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				opacity: 0;
				visibility: hidden;
				transform: translateX(20px);
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				
				&.active {
					opacity: 1;
					visibility: visible;
					transform: translateX(0);
				}
				
				.stats-grid {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: .5rem;
					margin-bottom: .5rem;

					.stat-card {
						background: var(--bg-secondary);
						border: 1px solid var(--border);
						border-radius: var(--global-border-radius);
						padding: 1rem;
						text-align: center;
						transition: all 0.2s;
						position: relative;
						overflow: hidden;
						
						&:hover {
							border-color: var(--border-hover);
							transform: translateY(-2px);
							box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
							
							&::before {
								opacity: 1;
							}
						}
						
						h3 {
							font-size: 2rem;
							font-weight: 700;
							margin: 0 0 0.5rem 0;
							color: var(--text-primary);
						}
					}
				}
				
				.win-rate {
					background: var(--bg-secondary);
					border: 1px solid var(--border);
					border-radius: var(--global-border-radius);
					padding: 1rem;
					
					h3 {
						margin: 0 0 1rem 0;
						color: var(--text-primary);
						font-size: 1.2rem;
						font-weight: 600;
					}
					
					.progress-bar {
						width: 100%;
						height: 8px;
						background: var(--bg-primary);
						border-radius: 4px;
						overflow: hidden;
						margin-bottom: 0.5rem;
						
						.progress-fill {
							height: 100%;
							background: var(--color-gradient);
							border-radius: 4px;
							transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
						}
					}
					
					p {
						margin: 0;
						color: var(--text-secondary);
						font-size: 0.9rem;
						font-weight: 500;
						text-align: center;
					}
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