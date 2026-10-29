<template>
	<div class="static-page">
		<nav
			v-if="!$config.public.appShell"
			class="static-nav"
		>
			<NuxtLink
				to="/"
				class="back-link"
				title="Footballdle"
			>
				<Icon
					name="solar:alt-arrow-left-linear"
					size="1rem"
				/>
				Footballdle
			</NuxtLink>
		</nav>

		<main class="static-main">
			<p class="eyebrow">{{ game.name }} · free, every day</p>
			<h1>{{ game.h1 }}</h1>
			<p class="lede">{{ game.lede }}</p>

			<div class="cta-row">
				<NuxtLink
					:to="game.play"
					class="cta"
					:title="`Play ${game.name}`"
					>Play {{ game.name }}</NuxtLink
				>
				<NuxtLink
					to="/app"
					class="cta secondary"
					title="Footballdle for iPhone"
					>Get the iPhone app</NuxtLink
				>
			</div>

			<img
				:src="`/games/${slug}.jpg`"
				:alt="`${game.name} in the Footballdle app`"
				class="shot"
				width="414"
				height="900"
				loading="lazy"
			/>

			<h2>How it works</h2>
			<ul>
				<li
					v-for="step in game.how"
					:key="step"
				>
					{{ step }}
				</li>
			</ul>

			<h2>{{ game.whyTitle }}</h2>
			<p
				v-for="para in game.why"
				:key="para"
			>
				{{ para }}
			</p>

			<h2>Questions</h2>
			<template
				v-for="f in faq"
				:key="f.q"
			>
				<h3>{{ f.q }}</h3>
				<p>{{ f.a }}</p>
			</template>

			<h2>More Footballdle games</h2>
			<ul class="more">
				<li
					v-for="other in others"
					:key="other.slug"
				>
					<NuxtLink
						:to="`/games/${other.slug}`"
						:title="other.h1"
						>{{ other.h1 }}</NuxtLink
					>
					<span>{{ other.short }}</span>
				</li>
			</ul>
		</main>
	</div>
</template>

<script setup lang="ts">
	// One plain page per game, written for people searching for that kind of game (growth
	// review, 1.3). Facts match pages/how-to-play.vue; keep the two in step.
	interface Game {
		slug: string
		name: string
		h1: string
		title: string
		description: string
		short: string
		lede: string
		play: string
		how: string[]
		whyTitle: string
		why: string[]
		faq: { q: string; a: string }[]
	}

	const GAMES: Game[] = [
		{
			slug: 'guess-the-footballer',
			name: 'the Daily',
			h1: 'Guess the footballer',
			title: 'Guess the Footballer: a new Premier League player every day | Footballdle',
			description: 'Guess the hidden Premier League footballer in six tries. Green and yellow tiles show how close you are. Free, no ads, a new player at midnight.',
			short: 'A new mystery player every day, six guesses',
			lede: 'A new Premier League player to find every day. Guess their five- or six-letter surname in six tries, with green and yellow tiles showing how close you are.',
			play: '/play/daily',
			how: [
				'Type any current Premier League surname that fits the board (five or six letters) and press Enter.',
				'Green means the letter is in the right place. Yellow, with a dot, means it\'s in the name but somewhere else. Grey means it isn\'t in the name.',
				'Use what you learn to narrow it down. You have six guesses.',
				'A new player drops at midnight (UK time), the same for everyone.',
			],
			whyTitle: 'Why people play it every day',
			why: [
				'It takes a couple of minutes, and the answer is someone you\'ve heard of. Keep your streak going, collect a Player Card for every player you find, and share your result with your mates without giving the answer away.',
				'Stuck? A hint shows the player\'s club, then their nationality and position, then the first letters of their surname.',
			],
			faq: [],
		},
		{
			slug: 'football-grid-game',
			name: 'The Grid',
			h1: 'Football grid game',
			title: 'Football Grid Game: name a player for every square | Footballdle',
			description: 'Three clubs, three rows, nine squares. Name a current Premier League player who fits each one. Five new grids every Saturday, plus unlimited practice. Free.',
			short: 'Name a player for every square, five grids a week',
			lede: 'Three clubs across the top, three rows down the side. Name a current Premier League player who fits both for each of the nine squares.',
			play: '/play/grid',
			how: [
				'The rows are mostly countries, sometimes Goalkeeper, Forward or Priced £7m+.',
				'A square is worth 100 points if your first guess is right, and 25 less for each wrong guess. Four wrong guesses lock it at 0.',
				'A perfect grid is 900, and a perfect week is 4,500.',
				'Five new grids drop every Saturday, the same for everyone. Practice grids are unlimited.',
			],
			whyTitle: 'A grid that\'s the same for everyone',
			why: [
				'Everyone gets the same five grids each week, so you can compare scores with your mates. A name that isn\'t a player in the game costs nothing, so you can think out loud. A hint shows the first letter of an answer for 50 points.',
			],
			faq: [],
		},
		{
			slug: 'guess-the-player-by-price',
			name: 'Scout Report',
			h1: 'Guess the player from the clues',
			title: 'Guess the Player from his Fantasy Price and Clues | Footballdle Scout Report',
			description: 'A daily scouting puzzle: guess the Premier League player from his club, nation, position and fantasy price. Six guesses, a new player every day. Free.',
			short: 'Club, nation, position and fantasy price clues',
			lede: 'A daily scouting puzzle. Every guess tells you how close you are on club, nation, position and fantasy price, until you find the player.',
			play: '/play/scout-report',
			how: [
				'Each day starts with a scout\'s brief: two facts about the player, like "We\'re after an African midfielder".',
				'Guess any current Premier League player. Each guess is compared with the target on club, nation, position and fantasy price.',
				'Green and square is a match. Amber and round is close: a club in the same part of the country, a nation from the same continent, the next line on the pitch, or a price within £1m.',
				'The arrow on the price shows whether the target costs more or less. You have six guesses.',
			],
			whyTitle: 'Made for people who know their prices',
			why: [
				'If you play fantasy football, you know what every player costs. Scout Report turns that into a daily puzzle: the price arrow alone can halve the list.',
			],
			faq: [],
		},
		{
			slug: 'name-the-player',
			name: 'Spot the Baller',
			h1: 'Name the player',
			title: 'Name the Player: 10 rounds against the clock | Footballdle Spot the Baller',
			description: 'Ten rapid-fire rounds: club, nationality and position clues and four names. Pick the right Premier League player before the clock runs out. Free, daily.',
			short: 'Ten quickfire rounds, four names each',
			lede: 'Ten rapid-fire rounds. Each one gives you a club, a nationality and a position, and four names. Pick the right player before the clock runs out.',
			play: '/play/spot-the-baller',
			how: [
				'Each round shows the player\'s club, nationality and position.',
				'Pick the right name from four before the 8-second clock runs out.',
				'Get 6 or more right out of 10 to win the day.',
				'New rounds every day, the same for everyone.',
			],
			whyTitle: 'Quick, and harder than it looks',
			why: ['It\'s over in under two minutes, but the four names are always close. A relaxed timer is in Settings if you\'d rather not rush.'],
			faq: [],
		},
	]

	const SHARED_FAQ = [
		{ q: 'Is it free?', a: 'Yes. Every game is free to play every day, with no ads and no account. Hints and themes are optional.' },
		{ q: 'Is there an app?', a: 'Yes, Footballdle is on the App Store for iPhone: footballdle.co.uk/app. On Android and computers, play here on the website.' },
		{ q: 'Are the players up to date?', a: 'Yes. The player list follows the current Premier League season and is refreshed every week, including during the transfer window.' },
	]

	const slug = useRoute().params.mode as string
	const found = GAMES.find(g => g.slug === slug)
	if (!found) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	const game = found
	const faq = [...game.faq, ...SHARED_FAQ]
	const others = GAMES.filter(g => g.slug !== slug)

	useHead({
		title: game.title,
		link: [{ rel: 'canonical', href: `https://footballdle.co.uk/games/${slug}` }],
		meta: [
			{ name: 'description', content: game.description },
			{ property: 'og:title', content: game.title },
			{ property: 'og:description', content: game.description },
			{ property: 'og:url', content: `https://footballdle.co.uk/games/${slug}` },
			{ property: 'og:image', content: `https://footballdle.co.uk/games/${slug}.jpg` },
			{ name: 'robots', content: 'index, follow' },
		],
		script: [
			{
				type: 'application/ld+json',
				children: JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'FAQPage',
					mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
				}),
			},
		],
	})
</script>

<style scoped lang="scss">
	@use '../../../assets/static-page';

	.eyebrow {
		color: var(--primary-color);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		margin-bottom: 0.25rem;
		text-transform: uppercase;
	}

	.lede {
		font-size: 1.05rem;
	}

	.cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin: 1.25rem 0 1.5rem;
	}

	.static-main .cta {
		background: var(--primary-color);
		border-radius: var(--global-border-radius);
		color: var(--on-primary, #04130b);
		font-weight: 600;
		padding: 0.75rem 1.4rem;
		text-decoration: none;

		&.secondary {
			background: transparent;
			border: 1px solid var(--border);
			color: var(--text-primary);
		}
	}

	.shot {
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		display: block;
		height: auto;
		margin: 0 auto 1.5rem;
		max-width: min(100%, 320px);
	}

	ul {
		color: var(--text-secondary);
		font-size: 0.95rem;
		line-height: 1.7;
		margin-bottom: 1rem;
		padding-left: 1.25rem;

		li {
			margin-bottom: 0.4rem;
		}
	}

	h3 {
		color: var(--text-primary);
		font-size: 1rem;
		margin: 1rem 0 0.25rem;
	}

	.more {
		list-style: none;
		padding: 0;

		li {
			display: grid;
			gap: 0.1rem;
			margin-bottom: 0.75rem;
		}

		a {
			color: var(--primary-color);
			font-weight: 600;
		}

		span {
			font-size: 0.9rem;
		}
	}
</style>
