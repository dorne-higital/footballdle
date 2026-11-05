<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
	<HintShopSheet v-if="$config.public.appShell" />
	<ProSheet v-if="$config.public.isApp" />
	<UpdatePrompt v-if="$config.public.isApp" />
	<AppLoader v-if="$config.public.isApp" />
	<ConsentBar v-if="!$config.public.isApp" />
</template>

<script setup lang="ts">
	import AppLoader from './components/app/AppLoader.vue'
	import HintShopSheet from './components/app/HintShopSheet.vue'
	import ProSheet from './components/app/ProSheet.vue'
	import UpdatePrompt from './components/app/UpdatePrompt.vue'
	import ConsentBar from './components/shared/ConsentBar.vue'
</script>
  
<style lang="scss">
	@use '../assets/main.scss';
</style>