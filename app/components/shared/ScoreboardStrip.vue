<template>
	<div class="scoreboard-strip">
		<span class="sb-left">
			{{ modeLabel }}<template v-if="puzzleNumber"> &middot; #{{ puzzleNumber }}</template
			><template v-if="roundProgress"> &middot; {{ roundProgress }}</template>
		</span>
		<span
			v-if="streak > 0"
			class="sb-right"
		>
			<Icon
				name="solar:fire-bold"
				size="0.85rem"
			/>
			{{ streak }}
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
		border-radius: calc(var(--global-border-radius) / 2 + 4px);
		color: var(--scoreboard-fg);
		display: flex;
		flex-shrink: 0;
		font-family: ui-monospace, 'SF Mono', Consolas, monospace;
		justify-content: space-between;
		margin-bottom: 0.4rem;
		padding: 0.4rem 0.7rem;

		.sb-left {
			font-size: 0.7rem;
			font-weight: 700;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}

		.sb-right {
			align-items: center;
			color: var(--scoreboard-accent);
			display: inline-flex;
			flex-shrink: 0;
			font-weight: 700;
			gap: 0.25rem;
		}
	}
</style>
