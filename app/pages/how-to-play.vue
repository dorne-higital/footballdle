<template>
	<div class="static-page">
		<nav
			v-if="!$config.public.isApp"
			class="static-nav"
		>
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
			<h1>How to Play Footballdle</h1>
			<p>
				Footballdle is a free daily word game for football fans. Your goal is to guess a hidden Premier League
				footballer's surname in six tries or fewer. A new puzzle drops every day at midnight UK time — your
				streak and statistics are saved automatically on your device, no account needed.
			</p>

			<h2>The basics</h2>
			<p>
				Every answer is a five- or six-letter surname belonging to a player in the current {{ season }} Premier League
				season. Type any valid Premier League surname and press Enter to submit your guess. After each guess
				the tiles change colour to show how close you are — use the clues to narrow down the answer.
			</p>

			<h2>What the colours mean</h2>
			<p>Each letter in your guess is highlighted in one of three colours after you submit:</p>

			<div class="colour-guide">
				<div class="colour-row">
					<span class="tile correct">A</span>
					<p>
						<strong>Green</strong> — this letter is in the answer <em>and</em> in exactly the right
						position. Keep it there.
					</p>
				</div>
				<div class="colour-row">
					<span class="tile present">G</span>
					<p>
						<strong>Yellow</strong> — this letter is in the answer but in the <em>wrong</em> position.
						Try it somewhere else.
					</p>
				</div>
				<div class="colour-row">
					<span class="tile absent">N</span>
					<p>
						<strong>Grey</strong> — this letter does not appear in the answer at all. Cross it off the
						keyboard.
					</p>
				</div>
			</div>

			<h2>An example</h2>
			<p>
				Say the answer is <strong>PALMER</strong>. If your first guess is <strong>ARCHER</strong>, you would
				see: A yellow (it's in PALMER, but not first), R grey (PALMER has only one R, and it's already matched
				at the end), C grey, H grey, E green and R green (both in exactly the right place). Your second guess
				should keep E and R where they are and move the A somewhere new.
			</p>

			<h2>Rules</h2>
			<ul>
				<li>Each guess must be a real Premier League player from the {{ season }} season whose surname is as long as that day's board (five or six letters).</li>
				<li>You have a maximum of six guesses per day.</li>
				<li>Letters can appear more than once in an answer — yellow/green hints reflect each instance separately.</li>
				<li>The on-screen keyboard tracks which letters you have used: green, yellow, and grey keys update after every guess.</li>
				<li v-if="!$config.public.isApp">You can also type on a physical keyboard — press Enter to submit and Backspace to delete.</li>
			</ul>

			<h2>Tips and strategy</h2>
			<p>
				Start with a word that covers common letters — surnames in English football tend to use letters like
				R, S, T, N, L, and E heavily. A strong opener eliminates several letters at once. After your first
				guess, focus on placing yellow letters correctly before adding new ones. Once you have two or three
				greens, the remaining positions should narrow things down quickly.
			</p>
			<p>
				If you are stuck, think about common Premier League surname patterns: many end in <em>-ER</em>,
				<em>-ON</em>, <em>-ES</em>, or <em>-SON</em>. Defenders and goalkeepers from South America and
				Africa are well represented — don't only think of English names.
			</p>

			<h2>Challenge mode</h2>
			<p>
				Complete the daily puzzle to unlock Challenge mode. This is a faster, unlimited game where you guess
				a different five-letter Premier League surname against a 45-second countdown. Challenge mode can be
				played as many times as you like — it's great for practising pattern recognition and sharpening your
				letter instincts before the next daily puzzle.
			</p>

			<template v-if="$config.public.isApp">
				<h2>Scout Report</h2>
				<p>
					Guess any Premier League player in six tries. Each guess shows how it compares with the mystery
					player's club, nationality and position: green is a match, amber is close (for example, a nationality from the
					same continent), grey is a miss.
				</p>

				<h2>Spot the Baller</h2>
				<p>
					Ten rapid-fire rounds. Each round gives you club, nationality and position clues and four names:
					pick the right player before the 8-second clock runs out. Get 6 or more right to win the day.
				</p>

				<h2>Hints</h2>
				<p>
					Stuck? A hint reveals a clue about the answer. In the Daily that's club, nationality, position, then
					the first and second letters. In Scout Report it's the continent, the nation's first letter, the
					position and the name's initials, in a different order each day. Up to five per game. You start
					with 3 free hints and earn another for every 5 days of Daily
					streak. Banked hints never expire. You can buy more hints, or get Pro once for unlimited hints. Both
					are optional, and every game is free to play without them.
				</p>

				<h2>Player Cards</h2>
				<p>
					Win the Daily to collect that player's card. Win it in two guesses or fewer and it's a shiny one.
					Cards are grouped by club: finish a club's set and you win free hints, up to 4 for the biggest
					squads. Missed a card? Once its day has passed you can replay it from the Cards tab for a hint, one a
					day after you've finished the Daily.
				</p>

				<h2>Streaks</h2>
				<p>
					Each mode keeps its own winning streak. Your Matchday streak on the home screen counts the days in a
					row you've finished at least one game, win or lose.
				</p>
			</template>

			<h2>Frequently asked questions</h2>

			<h2>Why can't I submit my guess?</h2>
			<p>
				Only valid Premier League surnames from the current {{ season }} season are accepted. If a name is not
				recognised, check the spelling — some players are listed under an anglicised version of their name
				rather than a nickname or shortened form.
			</p>

			<h2>The player I'm thinking of isn't in the game</h2>
			<p>
				The player list covers active {{ season }} Premier League squads and is updated regularly. Players must
				have a five- or six-letter surname to qualify for the daily puzzle. If you think someone is
				missing,
				<NuxtLink to="/feedback?topic=missing-player" title="Report a missing player">let us know</NuxtLink> and we'll add them.
			</p>

			<h2>I lost my streak — what happened?</h2>
			<p v-if="$config.public.isApp">
				Streaks and stats are stored on your iPhone. Deleting the app or switching phones will reset them.
				There is currently no cloud save, so play on the same phone each day to keep your streak going.
			</p>
			<p v-else>
				Streaks and stats are stored on your device. Deleting the app, clearing your browser data, switching
				devices or using a private window will reset them. There is currently no cloud save, so play on the
				same device each day to keep your streak intact.
			</p>

			<h2>Is Footballdle free?</h2>
			<p>
				<template v-if="$config.public.isApp">
					Yes, every game is free to play with no sign-up and no subscription. Extra hints and Pro are
					optional purchases.
				</template>
				<template v-else>
					Yes — completely free, no sign-up, no subscription.
				</template>
				<template v-if="!$config.public.isApp">
					If you enjoy playing and want to support the game, you can
					<a
						href="https://buymeacoffee.com/dhorne92E"
						target="_blank"
						rel="noopener noreferrer"
						>buy me a coffee</a
					>. It genuinely helps keep the site running.
				</template>
			</p>

			<h2>How often is the player list updated?</h2>
			<p>
				The Premier League squad list is refreshed at the start of each season and again during the January
				transfer window to reflect new signings and departures.
			</p>

			<div class="cta">
				<NuxtLink
					to="/play/daily"
					class="cta-button"
					title="Play today's puzzle"
				>
					Play today's puzzle →
				</NuxtLink>
			</div>
		</main>

		<SiteFooter />
	</div>
</template>

<script setup lang="ts">
	import playerMeta from '../data/meta.json'

	// Season of the current player list (updated by yarn update-players)
	const season = playerMeta.season

	useHead({
		title: 'How to Play Footballdle | Rules, Tips & Game Modes',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk/how-to-play' }],
		meta: [
			{
				name: 'description',
				content:
					'Learn how to play Footballdle — the free daily Premier League footballer guessing game. Understand the colour system, rules, tips, and how Challenge mode works.',
			},
			{ name: 'robots', content: 'index, follow' },
		],
	})
</script>

<style scoped lang="scss">
	@use '../../assets/static-page';

	.colour-guide {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 1rem 0 1.5rem;
	}

	.colour-row {
		align-items: center;
		display: flex;
		gap: 1rem;

		p {
			margin: 0;
		}
	}

	.tile {
		align-items: center;
		border-radius: 4px;
		color: #fff;
		display: inline-flex;
		flex-shrink: 0;
		font-size: 1.1rem;
		font-weight: 700;
		height: 2.25rem;
		justify-content: center;
		width: 2.25rem;

		&.correct {
			background: var(--color-success);
		}

		&.present {
			background: var(--color-present);
		}

		&.absent {
			background: var(--color-absent);
		}
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
</style>
