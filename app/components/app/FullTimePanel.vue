<template>
	<section
		class="full-time-panel"
		aria-label="Game finished"
	>
		<p class="ft-line">
			<span :class="['ft-badge', isWin ? 'win' : 'loss']">FT</span>
			{{ summary }}
		</p>
		<p
			v-if="countdown"
			class="ft-next"
		>
			New puzzles in <strong>{{ countdown }}</strong>
		</p>
		<!-- Share first: every share carries the footballdle.co.uk/app link -->
		<button
			type="button"
			class="ft-btn primary ft-share"
			@click="share"
		>
			<Icon
				:name="isApp ? 'solar:share-linear' : 'solar:copy-linear'"
				size="1.1rem"
			/>
			{{ isApp ? 'Share' : copied ? 'Copied!' : 'Copy result' }}
		</button>
		<span
			class="ft-status"
			aria-live="polite"
			>{{ copied ? 'Result copied' : '' }}</span
		>
		<!-- Daily only: once it's done, today's replay of a missed card is open -->
		<NuxtLink
			v-if="replayLine && catchUp"
			to="/cards#missed"
			class="ft-replay"
		>
			<Icon
				name="solar:card-2-linear"
				size="1rem"
			/>
			<span
				>Replay unlocked · <strong>{{ catchUp }} {{ catchUp === 1 ? 'card' : 'cards' }}</strong> to catch up</span
			>
		</NuxtLink>
		<div class="ft-actions">
			<button
				type="button"
				class="ft-btn"
				@click="$emit('result')"
			>
				<Icon
					name="solar:document-text-linear"
					size="1.1rem"
				/>
				See result
			</button>
			<NuxtLink
				:to="next.to"
				class="ft-btn"
			>
				<Icon
					:name="next.icon"
					size="1.1rem"
				/>
				{{ next.label }}
			</NuxtLink>
		</div>
		<!-- Where hint codes get posted. Not a reward for following (App Review 3.2.2) -->
		<a
			href="https://www.instagram.com/_footballdle/"
			target="_blank"
			rel="noopener noreferrer"
			class="ft-insta"
		>
			<Icon
				name="ri:instagram-line"
				size="1rem"
			/>
			<span>Free hint codes on Instagram <strong>@_footballdle</strong></span>
		</a>
	</section>
</template>

<script setup lang="ts">
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
	import { useTodayProgress } from '../../composables/useTodayProgress'
	import { useShare } from '../../composables/useShare'
	import { useHaptics } from '../../composables/useHaptics'
	import { useGridStore } from '../../stores/grid'
	import { currentSeason, useCardsStore } from '../../stores/cards'
	import { useReplayStore } from '../../stores/replay'

	// The app and the website's app look: shown under a finished game's board in place of
	// the controls, so a finished game opens on your own result rather than the intro page.
	// Share first, the result sheet second. The app opens the share sheet; the website copies
	const props = defineProps<{
		summary: string
		isWin: boolean
		countdown?: string
		shareText: string
		replayLine?: boolean
	}>()
	const emit = defineEmits<{ result: []; shared: [] }>()

	const isApp = !!useRuntimeConfig().public.isApp
	const { shareText: sendShare } = useShare()
	const haptics = useHaptics()
	const copied = ref(false)
	let timer: ReturnType<typeof setTimeout> | null = null
	async function share() {
		haptics.select()
		emit('shared')
		if (await sendShare(props.shareText)) {
			copied.value = true
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => (copied.value = false), 2000)
		}
	}
	onBeforeUnmount(() => {
		if (timer) clearTimeout(timer)
	})

	// What to play next: the next daily game not finished today, then this week's Grid
	// if any of it is left, otherwise back to the Matchday
	const progress = useTodayProgress()
	const grid = useGridStore()
	const cards = useCardsStore()
	const replay = useReplayStore()
	onMounted(() => {
		progress.refresh()
		grid.load()
		if (props.replayLine) {
			cards.load()
			replay.load()
		}
	})
	// Missed cards to catch up on, once today's replay can start (a hint in the bank, or Pro)
	const catchUp = computed(() => {
		const season = props.replayLine ? currentSeason() : null
		return season && !replay.blocker && !replay.state ? cards.missedIds(season.label).size : 0
	})
	const unfinished = (status: string) => status === 'new' || status === 'playing'
	const next = computed(() => {
		if (unfinished(progress.daily.value.status))
			return { label: 'Play the Daily', to: '/play/daily?start=play', icon: 'solar:calendar-linear' }
		if (unfinished(progress.scout.value.status))
			return { label: 'Play Scout Report', to: '/play/scout-report?start=play', icon: 'solar:clipboard-list-linear' }
		if (unfinished(progress.spot.value.status))
			return { label: 'Play Spot the Baller', to: '/play/spot-the-baller?start=play', icon: 'solar:eye-linear' }
		if (grid.ready && !grid.weekDone) return { label: 'Play The Grid', to: '/play/grid', icon: 'solar:widget-4-linear' }
		return { label: 'Back to Matchday', to: '/', icon: 'solar:home-2-linear' }
	})
</script>

<style scoped lang="scss">
	.full-time-panel {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.1rem;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		gap: 0.6rem;
		margin: 0.6rem 0.5rem 0;
		padding: 0.9rem 1rem;
		position: relative;
		text-align: left;
	}

	.ft-line {
		align-items: center;
		display: flex;
		font-weight: 800;
		gap: 0.55rem;
		margin: 0;
	}

	.ft-badge {
		border-radius: 0.4rem;
		font-family: var(--font-display);
		font-size: 0.75rem;
		padding: 0.15rem 0.4rem;

		&.win {
			background: var(--color-success);
			color: var(--bg-primary);
		}

		&.loss {
			background: var(--color-absent);
			color: var(--text-primary);
		}
	}

	.ft-next {
		color: var(--text-secondary);
		font-size: 0.85rem;
		margin: 0;

		strong {
			color: var(--text-primary);
			font-variant-numeric: tabular-nums;
		}
	}

	.ft-actions {
		display: flex;
		gap: 0.5rem;
	}

	// Its own full-width row, so the two buttons below keep room for "Play Spot the Baller"
	.ft-share {
		flex: none;
		width: 100%;
	}

	// Read out by VoiceOver when the website copies the result; not shown
	.ft-status {
		clip: rect(0 0 0 0);
		height: 1px;
		overflow: hidden;
		position: absolute;
		white-space: nowrap;
		width: 1px;
	}

	.ft-replay,
	.ft-insta {
		align-items: center;
		align-self: center;
		color: var(--text-secondary);
		display: flex;
		font-size: 0.82rem;
		gap: 0.35rem;
		min-height: 44px;
		text-decoration: none;
		margin-bottom: -0.5rem;

		strong {
			color: var(--text-primary);
		}
	}

	// Sits above the buttons, so it lines up with the text above it
	.ft-replay {
		align-self: flex-start;
		margin-bottom: 0;
	}

	.ft-btn {
		align-items: center;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		flex: 1;
		font: inherit;
		font-size: 0.92rem;
		font-weight: 700;
		gap: 0.4rem;
		justify-content: center;
		min-height: 44px;
		text-decoration: none;

		&.primary {
			background: var(--primary-color);
			border-color: var(--primary-color);
			color: var(--bg-primary);
		}

		&:active {
			transform: scale(0.98);
		}
	}
</style>
