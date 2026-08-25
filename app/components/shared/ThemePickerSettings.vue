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

		<div class="setting-group support-group">
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
				Buy me a coffee
			</a>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useThemeStore } from '../../stores/theme'

	const themeStore = useThemeStore()

	defineEmits(['buy-coffee'])
</script>

<style scoped lang="scss">
	.settings-section {
		width: 100%;

		.support-group {
			text-align: left;

			.coffee-button {
				align-items: center;
				background: #fd0;
				border-radius: var(--global-border-radius);
				color: #000;
				display: inline-flex;
				font-size: 0.9rem;
				font-weight: 600;
				gap: 0.5rem;
				margin-top: 0.5rem;
				padding: 0.6rem 1.2rem;
				text-decoration: none;
				transition: all 0.2s ease;

				&:hover {
					box-shadow: 0 4px 12px rgb(255 221 0 / 40%);
					transform: translateY(-2px);
				}
			}
		}

		.setting-group {
			align-items: flex-start;
			display: flex;
			flex-direction: column;
			margin-bottom: 2rem;
			width: 100%;

			label {
				color: var(--text-primary);
				font-size: 1.1rem;
				font-weight: 600;
				margin-bottom: 0.5rem;
			}

			p {
				color: var(--text-secondary);
				font-size: 0.9rem;
				margin: 0 0 1rem;
			}

			.theme-grid {
				display: grid;
				gap: 1rem;
				grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
				width: 100%;

				.theme-option {
					background: var(--bg-secondary);
					border: 2px solid var(--border);
					border-radius: var(--global-border-radius);
					cursor: pointer;
					overflow: hidden;
					padding: 1rem;
					position: relative;
					text-align: center;
					transition: all 0.3s ease;

					&:hover {
						border-color: var(--primary-color);
						box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
						transform: translateY(-2px);
					}

					&.active {
						background: var(--primary-color);
						border-color: var(--primary-color);
						box-shadow: 0 6px 20px rgb(0 0 0 / 15%);
						color: white;
						font-weight: 600;
						transform: translateY(-2px);
					}

					.theme-preview {
						border-radius: calc(var(--global-border-radius) - 2px);
						height: 60px;
						margin-bottom: 0.5rem;
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
								background: #f8fafc;
							}

							.preview-content {
								background: #fff;

								.preview-tile {
									background: #f8fafc;
									border-color: #e5e7eb;

									&.correct {
										background: #dc2626;
										border-color: #dc2626;
									}
								}
							}
						}

						&.dark {
							.preview-header {
								background: #0f172a;
							}

							.preview-content {
								background: #1e293b;

								.preview-tile {
									background: #0f172a;
									border-color: #334155;

									&.correct {
										background: #ef4444;
										border-color: #ef4444;
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
										background: #dc2626;
										border-color: #dc2626;
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
						font-size: 0.9rem;
						font-weight: 500;
					}
				}
			}
		}
	}
</style>
