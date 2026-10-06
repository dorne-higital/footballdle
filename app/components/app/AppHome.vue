<template>
	<div class="app-home">
		<header class="home-header">
			<div>
				<p class="date">{{ todayLabel }}</p>
				<h1>Matchday</h1>
			</div>
			<span
				class="streak-pill"
				:aria-label="`${dailyStats.stats.currentStreak} day streak`"
			>
				<Icon
					name="solar:fire-bold"
					size="1.05rem"
				/>
				{{ dailyStats.stats.currentStreak }}
			</span>
		</header>

		<section
			class="rings-card"
			aria-label="Today's progress"
		>
			<ActivityRings
				:rings="rings"
				:size="116"
				:stroke="12"
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
			:to="{ path: '/play/daily', query: daily.status === 'new' || daily.status === 'playing' ? { start: 'play' } : {} }"
			class="daily-hero"
		>
			<Icon
				name="solar:calendar-linear"
				class="bg-icon daily"
				aria-hidden="true"
			/>
			<div class="hero-top">
				<span class="eyebrow">Daily · #{{ puzzleNumber }}</span>
				<span class="league">Premier League</span>
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

		<div class="mode-grid">
			<NuxtLink
				:to="{ path: '/play/scout-report', query: scout.status === 'won' || scout.status === 'lost' ? {} : { start: 'play' } }"
				class="mode-card"
			>
				<Icon
					name="solar:magnifer-linear"
					class="bg-icon scout"
					aria-hidden="true"
				/>
				<span class="mode-text">
					<strong>Scout Report</strong>
					<span>{{ scout.label }}</span>
				</span>
			</NuxtLink>
			<NuxtLink
				:to="{ path: '/play/spot-the-baller', query: spot.status === 'won' ? {} : { start: 'play' } }"
				class="mode-card"
			>
				<Icon
					name="solar:eye-linear"
					class="bg-icon spot"
					aria-hidden="true"
				/>
				<span class="mode-text">
					<strong>Spot the Baller</strong>
					<span>{{ spot.label }}</span>
				</span>
			</NuxtLink>
		</div>

		<NuxtLink
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
			<Icon
				name="solar:alt-arrow-right-linear"
				size="1.2rem"
				class="chevron"
			/>
		</NuxtLink>

		<div class="kickoff">
			<span>Next kick-off</span>
			<strong>{{ countdown }}</strong>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, onUnmounted, ref } from 'vue'
	import ActivityRings from './ActivityRings.vue'
	import { useModeStatsStore } from '../../stores/modeStats'
	import { useTodayProgress } from '../../composables/useTodayProgress'
	import { getPuzzleNumber } from '../../composables/useFootballers'
	import { getUKDateString } from '../../utils/dateStreak'

	const RING_COLORS = { daily: '#2FE08A', scout: '#6EA8FF', spot: '#F2B84B' }

	const dailyStats = useModeStatsStore('daily')
	const { daily, scout, spot, dailyLastGuess, refresh } = useTodayProgress()

	const puzzleNumber = getPuzzleNumber(getUKDateString())
	const todayLabel = new Date().toLocaleDateString('en-GB', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		timeZone: 'Europe/London',
	})

	const challengeUnlocked = ref(false)

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

	// Six preview tiles: the latest daily guess's colours, or empty tiles before the first guess
	const previewTiles = computed(() =>
		dailyLastGuess.value.length ? dailyLastGuess.value : Array(6).fill('empty'),
	)

	const heroTitle = computed(
		() =>
			({
				new: "Guess today's player",
				playing: 'Back in the game',
				won: 'Back of the net',
				lost: 'Unlucky today',
			})[daily.value.status],
	)

	const heroSubtitle = computed(
		() =>
			({
				new: 'Six letters. Six tries. One player a day.',
				playing: `You're on ${daily.value.label.toLowerCase()}.`,
				won: `${daily.value.label}. Streak on ${dailyStats.stats.currentStreak}.`,
				lost: 'New player at midnight. Go again tomorrow.',
			})[daily.value.status],
	)

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
		try {
			challengeUnlocked.value = !!JSON.parse(localStorage.getItem('footballdle-challenge') || '{}').isUnlocked
		} catch {
			challengeUnlocked.value = false
		}
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
			font-size: 2.4rem;
			line-height: 1;
			margin: 0;
		}
	}

	.streak-pill {
		align-items: center;
		background: color-mix(in srgb, var(--tertiary-color) 15%, transparent);
		border-radius: 999px;
		color: var(--tertiary-color);
		display: inline-flex;
		font-size: 1rem;
		font-variant-numeric: tabular-nums;
		font-weight: 800;
		gap: 0.35rem;
		padding: 0.5rem 0.8rem;
	}

	.rings-card {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.5rem;
		display: flex;
		gap: 1.1rem;
		padding: 1rem 1.1rem;

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

		&.locked {
			opacity: 0.7;
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
			opacity: 0.1;
			right: -2rem;
			top: 1.5rem;
			bottom: auto;
			width: 11rem;
		}

		&.scout {
			color: var(--fl-blue);
			opacity: 0.22;
		}

		&.spot {
			color: var(--tertiary-color);
			opacity: 0.22;
		}

		&.challenge {
			bottom: -1.6rem;
			color: var(--fl-red);
			font-size: 5.5rem;
			height: 5.5rem;
			opacity: 0.22;
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
</style>
