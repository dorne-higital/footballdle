<template>
	<div class="scout-page-wrapper">
	<div :class="['scout-page', { 'is-intro': scoutStore.showIntro }]">
		<!-- Intro / ready-to-play screen -->
		<ModeIntroScreen
			v-if="scoutStore.showIntro"
			mode-name="Scout Report"
			mode-tagline="Guess any Premier League player from attribute clues"
			:usp-tiles="scoutUspTiles"
			:can-play="scoutStore.canPlay"
			:countdown="scoutStore.countdown"
			:has-incomplete-game="hasIncompleteGame"
			:stats="statsStore.stats"
			:win-percentage="statsStore.winPercentage"
			@start-game="handleStartGame"
			@show-result="scoutStore.showGameOverModal = true"
		/>

		<!-- Game Screen -->
		<div
			v-else
			class="game-screen"
		>
			<ScoreboardStrip
				mode-label="Scout Report"
				:puzzle-number="scoutStore.puzzleNumber"
				:streak="statsStore.stats.currentStreak"
			/>

			<PlaySurfaceFrame>
				<ScoutBoard
					:results="scoutStore.guessResults"
					:max-guesses="scoutStore.maxGuesses"
					:game-over="scoutStore.gameOver"
					:error-message="scoutStore.errorMessage"
					@guess="handleGuess"
				/>
			</PlaySurfaceFrame>
		</div>

		<!-- Game Over Modal -->
		<PitchCardModal
			v-if="scoutStore.showGameOverModal"
			:heading="scoutStore.isWin ? 'Well scouted!' : 'Better luck next time!'"
			:accent="scoutStore.isWin ? 'win' : 'loss'"
			variant="small"
			@close="scoutStore.closeGameOverModal"
		>
			<template #body>
				<div class="game-over-section">
					<h4 v-if="scoutStore.isWin">You win!</h4>
					<h4 v-else>You lose!</h4>
					<div
						v-if="scoutStore.isWin && statsStore.stats.currentStreak > 1"
						class="streak-celebration"
					>
						<Icon
							name="solar:fire-bold"
							size="1rem"
						/>
						{{ streakMessage }}
					</div>
					<p>
						The answer was <strong class="answer">{{ scoutStore.answer }}</strong>
					</p>
				</div>
			</template>

			<template #footer>
				<div v-if="scoutStore.getNextGameTime">
					<p class="caption">Next game in:</p>
					<h3>{{ scoutStore.countdown }}</h3>
				</div>
				<a
					href="https://buymeacoffee.com/dhorne92E"
					target="_blank"
					rel="noopener noreferrer"
					class="coffee-nudge"
					@click.prevent="handleBuyMeCoffee('game_over_modal')"
				>
					<Icon
						name="uil:coffee"
						size="0.9rem"
					/>
					{{
						statsStore.stats.currentStreak >= 3
							? `${statsStore.stats.currentStreak} day streak — buy me a coffee?`
							: 'Enjoying Footballdle? Buy me a coffee'
					}}
				</a>
			</template>
		</PitchCardModal>

		<!-- Settings Modal -->
		<PitchCardModal
			v-if="modalsStore.showSettings"
			heading="Settings"
			accent="info"
			variant="small"
			@close="modalsStore.closeSettings"
		>
			<template #body>
				<ThemePickerSettings @buy-coffee="handleBuyMeCoffee" />
			</template>
		</PitchCardModal>

		<!-- Stats Modal -->
		<PitchCardModal
			v-if="modalsStore.showStats"
			heading="Statistics"
			accent="info"
			variant="small"
			@close="modalsStore.closeStats"
		>
			<template #body>
				<SeasonFormDashboard
					:primary-stats="scoutPrimaryStats"
					:win-percentage="statsStore.winPercentage"
					:distribution="statsStore.stats.guessDistribution"
					:recent-form="statsStore.stats.recentForm"
					:highlight-guess-count="lastGuessCount"
				/>
			</template>
		</PitchCardModal>
	</div>

	<DashboardSidePanel
		class="desktop-side-panel"
		active-mode="scout"
		:daily-streak="dailyStatsStore.stats.currentStreak"
		:scout-streak="statsStore.stats.currentStreak"
		:streak="statsStore.stats.currentStreak"
		:win-percentage="statsStore.winPercentage"
		:recent-form="statsStore.stats.recentForm"
		@buy-coffee="handleBuyMeCoffee"
	/>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted, onUnmounted, computed, defineAsyncComponent } from 'vue'
	import { useScoutReportStore } from '../../stores/scoutReport'
	import { useModeStatsStore } from '../../stores/modeStats'
	import { useModalsStore } from '../../stores/modals'
	import { useAnalytics } from '../../composables/useAnalytics'
	import { useHead } from 'nuxt/app'
	import ModeIntroScreen from '../../components/ModeIntroScreen.vue'
	import ScoreboardStrip from '../../components/shared/ScoreboardStrip.vue'
	import PlaySurfaceFrame from '../../components/shared/PlaySurfaceFrame.vue'
	import ScoutBoard from '../../components/scout/ScoutBoard.vue'
	import SeasonFormDashboard from '../../components/shared/SeasonFormDashboard.vue'
	import ThemePickerSettings from '../../components/shared/ThemePickerSettings.vue'
	import DashboardSidePanel from '../../components/shared/DashboardSidePanel.vue'

	definePageMeta({ layout: 'play' })

	const PitchCardModal = defineAsyncComponent(() => import('../../components/shared/PitchCardModal.vue'))

	useHead({
		title: 'Scout Report | Footballdle',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk/play/scout-report' }],
		meta: [
			{
				name: 'description',
				content:
					'Scout Report: guess any Premier League player. Every guess reveals club, nationality and position clues — narrow it down and build your streak.',
			},
			{ name: 'robots', content: 'index, follow' },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:title', content: 'Scout Report | Footballdle' },
			{
				property: 'og:description',
				content: 'Guess any Premier League player from attribute clues — club, nationality, position.',
			},
			{ property: 'og:url', content: 'https://footballdle.co.uk/play/scout-report' },
			{ property: 'og:site_name', content: 'Footballdle' },
		],
	})

	// ============================================================================
	// STORES
	// ============================================================================
	const scoutStore = useScoutReportStore()
	const statsStore = useModeStatsStore('scout')
	const dailyStatsStore = useModeStatsStore('daily')
	const modalsStore = useModalsStore()

	const { trackGameStart, trackGameWin, trackGameLoss, trackGuessSubmitted, trackIntroButtonClick, trackBuyMeCoffee } =
		useAnalytics()

	function handleBuyMeCoffee(location: string) {
		trackBuyMeCoffee(location)
		if (import.meta.client) {
			const btn = document.querySelector('#bmc-wbtn') as HTMLElement | null
			btn?.click()
		}
	}

	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const scoutUspTiles = [
		{ icon: 'solar:magnifer-linear', text: 'Guess any Premier League player' },
		{ icon: 'solar:shield-linear', text: 'Club, nationality & position clues' },
		{ icon: 'solar:map-point-linear', text: 'Close guesses show partial matches' },
		{ icon: 'solar:shield-warning-linear', text: 'Maximum 6 guesses' },
	]

	const sessionStartTime = ref(Date.now())

	// ============================================================================
	// COMPUTED
	// ============================================================================
	const hasIncompleteGame = computed(() => scoutStore.guesses.length > 0 && !scoutStore.gameOver)
	const lastGuessCount = computed(() =>
		scoutStore.isWin && scoutStore.gameOver ? scoutStore.guesses.length : 0,
	)

	const streakMessage = computed(() => {
		const s = statsStore.stats.currentStreak
		if (s >= 30) return `${s} day streak — absolute legend!`
		if (s >= 14) return `${s} day streak — unstoppable!`
		if (s >= 7) return `${s} day streak — one week!`
		if (s >= 5) return `${s} day streak — on fire!`
		if (s >= 3) return `${s} day streak — smashing it!`
		return `${s} days in a row!`
	})

	const scoutPrimaryStats = computed(() => [
		{ label: 'Games', value: statsStore.stats.gamesPlayed },
		{ label: 'Wins', value: statsStore.stats.wins },
		{ label: 'Streak', value: statsStore.stats.currentStreak },
		{ label: 'Max Streak', value: statsStore.stats.maxStreak },
	])

	// ============================================================================
	// LIFECYCLE
	// ============================================================================
	onMounted(() => {
		statsStore.loadStats()
		dailyStatsStore.loadStats()
		scoutStore.loadState()
		scoutStore.startCountdown()
		sessionStartTime.value = Date.now()
	})

	onUnmounted(() => {
		scoutStore.stopCountdown()
	})

	// ============================================================================
	// EVENT HANDLERS
	// ============================================================================
	function handleStartGame() {
		trackIntroButtonClick(hasIncompleteGame.value ? 'resume_game' : 'play_now')
		scoutStore.startGame()
		trackGameStart(statsStore.stats.gamesPlayed > 0)
	}

	function handleGuess(name: string) {
		const guessesBefore = scoutStore.guesses.length
		scoutStore.submitGuess(name)

		if (scoutStore.guesses.length > guessesBefore) {
			trackGuessSubmitted(scoutStore.guesses.length)
		}

		if (scoutStore.gameOver && scoutStore.showGameOverModal) {
			statsStore.updateStats(scoutStore.isWin, scoutStore.guesses.length, scoutStore.todayStr)
			if (scoutStore.isWin) {
				trackGameWin(scoutStore.guesses.length)
			} else {
				trackGameLoss(scoutStore.guesses.length)
			}
		}
	}
</script>

<style scoped lang="scss">
	.scout-page-wrapper {
		align-items: flex-start;
		display: flex;
		gap: 1.25rem;
		height: 100%;
		justify-content: center;
		width: 100%;
	}

	.desktop-side-panel {
		display: none;
	}

	@media (width >= 1024px) {
		.desktop-side-panel {
			display: flex;
			margin-top: 0.5rem;
		}
	}

	.scout-page {
		align-items: stretch;
		border-radius: var(--global-border-radius);
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		height: 100%;
		justify-content: center;
		max-width: 560px;
		overflow: hidden;
		text-align: center;
		width: 100%;

		&.is-intro {
			overflow-y: auto;
		}

		.game-screen {
			display: flex;
			flex-direction: column;
			height: 100%;
			overflow: hidden;
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
			font-size: 1.5rem;
			margin-bottom: 1rem;
		}

		.answer {
			color: var(--primary-color);
			font-weight: 700;
			letter-spacing: 0.05rem;
			text-transform: capitalize;
		}

		.streak-celebration {
			align-items: center;
			background: linear-gradient(135deg, var(--tertiary-color) 0%, var(--primary-color) 100%);
			border-radius: 2rem;
			color: #fff;
			display: inline-flex;
			font-size: 0.85rem;
			font-weight: 600;
			gap: 0.35rem;
			margin-bottom: 0.75rem;
			padding: 0.3rem 0.9rem;
		}
	}

	.coffee-nudge {
		align-items: center;
		color: var(--text-secondary);
		display: inline-flex;
		font-size: 0.8rem;
		gap: 0.35rem;
		margin-top: 0.75rem;
		text-decoration: none;
		transition: color 0.2s;

		&:hover {
			color: var(--primary-color);
		}
	}
</style>
