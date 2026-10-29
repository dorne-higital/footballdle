<template>
	<div class="app-hint-bar">
		<!-- Slim pills: revealed clues; wraps to a second row at most -->
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
		</TransitionGroup>
	</div>
</template>

<script setup lang="ts">
	// iOS app: the clues revealed so far, as slim pills under the board. The button that
	// buys them is in the top bar (HintUseButton.vue)
	defineProps<{ hints: { label: string; value: string; icon: string; short?: string }[] }>()
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

	.hint-chip {
		align-items: center;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-primary);
		display: inline-flex;
		flex-shrink: 0;
		font-size: 0.8rem;
		gap: 0.3rem;
		height: 1.85rem;
		padding: 0 0.65rem;
		white-space: nowrap;

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

	.hint-enter-active {
		transition: all 0.3s ease;
	}

	.hint-enter-from {
		opacity: 0;
		transform: scale(0.9);
	}
</style>
