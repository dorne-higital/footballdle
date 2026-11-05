<template>
	<div class="static-page">
		<nav class="static-nav">
			<NuxtLink
				to="/play/daily"
				class="back-link"
				title="Play Footballdle"
			>
				<Icon
					name="solar:alt-arrow-left-linear"
					size="1rem"
				/>
				Play Footballdle
			</NuxtLink>
		</nav>

		<main class="static-main">
			<h1>Privacy Policy</h1>
			<p class="updated">Last updated: 5 November 2026</p>

			<p>
				Footballdle ("we", "us", "our") operates the website footballdle.co.uk and the Footballdle iPhone app.
				This page explains what information is collected when you use either and how it is used.
			</p>

			<h2>Information we collect</h2>
			<p>
				Footballdle does not require registration and does not collect any personally identifiable information
				directly. Your game state (guesses, streak, statistics) is stored locally in your browser using
				localStorage and never transmitted to our servers.
			</p>

			<h2>The iPhone app</h2>
			<p>
				The app has no analytics, no advertising and no tracking. Your game state, statistics, trophies and hint
				balance are stored on your device and are never sent to our servers.
			</p>
			<p>
				<strong>Game Center.</strong> If you are signed in to Apple Game Center, your best streaks, total wins
				and trophy progress are sent to Apple so they can appear on leaderboards and in your Game Center
				profile. This is handled by Apple under
				<a
					href="https://www.apple.com/legal/privacy/"
					target="_blank"
					rel="noopener noreferrer"
					>Apple's privacy policy</a
				>, and you can turn Game Center off at any time in your iPhone's Settings.
			</p>
			<p>
				<strong>In-app purchases.</strong> Purchases are processed by Apple; we never see your payment
				details. We use RevenueCat to confirm purchases and restore Footballdle Pro. RevenueCat receives your
				purchase history and a random, anonymous app user ID that is not linked to your name or Apple ID.
				See
				<a
					href="https://www.revenuecat.com/privacy/"
					target="_blank"
					rel="noopener noreferrer"
					>RevenueCat's privacy policy</a
				>.
			</p>

			<h2>Analytics (website)</h2>
			<p>
				With your permission, we use Google Analytics 4 to understand how people find and use the website: pages
				visited, time spent, games played and general location (country or region). It doesn't collect your name
				or contact details. Google Analytics only runs if you tap Accept on the bar at the bottom of the website;
				if you tap No thanks, or don't answer, it doesn't load at all. The iPhone app never uses Google
				Analytics.
			</p>
			<p v-if="!$config.public.isApp">
				<button
					type="button"
					class="consent-reset"
					@click="resetConsent"
				>
					{{ consentChoice === null ? 'Choice cleared: answer the bar below' : 'Change your analytics choice' }}
				</button>
			</p>

			<h2>Cookies</h2>
			<p>
				Google Analytics sets cookies (named _ga) only after you accept it. We don't set any cookies ourselves.
				The game saves your progress, stats and settings in your browser's local storage, which stays on your
				device; clearing your browser data removes it.
			</p>

			<h2>Third-party links</h2>
			<p>
				Our site may contain links to third-party websites including Buy Me a Coffee and Ko-fi. These sites have
				their own privacy policies and we have no responsibility for their content or practices.
			</p>

			<h2>Your rights (UK GDPR)</h2>
			<p>
				As a UK resident you have the right to access, correct, or request deletion of any personal data held
				about you. As we do not store personal data directly, any such requests relating to analytics data
				should be directed to Google. For any other queries please contact us at the address below.
			</p>

			<h2>Changes to this policy</h2>
			<p>
				We may update this policy from time to time. The date at the top of this page will reflect any changes.
				Continued use of the site after changes constitutes acceptance of the updated policy.
			</p>

			<h2>Contact</h2>
			<p>
				If you have any questions about this privacy policy please contact us using the
				<NuxtLink to="/feedback?topic=other" title="Contact Footballdle">feedback form</NuxtLink>.
			</p>
		</main>

		<SiteFooter />
	</div>
</template>

<script setup lang="ts">
	import { onMounted } from 'vue'
	import { pageUrl } from '../utils/siteUrl'
	import { useAnalyticsConsent } from '../composables/useAnalyticsConsent'

	// Lets a website visitor take back (or give) analytics consent: the bar shows again
	const { choice: consentChoice, load: loadConsent, reset: resetConsent } = useAnalyticsConsent()
	onMounted(loadConsent)

	useHead({
		title: 'Privacy Policy | Footballdle',
		link: [{ rel: 'canonical', href: pageUrl('/privacy-policy') }],
		meta: [
			{
				name: 'description',
				content: 'Privacy policy for Footballdle — free daily Premier League footballer guessing game.',
			},
			{ name: 'robots', content: 'index, follow' },
		],
	})
</script>

<style scoped lang="scss">
	@use '../../assets/static-page';

	.consent-reset {
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--primary-color);
		cursor: pointer;
		font: inherit;
		font-weight: 700;
		padding: 0.45rem 1rem;
	}
</style>
