<template>
	<div class="match-page">
		<!-- Full time -->
		<section
			v-if="!live && last"
			class="full-time"
		>
			<p class="eyebrow">{{ last.pens ? 'After penalties' : 'Full time' }}</p>
			<div class="ft-score">
				<div class="side">
					<ClubCrest
						club="you"
						:custom="climb.saved.club!"
						class="ft-crest"
					/>
					<strong>{{ climb.saved.club!.name }}</strong>
				</div>
				<p class="score">{{ last.score[0] }}–{{ last.score[1] }}</p>
				<div class="side">
					<ClubCrest
						v-if="opponentOfLast"
						club="opponent"
						:custom="opponentOfLast"
						class="ft-crest"
					/>
					<strong>{{ opponentOfLast?.name }}</strong>
				</div>
			</div>
			<p :class="['result-badge', `res-${last.result.toLowerCase()}`]">
				{{ last.result === 'W' ? 'Win' : last.result === 'D' ? 'Draw' : 'Loss' }}<template v-if="last.kind === 'league'"> · {{ last.result === 'W' ? '+3 pts' : last.result === 'D' ? '+1 pt' : '0 pts' }}</template>
			</p>
			<p class="muted">
				<template v-if="last.pens">{{ last.pens.won ? 'Won' : 'Lost' }} {{ last.pens.yours }}-{{ last.pens.theirs }} on penalties</template>
				<template v-else><b>{{ last.correct }} of 10</b> right</template>
			</p>

			<template v-if="last.others.length">
				<p class="section-label">Elsewhere in {{ climb.tierName }}</p>
				<ul class="others">
					<li
						v-for="(f, i) in last.others"
						:key="i"
					>
						<span>{{ climb.clubOf(f.home)?.name }}</span>
						<b>{{ f.hg }}–{{ f.ag }}</b>
						<span>{{ climb.clubOf(f.away)?.name }}</span>
					</li>
				</ul>
				<p
					class="movement"
					:class="{ up: last.posAfter < last.posBefore, down: last.posAfter > last.posBefore }"
				>
					{{ movementText }}
				</p>
			</template>

			<NuxtLink
				to="/climb"
				class="primary-btn"
				@click="haptics.tap()"
			>
				Continue
			</NuxtLink>
		</section>

		<!-- Penalties: a short intro before the shoot-out -->
		<section
			v-else-if="live && live.kind === 'pens' && !pensStarted"
			class="full-time"
		>
			<p class="eyebrow">Penalties</p>
			<h1>It's level after 90 minutes</h1>
			<p class="muted">Five quick questions. {{ opponentName }} scored {{ live.pens!.theirs }} of theirs; beat it to win. If you're level, your last kick decides it.</p>
			<button
				type="button"
				class="primary-btn"
				@click="pensStarted = true"
			>
				Take the first penalty
			</button>
		</section>

		<!-- A question -->
		<template v-else-if="live && question">
			<div class="board">
				<div class="teams">
					<div class="team">
						<ClubCrest
							club="you"
							:custom="climb.saved.club!"
							class="mini-crest"
						/>
						<span>{{ climb.saved.club!.code }}</span>
					</div>
					<p class="tally">
						<b>{{ correct }}</b><small>right</small>
					</p>
					<div class="team right">
						<span>{{ opponent?.code }}</span>
						<ClubCrest
							v-if="opponent"
							club="opponent"
							:custom="opponent"
							class="mini-crest"
						/>
					</div>
				</div>
				<div
					class="dots"
					aria-hidden="true"
				>
					<span
						v-for="i in live.state.questions.length"
						:key="i"
						:class="dotClass(i - 1)"
					></span>
				</div>
				<p class="meta">
					<span>{{ live.kind === 'pens' ? 'Penalty' : 'Question' }} <b>{{ index + 1 }}</b> of {{ live.state.questions.length }}</span>
					<span v-if="live.kind !== 'pens'">Win at <b>{{ targets.win }}</b></span>
				</p>
			</div>

			<p
				v-if="live.kind !== 'pens'"
				:class="['course', `res-${course.best.toLowerCase()}`]"
				role="status"
			>
				{{ course.message }}
			</p>

			<div
				class="timer"
				aria-hidden="true"
			>
				<div :style="{ width: `${timeLeft * 100}%` }"></div>
			</div>

			<div class="prompt">
				<h1>
					<template v-if="question.odd.length === 2">Four share a link. <em>Tap the two</em> who don't.</template>
					<template v-else>{{ question.cards.length - 1 }} share a link. <em>Tap the odd one out.</em></template>
				</h1>
				<p class="muted">{{ linkHint }}</p>
			</div>

			<div :class="['cards', `n${question.cards.length}`]">
				<button
					v-for="(card, i) in question.cards"
					:key="`${index}-${i}`"
					type="button"
					:class="cardClass(i)"
					:disabled="revealing || hidden.includes(i)"
					:aria-label="`${card.name}${hidden.includes(i) ? ', removed by VAR' : ''}`"
					@click="pick(i)"
				>
					<span class="first">{{ firstName(card.name) }}</span>
					<span class="last">{{ lastName(card.name) }}</span>
					<span
						v-if="revealing"
						class="reveal"
						>{{ revealLine(i) }}</span
					>
				</button>
			</div>

			<div class="tools">
				<button
					v-if="live.kind !== 'pens'"
					type="button"
					class="var-btn"
					:disabled="live.state.varOn !== null || revealing"
					@click="useVar"
				>
					<Icon
						name="solar:lightbulb-bolt-bold"
						size="1rem"
					/>
					{{ live.state.varOn !== null ? 'VAR used' : 'VAR: 50/50' }}
					<span
						v-if="live.state.varOn === null"
						class="var-cost"
						>{{ purchases.isPro ? 'Pro' : purchases.hintBank > 0 ? `1 of your ${purchases.hintBank} hints` : 'Get hints' }}</span
					>
				</button>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
	import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
	import ClubCrest from '../../components/cards/ClubCrest.vue'
	import { useClimbStore } from '../../stores/climb'
	import { usePurchasesStore } from '../../stores/purchases'
	import { courseFor, currentQuestion, isFinished, QUESTION_SECONDS, targetsFor } from '../../utils/climb/match'
	import { attribute } from '../../utils/climb/questions'
	import { useHaptics } from '../../composables/useHaptics'

	const { isApp, climbEnabled } = useRuntimeConfig().public
	if (!isApp || !climbEnabled) await navigateTo('/', { replace: true })
	useHead({ title: 'The Climb' })

	const climb = useClimbStore()
	const purchases = usePurchasesStore()
	const haptics = useHaptics()
	const showHintShop = useState('hint-shop-open', () => false)

	const live = computed(() => climb.saved.live)
	const last = computed(() => climb.saved.last)
	const question = computed(() => (live.value ? currentQuestion(live.value.state) : undefined))
	const index = computed(() => live.value?.state.answers.length ?? 0)
	const correct = computed(() => live.value?.state.answers.filter(a => a.correct).length ?? 0)
	const targets = computed(() => targetsFor(live.value?.state.tier ?? 0, live.value?.state.opponent ?? 'mid'))
	const course = computed(() => courseFor(index.value, correct.value, targets.value))
	const opponent = computed(() => (live.value ? climb.clubOf(live.value.opponent) : undefined))
	const opponentName = computed(() => opponent.value?.name ?? 'They')
	const opponentOfLast = computed(() => (last.value ? climb.clubOf(last.value.opponent) : undefined))
	const hidden = computed(() => live.value?.state.varHidden ?? [])
	const pensStarted = ref(false)

	onMounted(() => {
		climb.load()
		if (!climb.saved.live && !climb.saved.last) {
			if (!climb.kickOff()) navigateTo('/climb', { replace: true })
		}
	})

	// Cards picked so far, and the short reveal after answering
	const picked = ref<number[]>([])
	const revealing = ref(false)

	// Per-question clock
	const seconds = computed(() => QUESTION_SECONDS[live.value?.state.tier ?? 0] ?? 8)
	const timeLeft = ref(1)
	let started = 0
	let frame = 0
	function tick() {
		const elapsed = (performance.now() - started) / 1000
		timeLeft.value = Math.max(0, 1 - elapsed / seconds.value)
		if (timeLeft.value <= 0) {
			cancelAnimationFrame(frame)
			reveal([])
			return
		}
		frame = requestAnimationFrame(tick)
	}
	function startClock() {
		cancelAnimationFrame(frame)
		timeLeft.value = 1
		started = performance.now()
		frame = requestAnimationFrame(tick)
	}
	watch(
		() => [question.value, live.value?.kind === 'pens' ? pensStarted.value : true] as const,
		([q, ready]) => {
			if (q && ready && !revealing.value) startClock()
		},
		{ immediate: true },
	)
	onBeforeUnmount(() => cancelAnimationFrame(frame))

	// Picking: one card normally, two in the Champions League, then a short reveal
	function pick(i: number) {
		if (revealing.value || !question.value) return
		haptics.tap()
		if (picked.value.includes(i)) {
			picked.value = picked.value.filter(x => x !== i)
			return
		}
		picked.value = [...picked.value, i]
		if (picked.value.length >= question.value.odd.length) reveal(picked.value)
	}

	function reveal(choice: number[]) {
		if (revealing.value || !question.value) return
		cancelAnimationFrame(frame)
		revealing.value = true
		const q = question.value
		const right = choice.length === q.odd.length && q.odd.every(i => choice.includes(i))
		right ? haptics.success() : haptics.error()
		const left = timeLeft.value
		setTimeout(() => {
			if (choice.length) climb.answer(choice, left)
			else climb.timeUp()
			picked.value = []
			revealing.value = false
			if (live.value && isFinished(live.value.state)) {
				climb.finishMatch()
				pensStarted.value = false
			}
		}, 1300)
	}

	function useVar() {
		if (!climb.useVar()) {
			showHintShop.value = true
			return
		}
		haptics.select()
	}

	function cardClass(i: number) {
		const q = question.value!
		const classes = ['card']
		if (hidden.value.includes(i)) classes.push('gone')
		if (picked.value.includes(i)) classes.push('picked')
		if (revealing.value) classes.push(q.odd.includes(i) ? 'is-odd' : 'is-group', picked.value.includes(i) && !q.odd.includes(i) ? 'wrong' : '')
		return classes
	}

	// After answering, each card shows the link so the player learns something
	function revealLine(i: number): string {
		const q = question.value!
		const card = q.cards[i]!
		if (q.odd.includes(i)) return q.link.type === 'club' ? card.club : q.link.type === 'nation' ? card.nationality : attribute(card, 'position')
		return q.link.value
	}

	const linkHint = computed(() => 'Same club, country or position')

	function dotClass(i: number) {
		const a = live.value?.state.answers[i]
		if (a) return a.correct ? 'ok' : 'bad'
		return i === index.value ? 'now' : ''
	}

	const lastName = (n: string) => n.split(' ').slice(1).join(' ') || n
	const firstName = (n: string) => (n.includes(' ') ? n.split(' ')[0] : '')

	const movementText = computed(() => {
		const l = last.value
		if (!l) return ''
		const ord = (n: number) => n + (['th', 'st', 'nd', 'rd'][((n % 100) - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th')
		if (l.posAfter < l.posBefore) return `Up to ${ord(l.posAfter)}`
		if (l.posAfter > l.posBefore) return `Down to ${ord(l.posAfter)}`
		return `Still ${ord(l.posAfter)}`
	})
</script>

<style scoped lang="scss">
	.match-page {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0 auto;
		max-width: 32rem;
		padding: 0.5rem 1rem calc(env(safe-area-inset-bottom) + 1.5rem);
	}

	.eyebrow {
		color: var(--primary-color);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		margin: 0;
		text-transform: uppercase;
	}

	.muted {
		color: var(--text-secondary);
		margin: 0;
	}

	.board {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		padding: 0.75rem 0.9rem;
	}

	.teams {
		align-items: center;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
	}

	.team {
		align-items: center;
		display: flex;
		font-family: var(--font-display);
		gap: 0.45rem;

		&.right {
			justify-content: flex-end;
		}
	}

	.mini-crest {
		height: 2rem;
	}

	.tally {
		align-items: baseline;
		display: flex;
		gap: 0.3rem;
		margin: 0;

		b {
			font-family: var(--font-display);
			font-size: 1.6rem;
		}

		small {
			color: var(--text-secondary);
			font-weight: 800;
		}
	}

	.dots {
		display: flex;
		gap: 4px;
		margin-top: 0.6rem;

		span {
			background: color-mix(in srgb, var(--text-primary) 10%, transparent);
			border-radius: 4px;
			flex: 1;
			height: 7px;

			&.ok {
				background: var(--color-success);
			}

			&.bad {
				background: var(--color-error, #ef5b5b);
			}

			&.now {
				background: var(--text-primary);
			}
		}
	}

	.meta {
		color: var(--text-secondary);
		display: flex;
		font-size: 0.8rem;
		font-weight: 700;
		justify-content: space-between;
		margin: 0.45rem 0 0;

		b {
			color: var(--text-primary);
		}
	}

	.course {
		border-radius: 0.9rem;
		font-size: 0.85rem;
		font-weight: 800;
		margin: 0;
		padding: 0.5rem 0.8rem;

		&.res-w {
			background: color-mix(in srgb, var(--color-success) 14%, transparent);
		}

		&.res-d {
			background: color-mix(in srgb, var(--color-present) 16%, transparent);
		}

		&.res-l {
			background: color-mix(in srgb, var(--color-error, #ef5b5b) 12%, transparent);
		}
	}

	.timer {
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
		border-radius: 4px;
		height: 6px;
		overflow: hidden;

		div {
			background: linear-gradient(90deg, var(--tertiary-color, #f2b84b), var(--primary-color));
			height: 100%;
		}
	}

	.prompt {
		text-align: center;

		h1 {
			font-family: var(--font-display);
			font-size: 1.25rem;
			line-height: 1.15;
			margin: 0;
			text-wrap: balance;

			em {
				color: var(--primary-color);
				font-style: normal;
			}
		}

		.muted {
			font-size: 0.8rem;
			margin-top: 0.2rem;
		}
	}

	.cards {
		display: grid;
		gap: 0.6rem;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.card {
		align-items: flex-start;
		background: var(--bg-secondary);
		border: 1.5px solid var(--border);
		border-radius: 1.1rem;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		font: inherit;
		justify-content: flex-end;
		min-height: 6.2rem;
		padding: 0.75rem 0.85rem;
		position: relative;
		text-align: left;
		transition:
			transform 0.12s ease,
			border-color 0.15s,
			opacity 0.2s;

		.n6 & {
			min-height: 5rem;
		}

		.n5 &:last-child {
			grid-column: 1 / -1;
		}

		&:active:not(:disabled) {
			transform: scale(0.97);
		}

		&.picked {
			border-color: var(--primary-color);
			box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 22%, transparent);
		}

		&.gone {
			opacity: 0.18;
		}

		&.is-odd {
			background: color-mix(in srgb, var(--color-success) 18%, var(--bg-secondary));
			border-color: var(--color-success);
		}

		&.wrong {
			background: color-mix(in srgb, var(--color-error, #ef5b5b) 16%, var(--bg-secondary));
			border-color: var(--color-error, #ef5b5b);
		}

		.first {
			color: var(--text-secondary);
			font-size: 0.8rem;
			font-weight: 700;
			text-transform: capitalize;
		}

		.last {
			font-family: var(--font-display);
			font-size: 1.15rem;
			line-height: 1.1;
			text-transform: capitalize;
		}

		.reveal {
			color: var(--text-secondary);
			font-size: 0.7rem;
			font-weight: 800;
			margin-top: 0.25rem;
		}
	}

	.tools {
		display: flex;
		justify-content: center;
	}

	.var-btn {
		align-items: center;
		background: transparent;
		border: 1px solid color-mix(in srgb, var(--tertiary-color, #f2b84b) 55%, transparent);
		border-radius: 1rem;
		color: var(--tertiary-color, #f2b84b);
		cursor: pointer;
		display: inline-flex;
		font: inherit;
		font-size: 0.9rem;
		font-weight: 800;
		gap: 0.45rem;
		min-height: 46px;
		padding: 0 1rem;

		&:disabled {
			cursor: default;
			opacity: 0.5;
		}
	}

	.var-cost {
		background: color-mix(in srgb, var(--tertiary-color, #f2b84b) 16%, transparent);
		border-radius: 0.5rem;
		font-size: 0.75rem;
		padding: 0.1rem 0.45rem;
	}

	// Full time
	.full-time {
		align-items: center;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding-top: 0.5rem;
		text-align: center;

		h1 {
			font-family: var(--font-display);
			font-size: 1.5rem;
			margin: 0;
		}
	}

	.ft-score {
		align-items: center;
		display: grid;
		gap: 0.6rem;
		grid-template-columns: 1fr auto 1fr;
		width: 100%;
	}

	.side {
		align-items: center;
		display: flex;
		flex-direction: column;
		font-size: 0.9rem;
		gap: 0.35rem;
	}

	.ft-crest {
		height: 3.4rem;
	}

	.score {
		font-family: var(--font-display);
		font-size: 3rem;
		line-height: 1;
		margin: 0;
	}

	.result-badge {
		border-radius: 999px;
		font-family: var(--font-display);
		letter-spacing: 0.05em;
		margin: 0;
		padding: 0.35rem 1rem;
		text-transform: uppercase;

		&.res-w {
			background: var(--color-success);
			color: var(--on-success, #fff);
		}

		&.res-d {
			background: var(--color-present);
			color: var(--on-present, #fff);
		}

		&.res-l {
			background: var(--color-error, #ef5b5b);
			color: #fff;
		}
	}

	.section-label {
		align-self: flex-start;
		color: var(--text-secondary);
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		margin: 0.6rem 0 0;
		text-transform: uppercase;
	}

	.others {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1rem;
		list-style: none;
		margin: 0;
		padding: 0.2rem 0.8rem;
		width: 100%;

		li {
			align-items: center;
			border-top: 1px solid var(--border);
			display: grid;
			font-size: 0.8rem;
			font-weight: 700;
			grid-template-columns: 1fr 3rem 1fr;
			min-height: 2.1rem;

			&:first-child {
				border-top: 0;
			}

			span:first-child {
				text-align: left;
			}

			span:last-child {
				text-align: right;
			}

			b {
				font-family: var(--font-display);
			}
		}
	}

	.movement {
		font-weight: 800;
		margin: 0;

		&.up {
			color: var(--color-success);
		}

		&.down {
			color: var(--color-error, #ef5b5b);
		}
	}

	.primary-btn {
		align-items: center;
		align-self: stretch;
		background: var(--primary-color);
		border: 0;
		border-radius: 1rem;
		color: var(--on-success, #04130b);
		cursor: pointer;
		display: flex;
		font: inherit;
		font-family: var(--font-display);
		font-size: 1.05rem;
		justify-content: center;
		margin-top: 0.6rem;
		min-height: 54px;
		text-decoration: none;
	}
</style>
