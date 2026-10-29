<template>
	<button
		v-if="pending"
		type="button"
		class="hint-use pending"
		:aria-label="`Revealing the ${nextClueName}. Undo`"
		@click="cancel"
	>
		Undo
		<span
			class="pending-bar"
			aria-hidden="true"
		></span>
	</button>
	<button
		v-else-if="purchases.isPro || purchases.hintBank > 0"
		type="button"
		class="hint-use"
		:disabled="purchases.busy"
		:aria-label="ariaLabel"
		@click="useHint"
	>
		<Icon
			name="solar:lightbulb-bolt-bold"
			size="1rem"
		/>
		Use
	</button>
</template>

<script setup lang="ts">
	import { computed, onBeforeUnmount, ref } from 'vue'
	import { usePurchasesStore } from '../../stores/purchases'
	import { useHaptics } from '../../composables/useHaptics'

	// iOS app: the top bar's "Use a hint" button for Scout Report, joined to the hint count.
	// A banked hint waits a few seconds with an Undo before it's spent; Pro hints are
	// unlimited, so those reveal straight away. With no hints left the pill's + opens the shop
	const props = defineProps<{ canPurchase: boolean; nextClueName: string }>()
	const emit = defineEmits<{ unlock: [] }>()

	const UNDO_MS = 3000
	const purchases = usePurchasesStore()
	const haptics = useHaptics()
	const pending = ref(false)
	let timer: ReturnType<typeof setTimeout> | null = null

	const ariaLabel = computed(() =>
		purchases.isPro
			? `Reveal the ${props.nextClueName}`
			: `Use a hint to reveal the ${props.nextClueName}, ${purchases.hintBank} left`,
	)

	function useHint() {
		haptics.select()
		if (purchases.isPro) {
			if (purchases.spendHint()) emit('unlock')
			return
		}
		pending.value = true
		timer = setTimeout(() => {
			pending.value = false
			timer = null
			if (props.canPurchase && purchases.spendHint()) emit('unlock')
		}, UNDO_MS)
	}

	function cancel() {
		if (timer) clearTimeout(timer)
		timer = null
		pending.value = false
	}
	onBeforeUnmount(cancel)
</script>

<style scoped lang="scss">
	.hint-use {
		align-items: center;
		background: color-mix(in srgb, var(--pitchcard-accent-win) 15%, transparent);
		border: 0;
		border-radius: 999px;
		color: var(--text-primary);
		cursor: pointer;
		display: inline-flex;
		font: inherit;
		font-size: 0.9rem;
		font-weight: 800;
		gap: 0.3rem;
		height: 2.5rem;
		overflow: hidden;
		padding: 0 0.8rem 0 0.65rem;
		position: relative;
		white-space: nowrap;

		.iconify,
		svg {
			color: var(--tertiary-color);
		}

		&:active:not(:disabled) {
			transform: scale(0.94);
		}

		&:disabled {
			cursor: wait;
			opacity: 0.5;
		}

		&.pending {
			background: var(--bg-primary);
		}
	}

	// Drains over the undo window
	.pending-bar {
		animation: hint-undo 3s linear forwards;
		background: var(--primary-color);
		bottom: 0;
		height: 2px;
		left: 0;
		position: absolute;
		width: 100%;
	}

	@keyframes hint-undo {
		to {
			width: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pending-bar {
			animation: none;
		}
	}
</style>
