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

			<div
				v-if="$config.public.isApp"
				class="round-dots"
				:aria-label="`Score ${spotStore.score} of ${spotStore.maxGuesses}`"
			>
				<span
					v-for="(state, i) in roundDots"
					:key="i"
					:class="['dot', state]"
				></span>
			</div>
			<p
				v-else
				class="score-line"
			>
				Score: <strong>{{ spotStore.score }}</strong> / {{ spotStore.maxGuesses }}
			</p>

			<PlaySurfaceFrame>
				<ol
					v-if="isAppBuild && spotStore.gameOver"
					class="spot-recap"
					aria-label="Round by round"
				>
					<li
						v-for="(round, i) in spotStore.rounds"
						:key="i"
						:class="spotStore.roundResults[i]?.correct ? 'right' : 'wrong'"
					>
						<span class="recap-num">{{ i + 1 }}</span>
						<span class="recap-name">{{ round.target.name }}</span>
						<span
							v-if="!spotStore.roundResults[i]?.correct"
							class="recap-pick"
						>
							{{ spotStore.roundResults[i]?.picked || 'Ran out of time' }}
						</span>
						<Icon
							:name="spotStore.roundResults[i]?.correct ? 'solar:check-circle-bold' : 'solar:close-circle-bold'"
							size="1.15rem"
							class="recap-icon"
						/>
					</li>
				</ol>
				<SpotRoundCard
					v-else-if="spotStore.currentRound"
					:round="spotStore.currentRound"
					:reveal-state="spotStore.revealState"
					:time-remaining="spotStore.timeRemaining"
					:round-time="roundTime"
					:picked-name="lastPickedName"
					:round-number="spotStore.roundIndex + 1"
					:total-rounds="spotStore.maxGuesses"
					:score="spotStore.score"
					@pick="handlePick"
				/>
				<button
					v-if="spotStore.awaitingResume && !spotStore.gameOver"
					type="button"
					class="resume-cover"
					@click="spotStore.continueRound()"
				>
					<span class="resume-card">
						<Icon
							name="solar:play-circle-bold"
							size="2.4rem"
						/>
						<strong>Round {{ spotStore.roundIndex + 1 }} of {{ spotStore.maxGuesses }}</strong>
						<span>{{ spotStore.timeRemaining }}s on the clock. Tap to continue.</span>
					</span>
				</button>
				<button
					v-if="spotStore.currentRound && spotStore.revealState !== 'idle' && !spotStore.gameOver"
					type="button"
					class="reveal-skip"
					aria-label="Next round"
					@click="spotStore.skipReveal()"
				>
					<span>Tap to continue</span>
				</button>
			</PlaySurfaceFrame>
			<FullTimePanel
				v-if="isAppBuild && spotStore.gameOver"
				:summary="`${spotStore.score}/${spotStore.maxGuesses} · ${spotStore.scoreLabel}`"
				:is-win="spotStore.isWin"
				:countdown="spotStore.countdown"
				@result="spotStore.showGameOverModal = true"
			/>
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
					<div class="result-share">
						<div
							class="share-row"
							aria-hidden="true"
						>
							<span
								v-for="(r, i) in spotStore.roundResults"
								:key="i"
								:class="['share-tile', 'dot', r.correct ? 'correct' : 'absent']"
							></span>
						</div>
						<ShareResultButton
							:text="shareText"
							@shared="trackShare('spot')"
						/>
					</div>
				</div>
			</template>

			<template #footer>
				<div v-if="spotStore.getNextGameTime">
					<p class="caption">New puzzles in</p>
					<h3>{{ spotStore.countdown }}</h3>
				</div>
				<a
					v-if="!$config.public.isApp"
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
	import ShareResultButton from '../../components/shared/ShareResultButton.vue'
	import FullTimePanel from '../../components/app/FullTimePanel.vue'
	import { useShare } from '../../composables/useShare'

	const isAppBuild = !!useRuntimeConfig().public.isApp

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
	const { getSpotShareText } = useShare()
	const shareText = computed(() =>
		getSpotShareText(
			spotStore.roundResults,
			spotStore.score,
			spotStore.maxGuesses,
			spotStore.puzzleNumber,
			statsStore.stats.currentStreak,
		),
	)
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
		trackShare,
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

	const roundDots = computed(() =>
		Array.from({ length: spotStore.maxGuesses }, (_, i) => {
			const result = spotStore.roundResults[i]
			if (result) return result.correct ? 'hit' : 'miss'
			return i === spotStore.roundIndex ? 'current' : ''
		}),
	)
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

		// iOS app: the Matchday home links straight into play, skipping the intro screen,
		// and a finished game opens on its recap (result sheet too from "See result")
		const start = useRoute().query.start
		if (start === 'play' && spotStore.showIntro && !spotStore.gameOver) handleStartGame()
		if (isAppBuild && spotStore.gameOver) {
			spotStore.showIntro = false
			if (start === 'result') spotStore.showGameOverModal = true
		}
		document.addEventListener('visibilitychange', onVisibility)
	})

	// The round clock only runs while you can see it
	function onVisibility() {
		if (document.hidden) spotStore.pauseRound()
		else spotStore.resumeRound()
	}

	onUnmounted(() => {
		document.removeEventListener('visibilitychange', onVisibility)
		spotStore.pauseRound()
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
	// Finished game (app): who each round was, and what you picked when wrong
	.spot-recap {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		list-style: none;
		margin: 0;
		overflow-y: auto;
		padding: 0.25rem 0.4rem 0.6rem;

		li {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 0.8rem;
			display: grid;
			gap: 0.1rem 0.6rem;
			grid-template-columns: 1.4rem 1fr auto;
			padding: 0.45rem 0.7rem;
			text-align: left;
		}

		.recap-num {
			color: var(--text-secondary);
			font-size: 0.75rem;
			font-weight: 800;
			grid-row: span 2;
		}

		.recap-name {
			font-weight: 700;
			text-transform: capitalize;
		}

		.recap-icon {
			grid-column: 3;
			grid-row: 1 / span 2;
		}

		.right .recap-icon {
			color: var(--color-success);
		}

		.wrong .recap-icon {
			color: var(--color-error, #ff6b6b);
		}

		.recap-pick {
			color: var(--text-secondary);
			font-size: 0.75rem;
			grid-column: 2;
			text-decoration: line-through;
			text-transform: capitalize;
		}
	}


	// Result-sheet share preview (Scout rows / Spot dots) and button
	.result-share {
		align-items: center;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 0.5rem;
		width: 100%;

		.share-grid {
			display: flex;
			flex-direction: column;
			gap: 3px;
		}

		.share-row {
			display: flex;
			gap: 3px;
			justify-content: center;
		}

		.share-tile {
			border-radius: 3px;
			height: 16px;
			width: 16px;

			&.correct {
				background: var(--color-success);
			}

			&.present {
				background: var(--color-present);
			}

			&.absent {
				background: var(--color-absent);
			}

			&.dot {
				border-radius: 50%;
			}
		}

		.share-result-btn {
			width: 100%;
		}
	}

	// A resumed match waits behind this until the player taps
	.resume-cover {
		align-items: center;
		backdrop-filter: blur(10px);
		background: color-mix(in srgb, var(--bg-primary) 70%, transparent);
		border: 0;
		cursor: pointer;
		display: flex;
		inset: 0;
		justify-content: center;
		position: absolute;
		z-index: 4;

		.resume-card {
			align-items: center;
			color: var(--text-secondary);
			display: flex;
			flex-direction: column;
			font-size: 0.9rem;
			gap: 0.4rem;

			.iconify,
			svg {
				color: var(--primary-color);
			}

			strong {
				color: var(--text-primary);
				font-family: var(--font-display);
				font-size: 1.2rem;
			}
		}
	}

	// Covers the round while an answer is revealed; tapping moves on early
	.reveal-skip {
		// Hint sits at the top of the frame, clear of the revealed answer
		align-items: flex-start;
		background: transparent;
		border: 0;
		cursor: pointer;
		display: flex;
		inset: 0;
		justify-content: center;
		padding: 0.15rem 0 0;
		position: absolute;
		z-index: 3;

		span {
			animation: reveal-hint 0.3s 0.5s ease-out both;
			background: color-mix(in srgb, var(--bg-primary) 85%, transparent);
			border: 1px solid var(--border);
			border-radius: 999px;
			color: var(--text-secondary);
			font-size: 0.78rem;
			font-weight: 700;
			padding: 0.2rem 0.7rem;
		}
	}

	@keyframes reveal-hint {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal-skip span {
			animation: none;
		}
	}

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

	// iOS app: one dot per round, filled in as the match goes on
	.round-dots {
		display: flex;
		gap: 0.4rem;
		justify-content: center;
		margin: 0.25rem 0 0.75rem;

		.dot {
			background: color-mix(in srgb, var(--text-secondary) 25%, transparent);
			border-radius: 999px;
			height: 0.5rem;
			transition: all 0.2s ease;
			width: 0.5rem;

			&.hit {
				background: var(--color-success);
			}

			&.miss {
				background: var(--pitchcard-accent-loss);
			}

			&.current {
				background: var(--text-primary);
				width: 1.4rem;
			}
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
