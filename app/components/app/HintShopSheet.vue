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
				<ul
					class="hint-games"
					aria-label="What a hint shows"
				>
					<li
						v-for="game in HINT_GAMES"
						:key="game.name"
					>
						<Icon
							:name="game.icon"
							size="1.1rem"
							class="game-icon"
							aria-hidden="true"
						/>
						<span
							><strong>{{ game.name }}:</strong> {{ game.clues }}</span
						>
					</li>
				</ul>
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
					v-if="onHintGame && (purchases.isPro || purchases.hintBank > 0)"
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
					v-else-if="!onHintGame && !nextGame"
					class="hint-shop-context"
				>
					Today's Daily and Scout Report are done. Hints stay in your bank for tomorrow.
				</p>
				<div
					v-else-if="!onHintGame && nextGame"
					class="hint-shop-context"
				>
					<span>Hints are used in the Daily, Scout Report and The Grid.</span>
					<button
						type="button"
						class="hint-link"
						@click="playNext"
					>
						Play {{ nextGame.label }}
						<Icon
							name="solar:alt-arrow-right-linear"
							size="0.95rem"
						/>
					</button>
				</div>

				<!-- Website: no purchases, so how to earn hints and where to get more -->
				<div
					v-if="!$config.public.isApp"
					class="hint-earn"
				>
					<p class="hint-shop-intro">Earn free hints by:</p>
					<ul>
						<li>
							<Icon
								name="solar:fire-linear"
								size="1rem"
							/>
							Every 5 days of your Daily streak
						</li>
						<li>
							<Icon
								name="solar:card-2-linear"
								size="1rem"
							/>
							Finishing a club's Player Card set
						</li>
					</ul>
					<a
						v-if="APP_STORE_LIVE"
						:href="APP_STORE_URL"
						target="_blank"
						rel="noopener noreferrer"
						class="hint-pack pro"
					>
						<span class="pack-name">
							<Icon
								name="solar:smartphone-linear"
								size="1rem"
							/>
							Get the app for hint packs and Pro
						</span>
						<Icon
							name="solar:alt-arrow-right-linear"
							size="1rem"
						/>
					</a>
					<p
						v-else
						class="hint-shop-intro"
					>
						Hint packs and Pro are coming soon in the Footballdle iPhone app.
					</p>
				</div>
				<template v-else>
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
					<span class="pack-name">
						{{ pack.count === 1 ? '1 hint' : `${pack.count} hints` }}
						<span
							v-if="saleOf(pack.product)"
							class="sale-chip"
						>Sale, ends soon</span>
					</span>
					<span class="pack-prices">
						<s
							v-if="saleOf(pack.product)"
							class="was-price"
						>{{ saleOf(pack.product)?.was }}</s>
						<span class="pack-price">{{ pack.product.priceString }}</span>
					</span>
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
						<span
							v-if="saleOf(purchases.proProduct)"
							class="sale-chip"
						>Sale, ends soon</span>
					</span>
					<span class="pack-prices">
						<s
							v-if="saleOf(purchases.proProduct)"
							class="was-price"
						>{{ saleOf(purchases.proProduct)?.was }}</s>
						<span class="pack-price">{{ purchases.proProduct.priceString }}</span>
					</span>
				</button>
				<p
					v-if="purchases.message"
					class="hint-shop-message"
					role="status"
				>
					{{ purchases.message }}
				</p>
				</template>
			</div>
		</template>
	</PitchCardModal>
</template>

<script setup lang="ts">
	import { computed, defineAsyncComponent, watch } from 'vue'
	import { usePurchasesStore } from '../../stores/purchases'
	import { useGameStore } from '../../stores/game'
	import { useScoutReportStore } from '../../stores/scoutReport'
	import { useGridStore } from '../../stores/grid'
	import { useTodayProgress } from '../../composables/useTodayProgress'
	import { APP_STORE_LIVE, APP_STORE_URL } from '../../utils/appStore'
	import { useSale } from '../../composables/useSale'

	// What one hint shows in each game, in the order the games give them (stores/game.ts,
	// stores/scoutReport.ts, stores/grid.ts). Keep in step if a game's hints change
	const HINT_GAMES = [
		{ name: 'Daily', icon: 'solar:calendar-linear', clues: 'club, nation, position, then letters' },
		{ name: 'Scout Report', icon: 'solar:clipboard-list-linear', clues: 'continent, position and first letters' },
		{ name: 'The Grid', icon: 'solar:widget-4-linear', clues: "a square's first letter" },
	]

	// The hint shop (on the website: how to earn hints, and a link to the app), opened from the
	// hint pill or the Daily's hint button on any screen. It opens on one short row per game saying
	// what a hint shows there. It only reveals a clue when you're actually mid-Daily; anywhere else
	// hints go to the bank and it says where they can be used.
	const PitchCardModal = defineAsyncComponent(() => import('../shared/PitchCardModal.vue'))

	const open = useState('hint-shop-open', () => false)
	const purchases = usePurchasesStore()
	const saleOf = useSale()
	const gameStore = useGameStore()
	const progress = useTodayProgress()
	const route = useRoute()

	const scoutStore = useScoutReportStore()

	const onDailyGame = computed(
		() =>
			route.path.startsWith('/play/daily') &&
			!gameStore.showIntro &&
			!gameStore.gameOver &&
			gameStore.canPurchaseHint,
	)
	const onScoutGame = computed(
		() => route.path.startsWith('/play/scout-report') && !scoutStore.showIntro && scoutStore.canPurchaseHint,
	)
	// Mid-game somewhere a hint can be used right now
	// The Grid: a square picked that a hint can help with
	const gridStore = useGridStore()
	const onGridGame = computed(() => route.path.startsWith('/play/grid') && gridStore.canHintSelected)
	const onHintGame = computed(() => onDailyGame.value || onScoutGame.value || onGridGame.value)
	// Where to send someone who isn't in a game: the first hint game they haven't finished
	const nextGame = computed(() => {
		const done = (status: string) => ['won', 'lost'].includes(status)
		if (!done(progress.daily.value.status)) return { label: 'the Daily', path: '/play/daily' }
		if (!done(progress.scout.value.status)) return { label: 'Scout Report', path: '/play/scout-report' }
		return null
	})

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
		if (purchases.spendHint()) {
			if (onGridGame.value) gridStore.hint()
			else if (onScoutGame.value) scoutStore.unlockHint()
			else gameStore.unlockHint()
		}
		open.value = false
	}

	async function buyHints(pack: (typeof purchases.hintPacks)[number]) {
		if (!(await purchases.buyHints(pack))) return
		// Mid-game: reveal one straight away. Anywhere else the hints just bank.
		if (onHintGame.value) useHint()
	}

	async function buyPro() {
		if ((await purchases.buyPro()) && onHintGame.value) useHint()
	}

	function playNext() {
		if (!nextGame.value) return
		open.value = false
		navigateTo({ path: nextGame.value.path, query: { start: 'play' } })
	}
</script>

<style scoped lang="scss">
	.hint-earn {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;

		ul {
			display: flex;
			flex-direction: column;
			gap: 0.4rem;
			list-style: none;
			margin: 0;
			padding: 0;
		}

		li {
			align-items: center;
			color: var(--text-primary);
			display: flex;
			font-size: 0.9rem;
			gap: 0.5rem;
		}

		a.hint-pack {
			text-decoration: none;
		}
	}

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

		.hint-games {
			display: flex;
			flex-direction: column;
			gap: 0.45rem;
			list-style: none;
			margin: 0 0 0.25rem;
			padding: 0;

			li {
				// flex-start so a wrapped second line sits under the text, not the icon
				align-items: flex-start;
				color: var(--text-secondary);
				display: flex;
				font-size: 0.9rem;
				gap: 0.55rem;
				line-height: 1.35;
			}

			strong {
				color: var(--text-primary);
				font-weight: 800;
			}

			.game-icon {
				color: var(--primary-color);
				flex-shrink: 0;
				margin-top: 0.1rem;
			}
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
				flex-wrap: wrap;
				font-size: 1rem;
				font-weight: 800;
				gap: 0.4rem;
				text-align: left;
			}

			.pack-prices {
				align-items: center;
				display: flex;
				flex-shrink: 0;
				gap: 0.45rem;
			}

			.was-price {
				color: var(--text-secondary);
				font-size: 0.85rem;
				font-weight: 700;
			}

			.pack-price {
				background: var(--primary-color);
				border-radius: 999px;
				color: var(--on-primary);
				font-size: 0.9rem;
				font-weight: 800;
				padding: 0.35rem 0.8rem;
			}
		}

		// Flash sale (utils/sale.ts): only shown while the App Store price really is lower
		.sale-chip {
			background: var(--tertiary-color);
			border-radius: 999px;
			color: var(--on-present, #fff);
			font-size: 0.68rem;
			font-weight: 800;
			letter-spacing: 0.04em;
			padding: 0.2rem 0.5rem;
			white-space: nowrap;
		}

		.hint-shop-message {
			font-size: 0.9rem;
			font-weight: 700;
			margin: 0.25rem 0 0;
		}
	}
</style>
