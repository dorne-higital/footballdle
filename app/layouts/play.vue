<template>
	<div class="play-layout">
		<AppHeader />

		<div class="play-content">
			<div
				class="pitch-texture"
				aria-hidden="true"
			></div>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
	import AppHeader from '../components/shared/AppHeader.vue'
</script>

<style scoped lang="scss">
	.play-layout {
		background: var(--bg-primary);
		display: flex;
		flex-direction: column;
		height: 100dvh;
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
</style>
