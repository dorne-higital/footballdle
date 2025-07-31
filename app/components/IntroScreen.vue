<template>
	<div class="intro-screen">
		<div class="intro-header">
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
		</div>
		
		<div class="intro-content">
			<div class="heading-section">
				<h1 class="heading">Footballdle</h1>
				<p class="subheading">Guess the Premier League footballer</p>
			</div>

			<div v-if="canPlay" class="play-section">
				<button @click="$emit('start-game')" class="button primary play-button">
					Play Now
				</button>
			</div>

			<div v-else class="already-played-section">
				<h3 class="heading">Already played today!</h3>
				<p>Looks like you have played today, come back tomorrow to play again</p>

				<div class="countdown">
					<h4>{{ countdown }}</h4>
				</div>
			</div>

			<div class="stats-preview" v-if="stats.gamesPlayed > 0">
				<h4>Your Stats</h4>
				<div class="stats-grid">
					<div class="stat-item">
						<span class="stat-number">{{ stats.gamesPlayed }}</span>
						<span class="stat-label">Played</span>
					</div>
					<div class="stat-item">
						<span class="stat-number">{{ stats.wins }}</span>
						<span class="stat-label">Wins</span>
					</div>
					<div class="stat-item">
						<span class="stat-number">{{ stats.currentStreak }}</span>
						<span class="stat-label">Streak</span>
					</div>
					<div class="stat-item">
						<span class="stat-number">{{ winPercentage }}%</span>
						<span class="stat-label">Win Rate</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue'

const props = withDefaults(
	defineProps<{
		canPlay?: boolean
		countdown?: string
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
		canPlay: true,
		countdown: '',
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

const emit = defineEmits(['start-game', 'show-info', 'show-settings'])
</script>

<style scoped lang="scss">
	.intro-screen {
		display: flex;
		align-items: stretch;
		justify-content: center;
		background: var(--bg-gradient);
		padding: 1rem;
		height: 100dvh;
		position: relative;
		
		.intro-header {
			position: absolute;
			top: 2rem;
			right: 2rem;
			display: flex;
			gap: 1rem;
			z-index: 10;
		}

		.intro-content {
			align-content: center;
			background: var(--bg-secondary);
			border-radius: var(--global-border-radius);
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
			border: 1px solid var(--border);
			display: flex;
			gap: 1rem;
			flex-direction: column;
			justify-content: center;
			max-width: 500px;
			padding: 2rem;
			text-align: center;
			width: 100%;

			.heading-section {
				.heading {
					font-weight: 700;
					background: var(--color-gradient);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
				}

				.subheading {
					color: var(--text-primary);
					margin: 0;
				}
			}

			.play-section {
				.play-button {
					font-size: 1.3rem;
					padding: 1rem 3rem;
					border-radius: var(--global-border-radius);
					font-weight: 600;
					transition: all 0.3s ease;
					margin-top: 2rem;
					
					&:hover {
						transform: translateY(-2px);
						box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
					}
				}
			}

			.already-played-section {
				padding: 2rem;
				background: var(--color-gradient);
				border-radius: var(--global-border-radius);
				border: 1px solid var(--border);

				.heading {
					border-bottom: 1px solid var(--border);
					color: white;
					font-size: 1.5rem;
					margin-bottom: .5rem;
					padding-bottom: .5rem;
				}

				.countdown {
					border-top: 1px solid var(--border);
					font-weight: 900;
					padding: .5rem 0 0;
				}

				p, h4 {
					color: white;
					line-height: 1.5;
				}

				p {
					margin-bottom: .5rem;
				}
			}

			.stats-preview {	
				h4 {
					color: var(--text-primary);
					margin-bottom: 1.5rem;
					font-size: 1.2rem;
				}

				.stats-grid {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 1rem;

					.stat-item {
						display: flex;
						flex-direction: column;
						align-items: center;

						.stat-number {
							font-size: 1.5rem;
							font-weight: 700;
							color: var(--primary-color);
							margin-bottom: 0.25rem;
						}
						
						.stat-label {
							font-size: 0.8rem;
							color: var(--text-secondary);
							text-transform: uppercase;
							letter-spacing: 0.5px;
						}
					}
				}
			}
		}
	}
</style> 