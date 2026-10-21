<template>
	<div class="daily-page-wrapper">
	<div :class="['daily-page', { 'is-intro': gameStore.showIntro }]">
		<!-- Intro / ready-to-play screen -->
		<ModeIntroScreen
			v-if="gameStore.showIntro"
			mode-name="Daily"
			mode-tagline="Guess the Premier League footballer"
			:usp-tiles="dailyUspTiles"
			:can-play="gameStore.canPlay"
			:countdown="gameStore.countdown"
			:has-incomplete-game="hasIncompleteGame"
			:prev-answer-link="`/solution/${yesterdayISO}`"
			:stats="statsStore.stats"
			:win-percentage="statsStore.winPercentage"
			@start-game="handleStartGame"
			@show-result="gameStore.showGameOverModal = true"
		/>

		<!-- Game Screen -->
		<div
			v-else
			class="game-screen"
		>
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
						size="1rem"
					/>
					<span class="hint-text">
						<span class="hint-label">{{ hint.label }}</span>
						<span class="hint-value">{{ hint.value }}</span>
					</span>
				</div>
			</TransitionGroup>

			<div
				v-if="gameStore.canPurchaseHint && $config.public.appShell && pendingHint"
				class="app-hint-btn pending"
				role="status"
			>
				<span class="pending-text">Revealing the {{ nextClueName }}…</span>
				<button
					type="button"
					class="undo-btn"
					@click="cancelHint"
				>
					Undo
				</button>
				<span
					class="pending-bar"
					aria-hidden="true"
				></span>
			</div>
			<button
				v-else-if="gameStore.canPurchaseHint && $config.public.appShell"
				class="app-hint-btn"
				:disabled="purchases.busy"
				@click="handleAppHint"
			>
				<Icon
					name="solar:lightbulb-bolt-bold"
					size="1.2rem"
				/>
				{{ appHintLabel }}
			</button>

			<FullTimePanel
				v-if="$config.public.appShell && gameStore.gameOver"
				:summary="gameStore.isWin ? `Solved in ${gameStore.guesses.length}/6` : `Missed it: ${gameStore.answer}`"
				:is-win="gameStore.isWin"
				:countdown="gameStore.countdown"
				:grid="true"
				@result="gameStore.showGameOverModal = true"
			/>
			<Keyboard
				v-else
				:disabled="gameStore.gameOver"
				:guesses="gameStore.guesses"
				:answer="gameStore.answer"
				:maxGuesses="gameStore.maxGuesses"
				:currentGuess="gameStore.currentGuess"
				@key="handleKeyboardKey"
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
					<h4 v-if="gameStore.isWin">Solved in {{ gameStore.guesses.length }}/6</h4>
					<h4 v-else>Not today</h4>
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
					<div
						v-if="purchases.rewardNote"
						class="reward-note"
						role="status"
					>
						<Icon
							name="solar:gift-bold"
							size="1rem"
						/>
						{{ purchases.rewardNote }}
					</div>
					<p>
						The answer was <strong class="answer">{{ answerFullName || gameStore.answer }}</strong>
					</p>
					<p
						v-if="answerPlayer"
						class="answer-details"
					>
						{{ answerPlayer.club }} · {{ answerPlayer.position }} · {{ answerPlayer.nationality }}
					</p>
					<CardAward v-if="$config.public.appShell" />
					<div class="share-preview">
						<p class="share-header">
							Footballdle ⚽ {{ gameStore.puzzleNumber ? `#${gameStore.puzzleNumber}` : gameStore.todayStr }} &nbsp;·&nbsp;
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
									:class="tileStates(guess, gameStore.answer)[ci]"
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
								:name="$config.public.isApp ? 'solar:share-linear' : 'solar:copy-linear'"
								size="1rem"
							/>
							{{ $config.public.isApp ? 'Share' : shareToast ? 'Copied!' : 'Copy result' }}
						</button>
						<button
							v-if="!$config.public.isApp"
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
					<p class="caption">New puzzles in</p>
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
			v-if="modalsStore.showSettings && !$config.public.appShell"
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
			v-if="modalsStore.showStats && !$config.public.appShell"
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

					</div>
				</div>
			</template>
		</PitchCardModal>

	</div>

	<GameSidePanel
		v-if="$config.public.appShell"
		class="desktop-side-panel"
		mode="daily"
		:revision="gameStore.guesses.length + (gameStore.gameOver ? 10 : 0)"
	/>
	<DashboardSidePanel
		v-else
		class="desktop-side-panel"
		active-mode="daily"
		:daily-streak="statsStore.stats.currentStreak"
		:scout-streak="scoutStatsStore.stats.currentStreak"
		:spotball-streak="spotballStatsStore.stats.currentStreak"
		:streak="statsStore.stats.currentStreak"
		:win-percentage="statsStore.winPercentage"
		:recent-form="statsStore.stats.recentForm"
		@buy-coffee="handleBuyMeCoffee"
	/>
	</div>
</template>

<script setup lang="ts">
	import playerMeta from '../../data/meta.json'
	import { ref, watch, onMounted, onUnmounted, onBeforeUnmount, computed, defineAsyncComponent } from 'vue'
	import { useGameStore } from '../../stores/game'
	import { useModeStatsStore } from '../../stores/modeStats'
	import { useModalsStore } from '../../stores/modals'
	import { usePurchasesStore } from '../../stores/purchases'
	import { tileStates, useShare } from '../../composables/useShare'
	import FullTimePanel from '../../components/app/FullTimePanel.vue'
	import CardAward from '../../components/cards/CardAward.vue'
	import { fullNameFor, getAnswerPlayerForDay } from '../../composables/useFootballers'
	import { useAnalytics } from '../../composables/useAnalytics'
	import { useHead } from 'nuxt/app'
	import ModeIntroScreen from '../../components/ModeIntroScreen.vue'
	import GameBoard from '../../components/GameBoard.vue'
	import Keyboard from '../../components/Keyboard.vue'
	import PlaySurfaceFrame from '../../components/shared/PlaySurfaceFrame.vue'
	import ScoreboardStrip from '../../components/shared/ScoreboardStrip.vue'
	import SeasonFormDashboard from '../../components/shared/SeasonFormDashboard.vue'
	import ThemePickerSettings from '../../components/shared/ThemePickerSettings.vue'
	import DashboardSidePanel from '../../components/shared/DashboardSidePanel.vue'
	import GameSidePanel from '../../components/app/GameSidePanel.vue'

	const isAppBuild = !!useRuntimeConfig().public.appShell

	// Who the Daily answer was, for the result sheet: full name and that day's clues
	const answerPlayer = computed(() => getAnswerPlayerForDay(gameStore.todayStr))
	const answerFullName = computed(() => (answerPlayer.value ? fullNameFor(answerPlayer.value) : undefined))

	definePageMeta({ layout: 'play' })

	const PitchCardModal = defineAsyncComponent(() => import('../../components/shared/PitchCardModal.vue'))


	useHead({
		title: 'Footballdle | Daily Premier League Football Wordle',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk/play/daily' }],
		meta: [
			{
				name: 'description',
				content:
					'Think you know your Premier League players? Guess the hidden footballer surname in 6 tries. A new player to find every day — the ultimate free football Wordle.',
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
					'Think you know your Premier League players? Guess the hidden footballer surname in 6 tries. A new challenge every day.',
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
						'Daily Premier League football wordle. Guess the footballer surname in 6 tries.',
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
	const purchases = usePurchasesStore()
	const statsStore = useModeStatsStore('daily')
	const scoutStatsStore = useModeStatsStore('scout')
	const spotballStatsStore = useModeStatsStore('spotball')
	const modalsStore = useModalsStore()
	const { onShare, onShareTwitter } = useShare()

	const {
		trackGameStart,
		trackGameWin,
		trackGameLoss,
		trackGameAbandon,
		trackGuessSubmitted,
		trackIntroButtonClick,
		trackStatsTabSwitch,
		trackShare,
		trackModalOpen,
		trackSessionTime,
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

	const dailyUspTiles = [
		{ icon: 'solar:calendar-linear', text: 'New player to guess every day' },
		{ icon: 'solar:football-outline', text: `${playerMeta.season} Premier League players` },
		{ icon: 'solar:magnifer-linear', text: 'Five or six letter surnames' },
		{ icon: 'solar:shield-warning-linear', text: 'Maximum 6 guesses' },
	]

	// Hints come from Pro or the hint bank
	// Shared so the hint pill in the top bar can open it too
	const showHintShop = useState('hint-shop-open', () => false)
	onBeforeUnmount(() => { showHintShop.value = false })
	// Products may not have loaded at launch (offline, or the store was slow), so retry
	// The shop itself is components/app/HintShopSheet.vue, shared by every screen
	// The streak reward is shown once, on the result sheet
	watch(
		() => gameStore.showGameOverModal,
		(open) => {
			if (!open) purchases.rewardNote = ''
		},
	)

	const appHintLabel = computed(() => {
		if (purchases.isPro) return 'Reveal a hint'
		if (purchases.hintBank > 0) return `Use a hint · ${purchases.hintBank} left`
		return 'Get hints'
	})

	// A banked hint is paid for, so there's a short window to undo a mis-tap before it's
	// spent and the clue shown. Pro hints are unlimited, so those reveal straight away.
	const HINT_UNDO_MS = 3000
	const CLUE_NAMES = ['club', 'nationality', 'position', 'first letter', 'second letter']
	const pendingHint = ref(false)
	let pendingTimer: ReturnType<typeof setTimeout> | null = null
	const nextClueName = computed(() => CLUE_NAMES[gameStore.purchasedHints] ?? 'next clue')

	function handleAppHint() {
		if (purchases.isPro) {
			if (purchases.spendHint()) gameStore.unlockHint()
			return
		}
		if (purchases.hintBank <= 0) {
			showHintShop.value = true
			return
		}
		pendingHint.value = true
		pendingTimer = setTimeout(() => {
			pendingHint.value = false
			pendingTimer = null
			if (gameStore.canPurchaseHint && purchases.spendHint()) gameStore.unlockHint()
		}, HINT_UNDO_MS)
	}

	function cancelHint() {
		if (pendingTimer) clearTimeout(pendingTimer)
		pendingTimer = null
		pendingHint.value = false
	}
	onBeforeUnmount(cancelHint)

	const sessionStartTime = ref(Date.now())
	const shareToast = ref(false)
	let shareToastTimer: ReturnType<typeof setTimeout> | null = null

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const hasIncompleteGame = computed(() => gameStore.guesses.length > 0 && !gameStore.gameOver)

	const lastGuessCount = computed(() => (gameStore.isWin && gameStore.gameOver ? gameStore.guesses.length : 0))

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


	// ============================================================================
	// LIFECYCLE HOOKS
	// ============================================================================
	onMounted(() => {
		statsStore.loadStats()
		scoutStatsStore.loadStats()
		spotballStatsStore.loadStats()
		gameStore.loadState()
		gameStore.startCountdown()


		sessionStartTime.value = Date.now()

		// iOS app: the Matchday home links straight into play, skipping the intro screen
		const start = useRoute().query.start
		// The Grid replaced Challenge: old links and bookmarks go there
		if (start === 'challenge') {
			navigateTo('/play/grid', { replace: true })
			return
		}
		if (gameStore.showIntro && start === 'play' && gameStore.canPlay) handleStartGame()
		// iOS app: a finished Daily opens on its board (no web intro), with the result
		// sheet straight away when coming from the Matchday "See result" card
		if (isAppBuild && gameStore.gameOver) {
			gameStore.showIntro = false
			if (start === 'result') gameStore.showGameOverModal = true
		}
	})

	onUnmounted(() => {
		const sessionDuration = Math.floor((Date.now() - sessionStartTime.value) / 1000)
		trackSessionTime(sessionDuration)

		if (gameStore.guesses.length > 0 && !gameStore.gameOver) {
			trackGameAbandon(gameStore.guesses.length, 'daily_game')
		}
	})

	onUnmounted(() => {
		gameStore.stopCountdown()
	})


	// ============================================================================
	// WATCHERS
	// ============================================================================
	// A new UK day is handled by plugins/day-rollover.client.ts (reloads the app)


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
		const label = gameStore.puzzleNumber ? `#${gameStore.puzzleNumber}` : gameStore.todayStr
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
		onShareTwitter(gameStore.guesses, gameStore.answer, gameStore.isWin, gameStore.puzzleNumber ? `#${gameStore.puzzleNumber}` : gameStore.todayStr, streak)
		trackShare('twitter')
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


	function handleStatsTabSwitch(tab: 'daily') {
		activeStatsTab.value = tab
		trackStatsTabSwitch(tab)
	}
</script>

<style scoped lang="scss">
	.daily-page-wrapper {
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

	.daily-page {
		align-items: stretch;
		border-radius: var(--global-border-radius);
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		height: 100%;
		justify-content: center;
		max-width: 500px;
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

			.game-board {
				flex: 1;
				min-height: 0;
				overflow: hidden;
			}

			.keyboard {
				flex-shrink: 0;
				padding-top: 0.5rem;
			}

		}
	}

	@media (width <= 640px) {
		.daily-page:not(.is-intro) {
			overflow-y: auto;

			.game-screen {
				overflow-y: auto;

				.game-board {
					flex: none;
					min-height: auto;
					overflow: visible;
				}
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
			border-radius: 0.9rem;
			color: var(--text-primary);
			display: inline-flex;
			gap: 0.45rem;
			padding: 0.35rem 0.8rem 0.35rem 0.6rem;
			text-align: left;

			> .iconify,
			> svg {
				color: var(--primary-color);
				flex-shrink: 0;
			}

			.hint-text {
				display: flex;
				flex-direction: column;
				line-height: 1.15;
			}

			.hint-label {
				color: var(--text-secondary);
				font-size: 0.62rem;
				font-weight: 700;
				letter-spacing: 0.08em;
				text-transform: uppercase;
			}

			.hint-value {
				font-size: 0.92rem;
				font-weight: 700;
			}
		}
	}

	.app-hint-btn.pending {
		cursor: default;
		justify-content: space-between;
		overflow: hidden;
		position: relative;

		.pending-text {
			font-weight: 700;
		}

		.undo-btn {
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: 0.7rem;
			color: var(--text-primary);
			cursor: pointer;
			font: inherit;
			font-weight: 800;
			min-height: 34px;
			padding: 0 0.9rem;
		}

		// Drains over the undo window
		.pending-bar {
			animation: hint-undo 3s linear forwards;
			background: var(--primary-color);
			bottom: 0;
			height: 3px;
			left: 0;
			position: absolute;
			width: 100%;
		}
	}

	@keyframes hint-undo {
		to {
			width: 0;
		}
	}

	// iOS app: hints are how clues are revealed (and what the shop sells), so the
	// button is a real, full-size control rather than a footnote
	.app-hint-btn {
		align-items: center;
		background: color-mix(in srgb, var(--primary-color) 16%, var(--bg-secondary));
		border: 1px solid color-mix(in srgb, var(--primary-color) 40%, transparent);
		border-radius: 0.9rem;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		flex-shrink: 0;
		font: inherit;
		font-size: 0.95rem;
		font-weight: 700;
		gap: 0.5rem;
		justify-content: center;
		margin: 0.5rem 0.5rem 0;
		min-height: 44px;
		padding: 0.5rem 1rem;

		.iconify,
		svg {
			color: var(--tertiary-color);
		}

		&:active:not(:disabled) {
			transform: scale(0.98);
		}

		&:disabled {
			cursor: wait;
			opacity: 0.5;
		}
	}

	.hint-enter-active {
		transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.hint-enter-from {
		opacity: 0;
		transform: scale(0.7) translateY(6px);
	}

	@media (width <= 640px) {
		.hints-container {
			gap: 0.25rem;
			padding: 0.3rem 0.3rem 0;

			.hint-chip {
				font-size: 0.68rem;
				gap: 0.25rem;
				padding: 0.2rem 0.5rem;
			}
		}
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
			text-transform: uppercase;
		}

		.reward-note {
			align-items: center;
			background: color-mix(in srgb, var(--tertiary-color) 16%, var(--bg-secondary));
			border: 1px solid color-mix(in srgb, var(--tertiary-color) 40%, transparent);
			border-radius: 2rem;
			color: var(--text-primary);
			display: inline-flex;
			font-size: 0.85rem;
			font-weight: 700;
			gap: 0.4rem;
			margin: 0 auto 0.75rem;
			padding: 0.4rem 0.9rem;
		}

		.answer-details {
			color: var(--text-secondary);
			font-size: 0.85rem;
			margin: -0.35rem 0 0.5rem;
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

</style>
