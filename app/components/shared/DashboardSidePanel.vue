<template>
	<aside class="dashboard-side-panel">
		<div class="side-card">
			<h4>Modes</h4>

			<NuxtLink
				to="/play/daily"
				class="side-nav-item"
				:class="{ active: activeMode === 'daily' }"
			>
				<span class="mode-name">
					<span class="mode-dot" />
					<span class="mode-text">
						<span class="title">Daily</span>
						<span class="subtitle">New puzzle every day</span>
					</span>
				</span>
				<span class="mode-tags">
					<ModeStreakBadge :streak="dailyStreak" />
					<span class="play-tag">Playing</span>
				</span>
			</NuxtLink>

			<NuxtLink
				to="/play/scout-report"
				class="side-nav-item"
				:class="{ active: activeMode === 'scout' }"
			>
				<span class="mode-name">
					<span class="mode-dot" />
					<span class="mode-text">
						<span class="title">Scout Report</span>
						<span class="subtitle">Guess from attribute clues</span>
					</span>
				</span>
				<span class="mode-tags">
					<ModeStreakBadge :streak="scoutStreak" />
					<span class="play-tag">Playing</span>
				</span>
			</NuxtLink>

			<div class="side-nav-item disabled">
				<span class="mode-name">
					<span class="mode-dot" />
					<span class="mode-text">
						<span class="title">Spot the Baller</span>
						<span class="subtitle">ID the player, zoomed in</span>
					</span>
				</span>
				<span class="soon">Soon</span>
			</div>
		</div>

		<div class="side-card">
			<h4>Your Form</h4>

			<div class="side-form-hero">
				<span class="streak-ring">
					<Icon
						name="solar:fire-bold"
						size="1.5rem"
					/>
				</span>
				<span class="streak-info">
					<span class="num">{{ streak }}</span>
					<span class="cap">day streak</span>
				</span>
			</div>

			<div class="stat-row">
				<span class="label">Win rate</span>
				<span class="value">{{ winPercentage }}%</span>
			</div>
			<div class="side-winrate">
				<div :style="{ width: `${winPercentage}%` }" />
			</div>

			<template v-if="recentForm && recentForm.length">
				<div class="stat-row">
					<span class="label">Last 5</span>
				</div>
				<div class="side-form-squares">
					<span
						v-for="(win, i) in recentForm"
						:key="i"
						:class="win ? 'win' : 'loss'"
					/>
				</div>
			</template>
		</div>

		<AdUnit v-if="showAd" />

		<a
			href="https://buymeacoffee.com/dhorne92E"
			target="_blank"
			rel="noopener noreferrer"
			class="side-coffee"
			@click.prevent="$emit('buy-coffee', 'sidebar')"
		>
			<Icon
				name="uil:coffee"
				size="1rem"
			/>
			Buy me a <span class="accent">coffee</span>
		</a>
	</aside>
</template>

<script setup lang="ts">
	import ModeStreakBadge from './ModeStreakBadge.vue'
	import AdUnit from '../AdUnit.vue'

	withDefaults(
		defineProps<{
			activeMode?: 'daily' | 'scout' | 'spotball'
			dailyStreak?: number
			scoutStreak?: number
			streak?: number
			winPercentage?: number
			recentForm?: boolean[]
			showAd?: boolean
		}>(),
		{
			activeMode: 'daily',
			dailyStreak: 0,
			scoutStreak: 0,
			streak: 0,
			winPercentage: 0,
			showAd: true,
		},
	)

	defineEmits(['buy-coffee'])
</script>

<style scoped lang="scss">
	.dashboard-side-panel {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		gap: 1rem;
		max-height: 100%;
		overflow-y: auto;
		width: 280px;

		.side-card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 16px;
			box-shadow: 0 1px 2px color-mix(in srgb, var(--text-primary) 8%, transparent);
			padding: 1.1rem 1.1rem 1rem;

			h4 {
				color: var(--text-secondary);
				font-family: var(--font-display);
				font-size: 0.78rem;
				font-weight: 700;
				letter-spacing: 0.14em;
				margin: 0 0 0.75rem;
				text-transform: uppercase;
			}
		}

		.side-nav-item {
			align-items: center;
			border-radius: calc(var(--global-border-radius) - 2px);
			color: var(--text-primary);
			display: flex;
			justify-content: space-between;
			margin-bottom: 0.4rem;
			padding: 0.68rem 0.75rem;
			text-decoration: none;
			transition: background 0.15s;

			&:last-child {
				margin-bottom: 0;
			}

			&:hover:not(.disabled):not(.active) {
				background: var(--bg-primary);
			}

			&.active {
				background: var(--primary-color);
				color: #fff;

				.subtitle {
					color: rgb(255 255 255 / 78%);
				}

				&:hover {
					background: color-mix(in srgb, var(--primary-color) 85%, black);
				}
			}

			&.disabled {
				color: var(--text-secondary);
				cursor: default;
			}
		}

		.mode-name {
			align-items: center;
			display: flex;
			gap: 0.65rem;
			min-width: 0;
		}

		.mode-dot {
			background: currentColor;
			border-radius: 50%;
			flex: none;
			height: 7px;
			opacity: 0.8;
			width: 7px;
		}

		.mode-text {
			display: flex;
			flex-direction: column;
			min-width: 0;

			.title {
				font-size: 0.9rem;
				font-weight: 700;
				line-height: 1.2;
			}

			.subtitle {
				color: var(--text-secondary);
				font-size: 0.72rem;
				margin-top: 1px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.mode-tags {
			align-items: center;
			display: flex;
			flex: none;
			gap: 0.4rem;
		}

		.soon,
		.play-tag {
			border-radius: 999px;
			flex: none;
			font-family: var(--font-mono);
			font-size: 0.62rem;
			font-weight: 700;
			letter-spacing: 0.06em;
			padding: 0.2rem 0.5rem;
			text-transform: uppercase;
		}

		.soon {
			background: color-mix(in srgb, var(--tertiary-color) 18%, var(--bg-secondary));
			color: var(--tertiary-color);
		}

		.play-tag {
			background: rgb(255 255 255 / 22%);
			color: #fff;
		}

		.side-form-hero {
			align-items: center;
			display: flex;
			gap: 0.85rem;
			margin-bottom: 1rem;
		}

		.streak-ring {
			align-items: center;
			border: 2px dashed color-mix(in srgb, var(--tertiary-color) 35%, transparent);
			border-radius: 50%;
			color: var(--tertiary-color);
			display: flex;
			flex: none;
			height: 4rem;
			justify-content: center;
			width: 4rem;
		}

		.streak-info {
			display: flex;
			flex-direction: column;

			.num {
				color: var(--text-primary);
				font-family: var(--font-mono);
				font-size: 2.1rem;
				font-weight: 700;
				line-height: 1;
			}

			.cap {
				color: var(--text-secondary);
				font-size: 0.72rem;
				letter-spacing: 0.02em;
				margin-top: 0.2rem;
			}
		}

		.stat-row {
			align-items: baseline;
			display: flex;
			justify-content: space-between;
			margin-bottom: 0.4rem;

			.label {
				color: var(--text-secondary);
				font-size: 0.78rem;
			}

			.value {
				color: var(--text-primary);
				font-family: var(--font-mono);
				font-size: 0.85rem;
				font-weight: 700;
			}
		}

		.side-winrate {
			background: var(--turf-base);
			border-radius: 999px;
			height: 8px;
			margin-bottom: 1rem;
			overflow: hidden;

			div {
				background: var(--primary-color);
				border-radius: 999px;
				height: 100%;
				transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
			}
		}

		.side-form-squares {
			display: flex;
			gap: 0.4rem;

			span {
				border-radius: 7px;
				height: 1.15rem;
				width: 1.15rem;

				&.win {
					background: var(--primary-color);
				}

				&.loss {
					background: var(--color-absent);
				}
			}
		}

		.side-coffee {
			align-items: center;
			background: var(--secondary-color);
			border-radius: var(--global-border-radius);
			color: var(--bg-secondary);
			display: flex;
			font-size: 0.85rem;
			font-weight: 700;
			gap: 0.5rem;
			justify-content: center;
			padding: 0.75rem;
			text-decoration: none;
			transition: all 0.2s;

			.accent {
				color: var(--tertiary-color);
			}

			&:hover {
				box-shadow: 0 10px 24px -12px color-mix(in srgb, var(--secondary-color) 45%, transparent);
				transform: translateY(-2px);
			}
		}
	}
</style>
