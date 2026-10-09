<template>
	<div class="climb-page">
		<!-- Set up Your FC -->
		<section
			v-if="climb.nextUp === 'setup'"
			class="panel setup"
		>
			<p class="eyebrow">The Climb</p>
			<h1>Start at the bottom. Finish in the Champions League.</h1>
			<p class="muted">Name your club and pick its colours. You start in the National League; win matches of Odd One Out to climb the table, one league at a time.</p>

			<div class="setup-preview">
				<ClubCrest
					club="Your club"
					:custom="draft"
					class="setup-crest"
				/>
				<strong>{{ draft.name || 'Your FC' }}</strong>
			</div>

			<label
				class="field-label"
				for="climb-club-name"
				>Club name</label
			>
			<input
				id="climb-club-name"
				v-model="clubName"
				class="name-input"
				maxlength="20"
				autocomplete="off"
				placeholder="Your FC"
			/>

			<p class="field-label">Colours</p>
			<div
				class="swatches"
				role="radiogroup"
				aria-label="Club colours"
			>
				<button
					v-for="(kit, i) in KITS"
					:key="i"
					type="button"
					role="radio"
					:aria-checked="kitIndex === i"
					:aria-label="kit.label"
					:class="['swatch', { on: kitIndex === i }]"
					:style="{ background: `linear-gradient(135deg, ${kit.bg} 55%, ${kit.alt} 55%)` }"
					@click="kitIndex = i"
				></button>
			</div>

			<p class="field-label">Badge</p>
			<div
				class="shapes"
				role="radiogroup"
				aria-label="Badge shape"
			>
				<button
					v-for="shape in SHAPES"
					:key="shape"
					type="button"
					role="radio"
					:aria-checked="draftShape === shape"
					:class="['shape-btn', { on: draftShape === shape }]"
					@click="draftShape = shape"
				>
					<ClubCrest
						club="Your club"
						:custom="{ ...draft, shape }"
						class="shape-crest"
					/>
				</button>
			</div>

			<button
				type="button"
				class="primary-btn"
				@click="start"
			>
				Kick off in the National League
			</button>
		</section>

		<!-- End of a season -->
		<section
			v-else-if="climb.nextUp === 'season-end' && end"
			class="panel season-end"
		>
			<p class="eyebrow">{{ TIER_NAMES[end.tier] }} · season over</p>
			<Icon
				:name="end.title ? 'solar:cup-star-bold' : end.next > end.tier ? 'solar:arrow-up-bold' : end.next < end.tier ? 'solar:arrow-down-bold' : 'solar:refresh-bold'"
				:class="['end-icon', end.title ? 'gold' : end.next < end.tier ? 'down' : '']"
				aria-hidden="true"
			/>
			<h1>{{ endHeadline }}</h1>
			<p class="muted">{{ endDetail }}</p>
			<p
				v-if="end.hints"
				class="reward"
			>
				<Icon
					name="solar:lightbulb-bolt-bold"
					size="1.1rem"
				/>
				{{ end.hints }} free {{ end.hints === 1 ? 'hint' : 'hints' }} added to your bank
			</p>
			<p
				v-if="end.capped"
				class="muted small"
			>
				{{ TIER_NAMES[end.tier + 1] }} opens in a coming update. Until then, go again in {{ TIER_NAMES[end.next] }}.
			</p>
			<button
				type="button"
				class="primary-btn"
				@click="climb.startNextSeason()"
			>
				Start next season in {{ TIER_NAMES[end.next] }}
			</button>
		</section>

		<!-- A season in progress -->
		<template v-else-if="climb.season">
			<header class="season-head">
				<div>
					<p class="eyebrow">The Climb · season {{ climb.saved.seasons }}</p>
					<h1>{{ climb.tierName }}</h1>
				</div>
				<p
					v-if="climb.nextFixture"
					class="mw-chip"
				>
					{{ climb.nextFixture.label }}
				</p>
			</header>

			<p
				v-if="last"
				:class="['last-result', `res-${last.result.toLowerCase()}`]"
			>
				<strong>{{ last.result === 'W' ? 'Won' : last.result === 'D' ? 'Drew' : 'Lost' }} {{ last.score[0] }}-{{ last.score[1] }}</strong>
				against {{ climb.clubOf(last.opponent)?.name }}
				<template v-if="last.pens"> ({{ last.pens.won ? 'won' : 'lost' }} {{ last.pens.yours }}-{{ last.pens.theirs }} on penalties)</template>
				<template v-else-if="last.posAfter !== last.posBefore"> · now {{ ordinal(last.posAfter) }}</template>
			</p>

			<div
				class="table panel"
				role="table"
				:aria-label="`${climb.tierName} table`"
			>
				<div
					class="row head"
					role="row"
				>
					<span role="columnheader">#</span><span></span><span role="columnheader">Club</span><span
						class="n"
						role="columnheader"
						>P</span
					><span
						class="n"
						role="columnheader"
						>GD</span
					><span
						class="n"
						role="columnheader"
						>Pts</span
					>
				</div>
				<div
					v-for="(row, i) in climb.rows"
					:key="row.id"
					:class="['row', { you: row.id === YOU, promo: i === 0, playoff: i === 1 && climb.tier < 4, europe: climb.tier === 4 && i === 3, drop: relegationLine === i }]"
					role="row"
				>
					<span class="pos">{{ i + 1 }}</span>
					<ClubCrest
						v-if="climb.clubOf(row.id)"
						club="club"
						:custom="climb.clubOf(row.id)"
						class="row-crest"
					/>
					<span class="club-name">{{ climb.clubOf(row.id)?.name }}</span>
					<span class="n">{{ row.played }}</span>
					<span class="n">{{ row.gd > 0 ? '+' : '' }}{{ row.gd }}</span>
					<span class="n pts">{{ row.points }}</span>
				</div>
				<p class="legend">{{ legend }}</p>
			</div>

			<section
				v-if="climb.nextFixture"
				class="panel fixture"
			>
				<p class="eyebrow">{{ fixtureEyebrow }}</p>
				<div class="vs">
					<div class="side">
						<ClubCrest
							club="you"
							:custom="climb.saved.club!"
							class="vs-crest"
						/>
						<strong>{{ climb.saved.club!.name }}</strong>
					</div>
					<span class="vs-word">vs</span>
					<div class="side">
						<ClubCrest
							club="opponent"
							:custom="climb.nextFixture.opponent"
							class="vs-crest"
						/>
						<strong>{{ climb.nextFixture.opponent.name }}</strong>
					</div>
				</div>
				<div class="targets">
					<span class="t w"><span class="t-label">Win</span><b>{{ climb.nextFixture.targets.win }}-10</b></span>
					<span class="t d"><span class="t-label">Draw</span><b>{{ climb.nextFixture.targets.draw }}-{{ climb.nextFixture.targets.win - 1 }}</b></span>
					<span class="t l"><span class="t-label">Loss</span><b>0-{{ climb.nextFixture.targets.draw - 1 }}</b></span>
				</div>
				<p
					v-if="climb.nextFixture.standing !== 'mid'"
					class="muted small center"
				>
					{{ climb.nextFixture.standing === 'top' ? 'A top-two side: one more right answer needed than usual.' : 'Bottom of the table: one fewer right answer needed.' }}
				</p>
				<NuxtLink
					to="/climb/match"
					class="primary-btn"
					@click="kickOff"
				>
					{{ climb.saved.live ? 'Resume match' : 'Kick off' }}
					<span class="btn-sub">10 questions</span>
				</NuxtLink>
			</section>

			<section class="panel trophy-cards">
				<div class="cards-head">
					<p class="eyebrow">Trophy cards</p>
					<p class="count">{{ trophiesWon }} of {{ TROPHY_CARDS.length }}</p>
				</div>
				<ul class="trophy-grid">
					<li
						v-for="t in trophyCards"
						:key="t.id"
						:class="['trophy-card', t.won ? `won ${t.style}` : 'locked']"
						:aria-label="t.won ? `${t.name}, won ${t.count} ${t.count === 1 ? 'time' : 'times'}` : `${t.name}, locked: ${t.how}`"
					>
						<span class="t-icon">
							<Icon
								:name="t.won ? t.icon : 'solar:lock-keyhole-minimalistic-bold'"
								size="1.6rem"
							/>
						</span>
						<span class="t-name">{{ t.name }}</span>
						<span class="t-meta">{{ t.won ? (t.count > 1 ? `Won ×${t.count}` : `Season ${t.first}`) : t.how }}</span>
					</li>
				</ul>
				<p :class="['set-bonus', { paid: climb.saved.setBonusPaid }]">
					<Icon
						name="solar:lightbulb-bolt-bold"
						size="1rem"
					/>
					{{ climb.saved.setBonusPaid ? `Full set! ${SET_BONUS_HINTS} bonus hints added to your bank` : `Collect all ${TROPHY_CARDS.length} for ${SET_BONUS_HINTS} bonus hints` }}
				</p>
			</section>
		</template>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'
	import ClubCrest from '../../components/cards/ClubCrest.vue'
	import { SET_BONUS_HINTS, TROPHY_CARDS, useClimbStore, type YourClub } from '../../stores/climb'
	import { TIER_NAMES } from '../../utils/climb/questions'
	import { YOU } from '../../utils/climb/league'
	import { useHaptics } from '../../composables/useHaptics'

	const { isApp, climbEnabled } = useRuntimeConfig().public
	if (!isApp || !climbEnabled) await navigateTo('/', { replace: true })
	useHead({ title: 'The Climb' })

	const climb = useClimbStore()
	const haptics = useHaptics()
	onMounted(() => climb.load())

	const KITS = [
		{ label: 'Green and white', bg: '#14a35c', fg: '#ffffff', alt: '#ffffff' },
		{ label: 'Red and white', bg: '#c8102e', fg: '#ffffff', alt: '#ffffff' },
		{ label: 'Blue and white', bg: '#1d4ed8', fg: '#ffffff', alt: '#ffffff' },
		{ label: 'Claret and blue', bg: '#6b1d3a', fg: '#ffffff', alt: '#8fc3ea' },
		{ label: 'Black and gold', bg: '#111111', fg: '#f2c94c', alt: '#f2c94c' },
		{ label: 'Amber and black', bg: '#f2a516', fg: '#111111', alt: '#111111' },
		{ label: 'Sky and navy', bg: '#6cb4e6', fg: '#0b1f3a', alt: '#0b1f3a' },
		{ label: 'White and navy', bg: '#f5f5f5', fg: '#0b1f3a', alt: '#0b1f3a' },
	]
	const SHAPES = ['shield', 'round', 'square'] as const

	const clubName = ref('')
	const kitIndex = ref(0)
	const draftShape = ref<(typeof SHAPES)[number]>('shield')

	function codeFor(name: string): string {
		const words = name.toUpperCase().replace(/[^A-Z ]/g, '').split(' ').filter(Boolean)
		if (!words.length) return 'YFC'
		if (words.length === 1) return words[0]!.slice(0, 3)
		return words.map(w => w[0]).join('').slice(0, 3)
	}

	const draft = computed<YourClub>(() => {
		const kit = KITS[kitIndex.value]!
		const name = clubName.value.trim()
		return { name: name || 'Your FC', code: codeFor(name || 'Your FC'), bg: kit.bg, fg: kit.fg, alt: kit.alt, shape: draftShape.value, pattern: 'band' }
	})

	function kickOff() {
		haptics.tap()
		climb.kickOff()
	}

	function start() {
		haptics.success()
		climb.createClub(draft.value)
	}

	const last = computed(() => climb.saved.last)
	const end = computed(() => climb.saved.end)

	const endHeadline = computed(() => {
		const e = end.value
		if (!e) return ''
		if (e.clRound === 'Winners') return 'Champions of Europe!'
		if (e.title) return `${TIER_NAMES[e.tier]} champions!`
		if (e.clRound) return `Out in the ${e.clRound.toLowerCase()}`
		if (e.playoffWon) return 'Promoted through the play-off!'
		if (e.outcome.kind === 'europe') return 'Into the Champions League!'
		if (e.outcome.kind === 'relegated') return 'Relegated'
		if (e.outcome.kind === 'playoff') return 'Beaten in the play-off final'
		return `Finished ${ordinal(e.outcome.position)}`
	})
	const endDetail = computed(() => {
		const e = end.value
		if (!e) return ''
		if (e.clRound === 'Winners') return 'You climbed from the National League to the top of Europe. The title badge is in your cabinet.'
		if (e.title) return 'The title badge is in your cabinet.'
		if (e.next > e.tier) return `Next season: ${TIER_NAMES[e.next]}.`
		if (e.next < e.tier) return `Next season: ${TIER_NAMES[e.next]}. Win it to come straight back up.`
		return `Another season in ${TIER_NAMES[e.next]}. Finish top to go up.`
	})

	const relegationLine = computed(() => {
		const n = climb.rows.length
		if (climb.tier === 0 || climb.tier === climb.CL_TIER) return -1
		return climb.tier === 4 ? n - 3 : n - 1
	})
	const legend = computed(() => {
		if (climb.tier === climb.CL_TIER) return 'Top two go through to the quarter-finals'
		if (climb.tier === 4) return 'Champions and top 4: Champions League · bottom 3 go down'
		if (climb.tier === 0) return 'Champions go up · 2nd plays the play-off final'
		return 'Champions go up · 2nd plays the play-off final · bottom goes down'
	})
	const fixtureEyebrow = computed(() => {
		const f = climb.nextFixture
		if (!f) return ''
		if (climb.nextUp !== 'league') return `${f.label} · one match, draws go to penalties`
		return `Next · ${f.home ? 'home' : 'away'}`
	})

	// Bronze to gold up the leagues, a European blue for the Champions League, purple specials
	const TIER_STYLE = ['bronze', 'bronze', 'silver', 'silver', 'gold', 'europe']
	const ICONS: Record<string, string> = { playoff: 'solar:ranking-bold', invincibles: 'solar:shield-check-bold', perfect: 'solar:target-bold' }
	const trophyCards = computed(() =>
		TROPHY_CARDS.map(t => {
			const won = climb.saved.trophies?.[t.id]
			return {
				...t,
				won: !!won,
				count: won?.count ?? 0,
				first: won?.first ?? 0,
				style: t.kind === 'title' ? TIER_STYLE[t.tier] : 'special',
				icon: t.kind === 'title' ? (t.tier === 5 ? 'solar:star-shine-bold' : 'solar:cup-star-bold') : (ICONS[t.id] ?? 'solar:medal-ribbon-bold'),
			}
		}),
	)
	const trophiesWon = computed(() => trophyCards.value.filter(t => t.won).length)

	function ordinal(n: number): string {
		const s = ['th', 'st', 'nd', 'rd']
		const v = n % 100
		return n + (s[(v - 20) % 10] || s[v] || s[0]!)
	}
</script>

<style scoped lang="scss">
	.climb-page {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		margin: 0 auto;
		max-width: 32rem;
		padding: 0.75rem 1rem calc(env(safe-area-inset-bottom) + 2rem);
	}

	.panel {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 1.1rem;
	}

	.eyebrow {
		color: var(--primary-color);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		margin: 0;
		text-transform: uppercase;
	}

	h1 {
		font-family: var(--font-display);
		font-size: 1.6rem;
		line-height: 1.1;
		margin: 0;
		text-wrap: balance;
	}

	.muted {
		color: var(--text-secondary);
		margin: 0;
	}

	.small {
		font-size: 0.85rem;
	}

	.center {
		text-align: center;
	}

	.primary-btn {
		align-items: center;
		background: var(--color-success);
		border: 0;
		border-radius: 1rem;
		color: var(--on-success, #04130b);
		cursor: pointer;
		display: flex;
		font: inherit;
		font-family: var(--font-display);
		font-size: 1.05rem;
		gap: 0.6rem;
		justify-content: center;
		margin-top: 0.4rem;
		min-height: 54px;
		padding: 0 1.2rem;
		text-decoration: none;

		&:active {
			transform: scale(0.98);
		}

		.btn-sub {
			font-family: var(--font-body, inherit);
			font-size: 0.8rem;
			font-weight: 800;
			opacity: 0.75;
		}
	}

	// Setup
	.setup-preview {
		align-items: center;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.4rem 0;

		strong {
			font-family: var(--font-display);
			font-size: 1.2rem;
		}
	}

	.setup-crest {
		height: 5rem;
	}

	.field-label {
		color: var(--text-secondary);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		margin: 0.4rem 0 0;
		text-transform: uppercase;
	}

	.name-input {
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		color: var(--text-primary);
		font: inherit;
		font-size: 1rem;
		font-weight: 700;
		min-height: 48px;
		padding: 0 0.9rem;

		&:focus {
			border-color: var(--primary-color);
			outline: none;
		}
	}

	.swatches,
	.shapes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.swatch {
		border: 2px solid var(--border);
		border-radius: 50%;
		cursor: pointer;
		height: 44px;
		width: 44px;

		&.on {
			border-color: var(--text-primary);
			box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 35%, transparent);
		}
	}

	.shape-btn {
		align-items: center;
		background: var(--bg-primary);
		border: 2px solid var(--border);
		border-radius: 0.9rem;
		cursor: pointer;
		display: flex;
		height: 60px;
		justify-content: center;
		width: 60px;

		&.on {
			border-color: var(--primary-color);
		}
	}

	.shape-crest {
		height: 2.4rem;
	}

	// Season end
	.season-end {
		align-items: center;
		text-align: center;
	}

	.end-icon {
		color: var(--primary-color);
		font-size: 3.5rem;

		&.gold {
			color: var(--tertiary-color, #f2b84b);
		}

		&.down {
			color: var(--color-error, #ef5b5b);
		}
	}

	.reward {
		align-items: center;
		background: color-mix(in srgb, var(--tertiary-color, #f2b84b) 14%, transparent);
		border-radius: 999px;
		display: inline-flex;
		font-weight: 800;
		gap: 0.4rem;
		margin: 0;
		padding: 0.45rem 0.9rem;
	}

	// Season
	.season-head {
		align-items: flex-end;
		display: flex;
		gap: 0.75rem;
		justify-content: space-between;
	}

	.mw-chip {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		font-size: 0.8rem;
		font-weight: 800;
		margin: 0;
		padding: 0.45rem 0.7rem;
		text-align: right;
		white-space: nowrap;
	}

	.last-result {
		border-radius: 0.9rem;
		font-size: 0.9rem;
		margin: 0;
		padding: 0.6rem 0.85rem;

		&.res-w {
			background: color-mix(in srgb, var(--color-success) 16%, transparent);
		}

		&.res-d {
			background: color-mix(in srgb, var(--color-present) 18%, transparent);
		}

		&.res-l {
			background: color-mix(in srgb, var(--color-error, #ef5b5b) 14%, transparent);
		}
	}

	.table {
		gap: 0;
		padding: 0.4rem 0;
	}

	.club-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.row {
		align-items: center;
		border-top: 1px solid var(--border);
		display: grid;
		font-size: 0.85rem;
		font-weight: 700;
		gap: 0.4rem;
		grid-template-columns: 1.4rem 1.6rem minmax(0, 1fr) 1.8rem 2.2rem 2.2rem;
		min-height: 2.5rem;
		padding: 0 0.8rem;

		&.head {
			border-top: 0;
			color: var(--text-secondary);
			font-size: 0.65rem;
			letter-spacing: 0.1em;
			min-height: 1.8rem;
			text-transform: uppercase;
		}

		&.you {
			background: color-mix(in srgb, var(--primary-color) 14%, transparent);

			.club-name {
				color: var(--primary-color);
			}
		}

		&.playoff + .row,
		&.europe + .row {
			border-top: 1px dashed color-mix(in srgb, var(--primary-color) 60%, transparent);
		}

		&.drop {
			border-top: 1px dashed color-mix(in srgb, var(--color-error, #ef5b5b) 70%, transparent);
		}

		.n {
			font-variant-numeric: tabular-nums;
			text-align: right;
		}

		.pts {
			font-family: var(--font-display);
		}
	}

	.pos {
		color: var(--text-secondary);
	}

	.row-crest {
		height: 1.5rem;
	}

	.legend {
		border-top: 1px solid var(--border);
		color: var(--text-secondary);
		font-size: 0.72rem;
		font-weight: 700;
		margin: 0;
		padding: 0.6rem 0.8rem 0.3rem;
	}

	.fixture {
		border-color: color-mix(in srgb, var(--tertiary-color, #f2b84b) 50%, transparent);
	}

	.vs {
		align-items: center;
		display: grid;
		gap: 0.5rem;
		grid-template-columns: 1fr auto 1fr;
	}

	.side {
		align-items: center;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		text-align: center;

		strong {
			font-size: 0.9rem;
		}
	}

	.vs-crest {
		height: 3rem;
	}

	.vs-word {
		color: var(--text-secondary);
		font-family: var(--font-display);
	}

	.targets {
		display: grid;
		gap: 0.4rem;
		grid-template-columns: repeat(3, 1fr);
	}

	// Right answers needed: a soft tint per result, label on top, the range in the result colour
	.t {
		--tint: var(--text-secondary);

		background: color-mix(in srgb, var(--tint) 13%, var(--bg-primary));
		border: 1px solid color-mix(in srgb, var(--tint) 35%, transparent);
		border-radius: 0.8rem;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		padding: 0.5rem 0.3rem;
		text-align: center;

		b {
			color: var(--tint);
			font-family: var(--font-display);
			font-size: 1.1rem;
		}

		&.w {
			--tint: var(--color-success);
		}

		&.d {
			--tint: var(--color-present);
		}

		&.l {
			--tint: var(--color-error, #ef5b5b);
		}
	}

	.t-label {
		font-size: 0.68rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.set-bonus {
		align-items: center;
		color: var(--text-secondary);
		display: flex;
		font-size: 0.8rem;
		font-weight: 700;
		gap: 0.4rem;
		margin: 0.2rem 0 0;

		.iconify {
			color: var(--tertiary-color, #f2b84b);
		}

		&.paid {
			color: var(--text-primary);
		}
	}

	.cards-head {
		align-items: baseline;
		display: flex;
		justify-content: space-between;

		.count {
			color: var(--text-secondary);
			font-size: 0.8rem;
			font-weight: 800;
			margin: 0;
		}
	}

	.trophy-grid {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.t-icon {
		color: var(--metal);
		display: flex;
	}

	.t-name {
		font-family: var(--font-display);
		font-size: 0.72rem;
		line-height: 1.1;
	}

	.t-meta {
		color: var(--text-secondary);
		font-size: 0.62rem;
		font-weight: 700;
		line-height: 1.2;
	}

	// A small portrait card per trophy, metal by league
	.trophy-card {
		--metal: var(--text-secondary);

		align-items: center;
		aspect-ratio: 5 / 6;
		background:
			radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--metal) 32%, transparent), transparent 70%),
			var(--bg-primary);
		border: 1.5px solid color-mix(in srgb, var(--metal) 60%, transparent);
		border-radius: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		justify-content: center;
		padding: 0.5rem 0.35rem;
		text-align: center;

		&.bronze {
			--metal: #c98a4b;
		}

		&.silver {
			--metal: #b9c4cc;
		}

		&.gold {
			--metal: var(--tertiary-color, #f2b84b);
		}

		&.europe {
			--metal: #6c8cff;
		}

		&.special {
			--metal: #b48cff;
		}

		&.locked {
			background: transparent;
			border: 1.5px dashed var(--border);

			.t-icon,
			.t-name {
				color: var(--text-secondary);
				opacity: 0.7;
			}
		}
	}

</style>
