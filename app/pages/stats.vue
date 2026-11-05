<template>
	<div class="tab-page">
		<!-- Puzzle archive (1.3): past Dailies -->
		<NuxtLink
			to="/archive"
			class="archive-link"
		>
			<Icon
				name="solar:calendar-search-linear"
				size="1.3rem"
			/>
			<span>
				<strong>Puzzle archive</strong>
				<small>Play any past Daily since #1</small>
			</span>
			<Icon
				name="solar:alt-arrow-right-linear"
				size="1rem"
			/>
		</NuxtLink>
		<MatchdayStats />
	</div>
</template>

<script setup lang="ts">
	import MatchdayStats from '../components/shared/MatchdayStats.vue'

	// iOS app only: the website shows stats in a sheet from the header
	if (!useRuntimeConfig().public.appShell) await navigateTo('/', { replace: true })

	useHead({ title: 'Stats' })
</script>

<style scoped lang="scss">
	.archive-link {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1rem;
		color: var(--text-primary);
		display: grid;
		gap: 0.75rem;
		grid-template-columns: auto 1fr auto;
		margin-bottom: 0.9rem;
		padding: 0.75rem 0.9rem;
		text-decoration: none;

		span {
			display: grid;
		}

		small {
			color: var(--text-secondary);
			font-size: 0.82rem;
		}
	}

	.tab-page {
		margin: 0 auto;
		max-width: 32rem;
		padding: 0.75rem 1rem;
	}
</style>
