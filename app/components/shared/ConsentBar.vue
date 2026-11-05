<template>
	<div
		v-if="choice === null && !welcomeOpen"
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
	// visitor picks; both buttons carry the same weight. Waits for the first-visit welcome
	// sheet to close, so the two never stack
	const { choice, load, set } = useAnalyticsConsent()
	const welcomeOpen = useState('welcome-open', () => false)
	onMounted(load)
</script>

<style scoped lang="scss">
	// White in every theme so it stands out against the dark game (Dan, 5 Nov): a plain
	// card with a soft shadow, and the deeper Floodlights green for Accept
	.consent-bar {
		align-items: center;
		background: #fff;
		border: 0;
		border-radius: var(--global-border-radius);
		bottom: calc(0.75rem + env(safe-area-inset-bottom));
		box-shadow:
			0 2px 6px rgb(0 0 0 / 20%),
			0 18px 50px rgb(0 0 0 / 50%);
		color: #10231a;
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		left: 50%;
		max-width: min(40rem, calc(100% - 1.5rem));
		padding: 1rem 1.1rem;
		position: fixed;
		transform: translateX(-50%);
		width: 100%;
		z-index: 1000;
	}

	.consent-text {
		color: #2c3d34;
		flex: 1 1 18rem;
		font-size: 0.9rem;
		font-weight: 500;
		line-height: 1.5;
		margin: 0;

		a {
			color: #0f7a45;
			font-weight: 700;
		}
	}

	.consent-actions {
		display: flex;
		flex: 0 0 auto;
		gap: 0.5rem;
		margin-left: auto;
	}

	.consent-btn {
		background: #fff;
		border: 1.5px solid #c9d6ce;
		border-radius: 999px;
		color: #10231a;
		cursor: pointer;
		font: inherit;
		font-size: 0.9rem;
		font-weight: 800;
		padding: 0.5rem 1.1rem;

		&.primary {
			background: #128d53;
			border-color: #128d53;
			color: #fff;
		}

		&:focus-visible {
			outline: 3px solid #0f7a45;
			outline-offset: 2px;
		}
	}
</style>
