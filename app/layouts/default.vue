<template>
	<div :class="{ 'app-page-layout': $config.public.isApp, 'has-tab-bar': isTab }">
		<AppTopBar v-if="$config.public.isApp" />
		<slot />
		<HubSheets v-if="$config.public.isApp" />
		<AppTabBar v-if="isTab" />
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import AppTopBar from '../components/app/AppTopBar.vue'
	import AppTabBar from '../components/app/AppTabBar.vue'
	import HubSheets from '../components/shared/HubSheets.vue'
	import { tabFor } from '../utils/appTabs'

	const route = useRoute()
	const { isApp } = useRuntimeConfig().public
	// Stats, Trophies and Settings are tabs in the app: tab bar on, no back button
	const isTab = computed(() => isApp && tabFor(route.path) !== null)
</script>

<style scoped lang="scss">
	// Room to scroll the last item clear of the floating tab bar
	.has-tab-bar {
		padding-bottom: calc(env(safe-area-inset-bottom) + 5.5rem);
	}
</style>
