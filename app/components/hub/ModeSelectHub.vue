<template>
	<div class="mode-select-hub">
		<div class="hub-header">
			<div class="hub-header-top">
				<h1 class="heading">Footballdle</h1>

				<div class="icons">
					<a
						href="https://buymeacoffee.com/dhorne92E"
						target="_blank"
						rel="noopener noreferrer"
						class="coffee-link"
						@click.prevent="$emit('buy-coffee', 'hub_header')"
						aria-label="Buy me a coffee"
					>
						<Icon
							name="uil:coffee"
							size="1.5rem"
						/>
					</a>

					<NuxtLink
						to="/how-to-play"
						aria-label="How to play"
					>
						<Icon
							name="uil:info-circle"
							size="1.5rem"
						/>
					</NuxtLink>

					<Icon
						name="uil:setting"
						size="1.5rem"
						@click="$emit('show-settings')"
					/>
				</div>
			</div>

			<p class="hub-tagline">Pick a mode. Every mode keeps its own streak.</p>
		</div>

		<div class="mode-grid">
			<NuxtLink
				to="/play/daily"
				class="mode-card"
			>
				<div class="mode-card-top">
					<Icon
						name="solar:calendar-linear"
						size="1.5rem"
					/>
					<ModeStreakBadge :streak="dailyStreak" />
				</div>
				<h3>Daily</h3>
				<p class="caption">Guess the hidden 6-letter Premier League surname. One puzzle a day.</p>
				<span class="mode-cta">
					Play now
					<Icon
						name="solar:alt-arrow-right-linear"
						size="0.9rem"
					/>
				</span>
			</NuxtLink>

			<div class="mode-card disabled">
				<div class="mode-card-top">
					<Icon
						name="solar:magnifer-linear"
						size="1.5rem"
					/>
					<span class="soon-badge">Coming soon</span>
				</div>
				<h3>Scout Report</h3>
				<p class="caption">Guess any surname. Get attribute clues on club, nationality and position.</p>
			</div>

			<div class="mode-card disabled">
				<div class="mode-card-top">
					<Icon
						name="solar:alarm-outline"
						size="1.5rem"
					/>
					<span class="soon-badge">Coming soon</span>
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
		}>(),
		{
			dailyStreak: 0,
		},
	)

	defineEmits(['show-settings', 'buy-coffee'])
</script>

<style scoped lang="scss">
	.mode-select-hub {
		max-width: 500px;
		width: 100%;

		.hub-header {
			background:
				radial-gradient(circle at 30% -20%, rgb(255 255 255 / 14%), transparent 55%),
				repeating-linear-gradient(135deg, rgb(255 255 255 / 3%) 0 10px, transparent 10px 20px),
				var(--color-gradient);
			border-radius: var(--global-border-radius);
			padding: 1.5rem;

			.hub-header-top {
				align-items: center;
				display: flex;
				justify-content: space-between;
			}

			.heading {
				color: #fff;
				font-weight: 800;
				letter-spacing: -0.01em;
				margin: 0;
			}

			.icons {
				align-items: center;
				display: flex;
				gap: 0.75rem;

				a,
				.iconify {
					align-items: center;
					color: #fff;
					cursor: pointer;
					display: flex;
					transition: all 0.2s;

					&:hover {
						transform: scale(1.1);
					}
				}
			}

			.hub-tagline {
				color: rgb(255 255 255 / 85%);
				margin: 0.75rem 0 0;
				text-align: left;
			}
		}

		.mode-grid {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
			margin-top: 1rem;
		}

		.mode-card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--global-border-radius);
			color: var(--text-primary);
			display: block;
			padding: 1rem;
			text-align: left;
			text-decoration: none;
			transition: all 0.2s;

			&:hover:not(.disabled) {
				border-color: var(--primary-color);
				box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
				transform: translateY(-2px);
			}

			&.disabled {
				cursor: default;
				opacity: 0.55;
			}

			.mode-card-top {
				align-items: center;
				display: flex;
				justify-content: space-between;
				margin-bottom: 0.5rem;
			}

			h3 {
				margin: 0 0 0.25rem;
			}

			.caption {
				color: var(--text-secondary);
				font-size: 0.85rem;
				margin: 0 0 0.5rem;
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
				background: var(--bg-primary);
				border-radius: 2rem;
				color: var(--text-secondary);
				font-size: 0.65rem;
				font-weight: 700;
				letter-spacing: 0.04em;
				padding: 0.2rem 0.55rem;
				text-transform: uppercase;
			}
		}
	}
</style>
