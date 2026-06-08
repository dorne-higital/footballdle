<template>
	<div class="solution-page">
		<nav class="solution-nav">
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

		<main class="solution-main">
			<div class="puzzle-meta">
				<span class="puzzle-number">Puzzle #{{ puzzleNumber }}</span>
				<span class="puzzle-date">{{ formattedDate }}</span>
			</div>

			<h1 class="solution-heading">Footballdle Answer — {{ formattedDate }}</h1>

			<div class="answer-card">
				<span
					v-for="(letter, i) in answer.toUpperCase().split('')"
					:key="i"
					class="answer-letter"
				>
					{{ letter }}
				</span>
			</div>

			<div
				v-if="playerData"
				class="player-details"
			>
				<div class="detail-chip">
					<Icon
						name="solar:shield-linear"
						size="0.9rem"
					/>
					{{ playerData.club }}
				</div>
				<div class="detail-chip">
					<Icon
						name="solar:football-linear"
						size="0.9rem"
					/>
					{{ playerData.position }}
				</div>
				<div class="detail-chip">
					<Icon
						name="solar:earth-linear"
						size="0.9rem"
					/>
					{{ playerData.nationality }}
				</div>
			</div>

			<p
				v-if="playerData"
				class="solution-description"
			>
				The answer to Footballdle puzzle #{{ puzzleNumber }} on {{ formattedDate }} was
				<strong>{{ answer.toUpperCase() }}</strong> — a {{ playerData.nationality }}
				{{ playerData.position.toLowerCase() }} who plays for {{ playerData.club }} in the Premier
				League. Did you get it? Come back tomorrow for a new puzzle.
			</p>

			<AdUnit />

			<div class="cta-section">
				<p class="cta-text">Can you guess today's player?</p>
				<NuxtLink
					to="/"
					class="cta-button"
					title="Play today's puzzle"
				>
					Play today's puzzle →
				</NuxtLink>
			</div>

			<div
				v-if="recentPuzzles.length"
				class="recent-section"
			>
				<p class="recent-title">Recent answers</p>
				<div class="recent-grid">
					<NuxtLink
						v-for="p in recentPuzzles"
						:key="p.iso"
						:to="`/solution/${p.iso}`"
						:title="`Footballdle answer — ${p.label}`"
						class="recent-item"
					>
						<span class="recent-answer">{{ p.answer.toUpperCase() }}</span>
						<span class="recent-label">{{ p.label }}</span>
					</NuxtLink>
				</div>
			</div>
			<AdUnit />
		</main>

		<footer class="solution-footer">
			<p>A new Premier League footballer to guess every day at midnight (UK time).</p>
			<NuxtLink to="/" title="Play Footballdle">footballdle.co.uk</NuxtLink>
		</footer>
	</div>
</template>

<script setup lang="ts">
	import { getAnswerForDay, getPlayerData, getPuzzleNumber } from '../../composables/useFootballers'

	const { public: { adsensePublisherId } } = useRuntimeConfig()

	if (adsensePublisherId) {
		useHead({
			script: [
				{
					src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisherId}`,
					async: true,
					crossorigin: 'anonymous',
				},
			],
		})
	}

	const route = useRoute()
	const dateParam = route.params.date as string

	function parseISO(str: string): Date | null {
		const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
		if (!match) return null
		const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
		return isNaN(d.getTime()) ? null : d
	}

	function toUKDateStr(d: Date): string {
		const dd = String(d.getDate()).padStart(2, '0')
		const mm = String(d.getMonth() + 1).padStart(2, '0')
		return `${dd}/${mm}/${d.getFullYear()}`
	}

	function getUKToday(): Date {
		const s = new Date().toLocaleString('en-GB', {
			timeZone: 'Europe/London',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		})
		const [dd, mm, yyyy] = s.split(/[/,\s]+/).map(Number)
		return new Date(yyyy!, mm! - 1, dd)
	}

	const parsedDate = parseISO(dateParam)

	if (!parsedDate) {
		throw createError({ statusCode: 404, statusMessage: 'Puzzle not found' })
	}

	const ukToday = getUKToday()

	if (parsedDate > ukToday) {
		throw createError({ statusCode: 404, statusMessage: 'This puzzle has not been released yet' })
	}

	const ukDateStr = toUKDateStr(parsedDate)
	const puzzleNumber = getPuzzleNumber(ukDateStr)
	const answer = getAnswerForDay(ukDateStr)
	const playerData = getPlayerData(answer)

	const formattedDate = parsedDate.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'Europe/London',
	})

	// Up to 5 recent past puzzles for internal linking (excluding this page)
	const recentPuzzles = Array.from({ length: 6 }, (_, i) => {
		const d = new Date(ukToday)
		d.setDate(d.getDate() - i - 1)
		const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
		const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/London' })
		const pastAnswer = getAnswerForDay(toUKDateStr(d))
		return { iso, label, answer: pastAnswer }
	})
		.filter((p) => p.iso !== dateParam && getPuzzleNumber(toUKDateStr(parseISO(p.iso)!)) >= 1)
		.slice(0, 5)

	const answerUpper = answer.toUpperCase()
	const playerDesc = playerData ? ` – ${playerData.position} for ${playerData.club}` : ''

	const faqAnswer = playerData
		? `The Footballdle answer on ${formattedDate} was ${answerUpper} — a ${playerData.nationality} ${playerData.position.toLowerCase()} who plays for ${playerData.club} in the Premier League.`
		: `The Footballdle answer on ${formattedDate} was ${answerUpper}.`

	useHead({
		title: `Footballdle #${puzzleNumber} Answer (${formattedDate}) – ${answerUpper} | Footballdle`,
		link: [{ rel: 'canonical', href: `https://footballdle.co.uk/solution/${dateParam}` }],
		meta: [
			{
				name: 'description',
				content: `The answer to Footballdle puzzle #${puzzleNumber} on ${formattedDate} was ${answerUpper}${playerDesc}. Play today's free Premier League footballer guessing game at footballdle.co.uk.`,
			},
			{ property: 'og:title', content: `Footballdle #${puzzleNumber} Answer – ${answerUpper}` },
			{
				property: 'og:description',
				content: `Puzzle #${puzzleNumber} answer: ${answerUpper}${playerDesc}. Daily Premier League footballer guessing game.`,
			},
			{ property: 'og:url', content: `https://footballdle.co.uk/solution/${dateParam}` },
			{ property: 'og:type', content: 'article' },
			{ name: 'robots', content: 'index, follow' },
		],
		script: [
			{
				type: 'application/ld+json',
				children: JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'FAQPage',
					mainEntity: [
						{
							'@type': 'Question',
							name: `What was the Footballdle answer on ${formattedDate}?`,
							acceptedAnswer: {
								'@type': 'Answer',
								text: faqAnswer,
							},
						},
						{
							'@type': 'Question',
							name: 'What is Footballdle?',
							acceptedAnswer: {
								'@type': 'Answer',
								text: 'Footballdle is a free daily Premier League footballer guessing game. Each day, guess a hidden 6-letter footballer surname in up to 6 tries. A new player is revealed every day at midnight UK time.',
							},
						},
					],
				}),
			},
		],
	})
</script>

<style scoped lang="scss">
	.solution-page {
		height: 100dvh;
		overflow-y: auto;
		padding: 0 1rem 3rem;
	}

	.solution-nav {
		align-items: center;
		display: flex;
		justify-content: space-between;
		margin: 0 auto;
		max-width: 480px;
		padding: 1rem 0;

		.back-link {
			align-items: center;
			color: var(--text-secondary);
			display: inline-flex;
			font-size: 0.9rem;
			gap: 0.3rem;
			text-decoration: none;
			transition: color 0.2s;

			&:hover {
				color: var(--primary-color);
			}
		}

		.nav-brand {
			color: var(--text-secondary);
			font-size: 0.9rem;
			font-weight: 600;
		}
	}

	.solution-main {
		margin: 0 auto;
		max-width: 480px;
		padding-top: 2rem;
		text-align: center;
	}

	.puzzle-meta {
		align-items: center;
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		margin-bottom: 0.75rem;

		.puzzle-number {
			background: var(--primary-color);
			border-radius: 2rem;
			color: #fff;
			font-size: 0.8rem;
			font-weight: 700;
			padding: 0.2rem 0.75rem;
		}

		.puzzle-date {
			color: var(--text-secondary);
			font-size: 0.9rem;
		}
	}

	.page-title {
		color: var(--text-primary);
		font-size: 1.6rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
	}

	.solution-heading {
		color: var(--text-primary);
		font-size: 1.4rem;
		font-weight: 700;
		margin-bottom: 1.25rem;
	}

	.solution-description {
		color: var(--text-secondary);
		font-size: 0.95rem;
		line-height: 1.6;
		margin-bottom: 1.5rem;
		text-align: left;
	}

	.answer-card {
		background: var(--bg-gradient);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		display: flex;
		gap: 0.4rem;
		justify-content: center;
		margin-bottom: 1.25rem;
		padding: 1.25rem 1rem;

		.answer-letter {
			align-items: center;
			background: var(--color-success);
			border-radius: var(--global-border-radius);
			color: #fff;
			display: flex;
			font-size: 1.6rem;
			font-weight: 700;
			height: 3rem;
			justify-content: center;
			width: 3rem;
		}
	}

	.player-details {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
		margin-bottom: 2rem;

		.detail-chip {
			align-items: center;
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: 2rem;
			color: var(--text-primary);
			display: inline-flex;
			font-size: 0.85rem;
			font-weight: 500;
			gap: 0.35rem;
			padding: 0.35rem 0.85rem;
		}
	}

	.cta-section {
		background: var(--bg-gradient);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		margin-bottom: 2rem;
		padding: 1.5rem 1rem;

		.cta-text {
			color: var(--text-secondary);
			font-size: 0.95rem;
			margin-bottom: 1rem;
		}

		.cta-button {
			background: var(--primary-color);
			border-radius: var(--global-border-radius);
			color: #fff;
			display: inline-block;
			font-size: 1rem;
			font-weight: 600;
			padding: 0.75rem 1.75rem;
			text-decoration: none;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.9;
			}
		}
	}

	.recent-section {
		text-align: left;

		.recent-title {
			color: var(--text-secondary);
			font-size: 0.8rem;
			font-weight: 600;
			letter-spacing: 0.05em;
			margin-bottom: 0.75rem;
			text-transform: uppercase;
		}

		.recent-grid {
			display: flex;
			flex-direction: column;
			gap: 0.4rem;

			.recent-item {
				align-items: center;
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				color: var(--text-primary);
				display: flex;
				justify-content: space-between;
				padding: 0.65rem 1rem;
				text-decoration: none;
				transition: border-color 0.2s;

				&:hover {
					border-color: var(--primary-color);
				}

				.recent-answer {
					font-size: 1rem;
					font-weight: 700;
					letter-spacing: 0.05em;
				}

				.recent-label {
					color: var(--text-secondary);
					font-size: 0.85rem;
				}
			}
		}
	}

	.solution-footer {
		border-top: 1px solid var(--border);
		color: var(--text-secondary);
		font-size: 0.8rem;
		margin: 2rem auto 0;
		max-width: 480px;
		padding-top: 1.5rem;
		text-align: center;

		a {
			color: var(--primary-color);
			font-weight: 600;
			text-decoration: none;
		}
	}
</style>
