<template>
	<section 
		:class="componentName" 
		class="sw-small"
	>
		<h3>
			
		</h3>
		
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
		}>(),
		{
			componentName: 'header-nav'
		}
	)
</script>

<style scoped lang="scss">
	.header-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;

		.button-container {
			display: flex;
			gap: .5rem;

			span {
				cursor: pointer;
			}
		}
	}
</style> 