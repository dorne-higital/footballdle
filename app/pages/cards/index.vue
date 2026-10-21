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
			<!-- Today's card: face down until the Daily is won (option B, "collection first") -->
			<section
				v-if="today"
				:class="['today-card', today.state]"
				aria-label="Today's card"
			>
				<div class="today-text">
					<p class="eyebrow">Today's card</p>
					<template v-if="today.state === 'won'">
						<h2>Collected</h2>
						<p>Added to your {{ shortClub(today.club) }} set.</p>
					</template>
					<template v-else-if="today.state === 'lost'">
						<h2>Missed today</h2>
						<p>You can replay it from tomorrow, for a hint.</p>
					</template>
					<template v-else>
						<h2>Win the Daily to collect it</h2>
						<NuxtLink
							to="/play/daily?start=play"
							class="today-play"
						>
							Play the Daily
							<Icon
								name="solar:alt-arrow-right-linear"
								size="1rem"
							/>
						</NuxtLink>
					</template>
				</div>
				<NuxtLink
					v-if="today.state === 'won' && today.owned"
					:to="clubLink(today.club)"
					class="today-face"
				>
					<PlayerCard
						:card="today.info"
						:club="today.club"
						:foil="today.owned.foil"
						:number="today.owned.number"
						size="sm"
					/>
				</NuxtLink>
				<div
					v-else
					class="today-face face-down"
					aria-hidden="true"
				>
					?
				</div>
			</section>

			<section class="season-line">
				<p class="season-label">{{ seasonTitle }}</p>
				<p class="season-count">
					<strong>{{ ownedCount }}</strong> of {{ totalCards }} cards · {{ setsDone }} of {{ clubs.length }} sets
				</p>
				<div
					class="bar"
					role="progressbar"
					:aria-valuenow="ownedCount"
					:aria-valuemax="totalCards"
					aria-label="Cards collected"
				>
					<span :style="{ width: `${(ownedCount / Math.max(1, totalCards)) * 100}%` }"></span>
				</div>
				<p
					v-if="current.state !== 'live'"
					class="season-note"
				>
					<template v-if="current.state === 'upcoming'">Kicks off {{ startLabel }}. Win the Daily from then to collect every club.</template>
					<template v-else>Season complete. New sets with next season's squads.</template>
				</p>
			</section>

			<template v-if="latest.length">
				<h3 class="section-title">
					Your cards <span>{{ ownedCount }}</span>
				</h3>
				<ul
					class="shelf"
					aria-label="Your cards, newest first"
				>
					<li
						v-for="c in latest"
						:key="c.key"
					>
						<NuxtLink :to="clubLink(c.info.club)">
							<PlayerCard
								:card="c.info"
								:club="c.info.club"
								:foil="c.owned.foil"
								:number="c.owned.number"
								size="sm"
							/>
						</NuxtLink>
					</li>
				</ul>
			</template>

			<template v-if="started.length">
				<h3 class="section-title">
					On the go <span>{{ started.length }}</span>
				</h3>
				<ul class="club-list">
					<li
						v-for="club in started"
						:key="club.name"
					>
						<NuxtLink
							:to="clubLink(club.name)"
							class="club-row"
						>
							<ClubCrest
								:club="club.name"
								class="crest"
							/>
							<span class="club-text">
								<strong>{{ club.name }}</strong>
								<span class="club-bar"><span :style="{ width: `${(club.have / club.size) * 100}%` }"></span></span>
							</span>
							<span class="club-count">{{ club.have }}/{{ club.size }}</span>
						</NuxtLink>
					</li>
				</ul>
			</template>

			<template v-if="complete.length">
				<h3 class="section-title">
					Complete <span>{{ complete.length }}</span>
				</h3>
				<ul class="club-list">
					<li
						v-for="club in complete"
						:key="club.name"
					>
						<NuxtLink
							:to="clubLink(club.name)"
							class="club-row done"
						>
							<ClubCrest
								:club="club.name"
								class="crest"
							/>
							<span class="club-text">
								<strong>{{ club.name }}</strong>
								<span class="club-done">Complete · +{{ club.hints }} {{ club.hints === 1 ? 'hint' : 'hints' }} won</span>
							</span>
							<span class="club-count">{{ club.have }}/{{ club.size }}</span>
						</NuxtLink>
					</li>
				</ul>
			</template>

			<template v-if="notStarted.length">
				<h3 class="section-title">
					Still to start <span>{{ notStarted.length }}</span>
				</h3>
				<ul class="crest-grid">
					<li
						v-for="club in notStarted"
						:key="club.name"
					>
						<NuxtLink
							:to="clubLink(club.name)"
							:aria-label="`${club.name}, 0 of ${club.size} cards`"
						>
							<ClubCrest
								:club="club.name"
								class="crest"
							/>
							<span>0/{{ club.size }}</span>
						</NuxtLink>
					</li>
				</ul>
			</template>
		</template>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted } from 'vue'
	import PlayerCard from '../../components/cards/PlayerCard.vue'
	import { cardForDay, currentSeason, useCardsStore } from '../../stores/cards'
	import { getUKDateString } from '../../utils/dateStreak'
	import { clubStyle } from '../../utils/clubs'
	import ClubCrest from '../../components/cards/ClubCrest.vue'

	// iOS app only: the website has no hint bank, so no cards
	if (!useRuntimeConfig().public.appShell) await navigateTo('/', { replace: true })
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
	const started = computed(() => clubs.value.filter(c => c.have > 0 && !c.done))
	const complete = computed(() => clubs.value.filter(c => c.done))
	const notStarted = computed(() => clubs.value.filter(c => c.have === 0 && !c.done))
	const clubLink = (name: string) => `/cards/${clubStyle(name).code.toLowerCase()}`
	const shortClub = (name: string) => name.replace(' & Hove Albion', '')

	// Every card owned this season, newest day first (a replay sits on its own day)
	const latest = computed(() => {
		if (!current) return []
		return Object.entries(cards.saved.cards)
			.filter(([, c]) => c.season === current.label)
			.map(([key, owned]) => ({ key, owned, info: current.season.cards[owned.id]! }))
			.filter(c => c.info)
			.sort((a, b) => b.owned.puzzle - a.owned.puzzle)
	})

	// Today's card: whether today gives one, and if so won, lost or still to play
	const today = computed(() => {
		const dateStr = getUKDateString()
		const day = cardForDay(dateStr)
		if (!day || !current || day.season !== current.label) return null
		const owned = cards.saved.cards[dateStr]
		const state = owned ? 'won' : cards.saved.played[dateStr] ? 'lost' : 'new'
		return { state, owned, info: day.card, club: day.card.club }
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
	.today-card,
	.season-line {
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

	// Today's card: the one thing to do on this tab, so it leads
	.today-card {
		align-items: center;
		border-color: color-mix(in srgb, var(--primary-color) 35%, var(--border));
		flex-direction: row;
		gap: 1rem;
		justify-content: space-between;

		&.lost {
			border-color: var(--border);
		}
	}

	.today-text {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;

		.eyebrow {
			color: var(--primary-color);
			font-size: 0.72rem;
			font-weight: 800;
			letter-spacing: 0.14em;
			margin: 0;
			text-transform: uppercase;
		}

		h2 {
			font-family: var(--font-display);
			font-size: 1.15rem;
			line-height: 1.15;
			margin: 0;
		}

		p {
			color: var(--text-secondary);
			font-size: 0.85rem;
			margin: 0;
		}
	}

	.today-play {
		align-items: center;
		align-self: flex-start;
		background: var(--primary-color);
		border-radius: 999px;
		color: var(--on-primary);
		display: inline-flex;
		font-size: 0.85rem;
		font-weight: 800;
		gap: 0.25rem;
		margin-top: 0.35rem;
		padding: 0.45rem 0.9rem;
		text-decoration: none;
	}

	.today-face {
		flex-shrink: 0;
		width: 4.6rem;
	}

	.face-down {
		align-items: center;
		aspect-ratio: 5 / 7;
		border: 2px dashed color-mix(in srgb, var(--primary-color) 70%, transparent);
		border-radius: 12px;
		color: var(--primary-color);
		display: flex;
		font-family: var(--font-display);
		font-size: 1.6rem;
		justify-content: center;

		.lost & {
			border-color: var(--border);
			color: var(--text-secondary);
		}
	}

	.season-line {
		gap: 0.45rem;
		padding: 0.9rem 1.1rem;
	}

	.season-count {
		color: var(--text-secondary);
		font-size: 0.85rem;
		margin: 0;

		strong {
			color: var(--text-primary);
			font-family: var(--font-display);
			font-size: 1.15rem;
		}
	}

	.season-note {
		color: var(--text-secondary);
		font-size: 0.8rem;
		margin: 0;
	}

	.section-title {
		align-items: baseline;
		display: flex;
		font-size: 0.75rem;
		font-weight: 800;
		justify-content: space-between;
		letter-spacing: 0.14em;
		margin: 0.4rem 0.15rem -0.4rem;
		text-transform: uppercase;

		span {
			color: var(--text-secondary);
		}
	}

	// Your cards: a sideways shelf inside its own box (the page itself never scrolls sideways)
	.shelf {
		display: flex;
		gap: 0.6rem;
		list-style: none;
		margin: 0 -1rem;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		padding: 0.25rem 1rem 0.5rem;
		// Snap to the page's side margin, not the screen edge
		scroll-padding-inline: 1rem;
		scroll-snap-type: x proximity;

		li {
			// Wide enough for a six-letter surname in tiles, so every card is the same size
			flex: 0 0 6.4rem;
			min-width: 0;
			scroll-snap-align: start;
		}

		a {
			display: block;
		}
	}

	.crest-grid {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		list-style: none;
		margin: 0;
		padding: 0;

		a {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 0.9rem;
			color: var(--text-secondary);
			display: flex;
			flex-direction: column;
			font-size: 0.72rem;
			font-weight: 800;
			gap: 0.25rem;
			padding: 0.55rem 0.2rem 0.45rem;
			text-decoration: none;
		}

		.crest {
			filter: grayscale(0.55);
			height: 34px;
			opacity: 0.6;
			width: 31px;
		}
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
		height: 44px;
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
