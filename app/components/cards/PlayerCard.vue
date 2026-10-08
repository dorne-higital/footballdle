<template>
	<div
		:class="['player-card', size, { foil, hidden: !card }]"
		:style="{ '--club-bg': style.bg, '--club-fg': style.fg }"
		:aria-label="card ? `${card.name}, ${card.club}${foil ? ', shiny' : ''}` : 'Card not collected yet'"
		role="img"
	>
		<div class="band">
			<span class="code">{{ style.code }}</span>
			<span
				v-if="number"
				class="number"
				>#{{ number }}</span
			>
		</div>
		<div class="face">
			<template v-if="card">
				<div class="tiles">
					<span
						v-for="(letter, i) in card.surname.toUpperCase().split('')"
						:key="i"
						>{{ letter }}</span
					>
				</div>
				<p class="name">{{ card.name }}</p>
				<p class="meta">{{ card.position }} · {{ card.nationality }}</p>
			</template>
			<span
				v-else
				class="unknown"
				>?</span
			>
		</div>
		<span
			v-if="foil"
			class="shine"
			aria-hidden="true"
		></span>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import type { CardInfo } from '../../stores/cards'
	import { clubStyle } from '../../utils/clubs'

	// One Player Card: club band, the surname as tiles, name and details. Without a card
	// it's the face-down silhouette of one not collected yet (never named).
	const props = withDefaults(
		defineProps<{ card?: CardInfo | null; club: string; foil?: boolean; number?: number | null; size?: 'lg' | 'sm' }>(),
		{ card: null, foil: false, number: null, size: 'lg' },
	)
	const style = computed(() => clubStyle(props.club))
</script>

<style scoped lang="scss">
	.player-card {
		aspect-ratio: 5 / 7;
		background: linear-gradient(160deg, var(--fl-raised, #163126) 0%, var(--bg-secondary) 100%);
		border: 1.5px solid var(--border);
		border-radius: 18px;
		box-shadow: 0 18px 36px -18px rgb(0 0 0 / 55%);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;

		&.lg {
			width: 200px;
		}

		&.sm {
			border-radius: 12px;
			width: 100%;
		}

		&.foil {
			border-color: var(--tertiary-color);
			box-shadow:
				0 18px 36px -18px rgb(0 0 0 / 55%),
				0 0 24px color-mix(in srgb, var(--tertiary-color) 35%, transparent);
		}

		&.hidden {
			background: var(--bg-secondary);
			border-style: dashed;
			box-shadow: none;
		}
	}

	.band {
		align-items: center;
		background: var(--club-bg);
		color: var(--club-fg);
		display: flex;
		font-size: 0.75rem;
		font-weight: 800;
		justify-content: space-between;
		letter-spacing: 0.08em;
		padding: 0.55rem 0.75rem;

		.sm & {
			font-size: 0.55rem;
			padding: 0.3rem 0.45rem;
		}

		.hidden & {
			opacity: 0.35;
		}
	}

	.face {
		align-items: center;
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 0.45rem;
		justify-content: center;
		padding: 0.6rem;
		text-align: center;
	}

	.tiles {
		display: flex;
		gap: 3px;

		span {
			align-items: center;
			background: var(--color-success);
			border-radius: 5px;
			color: var(--on-success);
			display: flex;
			font-family: var(--font-display);
			font-size: 0.9rem;
			height: 1.6rem;
			justify-content: center;
			width: 1.35rem;

			.sm & {
				border-radius: 3px;
				font-size: 0.5rem;
				height: 0.9rem;
				width: 0.72rem;
			}
		}
	}

	.name {
		font-weight: 800;
		margin: 0;
		// The roster stores names in lower case
		text-transform: capitalize;

		.sm & {
			font-size: 0.6rem;
			line-height: 1.15;
		}
	}

	.meta {
		color: var(--text-secondary);
		font-size: 0.75rem;
		margin: 0;

		.sm & {
			display: none;
		}
	}

	.unknown {
		color: var(--text-secondary);
		font-family: var(--font-display);
		font-size: 2rem;
		opacity: 0.5;

		.sm & {
			font-size: 1.2rem;
		}
	}

	// A slow sweep of light across shiny cards
	.shine {
		animation: card-shine 3.2s ease-in-out infinite;
		background: linear-gradient(115deg, transparent 35%, rgb(255 255 255 / 22%) 50%, transparent 65%);
		inset: 0;
		pointer-events: none;
		position: absolute;
		transform: translateX(-100%);
	}

	@keyframes card-shine {
		60%,
		100% {
			transform: translateX(100%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.shine {
			animation: none;
			opacity: 0.4;
			transform: none;
		}
	}
</style>
