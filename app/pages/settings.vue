<template>
	<div class="tab-page">
		<ThemePickerSettings />
	</div>
</template>

<script setup lang="ts">
	import ThemePickerSettings from '../components/shared/ThemePickerSettings.vue'

	// iOS app only: the website shows settings in a sheet from the header
	if (!useRuntimeConfig().public.isApp) await navigateTo('/', { replace: true })

	useHead({ title: 'Settings' })
</script>

<style scoped lang="scss">
	.tab-page {
		margin: 0 auto;
		max-width: 32rem;
		padding: 0.75rem 1rem;
	}
</style>
