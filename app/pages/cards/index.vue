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

		<!-- Never collected a card: what collecting is, not a checklist of 0/7s -->
		<section
			v-else-if="firstCard"
			class="first-card"
			aria-labelledby="first-card-title"
		>
			<p class="eyebrow">Player Cards</p>
			<h2 id="first-card-title">Start your collection</h2>
			<p class="lead">
				{{ totalCards }} players, {{ clubs.length }} clubs, one card a day. Win the Daily to collect that day's player.
			</p>
			<PlayerCard
				:card="SAMPLE_CARD"
				:club="SAMPLE_CARD.club"
				foil
				size="lg"
				class="sample"
				aria-label="Sample shiny Player Card"
			/>
			<ul class="perks">
				<li>
					<Icon
						name="solar:stars-linear"
						size="1.2rem"
						aria-hidden="true"
					/>
					<span>Win in 2 guesses or fewer and it's shiny.</span>
				</li>
				<li>
					<Icon
						name="solar:shield-star-linear"
						size="1.2rem"
						aria-hidden="true"
					/>
					<span>Finish a club's set for up to {{ maxSetHints }} hints.</span>
				</li>
				<li>
					<Icon
						name="solar:restart-linear"
						size="1.2rem"
						aria-hidden="true"
					/>
					<span>
						Missed a day? Replay it later for a hint, free with Pro.
						<span
							v-if="missed.length"
							class="perk-note"
							>{{ missed.length }} {{ missed.length === 1 ? 'card' : 'cards' }} to catch up on so far.</span
						>
					</span>
				</li>
			</ul>
			<NuxtLink
				v-if="current.state === 'live' && today?.state !== 'lost'"
				to="/play/daily?start=play"
				class="today-play"
			>
				Play today's Daily
				<Icon
					name="solar:alt-arrow-right-linear"
					size="1rem"
				/>
			</NuxtLink>
			<NuxtLink
				v-else-if="today?.state === 'lost' && chosen && !replay.blocker"
				:to="`/cards/replay/${chosen.id}`"
				class="today-play"
				>Replay a missed card · {{ replayCost }}</NuxtLink
			>
			<p
				v-else-if="today?.state === 'lost'"
				class="season-note"
			>
				Today's card got away. Win tomorrow's Daily for your first card.
				<template v-if="missed.length && replay.blocker"><br />{{ replay.blocker }}</template>
			</p>
			<p
				v-else-if="current.state === 'upcoming'"
				class="season-note"
			>
				Kicks off {{ startLabel }}. Win the Daily from then to collect every club.
			</p>
		</section>

		<template v-else-if="ready">
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
						<p v-if="today.comesBack">It comes round again later in the season.</p>
						<p v-else>You can replay it from tomorrow, for a hint.</p>
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

			<!-- Missed cards, oldest first: face down with a dashed edge, the club and the day.
			     One replay a day, once today's Daily is finished -->
			<section
				v-if="missed.length"
				id="missed"
				ref="missedRow"
				class="missed-row"
				aria-labelledby="missed-title"
			>
				<h3
					id="missed-title"
					class="section-title"
				>
					Missed <span>{{ missed.length }}</span>
				</h3>
				<ul
					class="shelf"
					aria-label="Missed cards, oldest first"
				>
					<li
						v-for="m in missedShown"
						:key="m.id"
					>
						<button
							type="button"
							:class="['missed-pick', { on: chosen?.id === m.id }]"
							:aria-pressed="chosen?.id === m.id"
							:aria-label="`Missed ${m.club} card, ${dayLabelLong(m.date)}`"
							:disabled="!!replay.state && replay.state.id !== m.id"
							@click="picked = m.id"
						>
							<PlayerCard
								:club="m.club"
								missed
								size="sm"
								aria-hidden="true"
							/>
							<span class="missed-date">{{ dayLabel(m.date) }}</span>
						</button>
					</li>
					<li
						v-if="missed.length > missedShown.length"
						class="missed-more"
					>
						and {{ missed.length - missedShown.length }} more
					</li>
				</ul>
				<NuxtLink
					v-if="!replay.blocker && chosen"
					:to="`/cards/replay/${chosen.id}`"
					class="today-play replay-go"
					:aria-label="replayAria"
					>{{ replayLabel }}</NuxtLink
				>
				<p
					v-else
					class="season-note"
				>
					{{ replay.blocker }}
				</p>
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
								<span
									v-if="club.missed"
									class="club-missed"
									>{{ club.missed }} missed</span
								>
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
							:aria-label="`${club.name}, 0 of ${club.size} cards${club.missed ? `, ${club.missed} missed` : ''}`"
						>
							<ClubCrest
								:club="club.name"
								class="crest"
							/>
							<span>0/{{ club.size }}</span>
							<span
								v-if="club.missed"
								class="crest-missed"
								>{{ club.missed }} missed</span
							>
						</NuxtLink>
					</li>
				</ul>
			</template>
		</template>
	</div>
</template>

<script setup lang="ts">
	import { trackScreen } from '../../utils/appGlance'
	import { computed, onMounted, ref } from 'vue'
	import PlayerCard from '../../components/cards/PlayerCard.vue'
	import { cardForDay, currentSeason, lastDayOf, useCardsStore } from '../../stores/cards'
	import { useReplayStore } from '../../stores/replay'
	import { usePurchasesStore } from '../../stores/purchases'
	import { getPuzzleNumber } from '../../composables/useFootballers'
	import { getUKDateString } from '../../utils/dateStreak'
	import { SAMPLE_CARD, clubStyle } from '../../utils/clubs'
	import ClubCrest from '../../components/cards/ClubCrest.vue'

	// iOS app only: the website has no hint bank, so no cards
	if (!useRuntimeConfig().public.appShell) await navigateTo('/', { replace: true })
	useHead({ title: 'Cards' })

	const cards = useCardsStore()
	const replay = useReplayStore()
	const purchases = usePurchasesStore()
	const route = useRoute()
	const missedRow = ref<HTMLElement | null>(null)
	// Saved cards load on the client: wait, or a collector sees the first-card screen flash
	const ready = ref(false)
	onMounted(() => {
		trackScreen('cards')
		cards.load()
		replay.load()
		ready.value = true
		// From the full-time panel's "Today's replay is unlocked" line
		if (route.hash === '#missed') {
			const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
			requestAnimationFrame(() => missedRow.value?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' }))
		}
	})

	const current = currentSeason()
	const seasonTitle = current ? `${current.label.replace('-', '/')} season` : ''
	const startLabel = current ? new Date(`${current.season.start}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : ''

	const clubs = computed(() => {
		if (!current) return []
		const owned = cards.ownedIds(current.label)
		const missedSet = cards.missedIds(current.label)
		return Object.entries(current.season.clubs)
			.map(([name, set]) => {
				const have = set.members.filter(m => owned.has(m)).length
				const missed = set.members.filter(m => missedSet.has(m)).length
				const style = clubStyle(name)
				return { name, ...style, size: set.size, hints: set.hints, have, missed, done: !!cards.saved.sets[`${current.label}|${name}`] }
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
		// A card on more than one day can only be replayed after its last one
		const comesBack = lastDayOf(current.season, day.id) > getPuzzleNumber(dateStr)
		return { state, owned, info: day.card, club: day.card.club, comesBack }
	})

	// Missed cards: the shelf draws the 30 oldest (each is a full card), the count says how many
	const MISSED_SHOWN = 30
	const missed = computed(() => (current ? cards.missedCards(current.label) : []))
	const missedShown = computed(() => missed.value.slice(0, MISSED_SHOWN))
	const picked = ref<string | null>(null)
	// One replay a day: a replay already started today is the only one the button offers
	const chosen = computed(() => missed.value.find(m => m.id === (replay.state?.id ?? picked.value)) ?? missed.value[0])
	const dayLabel = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
	const dayLabelLong = (d: Date) =>
		d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
	const replayCost = computed(() => (purchases.isPro ? 'free with Pro' : '1 hint'))
	const replayLabel = computed(() =>
		replay.state || !chosen.value
			? 'Carry on your replay'
			: `Replay ${shortClub(chosen.value.club)} · ${dayLabel(chosen.value.date)} · ${replayCost.value}`,
	)
	const replayAria = computed(() =>
		replay.state || !chosen.value
			? 'Carry on your replay'
			: `Replay the ${chosen.value.club} card from ${dayLabelLong(chosen.value.date)}, ${replayCost.value}`,
	)

	// Never collected a card (any season; a card awaiting its date check counts)
	const firstCard = computed(() => ready.value && !!current && current.state !== 'over' && cards.totalOwned === 0)
	const maxSetHints = computed(() => Math.max(0, ...clubs.value.map(c => c.hints)))

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
	.first-card,
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

	.first-card {
		align-items: center;
		gap: 0.6rem;
		text-align: center;

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
			font-size: 1.5rem;
			margin: 0;
		}

		.lead {
			color: var(--text-secondary);
			font-size: 0.9rem;
			margin: 0 0 0.2rem;
		}

		.today-play {
			align-self: center;
			font-size: 0.95rem;
			padding: 0.65rem 1.2rem;
		}

		.season-note {
			text-align: center;
		}
	}

	.perks {
		display: grid;
		gap: 0.55rem;
		list-style: none;
		margin: 0.6rem 0 0;
		padding: 0;
		text-align: left;

		li {
			align-items: flex-start;
			color: var(--text-secondary);
			display: flex;
			font-size: 0.9rem;
			gap: 0.6rem;
			line-height: 1.35;
		}

		.iconify,
		svg {
			color: var(--primary-color);
			flex-shrink: 0;
		}

		.perk-note {
			color: var(--text-primary);
			display: block;
			font-weight: 700;
			margin-top: 0.15rem;
		}
	}

	// A smaller sample than a real card, so the button clears the tab bar on a phone
	.first-card .player-card.lg {
		width: 168px;
	}

	@media (max-height: 700px) {
		.first-card .player-card.lg {
			width: 140px;
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

	// Same width as the shelf cards: narrower and a six-letter surname's tiles spill off both edges
	.today-face {
		flex-shrink: 0;
		width: 6.4rem;
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

	.missed-row {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;

		.shelf li {
			display: flex;
		}
	}

	.missed-pick {
		background: none;
		border: 0;
		border-radius: 14px;
		color: inherit;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		font: inherit;
		gap: 0.3rem;
		min-height: 44px;
		padding: 2px;
		width: 100%;

		// Selected is a solid ring; missed itself is the card's dashed edge
		&.on {
			outline: 2px solid var(--primary-color);
			outline-offset: 2px;
		}

		&:disabled {
			cursor: default;
			opacity: 0.45;
		}
	}

	.missed-date {
		color: var(--text-secondary);
		font-size: 0.72rem;
		font-weight: 800;
		text-align: center;
	}

	.missed-more {
		align-items: center;
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-weight: 700;
		justify-content: center;
		text-align: center;
	}

	.replay-go {
		align-self: stretch;
		justify-content: center;
		margin-top: 0;
		min-height: 44px;
	}

	.club-missed,
	.crest-missed {
		color: var(--text-secondary);
		font-size: 0.72rem;
		font-weight: 700;
	}

	.club-missed {
		margin-top: 0.25rem;
	}
</style>
