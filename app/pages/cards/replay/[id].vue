<template>
	<div class="replay-page">
		<template v-if="ready && replay.state">
			<p class="replay-kicker">Replay · {{ replay.card?.club }} card · no stats or streaks</p>
			<GameBoard
				:guesses="replay.state.guesses"
				:answer="replay.answer"
				:max-guesses="replay.maxGuesses"
				:current-guess="replay.currentGuess"
				:game-over="replay.state.over"
				:error-message="replay.errorMessage"
			/>
			<template v-if="replay.state.over">
				<CardAward v-if="replay.state.win" />
				<div
					v-else
					class="replay-lost"
				>
					<p>
						Not this time. It was <strong>{{ replay.card?.name }}</strong>.
					</p>
					<p class="sub">You can try another missed card tomorrow.</p>
				</div>
				<NuxtLink
					to="/cards"
					class="done-btn"
					>Back to Cards</NuxtLink
				>
			</template>
			<Keyboard
				v-else
				:guesses="replay.state.guesses"
				:answer="replay.answer"
				@key="replay.onKey"
			/>
		</template>
		<div
			v-else-if="ready"
			class="replay-lost"
		>
			<p>{{ replay.blocker || "This card can't be replayed." }}</p>
			<NuxtLink
				to="/cards"
				class="done-btn"
				>Back to Cards</NuxtLink
			>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import GameBoard from '../../../components/GameBoard.vue'
	import Keyboard from '../../../components/Keyboard.vue'
	import CardAward from '../../../components/cards/CardAward.vue'
	import { useReplayStore } from '../../../stores/replay'
	import { useCardsStore } from '../../../stores/cards'

	if (!useRuntimeConfig().public.isApp) await navigateTo('/', { replace: true })
	useHead({ title: 'Replay a card' })

	const route = useRoute()
	const replay = useReplayStore()
	const ready = ref(false)

	onMounted(() => {
		useCardsStore().load()
		replay.load()
		replay.start(String(route.params.id))
		ready.value = true
	})
</script>

<style scoped lang="scss">
	.replay-page {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0 auto;
		max-width: 32rem;
		min-height: 100%;
		padding: 0.5rem 0.5rem calc(env(safe-area-inset-bottom) + 0.5rem);
	}

	.replay-kicker {
		color: var(--tertiary-color);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		margin: 0;
		text-align: center;
		text-transform: uppercase;
	}

	.replay-lost {
		align-items: center;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		text-align: center;

		p {
			margin: 0;
		}

		.sub {
			color: var(--text-secondary);
		}
	}

	.done-btn {
		align-items: center;
		background: var(--primary-color);
		border-radius: 0.9rem;
		color: var(--on-success);
		display: flex;
		font-weight: 800;
		justify-content: center;
		min-height: 50px;
		text-decoration: none;
	}

	:deep(.keyboard) {
		margin-top: auto;
	}
</style>
