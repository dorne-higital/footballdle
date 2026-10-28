<template>
	<div :class="{ 'app-page-layout': $config.public.appShell, 'has-tab-bar': isTab }">
		<DesktopRail v-if="$config.public.appShell && !$config.public.isApp" />
		<AppTopBar v-if="$config.public.appShell" />
		<slot />
		<HubSheets v-if="$config.public.appShell" />
		<AppTabBar v-if="isTab" />
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import AppTopBar from '../components/app/AppTopBar.vue'
	import AppTabBar from '../components/app/AppTabBar.vue'
	import DesktopRail from '../components/app/DesktopRail.vue'
	import HubSheets from '../components/shared/HubSheets.vue'
	import { tabFor } from '../utils/appTabs'

	const route = useRoute()
	const { appShell } = useRuntimeConfig().public
	// Stats, Trophies and Settings are tabs in the app shell: tab bar on, no back button
	const isTab = computed(() => appShell && tabFor(route.path) !== null)
</script>

<style scoped lang="scss">
	// Room to scroll the last item clear of the floating tab bar and its fade (AppTabBar.vue)
	.has-tab-bar {
		padding-bottom: calc(env(safe-area-inset-bottom) + 6.75rem);
	}
</style>
