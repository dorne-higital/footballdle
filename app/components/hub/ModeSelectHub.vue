<template>
	<div class="mode-select-hub">
		<div class="hub-intro">
			<span class="eyebrow">Mode Select</span>
			<h2 class="heading">Choose your mode</h2>
			<p class="hub-tagline">Pick a mode. Every mode keeps its own streak.</p>
		</div>

		<div class="mode-grid">
			<NuxtLink
				to="/play/daily"
				class="mode-card primary"
			>
				<div class="mode-card-top">
					<Icon
						name="solar:calendar-linear"
						size="1.6rem"
					/>
					<ModeStreakBadge :streak="dailyStreak" />
				</div>
				<h3>Daily</h3>
				<p class="caption">Guess the hidden 6-letter Premier League surname. One puzzle a day.</p>
				<span class="mode-cta">
					Play now
					<Icon
						name="solar:alt-arrow-right-linear"
						size="0.8rem"
					/>
				</span>
			</NuxtLink>

			<NuxtLink
				to="/play/scout-report"
				class="mode-card"
			>
				<div class="mode-card-top">
					<Icon
						name="solar:magnifer-linear"
						size="1.6rem"
					/>
					<ModeStreakBadge :streak="scoutStreak" />
				</div>
				<h3>Scout Report</h3>
				<p class="caption">Guess any Premier League player. Get attribute clues on club, nationality and position.</p>
				<span class="mode-cta">
					Play now
					<Icon
						name="solar:alt-arrow-right-linear"
						size="0.8rem"
					/>
				</span>
			</NuxtLink>

			<div class="mode-card disabled">
				<div class="mode-card-top">
					<Icon
						name="solar:alarm-outline"
						size="1.4rem"
					/>
					<span class="soon-badge">Soon</span>
				</div>
				<h3>Spot the Baller</h3>
				<p class="caption">10 rapid-fire rounds. Pick the right name before the clock runs out.</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import ModeStreakBadge from '../shared/ModeStreakBadge.vue'

	withDefaults(
		defineProps<{
			dailyStreak?: number
			scoutStreak?: number
		}>(),
		{
			dailyStreak: 0,
			scoutStreak: 0,
		},
	)
</script>

<style scoped lang="scss">
	.mode-select-hub {
		margin: 0 auto;
		max-width: 500px;
		position: relative;
		width: 100%;
		z-index: 0;

		@media (width >= 860px) {
			max-width: 960px;
		}

		.hub-intro {
			margin-bottom: 1.25rem;
			text-align: center;

			@media (width >= 860px) {
				margin-bottom: 2rem;
			}

			.eyebrow {
				background: color-mix(in srgb, var(--primary-color) 14%, transparent);
				border-radius: 999px;
				color: var(--primary-color);
				display: inline-block;
				font-family: var(--font-mono);
				font-size: 0.68rem;
				font-weight: 600;
				letter-spacing: 0.14em;
				margin-bottom: 0.6rem;
				padding: 0.25rem 0.7rem;
				text-transform: uppercase;
			}

			.heading {
				color: var(--text-primary);
				font-family: var(--font-display);
				font-size: 1.6rem;
				font-weight: 700;
				letter-spacing: 0.02em;
				margin: 0 0 0.4rem;

				@media (width >= 860px) {
					font-size: 2.1rem;
				}
			}

			.hub-tagline {
				color: var(--text-secondary);
				font-size: 0.9rem;
				margin: 0;
			}
		}

		.mode-grid {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
			position: relative;
			z-index: 1;

			@media (width >= 860px) {
				display: grid;
				gap: 1.25rem;
				grid-template-columns: repeat(3, 1fr);
			}
		}

		.mode-card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--global-border-radius);
			color: var(--text-primary);
			display: block;
			padding: 1rem 1.1rem;
			text-align: left;
			text-decoration: none;
			transition: all 0.2s;

			@media (width >= 860px) {
				display: flex;
				flex-direction: column;
				padding: 1.5rem;
			}

			&:hover:not(.disabled) {
				border-color: var(--border-hover);
				box-shadow: 0 10px 24px -18px color-mix(in srgb, var(--text-primary) 40%, transparent);
				transform: translateY(-2px);
			}

			&.disabled {
				cursor: default;
				opacity: 0.6;
			}

			&.primary {
				background: var(--primary-color);
				border-color: var(--primary-color);
				color: #fff;

				.caption {
					color: rgb(255 255 255 / 82%);
				}

				.mode-cta {
					background: rgb(255 255 255 / 20%);
					border-radius: 999px;
					color: #fff;
					font-family: var(--font-mono);
					font-size: 0.68rem;
					letter-spacing: 0.06em;
					padding: 0.25rem 0.6rem;
					text-transform: uppercase;
				}
			}

			.mode-card-top {
				align-items: center;
				display: flex;
				justify-content: space-between;
				margin-bottom: 0.5rem;
			}

			h3 {
				font-family: var(--font-display);
				font-size: 1.05rem;
				font-weight: 700;
				margin: 0 0 0.25rem;
			}

			.caption {
				color: var(--text-secondary);
				font-size: 0.85rem;
				margin: 0 0 0.5rem;

				@media (width >= 860px) {
					flex: 1;
				}
			}

			.mode-cta {
				align-items: center;
				color: var(--primary-color);
				display: inline-flex;
				font-size: 0.8rem;
				font-weight: 700;
				gap: 0.2rem;
			}

			.soon-badge {
				background: color-mix(in srgb, var(--tertiary-color) 14%, var(--bg-secondary));
				border-radius: 999px;
				color: var(--tertiary-color);
				font-family: var(--font-mono);
				font-size: 0.65rem;
				font-weight: 700;
				letter-spacing: 0.06em;
				padding: 0.2rem 0.55rem;
				text-transform: uppercase;
			}
		}
	}
</style>
