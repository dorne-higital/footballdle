<template>
	<div class="challenge-page">
		<!-- Loading Overlay -->
		<div v-if="isLoading" class="loading-overlay">
			<div class="loading-content">
				<Loader variant="dots" text="Loading challenge..." />
			</div>
		</div>
		<!-- Header -->
		<div class="challenge-header">
			<button @click="navigateToHome" class="back-button">
				<Icon name="solar:alt-arrow-left-linear" size="1.2rem" />
				Home
			</button>
		</div>

		<!-- Challenge Content -->
		<div class="challenge-content">
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
				@play-again="handlePlayAgain"
			/>
		</div>

		<!-- Challenge Game Over Modal -->
		<BaseModal
			v-if="challengeStore.gameOver"
			:show="challengeStore.gameOver"
			:heading="challengeStore.isWin ? 'Challenge Complete!' : 'Time\'s Up!'"
			variant="small"
			@close="handleEndChallenge"
		>
			<template #body>
				<div class="challenge-game-over-section">
					<h4 v-if="challengeStore.isWin">
						You solved it in {{ 45 - challengeStore.timeRemaining }} seconds!
					</h4>
					<h4 v-else>Better luck next time!</h4>
					<p>The answer was <strong class="answer">{{ challengeStore.currentAnswer }}</strong></p>
					<div class="challenge-buttons">
						<button @click="handleEndChallenge" class="button secondary">
							<Icon name="solar:home-linear" size="1rem" />
							Home
						</button>

						<button @click="handlePlayAgain" class="button primary">
							<Icon name="solar:refresh-linear" size="1rem" />
							Play Again
						</button>
					</div>
				</div>
			</template>
		</BaseModal>


	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useChallengeStore } from '../stores/challenge'
import { useAuthStore } from '../stores/auth'
import { useGameStore } from '../stores/game'
import { useAnalytics } from '../composables/useAnalytics'

// ============================================================================
// STORES
// ============================================================================
const challengeStore = useChallengeStore()
const authStore = useAuthStore()
const gameStore = useGameStore()

// ============================================================================
// REACTIVE STATE
// ============================================================================
const isLoading = ref(true)

// ============================================================================
// COMPOSABLES
// ============================================================================
const { 
	trackChallengeStart, 
	trackChallengeWin, 
	trackChallengeLoss, 
	trackChallengeAbandon,
	trackHomeClick,
	trackPageView,
	trackChallengePause,
	trackChallengeResume,
	trackChallengeTimeout
} = useAnalytics()

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================
onMounted(async () => {
	// Track page view
	trackPageView('challenge')
	
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

	// Check if daily game is completed - redirect to game if not
	if (gameStore.canPlay || gameStore.hasGameInProgress) {
		window.location.href = '/game'
		return
	}

	// Load challenge state and stats
	challengeStore.loadChallengeState()
	
	try {
		await challengeStore.loadChallengeStats()
		if (authStore.isAuthenticated && authStore.user) {
			await challengeStore.migrateLocalChallengeStatsToFirebase()
		}
	} catch (error) {
		console.error('Error loading challenge stats:', error)
	}
	
	// Start the challenge
	challengeStore.startChallenge()
	
	// Track challenge start
	trackChallengeStart()
	
	// Hide loading spinner
	isLoading.value = false
})

onUnmounted(() => {
	// Track challenge abandonment if not completed
	if (challengeStore.isActive && !challengeStore.gameOver && challengeStore.timeRemaining > 0) {
		const timeUsed = 45 - challengeStore.timeRemaining
		trackChallengeAbandon(timeUsed)
	}
})

// ============================================================================
// EVENT HANDLERS
// ============================================================================
function handleChallengeKey(key: string) {
	challengeStore.onKeyboardKey(key)
}

function handleEndChallenge() {
	// Track challenge abandonment if not completed
	if (challengeStore.isActive && !challengeStore.gameOver && challengeStore.timeRemaining > 0) {
		const timeUsed = 45 - challengeStore.timeRemaining
		trackChallengeAbandon(timeUsed)
	}
	
	// Navigate back to home
	navigateToHome()
}

function handlePlayAgain() {
	// Track challenge completion if it was a win
	if (challengeStore.gameOver && challengeStore.isWin) {
		const timeUsed = 45 - challengeStore.timeRemaining
		challengeStore.updateChallengeStats(true).catch(error => {
			// Silent fail
		})
		trackChallengeWin(timeUsed)
	} else if (challengeStore.gameOver && !challengeStore.isWin) {
		const timeUsed = 45 - challengeStore.timeRemaining
		challengeStore.updateChallengeStats(false).catch(error => {
			// Silent fail
		})
		trackChallengeLoss(timeUsed)
	}
	
	// Start a new challenge
	challengeStore.startChallenge()
}

function navigateToHome() {
	// Track home click
	trackHomeClick('challenge_screen')
	// Navigate to home
	window.location.href = '/'
}


</script>

<style scoped lang="scss">
.challenge-page {
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

.challenge-header {
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
	

}

.challenge-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
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