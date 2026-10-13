<template>
	<div class="grid-page">
		<!-- Server-rendered and first paint: a same-size placeholder, so nothing jumps -->
		<div
			v-if="!grid.ready"
			class="placeholder"
			aria-hidden="true"
		></div>

		<!-- ============================ Grid Week hub ============================ -->
		<section
			v-else-if="grid.active === null"
			class="hub"
		>
			<header class="hub-head">
				<p class="eyebrow">The Grid · from {{ niceDate(grid.weekStartLabel) }}</p>
				<h1>Grid Week</h1>
				<p class="lede">Five new grids every Saturday, the same for everyone. Name a player for each square: 100 points first time, 25 less for every miss.</p>
			</header>

			<div
				v-if="grid.hasWeek"
				class="week-total"
			>
				<div>
					<span class="total-points">{{ fmt(grid.weekPoints) }}</span>
					<span class="total-of">/ 4,500 this week</span>
				</div>
				<span class="next-drop">New grids {{ dropLabel }}</span>
			</div>

			<ol
				v-if="grid.hasWeek"
				class="week-list"
			>
				<li
					v-for="(g, i) in grid.thisWeek"
					:key="i"
				>
					<button
						type="button"
						:class="['week-grid', { done: g.done }]"
						@click="grid.open(i)"
					>
						<span class="wg-number">{{ i + 1 }}</span>
						<span class="wg-text">
							<span class="wg-title">Grid {{ i + 1 }}</span>
							<span class="wg-sub">{{ gridStatus(g) }}</span>
						</span>
						<span class="wg-points">{{ fmt(gridPoints(g.squares)) }}</span>
					</button>
				</li>
			</ol>
			<p
				v-else
				class="lede"
			>
				No Grid Week is planned for this date. Update the app to get the latest grids.
			</p>

			<div class="hub-actions">
				<ShareResultButton
					v-if="grid.weekSolved > 0"
					:text="weekShareText"
				/>
				<button
					type="button"
					class="practice-btn"
					@click="grid.open('practice')"
				>
					<Icon
						name="solar:refresh-circle-linear"
						size="1.2rem"
					/>
					Practice grids
					<span class="practice-sub">Unlimited, no leaderboard</span>
				</button>
			</div>

			<div
				v-if="grid.stats.weeks.length || grid.stats.gamesPlayed"
				class="hub-stats"
			>
				<div><b>{{ fmt(grid.bestWeek) }}</b><span>Best week</span></div>
				<div><b>{{ grid.stats.weeks.length }}</b><span>Weeks played</span></div>
				<div><b>{{ grid.stats.perfectGrids }}</b><span>Perfect grids</span></div>
			</div>
		</section>

		<!-- ============================ A grid ============================ -->
		<section
			v-else-if="grid.current"
			class="board-view"
		>
			<div class="board-top">
				<button
					type="button"
					class="back-btn"
					@click="grid.close()"
				>
					<Icon
						name="solar:alt-arrow-left-linear"
						size="1.1rem"
					/>
					Grid Week
				</button>
				<span class="board-title">{{ grid.active === 'practice' ? 'Practice grid' : `Grid ${Number(grid.active) + 1} of 5` }}</span>
			</div>

			<GridBoard
				:deal="grid.current.deal"
				:squares="grid.current.squares"
				:selected="grid.selected"
				:points="grid.currentPoints"
				:reveals="reveals"
				:disabled="grid.current.done"
				@select="onSelect"
			/>

			<!-- Guessing a square -->
			<div
				v-if="!grid.current.done && grid.selected !== null"
				class="guess-panel"
			>
				<p class="guess-target">
					<span>{{ selectedLabel }}</span>
					<span class="guess-worth">Worth {{ selectedWorth }}</span>
				</p>
				<ScoutAutocomplete
					:search="searchPlayers"
					:show-club="false"
					placeholder="Name a player for this square"
					empty-text="No current player matches"
					@guess="onGuess"
				/>
				<button
					v-if="$config.public.appShell && grid.canHintSelected"
					type="button"
					class="hint-btn"
					:disabled="purchases.busy"
					@click="onHint"
				>
					<Icon
						name="solar:lightbulb-bolt-bold"
						size="1.05rem"
					/>
					{{ hintLabel }}
				</button>
			</div>
			<p
				v-else-if="!grid.current.done"
				class="pick-prompt"
			>
				Pick a square to name a player.
			</p>

			<p
				class="guess-msg"
				role="status"
				aria-live="polite"
			>
				{{ resultMessage }}
			</p>

			<!-- Finishing early -->
			<div
				v-if="!grid.current.done"
				class="finish-row"
			>
				<button
					v-if="!confirmFinish"
					type="button"
					class="text-btn"
					@click="confirmFinish = true"
				>
					Finish grid
				</button>
				<template v-else>
					<span class="finish-warn">Empty squares score 0.</span>
					<button
						type="button"
						class="text-btn danger"
						@click="onFinish"
					>
						Finish now
					</button>
					<button
						type="button"
						class="text-btn"
						@click="confirmFinish = false"
					>
						Keep playing
					</button>
				</template>
			</div>

			<!-- Full time -->
			<div
				v-else
				class="result-card"
			>
				<p class="result-points">
					{{ fmt(grid.currentPoints) }}<span>/ 900</span>
				</p>
				<p class="result-sub">{{ grid.solvedCount(grid.current) }} of 9 squares{{ grid.currentPoints === 900 ? ', a perfect grid!' : '' }}</p>
				<div class="result-actions">
					<ShareResultButton :text="gridShareText" />
					<button
						v-if="grid.active === 'practice'"
						type="button"
						class="primary-btn"
						@click="grid.newPractice()"
					>
						New practice grid
					</button>
					<button
						v-else-if="nextWeekGrid !== null"
						type="button"
						class="primary-btn"
						@click="grid.open(nextWeekGrid)"
					>
						Next grid
					</button>
					<button
						v-else
						type="button"
						class="primary-btn"
						@click="grid.close()"
					>
						Back to Grid Week
					</button>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref, watch } from 'vue'
	import playersData from '../../data/players.json'
	import GridBoard from '../../components/grid/GridBoard.vue'
	import ScoutAutocomplete from '../../components/scout/ScoutAutocomplete.vue'
	import ShareResultButton from '../../components/shared/ShareResultButton.vue'
	import { useGridStore, type GridProgress } from '../../stores/grid'
	import { usePurchasesStore } from '../../stores/purchases'
	import { useHaptics } from '../../composables/useHaptics'
	import { HINT_COST, MAX_WRONG, SQUARE_POINTS, WRONG_COST, gridPoints, isLocked, nameKey, rowLabel, squareOf, type GridPlayer } from '../../utils/grid'

	definePageMeta({ layout: 'play' })
	useHead({
		title: 'The Grid | Footballdle',
		meta: [{ name: 'description', content: 'Five new football grids every Saturday. Name a player for each club and country square: 100 points first time.' }],
	})

	const grid = useGridStore()
	const purchases = usePurchasesStore()
	const haptics = useHaptics()
	const route = useRoute()
	const players = playersData as GridPlayer[]
	const confirmFinish = ref(false)
	const showHintShop = useState('hint-shop-open', () => false)

	onMounted(() => {
		grid.load()
		if (route.query.grid === 'practice') grid.open('practice')
	})
	watch(() => grid.active, () => (confirmFinish.value = false))

	const fmt = (n: number) => n.toLocaleString('en-GB')
	const titleCase = (s: string) => s.replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase())

	function niceDate(ddmmyyyy: string) {
		if (!ddmmyyyy) return ''
		const [d, m, y] = ddmmyyyy.split('/').map(Number)
		return new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
	}
	const dropLabel = computed(() => `Sat ${niceDate(grid.nextDrop).replace(/^\w+,?\s*/, '')}`)

	function gridStatus(g: GridProgress) {
		const solved = g.squares.filter(s => s.player).length
		if (g.done) return `Finished · ${solved}/9 squares`
		if (g.squares.some(s => s.player || s.wrong)) return `${solved}/9 squares so far`
		return 'To play'
	}

	const nextWeekGrid = computed(() => {
		const i = grid.thisWeek.findIndex(g => !g.done)
		return i >= 0 ? i : null
	})

	// ------------------------------------------------------------- guessing
	function searchPlayers(query: string) {
		const q = nameKey(query)
		if (q.length < 2) return []
		const used = new Set(grid.usedNames)
		return players
			.filter(p => !used.has(p.name) && nameKey(p.name).includes(q))
			.sort((a, b) => Number(nameKey(b.name).startsWith(q)) - Number(nameKey(a.name).startsWith(q)) || b.pop - a.pop)
			.slice(0, 6)
			.map(p => ({ name: titleCase(p.name), club: p.club }))
	}

	const selectedLabel = computed(() => {
		if (!grid.current || grid.selected === null) return ''
		const { club, row } = squareOf(grid.current.deal, grid.selected)
		return `${rowLabel(row)} × ${club}`
	})
	const selectedWorth = computed(() => {
		const s = grid.current && grid.selected !== null ? grid.current.squares[grid.selected] : null
		if (!s) return ''
		const points = Math.max(0, SQUARE_POINTS - WRONG_COST * s.wrong - (s.hinted ? HINT_COST : 0))
		const left = MAX_WRONG - s.wrong
		return `${points} · ${left} ${left === 1 ? 'miss' : 'misses'} left`
	})

	function onSelect(i: number) {
		grid.select(grid.selected === i ? null : i)
		confirmFinish.value = false
	}

	function onGuess(name: string) {
		const result = grid.guess(name)
		if (result === 'correct') haptics.success()
		else if (result === 'wrong' || result === 'repeat') haptics.error()
	}

	const resultMessage = computed(() => {
		const r = grid.lastResult
		if (!r || !grid.current) return ''
		const name = r.name ? titleCase(r.name) : ''
		const square = grid.current.squares[r.square]!
		if (r.result === 'correct') return `${name}, yes! +${grid.squarePoints(square)}`
		if (r.result === 'unknown') return "That's not a player in the game. No points lost."
		const tail = isLocked(square) ? 'That square is locked at 0.' : `${MAX_WRONG - square.wrong} left on that square.`
		return r.result === 'repeat' ? `${name} is already on this grid. ${tail}` : `${name} doesn't fit. ${tail}`
	})

	const reveals = computed(() => (grid.current?.done ? grid.current.squares.map((_, i) => grid.answerFor(i)) : []))

	// ------------------------------------------------------------- hints
	const hintLabel = computed(() => {
		if (purchases.isPro) return `Hint: first letter (−${HINT_COST})`
		if (purchases.hintBank > 0) return `Use a hint (−${HINT_COST}) · ${purchases.hintBank} left`
		return 'Get hints'
	})

	function onHint() {
		if (!grid.canHintSelected) return
		if (!purchases.isPro && purchases.hintBank <= 0) {
			showHintShop.value = true
			return
		}
		if (purchases.spendHint()) {
			grid.hint()
			haptics.tap()
		}
	}

	function onFinish() {
		grid.finish()
		confirmFinish.value = false
	}

	// ------------------------------------------------------------- sharing
	const squareEmoji = (s: GridProgress['squares'][number]) => (s.player ? (s.hinted || s.wrong ? '🟨' : '🟩') : '⬛')

	const gridShareText = computed(() => {
		const g = grid.current
		if (!g) return ''
		const rows = [0, 1, 2].map(r => g.squares.slice(r * 3, r * 3 + 3).map(squareEmoji).join('')).join('\n')
		const label = grid.active === 'practice' ? 'The Grid (practice)' : `The Grid · week of ${niceDate(grid.weekStartLabel)} · grid ${Number(grid.active) + 1}`
		return `Footballdle ${label}\n${fmt(gridPoints(g.squares))}/900\n\n${rows}\n\nfootballdle.co.uk`
	})

	const weekShareText = computed(() => {
		const lines = grid.thisWeek.map((g, i) => `${i + 1} ${g.squares.map(squareEmoji).join('')} ${fmt(gridPoints(g.squares))}`)
		return `Footballdle The Grid · week of ${niceDate(grid.weekStartLabel)}\n${fmt(grid.weekPoints)}/4,500\n\n${lines.join('\n')}\n\nfootballdle.co.uk`
	})
</script>

<style scoped lang="scss">
	.grid-page {
		height: 100%;
		margin: 0 auto;
		max-width: 30rem;
		overflow-y: auto;
		padding: 0.25rem 0.1rem 6rem;
		width: 100%;
	}

	.placeholder {
		height: 30rem;
	}

	.eyebrow {
		color: var(--primary-color);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		margin: 0;
		text-transform: uppercase;
	}

	.hub {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.hub-head h1 {
		font-family: var(--font-display);
		font-size: 2.2rem;
		line-height: 1;
		margin: 0.35rem 0 0.5rem;
	}

	.lede {
		color: var(--text-secondary);
		font-size: 0.92rem;
		line-height: 1.5;
		margin: 0;
	}

	.week-total {
		align-items: flex-end;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: space-between;
		padding: 1rem 1.1rem;
	}

	.total-points {
		color: var(--primary-color);
		font-family: var(--font-display);
		font-size: 2rem;
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.total-of,
	.next-drop {
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 700;
		margin-left: 0.4rem;
	}

	.next-drop {
		margin: 0;
	}

	.week-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.week-grid {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1rem;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		font-family: var(--font-body);
		gap: 0.85rem;
		padding: 0.8rem 1rem;
		text-align: left;
		width: 100%;

		&:hover {
			border-color: var(--primary-color);
		}

		&.done .wg-number {
			background: var(--primary-color);
			color: var(--on-success);
		}
	}

	.wg-number {
		align-items: center;
		background: var(--fl-raised);
		border-radius: 0.65rem;
		display: flex;
		flex: none;
		font-family: var(--font-display);
		height: 2.4rem;
		justify-content: center;
		width: 2.4rem;
	}

	.wg-text {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	.wg-title {
		font-weight: 800;
	}

	.wg-sub {
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.wg-points {
		font-family: var(--font-display);
		font-variant-numeric: tabular-nums;
	}

	.hub-actions {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.practice-btn {
		align-items: center;
		background: transparent;
		border: 1.5px solid var(--border);
		border-radius: 1rem;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		flex-wrap: wrap;
		font-family: var(--font-body);
		font-size: 0.95rem;
		font-weight: 800;
		gap: 0.5rem;
		justify-content: center;
		padding: 0.85rem 1rem;

		&:hover {
			border-color: var(--primary-color);
		}
	}

	.practice-sub {
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.hub-stats {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: repeat(3, minmax(0, 1fr));

		div {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 0.85rem;
			display: flex;
			flex-direction: column;
			padding: 0.65rem 0.25rem;
		}

		b {
			font-family: var(--font-display);
			font-size: 1.2rem;
			font-variant-numeric: tabular-nums;
		}

		span {
			color: var(--text-secondary);
			font-size: 0.7rem;
			font-weight: 800;
			letter-spacing: 0.06em;
			text-transform: uppercase;
		}
	}

	.board-view {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.board-top {
		align-items: center;
		display: flex;
		justify-content: space-between;
	}

	.back-btn,
	.text-btn {
		align-items: center;
		background: none;
		border: 0;
		color: var(--text-secondary);
		cursor: pointer;
		display: inline-flex;
		font-family: var(--font-body);
		font-size: 0.88rem;
		font-weight: 800;
		gap: 0.25rem;
		padding: 0.5rem 0.25rem;

		&:hover {
			color: var(--text-primary);
		}

		&.danger {
			color: var(--fl-red, #ff8a80);
		}
	}

	.board-title {
		font-family: var(--font-display);
		font-size: 1rem;
	}

	.guess-panel {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.85rem;
	}

	.guess-target {
		align-items: baseline;
		display: flex;
		flex-wrap: wrap;
		font-weight: 800;
		gap: 0.5rem;
		justify-content: space-between;
		margin: 0;
	}

	.guess-worth {
		color: var(--text-secondary);
		font-size: 0.8rem;
	}

	.hint-btn {
		align-items: center;
		align-self: flex-start;
		background: color-mix(in srgb, var(--tertiary-color) 14%, transparent);
		border: 0;
		border-radius: 999px;
		color: var(--tertiary-color);
		cursor: pointer;
		display: inline-flex;
		font-family: var(--font-body);
		font-size: 0.85rem;
		font-weight: 800;
		gap: 0.4rem;
		padding: 0.5rem 0.85rem;
	}

	.pick-prompt,
	.guess-msg {
		color: var(--text-secondary);
		font-size: 0.88rem;
		font-weight: 700;
		margin: 0;
		min-height: 1.3em;
		text-align: center;
	}

	.finish-row {
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}

	.finish-warn {
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 700;
	}

	.result-card {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 1.1rem;
		text-align: center;
	}

	.result-points {
		color: var(--primary-color);
		font-family: var(--font-display);
		font-size: 2.4rem;
		line-height: 1;
		margin: 0;

		span {
			color: var(--text-secondary);
			font-size: 1rem;
			margin-left: 0.3rem;
		}
	}

	.result-sub {
		color: var(--text-secondary);
		font-weight: 700;
		margin: 0 0 0.4rem;
	}

	.result-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}

	.primary-btn {
		background: var(--primary-color);
		border: 0;
		border-radius: var(--global-border-radius);
		color: var(--on-success);
		cursor: pointer;
		font-family: var(--font-body);
		font-size: 0.95rem;
		font-weight: 800;
		padding: 0.7rem 1.1rem;
	}
</style>
