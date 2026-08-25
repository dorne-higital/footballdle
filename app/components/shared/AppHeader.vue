<template>
	<header class="app-header">
		<NuxtLink
			to="/"
			class="wordmark"
			@click="handleHomeClick"
		>
			<svg
				class="mark"
				viewBox="0 0 30 30"
				fill="none"
				aria-hidden="true"
			>
				<circle
					cx="15"
					cy="15"
					r="12.5"
					stroke="currentColor"
					stroke-width="2"
				/>
				<line
					x1="0"
					y1="15"
					x2="30"
					y2="15"
					stroke="currentColor"
					stroke-width="2"
				/>
				<circle
					cx="15"
					cy="15"
					r="2.4"
					fill="currentColor"
				/>
			</svg>

			<div class="wordmark-text">
				<h1 class="heading">FOOT<span>BALL</span>DLE</h1>
				<p class="tagline">Six letters. Six tries. One kick-off a day.</p>
			</div>
		</NuxtLink>

		<div class="icons">
			<a
				href="https://buymeacoffee.com/dhorne92E"
				target="_blank"
				rel="noopener noreferrer"
				class="icon-btn"
				aria-label="Buy me a coffee"
				@click.prevent="handleBuyCoffee"
			>
				<Icon
					name="uil:coffee"
					size="1.15em"
				/>
			</a>

			<NuxtLink
				to="/how-to-play"
				class="icon-btn"
				aria-label="How to play"
				@click="trackInfoModal"
			>
				<Icon
					name="uil:info-circle"
					size="1.15em"
				/>
			</NuxtLink>

			<button
				type="button"
				class="icon-btn"
				aria-label="Settings"
				@click="handleSettings"
			>
				<Icon
					name="uil:setting"
					size="1.15em"
				/>
			</button>

			<button
				type="button"
				class="icon-btn"
				aria-label="Statistics"
				@click="handleStats"
			>
				<Icon
					name="uil:statistics"
					size="1.15em"
				/>
			</button>
		</div>
	</header>
</template>

<script setup lang="ts">
	import { useModalsStore } from '../../stores/modals'
	import { useAnalytics } from '../../composables/useAnalytics'

	const modalsStore = useModalsStore()
	const { trackInfoModal, trackSettingsModal, trackStatsModal, trackHomeClick, trackBuyMeCoffee } = useAnalytics()

	function handleHomeClick() {
		trackHomeClick('app_header')
	}

	function handleBuyCoffee() {
		trackBuyMeCoffee('app_header')
		if (import.meta.client) {
			const btn = document.querySelector('#bmc-wbtn') as HTMLElement | null
			btn?.click()
		}
	}

	function handleSettings() {
		modalsStore.openSettings()
		trackSettingsModal()
	}

	function handleStats() {
		modalsStore.openStats()
		trackStatsModal()
	}
</script>

<style scoped lang="scss">
	.app-header {
		align-items: center;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
		display: flex;
		flex-shrink: 0;
		justify-content: space-between;
		padding: 0.85rem 1.5rem;
		position: relative;
		width: 100%;
		// Above BaseModal's backdrop (z-index: 1000) so the header's own
		// modal triggers (settings/stats) stay reachable to switch modals
		// while one is already open, instead of being covered by it.
		z-index: 1001;
	}

	.wordmark {
		align-items: center;
		color: inherit;
		display: flex;
		gap: 0.75rem;
		min-width: 0;
		text-decoration: none;

		&:hover {
			border-bottom: none;
		}

		.mark {
			color: var(--primary-color);
			flex: none;
			height: 26px;
			width: 26px;
		}

		.wordmark-text {
			min-width: 0;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--font-display);
			font-size: 1.2rem;
			font-weight: 700;
			letter-spacing: 0.1em;
			line-height: 1.1;
			margin: 0;
			text-transform: uppercase;

			span {
				color: var(--primary-color);
			}
		}

		.tagline {
			color: var(--text-secondary);
			font-family: var(--font-mono);
			font-size: 0.66rem;
			letter-spacing: 0.04em;
			margin: 0.15rem 0 0;
			text-transform: uppercase;
			white-space: nowrap;
		}
	}

	.icons {
		align-items: center;
		display: flex;
		flex: none;
		gap: 0.5rem;
	}

	.icon-btn {
		align-items: center;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 10px;
		box-sizing: border-box;
		color: var(--text-primary);
		cursor: pointer;
		display: inline-flex;
		flex: none;
		height: 38px;
		justify-content: center;
		padding: 0;
		text-decoration: none;
		transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
		width: 38px;

		&:hover {
			background: color-mix(in srgb, var(--primary-color) 14%, var(--bg-secondary));
			border-bottom: 1px solid color-mix(in srgb, var(--primary-color) 30%, var(--border));
			border-color: color-mix(in srgb, var(--primary-color) 30%, var(--border));
			color: var(--primary-color);
			transform: translateY(-1px);
		}
	}

	@media (width <= 640px) {
		.app-header {
			padding: 0.7rem 1rem;
		}

		.tagline {
			display: none;
		}
	}
</style>
