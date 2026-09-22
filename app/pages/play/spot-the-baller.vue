<template>
	<div class="spot-page-wrapper">
	<div :class="['spot-page', { 'is-intro': spotStore.showIntro }]">
		<!-- Intro / ready-to-play screen -->
		<ModeIntroScreen
			v-if="spotStore.showIntro"
			mode-name="Spot the Baller"
			mode-tagline="10 rapid-fire rounds. Pick the right name before the clock runs out."
			:usp-tiles="spotUspTiles"
			:can-play="spotStore.canPlay"
			:countdown="spotStore.countdown"
			:has-incomplete-game="hasIncompleteGame"
			:stats="statsStore.stats"
			:win-percentage="statsStore.winPercentage"
			@start-game="handleStartGame"
			@show-result="spotStore.showGameOverModal = true"
		/>

		<!-- Game Screen -->
		<div
			v-else
			class="game-screen"
		>
			<ScoreboardStrip
				mode-label="Spot the Baller"
				:round-progress="spotStore.roundProgress"
				:streak="statsStore.stats.currentStreak"
			/>

			<p class="score-line">Score: <strong>{{ spotStore.score }}</strong> / {{ spotStore.maxGuesses }}</p>

			<PlaySurfaceFrame>
				<SpotRoundCard
					v-if="spotStore.currentRound"
					:round="spotStore.currentRound"
					:reveal-state="spotStore.revealState"
					:time-remaining="spotStore.timeRemaining"
					:round-time="roundTime"
					:picked-name="lastPickedName"
					@pick="handlePick"
				/>
			</PlaySurfaceFrame>
		</div>

		<!-- Game Over Modal -->
		<PitchCardModal
			v-if="spotStore.showGameOverModal"
			:heading="spotStore.scoreLabel"
			:accent="spotStore.isWin ? 'win' : 'loss'"
			variant="small"
			@close="spotStore.closeGameOverModal"
		>
			<template #body>
				<div class="game-over-section">
					<h4 v-if="spotStore.isWin">You win!</h4>
					<h4 v-else>You lose!</h4>
					<div
						v-if="spotStore.isWin && statsStore.stats.currentStreak > 1"
						class="streak-celebration"
					>
						<Icon
							name="solar:fire-bold"
							size="1rem"
						/>
						{{ streakMessage }}
					</div>
					<p>
						You scored <strong class="answer">{{ spotStore.score }} / {{ spotStore.maxGuesses }}</strong>
					</p>
				</div>
			</template>

			<template #footer>
				<div v-if="spotStore.getNextGameTime">
					<p class="caption">Next game in:</p>
					<h3>{{ spotStore.countdown }}</h3>
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
					:primary-stats="spotPrimaryStats"
					:win-percentage="statsStore.winPercentage"
					:score-histogram="spotScoreHistogram"
					:recent-form="statsStore.stats.recentForm"
				/>
			</template>
		</PitchCardModal>
	</div>

	<DashboardSidePanel
		class="desktop-side-panel"
		active-mode="spotball"
		:daily-streak="dailyStatsStore.stats.currentStreak"
		:scout-streak="scoutStatsStore.stats.currentStreak"
		:spotball-streak="statsStore.stats.currentStreak"
		:streak="statsStore.stats.currentStreak"
		:win-percentage="statsStore.winPercentage"
		:recent-form="statsStore.stats.recentForm"
		@buy-coffee="handleBuyMeCoffee"
	/>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted, onUnmounted, computed, defineAsyncComponent } from 'vue'
	import { useSpotTheBallerStore, SPOT_TIER_LABELS } from '../../stores/spotTheBaller'
	import { SPOT_ROUND_TIME } from '../../composables/useSpotFootballers'
	import { useModeStatsStore } from '../../stores/modeStats'
	import { useModalsStore } from '../../stores/modals'
	import { useAnalytics } from '../../composables/useAnalytics'
	import { useHead } from 'nuxt/app'
	import ModeIntroScreen from '../../components/ModeIntroScreen.vue'
	import ScoreboardStrip from '../../components/shared/ScoreboardStrip.vue'
	import PlaySurfaceFrame from '../../components/shared/PlaySurfaceFrame.vue'
	import SpotRoundCard from '../../components/spot/SpotRoundCard.vue'
	import SeasonFormDashboard from '../../components/shared/SeasonFormDashboard.vue'
	import ThemePickerSettings from '../../components/shared/ThemePickerSettings.vue'
	import DashboardSidePanel from '../../components/shared/DashboardSidePanel.vue'

	definePageMeta({ layout: 'play' })

	const PitchCardModal = defineAsyncComponent(() => import('../../components/shared/PitchCardModal.vue'))

	useHead({
		title: 'Spot the Baller | Footballdle',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk/play/spot-the-baller' }],
		meta: [
			{
				name: 'description',
				content:
					'Spot the Baller: 10 rapid-fire rounds. Pick the right Premier League player from club, nationality and position clues before the clock runs out.',
			},
			{ name: 'robots', content: 'index, follow' },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:title', content: 'Spot the Baller | Footballdle' },
			{
				property: 'og:description',
				content: '10 rapid-fire rounds. Pick the right name before the clock runs out.',
			},
			{ property: 'og:url', content: 'https://footballdle.co.uk/play/spot-the-baller' },
			{ property: 'og:site_name', content: 'Footballdle' },
		],
	})

	// ============================================================================
	// STORES
	// ============================================================================
	const spotStore = useSpotTheBallerStore()
	const statsStore = useModeStatsStore('spotball')
	const dailyStatsStore = useModeStatsStore('daily')
	const scoutStatsStore = useModeStatsStore('scout')
	const modalsStore = useModalsStore()

	const {
		trackGameStart,
		trackGameWin,
		trackGameLoss,
		trackGameAbandon,
		trackGuessSubmitted,
		trackIntroButtonClick,
		trackBuyMeCoffee,
	} = useAnalytics()

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
	const roundTime = SPOT_ROUND_TIME
	const lastPickedName = ref<string | null>(null)

	const spotUspTiles = [
		{ icon: 'solar:flag-linear', text: '10 rapid-fire rounds' },
		{ icon: 'solar:clock-circle-linear', text: '8 seconds per round' },
		{ icon: 'solar:widget-linear', text: 'Pick from multiple choices' },
		{ icon: 'solar:cup-star-linear', text: 'Score 6/10 to keep your streak' },
	]

	const sessionStartTime = ref(Date.now())

	// ============================================================================
	// COMPUTED
	// ============================================================================
	const hasIncompleteGame = computed(() => spotStore.roundResults.length > 0 && !spotStore.gameOver)

	const streakMessage = computed(() => {
		const s = statsStore.stats.currentStreak
		if (s >= 30) return `${s} day streak — absolute legend!`
		if (s >= 14) return `${s} day streak — unstoppable!`
		if (s >= 7) return `${s} day streak — one week!`
		if (s >= 5) return `${s} day streak — on fire!`
		if (s >= 3) return `${s} day streak — smashing it!`
		return `${s} days in a row!`
	})

	const spotPrimaryStats = computed(() => [
		{ label: 'Games', value: statsStore.stats.gamesPlayed },
		{ label: 'Wins', value: statsStore.stats.wins },
		{ label: 'Streak', value: statsStore.stats.currentStreak },
		{ label: 'Max Streak', value: statsStore.stats.maxStreak },
	])

	const spotScoreHistogram = computed(() =>
		SPOT_TIER_LABELS.map((label, i) => ({
			label,
			count: spotStore.tierHistogram[String(i + 1)] || 0,
		})),
	)

	// ============================================================================
	// LIFECYCLE
	// ============================================================================
	onMounted(() => {
		statsStore.loadStats()
		dailyStatsStore.loadStats()
		scoutStatsStore.loadStats()
		spotStore.loadState()
		spotStore.loadTierHistogram()
		spotStore.startCountdown()
		sessionStartTime.value = Date.now()
	})

	onUnmounted(() => {
		if (spotStore.roundResults.length > 0 && !spotStore.gameOver) {
			trackGameAbandon(spotStore.roundResults.length, 'spot_the_baller')
		}
		spotStore.stopCountdown()
	})

	// ============================================================================
	// EVENT HANDLERS
	// ============================================================================
	function handleStartGame() {
		trackIntroButtonClick(hasIncompleteGame.value ? 'resume_game' : 'play_now')
		spotStore.startGame()
		trackGameStart(statsStore.stats.gamesPlayed > 0, 'spot_the_baller')
	}

	function handlePick(name: string) {
		lastPickedName.value = name
		spotStore.pickOption(name)
		trackGuessSubmitted(spotStore.roundIndex + 1, 'spot_the_baller')

		if (spotStore.gameOver && spotStore.showGameOverModal) {
			if (spotStore.isWin) {
				trackGameWin(spotStore.score, 'spot_the_baller')
			} else {
				trackGameLoss(spotStore.score, 'spot_the_baller')
			}
		}
	}
</script>

<style scoped lang="scss">
	.spot-page-wrapper {
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

	.spot-page {
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

	.score-line {
		color: var(--text-secondary);
		font-family: var(--font-mono);
		font-size: 0.8rem;
		margin: 0 0 0.5rem;
		text-align: center;

		strong {
			color: var(--text-primary);
			font-size: 0.95rem;
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
