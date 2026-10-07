<template>
	<button
		type="button"
		:class="['hint-pill', { pulse }]"
		:aria-label="purchases.isPro ? 'Unlimited hints' : `${purchases.hintBank} hints. Get more`"
		@click="openShop"
	>
		<Icon
			name="solar:lightbulb-bold"
			size="1.05rem"
		/>
		{{ purchases.isPro ? '∞' : purchases.hintBank }}
		<Icon
			v-if="!purchases.isPro"
			name="solar:add-circle-bold"
			size="0.95rem"
			class="plus"
		/>
	</button>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { usePurchasesStore } from '../../stores/purchases'
	import { useHaptics } from '../../composables/useHaptics'

	// Hint bank shown on screen; tapping opens the Daily hint shop
	const purchases = usePurchasesStore()
	const haptics = useHaptics()
	const route = useRoute()
	const showHintShop = useState('hint-shop-open', () => false)

	// A quick pulse whenever hints arrive (a purchase, the welcome gift or a streak reward)
	const pulse = ref(false)
	watch(
		() => purchases.hintBank,
		(now, before) => {
			if (now <= before) return
			pulse.value = false
			requestAnimationFrame(() => (pulse.value = true))
			setTimeout(() => (pulse.value = false), 1600)
		},
	)

	async function openShop() {
		haptics.select()
		if (!route.path.startsWith('/play/daily')) await navigateTo('/play/daily')
		showHintShop.value = true
	}
</script>

<style scoped lang="scss">
	.hint-pill {
		align-items: center;
		background: color-mix(in srgb, var(--pitchcard-accent-win) 15%, transparent);
		border: 0;
		border-radius: 999px;
		color: var(--pitchcard-accent-win);
		cursor: pointer;
		display: inline-flex;
		font: inherit;
		font-size: 1rem;
		font-variant-numeric: tabular-nums;
		font-weight: 800;
		gap: 0.35rem;
		height: 2.5rem;
		padding: 0 0.8rem;

		&:active {
			transform: scale(0.94);
		}

		.plus {
			opacity: 0.7;
		}

		&.pulse {
			animation: pill-pulse 0.5s ease-out 3;
		}
	}

	@keyframes pill-pulse {
		50% {
			box-shadow: 0 0 0 6px color-mix(in srgb, var(--pitchcard-accent-win) 30%, transparent);
			transform: scale(1.08);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hint-pill.pulse {
			animation: none;
			box-shadow: 0 0 0 2px var(--pitchcard-accent-win);
		}
	}
</style>
