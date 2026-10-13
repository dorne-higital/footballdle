<template>
	<div
		v-if="open"
		class="welcome"
		role="dialog"
		aria-modal="true"
		aria-labelledby="welcome-title"
	>
		<div class="welcome-card">
			<div
				class="dots"
				aria-hidden="true"
			>
				<span
					v-for="(_, i) in STEPS"
					:key="i"
					:class="{ on: i === step }"
				></span>
			</div>

			<Icon
				:name="current.icon"
				size="3rem"
				class="welcome-icon"
			/>
			<h2 id="welcome-title">{{ current.title }}</h2>
			<p>{{ current.text }}</p>

			<template v-if="isLast">
				<button
					v-if="reminders.isAvailable && !reminders.enabled"
					type="button"
					class="secondary"
					@click="remind"
				>
					<Icon
						name="solar:bell-linear"
						size="1.1rem"
					/>
					Remind me daily at midday
				</button>
				<button
					type="button"
					class="primary"
					@click="finish"
				>
					Let's play
				</button>
			</template>
			<template v-else>
				<button
					type="button"
					class="primary"
					@click="step++"
				>
					Next
				</button>
				<button
					type="button"
					class="skip"
					@click="finish"
				>
					Skip
				</button>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'
	import { useRemindersStore } from '../../stores/reminders'
	import { usePurchasesStore } from '../../stores/purchases'
	import { useHaptics } from '../../composables/useHaptics'
	import { readSavedObject } from '../../utils/storage'

	// iOS app: a short welcome on first launch. Anyone who has already played (an
	// update from an earlier version) never sees it.
	const SEEN_KEY = 'footballdle-welcome-seen'
	const STEPS = [
		{
			icon: 'solar:calendar-linear',
			title: 'Three games a day',
			text: 'The Daily, Scout Report and Spot the Baller each get a new Premier League player at midnight UK time. Same puzzles for everyone.',
		},
		{
			icon: 'solar:fire-bold',
			title: 'Keep your streak going',
			text: 'Finish any game to keep your Matchday streak alive. Finish the Daily to unlock Challenge mode for unlimited games against the clock.',
		},
		{
			icon: 'solar:lightbulb-bolt-bold',
			title: 'Here are 3 free hints',
			text: 'Stuck in the Daily or Scout Report? Tap the lightbulb for a clue. You earn another free hint for every 5 days of Daily streak.',
		},
	]

	const open = ref(false)
	const step = ref(0)
	const current = computed(() => STEPS[step.value]!)
	const isLast = computed(() => step.value === STEPS.length - 1)
	const reminders = useRemindersStore()
	const purchases = usePurchasesStore()
	const haptics = useHaptics()

	onMounted(() => {
		try {
			if (localStorage.getItem(SEEN_KEY)) return
			const hasPlayed = ['daily', 'scout', 'spotball', 'challenge'].some(
				mode => Number(readSavedObject(`footballdle-stats-${mode}`)?.gamesPlayed) > 0,
			)
			if (hasPlayed) {
				localStorage.setItem(SEEN_KEY, '1')
				return
			}
		} catch {
			return
		}
		reminders.load()
		open.value = true
	})

	async function remind() {
		await reminders.enable()
		haptics.success()
		finish()
	}

	function finish() {
		try {
			localStorage.setItem(SEEN_KEY, '1')
		} catch {}
		open.value = false
		// The welcome hints are already banked; make sure the pill shows them
		purchases.init()
	}
</script>

<style scoped lang="scss">
	.welcome {
		align-items: flex-end;
		backdrop-filter: blur(6px);
		background: rgb(0 0 0 / 55%);
		display: flex;
		inset: 0;
		justify-content: center;
		position: fixed;
		z-index: 200;
	}

	.welcome-card {
		align-items: center;
		background: var(--bg-secondary);
		border-radius: 28px 28px 0 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 480px;
		padding: 1.25rem 1.5rem calc(env(safe-area-inset-bottom) + 1.25rem);
		text-align: center;
		width: 100%;

		h2 {
			font-family: var(--font-display);
			font-size: 1.5rem;
			margin: 0;
		}

		p {
			color: var(--text-secondary);
			line-height: 1.5;
			margin: 0 0 0.5rem;
		}
	}

	.welcome-icon {
		color: var(--primary-color);
		margin-top: 0.5rem;
	}

	.dots {
		display: flex;
		gap: 0.4rem;

		span {
			background: var(--border);
			border-radius: 999px;
			height: 6px;
			transition: width 0.2s;
			width: 6px;

			&.on {
				background: var(--primary-color);
				width: 18px;
			}
		}
	}

	button {
		align-items: center;
		border-radius: 0.9rem;
		cursor: pointer;
		display: flex;
		font: inherit;
		font-weight: 800;
		gap: 0.5rem;
		justify-content: center;
		min-height: 50px;
		width: 100%;
	}

	.primary {
		background: var(--primary-color);
		border: 0;
		color: var(--on-success);
	}

	.secondary {
		background: var(--bg-primary);
		border: 1px solid var(--border);
		color: var(--text-primary);
	}

	.skip {
		background: none;
		border: 0;
		color: var(--text-secondary);
		min-height: 44px;
	}
</style>
