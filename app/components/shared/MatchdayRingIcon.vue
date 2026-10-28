<template>
	<svg
		viewBox="0 0 24 24"
		:width="size"
		:height="size"
		class="matchday-ring-icon"
		aria-hidden="true"
		focusable="false"
	>
		<g
			v-for="ring in RINGS"
			:key="ring.r"
			fill="none"
			stroke="currentColor"
			stroke-width="2.4"
		>
			<circle
				cx="12"
				cy="12"
				:r="ring.r"
				stroke-opacity="0.3"
			/>
			<circle
				cx="12"
				cy="12"
				:r="ring.r"
				pathLength="100"
				:stroke-dasharray="`${ring.fill} 100`"
				stroke-linecap="round"
				transform="rotate(-90 12 12)"
			/>
		</g>
	</svg>
</template>

<script setup lang="ts">
	// The Matchday streak's icon: three rings like the activity rings on Matchday, so the
	// flame only ever means a mode's own win streak. currentColor, so every theme colours it
	withDefaults(defineProps<{ size?: string }>(), { size: '1em' })
	const RINGS = [
		{ r: 10, fill: 80 },
		{ r: 6.5, fill: 65 },
		{ r: 3, fill: 90 },
	]
</script>

<style scoped lang="scss">
	.matchday-ring-icon {
		flex-shrink: 0;
		vertical-align: middle;
	}
</style>
