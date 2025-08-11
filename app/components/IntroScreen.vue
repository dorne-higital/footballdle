<template>
	<div class="intro-screen">
		<!-- Loading State -->
		<div v-if="isLoading" class="loading-overlay">
			<div class="loading-content">
				<Loader />
			</div>
		</div>
		
		<div class="intro-content">
			<div class="intro-header">
				<h1 class="heading">Footballdle</h1>

				<div class="icons">
					<Icon 
						name="uil:info-circle" 
						@click="$emit('show-info')" 
						size="1.5rem" 
					/>

					<Icon 
						name="uil:setting" 
						@click="$emit('show-settings')" 
						size="1.5rem" 
					/>

					<Icon 
						name="uil:statistics" 
						@click="$emit('show-stats')" 
						size="1.5rem" 
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
				<button v-if="authStore.isLoggedIn" @click="handleLogout" class="logout-btn">
					<Icon name="solar:logout-2-linear" size="1rem" />
					Logout
				</button>
			</div>

			<p class="subheading">Guess the Premier League footballer</p>

			<div v-if="gameStore.hasGameInProgress" class="game-in-progress-section">
				<div class="game-status">
					<Icon name="solar:gamepad-linear" size="2rem" class="game-icon" />
					<h3>Game in Progress</h3>
					<p class="caption">
						You have a game in progress with {{ gameStore.guesses.length }} guess{{ gameStore.guesses.length !== 1 ? 'es' : '' }} made.
					</p>
				</div>

				<button @click="$emit('resume-game')" class="button primary play-button">
					<Icon name="solar:play-linear" size="1rem" />
					Resume Game
				</button>
			</div>

			<div v-else-if="gameStore.canPlay" class="play-section">
				<div class="usp-tiles">
					<div class="tile">
						<Icon name="solar:calendar-linear" size="1.5rem" />

						<h6>New player to guess every day</h6>
					</div>

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

				<h5 class="heading">Ready to play?</h5>

				<button @click="$emit('start-game')" class="button primary play-button">
					Play Now
				</button>
			</div>

			<div v-else class="already-played-section">
				<h3 class="heading">Already played today!</h3>
				<p class="caption">Looks like you have played today, come back tomorrow to play again</p>

				<div class="countdown">
					<h4>{{ countdown }}</h4>
				</div>

				<div v-if="challengeUnlocked" class="challenge-section">
					<div class="challenge-divider">
						<p class="caption">or</p>
					</div>

					<h3>Challenge mode</h3>

					<div class="usp-tiles">
						<div class="tile">
							<Icon 
								name="solar:rewind-5-seconds-forward-bold"
								size="1.5rem" 
							/>

							<h6>Only 5 letters</h6>
						</div>

						<div class="tile">
							<Icon 
								name="solar:earth-linear"
								size="1.5rem" 
							/>

							<h6>Current Premier League player</h6>
						</div>

						<div class="tile">
							<Icon 
								name="solar:alarm-outline"
								size="1.5rem" 
							/>

							<h6>45 second time limit</h6>
						</div>

						<div class="tile">
							<Icon 
								name="solar:refresh-linear"
								size="1.5rem" 
							/>

							<h6>Unlimited attempts</h6>
						</div>
					</div>

					<button @click="$emit('start-challenge')" class="button secondary challenge-button">
						Start Challenge
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { withDefaults, ref, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGameStore } from '../stores/game'

const props = withDefaults(
	defineProps<{
		countdown?: string
		challengeUnlocked?: boolean
		stats?: {
			gamesPlayed: number
			wins: number
			losses: number
			currentStreak: number
			maxStreak: number
		}
		winPercentage?: number
	}>(),
	{
		countdown: '',
		challengeUnlocked: false,
		stats: () => ({
			gamesPlayed: 0,
			wins: 0,
			losses: 0,
			currentStreak: 0,
			maxStreak: 0,
		}),
		winPercentage: 0
	}
)

const emit = defineEmits(['start-game', 'start-challenge', 'resume-game', 'show-info', 'show-settings', 'show-stats'])

const authStore = useAuthStore()
const gameStore = useGameStore()
const isLoading = ref(false) // Start with no loading

async function handleLogout() {
	try {
		await authStore.signOutUser()
		// Reload the page to reset game state
		window.location.reload()
	} catch (error) {
		console.error('Logout error:', error)
	}
}
</script>

<style scoped lang="scss">
	.intro-screen {
		display: flex;
		align-items: stretch;
		justify-content: center;
		background: var(--bg-gradient);
		height: 100%;
		position: relative;

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

		.intro-content {
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
		
			.intro-header {
				align-items: flex-start;
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;

				.heading {
					font-weight: 700;
					background: var(--color-gradient);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
				}

				.icons {
					display: flex;
					flex-direction: row;
					gap: 1rem;
					color: var(--text-secondary);
					
					svg {
						cursor: pointer;
						transition: all 0.3s ease;
						
						&:hover {
							color: var(--text-primary);
							transform: scale(1.1);
						}
					}
				}
			}

			.user-status {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin: 1rem 0;
				padding: 0.75rem;
				background: var(--bg-primary);
				border-radius: var(--global-border-radius);
				border: 1px solid var(--border);

				.user-info {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					color: var(--text-primary);
					font-weight: 500;

					.guest-badge {
						background: var(--text-secondary);
						color: var(--bg-primary);
						padding: 0.25rem 0.5rem;
						border-radius: 0.25rem;
						font-size: 0.75rem;
						font-weight: 600;
					}
				}

				.logout-btn {
					display: flex;
					align-items: center;
					gap: 0.25rem;
					background: transparent;
					border: 1px solid var(--border);
					color: var(--text-secondary);
					padding: 0.5rem 0.75rem;
					border-radius: var(--global-border-radius);
					cursor: pointer;
					transition: all 0.3s ease;
					font-size: 0.875rem;

					&:hover {
						background: var(--primary-color);
						border-color: var(--primary-color);
					}
				}
			}

			.subheading {
				color: var(--text-secondary);
				margin-bottom: 2rem;
			}

			.play-section {
				.usp-tiles {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 1rem;
					margin-bottom: 2rem;
				
					@media (max-width: 600px) {
						grid-template-columns: repeat(1, 1fr);
					}
					
					.tile {
						background: var(--bg-primary);
						border: 1px solid var(--border);
						border-radius: var(--global-border-radius);
						padding: 1rem;
						text-align: center;
						transition: all 0.3s ease;
				
						@media (max-width: 600px) {
							align-items: center;
							display: flex;
							flex-direction: row;
							gap: 1rem;
							padding: 1rem;
							text-align: left;
						}
						
						&:hover {
							border-color: var(--border-hover);
							transform: translateY(-2px);
							box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
						}
						
						h6 {
							font-size: 0.9rem;
							margin-top: 0.5rem;
							color: var(--text-primary);
							font-weight: 600;
						}
					}
				}

				.heading {
					font-size: 1.5rem;
					margin-bottom: 1rem;
					color: var(--text-primary);
				}

				.play-button {
					justify-content: center;
					width: 100%;
					font-size: 1.1rem;
					padding: 1rem;
				}
			}

			.already-played-section {
				background: var(--color-gradient);
				border-radius: var(--global-border-radius);
				border: 1px solid var(--border);
				color: white;
				padding: 1rem;
				margin-top: 1rem;

				.heading {
					font-size: 1.5rem;
					padding-bottom: .5rem;
				}

				.countdown {
					font-weight: 900;
				}

				p, h4 {
					line-height: 1.5;
				}

				p {
					margin-bottom: .5rem;
				}
				
				.challenge-section {
					.challenge-divider {
						text-align: center;
						margin: .5rem 0;
						position: relative;
						
						&::before {
							content: '';
							position: absolute;
							top: 50%;
							left: 0;
							width: calc(50% - 1rem);
							height: 1px;
							background: white;
						}
						
						&::after {
							content: '';
							position: absolute;
							top: 50%;
							right: 0;
							width: calc(50% - 1rem);
							height: 1px;
							background: white;
						}
						
						p {
							padding: 0 1rem;
							text-transform: uppercase;
							position: relative;
							z-index: 1;
						}
					}

					.usp-tiles {
						display: grid;
						grid-template-columns: repeat(2, 1fr);
						gap: .5rem;
						margin: 1rem 0;
					
						@media (max-width: 600px) {
							grid-template-columns: repeat(1, 1fr);
						}
						
						.tile {
							background: rgba(255, 255, 255, 0.1);
							backdrop-filter: blur(10px);
							border: 1px solid rgba(255, 255, 255, 0.2);
							border-radius: var(--global-border-radius);
							color: white;
							padding: 1rem;
							text-align: center;
					
							@media (max-width: 600px) {
								align-items: center;
								display: flex;
								flex-direction: row;
								gap: .5rem;
								padding: .5rem;
								text-align: left;
							}
							
							h6 {
								font-size: 0.8rem;
							}
						}
					}

					.challenge-button {
						justify-content: center;
						width: 100%;
						margin-top: 1rem;
					}
				}
			}
		}
		
		.game-in-progress-section {
			text-align: center;
			padding: 2rem;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--global-border-radius);
			margin: 1rem 0;
			
			.game-status {
				margin-bottom: 1.5rem;
				
				.game-icon {
					color: var(--primary-color);
					margin-bottom: 1rem;
				}
				
				h3 {
					color: var(--text-primary);
					margin-bottom: 0.5rem;
					font-size: 1.3rem;
				}
				
				.caption {
					color: var(--text-secondary);
					font-size: 0.9rem;
				}
			}
			
			.play-button {
				margin-bottom: 1rem;
			}
			
			.button {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 0.5rem;
			}
		}
	}
</style> 