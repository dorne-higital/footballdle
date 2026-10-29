<template>
	<div class="app-home">
		<header class="home-header">
			<div>
				<p class="date">{{ todayLabel }}</p>
				<h1>Matchday</h1>
			</div>
			<div class="header-pills">
				<HintPill />
				<MatchdayStreakPill />
			</div>
		</header>

		<!-- The big card is always the next game to play: the Daily first, then Scout Report,
		     then Spot the Baller (the same order as the full-time panel's next-game button) -->
		<NuxtLink
			v-if="nextKey === 'daily'"
			:to="{ path: '/play/daily', query: { start: 'play' } }"
			class="daily-hero hero"
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
					Win today's card
				</span>
				<span
					v-else
					class="league"
					>Premier League</span
				>
			</div>
			<div
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
			<span class="hero-cta">{{ heroCta }}</span>
		</NuxtLink>

		<NuxtLink
			v-else-if="nextMode"
			:to="{ path: nextMode.path, query: { start: 'play' } }"
			:class="['hero', 'next-hero', nextMode.key]"
			:aria-label="`Next up: ${nextMode.name}. ${nextMode.cta}`"
		>
			<Icon
				:name="nextMode.icon"
				:class="['bg-icon', 'big', nextMode.key]"
				aria-hidden="true"
			/>
			<div class="hero-top">
				<span class="eyebrow">Next up{{ puzzleNumber ? ` · #${puzzleNumber}` : '' }}</span>
				<span
					v-if="nextMode.playing"
					class="league"
					>In progress</span
				>
			</div>
			<div class="hero-copy">
				<h2>{{ nextMode.name }}</h2>
				<p>{{ nextMode.hook }}</p>
			</div>
			<span class="hero-cta">{{ nextMode.cta }}</span>
		</NuxtLink>

		<section
			v-else
			class="hero done-hero"
			aria-label="Matchday finished"
		>
			<span class="eyebrow">Matchday{{ puzzleNumber ? ` · #${puzzleNumber}` : '' }}</span>
			<div class="hero-copy">
				<h2>That's Matchday done</h2>
				<p>
					All three played. New puzzles in
					<strong class="countdown">{{ countdown }}</strong>
				</p>
			</div>
			<button
				type="button"
				class="share-btn"
				@click="shareMatchday"
			>
				<Icon
					name="solar:share-linear"
					size="1.1rem"
				/>
				{{ matchdayCopied ? 'Copied!' : 'Share Matchday' }}
			</button>
			<NuxtLink
				v-if="grid.ready && !grid.weekDone"
				to="/play/grid"
				class="hero-secondary"
				>Play The Grid</NuxtLink
			>
		</section>

		<!-- Today's three games, each shown once: the rings, then a row for every game not in the big card -->
		<section
			class="today-strip"
			aria-label="Today's games"
		>
			<div class="strip-head">
				<ActivityRings
					:rings="rings"
					:size="56"
					:stroke="7"
					:label="`${completedCount} of 3 games done today`"
				/>
				<p class="strip-headline">{{ completedCount }}/3 today</p>
			</div>
			<ul>
				<li
					v-for="row in stripRows"
					:key="row.key"
				>
					<NuxtLink
						:to="{ path: row.path, query: { start: row.done ? 'result' : 'play' } }"
						class="strip-row"
						:aria-label="row.spoken"
					>
						<span
							class="dot"
							:style="{ background: row.color }"
						></span>
						<span class="strip-text">
							<strong>{{ row.name }}</strong>
							<span
								v-if="row.answer"
								:class="['answer-line', row.status]"
							>
								<Icon
									:name="row.status === 'won' ? 'solar:check-circle-bold' : 'solar:close-circle-bold'"
									size="0.9rem"
								/>
								{{ row.answer }}
							</span>
							<span
								v-else-if="row.key === 'spot' && spotResults.length"
								class="spot-dots"
								aria-hidden="true"
							>
								<i
									v-for="(hit, n) in spotResults"
									:key="n"
									:class="{ hit }"
								></i>
							</span>
							<span
								v-if="row.key === 'daily' && cardDay && row.done"
								:class="['card-chip', 'small', { got: cardWon }]"
							>
								<Icon
									name="solar:card-2-bold"
									size="0.75rem"
								/>
								{{ cardWon ? 'Card collected' : 'Card missed' }}
							</span>
						</span>
						<span :class="['strip-score', { todo: !row.done }]">{{ row.score }}</span>
						<Icon
							name="solar:alt-arrow-right-linear"
							class="chevron"
							size="1rem"
							aria-hidden="true"
						/>
					</NuxtLink>
				</li>
			</ul>
		</section>

		<NuxtLink
			to="/play/grid"
			class="challenge-row"
		>
			<Icon
				name="solar:widget-4-linear"
				class="bg-icon challenge"
				aria-hidden="true"
			/>
			<span class="mode-text">
				<strong>The Grid</strong>
				<span>{{ gridLine }}</span>
			</span>
			<Icon
				name="solar:alt-arrow-right-linear"
				class="chevron"
				size="1.1rem"
				aria-hidden="true"
			/>
		</NuxtLink>

		<FactCard />

		<div
			v-if="nextKey"
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
	import MatchdayStreakPill from '../shared/MatchdayStreakPill.vue'
	import { useGridStore } from '../../stores/grid'
	import { nextToPlay, useTodayProgress, type ModeKey } from '../../composables/useTodayProgress'
	import { getDisplayNumber, getAnswerForDay } from '../../composables/useFootballers'
	import { getUKDateString } from '../../utils/dateStreak'
	import { useShare } from '../../composables/useShare'
	import { SPOT_ROUNDS_PER_MATCH } from '../../composables/useSpotFootballers'
	import { useScoutReportStore } from '../../stores/scoutReport'
	import { useAccessibilityStore } from '../../stores/accessibility'
	import { useHaptics } from '../../composables/useHaptics'

	// Each game's colour (assets/_app-shell.scss), so themes and Greyscale can change them
	const RING_COLORS = { daily: 'var(--game-daily)', scout: 'var(--game-scout)', spot: 'var(--game-spot)' }

	const dailyStats = useModeStatsStore('daily')
	// Days in a row with at least one game finished, win or lose
	const playStreak = usePlayStreakStore()
	const { daily, scout, spot, dailyLastGuess, dailyGuesses, dailyAnswer, scoutAnswer, spotResults, refresh } =
		useTodayProgress()
	const { onShare, getMatchdayShareText, shareText } = useShare()
	const haptics = useHaptics()

	const puzzleNumber = getDisplayNumber(getUKDateString())
	const todayLabel = new Date().toLocaleDateString('en-GB', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		timeZone: 'Europe/London',
	})

	// The Grid: this week's points once it has been played, otherwise what it is
	const grid = useGridStore()
	onMounted(() => grid.load())
	const gridLine = computed(() =>
		grid.ready && grid.weekSolved > 0
			? `Grid Week · ${grid.weekPoints.toLocaleString('en-GB')} / 4,500`
			: 'Five new grids every Saturday',
	)

	const rings = computed(() => [
		{ progress: daily.value.progress, color: RING_COLORS.daily },
		{ progress: scout.value.progress, color: RING_COLORS.scout },
		{ progress: spot.value.progress, color: RING_COLORS.spot },
	])

	const completedCount = computed(
		() => [daily.value, scout.value, spot.value].filter(m => m.status === 'won' || m.status === 'lost').length,
	)

	// The big card shows the next game to play; the strip below lists the other two
	const nextKey = computed(() => nextToPlay({ daily: daily.value, scout: scout.value, spot: spot.value }))

	const MODES: Record<ModeKey, { name: string; path: string; icon: string; color: string; hook: string }> = {
		daily: {
			name: 'Daily',
			path: '/play/daily',
			icon: 'solar:calendar-linear',
			color: RING_COLORS.daily,
			hook: '',
		},
		scout: {
			name: 'Scout Report',
			path: '/play/scout-report',
			icon: 'solar:clipboard-list-linear',
			color: RING_COLORS.scout,
			hook: "Start with a scout's brief. Every guess shows club, nation, position and price clues.",
		},
		spot: {
			name: 'Spot the Baller',
			path: '/play/spot-the-baller',
			icon: 'solar:eye-linear',
			color: RING_COLORS.spot,
			hook: '10 quick rounds. Pick the right name before the clock runs out.',
		},
	}

	const progressOf = (key: ModeKey) => ({ daily: daily.value, scout: scout.value, spot: spot.value })[key]

	const nextMode = computed(() => {
		const key = nextKey.value
		if (!key || key === 'daily') return null
		const playing = progressOf(key).status === 'playing'
		return { key, ...MODES[key], playing, cta: playing ? 'Continue' : 'Play now' }
	})

	const stripRows = computed(() =>
		(['daily', 'scout', 'spot'] as const)
			.filter(key => key !== nextKey.value)
			.map(key => {
				const p = progressOf(key)
				const done = p.status === 'won' || p.status === 'lost'
				const answer = !done ? '' : key === 'daily' ? (dailyAnswer.value?.name ?? '') : key === 'scout' ? scoutAnswer.value : ''
				const score = done ? (p.score ?? 'Done') : p.status === 'playing' ? 'In progress' : 'To play'
				return {
					key,
					...MODES[key],
					status: p.status,
					done,
					answer,
					score,
					spoken: `${MODES[key].name}: ${done ? `${p.label}${answer ? `, ${answer}` : ''}` : score}`,
				}
			}),
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

	const heroTitle = computed(
		() =>
			({
				new: "Guess today's player",
				playing: 'Back in the game',
			})[daily.value.status as 'new' | 'playing'],
	)

	const heroSubtitle = computed(
		() =>
			({
				new: `${wordLength === 5 ? 'Five' : 'Six'} letters. Six tries. One player a day.`,
				playing: `You're on ${daily.value.label.toLowerCase()}.`,
			})[daily.value.status as 'new' | 'playing'],
	)

	// Once all three daily games are done: one message with every result
	const matchdayCopied = ref(false)
	async function shareMatchday() {
		if (!dailyAnswer.value) return
		haptics.select()
		const scoutStore = useScoutReportStore()
		scoutStore.loadState()
		const text = getMatchdayShareText({
			puzzle: puzzleNumber,
			streak: playStreak.activeStreak,
			daily: { guesses: dailyGuesses.value, answer: dailyAnswer.value.name, isWin: daily.value.status === 'won' },
			scout: { results: scoutStore.guessResults, isWin: scout.value.status === 'won', maxGuesses: scoutStore.maxGuesses },
			spot: {
				results: spotResults.value,
				score: spotResults.value.filter(Boolean).length,
				rounds: SPOT_ROUNDS_PER_MATCH,
				relaxed: useAccessibilityStore().relaxedTimer,
			},
			gridPoints: grid.ready ? grid.weekPoints : 0,
		})
		if (await shareText(text)) {
			matchdayCopied.value = true
			setTimeout(() => (matchdayCopied.value = false), 2000)
		}
	}

	const heroCta = computed(
		() => (daily.value.status === 'playing' ? 'Continue' : 'Play now'),
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
		// Clears the tab bar (0.5 + 4.25rem) and its fade (2.25rem) with room to spare
		padding: 0.5rem 0.25rem 7.75rem;
		width: 100%;
	}

	.home-header {
		align-items: flex-end;
		display: flex;
		// Large text (Settings > Accessibility): the pills drop under the title
		flex-wrap: wrap;
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



	// The big card: the next game to play, or Matchday done
	.hero {
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
				position: relative;

				&.correct {
					background: var(--color-success);
					box-shadow: 0 0 16px color-mix(in srgb, var(--color-success) 50%, transparent);
				}

				&.present {
					background: var(--color-present);

					// Close carries a dot, as on the board
					&::after {
						background: var(--on-present);
						border-radius: 50%;
						content: '';
						height: 0.35rem;
						position: absolute;
						right: 0.3rem;
						top: 0.3rem;
						width: 0.35rem;
					}
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

		.share-btn {
			align-items: center;
			background: var(--primary-color);
			border: 0;
			border-radius: 1rem;
			color: var(--on-primary);
			cursor: pointer;
			display: flex;
			font: inherit;
			font-size: 1rem;
			font-weight: 800;
			gap: 0.45rem;
			height: 3.25rem;
			justify-content: center;
			padding: 0 1.3rem;

			&:active {
				transform: scale(0.96);
			}
		}

		.hero-cta {
			align-items: center;
			background: var(--primary-color);
			border-radius: 1rem;
			color: var(--on-primary);
			display: flex;
			font-size: 1rem;
			font-weight: 800;
			height: 3.25rem;
			justify-content: center;
		}

		.countdown {
			color: var(--text-primary);
			font-family: var(--font-display);
			font-variant-numeric: tabular-nums;
			letter-spacing: 0.04em;
		}

		.hero-secondary {
			align-self: center;
			color: var(--text-secondary);
			font-size: 0.9rem;
			font-weight: 800;
			padding: 0.25rem 0.75rem;
			text-decoration: underline;
			text-underline-offset: 0.2em;
		}
	}

	// Scout Report and Spot the Baller take the game's own colour, button included
	.next-hero {
		&.scout {
			--game: var(--game-scout);
		}

		&.spot {
			--game: var(--game-spot);
		}

		border-color: color-mix(in srgb, var(--game) 40%, transparent);
		box-shadow: 0 24px 48px -26px color-mix(in srgb, var(--game) 55%, transparent);

		.eyebrow {
			color: var(--game);
		}

		.hero-cta {
			background: var(--game);
			color: var(--on-game);
		}

		.hero-copy {
			margin-top: 2.5rem;
		}
	}

	.done-hero .hero-copy {
		margin-top: 0.25rem;
	}

	// Today's three games in one list: rings and count, then a row per game not in the big card
	.today-strip {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.8rem 0.9rem 0.45rem;

		.strip-head {
			align-items: center;
			display: flex;
			gap: 0.75rem;
		}

		.strip-headline {
			font-family: var(--font-display);
			font-size: 1.35rem;
			line-height: 1;
			margin: 0;
		}

		ul {
			list-style: none;
			margin: 0;
			padding: 0;
		}

		li + li {
			border-top: 1px solid var(--border);
		}

		.strip-row {
			align-items: center;
			color: var(--text-primary);
			display: flex;
			gap: 0.65rem;
			min-height: 3.25rem;
			padding: 0.5rem 0.1rem;
			text-decoration: none;

			&:active {
				opacity: 0.7;
			}
		}

		.dot {
			border-radius: 50%;
			flex-shrink: 0;
			height: 0.6rem;
			width: 0.6rem;
		}

		.strip-text {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: 0.15rem;
			min-width: 0;

			strong {
				font-size: 0.95rem;
				font-weight: 800;
			}

			.answer-line {
				font-size: 0.82rem;
			}
		}

		.card-chip.small {
			align-self: flex-start;
			font-size: 0.68rem;
			padding: 0.15rem 0.5rem;
		}

		.strip-score {
			font-family: var(--font-display);
			font-size: 1.1rem;
			font-variant-numeric: tabular-nums;

			&.todo {
				color: var(--text-secondary);
				font-family: var(--font-body);
				font-size: 0.82rem;
				font-weight: 700;
			}
		}

		.chevron {
			color: var(--text-secondary);
			flex-shrink: 0;
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

	.hero,
	.challenge-row {
		// paint containment: WebKit can count the rotated .bg-icon past the card edge as
		// scrollable width even with overflow: hidden
		contain: paint;
		isolation: isolate;
		overflow: hidden;
		position: relative;

		> :not(.bg-icon) {
			position: relative;
			z-index: 1;
		}
	}

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

		// The Grid's colour as a stripe down the left, like the Today strip's dots
		border-left: 4px solid var(--game-grid);
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
			color: var(--game-daily);
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
			color: var(--game-scout);
			opacity: 0.1;
		}

		// Pulled in from the corner so the whole eye shows, not just its middle
		&.spot {
			bottom: -0.6rem;
			color: var(--game-spot);
			opacity: 0.12;
			right: -0.4rem;
		}

		&.challenge {
			bottom: -1.6rem;
			color: var(--game-grid);
			font-size: 5.5rem;
			height: 5.5rem;
			opacity: 0.16;
			right: 2.25rem;
			width: 5.5rem;
		}

		// Next-up card (last, so it beats .scout and .spot): the mode's icon at the Daily card's size
		&.big {
			bottom: auto;
			font-size: 11rem;
			height: 11rem;
			opacity: 0.08;
			right: -3rem;
			top: 1.5rem;
			width: 11rem;
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

	// Short phones (iPhone SE): keep the strip above the tab bar on first view
	@media (height <= 700px) {
		.tile-preview {
			display: none;
		}

		.next-hero .hero-copy {
			margin-top: 0.5rem;
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
