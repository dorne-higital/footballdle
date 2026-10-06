<template>
	<nav
		class="app-tab-bar"
		aria-label="Main"
	>
		<NuxtLink
			to="/"
			class="tab active"
			aria-current="page"
			@click="haptics.select()"
		>
			<Icon
				name="solar:play-circle-linear"
				size="1.55rem"
			/>
			Play
		</NuxtLink>
		<button
			type="button"
			class="tab"
			@click="open(modalsStore.openStats)"
		>
			<Icon
				name="solar:chart-2-linear"
				size="1.55rem"
			/>
			Stats
		</button>
		<NuxtLink
			to="/trophies"
			class="tab"
			@click="haptics.select()"
		>
			<Icon
				name="solar:cup-star-linear"
				size="1.55rem"
			/>
			Trophies
		</NuxtLink>
		<button
			type="button"
			class="tab"
			@click="open(modalsStore.openSettings)"
		>
			<Icon
				name="solar:settings-linear"
				size="1.55rem"
			/>
			Settings
		</button>
	</nav>
</template>

<script setup lang="ts">
	import { useModalsStore } from '../../stores/modals'
	import { useHaptics } from '../../composables/useHaptics'

	const modalsStore = useModalsStore()
	const haptics = useHaptics()

	function open(action: () => unknown) {
		haptics.select()
		action()
	}
</script>

<style scoped lang="scss">
	.app-tab-bar {
		align-items: center;
		backdrop-filter: blur(18px) saturate(1.4);
		background: color-mix(in srgb, var(--fl-raised) 82%, transparent);
		border: 1px solid var(--border);
		border-radius: 1.5rem;
		bottom: calc(env(safe-area-inset-bottom) + 0.5rem);
		box-shadow: 0 18px 40px -12px rgb(0 0 0 / 60%);
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
