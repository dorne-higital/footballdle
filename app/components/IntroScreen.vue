<template>
	<div class="intro-screen">
		<div class="intro-content">
			<div class="logo-section">
				<h1 class="game-title">Footballdle</h1>
				<p class="game-subtitle">Guess the Premier League footballer</p>
			</div>

			<div v-if="canPlay" class="play-section">
				<p class="intro-text">Ready to test your Premier League knowledge?</p>
				<button @click="$emit('start-game')" class="button primary play-button">
					Play Now
				</button>
			</div>

			<div v-else class="already-played-section">
				<div class="played-icon">🎯</div>
				<h3>Already played today!</h3>
				<p>Looks like you have played today, come back in <strong>{{ countdown }}</strong> to play again</p>
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

const emit = defineEmits(['start-game'])
</script>

<style scoped lang="scss">
.intro-screen {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--bg-gradient);
	padding: 2rem;
}

.intro-content {
	max-width: 500px;
	width: 100%;
	text-align: center;
	background: var(--bg-secondary);
	border-radius: var(--global-border-radius);
	padding: 3rem 2rem;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	border: 1px solid var(--border);
}

.logo-section {
	margin-bottom: 3rem;
}

.game-title {
	font-size: 3rem;
	font-weight: 700;
	background: var(--color-gradient);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin-bottom: 0.5rem;
}

.game-subtitle {
	font-size: 1.1rem;
	color: var(--text-secondary);
	margin: 0;
}

.play-section {
	margin-bottom: 3rem;
}

.intro-text {
	font-size: 1.2rem;
	color: var(--text-primary);
	margin-bottom: 2rem;
}

.play-button {
	font-size: 1.3rem;
	padding: 1rem 3rem;
	border-radius: var(--global-border-radius);
	font-weight: 600;
	transition: all 0.3s ease;
	
	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}
}

.already-played-section {
	margin-bottom: 3rem;
	padding: 2rem;
	background: var(--bg-primary);
	border-radius: var(--global-border-radius);
	border: 1px solid var(--border);
}

.played-icon {
	font-size: 3rem;
	margin-bottom: 1rem;
}

.already-played-section h3 {
	color: var(--text-primary);
	margin-bottom: 1rem;
	font-size: 1.5rem;
}

.already-played-section p {
	color: var(--text-secondary);
	font-size: 1.1rem;
	line-height: 1.5;
	margin: 0;
}

.stats-preview {
	border-top: 1px solid var(--border);
	padding-top: 2rem;
}

.stats-preview h4 {
	color: var(--text-primary);
	margin-bottom: 1.5rem;
	font-size: 1.2rem;
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 1rem;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

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

@media (max-width: 768px) {
	.intro-content {
		padding: 2rem 1.5rem;
	}
	
	.game-title {
		font-size: 2.5rem;
	}
	
	.stats-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
	}
}
</style> 