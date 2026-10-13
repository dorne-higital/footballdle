<template>
	<div
		class="grid-board"
		role="grid"
		:aria-label="`The Grid: ${deal.clubs.join(', ')} across, ${rowNames.join(', ')} down`"
	>
		<div
			class="corner"
			aria-hidden="true"
		>
			<span class="corner-points">{{ points }}</span>
			<span class="corner-label">points</span>
		</div>
		<div
			v-for="club in deal.clubs"
			:key="club"
			class="head club-head"
			role="columnheader"
		>
			<ClubCrest
				:club="club"
				class="crest"
			/>
			<span class="head-name">{{ shortClub(club) }}</span>
		</div>

		<template
			v-for="(row, r) in deal.rows"
			:key="row"
		>
			<div
				class="head row-head"
				role="rowheader"
			>
				<span class="head-kind">{{ rowKind(row) }}</span>
				<span class="head-name">{{ rowLabel(row) }}</span>
			</div>
			<button
				v-for="c in 3"
				:key="`${row}-${c}`"
				type="button"
				:class="['cell', cellClass(r * 3 + c - 1)]"
				:disabled="disabled || !canPick(r * 3 + c - 1)"
				:aria-pressed="selected === r * 3 + c - 1"
				:aria-label="cellLabel(r * 3 + c - 1)"
				@click="$emit('select', r * 3 + c - 1)"
			>
				<template v-if="squares[r * 3 + c - 1]!.player">
					<span class="cell-name">{{ surname(squares[r * 3 + c - 1]!.player!) }}</span>
					<span class="cell-points">+{{ squarePoints(squares[r * 3 + c - 1]!) }}</span>
				</template>
				<template v-else-if="reveals[r * 3 + c - 1]">
					<span class="cell-name reveal">{{ surname(reveals[r * 3 + c - 1]!) }}</span>
					<span class="cell-points">0</span>
				</template>
				<template v-else>
					<span
						v-if="squares[r * 3 + c - 1]!.hintLetter"
						class="cell-hint"
						>{{ squares[r * 3 + c - 1]!.hintLetter }}</span
					>
					<span
						v-if="squares[r * 3 + c - 1]!.wrong"
						class="misses"
						:aria-hidden="true"
					>
						<i
							v-for="m in MAX_WRONG"
							:key="m"
							:class="{ used: m <= squares[r * 3 + c - 1]!.wrong }"
						></i>
					</span>
				</template>
			</button>
		</template>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import ClubCrest from '../cards/ClubCrest.vue'
	import { MAX_WRONG, isLocked, rowKind, rowLabel, shownSurname, squarePoints, type GridDeal, type SquareState } from '../../utils/grid'

	const props = withDefaults(
		defineProps<{
			deal: GridDeal
			squares: SquareState[]
			selected: number | null
			points: number
			/** Answers shown for unsolved squares once the grid is finished */
			reveals?: (string | null)[]
			disabled?: boolean
		}>(),
		{ reveals: () => [], disabled: false },
	)
	defineEmits<{ select: [square: number] }>()

	const SHORT: Record<string, string> = {
		'Brighton & Hove Albion': 'Brighton',
		'Manchester City': 'Man City',
		'Manchester United': 'Man Utd',
		'Nottingham Forest': "Nott'm Forest",
		'Crystal Palace': 'Palace',
		'Coventry City': 'Coventry',
		'Ipswich Town': 'Ipswich',
		'Leeds United': 'Leeds',
		'Hull City': 'Hull',
		'Aston Villa': 'Villa',
	}
	const shortClub = (club: string) => SHORT[club] ?? club
	const rowNames = computed(() => props.deal.rows.map(rowLabel))
	const surname = (name: string) => shownSurname(name)

	const canPick = (i: number) => {
		const s = props.squares[i]!
		return !s.player && !isLocked(s) && !props.reveals[i]
	}

	function cellClass(i: number) {
		const s = props.squares[i]!
		if (s.player) return s.hinted || s.wrong ? 'solved partial' : 'solved'
		if (props.reveals[i] || isLocked(s)) return 'missed'
		return props.selected === i ? 'selected' : ''
	}

	function cellLabel(i: number) {
		const club = props.deal.clubs[i % 3]
		const row = rowLabel(props.deal.rows[Math.floor(i / 3)]!)
		const s = props.squares[i]!
		const where = `${row}, ${club}`
		if (s.player) return `${where}: ${s.player}, ${squarePoints(s)} points`
		if (props.reveals[i]) return `${where}: missed, an answer was ${props.reveals[i]}`
		if (isLocked(s)) return `${where}: locked after ${MAX_WRONG} misses`
		const extra = [s.wrong ? `${s.wrong} wrong` : '', s.hintLetter ? `hint ${s.hintLetter}` : ''].filter(Boolean).join(', ')
		return `${where}: empty${extra ? `, ${extra}` : ''}`
	}
</script>

<style scoped lang="scss">
	.grid-board {
		display: grid;
		gap: 0.4rem;
		grid-template-columns: minmax(4.2rem, 0.85fr) repeat(3, minmax(0, 1fr));
		width: 100%;
	}

	.corner,
	.head {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.8rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 3.6rem;
		padding: 0.4rem 0.25rem;
		text-align: center;
	}

	.corner {
		background: none;
		border: 0;
	}

	.corner-points {
		color: var(--primary-color);
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.corner-label,
	.head-kind {
		color: var(--text-secondary);
		font-size: 0.6rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.club-head {
		gap: 0.3rem;

		.crest {
			height: 1.9rem;
			width: 1.9rem;
		}
	}

	.head-name {
		font-size: 0.74rem;
		font-weight: 800;
		line-height: 1.15;
		overflow-wrap: anywhere;
	}

	.cell {
		align-items: center;
		aspect-ratio: 1;
		background: transparent;
		border: 1.5px dashed color-mix(in srgb, var(--text-secondary) 45%, transparent);
		border-radius: 0.8rem;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		font-family: var(--font-body);
		gap: 0.2rem;
		justify-content: center;
		min-width: 0;
		padding: 0.3rem;
		position: relative;
		transition: border-color 0.15s, transform 0.15s;

		&:hover:not(:disabled) {
			border-color: var(--primary-color);
		}

		&:disabled {
			cursor: default;
		}

		&.selected {
			border-color: var(--primary-color);
			border-style: solid;
			box-shadow: 0 0 0 3px var(--fl-glow);
		}

		&.solved {
			background: var(--color-success);
			border: 0;
			color: var(--on-success);
		}

		&.solved.partial {
			background: color-mix(in srgb, var(--color-success) 70%, var(--color-present));
		}

		&.missed {
			background: var(--bg-secondary);
			border-style: solid;
			color: var(--text-secondary);
		}
	}

	.cell-name {
		font-size: 0.78rem;
		font-weight: 800;
		line-height: 1.1;
		overflow-wrap: anywhere;
		text-transform: capitalize;

		&.reveal {
			font-weight: 700;
		}
	}

	.cell-points {
		font-size: 0.66rem;
		font-weight: 800;
		opacity: 0.8;
	}

	.cell-hint {
		color: var(--tertiary-color);
		font-family: var(--font-display);
		font-size: 1.5rem;
	}

	.misses {
		bottom: 0.45rem;
		display: flex;
		gap: 3px;
		left: 50%;
		position: absolute;
		transform: translateX(-50%);

		i {
			background: var(--border);
			border-radius: 50%;
			height: 6px;
			width: 6px;
		}

		i.used {
			background: var(--fl-red, #ff8a80);
		}
	}
</style>
