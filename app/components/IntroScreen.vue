<template>
	<div class="intro-screen">
		<!-- Loading State -->
		<div
			v-if="isLoading"
			class="loading-overlay"
		>
			<div class="loading-content">
				<Loader />
			</div>
		</div>

		<div class="intro-content">
			<div class="intro-header">
				<h1 class="heading">Footballdle</h1>

				<div class="icons">
					<a
						href="https://buymeacoffee.com/dhorne92E"
						target="_blank"
						rel="noopener noreferrer"
						class="coffee-link"
						@click.prevent="$emit('buy-coffee', 'intro_header')"
						aria-label="Buy me a coffee"
					>
						<Icon
							name="uil:coffee"
							size="1.5rem"
						/>
					</a>

					<Icon
						name="uil:info-circle"
						@click="$emit('show-info')"
						size="1.5rem"
					/>

					<Icon
						name="uil:setting"
						@click="$emit('show-settings')"
						size="1.5rem"
					/>

					<Icon
						name="uil:statistics"
						@click="$emit('show-stats')"
						size="1.5rem"
					/>
				</div>
			</div>

			<p class="subheading">Guess the Premier League footballer</p>

			<div
				v-if="stats.currentStreak > 1"
				class="streak-bar"
			>
				<Icon
					name="solar:fire-bold"
					size="1rem"
				/>
				<span>{{ stats.currentStreak }} day streak</span>
			</div>

			<div
				v-if="canPlay"
				class="play-section"
			>
				<div class="usp-tiles">
					<div class="tile">
						<Icon
							name="solar:calendar-linear"
							size="1.5rem"
						/>

						<h6>New player to guess every day</h6>
					</div>

					<div class="tile">
						<Icon
							name="solar:football-outline"
							size="1.5rem"
						/>
						<h6>25/26 Premier League players</h6>
					</div>

					<div class="tile">
						<Icon
							name="solar:magnifer-linear"
							size="1.5rem"
						/>
						<h6>Only players with 6 letter surnames</h6>
					</div>

					<div class="tile">
						<Icon
							name="solar:shield-warning-linear"
							size="1.5rem"
						/>
						<h6>Maximum 6 guesses</h6>
					</div>
				</div>

				<h6 class="heading">
					{{ hasIncompleteGame ? 'Looks like you have a game in progress' : 'Ready to play?' }}
				</h6>

				<button
					@click="$emit('start-game')"
					class="button primary play-button"
				>
					{{ hasIncompleteGame ? 'Resume Game' : 'Play Now' }}
				</button>
			</div>

			<div
				v-else-if="hasIncompleteGame"
				class="incomplete-game-section"
			>
				<h3 class="heading">Continue your game?</h3>
				<p class="caption">
					You have an unfinished game from today. Would you like to continue where you left off?
				</p>

				<button
					@click="$emit('start-game')"
					class="button primary play-button"
				>
					Continue Game
				</button>
			</div>

			<div
				v-else
				class="already-played-section"
			>
				<h3 class="heading">Daily game played!</h3>
				<p class="caption">Looks like you have played today, come back tomorrow to play it again</p>

				<div class="countdown">
					<h4>{{ countdown }}</h4>
				</div>

				<div class="game-ctas">
					<NuxtLink
						class="view-result-btn"
						@click="$emit('show-result')"
					>
						<Icon
							name="solar:share-linear"
							size="1rem"
						/>
						Todays result
					</NuxtLink>

					<NuxtLink
						:to="`/solution/${yesterdayISO}`"
						class="yesterday-link"
					>
						<Icon
							name="solar:history-linear"
							size="0.9rem"
						/>
						Prev answer
					</NuxtLink>
				</div>

				<div
					v-if="challengeUnlocked"
					class="challenge-section"
				>
					<div class="challenge-divider">
						<p class="caption">or</p>
					</div>

					<h3>Challenge mode</h3>

					<div class="usp-tiles">
						<div class="tile">
							<Icon
								name="solar:rewind-5-seconds-forward-bold"
								size="1.5rem"
							/>

							<h6>Only 5 letters</h6>
						</div>

						<div class="tile">
							<Icon
								name="solar:earth-linear"
								size="1.5rem"
							/>

							<h6>Current Premier League player</h6>
						</div>

						<div class="tile">
							<Icon
								name="solar:alarm-outline"
								size="1.5rem"
							/>

							<h6>Play against the clock</h6>
						</div>

						<div class="tile">
							<Icon
								name="solar:refresh-linear"
								size="1.5rem"
							/>

							<h6>Unlimed plays</h6>
						</div>
					</div>

					<button
						@click="$emit('start-challenge')"
						class="button primary full large challenge play-button"
					>
						Play now!
					</button>
				</div>
			</div>
			<!-- World Cup Event Banner -->
			<NuxtLink
				to="/worldcup"
				class="wc-event-banner"
			>
				<div class="wc-banner-content">
					<div class="wc-banner-top">
						<span class="wc-live-badge">
							<span class="wc-live-dot" />
							Limited Event
						</span>
						<span class="wc-player-count">1,042 players</span>
					</div>
					<h3 class="wc-banner-title">World Cup 2026</h3>
					<p class="wc-banner-sub">Guess any WC player — any name length</p>
					<span class="wc-banner-cta">
						Play now
						<Icon
							name="solar:alt-arrow-right-linear"
							size="0.9rem"
						/>
					</span>
				</div>
				<div class="wc-banner-graphic">
					<Icon
						name="solar:football-bold"
						class="wc-ball"
					/>
					<Icon
						name="solar:cup-star-bold"
						class="wc-trophy"
					/>
				</div>
			</NuxtLink>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue'

	const props = withDefaults(
		defineProps<{
			canPlay?: boolean
			countdown?: string
			challengeUnlocked?: boolean
			hasIncompleteGame?: boolean
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
			challengeUnlocked: false,
			hasIncompleteGame: false,
			stats: () => ({
				gamesPlayed: 0,
				wins: 0,
				losses: 0,
				currentStreak: 0,
				maxStreak: 0,
			}),
			winPercentage: 0,
		},
	)

	const emit = defineEmits([
		'start-game',
		'start-challenge',
		'show-info',
		'show-settings',
		'show-stats',
		'buy-coffee',
		'show-result',
	])

	const isLoading = ref(false) // Start with no loading

	const yesterdayISO = computed(() => {
		const now = new Date()
		const d = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }))
		d.setDate(d.getDate() - 1)
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
	})
</script>

<style scoped lang="scss">
	.intro-screen {
		align-items: stretch;
		display: flex;
		min-height: 100%;
		justify-content: center;
		position: relative;
		width: 100%;

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

		.intro-content {
			border-radius: var(--global-border-radius);
			display: flex;
			flex-direction: column;
			max-width: 500px;
			padding-bottom: 1rem;
			place-content: center flex-start;
			text-align: center;
			width: 100%;

			.intro-header {
				align-items: flex-start;
				align-items: center;
				display: flex;
				flex-direction: row;
				justify-content: space-between;

				.heading {
					background: var(--color-gradient);
					background-clip: text;
					font-weight: 700;
					-webkit-text-fill-color: transparent;
				}

				.icons {
					align-items: center;
					display: flex;
					flex-direction: row;
					gap: 0.75rem;

					.coffee-link {
						align-items: center;
						border-bottom: none;
						color: var(--text-primary);
						display: flex;
						transition: all 0.2s;

						&:hover {
							border-bottom: none;
							color: var(--primary-color);
							transform: scale(1.1);
						}
					}
				}
			}

			.subheading {
				color: var(--text-primary);
				margin: 0;
				text-align: left;
			}

			.streak-bar {
				align-items: center;
				background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
				border-radius: 2rem;
				color: #fff;
				display: inline-flex;
				font-size: 0.85rem;
				font-weight: 600;
				gap: 0.35rem;
				margin-top: 0.5rem;
				padding: 0.3rem 0.85rem;
			}

			.play-section {
				background: var(--subtle-gradient);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				color: white;
				margin-top: 1rem;
				padding: 1rem;

				.heading {
					margin-bottom: 0.5rem;
				}

				.caption {
					line-height: 1.5;
					margin-bottom: 1.5rem;
				}

				.usp-tiles {
					display: grid;
					gap: 1rem;
					grid-template-columns: repeat(2, 1fr);
					margin: 1rem 0;

					@media (width <= 600px) {
						grid-template-columns: repeat(1, 1fr);
					}

					.tile {
						backdrop-filter: blur(10px);
						background: rgb(255 255 255 / 10%);
						border: 1px solid rgb(255 255 255 / 20%);
						border-radius: var(--global-border-radius);
						color: white;
						padding: 1rem;
						text-align: center;

						@media (width <= 600px) {
							align-items: center;
							display: flex;
							flex-direction: row;
							gap: 0.5rem;
							padding: 0.5rem;
							text-align: left;
						}

						h6 {
							font-size: 0.8rem;
						}
					}
				}

				.play-button {
					border-radius: var(--global-border-radius);
					font-size: 1.1rem;
					justify-content: center;
					margin-top: 1rem;
					padding: 1rem 2rem;
					text-align: center;
					text-transform: uppercase;
					transition: all 0.3s ease;
					width: 75%;

					@media (width <= 600px) {
						box-shadow: 0 8px 25px rgb(0 0 0 / 15%);
					}

					&:hover {
						box-shadow: 0 8px 25px rgb(0 0 0 / 15%);
						transform: translateY(-2px);
					}
				}
			}

			.incomplete-game-section {
				background: linear-gradient(
					135deg,
					var(--tertiary-color) 0%,
					color-mix(in srgb, var(--tertiary-color) 25%, #000) 100%
				);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				color: white;
				margin-top: 1rem;
				padding: 1rem;

				.heading {
					font-size: 1.5rem;
					padding-bottom: 0.5rem;
				}

				p,
				h4 {
					line-height: 1.5;
				}

				p {
					margin-bottom: 0.5rem;
				}

				.play-button {
					border-radius: var(--global-border-radius);
					font-size: 1.1rem;
					justify-content: center;
					margin-top: 1rem;
					padding: 1rem 2rem;
					text-align: center;
					text-transform: uppercase;
					transition: all 0.3s ease;
					width: 75%;

					@media (width <= 600px) {
						box-shadow: 0 8px 25px rgb(0 0 0 / 15%);
					}

					&:hover {
						box-shadow: 0 8px 25px rgb(0 0 0 / 15%);
						transform: translateY(-2px);
					}
				}
			}

			.already-played-section {
				background: var(--color-gradient);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				color: white;
				margin-top: 1rem;
				padding: 1rem;

				.heading {
					font-size: 1.5rem;
					padding-bottom: 0.5rem;
				}

				.countdown {
					font-weight: 900;
				}

				.game-ctas {
					display: flex;
					flex-direction: row;
					gap: 1rem;
					justify-content: space-between;

					.view-result-btn,
					.yesterday-link {
						align-items: center;
						border: 1px solid var(--border);
						color: #e3e3e3;
						display: inline-flex;
						flex: 1;
						font-size: 0.8rem;
						gap: 0.35rem;
						justify-content: center;
						margin-top: 0.75rem;
						padding: 0.25rem;
						text-align: center;
						text-decoration: none;
						transition: color 0.2s;

						&:hover {
							border-bottom: 1px solid white;
							color: #fff;
						}
					}
				}

				p,
				h4 {
					line-height: 1.5;
				}

				p {
					margin-bottom: 0.5rem;
				}

				.challenge-section {
					.challenge-divider {
						margin: 0.5rem 0;
						position: relative;
						text-align: center;

						&::before {
							background: white;
							content: '';
							height: 1px;
							left: 0;
							position: absolute;
							top: 50%;
							width: calc(50% - 1rem);
						}

						&::after {
							background: white;
							content: '';
							height: 1px;
							position: absolute;
							right: 0;
							top: 50%;
							width: calc(50% - 1rem);
						}

						p {
							padding: 0 1rem;
							position: relative;
							text-transform: uppercase;
							z-index: 1;
						}
					}

					.usp-tiles {
						display: grid;
						gap: 0.5rem;
						grid-template-columns: repeat(2, 1fr);
						margin: 1rem 0;

						@media (width <= 600px) {
							grid-template-columns: repeat(1, 1fr);
						}

						.tile {
							background: rgb(255 255 255 / 10%);
							border: 1px solid rgb(255 255 255 / 20%);
							border-radius: var(--global-border-radius);
							color: white;
							padding: 1rem;
							text-align: center;

							@media (width > 600px) {
								backdrop-filter: blur(10px);
							}

							@media (width <= 600px) {
								align-items: center;
								display: flex;
								flex-direction: row;
								gap: 0.5rem;
								padding: 0.5rem;
								text-align: left;
							}

							h6 {
								font-size: 0.8rem;
							}
						}
					}
				}
			}
		}

		.wc-event-banner {
			background: linear-gradient(135deg, #0a1628 0%, #0d2137 55%, #0a2a1a 100%);
			border: 1px solid rgb(255 255 255 / 12%);
			border-radius: var(--global-border-radius);
			color: #fff;
			display: flex;
			justify-content: space-between;
			margin-top: 1rem;
			overflow: hidden;
			padding: 1.25rem;
			position: relative;
			text-decoration: none;
			transition: all 0.3s ease;

			&::before {
				background: radial-gradient(ellipse at 80% 50%, rgb(16 185 129 / 12%) 0%, transparent 65%);
				content: '';
				inset: 0;
				pointer-events: none;
				position: absolute;
			}

			&:hover {
				border-color: rgb(255 255 255 / 25%);
				box-shadow: 0 8px 32px rgb(0 0 0 / 35%);
				transform: translateY(-2px);
			}

			.wc-banner-content {
				display: flex;
				flex-direction: column;
				gap: 0.4rem;
				position: relative;
				z-index: 1;

				.wc-banner-top {
					align-items: center;
					display: flex;
					gap: 0.6rem;

					.wc-live-badge {
						align-items: center;
						background: rgb(255 255 255 / 15%);
						border: 1px solid rgb(255 255 255 / 25%);
						border-radius: 2rem;
						display: inline-flex;
						font-size: 0.65rem;
						font-weight: 700;
						gap: 0.3rem;
						letter-spacing: 0.04em;
						padding: 0.2rem 0.55rem;
						text-transform: uppercase;

						.wc-live-dot {
							animation: wc-pulse 1.8s ease-in-out infinite;
							background: #4ade80;
							border-radius: 50%;
							display: inline-block;
							height: 6px;
							width: 6px;
						}
					}

					.wc-player-count {
						color: rgb(255 255 255 / 55%);
						font-size: 0.7rem;
					}
				}

				.wc-banner-title {
					color: #fff;
					font-size: 1.35rem;
					font-weight: 800;
					letter-spacing: -0.01em;
					line-height: 1.1;
					margin: 0;
					text-align: left;
				}

				.wc-banner-sub {
					color: rgb(255 255 255 / 65%);
					font-size: 0.78rem;
					line-height: 1.4;
					margin: 0;
					text-align: left;
				}

				.wc-banner-cta {
					align-items: center;
					background: rgb(255 255 255 / 12%);
					border: 1px solid rgb(255 255 255 / 25%);
					border-radius: 2rem;
					display: inline-flex;
					font-size: 0.8rem;
					font-weight: 700;
					gap: 0.3rem;
					margin-top: 0.2rem;
					padding: 0.35rem 0.9rem;
					transition: background 0.2s;
					width: fit-content;
				}

				.wc-event-banner:hover & .wc-banner-cta {
					background: rgb(255 255 255 / 20%);
				}
			}

			.wc-banner-graphic {
				align-items: flex-end;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				padding-left: 0.5rem;
				position: relative;
				z-index: 1;

				.wc-ball {
					color: rgb(255 255 255 / 15%);
					font-size: 4.5rem;
					line-height: 1;
				}

				.wc-trophy {
					color: #f59e0b;
					font-size: 1.75rem;
					line-height: 1;
					opacity: 0.9;
				}
			}
		}

		@keyframes wc-pulse {
			0%,
			100% {
				opacity: 1;
				transform: scale(1);
			}

			50% {
				opacity: 0.5;
				transform: scale(0.8);
			}
		}
	}
</style>
