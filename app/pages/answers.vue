<template>
	<div class="answers-page">
		<nav
			v-if="!$config.public.appShell"
			class="answers-nav"
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

		<main class="answers-main">
			<h1 class="answers-heading">Footballdle answers</h1>
			<p class="answers-intro">
				Every past Daily answer, newest first. Today's stays hidden until midnight (UK time), so
				<NuxtLink
					to="/play/daily"
					title="Play today's puzzle"
					>have a go at today's</NuxtLink
				>
				first.
			</p>

			<section
				v-for="month in months"
				:key="month.label"
				class="month"
			>
				<h2 class="month-title">{{ month.label }}</h2>
				<ul class="answer-list">
					<li
						v-for="p in month.days"
						:key="p.iso"
					>
						<NuxtLink
							:to="`/solution/${p.iso}`"
							:title="`Footballdle answer, ${p.long}`"
							class="answer-row"
						>
							<span class="row-date">{{ p.short }}</span>
							<span class="row-answer">{{ p.answer }}</span>
							<span
								v-if="p.number"
								class="row-number"
								>#{{ p.number }}</span
							>
						</NuxtLink>
					</li>
				</ul>
			</section>
		</main>
	</div>
</template>

<script setup lang="ts">
	import { getAnswerForDay, getDisplayNumber, getPuzzleNumber } from '../composables/useFootballers'

	// The archive behind the per-day answer pages (pages/solution/[date].vue): every day from
	// puzzle 1 up to yesterday, grouped by month, newest first. Never today: that would give
	// today's answer away.
	function getUKToday(): Date {
		const s = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' })
		const [dd, mm, yyyy] = s.split(/[/,\s]+/).map(Number)
		return new Date(yyyy!, mm! - 1, dd)
	}
	const pad = (n: number) => String(n).padStart(2, '0')
	const ukDateStr = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`

	const days: { iso: string; short: string; long: string; month: string; answer: string; number: number | null }[] = []
	const cursor = getUKToday()
	cursor.setDate(cursor.getDate() - 1)
	while (getPuzzleNumber(ukDateStr(cursor)) >= 1) {
		const uk = ukDateStr(cursor)
		days.push({
			iso: `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`,
			short: cursor.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
			long: cursor.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
			month: cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
			answer: getAnswerForDay(uk).toUpperCase(),
			number: getDisplayNumber(uk),
		})
		cursor.setDate(cursor.getDate() - 1)
	}
	const months = days.reduce<{ label: string; days: typeof days }[]>((list, d) => {
		if (list.at(-1)?.label !== d.month) list.push({ label: d.month, days: [] })
		list.at(-1)!.days.push(d)
		return list
	}, [])

	useHead({
		title: 'Footballdle Answers: every past Daily puzzle | Footballdle',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk/answers' }],
		meta: [
			{
				name: 'description',
				content: `Every past Footballdle answer, newest first${days[0] ? `, from yesterday's (${days[0].long})` : ''}. Today's stays hidden: play the daily Premier League footballer guessing game at footballdle.co.uk.`,
			},
			{ property: 'og:title', content: 'Footballdle Answers' },
			{ property: 'og:url', content: 'https://footballdle.co.uk/answers' },
			{ name: 'robots', content: 'index, follow' },
		],
	})
</script>

<style scoped lang="scss">
	.answers-page {
		height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
		overflow-y: auto;
		padding: 0 1rem 3rem;
	}

	.answers-nav {
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

			&:hover {
				color: var(--primary-color);
			}
		}
	}

	.answers-main {
		margin: 0 auto;
		max-width: 480px;
		padding-top: 1.5rem;
	}

	.answers-heading {
		color: var(--text-primary);
		font-size: 1.6rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.answers-intro {
		color: var(--text-secondary);
		font-size: 0.95rem;
		line-height: 1.6;
		margin-bottom: 1.75rem;

		a {
			color: var(--primary-color);
			font-weight: 600;
		}
	}

	.month {
		margin-bottom: 1.75rem;
	}

	.month-title {
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
	}

	.answer-list {
		background: var(--bg-gradient);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		list-style: none;
		margin: 0;
		overflow: hidden;
		padding: 0;

		li + li {
			border-top: 1px solid var(--border);
		}
	}

	.answer-row {
		align-items: center;
		color: var(--text-primary);
		display: grid;
		gap: 0.75rem;
		grid-template-columns: 4.5rem 1fr auto;
		padding: 0.7rem 1rem;
		text-decoration: none;

		&:hover {
			background: var(--bg-primary);
		}
	}

	.row-date {
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.row-answer {
		font-weight: 700;
		letter-spacing: 0.06em;
	}

	.row-number {
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
	}
</style>
