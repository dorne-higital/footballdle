<template>
	<div :class="{ 'app-page-layout': $config.public.isApp }">
		<AppTopBar v-if="$config.public.isApp" />
		<slot />
	</div>
</template>

<script setup lang="ts">
	import AppTopBar from '../components/app/AppTopBar.vue'
</script>
