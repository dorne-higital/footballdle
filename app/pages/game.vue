<template>
	<div class="game-page">
		<!-- Loading Overlay -->
		<div v-if="isLoading" class="loading-overlay">
			<div class="loading-content">
				<Loader variant="dots" text="Loading game..." />
			</div>
		</div>
		<!-- Header -->
		<div class="game-header">
			<button @click="navigateToHome" class="back-button">
				<Icon name="solar:alt-arrow-left-linear" size="1.2rem" />
				Home
			</button>
			
			<div class="header-actions">
				<Icon 
					name="uil:info-circle" 
					@click="modalsStore.openInfo()" 
					size="1.5rem" 
					class="header-icon"
				/>
				<Icon 
					name="uil:setting" 
					@click="modalsStore.openSettings()" 
					size="1.5rem" 
					class="header-icon"
				/>
				<Icon 
					name="uil:statistics" 
					@click="modalsStore.openStats()" 
					size="1.5rem" 
					class="header-icon"
				/>
			</div>
		</div>

		<!-- Game Content -->
		<div class="game-content">
			<GameBoard 
				:guesses="gameStore.guesses"
				:current-guess="gameStore.currentGuess"
				:max-guesses="gameStore.maxGuesses"
				:answer="gameStore.answer"
			/>

			<Keyboard @key="handleKeyboardKey" />
		</div>

		<!-- Modals -->
		<BaseModal
			v-if="gameStore.showGameOverModal"
			:show="gameStore.showGameOverModal"
			:heading="gameStore.isWin ? 'Congratulations!' : 'Game Over!'"
			variant="small"
			@close="gameStore.closeGameOverModal"
		>
			<template #body>
				<div class="game-over-section">
					<h4 v-if="gameStore.isWin">You got it!</h4>
					<h4 v-else>Better luck next time!</h4>
					<p>The answer was <strong class="answer">{{ gameStore.answer }}</strong></p>
					
					<div class="game-over-buttons">
						<button @click="handleShare" class="button secondary">
							<Icon name="solar:share-linear" size="1rem" />
							Share
						</button>
						
						<button @click="navigateToHome" class="button primary">
							<Icon name="solar:home-linear" size="1rem" />
							Home
						</button>
					</div>
				</div>
			</template>

			<template #footer>
				<div v-if="gameStore.countdown">
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
								<span>Light</span>
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
								<span>Dark</span>
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
			variant="large"
			@close="modalsStore.closeStats"
		>
			<template #body>
				<div class="stats-section">
					<div class="stats-tabs">
						<button 
							:class="['tab-btn', { active: activeStatsTab === 'daily' }]"
							@click="activeStatsTab = 'daily'"
						>
							<Icon name="solar:calendar-linear" size="1rem" />
							<span>Daily</span>
						</button>
						
						<button 
							v-if="challengeStore.challengeStats.gamesPlayed > 0"
							:class="['tab-btn', { active: activeStatsTab === 'challenge' }]"
							@click="activeStatsTab = 'challenge'"
						>
							<Icon name="solar:lightning-linear" size="1rem" />
							<span>Challenge</span>
						</button>
					</div>

					<!-- Stats Content Container -->
					<div class="stats-content-container">
						<!-- Loading State -->
								<div v-if="statsStore.isLoading" class="stats-loading">
			<Loader variant="dots" text="Loading stats..." />
		</div>
						
						<!-- Daily Game Stats -->
						<div 
							v-else
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
							
							<!-- Stats Storage Indicator -->
							<div class="stats-storage">
								<p class="caption">
									<Icon 
										:name="authStore.isAuthenticated ? 'solar:cloud-linear' : 'solar:device-linear'" 
										size="0.8rem" 
									/>
									{{ authStore.isAuthenticated ? 'Stats saved to cloud' : 'Stats saved locally' }}
								</p>
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
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from '../stores/game'
import { useStatsStore } from '../stores/stats'
import { useChallengeStore } from '../stores/challenge'
import { useModalsStore } from '../stores/modals'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { useFirestore } from '../composables/useFirestore'
import { useShare } from '../composables/useShare'
import { useAnalytics } from '../composables/useAnalytics'

// ============================================================================
// STORES
// ============================================================================
const gameStore = useGameStore()
const statsStore = useStatsStore()
const challengeStore = useChallengeStore()
const modalsStore = useModalsStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()

// ============================================================================
// COMPOSABLES
// ============================================================================
const { onShare } = useShare()
const { 
	trackGameStart, 
	trackGameWin, 
	trackGameLoss, 
	trackGameAbandon,
	trackShare,
	trackHomeClick,
	trackSessionTime,
	trackPageView,
	trackGuessSubmit
} = useAnalytics()

// ============================================================================
// REACTIVE STATE
// ============================================================================
const activeStatsTab = ref('daily')
const isLoading = ref(true)
const sessionStartTime = ref(Date.now())

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================
onMounted(async () => {
	// Track page view
	trackPageView('game')
	
	// Wait for auth to initialize before checking
	await new Promise(resolve => {
		const checkAuth = () => {
			if (authStore.isInitialized) {
				resolve(true)
			} else {
				setTimeout(checkAuth, 100)
			}
		}
		checkAuth()
	})

	// Check authentication - redirect to login if not authenticated and not guest
	if (!authStore.isAuthenticated && !authStore.isGuest) {
		window.location.href = '/login'
		return
	}

	// Load game state
	gameStore.loadState()
	gameStore.startCountdown()
	
	// Load stats
	try {
		await statsStore.loadStats()
		if (authStore.isAuthenticated && authStore.user) {
			await statsStore.migrateLocalStatsToFirebase()
		}
	} catch (error) {
		console.error('Error loading stats:', error)
	}
	
	// Load challenge stats
	try {
		await challengeStore.loadChallengeStats()
		if (authStore.isAuthenticated && authStore.user) {
			await challengeStore.migrateLocalChallengeStatsToFirebase()
		}
	} catch (error) {
		console.error('Error loading challenge stats:', error)
	}
	
	// Track session start
	sessionStartTime.value = Date.now()
	
	// Track game start
	trackGameStart()
	
	// Hide loading spinner
	isLoading.value = false
})

onUnmounted(() => {
	// Track session time when leaving
	const sessionDuration = Math.floor((Date.now() - sessionStartTime.value) / 1000)
	trackSessionTime(sessionDuration)
	
	// Stop countdown
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
	if (showModal) {
		challengeStore.unlockChallenge()
	}
})

// Ensure user profile exists when game loads
onMounted(async () => {
	if (authStore.isAuthenticated && authStore.user) {
		try {
			const { getUserProfile, createUserProfile } = useFirestore()
			const existingProfile = await getUserProfile(authStore.user.uid)
			
			if (!existingProfile) {
				await createUserProfile(authStore.user.uid, {
					displayName: authStore.user.email,
					email: authStore.user.email,
				})
			}
		} catch (error) {
			// Silent fail
		}
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
function handleKeyboardKey(key: string) {
	gameStore.onKeyboardKey(key)
	// Update stats when game ends
	if (gameStore.gameOver && gameStore.showGameOverModal) {
		// Update stats asynchronously
		statsStore.updateStats(gameStore.isWin).catch(error => {
			// Silent fail
		})
		
		// Track game completion
		if (gameStore.isWin) {
			trackGameWin(gameStore.guesses.length)
		} else {
			trackGameLoss(gameStore.guesses.length)
		}
	}
}

function handleShare() {
	onShare(gameStore.guesses, gameStore.answer, gameStore.isWin, gameStore.todayStr)
	trackShare('native')
}

function navigateToHome() {
	// Track home click
	trackHomeClick('game_screen')
	// Navigate to home
	window.location.href = '/'
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
</script>

<style scoped lang="scss">
.game-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: var(--bg-gradient);
	padding: 1rem;
	position: relative;
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
		
		p {
			margin-top: 1rem;
			color: var(--text-secondary);
			font-size: 0.9rem;
		}
	}
}

.game-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	
	.back-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		padding: 0.5rem 1rem;
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.2s;
		
		&:hover {
			border-color: var(--border-hover);
			background: var(--bg-primary);
		}
	}
	
	.header-actions {
		display: flex;
		gap: 1rem;
		
		.header-icon {
			color: var(--text-secondary);
			cursor: pointer;
			transition: color 0.2s;
			
			&:hover {
				color: var(--text-primary);
			}
		}
	}
}

.game-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	gap: 1rem;
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
		color: var(--tertiary-color);
		font-weight: 700;
	}
	
	.game-over-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1.5rem;
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
	
	.caption {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}
	
	.examples {
		margin: 1.5rem 0;
		
		.example {
			display: flex;
			gap: 0.25rem;
			margin-bottom: 0.5rem;
			justify-content: center;
			
			.letter {
				width: 2rem;
				height: 2rem;
				display: flex;
				align-items: center;
				justify-content: center;
				background: var(--bg-primary);
				border: 1px solid var(--border);
				border-radius: 4px;
				font-weight: 600;
				font-size: 0.9rem;
				
				&.correct {
					background: var(--success-color);
					border-color: var(--success-color);
					color: white;
				}
				
				&.present {
					background: var(--warning-color);
					border-color: var(--warning-color);
					color: white;
				}
				
				&.absent {
					background: var(--error-color);
					border-color: var(--error-color);
					color: white;
				}
			}
		}
	}
	
	.info-footer {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
}

// ============================================================================
// SETTINGS MODAL
// ============================================================================
.settings-section {
	.setting-group {
		margin-bottom: 2rem;
		
		label {
			display: block;
			font-weight: 600;
			margin-bottom: 0.5rem;
			color: var(--text-primary);
		}
		
		p {
			color: var(--text-secondary);
			margin-bottom: 1rem;
			font-size: 0.9rem;
		}
		
		.theme-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
			
			.theme-option {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 0.5rem;
				padding: 1rem;
				border: 2px solid var(--border);
				border-radius: var(--global-border-radius);
				background: var(--bg-secondary);
				cursor: pointer;
				transition: all 0.2s;
				
				&:hover {
					border-color: var(--border-hover);
				}
				
				&.active {
					border-color: var(--primary-color);
					background: var(--primary-color);
					color: white;
				}
				
				.theme-preview {
					width: 100%;
					height: 60px;
					border-radius: 8px;
					overflow: hidden;
					
					&.light {
						background: #ffffff;
						border: 1px solid #e5e7eb;
						
						.preview-header {
							height: 20px;
							background: #f3f4f6;
						}
						
						.preview-content {
							height: 40px;
							display: flex;
							align-items: center;
							justify-content: center;
							gap: 4px;
							padding: 8px;
							
							.preview-tile {
								width: 16px;
								height: 16px;
								border: 1px solid #d1d5db;
								border-radius: 2px;
								
								&.correct {
									background: #10b981;
									border-color: #10b981;
								}
							}
						}
					}
					
					&.dark {
						background: #1f2937;
						border: 1px solid #374151;
						
						.preview-header {
							height: 20px;
							background: #111827;
						}
						
						.preview-content {
							height: 40px;
							display: flex;
							align-items: center;
							justify-content: center;
							gap: 4px;
							padding: 8px;
							
							.preview-tile {
								width: 16px;
								height: 16px;
								border: 1px solid #4b5563;
								border-radius: 2px;
								background: #374151;
								
								&.correct {
									background: #10b981;
									border-color: #10b981;
								}
							}
						}
					}
				}
				
				span {
					font-size: 0.9rem;
					font-weight: 500;
				}
			}
		}
	}
}

// ============================================================================
// STATS MODAL
// ============================================================================
.stats-section {
	.stats-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		
		.tab-btn {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.75rem 1rem;
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: var(--global-border-radius);
			color: var(--text-secondary);
			cursor: pointer;
			transition: all 0.2s;
			font-weight: 500;
			
			&:hover {
				color: var(--text-primary);
				border-color: var(--border-hover);
			}
			
			&.active {
				background: var(--primary-color);
				border-color: var(--primary-color);
				color: white;
			}
		}
	}
	
	.stats-content-container {
		position: relative;
		min-height: 300px;

		.stats-loading {
			text-align: center;
			padding: 2rem;
			
			p {
				margin-top: 1rem;
				color: var(--text-secondary);
			}
		}
		
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
			
			.stats-storage {
				margin-top: 1rem;
				text-align: center;
				
				p {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 0.5rem;
					color: var(--text-secondary);
					font-size: 0.8rem;
				}
			}
		}
	}
}
</style> 