<template>
	<div class="archive-game">
		<template v-if="ready && archive.game">
			<p class="kicker">Archive · Daily #{{ archive.activeDay?.number }} · no stats or streaks</p>
			<GameBoard
				:guesses="archive.game.guesses"
				:answer="archive.answer"
				:max-guesses="archive.maxGuesses"
				:current-guess="archive.currentGuess"
				:game-over="archive.game.over"
				:error-message="archive.errorMessage"
			/>
			<template v-if="archive.game.over">
				<div class="result">
					<p v-if="archive.game.win">
						<strong>Got it in {{ archive.game.guesses.length }}.</strong>
					</p>
					<p v-else>
						Not this time. It was <strong>{{ archive.answer }}</strong>.
					</p>
				</div>
				<NuxtLink
					to="/archive"
					class="done-btn"
					>Back to the archive</NuxtLink
				>
			</template>
			<Keyboard
				v-else
				:guesses="archive.game.guesses"
				:answer="archive.answer"
				@key="archive.onKey"
			/>
		</template>
		<div
			v-else-if="ready"
			class="result"
		>
			<p>{{ blocked }}</p>
			<NuxtLink
				to="/archive"
				class="done-btn"
				>Back to the archive</NuxtLink
			>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import GameBoard from '../../components/GameBoard.vue'
	import Keyboard from '../../components/Keyboard.vue'
	import { useArchiveStore } from '../../stores/archive'

	if (!useRuntimeConfig().public.appShell) await navigateTo('/', { replace: true })
	useHead({ title: 'Puzzle archive' })

	const route = useRoute()
	const archive = useArchiveStore()
	const ready = ref(false)
	const blocked = ref('')

	onMounted(() => {
		archive.load()
		const iso = String(route.params.date)
		if (!archive.start(iso)) {
			const d = archive.day(iso)
			blocked.value = !d ? "That puzzle isn't in the archive." : d.access === 'pro' ? 'Older puzzles are part of Pro.' : 'Opening a past Daily costs a hint, and your bank is empty.'
		}
		ready.value = true
	})
</script>

<style scoped lang="scss">
	.archive-game {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0 auto;
		max-width: 32rem;
		min-height: 100%;
		padding: 0.5rem 0.5rem calc(env(safe-area-inset-bottom) + 0.5rem);
	}

	.kicker {
		color: var(--tertiary-color);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		margin: 0;
		text-align: center;
		text-transform: uppercase;
	}

	.result {
		align-items: center;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		text-align: center;

		p {
			margin: 0;
		}
	}

	.done-btn {
		align-items: center;
		background: var(--primary-color);
		border-radius: 0.9rem;
		color: var(--on-primary);
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
