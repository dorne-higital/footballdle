<template>
	<Transition name="banner">
		<div
			v-if="visible"
			class="install-banner"
		>
			<div class="install-banner-inner">
				<div class="install-icon">
					<Icon
						name="solar:smartphone-bold"
						size="1.4rem"
					/>
				</div>
				<div class="install-text">
					<strong>Add to Home Screen</strong>
					<span>Play Footballdle like a native app</span>
				</div>
				<button
					class="install-btn"
					@click="handleInstall"
				>
					Install
				</button>
				<button
					class="dismiss-btn"
					aria-label="Dismiss"
					@click="dismiss"
				>
					<Icon
						name="solar:close-circle-linear"
						size="1.2rem"
					/>
				</button>
			</div>

			<!-- iOS instruction panel -->
			<Transition name="ios-panel">
				<div
					v-if="showIOSInstructions"
					class="ios-instructions"
				>
					<p>
						<Icon
							name="solar:share-linear"
							size="1rem"
						/>
						Tap the <strong>Share</strong> button in Safari
					</p>
					<p>
						<Icon
							name="solar:add-square-linear"
							size="1rem"
						/>
						Scroll down and tap <strong>Add to Home Screen</strong>
					</p>
				</div>
			</Transition>
		</div>
	</Transition>
</template>

<script setup lang="ts">
	import { ref, onMounted, computed } from 'vue'
	import { useInstallPrompt } from '../composables/useInstallPrompt'

	const DISMISS_KEY = 'footballdle-install-dismissed'
	const DISMISS_DAYS = 14

	const { canInstall, isIOS, isInstalled, install } = useInstallPrompt()
	const dismissed = ref(true)
	const showIOSInstructions = ref(false)

	const visible = computed(() => {
		if (dismissed.value || isInstalled.value) return false
		return canInstall.value || isIOS.value
	})

	onMounted(() => {
		const stored = localStorage.getItem(DISMISS_KEY)
		if (stored) {
			const until = Number(stored)
			dismissed.value = Date.now() < until
		} else {
			dismissed.value = false
		}
	})

	function dismiss() {
		dismissed.value = true
		showIOSInstructions.value = false
		const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000
		localStorage.setItem(DISMISS_KEY, String(until))
	}

	async function handleInstall() {
		if (isIOS.value) {
			showIOSInstructions.value = !showIOSInstructions.value
			return
		}
		const accepted = await install()
		if (accepted) dismissed.value = true
	}
</script>

<style scoped lang="scss">
	.install-banner {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		bottom: 1rem;
		box-shadow: 0 4px 24px rgb(0 0 0 / 15%);
		left: 50%;
		max-width: 480px;
		position: fixed;
		transform: translateX(-50%);
		width: calc(100% - 2rem);
		z-index: 1000;

		@media (min-width: 600px) {
			display: none;
		}
	}

	.install-banner-inner {
		align-items: center;
		display: flex;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
	}

	.install-icon {
		color: var(--primary-color);
		flex-shrink: 0;
	}

	.install-text {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;

		strong {
			color: var(--text-primary);
			font-size: 0.9rem;
		}

		span {
			color: var(--text-secondary);
			font-size: 0.75rem;
		}
	}

	.install-btn {
		background: var(--primary-color);
		border: none;
		border-radius: var(--border-radius);
		color: #fff;
		cursor: pointer;
		flex-shrink: 0;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0.4rem 0.9rem;
		transition: opacity 0.2s;

		&:hover {
			opacity: 0.85;
		}
	}

	.dismiss-btn {
		background: none;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		display: flex;
		flex-shrink: 0;
		padding: 0;

		&:hover {
			color: var(--text-primary);
		}
	}

	.ios-instructions {
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.85rem 1rem;

		p {
			align-items: center;
			color: var(--text-secondary);
			display: flex;
			font-size: 0.85rem;
			gap: 0.5rem;
			margin: 0;

			strong {
				color: var(--text-primary);
			}
		}
	}

	// Transitions
	.banner-enter-active,
	.banner-leave-active {
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.banner-enter-from,
	.banner-leave-to {
		opacity: 0;
		transform: translateX(-50%) translateY(1rem);
	}

	.ios-panel-enter-active,
	.ios-panel-leave-active {
		transition: all 0.2s ease;
	}

	.ios-panel-enter-from,
	.ios-panel-leave-to {
		opacity: 0;
		transform: translateY(-4px);
	}
</style>
