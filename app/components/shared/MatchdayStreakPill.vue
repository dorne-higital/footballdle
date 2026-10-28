<template>
	<span
		:class="['streak-pill', { cold: !playStreak.playedToday }]"
		role="img"
		:aria-label="matchdayStreakSpoken(playStreak.activeStreak, playStreak.playedToday)"
	>
		<MatchdayRingIcon size="1.05rem" />
		<span class="num">{{ playStreak.activeStreak }}</span>
		<span class="unit">{{ dayWord(playStreak.activeStreak) }}</span>
	</span>
</template>

<script setup lang="ts">
	import MatchdayRingIcon from './MatchdayRingIcon.vue'
	import { usePlayStreakStore } from '../../stores/playStreak'
	import { dayWord, matchdayStreakSpoken } from '../../utils/streakLabels'

	// The Matchday streak in the header (Matchday) and on the website's desktop rail. Its own
	// ring icon, so it can't be mistaken for a mode's win streak (the flame)
	const playStreak = usePlayStreakStore()
</script>

<style scoped lang="scss">
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
		height: 2.5rem;
		padding: 0 0.8rem;
	}

	// "days" reads as a caption and keeps the pill narrow
	.unit {
		font-size: 0.72rem;
		font-weight: 700;
		margin-left: -0.15rem;
		opacity: 0.85;
	}

	// Not played yet today: the streak is at risk, so the ring dims
	.streak-pill.cold {
		filter: grayscale(0.6);
		opacity: 0.75;
	}
</style>
