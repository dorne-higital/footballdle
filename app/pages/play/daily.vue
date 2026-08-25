<template>
	<div :class="['daily-page', { 'is-intro': gameStore.showIntro }]">
		<!-- Intro / ready-to-play screen -->
		<ModeIntroScreen
			v-if="gameStore.showIntro"
			mode-name="Daily"
			mode-tagline="Guess the Premier League footballer"
			:usp-tiles="dailyUspTiles"
			:can-play="gameStore.canPlay"
			:countdown="gameStore.countdown"
			:challenge-unlocked="challengeStore.isUnlocked"
			:has-incomplete-game="hasIncompleteGame"
			:prev-answer-link="`/solution/${yesterdayISO}`"
			:stats="statsStore.stats"
			:win-percentage="statsStore.winPercentage"
			@start-game="handleStartGame"
			@start-challenge="handleStartChallenge"
			@show-info="handleShowInfo"
			@show-settings="handleShowSettings"
			@show-stats="handleShowStats"
			@buy-coffee="handleBuyMeCoffee"
			@show-result="gameStore.showGameOverModal = true"
		/>

		<!-- Game Screen -->
		<div
			v-else-if="!challengeStore.isActive"
			class="game-screen"
		>
			<HeaderNav
				:show-back-button="true"
				@show-info="handleShowInfo"
				@show-settings="handleShowSettings"
				@show-stats="handleShowStats"
				@back-to-menu="handleBackToMenu"
				@buy-coffee="handleBuyMeCoffee"
			/>

			<ScoreboardStrip
				mode-label="Daily"
				:puzzle-number="gameStore.puzzleNumber"
				:streak="statsStore.stats.currentStreak"
			/>

			<PlaySurfaceFrame>
				<GameBoard
					:guesses="gameStore.guesses"
					:answer="gameStore.answer"
					:maxGuesses="gameStore.maxGuesses"
					:currentGuess="gameStore.currentGuess"
					:game-over="gameStore.gameOver"
					:error-message="gameStore.errorMessage"
				/>
			</PlaySurfaceFrame>

			<TransitionGroup
				v-if="gameStore.hints.length"
				name="hint"
				tag="div"
				class="hints-container"
			>
				<div
					v-for="hint in gameStore.hints"
					:key="hint.label"
					class="hint-chip"
				>
					<Icon
						:name="hint.icon"
						size="0.85rem"
					/>
					<span class="hint-value">{{ hint.value }}</span>
				</div>
			</TransitionGroup>

			<button
				v-if="gameStore.canPurchaseHint && (adPlatformReady || isAdTestMode)"
				class="watch-ad-btn"
				:disabled="adLoading"
				@click="handleWatchAd"
			>
				<Icon
					name="solar:play-circle-linear"
					size="1rem"
				/>
				{{ adLoading ? 'Loading ad...' : 'Watch an ad for a hint' }}
			</button>

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
		<div
			v-else-if="challengeStore.isActive"
			class="challenge-screen"
		>
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
				:error-message="challengeStore.errorMessage"
				@key="handleChallengeKey"
				@end-challenge="handleEndChallenge"
				@toggle-pause="challengeStore.togglePause"
				@play-again="challengeStore.startChallenge"
			/>
		</div>

		<!-- Game Over Modal -->
		<PitchCardModal
			v-if="gameStore.showGameOverModal"
			:heading="gameStore.isWin ? 'Well played!' : 'Better luck next time!'"
			:accent="gameStore.isWin ? 'win' : 'loss'"
			variant="small"
			@close="gameStore.closeGameOverModal"
		>
			<template #body>
				<div class="game-over-section">
					<h4 v-if="gameStore.isWin">You win!</h4>
					<h4 v-else>You lose!</h4>
					<div
						v-if="gameStore.isWin && statsStore.stats.currentStreak > 1"
						class="streak-celebration"
					>
						<Icon
							name="solar:fire-bold"
							size="1rem"
						/>
						{{ streakMessage }}
					</div>
					<p>
						The answer was <strong class="answer">{{ gameStore.answer }}</strong>
					</p>
					<div class="share-preview">
						<p class="share-header">
							Footballdle ⚽ #{{ gameStore.puzzleNumber }} &nbsp;·&nbsp;
							{{ gameStore.isWin ? gameStore.guesses.length : 'X' }}/6
						</p>
						<div class="share-emoji-grid">
							<div
								v-for="(guess, gi) in gameStore.guesses"
								:key="gi"
								class="share-row"
							>
								<span
									v-for="(char, ci) in guess.split('')"
									:key="ci"
									class="share-tile"
									:class="{
										correct:
											gameStore.answer[ci] &&
											char.toUpperCase() === gameStore.answer[ci].toUpperCase(),
										present:
											!(
												gameStore.answer[ci] &&
												char.toUpperCase() === gameStore.answer[ci].toUpperCase()
											) && gameStore.answer.toUpperCase().includes(char.toUpperCase()),
										absent: !gameStore.answer.toUpperCase().includes(char.toUpperCase()),
									}"
								></span>
							</div>
						</div>
					</div>
					<div class="share-buttons">
						<button
							class="button primary"
							@click="handleShare"
						>
							<Icon
								name="solar:copy-linear"
								size="1rem"
							/>
							{{ shareToast ? 'Copied!' : 'Copy result' }}
						</button>
						<button
							class="btn-x"
							@click="handleShareTwitter"
						>
							<Icon
								name="ri:twitter-x-fill"
								size="1rem"
							/>
							Share on X
						</button>
					</div>
				</div>
			</template>

			<template #footer>
				<div v-if="gameStore.getNextGameTime">
					<p class="caption">Next game in:</p>
					<h3>{{ gameStore.countdown }}</h3>
				</div>
				<NuxtLink
					:to="`/solution/${yesterdayISO}`"
					class="yesterday-link"
					title="View yesterday's answer"
				>
					<Icon
						name="solar:history-linear"
						size="0.9rem"
					/>
					Yesterday's answer
				</NuxtLink>
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
				<div class="stats-section">
					<div class="stats-toggle">
						<div class="toggle-container">
							<button
								:class="['toggle-btn', { active: activeStatsTab === 'daily' }]"
								@click="handleStatsTabSwitch('daily')"
							>
								<Icon
									name="solar:calendar-linear"
									size="1rem"
								/>
								<span>Daily</span>
							</button>
							<button
								v-if="challengeStatsStore.stats.gamesPlayed > 0"
								:class="['toggle-btn', { active: activeStatsTab === 'challenge' }]"
								@click="handleStatsTabSwitch('challenge')"
							>
								<Icon
									name="solar:alarm-play-bold"
									size="1rem"
								/>
								<span>Challenge</span>
							</button>
						</div>
					</div>

					<div class="stats-content-container">
						<div :class="['stats-content', { active: activeStatsTab === 'daily' }]">
							<SeasonFormDashboard
								:primary-stats="dailyPrimaryStats"
								:win-percentage="statsStore.winPercentage"
								:distribution="statsStore.stats.guessDistribution"
								:recent-form="statsStore.stats.recentForm"
								:highlight-guess-count="lastGuessCount"
							/>
						</div>

						<div :class="['stats-content', { active: activeStatsTab === 'challenge' }]">
							<SeasonFormDashboard
								:primary-stats="challengePrimaryStats"
								:win-percentage="challengeStatsStore.winPercentage"
								:distribution="challengeStatsStore.stats.guessDistribution"
								:recent-form="challengeStatsStore.stats.recentForm"
								:highlight-guess-count="lastChallengeGuessCount"
							/>
						</div>
					</div>
				</div>
			</template>
		</PitchCardModal>

		<!-- Challenge Game Over Modal -->
		<PitchCardModal
			v-if="challengeStore.showGameOverModal"
			:heading="challengeStore.isWin ? 'Challenge Complete!' : 'Time\'s Up!'"
			:accent="challengeStore.isWin ? 'win' : 'loss'"
			variant="small"
			@close="challengeStore.closeGameOverModal"
		>
			<template #body>
				<div class="challenge-game-over-section">
					<h4 v-if="challengeStore.isWin">
						You solved it in {{ 45 - challengeStore.timeRemaining }} seconds!
					</h4>
					<h4 v-else>Better luck next time!</h4>
					<p>
						The answer was <strong class="answer">{{ challengeStore.currentAnswer }}</strong>
					</p>

					<div class="share-preview">
						<p class="share-header">
							Footballdle ⚽ Challenge{{
								challengeStore.isWin ? ` · ${45 - challengeStore.timeRemaining}s` : ''
							}}
						</p>
						<div class="share-emoji-grid">
							<div
								v-for="(guess, gi) in challengeStore.guesses"
								:key="gi"
								class="share-row"
							>
								<span
									v-for="(char, ci) in guess.split('')"
									:key="ci"
									class="share-tile"
									:class="{
										correct:
											challengeStore.currentAnswer[ci] &&
											char.toUpperCase() === challengeStore.currentAnswer[ci].toUpperCase(),
										present:
											!(
												challengeStore.currentAnswer[ci] &&
												char.toUpperCase() === challengeStore.currentAnswer[ci].toUpperCase()
											) &&
											challengeStore.currentAnswer.toUpperCase().includes(char.toUpperCase()),
										absent: !challengeStore.currentAnswer
											.toUpperCase()
											.includes(char.toUpperCase()),
									}"
								></span>
							</div>
						</div>
					</div>

					<div class="share-buttons">
						<button
							class="button primary"
							@click="handleChallengeShare"
						>
							<Icon
								name="solar:copy-linear"
								size="1rem"
							/>
							{{ shareToast ? 'Copied!' : 'Copy result' }}
						</button>
						<button
							class="btn-x"
							@click="handleChallengeShareTwitter"
						>
							<Icon
								name="ri:twitter-x-fill"
								size="1rem"
							/>
							Share on X
						</button>
					</div>

					<div class="challenge-buttons">
						<nuxt-link
							class="button link"
							to="/play/daily"
							@click="handleEndChallenge"
						>
							<Icon
								name="solar:alt-arrow-left-linear"
								size="1rem"
							/>
							Home
						</nuxt-link>

						<button
							class="button primary full"
							@click="handleChallengePlayAgain"
						>
							Play Again
						</button>
					</div>
					<a
						href="https://buymeacoffee.com/dhorne92E"
						target="_blank"
						rel="noopener noreferrer"
						class="coffee-nudge"
						@click.prevent="handleBuyMeCoffee('challenge_over_modal')"
					>
						<Icon
							name="uil:coffee"
							size="0.9rem"
						/>
						Enjoying Footballdle? Buy me a coffee
					</a>
				</div>
			</template>
		</PitchCardModal>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch, onMounted, onUnmounted, computed, defineAsyncComponent } from 'vue'
	import { useGameStore } from '../../stores/game'
	import { useModeStatsStore } from '../../stores/modeStats'
	import { useModalsStore } from '../../stores/modals'
	import { useChallengeStore } from '../../stores/challenge'
	import { useShare } from '../../composables/useShare'
	import { useAnalytics } from '../../composables/useAnalytics'
	import { useHead } from 'nuxt/app'
	import ModeIntroScreen from '../../components/ModeIntroScreen.vue'
	import HeaderNav from '../../components/HeaderNav.vue'
	import GameBoard from '../../components/GameBoard.vue'
	import Keyboard from '../../components/Keyboard.vue'
	import PlaySurfaceFrame from '../../components/shared/PlaySurfaceFrame.vue'
	import ScoreboardStrip from '../../components/shared/ScoreboardStrip.vue'
	import SeasonFormDashboard from '../../components/shared/SeasonFormDashboard.vue'
	import ThemePickerSettings from '../../components/shared/ThemePickerSettings.vue'

	definePageMeta({ layout: 'play' })

	const PitchCardModal = defineAsyncComponent(() => import('../../components/shared/PitchCardModal.vue'))
	const ChallengeModal = defineAsyncComponent(() => import('../../components/ChallengeModal.vue'))

	useHead({
		title: 'Footballdle | Daily Premier League Football Wordle',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk/play/daily' }],
		meta: [
			{
				name: 'description',
				content:
					'Think you know your Premier League players? Guess the hidden 6-letter footballer surname in 6 tries. A new player to find every day — the ultimate free football Wordle.',
			},
			{
				name: 'keywords',
				content:
					'football wordle, premier league wordle, footballdle, guess the footballer, daily football game, footballer guessing game, EPL word game, premier league quiz, football puzzle, soccer wordle, premier league game',
			},
			{ name: 'author', content: 'Footballdle' },
			{ name: 'robots', content: 'index, follow' },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:title', content: 'Footballdle | Daily Premier League Football Wordle' },
			{
				property: 'og:description',
				content:
					'Think you know your Premier League players? Guess the hidden 6-letter footballer surname in 6 tries. A new challenge every day.',
			},
			{ property: 'og:image', content: 'https://footballdle.co.uk/og-image.png' },
			{ property: 'og:url', content: 'https://footballdle.co.uk/play/daily' },
			{ property: 'og:site_name', content: 'Footballdle' },
			{ name: 'twitter:card', content: 'summary_large_image' },
			{ name: 'twitter:title', content: 'Footballdle | Daily Premier League Football Wordle' },
			{
				name: 'twitter:description',
				content: 'Guess the hidden Premier League footballer in 6 tries. Free daily football word game.',
			},
			{ name: 'twitter:image', content: 'https://footballdle.co.uk/og-image.png' },
		],
		script: [
			{
				type: 'application/ld+json',
				children: JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'WebApplication',
					name: 'Footballdle',
					url: 'https://footballdle.co.uk/play/daily',
					description:
						'Daily Premier League football wordle. Guess the 6-letter footballer surname in 6 tries.',
					applicationCategory: 'Game',
					genre: 'Puzzle',
					gamePlatform: 'Web Browser',
					operatingSystem: 'Any',
					inLanguage: 'en-GB',
					isAccessibleForFree: true,
					offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
				}),
			},
		],
	})

	// ============================================================================
	// STORES
	// ============================================================================
	const gameStore = useGameStore()
	const statsStore = useModeStatsStore('daily')
	const challengeStatsStore = useModeStatsStore('challenge')
	const modalsStore = useModalsStore()
	const challengeStore = useChallengeStore()
	const { onShare, onShareTwitter } = useShare()

	const {
		trackGameStart,
		trackGameWin,
		trackGameLoss,
		trackGameAbandon,
		trackGuessSubmitted,
		trackIntroButtonClick,
		trackStatsTabSwitch,
		trackChallengeStart,
		trackChallengeWin,
		trackChallengeLoss,
		trackChallengeAbandon,
		trackChallengePlayAgain,
		trackShare,
		trackModalOpen,
		trackHomeClick,
		trackSessionTime,
		trackInfoModal,
		trackSettingsModal,
		trackStatsModal,
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
	const activeStatsTab = ref('daily')
	const adLoading = ref(false)
	const adPlatformReady = ref(false)
	const isAdTestMode = ref(false)

	const dailyUspTiles = [
		{ icon: 'solar:calendar-linear', text: 'New player to guess every day' },
		{ icon: 'solar:football-outline', text: '25/26 Premier League players' },
		{ icon: 'solar:magnifer-linear', text: 'Only players with 6 letter surnames' },
		{ icon: 'solar:shield-warning-linear', text: 'Maximum 6 guesses' },
	]

	function handleWatchAd() {
		if (!import.meta.client) return

		const isTestMode = new URLSearchParams(window.location.search).get('adtest') === '1'
		if (isTestMode) {
			adLoading.value = true
			setTimeout(() => {
				adLoading.value = false
				gameStore.unlockHint()
			}, 2000)
			return
		}

		const adBreak = (window as any).adBreak
		if (!adBreak) return
		adBreak({
			type: 'reward',
			name: 'hint-unlock',
			beforeAd: () => { adLoading.value = true },
			afterAd: () => { adLoading.value = false },
			adDismissed: () => { adLoading.value = false },
			adViewed: () => { gameStore.unlockHint() },
		})
	}

	const sessionStartTime = ref(Date.now())
	const shareToast = ref(false)
	let shareToastTimer: ReturnType<typeof setTimeout> | null = null

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const hasIncompleteGame = computed(() => gameStore.guesses.length > 0 && !gameStore.gameOver)

	const lastGuessCount = computed(() => (gameStore.isWin && gameStore.gameOver ? gameStore.guesses.length : 0))
	const lastChallengeGuessCount = computed(() =>
		challengeStore.isWin && challengeStore.gameOver ? challengeStore.guesses.length : 0,
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

	const yesterdayISO = computed(() => {
		const [dd, mm, yyyy] = gameStore.todayStr.split('/').map(Number)
		const d = new Date(yyyy!, mm! - 1, dd!)
		d.setDate(d.getDate() - 1)
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
	})

	const dailyPrimaryStats = computed(() => [
		{ label: 'Games', value: statsStore.stats.gamesPlayed },
		{ label: 'Wins', value: statsStore.stats.wins },
		{ label: 'Streak', value: statsStore.stats.currentStreak },
		{ label: 'Max Streak', value: statsStore.stats.maxStreak },
	])

	const challengePrimaryStats = computed(() => [
		{ label: 'Challenges', value: challengeStatsStore.stats.gamesPlayed },
		{ label: 'Wins', value: challengeStatsStore.stats.wins },
		{ label: 'Best Streak', value: challengeStatsStore.stats.maxStreak },
		{ label: 'Best Time', value: `${challengeStatsStore.stats.bestTime || 0}s` },
	])

	// ============================================================================
	// LIFECYCLE HOOKS
	// ============================================================================
	onMounted(() => {
		statsStore.loadStats()
		gameStore.loadState()
		gameStore.startCountdown()

		isAdTestMode.value = new URLSearchParams(window.location.search).get('adtest') === '1'
		if ((window as any).adConfig) {
			;(window as any).adConfig({
				preloadAdBreaks: 'on',
				onReady: () => { adPlatformReady.value = true },
			})
		}

		challengeStore.loadChallengeState()
		challengeStatsStore.loadStats()

		sessionStartTime.value = Date.now()
	})

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
	watch(
		() => gameStore.getUKDateString(),
		(newDate, oldDate) => {
			if (newDate !== oldDate) {
				gameStore.resetGame()
				challengeStore.resetDaily()
				location.reload()
			}
		},
	)

	watch(
		() => gameStore.showGameOverModal,
		(showModal) => {
			if (showModal && gameStore.gameOver) {
				challengeStore.unlockChallenge()
			}
		},
	)

	watch(
		() => modalsStore.showStats,
		(showStats) => {
			if (showStats) {
				activeStatsTab.value = 'daily'
			}
		},
	)

	// ============================================================================
	// EVENT HANDLERS
	// ============================================================================
	async function handleShare() {
		const label = `#${gameStore.puzzleNumber}`
		const streak = statsStore.stats.currentStreak
		const copied = await onShare(gameStore.guesses, gameStore.answer, gameStore.isWin, label, streak)
		if (copied) {
			shareToast.value = true
			if (shareToastTimer) clearTimeout(shareToastTimer)
			shareToastTimer = setTimeout(() => { shareToast.value = false }, 2000)
		}
		trackShare('copy')
	}

	function handleShareTwitter() {
		const streak = statsStore.stats.currentStreak
		onShareTwitter(gameStore.guesses, gameStore.answer, gameStore.isWin, `#${gameStore.puzzleNumber}`, streak)
		trackShare('twitter')
	}

	async function handleChallengeShare() {
		const timeUsed = 45 - challengeStore.timeRemaining
		const label = challengeStore.isWin ? `Challenge (${timeUsed}s)` : 'Challenge'
		const copied = await onShare(challengeStore.guesses, challengeStore.currentAnswer, challengeStore.isWin, label)
		if (copied) {
			shareToast.value = true
			if (shareToastTimer) clearTimeout(shareToastTimer)
			shareToastTimer = setTimeout(() => { shareToast.value = false }, 2000)
		}
		trackShare('copy_challenge')
	}

	function handleChallengeShareTwitter() {
		const timeUsed = 45 - challengeStore.timeRemaining
		const label = challengeStore.isWin ? `Challenge (${timeUsed}s)` : 'Challenge'
		onShareTwitter(challengeStore.guesses, challengeStore.currentAnswer, challengeStore.isWin, label)
		trackShare('twitter_challenge')
	}

	function handleKeyboardKey(key: string) {
		const guessesBefore = gameStore.guesses.length
		gameStore.onKeyboardKey(key)

		if (key === 'ENTER' && gameStore.guesses.length > guessesBefore) {
			trackGuessSubmitted(gameStore.guesses.length)
		}

		if (gameStore.gameOver && gameStore.showGameOverModal) {
			statsStore.updateStats(gameStore.isWin, gameStore.guesses.length, gameStore.todayStr)
			if (gameStore.isWin) {
				trackGameWin(gameStore.guesses.length)
			} else {
				trackGameLoss(gameStore.guesses.length)
			}
		}
	}

	function handleStartGame() {
		trackIntroButtonClick(hasIncompleteGame.value ? 'resume_game' : 'play_now')
		gameStore.startGame()
		trackGameStart(statsStore.stats.gamesPlayed > 0)
	}

	function handleStartChallenge() {
		trackIntroButtonClick('challenge_play')
		challengeStore.startChallenge()
		gameStore.showIntro = false
		trackChallengeStart()
	}

	function handleEndChallenge() {
		if (challengeStore.isActive && !challengeStore.gameOver && challengeStore.timeRemaining > 0) {
			trackChallengeAbandon(45 - challengeStore.timeRemaining)
		}
		challengeStore.endChallenge()
		gameStore.showIntro = true
	}

	function handleChallengePlayAgain() {
		challengeStore.startChallenge()
		trackChallengePlayAgain()
	}

	function handleChallengeKey(key: string) {
		challengeStore.onKeyboardKey(key)
	}

	function handleShowInfo() {
		trackInfoModal()
		navigateTo('/how-to-play')
	}

	function handleShowSettings() {
		modalsStore.openSettings()
		trackSettingsModal()
	}

	function handleShowStats() {
		modalsStore.openStats()
		trackStatsModal()
	}

	function handleBackToMenu() {
		if (gameStore.guesses.length > 0 && !gameStore.gameOver) {
			trackGameAbandon(gameStore.guesses.length)
		}
		trackHomeClick('game_screen')
		navigateTo('/')
	}

	function handleStatsTabSwitch(tab: 'daily' | 'challenge') {
		activeStatsTab.value = tab
		trackStatsTabSwitch(tab)
	}
</script>

<style scoped lang="scss">
	.daily-page {
		align-items: stretch;
		border-radius: var(--global-border-radius);
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: center;
		max-width: 500px;
		overflow: hidden;
		text-align: center;
		width: 100%;

		&.is-intro {
			overflow-y: auto;
		}

		.game-screen,
		.challenge-screen {
			display: flex;
			flex-direction: column;
			height: 100%;
			overflow: hidden;

			.game-board {
				flex: 1;
				min-height: 0;
				overflow: hidden;
			}

			.keyboard {
				flex-shrink: 0;
				padding-top: 0.5rem;
			}

			.challenge-game {
				display: flex;
				flex: 1;
				flex-direction: column;
				min-height: 0;
				overflow: hidden;
			}
		}
	}

	// ============================================================================
	// HINTS
	// ============================================================================
	.hints-container {
		align-items: center;
		display: flex;
		flex-shrink: 0;
		flex-wrap: wrap;
		gap: 0.4rem;
		justify-content: center;
		padding: 0.5rem 0.5rem 0;

		.hint-chip {
			align-items: center;
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: 2rem;
			color: var(--text-primary);
			display: inline-flex;
			font-size: 0.8rem;
			gap: 0.35rem;
			padding: 0.3rem 0.75rem;

			.hint-value {
				font-weight: 700;
			}
		}
	}

	.watch-ad-btn {
		align-items: center;
		background: transparent;
		border: 1px dashed var(--border);
		border-radius: var(--global-border-radius);
		color: var(--text-secondary);
		cursor: pointer;
		display: flex;
		flex-shrink: 0;
		font-size: 0.8rem;
		gap: 0.4rem;
		justify-content: center;
		margin: 0.5rem 0.5rem 0;
		padding: 0.4rem 1rem;
		transition: all 0.2s;

		&:disabled {
			cursor: wait;
			opacity: 0.5;
		}

		&:hover:not(:disabled) {
			border-color: var(--primary-color);
			color: var(--primary-color);
		}
	}

	.hint-enter-active {
		transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.hint-enter-from {
		opacity: 0;
		transform: scale(0.7) translateY(6px);
	}

	// ============================================================================
	// SHARED COFFEE NUDGE
	// ============================================================================
	.yesterday-link {
		align-items: center;
		color: var(--text-secondary);
		display: inline-flex;
		font-size: 0.8rem;
		gap: 0.35rem;
		margin-top: 0.5rem;
		text-decoration: none;
		transition: color 0.2s;

		&:hover {
			color: var(--primary-color);
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

	// ============================================================================
	// GAME OVER MODAL
	// ============================================================================
	.game-over-section,
	.challenge-game-over-section {
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
			text-transform: uppercase;
		}

		.streak-celebration {
			align-items: center;
			background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
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

	.share-preview {
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		margin: 0.75rem 0;
		padding: 0.75rem 1rem;
		width: 100%;

		.share-header {
			color: var(--text-secondary);
			font-size: 0.75rem;
			font-weight: 600;
			letter-spacing: 0.02em;
			margin-bottom: 0.6rem;
		}

		.share-emoji-grid {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: 3px;
		}

		.share-row {
			display: flex;
			gap: 3px;
		}

		.share-tile {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 2px;
			height: 14px;
			width: 14px;

			&.correct {
				background: var(--color-success);
				border-color: var(--color-success);
			}

			&.present {
				background: var(--color-present);
				border-color: var(--color-present);
			}

			&.absent {
				background: var(--color-absent);
				border-color: var(--color-absent);
			}
		}
	}

	.share-buttons {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		margin-top: 0.25rem;
		width: 100%;

		.button {
			align-items: center;
			border-bottom: none;
			display: flex;
			flex: 1;
			gap: 0.4rem;
			justify-content: center;

			&:hover {
				border-bottom: none;
			}
		}

		.btn-x {
			align-items: center;
			background: #000;
			border: 2px solid #000;
			border-bottom: 2px solid #000;
			border-radius: var(--border-radius);
			color: #fff;
			cursor: pointer;
			display: flex;
			flex: 1;
			font-size: 0.9rem;
			font-weight: 500;
			gap: 0.4rem;
			justify-content: center;
			padding: 0.5rem 1rem;
			transition: background 0.2s;

			&:hover {
				background: #222;
				border-bottom: 2px solid #222;
				color: #fff;
			}
		}
	}

	// ============================================================================
	// STATS MODAL
	// ============================================================================
	.stats-section {
		width: 80%;

		.stats-toggle {
			border-bottom: 1px solid var(--border);
			margin-bottom: 0.5rem;
			padding-bottom: 0.5rem;

			.toggle-container {
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				display: flex;
				gap: 0.25rem;
				padding: 0.25rem;

				.toggle-btn {
					align-items: center;
					background: transparent;
					border: 1px solid var(--border);
					border-radius: calc(var(--global-border-radius) - 2px);
					color: var(--text-secondary);
					cursor: pointer;
					display: flex;
					flex: 1;
					font-size: 0.75rem;
					font-weight: 500;
					gap: 0.5rem;
					justify-content: center;
					line-height: 1rem;
					overflow: hidden;
					padding: 0.75rem 1rem;
					position: relative;
					transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

					&::before {
						background: var(--bg-gradient);
						content: '';
						inset: 0;
						opacity: 0;
						position: absolute;
						transition: opacity 0.3s ease;
						z-index: 0;
					}

					svg,
					span {
						position: relative;
						transition: all 0.3s ease;
						z-index: 1;
					}

					&:hover {
						color: var(--text-primary);
						transform: translateY(-1px);

						&::before {
							opacity: 0.1;
						}
					}

					&.active {
						color: var(--text-primary);
						font-weight: 500;

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
			min-height: 420px;
			position: relative;

			.stats-content {
				left: 0;
				opacity: 0;
				position: absolute;
				right: 0;
				top: 0;
				transform: translateX(20px);
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				visibility: hidden;

				&.active {
					opacity: 1;
					transform: translateX(0);
					visibility: visible;
				}
			}
		}
	}

	// ============================================================================
	// CHALLENGE GAME OVER MODAL
	// ============================================================================
	.challenge-game-over-section {
		.challenge-buttons {
			display: flex;
			gap: 1rem;
			justify-content: center;
			margin-top: 1rem;
		}
	}
</style>
