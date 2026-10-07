<template>
	<div :class="{ 'app-page-layout': $config.public.isApp }">
		<AppTopBar v-if="$config.public.isApp" />
		<slot />
		<HubSheets v-if="$config.public.isApp" />
	</div>
</template>

<script setup lang="ts">
	import AppTopBar from '../components/app/AppTopBar.vue'
	import HubSheets from '../components/shared/HubSheets.vue'
</script>
