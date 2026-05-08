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
		</div>
	</div>
</template>

<script setup lang="ts">
	import { withDefaults, ref, onMounted, nextTick, watch } from 'vue'

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
	])

	const isLoading = ref(false) // Start with no loading
</script>

<style scoped lang="scss">
	.intro-screen {
		align-items: stretch;
		display: flex;
		height: 100%;
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
					gap: 0.5rem;

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
				}
			}
		}
	}
</style>
