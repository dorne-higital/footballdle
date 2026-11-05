<template>
	<div class="archive-page">
		<h1>Puzzle archive</h1>
		<p class="lede">
			Every past Daily since #1. The last {{ FREE_DAYS }} days are a hint each to open<template v-if="!purchases.isPro">, or free with
				<button
					type="button"
					class="link"
					@click="proSheetOpen = true"
				>
					Pro</button
				>, which also opens every older one</template>. No stats, streaks or cards.
		</p>
		<p
			v-if="note"
			class="note"
			role="status"
		>
			{{ note }}
		</p>
		<ul class="days">
			<li
				v-for="d in archive.days"
				:key="d.iso"
			>
				<button
					type="button"
					:class="['day', d.access, d.game?.over ? (d.game.win ? 'won' : 'lost') : d.game ? 'playing' : '']"
					@click="open(d)"
				>
					<span class="num">#{{ d.number }}</span>
					<span class="date">{{ label(d.date) }}</span>
					<span class="state">
						<template v-if="d.game?.over">{{ d.game.win ? `Won in ${d.game.guesses.length}` : 'Missed' }}</template>
						<template v-else-if="d.game">Carry on</template>
						<template v-else-if="d.access === 'hint'">
							<Icon
								name="solar:lightbulb-bold"
								size="0.9rem"
							/>1 hint
						</template>
						<template v-else-if="d.access === 'pro'">
							<Icon
								name="solar:crown-bold"
								size="0.9rem"
							/>Pro
						</template>
						<template v-else>Play</template>
					</span>
				</button>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { type ArchiveDay, FREE_DAYS, useArchiveStore } from '../../stores/archive'
	import { usePurchasesStore } from '../../stores/purchases'

	// Puzzle archive (1.3, F3), iOS app only: past Dailies; stores/archive.ts has the rules
	if (!useRuntimeConfig().public.appShell) await navigateTo('/', { replace: true })
	useHead({ title: 'Puzzle archive' })

	const archive = useArchiveStore()
	const purchases = usePurchasesStore()
	const proSheetOpen = useState('pro-sheet-open', () => false)
	const hintShopOpen = useState('hint-shop-open', () => false)
	const note = ref('')

	const label = (date: string) => {
		const [d, m, y] = date.split('/').map(Number)
		return new Date(y!, m! - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
	}

	function open(d: ArchiveDay) {
		note.value = ''
		if (d.access === 'pro') return (proSheetOpen.value = true)
		if (d.access === 'hint' && purchases.hintBank < 1) {
			note.value = 'Opening a past Daily costs a hint, and your bank is empty.'
			hintShopOpen.value = true
			return
		}
		navigateTo(`/archive/${d.iso}`)
	}
</script>

<style scoped lang="scss">
	.archive-page {
		display: grid;
		gap: 0.75rem;
		margin: 0 auto;
		max-width: 32rem;
		padding: 0.75rem 1rem 2rem;
	}

	h1 {
		font-size: 1.6rem;
		margin: 0;
	}

	.lede {
		color: var(--text-secondary);
		font-size: 0.92rem;
		margin: 0;
	}

	.link {
		background: none;
		border: 0;
		color: var(--primary-color);
		cursor: pointer;
		font: inherit;
		font-weight: 700;
		padding: 0;
		text-decoration: underline;
	}

	.note {
		color: var(--color-present);
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0;
	}

	.days {
		display: grid;
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.day {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		color: var(--text-primary);
		cursor: pointer;
		display: grid;
		font: inherit;
		gap: 0.75rem;
		grid-template-columns: 3.2rem 1fr auto;
		min-height: 52px;
		padding: 0.6rem 0.9rem;
		text-align: left;
		width: 100%;

		&.pro {
			opacity: 0.7;
		}
	}

	.num {
		font-variant-numeric: tabular-nums;
		font-weight: 800;
	}

	.date {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.state {
		align-items: center;
		display: inline-flex;
		font-size: 0.85rem;
		font-weight: 700;
		gap: 0.3rem;
	}

	.won .state {
		color: var(--color-success);
	}

	.lost .state {
		color: var(--text-secondary);
	}

	.playing .state,
	.hint .state {
		color: var(--primary-color);
	}
</style>
