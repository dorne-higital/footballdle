<template>
	<div :class="['play-layout', { 'has-tab-bar': showTabBar }]">
		<template v-if="$config.public.isApp">
			<AppTopBar v-if="!showTabBar" />
		</template>
		<AppHeader v-else />

		<div class="play-content">
			<div
				class="pitch-texture"
				aria-hidden="true"
			></div>
			<slot />
		</div>

		<AppTabBar v-if="showTabBar" />
		<!-- iOS app: the same Stats and Settings sheets as everywhere else -->
		<HubSheets v-if="$config.public.isApp" />
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import AppHeader from '../components/shared/AppHeader.vue'
	import AppTopBar from '../components/app/AppTopBar.vue'
	import AppTabBar from '../components/app/AppTabBar.vue'
	import HubSheets from '../components/shared/HubSheets.vue'

	const route = useRoute()
	const { isApp } = useRuntimeConfig().public

	// iOS app: tab bar on the Matchday home, back-button top bar inside games
	const showTabBar = computed(() => isApp && route.path.replace(/\/+$/, '') === '')
</script>

<style scoped lang="scss">
	.play-layout {
		background: var(--bg-primary);
		display: flex;
		flex-direction: column;
		height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
		overflow: hidden;
		width: 100%;
	}

	.play-content {
		align-items: flex-start;
		display: flex;
		flex: 1;
		justify-content: center;
		min-height: 0;
		overflow: hidden;
		padding: 1.5rem;
		position: relative;
		width: 100%;

		.pitch-texture {
			background: repeating-linear-gradient(
				100deg,
				color-mix(in srgb, var(--primary-color) 5%, transparent) 0px,
				color-mix(in srgb, var(--primary-color) 5%, transparent) 44px,
				transparent 44px,
				transparent 88px
			);
			inset: 0;
			pointer-events: none;
			position: absolute;
			z-index: 0;
		}

		> :not(.pitch-texture) {
			position: relative;
			z-index: 1;
		}
	}

	@media (width <= 640px) {
		.play-content {
			padding: 0.6rem;
		}
	}
</style>
