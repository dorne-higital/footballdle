<template>
	<svg
		class="activity-rings"
		:width="size"
		:height="size"
		:viewBox="`0 0 ${size} ${size}`"
		role="img"
		:aria-label="label"
	>
		<g
			v-for="ring in drawn"
			:key="ring.r"
		>
			<circle
				:cx="center"
				:cy="center"
				:r="ring.r"
				fill="none"
				:stroke="ring.color"
				stroke-opacity="0.18"
				:stroke-width="stroke"
			/>
			<circle
				v-if="ring.progress > 0"
				class="ring-arc"
				:cx="center"
				:cy="center"
				:r="ring.r"
				fill="none"
				:stroke="ring.color"
				:stroke-width="stroke"
				stroke-linecap="round"
				:stroke-dasharray="`${ring.length} ${ring.circumference}`"
				:transform="`rotate(-90 ${center} ${center})`"
			/>
		</g>
	</svg>
</template>

<script setup lang="ts">
	import { computed } from 'vue'

	// Apple Fitness-style concentric progress rings, outermost first
	const props = withDefaults(
		defineProps<{
			rings: { progress: number; color: string }[]
			size?: number
			stroke?: number
			gap?: number
			label?: string
		}>(),
		{ size: 120, stroke: 12, gap: 3, label: 'Progress rings' },
	)

	const center = computed(() => props.size / 2)

	const drawn = computed(() =>
		props.rings.map((ring, i) => {
			const r = center.value - props.stroke / 2 - i * (props.stroke + props.gap)
			const circumference = 2 * Math.PI * r
			const progress = Math.min(Math.max(ring.progress, 0), 1)
			return { ...ring, r, circumference, progress, length: circumference * progress }
		}),
	)
</script>

<style scoped lang="scss">
	.activity-rings {
		flex-shrink: 0;
	}

	.ring-arc {
		transition: stroke-dasharray 0.8s cubic-bezier(0.22, 1, 0.36, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		.ring-arc {
			transition: none;
		}
	}
</style>
