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
			<h1>About Footballdle</h1>

			<p>
				Footballdle is a free daily Premier League footballer guessing game. Each day a new 6-letter Premier
				League surname is chosen — guess it in up to 6 tries. After each guess the letters light up to show how
				close you are, just like Wordle but for football fans.
			</p>

			<h2>How it works</h2>
			<p>
				A new puzzle drops every day at midnight UK time. Only players from the current 25/26 Premier League
				season with a 6-letter surname are included. The game is completely free with no sign-up required — your
				streak and stats are saved locally in your browser.
			</p>

			<h2>Challenge mode</h2>
			<p>
				Finish the daily puzzle to unlock Challenge mode — a faster-paced version where you race against a
				45-second clock to guess a different player.
			</p>

			<h2>Who made it</h2>
			<p>
				Footballdle was built and is maintained by Dan, a developer and football fan based in the UK. If you
				spot a missing player, have a suggestion, or just want to say hello, get in touch below.
			</p>

			<h2>Contact</h2>
			<p>
				<a href="mailto:footballdleadmin@gmail.com">footballdleadmin@gmail.com</a>
			</p>

			<div class="cta">
				<NuxtLink
					to="/"
					class="cta-button"
				>
					Play today's puzzle →
				</NuxtLink>
			</div>
		</main>

		<SiteFooter />
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: 'About Footballdle | Daily Premier League Footballer Guessing Game',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk/about' }],
		meta: [
			{
				name: 'description',
				content:
					'Footballdle is a free daily Premier League footballer guessing game. Guess the 6-letter surname in 6 tries. A new player every day at midnight.',
			},
			{ name: 'robots', content: 'index, follow' },
		],
	})
</script>

<style scoped lang="scss">
	@use '../../assets/static-page';
</style>
