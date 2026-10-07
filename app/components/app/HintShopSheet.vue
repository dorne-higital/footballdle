<template>
	<PitchCardModal
		v-if="open"
		heading="Get hints"
		accent="info"
		variant="small"
		@close="open = false"
	>
		<template #body>
			<div class="hint-shop">
				<p class="hint-shop-intro">
					Each hint reveals the next clue in the Daily: club, nationality, position, then the first and second
					letters of the surname. Up to five per game; hints you don't use stay in the bank.
				</p>
				<p
					v-if="purchases.isPro || purchases.hintBank > 0"
					class="hint-shop-intro hint-shop-balance"
				>
					<Icon
						name="solar:lightbulb-bold"
						size="1rem"
					/>
					{{
						purchases.isPro
							? 'You have unlimited hints with Pro.'
							: `You've got ${purchases.hintBank} ${purchases.hintBank === 1 ? 'hint' : 'hints'} banked.`
					}}
				</p>

				<!-- Where hints can be used right now -->
				<button
					v-if="onDailyGame && (purchases.isPro || purchases.hintBank > 0)"
					type="button"
					class="hint-use"
					@click="useHint"
				>
					<Icon
						name="solar:lightbulb-bolt-bold"
						size="1.1rem"
					/>
					Use a hint now
				</button>
				<p
					v-else-if="!onDailyGame && dailyDone"
					class="hint-shop-context"
				>
					Today's Daily is done. Hints stay in your bank for tomorrow's.
				</p>
				<div
					v-else-if="!onDailyGame"
					class="hint-shop-context"
				>
					<span>Hints are used in the Daily.</span>
					<button
						type="button"
						class="hint-link"
						@click="playDaily"
					>
						Play the Daily
						<Icon
							name="solar:alt-arrow-right-linear"
							size="0.95rem"
						/>
					</button>
				</div>

				<p
					v-if="!purchases.hintPacks.length && !purchases.proProduct"
					class="hint-shop-empty"
				>
					<template v-if="purchases.loadingProducts">Getting prices from the App Store…</template>
					<template v-else>
						Can't reach the App Store to buy more right now.
						{{ purchases.hintBank > 0 || purchases.isPro ? 'Your banked hints still work.' : '' }}
					</template>
					<button
						v-if="!purchases.loadingProducts"
						type="button"
						class="hint-link"
						@click="purchases.init()"
					>
						Try again
					</button>
				</p>
				<button
					v-for="pack in purchases.hintPacks"
					:key="pack.id"
					type="button"
					class="hint-pack"
					:disabled="purchases.busy"
					@click="buyHints(pack)"
				>
					<span class="pack-name">{{ pack.count === 1 ? '1 hint' : `${pack.count} hints` }}</span>
					<span class="pack-price">{{ pack.product.priceString }}</span>
				</button>
				<button
					v-if="purchases.proProduct && !purchases.isPro"
					type="button"
					class="hint-pack pro"
					:disabled="purchases.busy"
					@click="buyPro"
				>
					<span class="pack-name">
						<Icon
							name="solar:crown-linear"
							size="1rem"
						/>
						Pro: unlimited hints
					</span>
					<span class="pack-price">{{ purchases.proProduct.priceString }}</span>
				</button>
				<p
					v-if="purchases.message"
					class="hint-shop-message"
					role="status"
				>
					{{ purchases.message }}
				</p>
			</div>
		</template>
	</PitchCardModal>
</template>

<script setup lang="ts">
	import { computed, defineAsyncComponent, watch } from 'vue'
	import { usePurchasesStore } from '../../stores/purchases'
	import { useGameStore } from '../../stores/game'
	import { useChallengeStore } from '../../stores/challenge'
	import { useTodayProgress } from '../../composables/useTodayProgress'

	// iOS app: the hint shop, opened from the hint pill or the Daily's hint button on
	// any screen. It only reveals a clue when you're actually mid-Daily; anywhere else
	// hints go to the bank and it says where they can be used.
	const PitchCardModal = defineAsyncComponent(() => import('../shared/PitchCardModal.vue'))

	const open = useState('hint-shop-open', () => false)
	const purchases = usePurchasesStore()
	const gameStore = useGameStore()
	const challengeStore = useChallengeStore()
	const progress = useTodayProgress()
	const route = useRoute()

	const onDailyGame = computed(
		() =>
			route.path.startsWith('/play/daily') &&
			!gameStore.showIntro &&
			!gameStore.gameOver &&
			!challengeStore.isActive &&
			gameStore.canPurchaseHint,
	)
	const dailyDone = computed(() => ['won', 'lost'].includes(progress.daily.value.status))

	watch(open, (isOpen) => {
		if (isOpen) {
			progress.refresh()
			// Products may not have loaded at launch (offline, or the store was slow)
			if (!purchases.hintPacks.length) purchases.init()
		} else {
			purchases.message = ''
		}
	})

	function useHint() {
		if (purchases.spendHint()) gameStore.unlockHint()
		open.value = false
	}

	async function buyHints(pack: (typeof purchases.hintPacks)[number]) {
		if (!(await purchases.buyHints(pack))) return
		// Mid-Daily: reveal one straight away. Anywhere else the hints just bank.
		if (onDailyGame.value) useHint()
	}

	async function buyPro() {
		if ((await purchases.buyPro()) && onDailyGame.value) useHint()
	}

	function playDaily() {
		open.value = false
		navigateTo({ path: '/play/daily', query: { start: 'play' } })
	}
</script>

<style scoped lang="scss">
	.hint-shop {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		text-align: left;
		width: 100%;

		.hint-shop-intro,
		.hint-shop-empty {
			color: var(--text-secondary);
			font-size: 0.9rem;
			line-height: 1.4;
			margin: 0 0 0.25rem;

			.hint-link {
				margin-left: 0.3rem;
			}
		}

		.hint-shop-reason {
			display: block;
			font-size: 0.75rem;
			margin-top: 0.35rem;
			opacity: 0.7;
		}

		.hint-shop-balance {
			align-items: center;
			color: var(--pitchcard-accent-win);
			display: flex;
			font-weight: 700;
			gap: 0.4rem;
		}

		.hint-shop-context {
			align-items: center;
			background: var(--bg-primary);
			border: 1px dashed var(--border);
			border-radius: 14px;
			color: var(--text-secondary);
			display: flex;
			flex-wrap: wrap;
			font-size: 0.88rem;
			gap: 0.5rem;
			justify-content: space-between;
			margin: 0;
			padding: 0.7rem 0.9rem;
		}

		.hint-link {
			align-items: center;
			background: none;
			border: 0;
			color: var(--primary-color);
			cursor: pointer;
			display: inline-flex;
			font: inherit;
			font-weight: 800;
			gap: 0.2rem;
			padding: 0;
		}

		.hint-use {
			align-items: center;
			background: var(--primary-color);
			border: 0;
			border-radius: 14px;
			color: var(--bg-primary);
			cursor: pointer;
			display: flex;
			font: inherit;
			font-size: 1rem;
			font-weight: 800;
			gap: 0.45rem;
			justify-content: center;
			min-height: 3rem;
		}

		.hint-pack {
			align-items: center;
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: 14px;
			color: var(--text-primary);
			cursor: pointer;
			display: flex;
			font-family: var(--font-body);
			justify-content: space-between;
			min-height: 3.4rem;
			padding: 0 1rem;

			&:disabled {
				opacity: 0.6;
			}

			&.pro {
				border-color: color-mix(in srgb, var(--tertiary-color) 50%, transparent);
			}

			.pack-name {
				align-items: center;
				display: flex;
				font-size: 1rem;
				font-weight: 800;
				gap: 0.4rem;
			}

			.pack-price {
				background: var(--primary-color);
				border-radius: 999px;
				color: var(--on-success, #fff);
				font-size: 0.9rem;
				font-weight: 800;
				padding: 0.35rem 0.8rem;
			}
		}

		.hint-shop-message {
			font-size: 0.9rem;
			font-weight: 700;
			margin: 0.25rem 0 0;
		}
	}
</style>
