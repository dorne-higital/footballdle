<template>
	<div class="scoreboard-strip">
		<span class="sb-left">
			<span class="sb-mode">{{ modeLabel }}</span
			><template v-if="puzzleNumber"
				><span class="sb-num"> &middot; #{{ puzzleNumber }}</span></template
			><template v-if="roundProgress"
				><span class="sb-num"> &middot; {{ roundProgress }}</span></template
			>
		</span>
		<span
			v-if="streak > 0"
			class="sb-right"
		>
			<Icon
				name="solar:fire-bold"
				size="0.85rem"
			/>
			<span class="sb-streak-num">{{ streak }}</span>
		</span>
	</div>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			modeLabel: string
			puzzleNumber?: number | string
			roundProgress?: string
			streak?: number
		}>(),
		{
			puzzleNumber: '',
			roundProgress: '',
			streak: 0,
		},
	)
</script>

<style scoped lang="scss">
	.scoreboard-strip {
		align-items: center;
		background: var(--scoreboard-bg);
		border-radius: calc(var(--global-border-radius) - 2px);
		color: var(--scoreboard-fg);
		display: flex;
		flex-shrink: 0;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		padding: 0.5rem 0.85rem;

		.sb-left {
			align-items: baseline;
			display: inline-flex;
		}

		.sb-mode {
			font-family: var(--font-display);
			font-size: 0.7rem;
			font-weight: 700;
			letter-spacing: 0.12em;
			text-transform: uppercase;
		}

		.sb-num {
			font-family: var(--font-mono);
			font-size: 0.68rem;
			letter-spacing: 0.02em;
			opacity: 0.72;
		}

		.sb-right {
			align-items: center;
			color: var(--scoreboard-accent);
			display: inline-flex;
			flex-shrink: 0;
			gap: 0.3rem;
		}

		.sb-streak-num {
			font-family: var(--font-mono);
			font-size: 0.75rem;
			font-weight: 700;
		}
	}
</style>
