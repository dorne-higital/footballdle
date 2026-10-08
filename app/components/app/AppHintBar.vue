<template>
	<div class="app-hint-bar">
		<!-- Slim pills: revealed clues, then the hint button; wraps to a second row at most -->
		<TransitionGroup
			name="hint"
			tag="div"
			class="hint-row"
		>
			<span
				v-for="hint in hints"
				:key="hint.label"
				class="hint-chip"
				:aria-label="`${hint.label} ${hint.value}`"
			>
				<Icon
					:name="hint.icon"
					size="0.85rem"
				/>
				<span
					v-if="hint.short"
					class="hint-short"
				>{{ hint.short }}</span>
				<strong>{{ hint.value }}</strong>
			</span>

			<template v-if="canPurchase">
				<button
					v-if="pending"
					key="undo"
					type="button"
					class="hint-btn pending"
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
					v-else
					key="use"
					type="button"
					class="hint-btn"
					:class="{ lone: !hints.length }"
					:disabled="purchases.busy"
					:aria-label="ariaLabel"
					@click="useHint"
				>
					<Icon
						name="solar:lightbulb-bolt-bold"
						size="1rem"
					/>
					{{ label }}
				</button>
			</template>
		</TransitionGroup>
	</div>
</template>

<script setup lang="ts">
	import { computed, onBeforeUnmount, ref } from 'vue'
	import { usePurchasesStore } from '../../stores/purchases'

	// iOS app: revealed clues plus the "Use a hint" button, for any game that takes hints
	// from the shared bank. A banked hint waits a few seconds with an Undo before it's
	// spent; Pro hints are unlimited, so those reveal straight away.
	const props = defineProps<{
		hints: { label: string; value: string; icon: string }[]
		canPurchase: boolean
		nextClueName: string
	}>()
	const emit = defineEmits<{ unlock: [] }>()

	const UNDO_MS = 3000
	const purchases = usePurchasesStore()
	const showHintShop = useState('hint-shop-open', () => false)
	const pending = ref(false)
	let timer: ReturnType<typeof setTimeout> | null = null

	// Short, so it fits beside the clues; the full wording is for VoiceOver
	const label = computed(() => {
		if (purchases.isPro || purchases.hintBank > 0) return props.hints.length ? 'Hint' : 'Use a hint'
		return 'Get hints'
	})
	const ariaLabel = computed(() => {
		if (purchases.isPro) return `Reveal the ${props.nextClueName}`
		if (purchases.hintBank > 0) return `Use a hint to reveal the ${props.nextClueName}, ${purchases.hintBank} left`
		return 'Get hints'
	})

	function useHint() {
		if (purchases.isPro) {
			if (purchases.spendHint()) emit('unlock')
			return
		}
		if (purchases.hintBank <= 0) {
			showHintShop.value = true
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
	.hint-row {
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		justify-content: center;
		padding: 0.4rem 0.5rem 0;
	}

	.hint-chip,
	.hint-btn {
		align-items: center;
		border-radius: 999px;
		display: inline-flex;
		flex-shrink: 0;
		font-size: 0.8rem;
		gap: 0.3rem;
		height: 1.85rem;
		padding: 0 0.65rem;
		white-space: nowrap;
	}

	.hint-chip {
		background: var(--bg-primary);
		border: 1px solid var(--border);
		color: var(--text-primary);

		> .iconify,
		> svg {
			color: var(--primary-color);
		}

		.hint-short {
			color: var(--text-secondary);
			font-weight: 600;
		}

		strong {
			font-weight: 800;
		}
	}

	.hint-btn {
		background: color-mix(in srgb, var(--primary-color) 16%, var(--bg-secondary));
		border: 1px solid color-mix(in srgb, var(--primary-color) 40%, transparent);
		color: var(--text-primary);
		cursor: pointer;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 800;
		overflow: hidden;
		position: relative;

		// Keeps a 44pt tap target without the extra height on screen
		&::after {
			content: '';
			inset: -6px -2px;
			position: absolute;
		}

		.iconify,
		svg {
			color: var(--tertiary-color);
		}

		&.lone {
			padding: 0 1rem;
		}

		&:active:not(:disabled) {
			transform: scale(0.96);
		}

		&:disabled {
			cursor: wait;
			opacity: 0.5;
		}

		&.pending {
			background: var(--bg-primary);
			border-color: var(--border);
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

	.hint-enter-active {
		transition: all 0.3s ease;
	}

	.hint-enter-from {
		opacity: 0;
		transform: scale(0.9);
	}
</style>
