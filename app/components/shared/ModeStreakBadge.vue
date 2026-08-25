<template>
	<span
		v-if="streak > 0"
		class="mode-streak-badge"
	>
		<Icon
			name="solar:fire-bold"
			size="0.8rem"
		/>
		{{ streak }}
	</span>
</template>

<script setup lang="ts">
	defineProps<{ streak: number }>()
</script>

<style scoped lang="scss">
	.mode-streak-badge {
		align-items: center;
		background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
		border-radius: 2rem;
		color: #fff;
		display: inline-flex;
		flex-shrink: 0;
		font-size: 0.75rem;
		font-weight: 700;
		gap: 0.25rem;
		padding: 0.2rem 0.55rem;
	}
</style>
