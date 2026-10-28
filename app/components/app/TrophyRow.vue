<template>
	<li :class="['trophy', { earned: item.earned }]">
		<div class="badge">
			<img
				v-if="!item.secret"
				:src="`/achievements/${item.id}.jpg`"
				alt=""
				width="56"
				height="56"
				loading="lazy"
			/>
			<span
				v-if="!item.earned"
				class="lock"
			>
				<Icon
					name="solar:lock-keyhole-minimalistic-bold"
					size="0.8rem"
				/>
			</span>
		</div>
		<div class="trophy-text">
			<p class="trophy-title">{{ item.secret ? 'Hidden trophy' : item.title }}</p>
			<p class="trophy-goal">
				{{ item.secret ? 'Keep playing to find out.' : item.earned ? item.earnedText : item.goal }}
			</p>
			<div
				v-if="!item.earned && item.percent > 0"
				class="bar small"
				role="progressbar"
				:aria-valuenow="item.percent"
				aria-valuemin="0"
				aria-valuemax="100"
				:aria-label="`${item.title} progress`"
			>
				<span :style="{ width: `${item.percent}%` }"></span>
			</div>
		</div>
		<span class="points">{{ item.points }}<small> pts</small></span>
	</li>
</template>

<script setup lang="ts">
	import type { TrophyItem } from '../../utils/achievements'

	// One row on the Trophies screen: badge, title, goal or earned line, progress, points
	defineProps<{ item: TrophyItem }>()
</script>

<style scoped lang="scss">
	.trophy {
		align-items: center;
		display: flex;
		gap: 0.85rem;
		padding: 0.65rem 1rem;

		& + .trophy {
			border-top: 1px solid var(--border);
		}

		.badge {
			align-items: center;
			background: color-mix(in srgb, var(--text-primary) 6%, transparent);
			border-radius: 50%;
			display: flex;
			flex-shrink: 0;
			height: 3.5rem;
			justify-content: center;
			position: relative;
			width: 3.5rem;

			img {
				border-radius: 50%;
				// Locked: the real badge, faded, so each one is recognisable
				filter: grayscale(0.85);
				height: 100%;
				opacity: 0.4;
				width: 100%;
			}

			.lock {
				align-items: center;
				background: var(--bg-primary);
				border: 1px solid var(--border);
				border-radius: 50%;
				bottom: -0.2rem;
				color: var(--text-primary);
				display: flex;
				height: 1.45rem;
				justify-content: center;
				position: absolute;
				right: -0.2rem;
				width: 1.45rem;
			}
		}

		&.earned .badge img {
			filter: none;
			opacity: 1;
		}

		.trophy-text {
			flex: 1;
			min-width: 0;
		}

		.trophy-title {
			font-weight: 800;
			margin: 0;
		}

		.trophy-goal {
			color: var(--text-secondary);
			font-size: 0.85rem;
			line-height: 1.3;
			margin: 0.1rem 0 0;
		}

		.points {
			color: var(--text-secondary);
			font-size: 0.85rem;
			font-variant-numeric: tabular-nums;
			font-weight: 700;
			white-space: nowrap;

			small {
				font-size: 0.72rem;
				font-weight: 600;
			}
		}

		&.earned .points {
			color: var(--tertiary-color);
		}
	}

	.bar.small {
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
		border-radius: 999px;
		height: 0.3rem;
		margin-top: 0.4rem;
		overflow: hidden;

		span {
			background: var(--pitchcard-accent-win);
			border-radius: inherit;
			display: block;
			height: 100%;
		}
	}
</style>
