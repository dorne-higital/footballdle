<template>
	<div class="home-page">
		<!-- Loading Overlay -->
		<div v-if="isLoading" class="loading-overlay">
			<div class="loading-content">
				<Loader variant="dots" text="Loading..." />
			</div>
		</div>
		<!-- Header -->
		<div class="home-header">
			<h1 class="heading">Footballdle</h1>
			
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

		<!-- User Status -->
		<div class="user-status">
			<div class="user-info">
				<Icon name="solar:user-linear" size="1rem" />
					<!-- <span>{{ authStore.displayName }}</span> -->
					<span>Signed in</span>
				<span v-if="authStore.isGuest" class="guest-badge">Guest</span>
			</div>
			<div class="user-actions">
				<button v-if="authStore.isGuest" @click="navigateToLogin" class="signup-btn">
					<Icon name="solar:login-linear" size="1rem" />
					Sign Up
				</button>
				<button v-if="authStore.isLoggedIn" @click="handleLogout" class="logout-btn">
					<Icon name="solar:logout-2-linear" size="1rem" />
					Logout
				</button>
			</div>
		</div>

		<!-- Main Content -->
		<div class="home-content">
			<p class="subheading">Guess the Premier League footballer</p>

			<!-- Game Options -->
			<div class="game-options">
				<!-- Daily Game Section -->
				<div class="game-section">
					<div class="game-info">
						<Icon name="solar:calendar-linear" size="2rem" class="game-icon" />
						<h3>Daily Challenge</h3>
						<p class="caption">New player every day at midnight</p>
					</div>

					<div v-if="gameStore.hasGameInProgress" class="game-in-progress">
						<p class="progress-text">
							You have a game in progress with {{ gameStore.guesses.length }} guess{{ gameStore.guesses.length !== 1 ? 'es' : '' }} made.
						</p>
						<button @click="navigateToGame" class="button primary full">
							<Icon name="solar:play-linear" size="1rem" />
							Resume Game
						</button>
					</div>

					<div v-else-if="gameStore.canPlay" class="game-available">
						<div class="usp-tiles">
							<div class="tile">
								<Icon name="solar:football-outline" size="1.5rem" />
								<h6>25/26 Premier League players</h6>
							</div>
							<div class="tile">
								<Icon name="solar:magnifer-linear" size="1.5rem" />
								<h6>Only players with 6 letter surnames</h6>
							</div>
							<div class="tile">
								<Icon name="solar:shield-warning-linear" size="1.5rem" />
								<h6>Maximum 6 guesses</h6>
							</div>
						</div>
						<button @click="navigateToGame" class="button primary full">
							Play Now
						</button>
					</div>

					<div v-else class="game-completed">
						<div class="countdown">
							<p class="caption">Next game in:</p>
							<h4>{{ gameStore.countdown }}</h4>
						</div>
					</div>
				</div>

				<!-- Challenge Section -->
				<div v-if="challengeStore.isUnlocked && !authStore.isGuest" class="game-section challenge-section">
					<div class="challenge-header">
						<div class="challenge-icon-container">
							<Icon name="solar:lightning-linear" size="2rem" class="challenge-icon" />
							<div class="challenge-glow"></div>
						</div>
						<div class="challenge-title">
							<h3>Speed Challenge</h3>
							<p class="caption">45 second timer • Unlimited plays</p>
						</div>
					</div>

					<div class="challenge-grid">
						<div class="challenge-tile">
							<Icon name="solar:rewind-5-seconds-forward-bold" size="1rem" />
							<span>5 Letters</span>
						</div>
						<div class="challenge-tile">
							<Icon name="solar:football-outline" size="1rem" />
							<span>Current Players</span>
						</div>
						<div class="challenge-tile">
							<Icon name="solar:alarm-outline" size="1rem" />
							<span>45s Timer</span>
						</div>
						<div class="challenge-tile">
							<Icon name="solar:refresh-linear" size="1rem" />
							<span>Unlimited</span>
						</div>
					</div>

					<button @click="navigateToChallenge" class="button challenge-btn full">
						<Icon name="solar:lightning-linear" size="1rem" />
						Start Challenge
					</button>
				</div>

				<!-- Guest Challenge Message -->
				<div v-if="challengeStore.isUnlocked && authStore.isGuest" class="game-section">
					<div class="game-info">
						<Icon name="solar:lightning-linear" size="2rem" class="game-icon" />
						<h3>Speed Challenge</h3>
						<p class="caption">Unlock challenge mode by signing up</p>
					</div>

					<div class="guest-challenge-message">
						<Icon name="solar:lock-linear" size="3rem" />
						<h4>Sign up to unlock challenge mode</h4>
						<p>Create an account to access unlimited challenge games and track your best times.</p>
						<button @click="navigateToLogin" class="button primary full">
							<Icon name="solar:login-linear" size="1rem" />
							Sign Up Now
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Modals -->
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

		<BaseModal
			v-if="modalsStore.showStats"
			heading="Statistics"
			variant="small"
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
							<Loader />
							<p>Loading stats...</p>
						</div>
						
						<!-- Daily Game Stats -->
						<div 
							v-else
							:class="['stats-content', { active: activeStatsTab === 'daily' }]"
						>
							<!-- Guest Stats Message -->
							<div v-if="authStore.isGuest" class="guest-stats-message">
								<Icon name="solar:user-linear" size="3rem" />
								<h3>Sign up to see your stats</h3>
								<p>Create an account to track your progress across devices and unlock challenge mode.</p>
								<button @click="navigateToLogin" class="button primary">
									<Icon name="solar:login-linear" size="1rem" />
									Sign Up Now
								</button>
							</div>
							
							<!-- Authenticated User Stats -->
							<div v-else>
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
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import { useStatsStore } from '../stores/stats'
import { useChallengeStore } from '../stores/challenge'
import { useModalsStore } from '../stores/modals'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { useAnalytics } from '../composables/useAnalytics'
import { useFirestore } from '../composables/useFirestore'

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
const { trackHomeClick, trackLogout, trackPageView } = useAnalytics()

// ============================================================================
// REACTIVE STATE
// ============================================================================
const activeStatsTab = ref('daily')
const isLoading = ref(true)

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================
onMounted(async () => {
	// Track page view
	trackPageView('home')
	
	// Load theme settings
	themeStore.loadThemeSettings()
	
	// Load game state
	gameStore.loadState()
	gameStore.startCountdown()
	
	// Wait for auth to be initialized before loading stats
	while (!authStore.isInitialized) {
		await new Promise(resolve => setTimeout(resolve, 100))
	}
	
	// Load stats
	try {
		await statsStore.loadStats()
		
		if (authStore.isAuthenticated && authStore.user) {
			await statsStore.migrateLocalStatsToFirebase()
		}
	} catch (error) {
		// Silent fail
	}
	
	// Load challenge state and stats
	challengeStore.loadChallengeState()
	try {
		await challengeStore.loadChallengeStats()
		
		if (authStore.isAuthenticated && authStore.user) {
			await challengeStore.migrateLocalChallengeStatsToFirebase()
		}
	} catch (error) {
		// Silent fail
	}
	
	// Check if today's game was completed (for cross-device sync)
	if (authStore.isAuthenticated && authStore.user && statsStore.stats.lastGameCompleted) {
		const today = new Date().toDateString()
		if (statsStore.stats.lastGameCompleted === today) {
			// Today's game was completed on another device
			gameStore.gameOver = true
			gameStore.isWin = true
			gameStore.gameInProgress = false
			gameStore.showIntro = false
			
			// Unlock challenge if not already unlocked
			if (!challengeStore.isUnlocked) {
				challengeStore.unlockChallenge()
			}
		}
	}
	
	// Hide loading spinner
	isLoading.value = false
})

// ============================================================================
// EVENT HANDLERS
// ============================================================================
function navigateToGame() {
	// Check authentication first (allow both authenticated users and guests)
	if (!authStore.isAuthenticated && !authStore.isGuest) {
		window.location.href = '/login'
		return
	}
	
	// Navigate to game
	window.location.href = '/game'
}

function navigateToChallenge() {
	// Check authentication first (only allow authenticated users for challenge)
	if (!authStore.isAuthenticated) {
		window.location.href = '/login'
		return
	}
	
	// Navigate to challenge
	window.location.href = '/challenge'
}

function navigateToLogin() {
	window.location.href = '/login'
}

async function handleLogout() {
	try {
		await authStore.signOutUser()
		// Track logout
		trackLogout()
		// Redirect to login page after logout
		window.location.href = '/login'
	} catch (error) {
		console.error('Logout error:', error)
	}
}
</script>

<style scoped lang="scss">
.home-page {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background: var(--bg-gradient);
	padding: 1.5rem;
	position: relative;
	overflow-x: hidden;
	
	/* Enhanced background with subtle pattern */
	&::before {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: 
			radial-gradient(circle at 20% 80%, rgba(30, 64, 175, 0.08) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.08) 0%, transparent 50%);
		pointer-events: none;
		z-index: -1;
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
		
		p {
			margin-top: 1rem;
			color: var(--text-secondary);
			font-size: 0.9rem;
		}
	}
}

.home-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1.5rem;
	
	.heading {
		font-size: 2.5rem;
		font-weight: 800;
		background: var(--color-gradient);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		letter-spacing: -0.02em;
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

.user-status {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: var(--card-bg);
	backdrop-filter: blur(10px);
	border: 1px solid var(--card-border);
	border-radius: var(--global-border-radius);
	padding: 1rem 1.25rem;
	margin-bottom: 2rem;
	box-shadow: var(--card-shadow);
	transition: all 0.3s ease;
	
	&:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}
	
	.user-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-primary);
		
		.guest-badge {
			background: var(--warning-color);
			color: white;
			padding: 0.25rem 0.5rem;
			border-radius: 12px;
			font-size: 0.7rem;
			font-weight: 600;
		}
	}
	
	.user-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.signup-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--primary-color);
		border: 1px solid var(--primary-color);
		border-radius: var(--global-border-radius);
		padding: 0.5rem 1rem;
		color: white;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.9rem;
		font-weight: 600;
		
		&:hover {
			background: var(--primary-hover);
			border-color: var(--primary-hover);
			transform: translateY(-1px);
		}
	}
	
	.logout-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		padding: 0.5rem 1rem;
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.9rem;
		
		&:hover {
			border-color: var(--border-hover);
			background: var(--error-color);
		}
	}
}

.home-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	
	.subheading {
		text-align: center;
		color: var(--text-secondary);
		font-size: 1.1rem;
		margin-bottom: 2rem;
	}
}

.game-options {
	display: flex;
	flex-direction: column;
	gap: 2rem;
	max-width: 600px;
	margin: 0 auto;
	width: 100%;
}

.game-section {
	background: var(--card-bg);
	backdrop-filter: blur(10px);
	border: 1px solid var(--card-border);
	border-radius: var(--global-border-radius);
	padding: 2.5rem;
	box-shadow: var(--card-shadow);
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: var(--color-gradient);
	}
	
	&:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
	}
	
	.game-info {
		text-align: center;
		margin-bottom: 1.5rem;
		
		.game-icon {
			color: var(--primary-color);
			margin-bottom: 1rem;
			filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
		}
		
		h3 {
			color: var(--text-primary);
			margin-bottom: 0.5rem;
			font-size: 1.5rem;
		}
		
		.caption {
			color: var(--text-secondary);
			font-size: 0.9rem;
		}
	}
	
	.game-in-progress {
		text-align: center;
		
		.progress-text {
			color: var(--text-secondary);
			margin-bottom: 1rem;
			font-size: 0.9rem;
		}
	}
	
	.game-available {
		.usp-tiles {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
			margin-bottom: 1.5rem;
			
			@media (max-width: 600px) {
				grid-template-columns: repeat(1, 1fr);
			}
			
			.tile {
				background: var(--card-bg);
				backdrop-filter: blur(5px);
				border: 1px solid var(--card-border);
				border-radius: var(--global-border-radius);
				padding: 1.25rem;
				text-align: center;
				transition: all 0.3s ease;
				box-shadow: var(--shadow-sm);
				
				&:hover {
					border-color: var(--border-hover);
					transform: translateY(-3px);
					box-shadow: var(--shadow-md);
				}
				
				h6 {
					font-size: 0.8rem;
					margin: 0.5rem 0 0 0;
					color: var(--text-primary);
				}
			}
		}
	}
	
	.game-completed {
		text-align: center;
		
		.countdown {
			background: var(--card-bg);
			backdrop-filter: blur(5px);
			border: 1px solid var(--card-border);
			border-radius: var(--global-border-radius);
			padding: 1.5rem;
			margin: 1rem 0;
			box-shadow: var(--shadow-sm);
			
			.caption {
				color: var(--text-secondary);
				font-size: 0.9rem;
				margin-bottom: 0.5rem;
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}
			
			h4 {
				font-size: 2.5rem;
				font-weight: 800;
				color: var(--text-primary);
				margin: 0.5rem 0;
				background: var(--color-gradient);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				background-clip: text;
			}
		}
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
		width: 100%;
		overflow-x: hidden;
	.stats-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		background: var(--card-bg);
		backdrop-filter: blur(5px);
		border: 1px solid var(--card-border);
		border-radius: var(--global-border-radius);
		padding: 0.25rem;
		box-shadow: var(--shadow-sm);
		width: 100%;
		max-width: 100%;
		
		.tab-btn {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.5rem 0.5rem;
			background: transparent;
			border: none;
			border-radius: calc(var(--global-border-radius) - 2px);
			color: var(--text-secondary);
			cursor: pointer;
			transition: all 0.3s ease;
			font-weight: 600;
			font-size: 0.8rem;
			flex: 1;
			justify-content: center;
			min-width: 0;
			
			&:hover {
				color: var(--text-primary);
				background: rgba(0, 0, 0, 0.05);
			}
			
			&.active {
				background: var(--color-gradient);
				color: white;
				box-shadow: var(--shadow-sm);
				transform: translateY(-1px);
			}
			
			.icon {
				font-size: 0.8rem;
				flex-shrink: 0;
			}
		}
	}
	
	.stats-content-container {
		position: relative;
		min-height: 280px;
		overflow-x: hidden;
		width: 100%;

		.stats-loading {
			text-align: center;
			padding: 2rem;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 1rem;
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
			width: 100%;
			overflow-x: hidden;
			
			&.active {
				opacity: 1;
				visibility: visible;
				transform: translateX(0);
			}
			
			.stats-grid {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 0.75rem;
				margin-bottom: 1rem;
				width: 100%;
				max-width: 100%;

				.stat-card {
					background: var(--card-bg);
					backdrop-filter: blur(5px);
					border: 1px solid var(--card-border);
					border-radius: var(--global-border-radius);
					padding: 1.25rem 0.5rem;
					text-align: center;
					transition: all 0.3s ease;
					position: relative;
					overflow: hidden;
					box-shadow: var(--shadow-sm);
					min-width: 0;
					
					&::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						height: 2px;
						background: var(--color-gradient);
						opacity: 0;
						transition: opacity 0.3s ease;
					}
					
					&:hover {
						border-color: var(--border-hover);
						transform: translateY(-3px);
						box-shadow: var(--shadow-md);
						
						&::before {
							opacity: 1;
						}
					}
					
					h3 {
						font-size: 1.5rem;
						font-weight: 800;
						margin: 0 0 0.25rem 0;
						color: var(--text-primary);
						background: var(--color-gradient);
						-webkit-background-clip: text;
						-webkit-text-fill-color: transparent;
						background-clip: text;
						word-break: break-word;
						overflow-wrap: break-word;
					}
					
					.caption {
						font-size: 0.8rem;
						font-weight: 600;
						color: var(--text-secondary);
						text-transform: uppercase;
						letter-spacing: 0.05em;
						margin: 0;
					}
				}
			}
			
			.win-rate {
				background: var(--card-bg);
				backdrop-filter: blur(5px);
				border: 1px solid var(--card-border);
				border-radius: var(--global-border-radius);
				padding: 1rem;
				box-shadow: var(--shadow-sm);
				position: relative;
				overflow: hidden;
				width: 100%;
				max-width: 100%;
				
				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					height: 2px;
					background: var(--color-gradient);
				}
				
				h3 {
					margin: 0 0 1rem 0;
					color: var(--text-primary);
					font-size: 1.1rem;
					font-weight: 700;
				}
				
				.progress-bar {
					width: 100%;
					height: 10px;
					background: var(--bg-primary);
					border-radius: 6px;
					overflow: hidden;
					margin-bottom: 0.75rem;
					box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
					
					.progress-fill {
						height: 100%;
						background: var(--color-gradient);
						border-radius: 6px;
						transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
						box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
					}
				}
				
				p {
					margin: 0;
					color: var(--text-secondary);
					font-size: 0.9rem;
					font-weight: 600;
					text-align: center;
					text-transform: uppercase;
					letter-spacing: 0.05em;
				}
			}
			
			.stats-storage {
				margin-top: 1rem;
				text-align: center;
				width: 100%;
				
				p {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 0.5rem;
					color: var(--text-secondary);
					font-size: 0.75rem;
					font-weight: 500;
					padding: 0.5rem;
					background: var(--card-bg);
					backdrop-filter: blur(5px);
					border: 1px solid var(--card-border);
					border-radius: var(--global-border-radius);
					box-shadow: var(--shadow-sm);
					width: 100%;
					max-width: 100%;
					word-break: break-word;
					
					.icon {
						color: var(--accent-color);
						flex-shrink: 0;
					}
				}
			}
		}
	}
}

// ============================================================================
// CHALLENGE SECTION STYLES
// ============================================================================
.challenge-section {
	.challenge-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
		
		.challenge-icon-container {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.challenge-icon {
				color: var(--tertiary-color);
				filter: drop-shadow(0 2px 8px rgba(245, 158, 11, 0.3));
				animation: challenge-pulse 2s ease-in-out infinite;
			}
			
			.challenge-glow {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 3rem;
				height: 3rem;
				background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
				border-radius: 50%;
				animation: challenge-glow 3s ease-in-out infinite;
			}
		}
		
		.challenge-title {
			flex: 1;
			
			h3 {
				margin: 0 0 0.25rem 0;
				font-size: 1.25rem;
			}
			
			.caption {
				margin: 0;
				font-size: 0.8rem;
			}
		}
	}
	
	.challenge-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		margin-bottom: 1rem;
		
		@media (max-width: 480px) {
			grid-template-columns: repeat(2, 1fr);
		}
		
		.challenge-tile {
			background: var(--card-bg);
			backdrop-filter: blur(5px);
			border: 1px solid var(--card-border);
			border-radius: var(--global-border-radius);
			padding: 0.75rem 0.5rem;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.5rem;
			transition: all 0.3s ease;
			box-shadow: var(--shadow-sm);
			position: relative;
			overflow: hidden;
			min-width: 0;
			
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 2px;
				background: var(--color-gradient);
				opacity: 0;
				transition: opacity 0.3s ease;
			}
			
			&:hover {
				transform: translateY(-2px);
				box-shadow: var(--shadow-md);
				border-color: var(--border-hover);
				
				&::before {
					opacity: 1;
				}
			}
			
			.icon {
				color: var(--text-secondary);
				transition: color 0.3s ease;
			}
			
			span {
				font-size: 0.7rem;
				font-weight: 600;
				color: var(--text-primary);
				text-align: center;
				text-transform: uppercase;
				letter-spacing: 0.05em;
				line-height: 1.2;
			}
		}
	}
	
	.challenge-btn {
		background: var(--color-gradient);
		border: 2px solid transparent;
		color: white;
		font-weight: 700;
		font-size: 0.9rem;
		padding: 0.75rem 1rem;
		transition: all 0.3s ease;
		box-shadow: var(--shadow-md);
		position: relative;
		overflow: hidden;
		
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: -100%;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
			transition: left 0.5s ease;
		}
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: var(--shadow-lg);
			
			&::before {
				left: 100%;
			}
		}
		
		&:active {
			transform: translateY(0);
		}
	}
}

@keyframes challenge-pulse {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.05);
	}
}

@keyframes challenge-glow {
	0%, 100% {
		opacity: 0.3;
		transform: translate(-50%, -50%) scale(1);
	}
	50% {
		opacity: 0.6;
		transform: translate(-50%, -50%) scale(1.1);
	}
}

// ============================================================================
// GUEST MESSAGES
// ============================================================================
.guest-stats-message {
	text-align: center;
	padding: 2rem;
	background: var(--card-bg);
	backdrop-filter: blur(10px);
	border: 1px solid var(--card-border);
	border-radius: var(--global-border-radius);
	margin: 1rem 0;
	box-shadow: var(--shadow-md);
	position: relative;
	overflow: hidden;
	width: 100%;
	max-width: 100%;
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--color-gradient);
	}
	
	.icon {
		color: var(--text-secondary);
		margin-bottom: 0.75rem;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}
	
	h3 {
		color: var(--text-primary);
		margin-bottom: 0.75rem;
		font-size: 1.25rem;
		font-weight: 700;
	}
	
	p {
		color: var(--text-secondary);
		margin-bottom: 1.25rem;
		line-height: 1.5;
		font-size: 0.9rem;
	}
	
	.button {
		font-size: 0.875rem;
		padding: 0.5rem 1rem;
	}
}

.guest-challenge-message {
	text-align: center;
	padding: 2.5rem;
	background: var(--card-bg);
	backdrop-filter: blur(10px);
	border: 1px solid var(--card-border);
	border-radius: var(--global-border-radius);
	margin: 1.5rem 0;
	box-shadow: var(--shadow-md);
	position: relative;
	overflow: hidden;
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--color-gradient);
	}
	
	.icon {
		color: var(--text-secondary);
		margin-bottom: 1rem;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}
	
	h4 {
		color: var(--text-primary);
		margin-bottom: 1rem;
		font-size: 1.5rem;
		font-weight: 700;
	}
	
	p {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
		line-height: 1.6;
		font-size: 1rem;
	}
}
</style> 