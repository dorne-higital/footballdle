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
			<!-- Scout Report: [bulb 3 | Use] reads as one control, so the title keeps its room -->
			<div
				v-if="takesHints"
				:class="['hint-group', { joined: offersHint }]"
			>
				<HintPill :compact="offersHint" />
				<HintUseButton
					v-if="offersHint"
					:can-purchase="scout.canPurchaseHint"
					:next-clue-name="scout.nextClueName"
					@unlock="scout.unlockHint()"
				/>
			</div>
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
	import { computed, onMounted, ref } from 'vue'
	import HintPill from './HintPill.vue'
	import HintUseButton from './HintUseButton.vue'
	import { useScoutReportStore } from '../../stores/scoutReport'
	import { useModalsStore } from '../../stores/modals'
	import { useHaptics } from '../../composables/useHaptics'
	import { tabFor } from '../../utils/appTabs'
	import { getUKDateString, wasYesterday } from '../../utils/dateStreak'

	const TITLES: Record<string, string> = {
		'/play/daily': 'Daily',
		// "Scout Report" won't fit beside the hint control on a 375pt screen
		'/play/scout-report': 'Scout',
		'/play/spot-the-baller': 'Spot the Baller',
		'/play/grid': 'The Grid',
		'/how-to-play': 'How to play',
		'/privacy-policy': 'Privacy',
		'/about': 'About',
		'/answers': 'Answers',
		'/feedback': 'Feedback',
		'/cards': 'Cards',
		'/trophies': 'Trophies',
		'/stats': 'Stats',
		'/settings': 'Settings',
	}

	const route = useRoute()
	const modalsStore = useModalsStore()
	const haptics = useHaptics()

	// Scout Report: the "Use a hint" button sits beside the hint count (not on the intro or once it's over)
	const scout = useScoutReportStore()
	const offersHint = computed(
		() => route.path.startsWith('/play/scout-report') && !scout.showIntro && scout.canPurchaseHint,
	)

	// Answer pages are prerendered, so "today" is only known once the page is running
	const ukToday = ref('')
	onMounted(() => (ukToday.value = getUKDateString()))

	// "Yesterday's answer" only when it is; any other day shows its date
	function answerTitle(path: string): string {
		const [y, m, d] = (path.split('/')[2] ?? '').split('-').map(Number)
		if (!y || !m || !d) return 'Answer'
		const dateStr = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
		if (ukToday.value && wasYesterday(dateStr, ukToday.value)) return "Yesterday's answer"
		const day = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC',
		})
		return `Answer · ${day}`
	}

	const title = computed(() => {
		const path = route.path.replace(/\/+$/, '') || '/'
		if (path.startsWith('/cards/replay')) return 'Replay'
		if (path.startsWith('/cards/')) return 'Cards'
		if (path.startsWith('/archive')) return 'Archive'
		return path.startsWith('/solution') ? answerTitle(path) : (TITLES[path] ?? 'Footballdle')
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

		// Game pages: back, title, then the hint control and two buttons. The title takes what's left
		// and truncates, so the buttons never spill off a 375pt screen. Tight gaps leave room for 44pt
		// buttons and a whole title
		&.game {
			gap: 0.375rem;
			grid-template-columns: auto minmax(0, 1fr) auto;
			padding-inline: 0.75rem;

			.bar-title {
				font-size: clamp(1rem, 4.3vw, 1.15rem);
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.bar-actions {
				gap: 0.3rem;
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

	.hint-group {
		display: flex;

		// Same 44pt tap height as the bar buttons
		> :deep(*) {
			height: 2.75rem;
		}

		// One control: square the inner corners and draw a hairline between the halves
		&.joined {
			> :first-child {
				border-bottom-right-radius: 0;
				border-top-right-radius: 0;
			}

			> :last-child {
				border-bottom-left-radius: 0;
				border-left: 1px solid var(--border);
				border-top-left-radius: 0;
			}
		}
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
