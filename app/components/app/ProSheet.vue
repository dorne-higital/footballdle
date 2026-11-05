<template>
	<PitchCardModal
		v-if="open"
		heading="Footballdle Pro"
		accent="info"
		variant="small"
		@close="close"
	>
		<template #body>
			<div class="pro-sheet">
				<p
					v-if="purchases.offeringCopy.banner && !purchases.isPro"
					class="pro-banner"
				>
					{{ purchases.offeringCopy.banner }}
				</p>

				<p class="pro-lede">
					{{ purchases.isPro ? 'You have Pro. Everything below is yours, for good.' : 'One purchase, yours for good. No subscription.' }}
				</p>

				<ul class="perks">
					<li>
						<Icon
							name="solar:lightbulb-bold"
							size="1.25rem"
							class="perk-icon"
						/>
						<span>
							<b>Unlimited hints</b>
							In the Daily, Scout Report and The Grid, whenever you're stuck.
						</span>
					</li>
					<li>
						<Icon
							name="solar:palette-bold"
							size="1.25rem"
							class="perk-icon"
						/>
						<span>
							<b>Every theme</b>
							All 12 paid themes and any new ones<template v-if="purchases.themesValue">, worth {{ purchases.themesValue }} on their own</template>.
						</span>
					</li>
					<li>
						<Icon
							name="solar:card-bold"
							size="1.25rem"
							class="perk-icon"
						/>
						<span>
							<b>Free card replays</b>
							Replay a missed Player Card each day without spending a hint.
						</span>
					</li>
					<li>
						<Icon
							name="solar:heart-bold"
							size="1.25rem"
							class="perk-icon"
						/>
						<span>
							<b>Keeps Footballdle ad-free</b>
							No ads, no account, no subscription. Pro is how the game pays its way.
						</span>
					</li>
				</ul>

				<template v-if="!purchases.isPro">
					<button
						v-if="purchases.proProduct"
						type="button"
						class="pro-buy"
						:disabled="purchases.busy"
						@click="buy"
					>
						<span>Get Pro</span>
						<span class="pro-price">
							<span
								v-if="saleOf(purchases.proProduct)"
								class="sale-chip"
								>Sale</span
							>
							<s v-if="saleOf(purchases.proProduct)">{{ saleOf(purchases.proProduct)?.was }}</s>
							{{ purchases.proProduct.priceString }}
						</span>
					</button>
					<button
						v-else
						type="button"
						class="pro-buy"
						:disabled="purchases.loadingProducts"
						@click="purchases.init()"
					>
						{{ purchases.loadingProducts ? 'Getting the price…' : 'Try again' }}
					</button>
					<button
						type="button"
						class="pro-restore"
						:disabled="purchases.busy"
						@click="purchases.restore()"
					>
						Already bought it? Restore purchases
					</button>
				</template>

				<p
					v-if="purchases.message"
					class="pro-message"
					role="status"
				>
					{{ purchases.message }}
				</p>
			</div>
		</template>
	</PitchCardModal>
</template>

<script setup lang="ts">
	import { watch } from 'vue'
	import { track } from '../../utils/appGlance'
	import { usePurchasesStore } from '../../stores/purchases'
	import { useSale } from '../../composables/useSale'

	// One place that says what Pro includes (1.3, plan M1). Opened from the hint shop's Pro
	// row, Settings and the Theme Library, so Pro is described the same way everywhere.
	const open = useState('pro-sheet-open', () => false)
	// Set by the hint shop when it opened this mid-game: after buying, go back to it so
	// the now-free hint is one tap away
	const backToHints = useState('pro-sheet-back-to-hints', () => false)
	const hintShopOpen = useState('hint-shop-open', () => false)
	const purchases = usePurchasesStore()
	const saleOf = useSale()

	watch(open, (isOpen) => {
		if (isOpen) {
			track('paywall.viewed', { where: 'pro_sheet' })
			purchases.message = ''
			if (!purchases.proProduct) purchases.init()
		} else {
			backToHints.value = false
		}
	})

	async function buy() {
		if (!(await purchases.buyPro())) return
		if (backToHints.value) {
			open.value = false
			hintShopOpen.value = true
		}
	}

	function close() {
		open.value = false
		purchases.message = ''
	}
</script>

<style scoped lang="scss">
	.pro-sheet {
		display: grid;
		gap: 1rem;
		text-align: left;
	}

	.pro-banner {
		background: var(--color-present);
		border-radius: var(--global-border-radius);
		color: var(--on-present, #1b1203);
		font-size: 0.9rem;
		font-weight: 700;
		margin: 0;
		padding: 0.55rem 0.8rem;
		text-align: center;
	}

	.pro-lede {
		color: var(--text-secondary);
		font-size: 0.95rem;
		margin: 0;
	}

	.perks {
		display: grid;
		gap: 0.85rem;
		list-style: none;
		margin: 0;
		padding: 0;

		li {
			align-items: start;
			display: grid;
			gap: 0.75rem;
			grid-template-columns: 1.6rem 1fr;
		}

		span {
			color: var(--text-secondary);
			font-size: 0.9rem;
			line-height: 1.45;
		}

		b {
			color: var(--text-primary);
			display: block;
			font-size: 1rem;
		}
	}

	.perk-icon {
		color: var(--primary-color);
		margin-top: 0.1rem;
	}

	.pro-buy {
		align-items: center;
		background: var(--primary-color);
		border: 0;
		border-radius: var(--global-border-radius);
		color: var(--on-primary, #04130b);
		cursor: pointer;
		display: flex;
		font-size: 1.05rem;
		font-weight: 700;
		justify-content: space-between;
		min-height: 52px;
		padding: 0.8rem 1.1rem;

		&:disabled {
			opacity: 0.6;
		}
	}

	.pro-price {
		align-items: center;
		display: inline-flex;
		gap: 0.45rem;

		s {
			font-weight: 500;
			opacity: 0.7;
		}
	}

	.sale-chip {
		background: var(--on-primary, #04130b);
		border-radius: 999px;
		color: var(--primary-color);
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.04em;
		padding: 0.15rem 0.45rem;
		text-transform: uppercase;
	}

	.pro-restore {
		background: none;
		border: 0;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 0.85rem;
		justify-self: center;
		padding: 0.25rem;
		text-decoration: underline;
	}

	.pro-message {
		color: var(--text-secondary);
		font-size: 0.9rem;
		margin: 0;
		text-align: center;
	}
</style>
