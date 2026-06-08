<template>
	<div class="static-page">
		<nav class="static-nav">
			<NuxtLink
				to="/"
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
			<h1>About Footballdle</h1>
			<p>
				Footballdle is a free daily word game for Premier League football fans. Each day a hidden
				six-letter player surname is chosen from the current 2025/26 Premier League season — your job is
				to guess it in up to six tries. After every guess the tiles change colour to reveal how close you
				are, Wordle-style. There are no ads chasing you around the page, no account required, and no
				paywalls. Just a clean daily puzzle that takes a couple of minutes to play.
			</p>

			<h2>Where the idea came from</h2>
			<p>
				The game started as a lockdown side project. Wordle had just gone viral and, like a lot of
				developers, I found myself wondering what it would look like applied to a subject I actually cared
				about. Football seemed obvious. Premier League surnames have a satisfying mix of common English
				names, Iberian double-barrelled ones, and everything in between — exactly the kind of variation
				that makes a word game interesting without making it impossible.
			</p>
			<p>
				The first version was rough: a static HTML file shared in a WhatsApp group with a few friends.
				People kept playing, kept sharing their results, and kept asking for a streak counter. That was
				enough reason to keep building.
			</p>

			<h2>How it works</h2>
			<p>
				Every puzzle uses a six-letter Premier League surname drawn from the active 2025/26 season squad
				list. Answers are selected in a shuffled order so the same name doesn't come up twice until the
				full list has been exhausted. The puzzle resets at midnight UK time — everyone around the world
				gets the same answer on the same day, which is part of what makes it fun to compare scores.
			</p>
			<p>
				Your streak, statistics, and game history are stored locally in your browser using
				<code>localStorage</code>. Nothing is sent to a server and no personal data is collected. The
				downside is that clearing your browser data will reset your stats — the upside is that there is
				genuinely nothing to sign up for.
			</p>

			<h2>Challenge mode</h2>
			<p>
				Finishing the daily puzzle unlocks Challenge mode — a faster, unlimited version of the game. In
				Challenge mode the answer is a five-letter Premier League surname and you play against a
				45-second countdown. There are no limits on how many times you can play, so it's useful for
				practising letter placement and improving your opening guesses ahead of the next daily puzzle.
			</p>

			<h2>World Cup 2026</h2>
			<p>
				Footballdle also runs a special World Cup 2026 edition. Rather than a fixed-length Premier League
				name, each daily puzzle picks a surname from the full pool of players across all 48 nations
				competing at the 2026 FIFA World Cup in the United States, Canada, and Mexico. The player list
				covers over 1,000 players with no surname-length restriction, so it's a significantly harder and
				more international challenge. Wrong guesses come with additional clues — the player's continent,
				country, position, and year of birth — helping you triangulate the answer across cultures and
				languages you might be less familiar with.
			</p>

			<h2>Keeping the player list accurate</h2>
			<p>
				The Premier League squad list is refreshed at the start of each season and updated again during
				the January transfer window. If a player moves clubs mid-season they stay in the pool — what
				matters is that they played in the Premier League that season, not which shirt they finished in.
				The World Cup 2026 list was compiled from official FIFA squad submissions covering all 48
				qualified nations and is updated as squads are confirmed.
			</p>
			<p>
				Player data isn't perfect. Surnames get transliterated differently across sources, some squad
				lists lag behind transfer deadlines, and occasionally a six-letter name slips through that most
				fans wouldn't recognise. If you spot an error or a missing player, please get in touch — the list
				genuinely gets better every time someone flags something.
			</p>

			<h2>Who made it</h2>
			<p>
				Footballdle was built and is maintained by Dan, a developer and football fan based in the UK. It
				started as a personal project and remains one — there's no team, no VC funding, and no grand
				monetisation plan. The site is supported by a small number of display ads and the occasional
				coffee bought through the link at the top of the page. Both are genuinely appreciated and help
				cover hosting costs.
			</p>
			<p>
				The game is built with <a href="https://nuxt.com" target="_blank" rel="noopener noreferrer" title="Nuxt.js framework">Nuxt</a>
				and <a href="https://vuejs.org" target="_blank" rel="noopener noreferrer" title="Vue.js framework">Vue</a>, deployed on
				<a href="https://vercel.com" target="_blank" rel="noopener noreferrer" title="Vercel hosting">Vercel</a>. Player data
				comes from the
				<a href="https://www.football-data.org" target="_blank" rel="noopener noreferrer" title="football-data.org API">football-data.org</a>
				API.
			</p>

			<h2>Inspiration and credit</h2>
			<p>
				Footballdle takes direct inspiration from
				<a href="https://www.nytimes.com/games/wordle/index.html" target="_blank" rel="noopener noreferrer" title="Wordle by the New York Times">Wordle</a>,
				created by Josh Wardle and now owned by the New York Times. The colour-coded feedback mechanic is
				Wordle's — applied here to the world of football rather than the dictionary. Footballdle is not
				affiliated with the Premier League, FIFA, any football club, or the New York Times.
			</p>

			<h2>Contact</h2>
			<p>
				For missing players, bug reports, or anything else:
				<a href="mailto:footballdleadmin@gmail.com" title="Email Footballdle">footballdleadmin@gmail.com</a>
			</p>
			<p>
				Response times vary — this is a one-person operation run in spare time — but every message gets
				read and player suggestions are usually added within a few days.
			</p>

			<div class="cta">
				<NuxtLink
					to="/"
					class="cta-button"
					title="Play today's puzzle"
					>Play today's puzzle →</NuxtLink
				>
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
					'Footballdle is a free daily Premier League footballer guessing game. Find out how it was built, how the player list is maintained, and how Challenge and World Cup modes work.',
			},
			{ name: 'robots', content: 'index, follow' },
		],
	})
</script>

<style scoped lang="scss">
	@use '../../assets/static-page';

	code {
		background: var(--bg-secondary);
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.85em;
		padding: 0.1em 0.4em;
	}
</style>
