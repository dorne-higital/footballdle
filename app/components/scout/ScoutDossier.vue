<template>
	<!-- iOS app (1.3): the scout's brief, then everything learned so far about the target -->
	<section
		class="scout-dossier"
		aria-label="Target dossier"
	>
		<div
			v-if="brief"
			class="brief"
		>
			<span class="brief-label">Scout's brief</span>
			<p>“{{ brief.text }}”</p>
		</div>

		<div class="dossier">
			<div class="dossier-head">
				<span class="stamp">TARGET</span>
				<span class="muted">{{ status }}</span>
			</div>
			<div class="fields">
				<div
					v-for="field in fields"
					:key="field.label"
					:class="['field', field.tone]"
					:aria-label="`${field.label}: ${field.spoken}`"
				>
					<span class="field-label">{{ field.label }}</span>
					<span :class="['field-value', { unknown: field.value === '?' }]">{{ field.value }}</span>
					<svg
						v-if="field.pitch !== undefined"
						class="pitch"
						viewBox="0 0 60 36"
						aria-hidden="true"
					>
						<rect
							x="1"
							y="1"
							width="58"
							height="34"
							rx="3"
							fill="none"
							stroke="currentColor"
							stroke-opacity=".35"
						/>
						<line
							x1="30"
							y1="1"
							x2="30"
							y2="35"
							stroke="currentColor"
							stroke-opacity=".35"
						/>
						<rect
							v-for="zone in PITCH_ZONES"
							:key="zone.group"
							:x="zone.x"
							y="9"
							:width="zone.w"
							height="18"
							rx="2"
							fill="currentColor"
							:fill-opacity="zone.group === field.pitch ? 0.85 : dossier.position.ruledOut.includes(zone.group) ? 0 : 0.15"
						/>
					</svg>
					<div
						v-if="field.range"
						class="range"
						aria-hidden="true"
					>
						<i :style="{ left: `${field.range.left}%`, width: `${field.range.width}%` }"></i>
					</div>
					<span
						v-if="field.note"
						class="field-note"
						>{{ field.note }}</span
					>
				</div>
			</div>
			<p
				v-if="explainPrice"
				class="price-explainer"
			>
				Fantasy price is each player's fantasy football price. ↑ means the target costs more.
			</p>
		</div>
	</section>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import type { ScoutDossier } from '../../stores/scoutReport'
	import type { PositionGroup } from '../../composables/useFootballers'
	import { PRICE_RANGE, REGION_NAMES, clubCode, clubsIn, formatPrice, type ScoutBrief } from '../../utils/scoutClues'

	const props = defineProps<{
		brief: ScoutBrief | null
		dossier: ScoutDossier
		guessCount: number
		maxGuesses: number
		gameOver: boolean
		explainPrice: boolean
	}>()

	// Where each position sits on the little pitch (attacking left to right)
	const PITCH_ZONES: { group: PositionGroup; x: number; w: number }[] = [
		{ group: 'Goalkeeper', x: 3, w: 4 },
		{ group: 'Defender', x: 10, w: 8 },
		{ group: 'Midfielder', x: 26, w: 8 },
		{ group: 'Forward', x: 42, w: 8 },
	]
	const SHORT_POSITION: Record<PositionGroup, string> = { Goalkeeper: 'GK', Defender: 'DEF', Midfielder: 'MID', Forward: 'FWD' }

	const status = computed(() => {
		if (props.gameOver) return 'Case closed'
		if (!props.guessCount) return `${props.maxGuesses} guesses`
		return `Guess ${props.guessCount + 1} of ${props.maxGuesses}`
	})

	// "Not ENG · GER · FRA", keeping the last few
	const notList = (items: string[]) => (items.length ? `Not ${items.slice(-3).join(' · ')}` : undefined)
	const fromBrief = (fact: string) => props.brief?.facts.includes(fact as never) ?? false

	interface Field {
		label: string
		value: string
		spoken: string
		tone?: 'found' | 'brief'
		note?: string
		pitch?: PositionGroup | null
		range?: { left: number; width: number }
	}

	const fields = computed<Field[]>(() => {
		const d = props.dossier
		const list: Field[] = []

		// Club
		if (d.club.found) list.push({ label: 'Club', value: `${d.club.found} ✓`, spoken: d.club.found, tone: 'found' })
		else if (d.club.region) {
			const left = clubsIn(d.club.region).filter(c => !d.club.ruledOut.includes(c))
			list.push({
				label: 'Club',
				value: REGION_NAMES[d.club.region].short,
				spoken: `a club in ${REGION_NAMES[d.club.region].phrase}`,
				tone: fromBrief('region') ? 'brief' : undefined,
				note: left.map(clubCode).join(' · '),
			})
		} else {
			const note = notList(d.club.ruledOut.map(clubCode))
			list.push({ label: 'Club', value: '?', spoken: note ?? 'unknown', note })
		}

		// Nation
		if (d.nation.found) list.push({ label: 'Nation', value: `${d.nation.found} ✓`, spoken: d.nation.found, tone: 'found' })
		else {
			const note = notList(d.nation.ruledOut) ?? (fromBrief('continent') ? 'From the brief' : undefined)
			list.push({
				label: 'Nation',
				value: d.nation.continent ?? '?',
				spoken: d.nation.continent ? `from ${d.nation.continent}${note ? `, ${note}` : ''}` : (note ?? 'unknown'),
				tone: d.nation.continent && fromBrief('continent') ? 'brief' : undefined,
				note,
			})
		}

		// Position, on a little pitch
		const position = d.position.found
		const positionFromBrief = position && fromBrief('position') && !props.guessCount
		list.push({
			label: 'Position',
			value: position ? `${position}${positionFromBrief ? '' : ' ✓'}` : '?',
			spoken: position ?? (notList(d.position.ruledOut) || 'unknown'),
			tone: position ? (positionFromBrief ? 'brief' : 'found') : undefined,
			note: position ? undefined : notList(d.position.ruledOut.map(p => SHORT_POSITION[p])),
			pitch: position ?? null,
		})

		// Fantasy price, a bar that narrows with every ↑ or ↓
		if (d.price) {
			const span = PRICE_RANGE.max - PRICE_RANGE.min
			const pct = (v: number) => Math.max(0, Math.min(100, ((v - PRICE_RANGE.min) / span) * 100))
			if (d.price.found !== undefined) {
				list.push({
					label: 'Fantasy price',
					value: `${formatPrice(d.price.found)} ✓`,
					spoken: formatPrice(d.price.found),
					tone: 'found',
					range: { left: pct(d.price.found) - 1.5, width: 3 },
				})
			} else {
				const narrowed = d.price.min > PRICE_RANGE.min || d.price.max < PRICE_RANGE.max
				const range = `${formatPrice(d.price.min)} to ${formatPrice(d.price.max)}`
				list.push({
					label: 'Fantasy price',
					value: narrowed ? range.replace(' to ', '–') : '?',
					spoken: narrowed ? `between ${range}` : 'unknown',
					note: narrowed ? undefined : '↑↓ after each guess',
					range: { left: pct(d.price.min), width: Math.max(2, pct(d.price.max) - pct(d.price.min)) },
				})
			}
		}
		return list
	})
</script>

<style scoped lang="scss">
	.scout-dossier {
		display: grid;
		gap: 0.5rem;
		margin-bottom: 0.6rem;
		text-align: left;
	}

	.brief {
		background: color-mix(in srgb, var(--color-present) 12%, var(--bg-secondary));
		border: 1px solid color-mix(in srgb, var(--color-present) 40%, var(--border));
		border-radius: 0.9rem;
		display: grid;
		gap: 0.05rem;
		padding: 0.5rem 0.7rem;

		.brief-label {
			color: var(--color-present);
			font-size: 0.62rem;
			font-weight: 800;
			letter-spacing: 0.14em;
			text-transform: uppercase;
		}

		p {
			font-size: 0.84rem;
			font-style: italic;
			font-weight: 700;
			margin: 0;
		}
	}

	.dossier {
		background: color-mix(in srgb, var(--color-success) 7%, var(--bg-secondary));
		border: 1px solid color-mix(in srgb, var(--color-success) 25%, var(--border));
		border-radius: 1rem;
		display: grid;
		gap: 0.5rem;
		padding: 0.55rem;
	}

	.dossier-head {
		align-items: center;
		display: flex;
		font-size: 0.72rem;
		justify-content: space-between;
	}

	.stamp {
		border: 2px solid var(--color-present);
		border-radius: 0.3rem;
		color: var(--color-present);
		font-family: var(--font-display);
		font-size: 0.75rem;
		letter-spacing: 0.14em;
		padding: 0.1rem 0.45rem;
		transform: rotate(-3deg);
	}

	.muted {
		color: var(--text-secondary);
	}

	.fields {
		display: grid;
		gap: 0.45rem;
		grid-template-columns: 1fr 1fr;
	}

	.field {
		align-content: start;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 0.7rem;
		display: grid;
		gap: 0.1rem;
		min-width: 0;
		padding: 0.4rem 0.5rem;

		&.found {
			border-color: color-mix(in srgb, var(--color-success) 55%, var(--border));
		}

		&.brief {
			border-color: color-mix(in srgb, var(--color-present) 45%, var(--border));
		}
	}

	.field-label {
		color: var(--text-secondary);
		font-size: 0.58rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.field-value {
		font-size: 0.85rem;
		font-weight: 800;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		&.unknown {
			color: var(--text-secondary);
			font-family: var(--font-display);
		}
	}

	.field-note {
		color: var(--text-secondary);
		font-size: 0.66rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.pitch {
		color: var(--color-success);
		margin-top: 0.1rem;
		width: 3.4rem;
	}

	.range {
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
		border-radius: 1rem;
		height: 0.45rem;
		margin: 0.3rem 0 0.1rem;
		position: relative;

		i {
			background: var(--color-present);
			border-radius: 1rem;
			bottom: 0;
			position: absolute;
			top: 0;
			transition:
				left 0.4s ease,
				width 0.4s ease;
		}
	}

	.found .range i {
		background: var(--color-success);
	}

	.price-explainer {
		color: var(--text-secondary);
		font-size: 0.7rem;
		margin: 0;
	}
</style>
