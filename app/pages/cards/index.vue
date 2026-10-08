<template>
	<div class="cards-page">
		<section
			v-if="!current"
			class="intro-card"
		>
			<PlayerCard
				club="Arsenal"
				size="lg"
			/>
			<h2>Player Cards are coming</h2>
			<p>Win the Daily to collect each player's card. Finish a club's set for free hints.</p>
		</section>

		<template v-else>
			<section class="summary-card">
				<p class="season-label">{{ seasonTitle }}</p>
				<p class="summary-headline">{{ ownedCount }} / {{ totalCards }} cards</p>
				<div
					class="bar"
					role="progressbar"
					:aria-valuenow="ownedCount"
					:aria-valuemax="totalCards"
					aria-label="Cards collected"
				>
					<span :style="{ width: `${(ownedCount / Math.max(1, totalCards)) * 100}%` }"></span>
				</div>
				<p class="summary-sub">
					<template v-if="current.state === 'upcoming'">Kicks off {{ startLabel }}. Win the Daily from then to collect every club.</template>
					<template v-else-if="current.state === 'over'">Season complete. New sets with next season's squads.</template>
					<template v-else>{{ setsDone }} of {{ clubs.length }} sets complete · win the Daily to collect today's card</template>
				</p>
			</section>

			<ul class="club-list">
				<li
					v-for="club in clubs"
					:key="club.name"
				>
					<NuxtLink
						:to="`/cards/${club.code.toLowerCase()}`"
						:class="['club-row', { done: club.done }]"
					>
						<span
							class="crest"
							:style="{ background: club.bg, color: club.fg }"
							>{{ club.code }}</span
						>
						<span class="club-text">
							<strong>{{ club.name }}</strong>
							<span
								v-if="club.done"
								class="club-done"
								>Complete · +{{ club.hints }} {{ club.hints === 1 ? 'hint' : 'hints' }} won</span
							>
							<span
								v-else
								class="club-bar"
								><span :style="{ width: `${(club.have / club.size) * 100}%` }"></span
							></span>
						</span>
						<span class="club-count">{{ club.have }}/{{ club.size }}</span>
					</NuxtLink>
				</li>
			</ul>
		</template>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted } from 'vue'
	import PlayerCard from '../../components/cards/PlayerCard.vue'
	import { currentSeason, useCardsStore } from '../../stores/cards'
	import { clubStyle } from '../../utils/clubs'

	// iOS app only: the website has no hint bank, so no cards
	if (!useRuntimeConfig().public.isApp) await navigateTo('/', { replace: true })
	useHead({ title: 'Cards' })

	const cards = useCardsStore()
	onMounted(() => cards.load())

	const current = currentSeason()
	const seasonTitle = current ? `${current.label.replace('-', '/')} season` : ''
	const startLabel = current ? new Date(`${current.season.start}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : ''

	const clubs = computed(() => {
		if (!current) return []
		const owned = cards.ownedIds(current.label)
		return Object.entries(current.season.clubs)
			.map(([name, set]) => {
				const have = set.members.filter(m => owned.has(m)).length
				const style = clubStyle(name)
				return { name, ...style, size: set.size, hints: set.hints, have, done: !!cards.saved.sets[`${current.label}|${name}`] }
			})
			// Closest to finishing first, finished sets last
			.sort((a, b) => Number(a.done) - Number(b.done) || b.have / b.size - a.have / a.size || a.name.localeCompare(b.name))
	})
	const ownedCount = computed(() => clubs.value.reduce((n, c) => n + c.have, 0))
	const totalCards = computed(() => clubs.value.reduce((n, c) => n + c.size, 0))
	const setsDone = computed(() => clubs.value.filter(c => c.done).length)
</script>

<style scoped lang="scss">
	.cards-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 0 auto;
		max-width: 32rem;
		padding: 0.75rem 1rem calc(env(safe-area-inset-bottom) + 6rem);
	}

	.intro-card,
	.summary-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.1rem;
	}

	.intro-card {
		align-items: center;
		text-align: center;

		h2 {
			font-family: var(--font-display);
			margin: 0.5rem 0 0;
		}

		p {
			color: var(--text-secondary);
			margin: 0;
		}
	}

	.season-label {
		color: var(--text-secondary);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		margin: 0;
		text-transform: uppercase;
	}

	.summary-headline {
		font-family: var(--font-display);
		font-size: 1.6rem;
		margin: 0;
	}

	.summary-sub {
		color: var(--text-secondary);
		font-size: 0.85rem;
		margin: 0;
	}

	.bar,
	.club-bar {
		background: var(--color-absent);
		border-radius: 999px;
		display: block;
		height: 8px;
		overflow: hidden;

		span {
			background: var(--color-success);
			border-radius: 999px;
			display: block;
			height: 100%;
		}
	}

	.club-bar {
		height: 6px;
		margin-top: 0.4rem;
	}

	.club-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.club-row {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1rem;
		color: var(--text-primary);
		display: flex;
		gap: 0.75rem;
		min-height: 64px;
		padding: 0 0.9rem;
		text-decoration: none;

		&.done {
			border-color: color-mix(in srgb, var(--tertiary-color) 55%, transparent);
		}
	}

	.crest {
		align-items: center;
		border-radius: 50%;
		display: flex;
		flex-shrink: 0;
		font-size: 0.7rem;
		font-weight: 800;
		height: 40px;
		justify-content: center;
		width: 40px;
	}

	.club-text {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	.club-done {
		color: var(--tertiary-color);
		font-size: 0.78rem;
		font-weight: 700;
	}

	.club-count {
		font-weight: 800;
	}
</style>
