<template>
	<div class="settings-section">
		<div
			v-if="!$config.public.isApp"
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
			<p>Enjoying the game? Help keep it free and ad-light.</p>
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

		<template v-else>
			<div
				v-if="gameCenter.isAvailable"
				class="setting-group support-group"
			>
				<label>Leaderboards</label>
				<p>See how your streaks stack up against everyone else.</p>
				<button
					type="button"
					class="store-button"
					@click="gameCenter.showLeaderboards()"
				>
					<Icon
						name="uil:trophy"
						size="1rem"
					/>
					Open leaderboards
				</button>
			</div>

			<div
				v-if="reminders.isAvailable"
				class="setting-group support-group"
			>
				<div class="reminder-head">
					<div>
						<label>Daily reminder</label>
						<p>A nudge to play, skipped on days you've already played.</p>
					</div>
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

			<div class="setting-group support-group">
				<label>Footballdle Pro</label>
				<p v-if="purchases.isPro">Pro unlocked. Hints are on the house. Cheers for the support!</p>
				<template v-else>
					<p>
						Unlimited hints on the daily game. One-off purchase, no subscription.
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
						<Icon
							name="solar:crown-bold"
							size="1rem"
						/>
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
				</template>
				<button
					type="button"
					class="text-button"
					:disabled="purchases.busy"
					@click="purchases.restore()"
				>
					Restore purchases
				</button>
			</div>

			<div
				v-if="purchases.tipProducts.length"
				class="setting-group support-group"
			>
				<label>Tip Jar</label>
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
			</div>

			<p
				v-if="purchases.message"
				class="store-message"
			>
				{{ purchases.message }}
			</p>

			<div class="setting-group support-group">
				<label>Help</label>
				<div class="link-list">
					<NuxtLink
						to="/how-to-play"
						@click="modalsStore.closeSettings()"
					>
						How to play
					</NuxtLink>
					<NuxtLink
						to="/feedback"
						@click="modalsStore.closeSettings()"
					>
						Send feedback
					</NuxtLink>
					<NuxtLink
						to="/privacy-policy"
						@click="modalsStore.closeSettings()"
					>
						Privacy policy
					</NuxtLink>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, onUnmounted } from 'vue'
	import { useThemeStore } from '../../stores/theme'
	import { usePurchasesStore } from '../../stores/purchases'
	import { useGameCenter } from '../../composables/useGameCenter'
	import { useModalsStore } from '../../stores/modals'
	import CoinStack from './CoinStack.vue'
	import { REMINDER_HOURS, useRemindersStore } from '../../stores/reminders'

	// Tip products come in order small, medium, large (TIP_PRODUCT_IDS)
	const TIP_SIZES = ['Small', 'Medium', 'Large']

	const reminders = useRemindersStore()
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

	defineEmits(['buy-coffee'])
</script>

<style scoped lang="scss">
	.settings-section {
		width: 100%;

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
					color: #06140d;
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

			.text-button {
				background: none;
				border: 0;
				color: var(--text-secondary);
				cursor: pointer;
				font-size: 0.85rem;
				margin-top: 0.75rem;
				padding: 0;
				text-decoration: underline;
			}
		}

		.link-list {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;

			a {
				color: var(--text-primary);
				font-weight: 600;
				text-decoration: none;
			}
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
		padding: 0.5rem 0;

		&.active {
			background: var(--color-success);
			border-color: var(--color-success);
			color: #06140d;
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
