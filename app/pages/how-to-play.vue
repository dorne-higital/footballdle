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
			<h1>How to Play Footballdle</h1>
			<p>
				Footballdle is a free daily word game for football fans. Your goal is to guess a hidden Premier League
				footballer's surname in six tries or fewer. A new puzzle drops every day at midnight UK time — your
				streak and statistics are saved automatically in your browser, no account needed.
			</p>

			<h2>The basics</h2>
			<p>
				Every answer is a six-letter surname belonging to a player in the current 2025/26 Premier League
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
				see: A grey, R yellow (it's in PALMER but not in position 2), C grey, H grey, E yellow (in PALMER but
				not in position 5), R grey. Your second guess should place R and E in new positions while keeping any
				green letters exactly where they are.
			</p>

			<h2>Rules</h2>
			<ul>
				<li>Each guess must be a real Premier League player from the 2025/26 season with a six-letter surname.</li>
				<li>You have a maximum of six guesses per day.</li>
				<li>Letters can appear more than once in an answer — yellow/green hints reflect each instance separately.</li>
				<li>The on-screen keyboard tracks which letters you have used: green, yellow, and grey keys update after every guess.</li>
				<li>You can also type on a physical keyboard — press Enter to submit and Backspace to delete.</li>
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

			<h2>World Cup 2026 mode</h2>
			<p>
				Footballdle also features a special World Cup 2026 edition available year-round. Instead of a
				six-letter Premier League name, you guess <em>any</em> surname from the 48 squads competing at the
				2026 FIFA World Cup in the USA, Canada, and Mexico — over 1,000 players with no length restriction.
				After each wrong guess you get additional hints: the player's continent, country, position, and
				approximate age, with arrows showing whether the answer is older or younger than your guess. You
				still have six tries to find the correct player.
			</p>

			<h2>Frequently asked questions</h2>

			<h2>Why can't I submit my guess?</h2>
			<p>
				Only valid Premier League surnames from the current 2025/26 season are accepted. If a name is not
				recognised, check the spelling — some players are listed under an anglicised version of their name
				rather than a nickname or shortened form.
			</p>

			<h2>The player I'm thinking of isn't in the game</h2>
			<p>
				The player list covers active 2025/26 Premier League squads and is updated regularly. Players must
				have exactly six letters in their surname to qualify for the daily puzzle. If you think someone is
				missing, drop us an email at
				<a href="mailto:footballdleadmin@gmail.com">footballdleadmin@gmail.com</a> and we'll add them.
			</p>

			<h2>I lost my streak — what happened?</h2>
			<p>
				Streaks and stats are stored locally in your browser. Clearing your browser history, switching
				devices, or using a private/incognito window will reset them. There is currently no cloud save, so
				play in the same browser each day to keep your streak intact.
			</p>

			<h2>Is Footballdle free?</h2>
			<p>
				Yes — completely free, no sign-up, no subscription. If you enjoy playing and want to support the
				game, you can
				<a
					href="https://buymeacoffee.com/dhorne92E"
					target="_blank"
					rel="noopener noreferrer"
					>buy me a coffee</a
				>. It genuinely helps keep the site running.
			</p>

			<h2>How often is the player list updated?</h2>
			<p>
				The Premier League squad list is refreshed at the start of each season and again during the January
				transfer window to reflect new signings and departures. The World Cup 2026 list was compiled from
				official FIFA squad submissions and covers all 48 qualified nations.
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
		title: 'How to Play Footballdle | Rules, Tips & Game Modes',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk/how-to-play' }],
		meta: [
			{
				name: 'description',
				content:
					'Learn how to play Footballdle — the free daily Premier League footballer guessing game. Understand the colour system, rules, tips, and how Challenge and World Cup modes work.',
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
