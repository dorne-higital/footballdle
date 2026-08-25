<template>
	<div class="season-form-dashboard">
		<div class="stats-grid">
			<div
				v-for="stat in primaryStats"
				:key="stat.label"
				class="stat-card"
			>
				<h3>{{ stat.value }}</h3>
				<p class="caption">{{ stat.label }}</p>
			</div>
		</div>

		<div
			v-if="recentForm && recentForm.length"
			class="form-strip"
		>
			<p class="caption form-title">Recent form</p>
			<div class="form-squares">
				<span
					v-for="(win, i) in recentForm"
					:key="i"
					class="form-sq"
					:class="win ? 'win' : 'loss'"
				/>
			</div>
		</div>

		<div class="win-rate">
			<div class="progress-bar">
				<div
					class="progress-fill"
					:style="{ width: `${winPercentage}%` }"
				/>
			</div>
			<p>{{ winPercentage }}% win rate</p>
		</div>

		<div
			v-if="distribution"
			class="guess-distribution"
		>
			<p class="caption distribution-title">Guess Distribution</p>
			<div
				v-for="n in 6"
				:key="n"
				class="dist-row"
			>
				<span class="dist-label">{{ n }}</span>
				<div class="dist-bar-wrap">
					<div
						class="dist-bar"
						:class="{ highlight: highlightGuessCount === n }"
						:style="{ width: getBarWidth(n) }"
					>
						<span class="dist-count">{{ distribution[String(n)] || 0 }}</span>
					</div>
				</div>
			</div>
		</div>

		<div
			v-if="scoreHistogram"
			class="guess-distribution"
		>
			<p class="caption distribution-title">Score Distribution</p>
			<div
				v-for="bucket in scoreHistogram"
				:key="bucket.label"
				class="dist-row"
			>
				<span class="dist-label">{{ bucket.label }}</span>
				<div class="dist-bar-wrap">
					<div
						class="dist-bar"
						:style="{ width: getScoreBarWidth(bucket.count) }"
					>
						<span class="dist-count">{{ bucket.count }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			primaryStats: { label: string; value: string | number }[]
			winPercentage: number
			distribution?: Record<string, number>
			recentForm?: boolean[]
			highlightGuessCount?: number
			// Score-based modes (e.g. Spot the Baller) have no guess distribution —
			// they get a labelled bucket histogram instead.
			scoreHistogram?: { label: string; count: number }[]
		}>(),
		{
			highlightGuessCount: 0,
		},
	)

	function getBarWidth(n: number): string {
		if (!props.distribution) return '1.5rem'
		const max = Math.max(...Object.values(props.distribution).map(Number), 1)
		const count = Number(props.distribution[String(n)] || 0)
		return count === 0 ? '1.5rem' : `${Math.max((count / max) * 100, 10)}%`
	}

	function getScoreBarWidth(count: number): string {
		if (!props.scoreHistogram) return '1.5rem'
		const max = Math.max(...props.scoreHistogram.map((b) => b.count), 1)
		return count === 0 ? '1.5rem' : `${Math.max((count / max) * 100, 10)}%`
	}
</script>

<style scoped lang="scss">
	.season-form-dashboard {
		width: 100%;

		.stats-grid {
			display: grid;
			gap: 0.5rem;
			grid-template-columns: repeat(2, 1fr);
			margin-bottom: 0.5rem;

			.stat-card {
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				padding: 1rem;
				text-align: center;

				h3 {
					color: var(--text-primary);
					font-family: var(--font-mono);
					font-size: 2rem;
					font-weight: 700;
					margin: 0 0 0.5rem;
				}

				.caption {
					color: var(--text-secondary);
					font-family: var(--font-display);
					font-size: 0.68rem;
					font-weight: 700;
					letter-spacing: 0.1em;
					text-transform: uppercase;
				}
			}
		}

		.form-strip {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--global-border-radius);
			margin-bottom: 0.5rem;
			padding: 0.75rem 1rem;

			.form-title {
				color: var(--text-secondary);
				font-family: var(--font-display);
				font-size: 0.68rem;
				font-weight: 700;
				letter-spacing: 0.1em;
				margin-bottom: 0.6rem;
				text-align: left;
				text-transform: uppercase;
			}

			.form-squares {
				display: flex;
				flex-wrap: wrap;
				gap: 6px;
			}

			.form-sq {
				border-radius: 6px;
				height: 20px;
				width: 20px;

				&.win {
					background: var(--primary-color);
				}

				&.loss {
					background: var(--color-absent);
				}
			}
		}

		.win-rate {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--global-border-radius);
			padding: 1rem;

			.progress-bar {
				background: var(--turf-base);
				border-radius: 999px;
				height: 8px;
				margin-bottom: 0.5rem;
				overflow: hidden;
				width: 100%;

				.progress-fill {
					background: var(--primary-color);
					border-radius: 999px;
					height: 100%;
					transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
				}
			}

			p {
				color: var(--text-secondary);
				font-size: 0.85rem;
				font-weight: 500;
				margin: 0;
				text-align: center;
			}
		}

		.guess-distribution {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--global-border-radius);
			margin-top: 0.5rem;
			padding: 1rem;

			.distribution-title {
				color: var(--text-secondary);
				font-family: var(--font-display);
				font-size: 0.68rem;
				font-weight: 700;
				letter-spacing: 0.1em;
				margin-bottom: 0.75rem;
				text-align: left;
				text-transform: uppercase;
			}

			.dist-row {
				align-items: center;
				display: flex;
				gap: 0.5rem;
				margin-bottom: 0.3rem;

				.dist-label {
					color: var(--text-secondary);
					flex-shrink: 0;
					font-family: var(--font-mono);
					font-size: 0.8rem;
					font-weight: 700;
					text-align: right;
					width: 0.75rem;
				}

				.dist-bar-wrap {
					flex: 1;

					.dist-bar {
						align-items: center;
						background: var(--turf-base);
						border-radius: 999px;
						display: flex;
						justify-content: flex-end;
						min-width: 1.5rem;
						padding: 0.2rem 0.5rem;
						transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);

						.dist-count {
							color: var(--text-secondary);
							font-family: var(--font-mono);
							font-size: 0.75rem;
							font-weight: 700;
						}

						&.highlight {
							background: var(--primary-color);

							.dist-count {
								color: var(--bg-secondary);
							}
						}
					}
				}
			}
		}
	}
</style>
