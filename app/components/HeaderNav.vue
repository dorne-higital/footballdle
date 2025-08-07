<template>
	<section 
		:class="componentName" 
		class="sw-small"
	>
		<div class="left-section">
			<Icon 
				v-if="showBackButton"
				name="solar:home-smile-linear"
				size="1.5rem" 
				@click="$emit('back-to-menu')"
				class="back-to-menu"
			/>
		</div>
		
		<div class="button-container">
			<Icon 
				name="uil:info-circle" 
				@click="$emit('show-info')" 
				size="1.5em" 
			/>

			<Icon 
				name="uil:setting" 
				@click="$emit('show-settings')" 
				size="1.5em" 
			/>

			<Icon 
				name="uil:statistics" 
				@click="$emit('show-stats')" 
				size="1.5em" 
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			componentName?: string
			showBackButton?: boolean
		}>(),
		{
			componentName: 'header-nav',
			showBackButton: false
		}
	)
</script>

<style scoped lang="scss">
	.header-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		width: 100%;

		.left-section {
			display: flex;
			align-items: center;
		}

		.button-container {
			display: flex;
			gap: .5rem;

			span {
				cursor: pointer;
			}
		}

		.back-to-menu {
			color: var(--text-primary);
			cursor: pointer;
			transition: all 0.2s;
			
			&:hover {
				transform: scale(1.1);
			}
		}
	}
</style> 