<template>
	<div :class="['page-container', { 'is-intro': gameStore.showIntro }]">
		<!-- Loading Overlay -->
		<div
			v-if="isLoading"
			class="loading-overlay"
		>
			<div class="loading-content">
				<Loader />
			</div>
		</div>
		<!-- Intro Screen -->
		<IntroScreen
			v-if="gameStore.showIntro"
			:can-play="gameStore.canPlay"
			:countdown="gameStore.countdown"
			:challenge-unlocked="challengeStore.isUnlocked"
			:has-incomplete-game="hasIncompleteGame"
			:stats="statsStore.stats"
			:win-percentage="statsStore.winPercentage"
			@start-game="handleStartGame"
			@start-challenge="handleStartChallenge"
			@show-info="handleShowInfo"
			@show-settings="handleShowSettings"
			@show-stats="handleShowStats"
			@buy-coffee="handleBuyMeCoffee"
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

			<GameBoard
				:guesses="gameStore.guesses"
				:answer="gameStore.answer"
				:maxGuesses="gameStore.maxGuesses"
				:currentGuess="gameStore.currentGuess"
				:game-over="gameStore.gameOver"
				:error-message="gameStore.errorMessage"
			/>

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
		<BaseModal
			v-if="gameStore.showGameOverModal"
			:show="gameStore.showGameOverModal"
			:heading="gameStore.isWin ? 'Well played!' : 'Better luck next time!'"
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
		</BaseModal>

		<!-- Info Modal -->
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
						<p class="caption">
							The letter <strong>A</strong> is in the answer and in the correct position.
						</p>

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
							Footballdle is a word game inspired by Wordle. It is not affiliated with the Premier League
							or any other football club.
						</p>

						<p class="caption">
							If you spot any missing players, get in touch and I can add them right away.
						</p>
					</div>
				</div>
			</template>
		</BaseModal>

		<!-- Settings Modal -->
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
								<span class="theme-name">Light</span>
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
								<span class="theme-name">Dark</span>
							</button>

							<button
								:class="['theme-option', { active: themeStore.currentTheme === 'greyscale' }]"
								@click="themeStore.setTheme('greyscale')"
							>
								<div class="theme-preview greyscale">
									<div class="preview-header"></div>
									<div class="preview-content">
										<div class="preview-tile"></div>
										<div class="preview-tile correct"></div>
										<div class="preview-tile"></div>
									</div>
								</div>
								<span class="theme-name">Greyscale</span>
							</button>

							<button
								:class="['theme-option', { active: themeStore.currentTheme === 'pastel' }]"
								@click="themeStore.setTheme('pastel')"
							>
								<div class="theme-preview pastel">
									<div class="preview-header"></div>
									<div class="preview-content">
										<div class="preview-tile"></div>
										<div class="preview-tile correct"></div>
										<div class="preview-tile"></div>
									</div>
								</div>
								<span class="theme-name">Pastel</span>
							</button>
						</div>
					</div>

					<div
						v-if="pushSupported"
						class="setting-group push-group"
					>
						<label>Daily Reminder</label>
						<p>Get notified when today's puzzle is ready.</p>
						<button
							:class="['toggle-switch', { active: pushEnabled }]"
							:disabled="pushLoading"
							@click="togglePush"
						>
							<span class="toggle-track">
								<span class="toggle-thumb" />
							</span>
							<span class="toggle-label">{{
								pushEnabled ? 'Notifications on' : 'Notifications off'
							}}</span>
						</button>
						<p
							v-if="pushBlocked"
							class="push-blocked-msg"
						>
							Notifications are blocked in your browser. Enable them in your browser settings and try
							again.
						</p>
					</div>

					<div class="setting-group support-group">
						<label>Support Footballdle</label>
						<p>Enjoying the game? Help keep it free and ad-light.</p>
						<a
							href="https://buymeacoffee.com/dhorne92E"
							target="_blank"
							rel="noopener noreferrer"
							class="coffee-button"
							@click.prevent="handleBuyMeCoffee('settings_modal')"
						>
							<Icon
								name="uil:coffee"
								size="1rem"
							/>
							Buy me a coffee
						</a>
					</div>
				</div>
			</template>
		</BaseModal>

		<!-- Stats Modal -->
		<BaseModal
			v-if="modalsStore.showStats"
			heading="Statistics"
			variant="small"
			@close="modalsStore.closeStats"
		>
			<template #body>
				<div class="stats-section">
					<!-- Stats Toggle -->
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
								v-if="challengeStore.challengeStats.gamesPlayed > 0"
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

					<!-- Stats Content Container -->
					<div class="stats-content-container">
						<!-- Daily Game Stats -->
						<div :class="['stats-content', { active: activeStatsTab === 'daily' }]">
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

							<div class="guess-distribution">
								<p class="caption distribution-title">Guess Distribution</p>
								<div
									v-for="n in 6"
									:key="n"
									class="dist-row"
								>
									<span class="dist-label">{{ n }}</span>
									<div class="dist-bar-wrap">
										<div
											class="dist-bar"
											:class="{ highlight: lastGuessCount === n }"
											:style="{ width: getBarWidth(n, statsStore.stats.guessDistribution) }"
										>
											<span class="dist-count">{{
												statsStore.stats.guessDistribution[String(n)] || 0
											}}</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Challenge Stats -->
						<div :class="['stats-content', { active: activeStatsTab === 'challenge' }]">
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

							<div class="guess-distribution">
								<p class="caption distribution-title">Guess Distribution</p>
								<div
									v-for="n in 6"
									:key="n"
									class="dist-row"
								>
									<span class="dist-label">{{ n }}</span>
									<div class="dist-bar-wrap">
										<div
											class="dist-bar"
											:class="{ highlight: lastChallengeGuessCount === n }"
											:style="{
												width: getBarWidth(n, challengeStore.challengeStats.guessDistribution),
											}"
										>
											<span class="dist-count">{{
												challengeStore.challengeStats.guessDistribution[String(n)] || 0
											}}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
		</BaseModal>

		<!-- Challenge Game Over Modal -->
		<BaseModal
			v-if="challengeStore.showGameOverModal"
			:show="challengeStore.showGameOverModal"
			:heading="challengeStore.isWin ? 'Challenge Complete!' : 'Time\'s Up!'"
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
		</BaseModal>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch, onMounted, onUnmounted, nextTick, computed, defineAsyncComponent } from 'vue'
	import { useGameStore } from '../stores/game'
	import { useStatsStore } from '../stores/stats'
	import { useThemeStore } from '../stores/theme'
	import { useModalsStore } from '../stores/modals'
	import { useChallengeStore } from '../stores/challenge'
	import { useShare } from '../composables/useShare'
	import { useAnalytics } from '../composables/useAnalytics'
	import { useHead } from 'nuxt/app'

	const BaseModal = defineAsyncComponent(() => import('../components/BaseModal.vue'))
	const ChallengeModal = defineAsyncComponent(() => import('../components/ChallengeModal.vue'))

	useHead({
		title: 'Footballdle | Daily Premier League Football Wordle',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk' }],
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
			{
				name: 'author',
				content: 'Footballdle',
			},
			{
				name: 'robots',
				content: 'index, follow',
			},
			// Open Graph
			{
				property: 'og:type',
				content: 'website',
			},
			{
				property: 'og:title',
				content: 'Footballdle | Daily Premier League Football Wordle',
			},
			{
				property: 'og:description',
				content:
					'Think you know your Premier League players? Guess the hidden 6-letter footballer surname in 6 tries. A new challenge every day.',
			},
			{
				property: 'og:image',
				content: 'https://footballdle.co.uk/og-image.png',
			},
			{
				property: 'og:url',
				content: 'https://footballdle.co.uk',
			},
			{
				property: 'og:site_name',
				content: 'Footballdle',
			},
			// Twitter / X Card
			{
				name: 'twitter:card',
				content: 'summary_large_image',
			},
			{
				name: 'twitter:title',
				content: 'Footballdle | Daily Premier League Football Wordle',
			},
			{
				name: 'twitter:description',
				content: 'Guess the hidden Premier League footballer in 6 tries. Free daily football word game.',
			},
			{
				name: 'twitter:image',
				content: 'https://footballdle.co.uk/og-image.png',
			},
		],
		script: [
			{
				type: 'application/ld+json',
				children: JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'WebApplication',
					name: 'Footballdle',
					url: 'https://footballdle.co.uk',
					description:
						'Daily Premier League football wordle. Guess the 6-letter footballer surname in 6 tries.',
					applicationCategory: 'Game',
					genre: 'Puzzle',
					gamePlatform: 'Web Browser',
					operatingSystem: 'Any',
					inLanguage: 'en-GB',
					isAccessibleForFree: true,
					offers: {
						'@type': 'Offer',
						price: '0',
						priceCurrency: 'GBP',
					},
				}),
			},
		],
	})

	// ============================================================================
	// STORES
	// ============================================================================
	const gameStore = useGameStore()
	const statsStore = useStatsStore()
	const themeStore = useThemeStore()
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
	const isLoading = ref(false)

	// Push notifications
	const {
		isSupported: pushSupported,
		isSubscribed,
		subscribe: pushSubscribe,
		unsubscribe: pushUnsubscribe,
	} = usePushNotifications()
	const pushEnabled = ref(false)
	const pushLoading = ref(false)
	const pushBlocked = ref(false)

	async function initPushState() {
		if (!pushSupported) return
		pushEnabled.value = await isSubscribed()
	}

	async function togglePush() {
		pushLoading.value = true
		pushBlocked.value = false
		try {
			if (pushEnabled.value) {
				await pushUnsubscribe()
				pushEnabled.value = false
			} else {
				const ok = await pushSubscribe()
				if (!ok && Notification.permission === 'denied') {
					pushBlocked.value = true
				}
				pushEnabled.value = ok
			}
		} finally {
			pushLoading.value = false
		}
	}

	const sessionStartTime = ref(Date.now())
	const shareToast = ref(false)
	let shareToastTimer: ReturnType<typeof setTimeout> | null = null

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const hasIncompleteGame = computed(() => {
		if (gameStore.guesses.length > 0 && !gameStore.gameOver) return true
		return false
	})

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
		if (s >= 3) return `${s} day streak — hat-trick!`
		return `${s} days in a row!`
	})

	const yesterdayISO = computed(() => {
		const [dd, mm, yyyy] = gameStore.todayStr.split('/').map(Number)
		const d = new Date(yyyy!, mm! - 1, dd!)
		d.setDate(d.getDate() - 1)
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
	})

	function getBarWidth(n: number, dist: Record<string, number>): string {
		const max = Math.max(...Object.values(dist).map(Number), 1)
		const count = Number(dist[String(n)] || 0)
		return count === 0 ? '1.5rem' : `${Math.max((count / max) * 100, 10)}%`
	}

	// ============================================================================
	// LIFECYCLE HOOKS
	// ============================================================================
	onMounted(() => {
		themeStore.loadThemeSettings()
		statsStore.loadStats()
		gameStore.loadState()
		gameStore.startCountdown()
		initPushState()

		// Load challenge state
		challengeStore.loadChallengeState()
		challengeStore.loadChallengeStats()

		// Track session start
		sessionStartTime.value = Date.now()
	})

	// Track session time when leaving
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

	// Watch for game completion to unlock challenge mode
	watch(
		() => gameStore.showGameOverModal,
		(showModal) => {
			if (showModal && gameStore.gameOver) {
				challengeStore.unlockChallenge()
			}
		},
	)

	// Reset stats tab to daily when stats modal opens
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
			shareToastTimer = setTimeout(() => {
				shareToast.value = false
			}, 2000)
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
			shareToastTimer = setTimeout(() => {
				shareToast.value = false
			}, 2000)
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
		modalsStore.openInfo()
		trackInfoModal()
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
		if (gameStore.gameOver) {
			isLoading.value = true
			setTimeout(() => {
				location.reload()
			}, 500)
		} else {
			gameStore.showIntro = true
		}
	}

	function handleStatsTabSwitch(tab: 'daily' | 'challenge') {
		activeStatsTab.value = tab
		trackStatsTabSwitch(tab)
	}
</script>

<style scoped lang="scss">
	.page-container {
		align-items: stretch;
		display: flex;
		height: 100dvh;
		justify-content: center;
		overflow: hidden;
		padding: 1rem;
		position: relative;

		&.is-intro {
			overflow-y: auto;
		}

		.game-screen,
		.challenge-screen {
			border-radius: var(--global-border-radius);
			display: flex;
			flex-direction: column;
			max-width: 500px;
			overflow: hidden;
			padding: 0.5rem 0.5rem 0;
			text-align: center;
			width: 100%;

			.header-nav {
				flex-shrink: 0;
				padding-bottom: 0.25rem;
			}

			.game-board {
				flex: 1;
				min-height: 0;
				overflow: hidden;
			}

			.keyboard {
				flex-shrink: 0;
				padding-bottom: 0.5rem;
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
	// LOADING OVERLAY
	// ============================================================================
	.loading-overlay {
		align-items: center;
		display: flex;
		inset: 0;
		justify-content: center;
		position: fixed;
		z-index: 10000;

		.loading-content {
			color: var(--text-primary);
			height: 100%;
			position: relative;
			text-align: center;
			width: 100%;
		}
	}

	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translate(-50%, -50%) translateY(0);
		}

		40% {
			transform: translate(-50%, -50%) translateY(-80px);
		}

		60% {
			transform: translate(-50%, -50%) translateY(-40px);
		}
	}

	@keyframes shadow {
		0%,
		20%,
		50%,
		80%,
		100% {
			opacity: 0.3;
			transform: translate(-50%, -50%) scaleX(1);
		}

		40% {
			opacity: 0.1;
			transform: translate(-50%, -50%) scaleX(0.3);
		}

		60% {
			opacity: 0.2;
			transform: translate(-50%, -50%) scaleX(0.6);
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
		padding: 0 0.5rem 0.5rem;

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

			.hint-label {
				color: var(--text-secondary);
				font-weight: 500;
			}

			.hint-value {
				font-weight: 700;
			}
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

	// Shared share card styles (used by both daily and challenge modals)
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
	// INFO MODAL
	// ============================================================================
	.info-section {
		max-height: 60vh;

		p {
			line-height: 1.6;
			margin-bottom: 1rem;
		}

		.examples {
			margin: 1.5rem 0;

			.example {
				display: flex;
				gap: 0.25rem;
				margin-bottom: 0.5rem;

				.letter {
					align-items: center;
					border: 2px solid var(--border);
					display: flex;
					font-size: 0.9rem;
					font-weight: 700;
					height: 2rem;
					justify-content: center;
					width: 2rem;

					&.correct {
						background: var(--color-success);
						border-color: var(--color-success);
						color: white;
					}

					&.present {
						background: var(--color-present);
						border-color: var(--color-present);
						color: white;
					}

					&.absent {
						background: var(--color-absent);
						border-color: var(--color-absent);
						color: white;
					}
				}
			}
		}

		.info-footer {
			border-top: 1px solid var(--border);
			padding-top: 1rem;
		}
	}

	// ============================================================================
	// SETTINGS MODAL
	// ============================================================================
	.settings-section {
		width: 100%;

		.support-group {
			text-align: left;

			.coffee-button {
				align-items: center;
				background: #fd0;
				border-radius: var(--global-border-radius);
				color: #000;
				display: inline-flex;
				font-size: 0.9rem;
				font-weight: 600;
				gap: 0.5rem;
				margin-top: 0.5rem;
				padding: 0.6rem 1.2rem;
				text-decoration: none;
				transition: all 0.2s ease;

				&:hover {
					box-shadow: 0 4px 12px rgb(255 221 0 / 40%);
					transform: translateY(-2px);
				}
			}
		}

		.toggle-switch {
			align-items: center;
			background: none;
			border: none;
			cursor: pointer;
			display: inline-flex;
			gap: 0.6rem;
			padding: 0;

			&:disabled {
				cursor: wait;
				opacity: 0.6;
			}

			.toggle-track {
				background: var(--border);
				border-radius: 999px;
				display: block;
				height: 24px;
				position: relative;
				transition: background 0.2s;
				width: 44px;

				.toggle-thumb {
					background: #fff;
					border-radius: 50%;
					display: block;
					height: 18px;
					left: 3px;
					position: absolute;
					top: 3px;
					transition: transform 0.2s;
					width: 18px;
				}
			}

			&.active .toggle-track {
				background: var(--primary-color);
			}

			&.active .toggle-thumb {
				transform: translateX(20px);
			}

			.toggle-label {
				color: var(--text-primary);
				font-size: 0.9rem;
				font-weight: 500;
			}
		}

		.push-group {
			text-align: left;
		}

		.push-blocked-msg {
			color: var(--primary-color);
			font-size: 0.8rem;
			margin-top: 0.5rem;
		}

		.setting-group {
			align-items: flex-start;
			display: flex;
			flex-direction: column;
			margin-bottom: 2rem;
			width: 100%;

			label {
				color: var(--text-primary);
				font-size: 1.1rem;
				font-weight: 600;
				margin-bottom: 0.5rem;
			}

			p {
				color: var(--text-secondary);
				font-size: 0.9rem;
				margin: 0 0 1rem;
			}

			.theme-grid {
				display: grid;
				gap: 1rem;
				grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
				width: 100%;

				.theme-option {
					background: var(--bg-secondary);
					border: 2px solid var(--border);
					border-radius: var(--global-border-radius);
					cursor: pointer;
					overflow: hidden;
					padding: 1rem;
					position: relative;
					text-align: center;
					transition: all 0.3s ease;

					&:hover {
						border-color: var(--primary-color);
						box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
						transform: translateY(-2px);
					}

					&.active {
						background: var(--primary-color);
						border-color: var(--primary-color);
						box-shadow: 0 6px 20px rgb(0 0 0 / 15%);
						color: white;
						font-weight: 600;
						transform: translateY(-2px);
					}

					.theme-preview {
						border-radius: calc(var(--global-border-radius) - 2px);
						height: 60px;
						margin-bottom: 0.5rem;
						overflow: hidden;
						width: 100%;

						.preview-header {
							background: var(--bg-primary);
							border-bottom: 1px solid var(--border);
							height: 20px;
						}

						.preview-content {
							align-items: center;
							background: var(--bg-secondary);
							display: flex;
							gap: 0.25rem;
							height: 40px;
							justify-content: center;
							padding: 0.5rem;

							.preview-tile {
								background: var(--bg-primary);
								border: 1px solid var(--border);
								border-radius: 2px;
								height: 1.5rem;
								width: 1.5rem;

								&.correct {
									background: var(--primary-color);
									border-color: var(--primary-color);
								}
							}
						}

						// Theme-specific preview colors
						&.light {
							.preview-header {
								background: #f8fafc;
							}

							.preview-content {
								background: #fff;

								.preview-tile {
									background: #f8fafc;
									border-color: #e5e7eb;

									&.correct {
										background: #dc2626;
										border-color: #dc2626;
									}
								}
							}
						}

						&.dark {
							.preview-header {
								background: #0f172a;
							}

							.preview-content {
								background: #1e293b;

								.preview-tile {
									background: #0f172a;
									border-color: #334155;

									&.correct {
										background: #ef4444;
										border-color: #ef4444;
									}
								}
							}
						}

						&.greyscale {
							.preview-header {
								background: #fff;
							}

							.preview-content {
								background: #f0f0f0;

								.preview-tile {
									background: #fff;
									border-color: #000;

									&.correct {
										background: #dc2626;
										border-color: #dc2626;
									}
								}
							}
						}

						&.pastel {
							.preview-header {
								background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
							}

							.preview-content {
								background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);

								.preview-tile {
									background: #f0f9ff;
									border-color: #bae6fd;

									&.correct {
										background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
										border-color: #0ea5e9;
									}
								}
							}
						}
					}

					.theme-name {
						display: block;
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

				.stats-grid {
					display: grid;
					gap: 0.5rem;
					grid-template-columns: repeat(2, 1fr);
					margin-bottom: 0.5rem;

					.stat-card {
						background: var(--bg-secondary);
						border: 1px solid var(--border);
						border-radius: var(--global-border-radius);
						overflow: hidden;
						padding: 1rem;
						position: relative;
						text-align: center;
						transition: all 0.2s;

						h3 {
							color: var(--text-primary);
							font-size: 2rem;
							font-weight: 700;
							margin: 0 0 0.5rem;
						}

						&:hover {
							border-color: var(--border-hover);
							box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
							transform: translateY(-2px);

							&::before {
								opacity: 1;
							}
						}
					}
				}

				.win-rate {
					background: var(--bg-secondary);
					border: 1px solid var(--border);
					border-radius: var(--global-border-radius);
					padding: 1rem;

					.progress-bar {
						background: var(--bg-primary);
						border-radius: 4px;
						height: 8px;
						margin-bottom: 0.5rem;
						overflow: hidden;
						width: 100%;

						.progress-fill {
							background: var(--color-gradient);
							border-radius: 4px;
							height: 100%;
							transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
						}
					}

					p {
						color: var(--text-secondary);
						font-size: 0.9rem;
						font-weight: 500;
						margin: 0;
						text-align: center;
					}
				}

				.guess-distribution {
					background: var(--bg-secondary);
					border: 1px solid var(--border);
					border-radius: var(--global-border-radius);
					margin-top: 0.5rem;
					padding: 1rem;

					.distribution-title {
						font-weight: 600;
						margin-bottom: 0.75rem;
						text-align: left;
					}

					.dist-row {
						align-items: center;
						display: flex;
						gap: 0.5rem;
						margin-bottom: 0.3rem;

						.dist-label {
							color: var(--text-secondary);
							flex-shrink: 0;
							font-size: 0.85rem;
							font-weight: 700;
							text-align: right;
							width: 0.75rem;
						}

						.dist-bar-wrap {
							flex: 1;

							.dist-bar {
								align-items: center;
								background: var(--bg-primary);
								border-radius: 2px;
								display: flex;
								justify-content: flex-end;
								min-width: 1.5rem;
								padding: 0.2rem 0.4rem;
								transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);

								.dist-count {
									color: var(--text-secondary);
									font-size: 0.75rem;
									font-weight: 700;
								}

								&.highlight {
									background: var(--color-gradient);

									.dist-count {
										color: white;
									}
								}
							}
						}
					}
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
