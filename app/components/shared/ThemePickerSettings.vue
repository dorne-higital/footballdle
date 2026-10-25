<template>
	<div class="settings-section">
		<div
			v-if="!$config.public.appShell"
			class="setting-group"
		>
			<label>Choose Theme</label>
			<p>Select your preferred theme</p>

			<div class="theme-grid">
				<button
					:class="['theme-option', { active: themeStore.currentTheme === 'light' }]"
					@click="themeStore.setTheme('light')"
				>
					<div class="theme-preview light">
						<div class="preview-header"></div>
						<div class="preview-content">
							<div class="preview-tile"></div>
							<div class="preview-tile correct"></div>
							<div class="preview-tile"></div>
						</div>
					</div>
					<span class="theme-name">Light</span>
				</button>

				<button
					:class="['theme-option', { active: themeStore.currentTheme === 'dark' }]"
					@click="themeStore.setTheme('dark')"
				>
					<div class="theme-preview dark">
						<div class="preview-header"></div>
						<div class="preview-content">
							<div class="preview-tile"></div>
							<div class="preview-tile correct"></div>
							<div class="preview-tile"></div>
						</div>
					</div>
					<span class="theme-name">Dark</span>
				</button>

				<button
					:class="['theme-option', { active: themeStore.currentTheme === 'greyscale' }]"
					@click="themeStore.setTheme('greyscale')"
				>
					<div class="theme-preview greyscale">
						<div class="preview-header"></div>
						<div class="preview-content">
							<div class="preview-tile"></div>
							<div class="preview-tile correct"></div>
							<div class="preview-tile"></div>
						</div>
					</div>
					<span class="theme-name">Greyscale</span>
				</button>

				<button
					:class="['theme-option', { active: themeStore.currentTheme === 'pastel' }]"
					@click="themeStore.setTheme('pastel')"
				>
					<div class="theme-preview pastel">
						<div class="preview-header"></div>
						<div class="preview-content">
							<div class="preview-tile"></div>
							<div class="preview-tile correct"></div>
							<div class="preview-tile"></div>
						</div>
					</div>
					<span class="theme-name">Pastel</span>
				</button>
			</div>
		</div>

		<div
			v-if="!$config.public.isApp"
			class="setting-group support-group"
		>
			<label>Support Footballdle</label>
			<p>Enjoying the game? Help keep it free.</p>
			<a
				href="https://buymeacoffee.com/dhorne92E"
				target="_blank"
				rel="noopener noreferrer"
				class="coffee-button"
				@click.prevent="$emit('buy-coffee', 'settings_modal')"
			>
				<Icon
					name="uil:coffee"
					size="1rem"
				/>
				Buy me a <span class="accent">coffee</span>
			</a>
		</div>

		<!-- App look (iPhone app and website): a one-screen menu like iPhone Settings, with
		     the long parts (themes, accessibility, purchases, tips) on their own pages -->
		<div
			v-if="$config.public.appShell"
			ref="menuEl"
			class="settings-menu"
		>
			<template v-if="view === 'home'">
				<!-- Pro, or on the website the app itself -->
				<div
					v-if="!$config.public.isApp"
					class="support-group hero-card"
				>
					<span class="hero-title">Footballdle on iPhone</span>
					<p>Hint packs and Pro for unlimited hints, Player Cards backed up to iCloud, and Game Center leaderboards.</p>
					<a
						v-if="APP_STORE_LIVE"
						:href="APP_STORE_URL"
						target="_blank"
						rel="noopener noreferrer"
						class="store-button pro-button"
					>
						<Icon
							name="solar:smartphone-linear"
							size="1rem"
						/>
						Get the app
					</a>
					<p
						v-else
						class="coming-soon"
					>
						Coming soon to the App Store.
					</p>
				</div>
				<div
					v-else-if="purchases.isPro"
					class="support-group hero-card"
				>
					<span class="hero-title">
						<Icon
							name="solar:crown-bold"
							size="1rem"
						/>
						Footballdle Pro
					</span>
					<p>Pro unlocked. Hints are on the house and every theme is yours. Cheers for the support!</p>
				</div>
				<div
					v-else
					class="support-group hero-card"
				>
					<span class="hero-title">
						<Icon
							name="solar:crown-bold"
							size="1rem"
						/>
						Footballdle Pro
					</span>
					<p>
						Unlimited hints in the Daily and Scout Report, plus every theme, for good. One-off purchase, no subscription.
						<template v-if="purchases.hintBank > 0">
							You have {{ purchases.hintBank }} {{ purchases.hintBank === 1 ? 'hint' : 'hints' }} in the bank.
						</template>
					</p>
					<button
						v-if="purchases.proProduct"
						type="button"
						class="store-button pro-button"
						:disabled="purchases.busy"
						@click="purchases.buyPro()"
					>
						Get Pro · {{ purchases.proProduct.priceString }}
					</button>
					<button
						v-else-if="purchases.loadingProducts"
						type="button"
						class="store-button pro-button"
						disabled
					>
						<Icon
							name="solar:refresh-linear"
							size="1rem"
							class="spin"
						/>
						Getting the price…
					</button>
					<button
						v-else
						type="button"
						class="store-button"
						@click="purchases.init()"
					>
						<Icon
							name="solar:refresh-linear"
							size="1rem"
						/>
						Try again
					</button>
					<p
						v-if="!purchases.proProduct && !purchases.loadingProducts && purchases.loadError"
						class="store-status"
					>
						{{ purchases.loadError }} Check your connection and tap Try again.
					</p>
					<p
						v-if="purchases.message"
						class="store-message"
					>
						{{ purchases.message }}
					</p>
				</div>

				<template v-if="reminders.isAvailable || gameCenter.isAvailable">
					<h3 class="group-label">Play</h3>
					<div class="menu-list">
						<div
							v-if="reminders.isAvailable"
							class="menu-row reminder-row"
						>
							<div class="row-main">
								<span class="row-icon"><Icon
									name="solar:bell-linear"
									size="1.05rem"
								/></span>
								<span class="row-text">
									<span class="row-label">Daily reminder</span>
									<span class="row-hint">Skipped on days you've already played</span>
								</span>
								<button
									type="button"
									role="switch"
									:aria-checked="reminders.enabled"
									aria-label="Daily reminder"
									:class="['switch', { on: reminders.enabled }]"
									@click="toggleReminder"
								>
									<span class="knob"></span>
								</button>
							</div>
							<div
								v-if="reminders.enabled"
								class="reminder-times"
								role="radiogroup"
								aria-label="Reminder time"
							>
								<button
									v-for="h in REMINDER_HOURS"
									:key="h"
									type="button"
									role="radio"
									:aria-checked="reminders.hour === h"
									:class="['time-chip', { active: reminders.hour === h }]"
									@click="reminders.setHour(h)"
								>
									{{ formatHour(h) }}
								</button>
							</div>
							<p
								v-if="reminders.denied"
								class="store-status"
							>
								Notifications are turned off for Footballdle. Switch them on in iPhone Settings → Notifications.
							</p>
						</div>
						<button
							v-if="gameCenter.isAvailable"
							type="button"
							class="menu-row"
							@click="gameCenter.showLeaderboards()"
						>
							<span class="row-icon"><Icon
								name="uil:trophy"
								size="1.05rem"
							/></span>
							<span class="row-label">Leaderboards</span>
							<Icon
								name="solar:alt-arrow-right-linear"
								size="1rem"
								class="chevron"
							/>
						</button>
					</div>
				</template>

				<h3 class="group-label">Look &amp; feel</h3>
				<div class="menu-list">
					<button
						type="button"
						class="menu-row"
						@click="go('themes')"
					>
						<span class="row-icon"><Icon
							name="solar:palette-linear"
							size="1.05rem"
						/></span>
						<span class="row-label">Themes</span>
						<span class="row-value">{{ themeSummary }}</span>
						<Icon
							name="solar:alt-arrow-right-linear"
							size="1rem"
							class="chevron"
						/>
					</button>
					<button
						type="button"
						class="menu-row"
						@click="go('accessibility')"
					>
						<span class="row-icon"><Icon
							name="solar:accessibility-linear"
							size="1.05rem"
						/></span>
						<span class="row-label">Accessibility</span>
						<span class="row-value">{{ accessibilitySummary }}</span>
						<Icon
							name="solar:alt-arrow-right-linear"
							size="1rem"
							class="chevron"
						/>
					</button>
				</div>

				<h3 class="group-label">More</h3>
				<div class="menu-list">
					<template v-if="$config.public.isApp">
						<button
							type="button"
							class="menu-row"
							@click="go('purchases')"
						>
							<span class="row-icon"><Icon
								name="solar:bill-list-linear"
								size="1.05rem"
							/></span>
							<span class="row-label">Purchases &amp; codes</span>
							<Icon
								name="solar:alt-arrow-right-linear"
								size="1rem"
								class="chevron"
							/>
						</button>
						<button
							v-if="purchases.tipProducts.length"
							type="button"
							class="menu-row"
							@click="go('tips')"
						>
							<span class="row-icon"><Icon
								name="uil:coffee"
								size="1.05rem"
							/></span>
							<span class="row-label">Tip Jar</span>
							<Icon
								name="solar:alt-arrow-right-linear"
								size="1rem"
								class="chevron"
							/>
						</button>
					</template>
					<a
						v-else
						href="https://buymeacoffee.com/dhorne92E"
						target="_blank"
						rel="noopener noreferrer"
						class="menu-row"
						@click.prevent="$emit('buy-coffee', 'settings_modal')"
					>
						<span class="row-icon"><Icon
							name="uil:coffee"
							size="1.05rem"
						/></span>
						<span class="row-label">Buy me a coffee</span>
						<Icon
							name="solar:alt-arrow-right-linear"
							size="1rem"
							class="chevron"
						/>
					</a>
				</div>

				<h3 class="group-label">Help</h3>
				<div :class="['help-tiles', { pairs: helpTiles.length % 3 !== 0 }]">
					<template
						v-for="tile in helpTiles"
						:key="tile.label"
					>
						<NuxtLink
							v-if="tile.to"
							:to="tile.to"
							class="help-tile"
							@click="modalsStore.closeSettings()"
						>
							<Icon
								:name="tile.icon"
								size="1.3rem"
							/>
							{{ tile.label }}
						</NuxtLink>
						<a
							v-else-if="tile.href"
							:href="tile.href"
							target="_blank"
							rel="noopener noreferrer"
							class="help-tile"
						>
							<Icon
								:name="tile.icon"
								size="1.3rem"
							/>
							{{ tile.label }}
						</a>
						<button
							v-else
							type="button"
							class="help-tile"
							@click="tile.action?.()"
						>
							<Icon
								:name="tile.icon"
								size="1.3rem"
							/>
							{{ tile.label }}
						</button>
					</template>
				</div>

				<!-- iPhone app: the version, and a hidden tester reset behind 7 taps on it -->
				<div
					v-if="$config.public.isApp && appVersion"
					class="version-footer"
				>
					<button
						type="button"
						class="version-label"
						@click="tapVersion"
					>
						Footballdle {{ appVersion }}
					</button>
					<div
						v-if="testerTools"
						class="tester-tools"
					>
						<p>Tester tools. Resets your hint balance to {{ WELCOME_HINT_COUNT }} on this iPhone and in iCloud.</p>
						<p
							v-if="resetDone"
							class="tester-done"
							role="status"
						>
							Hints reset to {{ WELCOME_HINT_COUNT }}.
						</p>
						<div
							v-else
							class="tester-actions"
						>
							<button
								type="button"
								class="tester-reset"
								@click="resetHints"
							>
								Reset hints to {{ WELCOME_HINT_COUNT }}
							</button>
							<button
								type="button"
								class="tester-cancel"
								@click="testerTools = false"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</template>

			<!-- A sub-page: back to the menu, then its settings -->
			<template v-else>
				<div class="sub-head">
					<button
						type="button"
						class="back-button"
						@click="go('home')"
					>
						<Icon
							name="solar:alt-arrow-left-linear"
							size="1.1rem"
						/>
						Settings
					</button>
					<h3 class="sub-title">{{ VIEW_TITLES[view] }}</h3>
				</div>

				<div
					v-if="view === 'themes'"
					class="setting-group support-group themes-page"
				>
					<ThemeLibrary />
				</div>

				<div
					v-else-if="view === 'accessibility'"
					class="setting-group support-group accessibility-group"
				>
					<div class="reminder-head">
						<div>
							<span class="option-name">High-contrast tiles</span>
							<p>Orange for right and blue for close, with a dot on right letters. Works with every theme.</p>
						</div>
						<button
							type="button"
							role="switch"
							:aria-checked="accessibility.highContrast"
							aria-label="High-contrast tiles"
							:class="['switch', { on: accessibility.highContrast }]"
							@click="accessibility.update({ highContrast: !accessibility.highContrast })"
						>
							<span class="knob"></span>
						</button>
					</div>
					<div class="reminder-head">
						<div>
							<span class="option-name">Relaxed timer</span>
							<p>16 seconds a round in Spot the Baller. Scores stay off its Game Center leaderboard.</p>
						</div>
						<button
							type="button"
							role="switch"
							:aria-checked="accessibility.relaxedTimer"
							aria-label="Relaxed timer"
							:class="['switch', { on: accessibility.relaxedTimer }]"
							@click="accessibility.update({ relaxedTimer: !accessibility.relaxedTimer })"
						>
							<span class="knob"></span>
						</button>
					</div>
					<div
						v-if="$config.public.isApp"
						class="reminder-head"
					>
						<div>
							<span class="option-name">Haptics</span>
							<p>Little taps when you type, win or lose.</p>
						</div>
						<button
							type="button"
							role="switch"
							:aria-checked="accessibility.haptics"
							aria-label="Haptics"
							:class="['switch', { on: accessibility.haptics }]"
							@click="accessibility.update({ haptics: !accessibility.haptics })"
						>
							<span class="knob"></span>
						</button>
					</div>
					<span class="option-name">Text size</span>
					<div
						class="reminder-times"
						role="radiogroup"
						aria-label="Text size"
					>
						<button
							v-for="size in TEXT_SIZES"
							:key="size.id"
							type="button"
							role="radio"
							:aria-checked="accessibility.textSize === size.id"
							:class="['time-chip', { active: accessibility.textSize === size.id }]"
							@click="accessibility.update({ textSize: size.id })"
						>
							{{ size.label }}
						</button>
					</div>
				</div>

				<div
					v-else-if="view === 'purchases'"
					class="setting-group support-group"
				>
					<p>
						New iPhone, or reinstalled? Restore brings back what you've bought.
						<template v-if="purchases.hintBank > 0">
							You have {{ purchases.hintBank }} {{ purchases.hintBank === 1 ? 'hint' : 'hints' }} in the bank.
						</template>
					</p>
					<!-- Restore, and Apple's sheet for offer codes (free Pro or hints from a creator or event) -->
					<div class="menu-list">
						<button
							type="button"
							class="menu-row"
							:disabled="purchases.busy"
							@click="purchases.restore()"
						>
							<span class="row-icon"><Icon
								name="solar:refresh-linear"
								size="1.05rem"
							/></span>
							<span class="row-text">
								<span class="row-label">Restore purchases</span>
								<span class="row-hint">Brings back Pro and your themes</span>
							</span>
						</button>
						<button
							type="button"
							class="menu-row"
							:disabled="purchases.busy"
							@click="purchases.redeemCode()"
						>
							<span class="row-icon"><Icon
								name="solar:tag-price-linear"
								size="1.05rem"
							/></span>
							<span class="row-text">
								<span class="row-label">Redeem a code</span>
								<span class="row-hint">Free hints or Pro, from Apple's code sheet</span>
							</span>
						</button>
					</div>
					<p
						v-if="purchases.message"
						class="store-message"
					>
						{{ purchases.message }}
					</p>
				</div>

				<div
					v-else-if="view === 'tips'"
					class="setting-group support-group"
				>
					<p>Enjoying the game? A tip doesn't unlock anything, it just keeps Footballdle going.</p>
					<div class="tip-list">
						<button
							v-for="(product, i) in purchases.tipProducts"
							:key="product.identifier"
							type="button"
							class="tip-option"
							:disabled="purchases.busy"
							:aria-label="`${TIP_SIZES[i]} tip, ${product.priceString}`"
							@click="purchases.tip(product)"
						>
							<CoinStack :count="i + 1" />
							<span class="tip-name">{{ TIP_SIZES[i] }}</span>
							<span class="tip-price">{{ product.priceString }}</span>
						</button>
					</div>
					<p
						v-if="purchases.message"
						class="store-message"
					>
						{{ purchases.message }}
					</p>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
	import { App } from '@capacitor/app'
	import { Share } from '@capacitor/share'
	import { Capacitor } from '@capacitor/core'
	import { useThemeStore } from '../../stores/theme'
	import { usePurchasesStore, WELCOME_HINTS as WELCOME_HINT_COUNT } from '../../stores/purchases'
	import { useGameCenter } from '../../composables/useGameCenter'
	import { useModalsStore } from '../../stores/modals'
	import CoinStack from './CoinStack.vue'
	import { REMINDER_HOURS, useRemindersStore } from '../../stores/reminders'
	import ThemeLibrary from './ThemeLibrary.vue'
	import { TEXT_SIZES, useAccessibilityStore } from '../../stores/accessibility'
	import { APP_STORE_LIVE, APP_STORE_URL } from '../../utils/appStore'
	import { useAppearanceStore } from '../../stores/appearance'
	import { getTheme } from '../../utils/themes'

	// Tip products come in order small, medium, large (TIP_PRODUCT_IDS)
	const TIP_SIZES = ['Small', 'Medium', 'Large']

	const reminders = useRemindersStore()
	const accessibility = useAccessibilityStore()
	// Purchase messages belong to this visit to Settings, not the next one
	onUnmounted(() => (usePurchasesStore().message = ''))
	// Products may not have loaded at launch (offline, or the store was slow)
	onMounted(() => {
		const store = usePurchasesStore()
		if (!store.products.length) store.init()
	})
	reminders.load()

	async function toggleReminder() {
		if (reminders.enabled) await reminders.disable()
		else await reminders.enable()
	}

	const formatHour = (h: number) => (h === 12 ? 'Midday' : h < 12 ? `${h}am` : `${h - 12}pm`)

	const themeStore = useThemeStore()
	const purchases = usePurchasesStore()
	const gameCenter = useGameCenter()
	const modalsStore = useModalsStore()

	// Version line (iPhone app), with the hidden tester reset behind 7 quick taps
	const TESTER_TAPS = 7
	const appVersion = ref('')
	const testerTools = ref(false)
	const resetDone = ref(false)
	let taps = 0
	let tapTimer: ReturnType<typeof setTimeout> | undefined
	onMounted(async () => {
		if (!Capacitor.isNativePlatform()) return
		try {
			const info = await App.getInfo()
			appVersion.value = `${info.version} (${info.build})`
		} catch {}
	})
	function tapVersion() {
		clearTimeout(tapTimer)
		tapTimer = setTimeout(() => (taps = 0), 1500)
		if (++taps < TESTER_TAPS) return
		taps = 0
		resetDone.value = false
		testerTools.value = true
	}
	function tellAMate() {
		Share.share({ text: 'Fancy a daily football puzzle? Try Footballdle', url: APP_STORE_URL }).catch(() => {})
	}

	// The menu and its sub-pages. Not routes, so it works the same in the Settings tab
	// and in the sheet the game screens open
	type SettingsView = 'home' | 'themes' | 'accessibility' | 'purchases' | 'tips'
	const VIEW_TITLES: Record<Exclude<SettingsView, 'home'>, string> = {
		themes: 'Themes',
		accessibility: 'Accessibility',
		purchases: 'Purchases & codes',
		tips: 'Tip Jar',
	}
	const view = ref<SettingsView>('home')
	const menuEl = ref<HTMLElement>()
	async function go(next: SettingsView) {
		view.value = next
		await nextTick()
		// Back to the top of whatever scrolls: the sheet's body, or the page
		let el = menuEl.value?.parentElement
		while (el && el !== document.body) {
			if (el.scrollHeight > el.clientHeight && /auto|scroll/.test(getComputedStyle(el).overflowY)) {
				el.scrollTop = 0
				return
			}
			el = el.parentElement
		}
		window.scrollTo(0, 0)
	}

	const appearance = useAppearanceStore()
	const themeSummary = computed(() =>
		appearance.appearance === 'system' && !appearance.theme
			? 'Match iPhone'
			: (getTheme(appearance.selectedId)?.name ?? ''),
	)
	const accessibilitySummary = computed(() => {
		const on = [
			accessibility.highContrast && 'High contrast',
			accessibility.relaxedTimer && 'Relaxed timer',
			accessibility.textSize !== 'default' && 'Large text',
		].filter(Boolean)
		return on.length ? on.join(', ') : 'Standard'
	})

	interface HelpTile { label: string; icon: string; to?: string; href?: string; action?: () => void }
	const helpTiles = computed(() => {
		const native = useRuntimeConfig().public.isApp && APP_STORE_LIVE
		const tiles: (HelpTile | false)[] = [
			{ label: 'How to play', icon: 'solar:question-circle-linear', to: '/how-to-play' },
			{ label: 'Feedback', icon: 'solar:chat-round-line-linear', to: '/feedback' },
			native && { label: 'Rate us', icon: 'solar:star-linear', href: `${APP_STORE_URL}?action=write-review` },
			// No reward for following (App Review 3.2.2); hint codes are posted there instead
			{ label: 'Instagram', icon: 'ri:instagram-line', href: 'https://www.instagram.com/_footballdle/' },
			native && { label: 'Tell a mate', icon: 'solar:share-linear', action: tellAMate },
			{ label: 'Privacy', icon: 'solar:shield-check-linear', to: '/privacy-policy' },
		]
		return tiles.filter((t): t is HelpTile => !!t)
	})

	function resetHints() {
		purchases.resetHintBank()
		resetDone.value = true
	}

	defineEmits(['buy-coffee'])
</script>

<style scoped lang="scss">
	.settings-section {
		width: 100%;

		.accessibility-group {
			display: grid;
			gap: 0.85rem;

			.option-name {
				color: var(--text-primary);
				display: block;
				font-size: 0.95rem;
				font-weight: 700;
			}

			.reminder-head p {
				margin: 0.15rem 0 0;
			}

			.reminder-times {
				margin-top: -0.4rem;
			}
		}

		.version-footer {
			display: grid;
			gap: 0.75rem;
			justify-items: center;
			padding: 1.5rem 0 0.5rem;
		}

		.version-label {
			background: none;
			border: 0;
			color: var(--text-secondary);
			font-family: var(--font-body);
			font-size: 0.8rem;
			padding: 0.5rem 1rem;
			-webkit-user-select: none;
			user-select: none;
		}

		.tester-tools {
			border: 1px dashed var(--border);
			border-radius: var(--global-border-radius);
			display: grid;
			gap: 0.6rem;
			padding: 0.9rem 1rem;
			text-align: left;
			width: 100%;

			p {
				color: var(--text-secondary);
				font-size: 0.85rem;
				margin: 0;
			}

			.tester-done {
				color: var(--primary-color);
				font-weight: 700;
			}
		}

		.tester-actions {
			display: flex;
			gap: 0.5rem;

			button {
				border-radius: var(--global-border-radius);
				font-family: var(--font-body);
				font-size: 0.85rem;
				font-weight: 700;
				padding: 0.55rem 1rem;
			}

			.tester-reset {
				background: var(--primary-color);
				border: 0;
				color: var(--on-primary);
			}

			.tester-cancel {
				background: none;
				border: 1px solid var(--border);
				color: var(--text-primary);
			}
		}

		.support-group {
			border-top: 1px solid var(--border);
			padding-top: 1.5rem;
			text-align: left;

			// In the app the theme picker is hidden, so this can be the first group
			&:first-child {
				border-top: 0;
				padding-top: 0.5rem;
			}

			.coffee-button,
			.store-button {
				align-items: center;
				background: var(--text-primary);
				border: 1.5px solid var(--text-primary);
				border-radius: var(--global-border-radius);
				color: var(--bg-secondary);
				display: inline-flex;
				font-family: var(--font-body);
				font-size: 0.9rem;
				font-weight: 700;
				gap: 0.55rem;
				margin-top: 0.5rem;
				padding: 0.65rem 1.25rem;
				text-decoration: none;
				transition: all 0.2s ease;

				.accent {
					color: var(--tertiary-color);
				}

				// Pro is the one thing for sale here, so it gets the brand colour
				&.pro-button {
					background: var(--primary-color);
					border-color: var(--primary-color);
					color: var(--on-primary);
				}

				.spin {
					animation: spin 1s linear infinite;
				}

				&:hover:not(:disabled) {
					box-shadow: 0 10px 24px -12px rgb(24 32 25 / 35%);
					transform: translateY(-2px);
				}

				&:disabled {
					cursor: default;
					opacity: 0.5;
				}
			}

			// Tip names come from App Store Connect, so they can be renamed without a release
			.tip-list {
				display: grid;
				gap: 0.5rem;
				grid-template-columns: repeat(3, 1fr);
				width: 100%;
			}

			.tip-option {
				align-items: center;
				background: var(--bg-primary);
				border: 1px solid var(--border);
				border-radius: 16px;
				color: var(--text-primary);
				cursor: pointer;
				display: flex;
				flex-direction: column;
				font-family: var(--font-body);
				gap: 0.35rem;
				padding: 0.85rem 0.4rem 0.75rem;
				transition: transform 0.1s ease;

				&:active:not(:disabled) {
					transform: scale(0.96);
				}

				&:disabled {
					opacity: 0.6;
				}

				.tip-name {
					color: var(--text-secondary);
					font-size: 0.75rem;
					font-weight: 800;
					letter-spacing: 0.06em;
					text-transform: uppercase;
				}

				.tip-price {
					background: var(--tertiary-color);
					border-radius: 999px;
					color: var(--on-present, #fff);
					font-size: 0.85rem;
					font-weight: 800;
					padding: 0.3rem 0.7rem;
				}
			}
		}

		.coming-soon {
			color: var(--primary-color);
			font-size: 0.9rem;
			font-weight: 700;
			margin: 0.5rem 0 0;
		}

		.store-message {
			color: var(--text-primary);
			font-size: 0.9rem;
			font-weight: 600;
			margin: 0;
		}

		.setting-group {
			align-items: flex-start;
			display: flex;
			flex-direction: column;
			margin-bottom: 2rem;
			width: 100%;

			label {
				color: var(--text-secondary);
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
				margin: 0 0 1rem;
			}

			.theme-grid {
				display: grid;
				gap: 0.85rem;
				grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
				width: 100%;

				.theme-option {
					background: var(--bg-secondary);
					border: 1.5px solid var(--border);
					border-radius: var(--global-border-radius);
					cursor: pointer;
					overflow: hidden;
					padding: 1rem;
					position: relative;
					text-align: center;
					transition: all 0.2s ease;

					&:hover {
						border-color: var(--border-hover);
						box-shadow: 0 10px 24px -16px rgb(24 32 25 / 25%);
					}

					&.active {
						background: var(--primary-color);
						border-color: var(--primary-color);
						box-shadow: 0 10px 24px -14px rgb(24 32 25 / 30%);
						color: #fff;
					}

					.theme-preview {
						border-radius: calc(var(--global-border-radius) - 4px);
						height: 60px;
						margin-bottom: 0.65rem;
						overflow: hidden;
						width: 100%;

						.preview-header {
							background: var(--bg-primary);
							border-bottom: 1px solid var(--border);
							height: 20px;
						}

						.preview-content {
							align-items: center;
							background: var(--bg-secondary);
							display: flex;
							gap: 0.25rem;
							height: 40px;
							justify-content: center;
							padding: 0.5rem;

							.preview-tile {
								background: var(--bg-primary);
								border: 1px solid var(--border);
								border-radius: 2px;
								height: 1.5rem;
								width: 1.5rem;

								&.correct {
									background: var(--primary-color);
									border-color: var(--primary-color);
								}
							}
						}

						&.light {
							.preview-header {
								background: #f6f7f3;
							}

							.preview-content {
								background: #fff;

								.preview-tile {
									background: #f6f7f3;
									border-color: rgb(24 32 25 / 15%);

									&.correct {
										background: #1e7a46;
										border-color: #1e7a46;
									}
								}
							}
						}

						&.dark {
							.preview-header {
								background: #10160f;
							}

							.preview-content {
								background: #182019;

								.preview-tile {
									background: #10160f;
									border-color: rgb(255 255 255 / 15%);

									&.correct {
										background: #3fae73;
										border-color: #3fae73;
									}
								}
							}
						}

						&.greyscale {
							.preview-header {
								background: #fff;
							}

							.preview-content {
								background: #f0f0f0;

								.preview-tile {
									background: #fff;
									border-color: #000;

									&.correct {
										background: #095000;
										border-color: #095000;
									}
								}
							}
						}

						&.pastel {
							.preview-header {
								background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
							}

							.preview-content {
								background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);

								.preview-tile {
									background: #f0f9ff;
									border-color: #bae6fd;

									&.correct {
										background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
										border-color: #0ea5e9;
									}
								}
							}
						}
					}

					.theme-name {
						display: block;
						font-size: 0.85rem;
						font-weight: 600;
					}
				}
			}
		}
	}
	// The menu: grouped rows like iPhone Settings
	.settings-menu {
		display: grid;
		gap: 0.5rem;
		padding-bottom: 0.5rem;

		.hero-card {
			background: color-mix(in srgb, var(--primary-color) 12%, var(--bg-secondary));
			border: 1px solid color-mix(in srgb, var(--primary-color) 35%, var(--border));
			border-radius: 1.1rem;
			display: grid;
			gap: 0.35rem;
			justify-items: start;
			padding: 1rem 1.1rem 1.1rem;

			&:first-child {
				padding-top: 1rem;
			}

			.hero-title {
				align-items: center;
				color: var(--text-primary);
				display: flex;
				font-family: var(--font-display);
				font-size: 1.05rem;
				gap: 0.4rem;
			}

			p {
				color: var(--text-secondary);
				font-size: 0.88rem;
				margin: 0;
			}

			.store-button {
				margin-top: 0.4rem;
			}
		}

		.group-label {
			color: var(--text-secondary);
			font-family: var(--font-display);
			font-size: 0.72rem;
			font-weight: 700;
			letter-spacing: 0.14em;
			margin: 0.9rem 0 0 0.25rem;
			text-transform: uppercase;
		}

		.menu-list {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 1rem;
			overflow: hidden;
		}

		.menu-row {
			align-items: center;
			background: none;
			border: 0;
			color: var(--text-primary);
			cursor: pointer;
			display: flex;
			font: inherit;
			gap: 0.75rem;
			min-height: 52px;
			padding: 0.5rem 0.9rem;
			text-align: left;
			text-decoration: none;
			width: 100%;

			& + .menu-row {
				border-top: 1px solid var(--border);
			}

			&:active {
				background: color-mix(in srgb, var(--text-primary) 6%, transparent);
			}
		}

		.reminder-row {
			cursor: default;
			display: block;
			padding-block: 0.6rem;

			&:active {
				background: none;
			}

			.row-main {
				align-items: center;
				display: flex;
				gap: 0.75rem;
			}

			.reminder-times {
				margin-top: 0.6rem;
			}
		}

		.row-icon {
			align-items: center;
			background: color-mix(in srgb, var(--primary-color) 16%, transparent);
			border-radius: 0.5rem;
			color: var(--primary-color);
			display: flex;
			flex-shrink: 0;
			height: 1.9rem;
			justify-content: center;
			width: 1.9rem;
		}

		.row-text {
			display: grid;
			flex: 1;
			min-width: 0;
		}

		.row-label {
			flex: 1;
			font-size: 0.95rem;
			font-weight: 700;
			min-width: 0;
		}

		.row-hint {
			color: var(--text-secondary);
			font-size: 0.78rem;
		}

		.row-value {
			color: var(--text-secondary);
			font-size: 0.85rem;
			max-width: 45%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.chevron {
			color: var(--text-secondary);
			flex-shrink: 0;
		}

		.help-tiles {
			display: grid;
			gap: 0.5rem;
			grid-template-columns: repeat(3, 1fr);

			// Four tiles (the website) sit two by two rather than leaving one alone
			&.pairs {
				grid-template-columns: repeat(2, 1fr);
			}
		}

		.help-tile {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 1rem;
			color: var(--text-primary);
			cursor: pointer;
			display: flex;
			flex-direction: column;
			font: inherit;
			font-size: 0.8rem;
			font-weight: 700;
			gap: 0.4rem;
			justify-content: center;
			min-height: 4.6rem;
			padding: 0.7rem 0.3rem;
			text-align: center;
			text-decoration: none;
			transition: transform 0.1s ease;

			.iconify,
			svg {
				color: var(--primary-color);
			}

			&:active {
				transform: scale(0.96);
			}
		}

		// Sub-pages
		.sub-head {
			display: grid;
			gap: 0.1rem;
			justify-items: start;
			margin-bottom: 0.75rem;
		}

		.back-button {
			align-items: center;
			background: none;
			border: 0;
			color: var(--primary-color);
			cursor: pointer;
			display: flex;
			font: inherit;
			font-size: 0.95rem;
			font-weight: 700;
			gap: 0.15rem;
			margin-left: -0.3rem;
			min-height: 44px;
			padding: 0 0.5rem 0 0;
		}

		.sub-title {
			color: var(--text-primary);
			font-family: var(--font-display);
			font-size: 1.5rem;
			margin: 0;
		}

		.support-group:not(.hero-card) {
			border-top: 0;
			padding-top: 0;

			.menu-list {
				width: 100%;
			}
		}

		.menu-row:disabled {
			opacity: 0.5;
		}

		// The page title already says Themes
		.themes-page :deep(#theme-label) {
			display: none;
		}
	}

	.reminder-head {
		align-items: center;
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		width: 100%;

		p {
			margin-bottom: 0;
		}
	}

	.switch {
		background: color-mix(in srgb, var(--text-primary) 18%, transparent);
		border: 0;
		border-radius: 999px;
		cursor: pointer;
		flex-shrink: 0;
		height: 31px;
		padding: 2px;
		position: relative;
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

	.reminder-times {
		display: grid;
		gap: 0.4rem;
		grid-template-columns: repeat(4, 1fr);
		margin-top: 0.75rem;
		width: 100%;
	}

	.time-chip {
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-primary);
		cursor: pointer;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 700;
		min-height: 44px;
		padding: 0.5rem 0;

		&.active {
			background: var(--color-success);
			border-color: var(--color-success);
			color: var(--on-success);
		}
	}

	.store-status {
		font-size: 0.75rem;
		margin-top: 0.4rem;
		opacity: 0.7;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
