<template>
	<header class="app-top-bar">
		<NuxtLink
			to="/"
			class="bar-btn"
			aria-label="Back to Matchday"
			@click="haptics.select()"
		>
			<Icon
				name="solar:alt-arrow-left-linear"
				size="1.4rem"
			/>
		</NuxtLink>
		<p class="bar-title">{{ title }}</p>
		<div class="bar-actions">
			<HintPill v-if="isDaily" />
			<button
				type="button"
				class="bar-btn"
				aria-label="Statistics"
				@click="open(modalsStore.openStats)"
			>
				<Icon
					name="solar:chart-2-linear"
					size="1.3rem"
				/>
			</button>
			<button
				type="button"
				class="bar-btn"
				aria-label="Settings"
				@click="open(modalsStore.openSettings)"
			>
				<Icon
					name="solar:settings-linear"
					size="1.3rem"
				/>
			</button>
		</div>
	</header>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import HintPill from './HintPill.vue'
	import { useModalsStore } from '../../stores/modals'
	import { useHaptics } from '../../composables/useHaptics'

	const TITLES: Record<string, string> = {
		'/play/daily': 'Daily',
		'/play/scout-report': 'Scout Report',
		'/play/spot-the-baller': 'Spot the Baller',
		'/how-to-play': 'How to play',
		'/privacy-policy': 'Privacy',
		'/about': 'About',
	}

	const route = useRoute()
	const modalsStore = useModalsStore()
	const haptics = useHaptics()

	const title = computed(() => {
		const path = route.path.replace(/\/+$/, '') || '/'
		return path.startsWith('/solution') ? "Yesterday's answer" : (TITLES[path] ?? 'Footballdle')
	})

	const isDaily = computed(() => route.path.startsWith('/play/daily'))

	function open(action: () => unknown) {
		haptics.select()
		action()
	}
</script>

<style scoped lang="scss">
	.app-top-bar {
		align-items: center;
		display: grid;
		gap: 0.5rem;
		grid-template-columns: 1fr auto 1fr;
		padding: 0.5rem 1rem 0.25rem;
		position: relative;
		z-index: 2;
	}

	.bar-title {
		font-family: var(--font-display);
		font-size: 1.15rem;
		margin: 0;
		white-space: nowrap;
	}

	.bar-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	.bar-btn {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		height: 2.75rem;
		justify-content: center;
		padding: 0;
		width: 2.75rem;

		&:active {
			transform: scale(0.94);
		}
	}
</style>
