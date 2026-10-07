<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
	<HintShopSheet v-if="$config.public.isApp" />
	<AppLoader v-if="$config.public.isApp" />
</template>

<script setup lang="ts">
	import AppLoader from './components/app/AppLoader.vue'
	import HintShopSheet from './components/app/HintShopSheet.vue'
</script>
  
<style lang="scss">
	@use '../assets/main.scss';
</style>