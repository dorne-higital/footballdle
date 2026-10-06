<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
	<AppLoader v-if="$config.public.isApp" />
</template>

<script setup lang="ts">
	import AppLoader from './components/app/AppLoader.vue'
</script>
  
<style lang="scss">
	@use '../assets/main.scss';
</style>