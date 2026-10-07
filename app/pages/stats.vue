<template>
	<div class="tab-page">
		<MatchdayStats />
	</div>
</template>

<script setup lang="ts">
	import MatchdayStats from '../components/shared/MatchdayStats.vue'

	// iOS app only: the website shows stats in a sheet from the header
	if (!useRuntimeConfig().public.isApp) await navigateTo('/', { replace: true })

	useHead({ title: 'Stats' })
</script>

<style scoped lang="scss">
	.tab-page {
		margin: 0 auto;
		max-width: 32rem;
		padding: 0.75rem 1rem;
	}
</style>
