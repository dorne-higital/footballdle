<template>
	<div class="static-page">
		<nav class="static-nav">
			<NuxtLink
				to="/"
				class="back-link"
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
			<p class="updated">Last updated: 29 May 2026</p>

			<p>
				Footballdle ("we", "us", "our") operates the website footballdle.co.uk. This page explains what
				information is collected when you use the site and how it is used.
			</p>

			<h2>Information we collect</h2>
			<p>
				Footballdle does not require registration and does not collect any personally identifiable information
				directly. Your game state (guesses, streak, statistics) is stored locally in your browser using
				localStorage and never transmitted to our servers.
			</p>

			<h2>Analytics</h2>
			<p>
				We use Google Analytics 4 to understand how visitors use the site. This service collects anonymised data
				such as pages visited, time spent, and general location (country/region). No personally identifiable
				information is collected. You can opt out using the
				<a
					href="https://tools.google.com/dlpage/gaoptout"
					target="_blank"
					rel="noopener noreferrer"
					>Google Analytics opt-out browser add-on</a
				>.
			</p>

			<h2>Advertising</h2>
			<p>
				We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior
				visits to this website or other websites. You can opt out of personalised advertising by visiting
				<a
					href="https://www.google.com/settings/ads"
					target="_blank"
					rel="noopener noreferrer"
					>Google Ads Settings</a
				>. We also participate in the IAB Transparency and Consent Framework.
			</p>

			<h2>Cookies</h2>
			<p>
				Cookies may be set by Google Analytics and Google AdSense as described above. We do not set any
				first-party cookies ourselves. You can control cookies through your browser settings. Disabling cookies
				will not affect your ability to play the game.
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
				If you have any questions about this privacy policy please contact us at
				<a href="footballdleadmin@gmail.com">footballdleadmin@gmail.com</a>.
			</p>
		</main>

		<SiteFooter />
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: 'Privacy Policy | Footballdle',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk/privacy-policy' }],
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
</style>
