<template>
	<div class="club-page">
		<template v-if="current && set">
			<section
				class="club-head"
				:style="{ '--club-bg': style.bg, '--club-fg': style.fg }"
			>
				<ClubCrest
					:club="clubName"
					class="crest"
				/>
				<div>
					<h1>{{ clubName }}</h1>
					<p>{{ have }} of {{ set.size }} cards · set worth {{ set.hints }} {{ set.hints === 1 ? 'hint' : 'hints' }}</p>
				</div>
			</section>

			<p
				v-if="done"
				class="done-note"
				role="status"
			>
				Set complete! {{ set.hints }} {{ set.hints === 1 ? 'hint' : 'hints' }} added to your bank.
			</p>

			<ul class="card-grid">
				<li
					v-for="slot in slots"
					:key="slot.id"
				>
					<PlayerCard
						:card="slot.owned ? slot.card : null"
						:club="clubName"
						:foil="slot.foil"
						size="sm"
					/>
					<NuxtLink
						v-if="slot.missed && canReplay(slot.id)"
						:to="`/cards/replay/${slot.id}`"
						class="replay-btn"
						>Replay · 1 hint</NuxtLink
					>
					<span
						v-else-if="slot.missed"
						class="slot-note"
						>Missed</span
					>
				</li>
			</ul>

			<p class="footnote">
				Cards you haven't collected stay face down. Missed one? Once its day has passed you can replay it here for a
				hint, one a day after you've finished the Daily.
				<template v-if="replayBlocker"><br /><strong>{{ replayBlocker }}</strong></template>
			</p>
		</template>
		<p
			v-else
			class="footnote"
		>
			No cards for this club this season.
		</p>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted } from 'vue'
	import PlayerCard from '../../components/cards/PlayerCard.vue'
	import { currentSeason, useCardsStore } from '../../stores/cards'
	import { useReplayStore } from '../../stores/replay'
	import { clubStyle } from '../../utils/clubs'
	import ClubCrest from '../../components/cards/ClubCrest.vue'

	if (!useRuntimeConfig().public.isApp) await navigateTo('/', { replace: true })

	const route = useRoute()
	const cards = useCardsStore()
	const replay = useReplayStore()
	onMounted(() => cards.load())

	const current = currentSeason()
	const clubName = current
		? (Object.keys(current.season.clubs).find(name => clubStyle(name).code.toLowerCase() === String(route.params.club)) ?? '')
		: ''
	const set = current?.season.clubs[clubName]
	const style = clubStyle(clubName)
	useHead({ title: clubName || 'Cards' })

	const slots = computed(() => {
		if (!current || !set) return []
		const owned = Object.values(cards.saved.cards).filter(c => c.season === current.label)
		const missed = cards.missedIds(current.label)
		return set.members.map(id => {
			const mine = owned.filter(c => c.id === id)
			return {
				id,
				card: current.season.cards[id]!,
				owned: mine.length > 0,
				foil: mine.some(c => c.foil),
				missed: missed.has(id),
			}
		})
	})
	const have = computed(() => slots.value.filter(s => s.owned).length)
	const done = computed(() => !!(current && cards.saved.sets[`${current.label}|${clubName}`]))
	// One replay a day: once started, only that card's button stays
	const canReplay = (id: string) => !replay.blocker && (!replay.state || replay.state.id === id)
	const replayBlocker = computed(() => (slots.value.some(s => s.missed) ? replay.blocker : ''))
</script>

<style scoped lang="scss">
	.club-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 0 auto;
		max-width: 32rem;
		padding: 0.75rem 1rem calc(env(safe-area-inset-bottom) + 2rem);
	}

	.club-head {
		align-items: center;
		background: color-mix(in srgb, var(--club-bg) 22%, var(--bg-secondary));
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		display: flex;
		gap: 0.9rem;
		padding: 1rem;

		h1 {
			font-family: var(--font-display);
			font-size: 1.35rem;
			margin: 0;
		}

		p {
			color: var(--text-secondary);
			font-size: 0.85rem;
			margin: 0.15rem 0 0;
		}
	}

	.crest {
		height: 58px;
	}

	.done-note {
		color: var(--tertiary-color);
		font-weight: 800;
		margin: 0;
	}

	.card-grid {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		list-style: none;
		margin: 0;
		padding: 0;

		li {
			display: flex;
			flex-direction: column;
			gap: 0.35rem;
		}
	}

	.replay-btn {
		align-items: center;
		background: color-mix(in srgb, var(--primary-color) 16%, var(--bg-secondary));
		border: 1px solid color-mix(in srgb, var(--primary-color) 40%, transparent);
		border-radius: 0.7rem;
		color: var(--text-primary);
		display: flex;
		font-size: 0.72rem;
		font-weight: 800;
		justify-content: center;
		min-height: 44px;
		text-decoration: none;
	}

	.slot-note {
		color: var(--text-secondary);
		font-size: 0.72rem;
		font-weight: 700;
		text-align: center;
	}

	.footnote {
		color: var(--text-secondary);
		font-size: 0.82rem;
		line-height: 1.5;
		margin: 0;
	}
</style>
