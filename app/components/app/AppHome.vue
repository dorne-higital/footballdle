<template>
	<div class="app-home">
		<header class="home-header">
			<div>
				<p class="date">{{ todayLabel }}</p>
				<h1>Matchday</h1>
			</div>
			<div class="header-pills">
				<HintPill />
				<span
					:class="['streak-pill', { cold: !playStreak.playedToday }]"
					:aria-label="`${playStreak.activeStreak} day Matchday streak`"
				>
					<Icon
						name="solar:fire-bold"
						size="1.05rem"
					/>
					{{ playStreak.activeStreak }}
				</span>
			</div>
		</header>

		<section
			class="rings-card"
			aria-label="Today's progress"
		>
			<ActivityRings
				:rings="rings"
				:size="88"
				:stroke="10"
				label="Today's progress across Daily, Scout Report and Spot the Baller"
			/>
			<div class="rings-summary">
				<p class="rings-headline">{{ completedCount }}/3 today</p>
				<ul>
					<li
						v-for="mode in ringModes"
						:key="mode.name"
					>
						<span
							class="dot"
							:style="{ background: mode.color }"
						></span>
						<span class="mode-name">{{ mode.name }}</span>
						<span class="mode-state">{{ mode.state }}</span>
					</li>
				</ul>
			</div>
		</section>

		<NuxtLink
			:to="{ path: '/play/daily', query: { start: daily.status === 'new' || daily.status === 'playing' ? 'play' : 'result' } }"
			class="daily-hero"
		>
			<Icon
				name="solar:calendar-linear"
				class="bg-icon daily"
				aria-hidden="true"
			/>
			<div class="hero-top">
				<span class="eyebrow">Daily{{ puzzleNumber ? ` · #${puzzleNumber}` : '' }}</span>
				<!-- In a Player Cards season the Daily is also a card (its club stays a secret) -->
				<span
					v-if="cardDay"
					:class="['card-chip', { got: cardWon }]"
				>
					<Icon
						name="solar:card-2-bold"
						size="0.85rem"
					/>
					{{ cardWon ? 'Card collected' : dailyFinished ? 'Card missed' : 'Win today\'s card' }}
				</span>
				<span
					v-else
					class="league"
					>Premier League</span
				>
			</div>
			<!-- Full time: the answer spelled out, green if you got it, red if not -->
			<div
				v-if="dailyFinished && dailyAnswer"
				:class="['tile-preview', 'answer-tiles', daily.status]"
				:aria-label="`The answer was ${dailyAnswer.name}`"
			>
				<span
					v-for="(letter, i) in dailyAnswer.name.toUpperCase().split('')"
					:key="i"
					class="tile"
					:style="{ animationDelay: `${i * 60}ms` }"
					>{{ letter }}</span
				>
			</div>
			<div
				v-else
				class="tile-preview"
				aria-hidden="true"
			>
				<span
					v-for="(state, i) in previewTiles"
					:key="i"
					:class="['tile', state]"
				></span>
			</div>
			<div class="hero-copy">
				<h2>{{ heroTitle }}</h2>
				<p>{{ heroSubtitle }}</p>
			</div>
			<div
				v-if="dailyFinished"
				class="fulltime-row"
			>
				<span class="next-player">
					New puzzles in
					<strong>{{ countdown }}</strong>
				</span>
				<button
					type="button"
					class="share-btn"
					@click.prevent.stop="shareDaily"
				>
					<Icon
						name="solar:share-linear"
						size="1.1rem"
					/>
					{{ shareCopied ? 'Copied!' : 'Share' }}
				</button>
			</div>
			<span
				v-else
				class="hero-cta"
				>{{ heroCta }}</span
			>
		</NuxtLink>

		<div class="mode-grid">
			<NuxtLink
				:to="{ path: '/play/scout-report', query: { start: scout.status === 'won' || scout.status === 'lost' ? 'result' : 'play' } }"
				class="mode-card"
			>
				<Icon
					name="solar:magnifer-linear"
					class="bg-icon scout"
					aria-hidden="true"
				/>
				<span class="mode-text">
					<strong>Scout Report</strong>
					<span
						v-if="scoutAnswer"
						:class="['answer-line', scout.status]"
					>
						<Icon
							:name="scout.status === 'won' ? 'solar:check-circle-bold' : 'solar:close-circle-bold'"
							size="0.95rem"
						/>
						{{ scoutAnswer }}
					</span>
					<span>{{ scout.label }}</span>
				</span>
			</NuxtLink>
			<NuxtLink
				:to="{ path: '/play/spot-the-baller', query: { start: spot.status === 'won' || spot.status === 'lost' ? 'result' : 'play' } }"
				class="mode-card"
			>
				<Icon
					name="solar:eye-linear"
					class="bg-icon spot"
					aria-hidden="true"
				/>
				<span class="mode-text">
					<strong>Spot the Baller</strong>
					<template v-if="spotResults.length">
						<span class="spot-score">{{ spotResults.filter(Boolean).length }}/{{ spotResults.length }}</span>
						<span
							class="spot-dots"
							aria-hidden="true"
						>
							<i
								v-for="(hit, i) in spotResults"
								:key="i"
								:class="{ hit }"
							></i>
						</span>
					</template>
					<span v-else>{{ spot.label }}</span>
				</span>
			</NuxtLink>
		</div>

		<NuxtLink
			v-if="climbEnabled"
			to="/climb"
			class="challenge-row climb-row"
		>
			<Icon
				name="solar:ranking-linear"
				class="bg-icon challenge"
				aria-hidden="true"
			/>
			<span class="mode-text">
				<strong>The Climb</strong>
				<span>{{ climbLine }}</span>
			</span>
			<Icon
				name="solar:alt-arrow-right-linear"
				size="1.2rem"
			/>
		</NuxtLink>
		<NuxtLink
			v-else
			:to="challengeUnlocked ? { path: '/play/daily', query: { start: 'challenge' } } : '/play/daily'"
			:class="['challenge-row', { locked: !challengeUnlocked }]"
		>
			<Icon
				:name="challengeUnlocked ? 'solar:bolt-linear' : 'solar:lock-keyhole-linear'"
				class="bg-icon challenge"
				aria-hidden="true"
			/>
			<span class="mode-text">
				<strong>Challenge mode</strong>
				<span>{{ challengeUnlocked ? 'Unlimited games against the clock' : 'Finish today\'s Daily to unlock' }}</span>
			</span>
			<span
				v-if="!challengeUnlocked"
				class="lock-chip"
			>
				<Icon
					name="solar:lock-keyhole-minimalistic-bold"
					size="0.8rem"
				/>
				Locked
			</span>
			<Icon
				v-else
				name="solar:alt-arrow-right-linear"
				size="1.2rem"
				class="chevron"
			/>
		</NuxtLink>

		<FactCard />

		<div
			v-if="!dailyFinished"
			class="kickoff"
		>
			<span>New puzzles in</span>
			<strong>{{ countdown }}</strong>
		</div>

		<WelcomeSheet />
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, onUnmounted, ref } from 'vue'
	import ActivityRings from './ActivityRings.vue'
	import WelcomeSheet from './WelcomeSheet.vue'
	import { cardForDay } from '../../stores/cards'
	import HintPill from './HintPill.vue'
	import FactCard from './FactCard.vue'
	import { useModeStatsStore } from '../../stores/modeStats'
	import { usePlayStreakStore } from '../../stores/playStreak'
	import { useTodayProgress } from '../../composables/useTodayProgress'
	import { getDisplayNumber, getAnswerForDay } from '../../composables/useFootballers'
	import { getUKDateString } from '../../utils/dateStreak'
	import { useShare } from '../../composables/useShare'
	import { useHaptics } from '../../composables/useHaptics'
	import { useClimbStore } from '../../stores/climb'

	const RING_COLORS = { daily: '#2FE08A', scout: '#6EA8FF', spot: '#F2B84B' }

	const dailyStats = useModeStatsStore('daily')
	// Days in a row with at least one game finished, win or lose
	const playStreak = usePlayStreakStore()
	const { daily, scout, spot, dailyLastGuess, dailyGuesses, dailyAnswer, scoutAnswer, spotResults, refresh } =
		useTodayProgress()
	const { onShare } = useShare()
	const haptics = useHaptics()

	const puzzleNumber = getDisplayNumber(getUKDateString())
	const todayLabel = new Date().toLocaleDateString('en-GB', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		timeZone: 'Europe/London',
	})

	// Challenge opens once today's Daily is finished, win or lose
	const challengeUnlocked = computed(() => ['won', 'lost'].includes(daily.value.status))

	// The Climb (1.2) takes Challenge's place when switched on
	const { climbEnabled } = useRuntimeConfig().public
	const climb = useClimbStore()
	onMounted(() => climbEnabled && climb.load())
	const climbLine = computed(() => {
		if (!climb.saved.club || !climb.season) return 'Start in the National League, climb to Europe'
		const pos = climb.position
		const ord = pos + (['th', 'st', 'nd', 'rd'][((pos % 100) - 20) % 10] || ['th', 'st', 'nd', 'rd'][pos % 100] || 'th')
		return `${climb.saved.club.name} · ${climb.tierName}, ${ord}`
	})

	const rings = computed(() => [
		{ progress: daily.value.progress, color: RING_COLORS.daily },
		{ progress: scout.value.progress, color: RING_COLORS.scout },
		{ progress: spot.value.progress, color: RING_COLORS.spot },
	])

	const stateText = (status: string) =>
		({ new: 'To play', playing: 'In progress', won: 'Done', lost: 'Done' })[status] ?? ''

	const ringModes = computed(() => [
		{ name: 'Daily', color: RING_COLORS.daily, state: stateText(daily.value.status) },
		{ name: 'Scout', color: RING_COLORS.scout, state: stateText(scout.value.status) },
		{ name: 'Spot', color: RING_COLORS.spot, state: stateText(spot.value.status) },
	])

	const completedCount = computed(
		() => [daily.value, scout.value, spot.value].filter(m => m.status === 'won' || m.status === 'lost').length,
	)

	// Player Cards: is today a card day, and has its card been won?
	const cardDay = !!cardForDay(getUKDateString())
	const cardWon = computed(() => cardDay && daily.value.status === 'won')

	// Today's answer is 5 or 6 letters; the preview and copy say which
	const wordLength = getAnswerForDay(getUKDateString()).length || 6
	// Preview tiles: the latest daily guess's colours, or empty tiles before the first guess
	const previewTiles = computed(() =>
		dailyLastGuess.value.length ? dailyLastGuess.value : Array(wordLength).fill('empty'),
	)

	const dailyFinished = computed(() => daily.value.status === 'won' || daily.value.status === 'lost')

	const heroTitle = computed(
		() =>
			({
				new: "Guess today's player",
				playing: 'Back in the game',
				won: `Solved in ${dailyGuesses.value.length}/6`,
				lost: 'Missed it today',
			})[daily.value.status],
	)

	// Finished: who it was, as club · position · nation
	const playerSummary = computed(() =>
		dailyAnswer.value
			? [dailyAnswer.value.club, dailyAnswer.value.position, dailyAnswer.value.nationality].join(' · ')
			: '',
	)

	const heroSubtitle = computed(
		() =>
			({
				new: `${wordLength === 5 ? 'Five' : 'Six'} letters. Six tries. One player a day.`,
				playing: `You're on ${daily.value.label.toLowerCase()}.`,
				won: playerSummary.value,
				lost: playerSummary.value,
			})[daily.value.status],
	)

	const shareCopied = ref(false)
	async function shareDaily() {
		if (!dailyAnswer.value) return
		haptics.select()
		const copied = await onShare(
			dailyGuesses.value,
			dailyAnswer.value.name,
			daily.value.status === 'won',
			puzzleNumber ? `#${puzzleNumber}` : getUKDateString(),
			dailyStats.stats.currentStreak,
		)
		if (copied) {
			shareCopied.value = true
			setTimeout(() => (shareCopied.value = false), 2000)
		}
	}

	const heroCta = computed(
		() => ({ new: 'Play now', playing: 'Continue', won: 'See result', lost: 'See result' })[daily.value.status],
	)

	// Countdown to the next UK midnight, when every mode resets
	const countdown = ref('--:--:--')
	let timer: ReturnType<typeof setInterval> | null = null

	function tick() {
		const now = new Date()
		const uk = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }))
		const next = new Date(uk)
		next.setHours(24, 0, 0, 0)
		const secs = Math.max(0, Math.floor((next.getTime() - uk.getTime()) / 1000))
		const pad = (n: number) => String(n).padStart(2, '0')
		countdown.value = `${pad(Math.floor(secs / 3600))}:${pad(Math.floor((secs % 3600) / 60))}:${pad(secs % 60)}`
		if (secs === 0) refresh()
	}

	onMounted(() => {
		dailyStats.loadStats()
		refresh()
		tick()
		timer = setInterval(tick, 1000)
	})

	onUnmounted(() => {
		if (timer) clearInterval(timer)
	})
</script>

<style scoped lang="scss">
	.app-home {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 0 auto;
		max-width: 480px;
		padding: 0.5rem 0.25rem 7rem;
		width: 100%;
	}

	.home-header {
		align-items: flex-end;
		display: flex;
		gap: 0.5rem;
		justify-content: space-between;

		.date {
			color: var(--text-secondary);
			font-size: 0.8rem;
			font-weight: 700;
			letter-spacing: 0.14em;
			margin: 0 0 0.1rem;
			text-transform: uppercase;
		}

		h1 {
			font-family: var(--font-display);
			// Smaller on narrow phones (SE) so it never runs into the pills
			font-size: clamp(1.9rem, 9.5vw, 2.4rem);
			line-height: 1;
			margin: 0;
		}
	}

	.header-pills {
		align-items: center;
		display: flex;
		gap: 0.5rem;
	}

	.streak-pill {
		height: 2.5rem;
		align-items: center;
		background: color-mix(in srgb, var(--tertiary-color) 15%, transparent);
		border-radius: 999px;
		color: var(--tertiary-color);
		display: inline-flex;
		font-size: 1rem;
		font-variant-numeric: tabular-nums;
		font-weight: 800;
		gap: 0.35rem;
		padding: 0 0.8rem;
	}

	// Not played yet today: the streak is at risk, so the flame dims
	.streak-pill.cold {
		filter: grayscale(0.6);
		opacity: 0.75;
	}

	.rings-card {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.5rem;
		display: flex;
		gap: 1rem;
		padding: 0.8rem 1rem;

		.rings-summary {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: 0.5rem;
			min-width: 0;
		}

		.rings-headline {
			font-family: var(--font-display);
			font-size: 1.5rem;
			line-height: 1;
			margin: 0;
		}

		ul {
			display: flex;
			flex-direction: column;
			gap: 0.3rem;
			list-style: none;
			margin: 0;
			padding: 0;
		}

		li {
			align-items: center;
			display: flex;
			font-size: 0.85rem;
			gap: 0.5rem;
		}

		.dot {
			border-radius: 50%;
			flex-shrink: 0;
			height: 0.55rem;
			width: 0.55rem;
		}

		.mode-name {
			font-weight: 700;
		}

		.mode-state {
			color: var(--text-secondary);
			margin-left: auto;
		}
	}

	.daily-hero {
		background: linear-gradient(160deg, var(--fl-raised) 0%, var(--bg-secondary) 100%);
		border: 1px solid color-mix(in srgb, var(--primary-color) 30%, transparent);
		border-radius: 1.75rem;
		box-shadow: 0 24px 48px -26px color-mix(in srgb, var(--primary-color) 55%, transparent);
		color: var(--text-primary);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.3rem;
		text-decoration: none;
		transition: transform 0.15s ease;

		&:active {
			transform: scale(0.98);
		}

		.hero-top {
			align-items: center;
			display: flex;
			justify-content: space-between;
		}

		.eyebrow {
			color: var(--primary-color);
			font-size: 0.75rem;
			font-weight: 800;
			letter-spacing: 0.16em;
			text-transform: uppercase;
		}

		.league {
			color: var(--text-secondary);
			font-size: 0.75rem;
			font-weight: 700;
		}

		.tile-preview {
			display: flex;
			gap: 0.4rem;

			.tile {
				aspect-ratio: 1;
				border-radius: 0.65rem;
				flex: 0 1 2.6rem;

				&.correct {
					background: var(--color-success);
					box-shadow: 0 0 16px color-mix(in srgb, var(--color-success) 50%, transparent);
				}

				&.present {
					background: var(--color-present);
				}

				&.absent {
					background: var(--color-absent);
				}

				&.empty {
					border: 1.5px solid var(--border);
				}
			}
		}

		.hero-copy {
			h2 {
				font-family: var(--font-display);
				font-size: 1.6rem;
				line-height: 1.05;
				margin: 0 0 0.25rem;
			}

			p {
				color: var(--text-secondary);
				font-size: 0.9rem;
				margin: 0;
			}
		}

		.answer-tiles .tile {
			align-items: center;
			animation: tile-flip 0.45s ease both;
			color: #06140d;
			display: flex;
			font-family: var(--font-display);
			font-size: 1.25rem;
			justify-content: center;
		}

		.answer-tiles.won .tile {
			background: var(--color-success);
			box-shadow: 0 0 16px color-mix(in srgb, var(--color-success) 45%, transparent);
		}

		.answer-tiles.lost .tile {
			background: color-mix(in srgb, var(--fl-red) 85%, transparent);
			color: #2a0a07;
		}

		.fulltime-row {
			align-items: center;
			display: flex;
			gap: 0.75rem;
			justify-content: space-between;
		}

		.next-player {
			color: var(--text-secondary);
			display: flex;
			flex-direction: column;
			font-size: 0.75rem;
			font-weight: 700;
			letter-spacing: 0.04em;

			strong {
				color: var(--text-primary);
				font-family: var(--font-display);
				font-size: 1.2rem;
				font-variant-numeric: tabular-nums;
				letter-spacing: 0;
			}
		}

		.share-btn {
			align-items: center;
			background: var(--primary-color);
			border: 0;
			border-radius: 1rem;
			color: var(--on-success);
			cursor: pointer;
			display: flex;
			font: inherit;
			font-size: 1rem;
			font-weight: 800;
			gap: 0.45rem;
			height: 3rem;
			padding: 0 1.3rem;

			&:active {
				transform: scale(0.96);
			}
		}

		.hero-cta {
			align-items: center;
			background: var(--primary-color);
			border-radius: 1rem;
			color: var(--on-success);
			display: flex;
			font-size: 1rem;
			font-weight: 800;
			height: 3.25rem;
			justify-content: center;
		}
	}

	.answer-line {
		align-items: center;
		color: var(--text-primary) !important;
		display: flex;
		font-weight: 800;
		gap: 0.3rem;
		text-transform: capitalize;

		&.won .iconify {
			color: var(--color-success);
		}

		&.lost .iconify {
			color: var(--fl-red);
		}
	}

	.spot-score {
		color: var(--text-primary) !important;
		font-family: var(--font-display);
		font-size: 1.15rem !important;
	}

	.spot-dots {
		display: flex;
		gap: 0.2rem;
		margin-top: 0.15rem;

		i {
			background: var(--fl-red);
			border-radius: 50%;
			height: 0.45rem;
			width: 0.45rem;

			&.hit {
				background: var(--color-success);
			}
		}
	}

	@keyframes tile-flip {
		from {
			opacity: 0;
			transform: rotateX(90deg);
		}

		to {
			opacity: 1;
			transform: rotateX(0);
		}
	}

	.mode-grid {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.daily-hero,
	.mode-card,
	.challenge-row {
		isolation: isolate;
		overflow: hidden;
		position: relative;

		> :not(.bg-icon) {
			position: relative;
			z-index: 1;
		}
	}

	.mode-card,
	.challenge-row {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		color: var(--text-primary);
		display: flex;
		text-decoration: none;
		transition: transform 0.15s ease;

		&:active {
			transform: scale(0.97);
		}
	}

	.mode-card {
		border-radius: 1.4rem;
		flex-direction: column;
		justify-content: flex-end;
		min-height: 7.5rem;
		padding: 1rem;
	}

	.challenge-row {
		align-items: center;
		border-radius: 1.25rem;
		gap: 0.85rem;
		padding: 0.9rem 1rem;

		// Locked: full-contrast text with a lock chip, rather than fading the whole row
		.lock-chip {
			align-items: center;
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: 999px;
			color: var(--text-secondary);
			display: inline-flex;
			flex-shrink: 0;
			font-size: 0.72rem;
			font-weight: 800;
			gap: 0.25rem;
			margin-left: auto;
			padding: 0.25rem 0.55rem;
		}

		.chevron {
			color: var(--text-secondary);
			margin-left: auto;
		}
	}

	// Oversized mode icon sitting behind the card's text
	.bg-icon {
		bottom: -1.25rem;
		font-size: 7.5rem;
		height: 7.5rem;
		pointer-events: none;
		position: absolute;
		right: -1rem;
		transform: rotate(-12deg);
		width: 7.5rem;
		z-index: 0;

		&.daily {
			color: var(--primary-color);
			font-size: 11rem;
			height: 11rem;
			opacity: 0.07;
			right: -3rem;
			top: 1.5rem;
			bottom: auto;
			width: 11rem;
		}

		// Kept faint so they read as texture behind the text, not as smudges
		&.scout {
			color: var(--fl-blue);
			opacity: 0.1;
		}

		&.spot {
			color: var(--tertiary-color);
			opacity: 0.1;
		}

		&.challenge {
			bottom: -1.6rem;
			color: var(--fl-red);
			font-size: 5.5rem;
			height: 5.5rem;
			opacity: 0.1;
			right: 2.25rem;
			width: 5.5rem;
		}
	}

	.mode-text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;

		strong {
			font-size: 1rem;
			font-weight: 800;
		}

		span {
			color: var(--text-secondary);
			font-size: 0.82rem;
		}
	}

	.kickoff {
		align-items: center;
		display: flex;
		justify-content: space-between;
		padding: 0 0.25rem;

		span {
			color: var(--text-secondary);
			font-size: 0.85rem;
		}

		strong {
			font-family: var(--font-display);
			font-size: 1.15rem;
			font-variant-numeric: tabular-nums;
			letter-spacing: 0.04em;
		}
	}

	// Short phones (iPhone SE): keep all four modes above the tab bar on first view
	@media (height <= 700px) {
		.tile-preview:not(.answer-tiles) {
			display: none;
		}

		.mode-card {
			min-height: 5.5rem;
		}
	}

	.card-chip {
		align-items: center;
		background: color-mix(in srgb, var(--tertiary-color) 16%, transparent);
		border-radius: 999px;
		color: var(--tertiary-color);
		display: inline-flex;
		font-size: 0.72rem;
		font-weight: 800;
		gap: 0.3rem;
		padding: 0.25rem 0.6rem;

		&.got {
			background: color-mix(in srgb, var(--color-success) 16%, transparent);
			color: var(--color-success);
		}
	}
</style>
