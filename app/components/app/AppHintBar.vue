<template>
	<div class="app-hint-bar">
		<TransitionGroup
			v-if="hints.length"
			name="hint"
			tag="div"
			class="hint-chips"
		>
			<div
				v-for="hint in hints"
				:key="hint.label"
				class="hint-chip"
			>
				<Icon
					:name="hint.icon"
					size="1rem"
				/>
				<span class="hint-text">
					<span class="hint-label">{{ hint.label }}</span>
					<span class="hint-value">{{ hint.value }}</span>
				</span>
			</div>
		</TransitionGroup>

		<template v-if="canPurchase">
			<div
				v-if="pending"
				class="hint-btn pending"
				role="status"
			>
				<span class="pending-text">Revealing the {{ nextClueName }}…</span>
				<button
					type="button"
					class="undo-btn"
					@click="cancel"
				>
					Undo
				</button>
				<span
					class="pending-bar"
					aria-hidden="true"
				></span>
			</div>
			<button
				v-else
				type="button"
				class="hint-btn"
				:disabled="purchases.busy"
				@click="useHint"
			>
				<Icon
					name="solar:lightbulb-bolt-bold"
					size="1.2rem"
				/>
				{{ label }}
			</button>
		</template>
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

	const label = computed(() => {
		if (purchases.isPro) return 'Reveal a hint'
		if (purchases.hintBank > 0) return `Use a hint · ${purchases.hintBank} left`
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
	.hint-chips {
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		justify-content: center;
		padding: 0.5rem 0.5rem 0;
	}

	.hint-chip {
		align-items: center;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		color: var(--text-primary);
		display: inline-flex;
		gap: 0.4rem;
		padding: 0.3rem 0.7rem 0.3rem 0.55rem;
		text-align: left;

		> .iconify,
		> svg {
			color: var(--primary-color);
			flex-shrink: 0;
		}

		.hint-text {
			display: flex;
			flex-direction: column;
			line-height: 1.15;
		}

		.hint-label {
			color: var(--text-secondary);
			font-size: 0.6rem;
			font-weight: 700;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}

		.hint-value {
			font-size: 0.9rem;
			font-weight: 700;
		}
	}

	.hint-btn {
		align-items: center;
		background: color-mix(in srgb, var(--primary-color) 16%, var(--bg-secondary));
		border: 1px solid color-mix(in srgb, var(--primary-color) 40%, transparent);
		border-radius: 0.9rem;
		box-sizing: border-box;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		font: inherit;
		font-size: 0.95rem;
		font-weight: 700;
		gap: 0.5rem;
		justify-content: center;
		margin: 0.5rem 0.5rem 0;
		min-height: 44px;
		padding: 0.5rem 1rem;
		width: calc(100% - 1rem);

		.iconify,
		svg {
			color: var(--tertiary-color);
		}

		&:active:not(:disabled) {
			transform: scale(0.98);
		}

		&:disabled {
			cursor: wait;
			opacity: 0.5;
		}

		&.pending {
			cursor: default;
			justify-content: space-between;
			overflow: hidden;
			position: relative;
		}
	}

	.undo-btn {
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 0.7rem;
		color: var(--text-primary);
		cursor: pointer;
		font: inherit;
		font-weight: 800;
		min-height: 34px;
		padding: 0 0.9rem;
	}

	// Drains over the undo window
	.pending-bar {
		animation: hint-undo 3s linear forwards;
		background: var(--primary-color);
		bottom: 0;
		height: 3px;
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
