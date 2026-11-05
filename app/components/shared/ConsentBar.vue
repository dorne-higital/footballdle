<template>
	<div
		v-if="choice === null"
		class="consent-bar"
		role="region"
		aria-label="Analytics choice"
	>
		<p class="consent-text">
			Can we count your visit? Google Analytics shows us how people find and play Footballdle. It sets
			cookies, so it only runs if you say yes.
			<NuxtLink
				to="/privacy-policy"
				title="Privacy policy"
				>Privacy policy</NuxtLink
			>
		</p>
		<div class="consent-actions">
			<button
				type="button"
				class="consent-btn"
				@click="set('denied')"
			>
				No thanks
			</button>
			<button
				type="button"
				class="consent-btn primary"
				@click="set('granted')"
			>
				Accept
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { onMounted } from 'vue'
	import { useAnalyticsConsent } from '../../composables/useAnalyticsConsent'

	// The website's analytics question (never in the iPhone app). Shown once, until the
	// visitor picks; both buttons carry the same weight
	const { choice, load, set } = useAnalyticsConsent()
	onMounted(load)
</script>

<style scoped lang="scss">
	.consent-bar {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		bottom: calc(0.75rem + env(safe-area-inset-bottom));
		box-shadow: 0 8px 30px rgb(0 0 0 / 25%);
		color: var(--text-primary);
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		left: 50%;
		max-width: min(40rem, calc(100% - 1.5rem));
		padding: 0.85rem 1rem;
		position: fixed;
		transform: translateX(-50%);
		width: 100%;
		z-index: 1000;
	}

	.consent-text {
		color: var(--text-secondary);
		flex: 1 1 18rem;
		font-size: 0.85rem;
		line-height: 1.5;
		margin: 0;

		a {
			color: var(--primary-color);
			font-weight: 600;
		}
	}

	.consent-actions {
		display: flex;
		flex: 0 0 auto;
		gap: 0.5rem;
		margin-left: auto;
	}

	.consent-btn {
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-primary);
		cursor: pointer;
		font: inherit;
		font-size: 0.85rem;
		font-weight: 700;
		padding: 0.5rem 1rem;

		&.primary {
			background: var(--primary-color);
			border-color: var(--primary-color);
			color: var(--on-primary);
		}

		&:focus-visible {
			outline: 2px solid var(--primary-color);
			outline-offset: 2px;
		}
	}
</style>
