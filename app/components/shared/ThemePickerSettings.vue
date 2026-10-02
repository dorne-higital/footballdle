<template>
	<div class="settings-section">
		<div class="setting-group">
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
			<div class="setting-group support-group">
				<label>Footballdle Pro</label>
				<p v-if="purchases.isPro">Pro unlocked. Hints are on the house. Cheers for the support!</p>
				<template v-else>
					<p>Reveal the club, nationality and position early on the daily game. One-off purchase, no subscription.</p>
					<button
						type="button"
						class="store-button"
						:disabled="purchases.busy || !purchases.proProduct"
						@click="purchases.buyPro()"
					>
						<Icon
							name="solar:crown-linear"
							size="1rem"
						/>
						Get <span class="accent">Pro</span>
						<template v-if="purchases.proProduct">· {{ purchases.proProduct.priceString }}</template>
					</button>
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
				<div class="tip-row">
					<button
						v-for="product in purchases.tipProducts"
						:key="product.identifier"
						type="button"
						class="store-button"
						:disabled="purchases.busy"
						@click="purchases.tip(product)"
					>
						{{ product.priceString }}
					</button>
				</div>
			</div>

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

			<p
				v-if="purchases.message"
				class="store-message"
			>
				{{ purchases.message }}
			</p>
		</template>
	</div>
</template>

<script setup lang="ts">
	import { useThemeStore } from '../../stores/theme'
	import { usePurchasesStore } from '../../stores/purchases'
	import { useGameCenter } from '../../composables/useGameCenter'

	const themeStore = useThemeStore()
	const purchases = usePurchasesStore()
	const gameCenter = useGameCenter()

	defineEmits(['buy-coffee'])
</script>

<style scoped lang="scss">
	.settings-section {
		width: 100%;

		.support-group {
			border-top: 1px solid var(--border);
			padding-top: 1.5rem;
			text-align: left;

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

				&:hover:not(:disabled) {
					box-shadow: 0 10px 24px -12px rgb(24 32 25 / 35%);
					transform: translateY(-2px);
				}

				&:disabled {
					cursor: default;
					opacity: 0.5;
				}
			}

			.tip-row {
				display: flex;
				flex-wrap: wrap;
				gap: 0.5rem;

				.store-button {
					margin-top: 0;
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
</style>
