<template>
	<!-- Content fades out above the bar instead of sliding under it -->
	<div
		class="app-tab-fade"
		aria-hidden="true"
	></div>
	<nav
		class="app-tab-bar"
		aria-label="Main"
	>
		<NuxtLink
			v-for="tab in APP_TABS"
			:key="tab.to"
			:to="tab.to"
			:class="['tab', { active: active === tab.to }]"
			:aria-current="active === tab.to ? 'page' : undefined"
			@click="haptics.select()"
		>
			<Icon
				:name="active === tab.to ? tab.iconActive : tab.icon"
				size="1.55rem"
			/>
			{{ tab.label }}
		</NuxtLink>
	</nav>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import { useHaptics } from '../../composables/useHaptics'
	import { APP_TABS, tabFor } from '../../utils/appTabs'

	const route = useRoute()
	const haptics = useHaptics()
	const active = computed(() => tabFor(route.path))
</script>
<style scoped lang="scss">
	// Under the bar and 2.25rem above it: solid to the bar's middle, then clear.
	// pointer-events: none so taps reach the content behind
	.app-tab-fade {
		background: linear-gradient(to top, var(--bg-primary) calc(env(safe-area-inset-bottom) + 2.5rem), transparent);
		bottom: 0;
		height: calc(env(safe-area-inset-bottom) + 7rem);
		left: 0;
		pointer-events: none;
		position: fixed;
		right: 0;
		z-index: 49;
	}

	.app-tab-bar {
		align-items: center;
		backdrop-filter: blur(18px) saturate(1.4);
		background: color-mix(in srgb, var(--fl-raised) 82%, transparent);
		border: 1px solid var(--border);
		border-radius: 1.5rem;
		bottom: calc(env(safe-area-inset-bottom) + 0.5rem);
		box-shadow: 0 18px 40px -12px var(--fl-shadow);
		display: flex;
		height: 4.25rem;
		justify-content: space-around;
		left: 1rem;
		position: fixed;
		right: 1rem;
		z-index: 50;
	}

	.tab {
		align-items: center;
		background: none;
		border: 0;
		color: var(--text-secondary);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		font-family: var(--font-body);
		font-size: 0.7rem;
		font-weight: 700;
		gap: 0.2rem;
		min-height: 44px;
		min-width: 3.5rem;
		padding: 0;
		text-decoration: none;

		&.active {
			color: var(--primary-color);
			font-weight: 800;
		}
	}
</style>
