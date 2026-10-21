<template>
	<header :class="['app-top-bar', { game: !isTab }]">
		<span
			v-if="isTab"
			aria-hidden="true"
		></span>
		<NuxtLink
			v-else
			:to="backTo"
			class="bar-btn"
			:aria-label="backTo === '/cards' ? 'Back to Cards' : 'Back to Matchday'"
			@click="haptics.select()"
		>
			<Icon
				name="solar:alt-arrow-left-linear"
				size="1.4rem"
			/>
		</NuxtLink>
		<p class="bar-title">{{ title }}</p>
		<div
			v-if="!isTab"
			class="bar-actions"
		>
			<HintPill v-if="takesHints" />
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
	import { tabFor } from '../../utils/appTabs'

	const TITLES: Record<string, string> = {
		'/play/daily': 'Daily',
		'/play/scout-report': 'Scout Report',
		'/play/spot-the-baller': 'Spot the Baller',
		'/play/grid': 'The Grid',
		'/how-to-play': 'How to play',
		'/privacy-policy': 'Privacy',
		'/about': 'About',
		'/feedback': 'Feedback',
		'/cards': 'Cards',
		'/trophies': 'Trophies',
		'/stats': 'Stats',
		'/settings': 'Settings',
	}

	const route = useRoute()
	const modalsStore = useModalsStore()
	const haptics = useHaptics()

	const title = computed(() => {
		const path = route.path.replace(/\/+$/, '') || '/'
		if (path.startsWith('/cards/replay')) return 'Replay'
		if (path.startsWith('/cards/')) return 'Cards'
		return path.startsWith('/solution') ? "Yesterday's answer" : (TITLES[path] ?? 'Footballdle')
	})

	// Games that use the shared hint bank
	const takesHints = computed(
		() =>
			route.path.startsWith('/play/daily') ||
			route.path.startsWith('/play/scout-report') ||
			route.path.startsWith('/play/grid'),
	)
	// Tab screens: no back button, and no Stats/Settings buttons (they're tabs)
	const isTab = computed(() => tabFor(route.path) !== null)

	// Card screens go back to the Cards tab; everything else to Matchday
	const backTo = computed(() => (route.path.startsWith('/cards/') ? '/cards' : '/'))

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

		// Game pages: back, title, then up to three buttons. The title takes what's left
		// and truncates, so the buttons never spill off a 390pt screen
		&.game {
			grid-template-columns: auto minmax(0, 1fr) auto;
			padding-inline: 0.75rem;

			.bar-title {
				font-size: clamp(1rem, 4.3vw, 1.15rem);
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.bar-actions {
				gap: 0.4rem;
			}

			.bar-btn {
				height: 2.6rem;
				width: 2.6rem;
			}
		}
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
