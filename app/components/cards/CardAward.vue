<template>
	<div
		v-if="award"
		class="card-award"
	>
		<p class="award-kicker">{{ award.isNew ? (award.owned.foil ? 'New shiny card' : 'New card') : 'In your album' }}</p>
		<PlayerCard
			:card="award.card"
			:club="award.club"
			:foil="award.owned.foil"
			:number="award.owned.number"
			:class="{ reveal: award.isNew }"
		/>
		<div class="set-progress">
			<div class="set-row">
				<strong>{{ award.club }}</strong>
				<span>{{ award.have }} of {{ award.size }}</span>
			</div>
			<div
				class="bar"
				role="progressbar"
				:aria-valuenow="award.have"
				:aria-valuemax="award.size"
				:aria-label="`${award.club} set`"
			>
				<span :style="{ width: `${Math.round((award.have / Math.max(1, award.size)) * 100)}%` }"></span>
			</div>
			<p
				v-if="award.setHints"
				class="set-done"
				role="status"
			>
				Set complete! +{{ award.setHints }} {{ award.setHints === 1 ? 'hint' : 'hints' }} added to your bank.
			</p>
			<p
				v-else-if="award.have < award.size"
				class="set-note"
			>
				Finish the set for {{ hintsFor(award.club) }} free {{ hintsFor(award.club) === 1 ? 'hint' : 'hints' }}.
			</p>
		</div>
	</div>
	<div
		v-else-if="miss"
		class="card-award missed"
	>
		<p class="award-kicker">Today's card got away</p>
		<PlayerCard
			:club="miss.club"
			size="lg"
		/>
		<p class="set-note">You can win it back later from Cards with a replay (1 hint).</p>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import PlayerCard from './PlayerCard.vue'
	import { useCardsStore } from '../../stores/cards'

	// The result sheet's Player Card moment: the card just won (or already owned), the
	// club set's progress and any hints it paid; or, on a loss, the card that got away.
	const cards = useCardsStore()
	const award = computed(() => cards.lastAward)
	const miss = computed(() => cards.lastMiss)

	function hintsFor(club: string) {
		const season = award.value?.owned.season
		return (season && cards.seasons[season]?.clubs[club]?.hints) || 1
	}
</script>

<style scoped lang="scss">
	.card-award {
		align-items: center;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0.75rem 0;
		padding: 1rem;
		width: 100%;
		box-sizing: border-box;
	}

	.award-kicker {
		color: var(--tertiary-color);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		margin: 0;
		text-transform: uppercase;
	}

	.reveal {
		animation: card-flip 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}

	@keyframes card-flip {
		from {
			opacity: 0;
			transform: perspective(600px) rotateY(90deg) scale(0.9);
		}
	}

	.set-progress {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		width: 100%;
	}

	.set-row {
		display: flex;
		font-size: 0.9rem;
		justify-content: space-between;

		span {
			color: var(--text-secondary);
		}
	}

	.bar {
		background: var(--color-absent);
		border-radius: 999px;
		height: 8px;
		overflow: hidden;

		span {
			background: var(--color-success);
			border-radius: 999px;
			display: block;
			height: 100%;
			transition: width 0.6s ease;
		}
	}

	.set-done {
		color: var(--tertiary-color);
		font-weight: 800;
		margin: 0;
	}

	.set-note {
		color: var(--text-secondary);
		font-size: 0.82rem;
		margin: 0;
		text-align: center;
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal {
			animation: none;
		}
	}
</style>
