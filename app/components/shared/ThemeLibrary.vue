<template>
	<div class="theme-library">
		<div class="auto-row">
			<div>
				<label id="theme-label">Theme</label>
				<p>Match iPhone switches between Floodlights and Light with your phone.</p>
			</div>
			<button
				type="button"
				role="switch"
				:aria-checked="matchPhone"
				aria-label="Match iPhone"
				:class="['switch', { on: matchPhone }]"
				@click="toggleMatchPhone"
			>
				<span class="knob"></span>
			</button>
		</div>

		<section
			v-for="group in GROUPS"
			:key="group.tier"
			class="theme-group"
			:aria-label="group.title"
		>
			<h5>
				{{ group.title }}
				<small v-if="group.note">{{ group.note }}</small>
			</h5>
			<div class="theme-cards">
				<button
					v-for="t in group.themes"
					:key="t.id"
					type="button"
					:class="['theme-card', { selected: appearance.selectedId === t.id, trying: appearance.preview === t.id }]"
					:aria-pressed="appearance.selectedId === t.id"
					:aria-label="cardLabel(t)"
					@click="appearance.choose(t.id)"
				>
					<span
						class="mini"
						:style="miniStyle(t)"
						aria-hidden="true"
					>
						<span
							class="mini-aa"
							:style="{ fontFamily: t.display || DEFAULT_DISPLAY }"
							>Aa</span
						>
						<span class="mini-tiles">
							<i :style="{ background: t.colours.success }"></i>
							<i :style="{ background: t.colours.present }"></i>
							<i :style="{ background: t.colours.absent }"></i>
						</span>
						<span
							class="mini-bar"
							:style="{ background: t.colours.primary }"
						></span>
					</span>
					<span class="card-name">{{ t.name }}</span>
					<span
						v-if="appearance.selectedId === t.id"
						class="card-state on"
					>
						<Icon
							name="solar:check-circle-bold"
							size="0.85rem"
						/>
						On
					</span>
					<span
						v-else-if="!appearance.canUse(t)"
						class="card-state"
					>
						<Icon
							name="solar:lock-keyhole-minimalistic-bold"
							size="0.8rem"
						/>
						{{ t.tier === 'pack' ? 'Pack' : priceFor(t) || 'Locked' }}
					</span>
				</button>
			</div>
		</section>

		<!-- Trying on a locked theme: the whole app is in it until Settings closes -->
		<div
			v-if="trying"
			class="try-bar"
			role="status"
		>
			<p class="try-title">
				Trying <b>{{ trying.name }}</b>
			</p>
			<template v-if="isApp">
				<button
					v-if="tryingProduct"
					type="button"
					class="buy-button"
					:disabled="purchases.busy"
					@click="buyTrying"
				>
					{{ trying.tier === 'pack' ? 'Get the Colour Pack' : `Get ${trying.name}` }} ·
					{{ tryingProduct.priceString }}
				</button>
				<p
					v-else
					class="try-note"
				>
					{{ purchases.loadingProducts ? 'Getting the price…' : "Can't reach the App Store right now." }}
				</p>
				<p
					v-if="trying.tier === 'pack'"
					class="try-note"
				>
					One purchase unlocks all six colours.
				</p>
				<button
					v-if="purchases.proProduct && !purchases.isPro"
					type="button"
					class="pro-link"
					:disabled="purchases.busy"
					@click="purchases.buyPro()"
				>
					Or get Pro · {{ purchases.proProduct.priceString }} for every theme and unlimited hints
				</button>
				<p
					v-if="purchases.message"
					class="try-note"
				>
					{{ purchases.message }}
				</p>
			</template>
			<p
				v-else
				class="try-note"
			>
				Paid themes are in the Footballdle iPhone app{{ APP_STORE_LIVE ? '' : ', coming soon' }}.
			</p>
			<button
				type="button"
				class="text-button"
				@click="appearance.endPreview()"
			>
				Back to {{ currentName }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onUnmounted } from 'vue'
	import { useAppearanceStore } from '../../stores/appearance'
	import { usePurchasesStore } from '../../stores/purchases'
	import { THEMES, getTheme, type Theme, type ThemeTier } from '../../utils/themes'
	import { APP_STORE_LIVE, THEME_PRODUCT_IDS } from '../../utils/appStore'

	// Not var(--font-display): that's the theme being tried on, not this card's
	const DEFAULT_DISPLAY = "'Archivo Black', 'Arial Black', sans-serif"
	const appearance = useAppearanceStore()
	const purchases = usePurchasesStore()
	const isApp = useRuntimeConfig().public.isApp

	const GROUPS: { tier: ThemeTier; title: string; note?: string; themes: Theme[] }[] = [
		{ tier: 'free', title: 'Free', themes: THEMES.filter(t => t.tier === 'free') },
		{ tier: 'paid', title: 'Themes', note: 'own font and texture', themes: THEMES.filter(t => t.tier === 'paid') },
		{ tier: 'pack', title: 'Colour Pack', note: 'six colours, one purchase', themes: THEMES.filter(t => t.tier === 'pack') },
	]

	const matchPhone = computed(() => appearance.appearance === 'system' && !appearance.theme)

	function toggleMatchPhone() {
		// Off keeps whichever of the two is showing
		if (matchPhone.value) appearance.set(appearance.isLight ? 'light' : 'dark')
		else appearance.set('system')
	}

	const trying = computed(() => (appearance.preview ? getTheme(appearance.preview) : undefined))
	const tryingProduct = computed(() => (trying.value?.productId ? purchases.themeProduct(trying.value.productId) : undefined))

	const currentName = computed(() => {
		if (appearance.theme) return getTheme(appearance.theme)?.name ?? 'Floodlights'
		if (appearance.appearance === 'system') return 'Match iPhone'
		return appearance.appearance === 'light' ? 'Light' : 'Floodlights'
	})

	const priceFor = (t: Theme) => (isApp && t.productId ? purchases.themeProduct(t.productId)?.priceString : '')

	function buyTrying() {
		const t = trying.value
		if (!t?.productId) return
		purchases.buyTheme(t.productId, t.productId === THEME_PRODUCT_IDS.colourPack ? 'Colour Pack' : t.name)
	}

	function cardLabel(t: Theme) {
		if (appearance.selectedId === t.id) return `${t.name}, on`
		if (!appearance.canUse(t)) return `${t.name}, locked. Tap to try it`
		return t.name
	}

	function miniStyle(t: Theme) {
		return {
			background: t.pattern ? `${t.pattern}, ${t.colours.bg}` : t.colours.bg,
			color: t.colours.text,
			borderColor: t.colours.border,
		}
	}

	// Leaving Settings without buying puts the old theme back
	onUnmounted(() => appearance.endPreview())
</script>

<style scoped lang="scss">
	.theme-library {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	// Same as the other Settings headings (their styles are scoped to ThemePickerSettings)
	label {
		color: var(--text-secondary);
		display: block;
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
	}

	p {
		color: var(--text-secondary);
		font-size: 0.9rem;
		margin: 0;
	}

	.auto-row {
		align-items: center;
		display: flex;
		gap: 1rem;
		justify-content: space-between;

		p {
			margin-bottom: 0;
		}
	}

	.theme-group h5 {
		align-items: baseline;
		color: var(--text-primary);
		display: flex;
		flex-wrap: wrap;
		font-size: 0.85rem;
		font-weight: 800;
		gap: 0.5rem;
		margin: 0 0 0.5rem;

		small {
			color: var(--text-secondary);
			font-size: 0.75rem;
			font-weight: 600;
		}
	}

	.theme-cards {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: repeat(auto-fill, minmax(5.6rem, 1fr));
	}

	.theme-card {
		align-items: stretch;
		background: var(--bg-primary);
		border: 1.5px solid var(--border);
		border-radius: 14px;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		font: inherit;
		gap: 0.35rem;
		padding: 0.4rem 0.4rem 0.5rem;
		text-align: left;
		transition: transform 0.1s ease;

		&:active {
			transform: scale(0.96);
		}

		&.selected,
		&.trying {
			border-color: var(--primary-color);
			box-shadow: 0 0 0 3px var(--fl-glow);
		}
	}

	.mini {
		aspect-ratio: 1.25;
		border: 1px solid;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		justify-content: space-between;
		overflow: hidden;
		padding: 0.35rem;
	}

	.mini-aa {
		font-size: 0.95rem;
		line-height: 1;
	}

	.mini-tiles {
		display: flex;
		gap: 3px;

		i {
			aspect-ratio: 1;
			border-radius: 3px;
			flex: 1;
		}
	}

	.mini-bar {
		border-radius: 4px;
		height: 0.4rem;
	}

	.card-name {
		font-size: 0.72rem;
		font-weight: 800;
		line-height: 1.15;
	}

	.card-state {
		align-items: center;
		color: var(--text-secondary);
		display: inline-flex;
		font-size: 0.68rem;
		font-weight: 800;
		gap: 0.2rem;

		&.on {
			color: var(--primary-color);
		}
	}

	.try-bar {
		background: var(--bg-secondary);
		border: 1.5px solid var(--primary-color);
		border-radius: 18px;
		// Clear of the floating tab bar, and above its fade (AppTabBar.vue)
		bottom: calc(env(safe-area-inset-bottom) + 5.4rem);
		box-shadow: 0 12px 30px -12px var(--fl-shadow);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.9rem;
		position: sticky;
		z-index: 51;

		p {
			margin: 0;
		}
	}

	.try-title {
		color: var(--text-primary) !important;
		font-size: 0.95rem !important;
	}

	.try-note {
		font-size: 0.8rem !important;
	}

	.buy-button {
		background: var(--primary-color);
		border: 0;
		border-radius: var(--global-border-radius);
		color: var(--on-primary);
		cursor: pointer;
		font: inherit;
		font-size: 0.95rem;
		font-weight: 800;
		min-height: 46px;
		padding: 0.6rem 1rem;

		&:disabled {
			opacity: 0.5;
		}
	}

	.pro-link,
	.text-button {
		background: none;
		border: 0;
		color: var(--text-secondary);
		cursor: pointer;
		font: inherit;
		font-size: 0.82rem;
		min-height: 44px;
		padding: 0;
		text-align: left;
		text-decoration: underline;
	}

	.pro-link {
		color: var(--primary-color);
		font-weight: 700;
		text-decoration: none;
	}

	.switch {
		background: color-mix(in srgb, var(--text-primary) 18%, transparent);
		border: 0;
		border-radius: 999px;
		cursor: pointer;
		flex-shrink: 0;
		height: 31px;
		padding: 2px;
		transition: background 0.2s ease;
		width: 51px;

		.knob {
			background: #fff;
			border-radius: 50%;
			box-shadow: 0 2px 4px rgb(0 0 0 / 25%);
			display: block;
			height: 27px;
			transition: transform 0.2s ease;
			width: 27px;
		}

		&.on {
			background: var(--color-success);

			.knob {
				transform: translateX(20px);
			}
		}
	}
</style>
