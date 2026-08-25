<template>
	<div class="mode-intro-screen">
		<div
			class="arc-watermark"
			aria-hidden="true"
		></div>

		<div class="intro-content">
			<div class="eyebrow-row">
				<span class="eyebrow">{{ eyebrowLabel }}</span>
				<span class="match-no">{{ kickoffLabel }}</span>
			</div>

			<div class="intro-header">
				<h1 class="heading">{{ modeName }}</h1>
			</div>

			<p class="subheading">{{ modeTagline }}</p>

			<hr class="arc-rule" />

			<div
				v-if="stats.currentStreak > 1"
				class="streak-bar"
			>
				<Icon
					name="solar:fire-bold"
					size="1rem"
				/>
				<span><span class="streak-num">{{ stats.currentStreak }}</span> day streak</span>
			</div>

			<div
				v-if="canPlay"
				class="play-section"
			>
				<div class="usp-tiles">
					<div
						v-for="tile in uspTiles"
						:key="tile.text"
						class="tile"
					>
						<Icon
							:name="tile.icon"
							size="1.5rem"
						/>
						<h6>{{ tile.text }}</h6>
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
				<h3 class="heading">{{ modeName }} played!</h3>
				<p class="caption">Looks like you have played today, come back tomorrow to play it again</p>

				<div class="countdown">
					<h4>{{ countdown }}</h4>
				</div>

				<div class="game-ctas">
					<button
						class="view-result-btn"
						title="View today's result"
						@click="$emit('show-result')"
					>
						<Icon
							name="solar:share-linear"
							size="1rem"
						/>
						Todays result
					</button>

					<NuxtLink
						v-if="prevAnswerLink"
						:to="prevAnswerLink"
						class="yesterday-link"
						title="View yesterday's answer"
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
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import { getPuzzleNumber } from '../composables/useFootballers'

	const props = withDefaults(
		defineProps<{
			modeName: string
			modeTagline: string
			uspTiles: { icon: string; text: string }[]
			canPlay?: boolean
			countdown?: string
			challengeUnlocked?: boolean
			hasIncompleteGame?: boolean
			prevAnswerLink?: string
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
			prevAnswerLink: '',
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

	// Decorative "match" header — mirrors the daily puzzle numbering used
	// elsewhere in the app (see stores/game.ts) without requiring a new prop.
	const todayUK = new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/London' })
	const puzzleNumber = getPuzzleNumber(todayUK)

	const eyebrowLabel = computed(() => `${props.modeName} Match`)
	const kickoffLabel = computed(() => `No. ${puzzleNumber} · Kick-off 00:00 GMT`)

	defineEmits(['start-game', 'start-challenge', 'show-result'])
</script>

<style scoped lang="scss">
	.mode-intro-screen {
		align-items: stretch;
		display: flex;
		justify-content: center;
		min-height: 100%;
		position: relative;
		width: 100%;

		// "Pitch marking" watermark — a center-circle + halfway line echoing
		// the board's own grid, set very low-opacity behind the content.
		.arc-watermark {
			border: 2px solid var(--primary-color);
			border-radius: 50%;
			height: 420px;
			opacity: 0.06;
			pointer-events: none;
			position: absolute;
			right: -140px;
			top: -60px;
			width: 420px;
			z-index: 0;

			&::after {
				border-left: 2px solid var(--primary-color);
				bottom: 0;
				content: '';
				left: 50%;
				position: absolute;
				top: 0;
			}
		}

		.intro-content {
			border-radius: var(--global-border-radius);
			display: flex;
			flex-direction: column;
			max-width: 500px;
			padding-bottom: 1rem;
			place-content: center flex-start;
			position: relative;
			text-align: left;
			width: 100%;
			z-index: 1;

			.eyebrow-row {
				align-items: baseline;
				display: flex;
				justify-content: space-between;
				margin-bottom: 0.4rem;

				.eyebrow {
					background: color-mix(in srgb, var(--primary-color) 14%, transparent);
					border-radius: 999px;
					color: var(--primary-color);
					font-family: var(--font-mono);
					font-size: 0.68rem;
					font-weight: 600;
					letter-spacing: 0.14em;
					padding: 0.25rem 0.6rem;
					text-transform: uppercase;
				}

				.match-no {
					color: var(--text-secondary);
					font-family: var(--font-mono);
					font-size: 0.7rem;
					letter-spacing: 0.02em;
				}
			}

			.intro-header {
				.heading {
					color: var(--text-primary);
					font-family: var(--font-display);
					font-size: 1.7rem;
					font-weight: 700;
					letter-spacing: 0.01em;
					margin: 0.1rem 0 0.25rem;
				}
			}

			.subheading {
				color: var(--text-secondary);
				margin: 0 0 1.1rem;
				text-align: left;
			}

			.arc-rule {
				border: none;
				border-radius: 0 0 999px 999px;
				border-top: 3px solid var(--primary-color);
				height: 0;
				margin: 0 0 1.25rem;
				opacity: 0.5;
				width: 56px;
			}

			.streak-bar {
				align-items: center;
				background: color-mix(in srgb, var(--tertiary-color) 14%, transparent);
				border: 1px solid color-mix(in srgb, var(--tertiary-color) 30%, transparent);
				border-radius: 2rem;
				color: var(--tertiary-color);
				display: inline-flex;
				font-size: 0.8rem;
				font-weight: 600;
				gap: 0.4rem;
				margin-bottom: 0.5rem;
				padding: 0.3rem 0.85rem;
				width: max-content;

				.streak-num {
					font-family: var(--font-mono);
					font-weight: 700;
				}
			}

			.play-section {
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
				color: var(--text-primary);
				margin-top: 1rem;
				padding: 1.25rem;
				text-align: center;

				.heading {
					color: var(--text-secondary);
					font-family: var(--font-display);
					font-size: 0.85rem;
					font-weight: 700;
					letter-spacing: 0.06em;
					margin-bottom: 0.75rem;
					text-transform: uppercase;
				}

				.caption {
					color: var(--text-secondary);
					line-height: 1.5;
					margin-bottom: 1.5rem;
				}

				.usp-tiles {
					display: grid;
					gap: 0.75rem;
					grid-template-columns: repeat(2, 1fr);
					margin: 0 0 1rem;

					@media (width <= 600px) {
						grid-template-columns: repeat(1, 1fr);
					}

					.tile {
						background: var(--bg-primary);
						border: 1px solid var(--border);
						border-radius: calc(var(--global-border-radius) - 2px);
						color: var(--text-primary);
						padding: 1rem;
						text-align: center;

						.iconify {
							color: var(--primary-color);
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
							margin: 0.35rem 0 0;
						}
					}
				}

				.play-button {
					background: var(--primary-color);
					border: 1px solid var(--primary-color);
					border-radius: var(--global-border-radius);
					color: #fff;
					font-size: 1.05rem;
					font-weight: 700;
					justify-content: center;
					margin-top: 0.25rem;
					padding: 0.95rem 2rem;
					text-align: center;
					transition: all 0.2s ease;
					width: 75%;

					&:hover {
						background: color-mix(in srgb, var(--primary-color) 88%, black);
						box-shadow: 0 8px 20px color-mix(in srgb, var(--primary-color) 25%, transparent);
						transform: translateY(-2px);
					}
				}
			}

			.incomplete-game-section {
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
				color: var(--text-primary);
				margin-top: 1rem;
				padding: 1.25rem;
				text-align: center;

				.heading {
					color: var(--text-primary);
					font-family: var(--font-display);
					font-size: 1.3rem;
					font-weight: 700;
					padding-bottom: 0.5rem;
				}

				p,
				h4 {
					color: var(--text-secondary);
					line-height: 1.5;
				}

				p {
					margin-bottom: 0.5rem;
				}

				.play-button {
					background: var(--primary-color);
					border: 1px solid var(--primary-color);
					border-radius: var(--global-border-radius);
					color: #fff;
					font-size: 1.05rem;
					font-weight: 700;
					justify-content: center;
					margin-top: 1rem;
					padding: 0.95rem 2rem;
					text-align: center;
					transition: all 0.2s ease;
					width: 75%;

					&:hover {
						background: color-mix(in srgb, var(--primary-color) 88%, black);
						box-shadow: 0 8px 20px color-mix(in srgb, var(--primary-color) 25%, transparent);
						transform: translateY(-2px);
					}
				}
			}

			.already-played-section {
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
				color: var(--text-primary);
				margin-top: 1rem;
				padding: 1.25rem;
				text-align: center;

				.heading {
					color: var(--text-primary);
					font-family: var(--font-display);
					font-size: 1.3rem;
					font-weight: 700;
					padding-bottom: 0.5rem;
				}

				.countdown {
					color: var(--primary-color);
					font-family: var(--font-mono);
					font-weight: 700;
				}

				.game-ctas {
					display: flex;
					flex-direction: row;
					gap: 1rem;
					justify-content: space-between;

					.view-result-btn,
					.yesterday-link {
						align-items: center;
						background: none;
						border: 1px solid var(--border);
						border-radius: calc(var(--global-border-radius) - 4px);
						color: var(--text-secondary);
						cursor: pointer;
						display: inline-flex;
						flex: 1;
						font-family: var(--font-body);
						font-size: 0.8rem;
						gap: 0.35rem;
						justify-content: center;
						margin-top: 0.75rem;
						padding: 0.5rem;
						text-align: center;
						text-decoration: none;
						transition: all 0.2s ease;

						&:hover {
							border-color: var(--border-hover);
							color: var(--primary-color);
						}
					}
				}

				p,
				h4 {
					color: var(--text-secondary);
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

						&::before,
						&::after {
							background: var(--border);
							content: '';
							height: 1px;
							position: absolute;
							top: 50%;
						}

						&::before {
							left: 0;
							width: calc(50% - 1rem);
						}

						&::after {
							right: 0;
							width: calc(50% - 1rem);
						}

						p {
							color: var(--text-secondary);
							font-family: var(--font-display);
							font-size: 0.75rem;
							letter-spacing: 0.1em;
							padding: 0 1rem;
							position: relative;
							text-transform: uppercase;
							z-index: 1;
						}
					}

					h3 {
						color: var(--text-primary);
						font-family: var(--font-display);
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
							background: var(--bg-primary);
							border: 1px solid var(--border);
							border-radius: calc(var(--global-border-radius) - 2px);
							color: var(--text-primary);
							padding: 1rem;
							text-align: center;

							.iconify {
								color: var(--primary-color);
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
								margin: 0.35rem 0 0;
							}
						}
					}

					.play-button {
						background: var(--primary-color);
						border: 1px solid var(--primary-color);
						border-radius: var(--global-border-radius);
						color: #fff;

						&:hover {
							background: color-mix(in srgb, var(--primary-color) 88%, black);
						}
					}
				}
			}
		}
	}
</style>
