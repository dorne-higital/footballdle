<template>
	<section
		class="fact-card"
		aria-roledescription="carousel"
		aria-label="Premier League facts"
		@touchstart.passive="onTouchStart"
		@touchend="onTouchEnd"
	>
		<div class="fact-top">
			<p class="fact-kicker">
				<Icon
					name="solar:lightbulb-bolt-linear"
					size="1rem"
				/>
				Did you know?
			</p>
			<span class="fact-count">{{ index + 1 }} / {{ facts.length }}</span>
		</div>

		<Transition
			:name="direction"
			mode="out-in"
		>
			<p
				:key="index"
				class="fact-text"
				aria-live="polite"
			>
				{{ facts[index] }}
			</p>
		</Transition>

		<div class="fact-actions">
			<button
				type="button"
				class="fact-btn icon"
				aria-label="Previous fact"
				@click="step(-1)"
			>
				<Icon
					name="solar:alt-arrow-left-linear"
					size="1.15rem"
				/>
			</button>
			<button
				type="button"
				class="fact-btn"
				@click="shuffle"
			>
				<Icon
					name="solar:shuffle-linear"
					size="1.05rem"
				/>
				Shuffle
			</button>
			<button
				type="button"
				class="fact-btn"
				@click="share"
			>
				<Icon
					:name="isApp ? 'solar:share-linear' : 'solar:copy-linear'"
					size="1.05rem"
				/>
				{{ copied ? 'Copied!' : isApp ? 'Share' : 'Copy' }}
			</button>
			<button
				type="button"
				class="fact-btn icon"
				aria-label="Next fact"
				@click="step(1)"
			>
				<Icon
					name="solar:alt-arrow-right-linear"
					size="1.15rem"
				/>
			</button>
		</div>
	</section>
</template>

<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import curated from '../../data/facts.json'
	import playerMeta from '../../data/meta.json'
	import { roster } from '../../composables/useFootballers'
	import { useShare } from '../../composables/useShare'
	import { useHaptics } from '../../composables/useHaptics'

	// Curated, season-dated facts (app/data/facts.json) plus a few worked out from this
	// season's squads, so there's always something to pass on
	function liveFacts(): string[] {
		const nations = new Map<string, number>()
		for (const p of roster) if (p.nationality !== 'Unknown') nations.set(p.nationality, (nations.get(p.nationality) ?? 0) + 1)
		const ranked = [...nations].sort((a, b) => b[1] - a[1])
		const [top, second] = ranked.filter(([n]) => n !== 'England')
		const longest = [...roster].sort((a, b) => b.lastName.length - a.lastName.length)[0]
		const out = [
			`${roster.length} players are in this season's (${playerMeta.season}) Premier League squads, from ${nations.size} different countries.`,
		]
		if (top && second) out.push(`After England, the most common nationality in ${playerMeta.season} Premier League squads is ${top[0]} (${top[1]} players), then ${second[0]} (${second[1]}).`)
		if (longest) out.push(`The longest surname in this season's squads belongs to ${longest.name.replace(/\b\p{L}/gu, c => c.toUpperCase())}: ${longest.lastName.length} letters. Good luck fitting that on a Daily board.`)
		return out
	}

	const facts = [...curated, ...liveFacts()]
	const isApp = !!useRuntimeConfig().public.isApp
	const { shareText } = useShare()
	const haptics = useHaptics()
	const index = ref(0)
	const direction = ref<'next' | 'prev'>('next')
	const copied = ref(false)

	// A different fact to start with each visit
	onMounted(() => (index.value = Math.floor(Math.random() * facts.length)))

	function step(delta: number) {
		haptics.select()
		direction.value = delta > 0 ? 'next' : 'prev'
		index.value = (index.value + delta + facts.length) % facts.length
	}

	function shuffle() {
		let next = index.value
		while (facts.length > 1 && next === index.value) next = Math.floor(Math.random() * facts.length)
		haptics.select()
		direction.value = 'next'
		index.value = next
	}

	async function share() {
		const text = `⚽ Did you know? ${facts[index.value]}\n\nvia Footballdle, the daily Premier League guessing game: footballdle.co.uk`
		if (await shareText(text)) {
			copied.value = true
			setTimeout(() => (copied.value = false), 2000)
		}
	}

	// Swipe left or right to move through the facts
	let startX = 0
	function onTouchStart(e: TouchEvent) {
		startX = e.touches[0]?.clientX ?? 0
	}
	function onTouchEnd(e: TouchEvent) {
		const dx = (e.changedTouches[0]?.clientX ?? 0) - startX
		if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1)
	}
</script>

<style scoped lang="scss">
	.fact-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		overflow: hidden;
		padding: 1rem 1rem 0.85rem;
		text-align: left;
	}

	.fact-top {
		align-items: center;
		display: flex;
		justify-content: space-between;
	}

	.fact-kicker {
		align-items: center;
		color: var(--tertiary-color);
		display: flex;
		font-size: 0.72rem;
		font-weight: 800;
		gap: 0.35rem;
		letter-spacing: 0.08em;
		margin: 0;
		text-transform: uppercase;
	}

	.fact-count {
		color: var(--text-secondary);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
	}

	.fact-text {
		font-size: 0.98rem;
		font-weight: 600;
		line-height: 1.4;
		margin: 0;
		min-height: 4.2em;
	}

	.fact-actions {
		display: flex;
		gap: 0.4rem;
	}

	.fact-btn {
		align-items: center;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 0.8rem;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		flex: 1;
		font: inherit;
		font-size: 0.85rem;
		font-weight: 700;
		gap: 0.35rem;
		justify-content: center;
		min-height: 40px;

		&.icon {
			flex: 0 0 40px;
		}

		&:active {
			transform: scale(0.97);
		}
	}

	.next-enter-active,
	.next-leave-active,
	.prev-enter-active,
	.prev-leave-active {
		transition:
			opacity 0.18s ease,
			transform 0.18s ease;
	}

	.next-enter-from,
	.prev-leave-to {
		opacity: 0;
		transform: translateX(16px);
	}

	.next-leave-to,
	.prev-enter-from {
		opacity: 0;
		transform: translateX(-16px);
	}

	@media (prefers-reduced-motion: reduce) {
		.next-enter-active,
		.next-leave-active,
		.prev-enter-active,
		.prev-leave-active {
			transition: opacity 0.12s ease;
		}

		.next-enter-from,
		.next-leave-to,
		.prev-enter-from,
		.prev-leave-to {
			transform: none;
		}
	}
</style>
