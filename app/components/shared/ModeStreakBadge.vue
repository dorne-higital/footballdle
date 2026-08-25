<template>
	<span
		v-if="streak > 0"
		class="mode-streak-badge"
	>
		<Icon
			name="solar:fire-bold"
			size="0.8rem"
		/>
		<span class="num">{{ streak }}</span>
	</span>
</template>

<script setup lang="ts">
	defineProps<{ streak: number }>()
</script>

<style scoped lang="scss">
	.mode-streak-badge {
		align-items: center;
		background: linear-gradient(
			135deg,
			var(--tertiary-color) 0%,
			color-mix(in srgb, var(--tertiary-color) 65%, black) 100%
		);
		border-radius: 999px;
		color: #fff;
		display: inline-flex;
		flex-shrink: 0;
		font-size: 0.75rem;
		font-weight: 700;
		gap: 0.25rem;
		padding: 0.2rem 0.55rem;

		.num {
			font-family: var(--font-mono);
		}
	}
</style>
