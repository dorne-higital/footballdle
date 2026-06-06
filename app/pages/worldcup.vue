<template>
	<div class="wc-page dark">
		<!-- Header -->
		<header class="wc-header">
			<NuxtLink
				to="/"
				class="back-link"
			>
				<Icon
					name="solar:alt-arrow-left-linear"
					size="1rem"
				/>
				Home
			</NuxtLink>
			<div class="wc-title">
				<span class="wc-badge">World Cup 2026</span>
				<span class="wc-puzzle">#{{ wcStore.puzzleNumber }}</span>
			</div>
			<button
				class="stats-btn"
				@click="openStats"
			>
				<Icon
					name="solar:chart-2-linear"
					size="1.1rem"
				/>
			</button>
		</header>

		<!-- Error toast -->
		<Transition name="toast">
			<div
				v-if="wcStore.errorMessage"
				class="error-toast"
			>
				{{ wcStore.errorMessage }}
			</div>
		</Transition>

		<!-- Main game area -->
		<main class="wc-main">
			<p class="page-subtitle">Guess any World Cup 2026 player by surname — 6 tries.</p>

			<!-- Wrong guesses list -->
			<div
				v-if="wrongGuesses.length"
				class="guess-list"
			>
				<TransitionGroup name="guess">
					<div
						v-for="(guess, i) in wrongGuesses"
						:key="guess"
						:class="['guess-chip', i === wrongGuesses.length - 1 ? 'latest' : 'past']"
					>
						<span class="guess-name">{{ guess.toUpperCase() }}</span>
						<div
							v-if="getGuessData(guess)"
							class="guess-attrs"
						>
							<span
								:class="[
									'attr',
									getGuessData(guess)?.continent === playerData?.continent ? 'match' : 'miss',
								]"
							>
								<Icon
									name="solar:globe-linear"
									size="0.7rem"
								/>
								{{ shortContinent(getGuessData(guess)?.continent) }}
							</span>
							<span
								:class="[
									'attr',
									getGuessData(guess)?.country === playerData?.country ? 'match' : 'miss',
								]"
							>
								<Icon
									name="solar:earth-linear"
									size="0.7rem"
								/>
								{{ getGuessData(guess)?.country }}
							</span>
							<span
								:class="[
									'attr',
									getGuessData(guess)?.position === playerData?.position ? 'match' : 'miss',
								]"
							>
								<Icon
									name="solar:football-linear"
									size="0.7rem"
								/>
								{{ shortPosition(getGuessData(guess)?.position) }}
							</span>
							<span
								v-if="getGuessData(guess)?.born && playerData?.born"
								:class="['attr age', getGuessData(guess)?.born === playerData?.born ? 'match' : 'miss']"
							>
								<Icon
									v-if="getGuessData(guess)!.born === playerData!.born"
									name="solar:check-circle-linear"
									size="0.7rem"
								/>
								<!-- born earlier = older = answer is younger (↓ age) -->
								<Icon
									v-else-if="getGuessData(guess)!.born < playerData!.born"
									name="solar:arrow-down-linear"
									size="0.7rem"
								/>
								<!-- born later = younger = answer is older (↑ age) -->
								<Icon
									v-else
									name="solar:arrow-up-linear"
									size="0.7rem"
								/>
								{{ getAge(getGuessData(guess)!.born) }}
							</span>
						</div>
					</div>
				</TransitionGroup>
				<p class="guess-count">{{ wcStore.guesses.length }} / {{ wcStore.maxGuesses }} guesses used</p>
			</div>

			<!-- Keyboard input (only shown when game active) -->
			<div
				v-if="!wcStore.gameOver"
				class="wc-keyboard-area"
			>
				<div
					v-if="suggestions.length"
					class="suggestions"
				>
					<button
						v-for="s in suggestions"
						:key="s.name"
						class="suggestion-item"
						:class="{ highlighted: s.name === highlightedSuggestion }"
						@mousedown.prevent="selectSuggestion(s.name)"
					>
						<div class="suggestion-left">
							<span class="suggestion-name">{{ s.name.toUpperCase() }}</span>
							<span class="suggestion-full">{{ s.fullName }}</span>
						</div>
						<span class="suggestion-meta">{{ s.country }} · {{ s.position }}</span>
					</button>
				</div>
				<div class="wc-query-display">
					<span
						v-if="searchQuery"
						class="query-text"
						>{{ searchQuery.toUpperCase() }}</span
					>
					<span
						v-else
						class="query-placeholder"
						>Type a surname…</span
					>
					<button
						v-if="searchQuery"
						class="submit-btn"
						@mousedown.prevent="submitCurrent"
					>
						Guess
					</button>
				</div>
				<Keyboard
					:disabled="wcStore.gameOver"
					@key="handleWCKeyboardKey"
				/>
			</div>

			<!-- Game over inline state -->
			<div
				v-if="wcStore.gameOver"
				class="game-over-inline"
			>
				<div :class="['result-badge', wcStore.isWin ? 'win' : 'loss']">
					<Icon
						:name="wcStore.isWin ? 'solar:cup-star-bold' : 'solar:sad-square-linear'"
						size="1.5rem"
					/>
					{{ wcStore.isWin ? 'Well played!' : 'Better luck next time' }}
				</div>
				<p class="answer-reveal">
					The answer was
					<strong>{{ wcStore.answer.toUpperCase() }}</strong>
					<span
						v-if="playerData"
						class="answer-meta"
					>
						— {{ playerData.fullName }}
					</span>
				</p>
				<p
					v-if="playerData"
					class="answer-detail"
				>
					{{ playerData.country }} · {{ playerData.position }}
					<span v-if="playerData.born">· born {{ playerData.born }}</span>
				</p>

				<!-- Share card -->
				<div class="share-card">
					<p class="share-header">Footballdle WC 2026 ⚽ #{{ wcStore.puzzleNumber }}</p>
					<div class="share-dots">
						<span
							v-for="(g, i) in wcStore.guesses"
							:key="i"
							:class="['dot', g.toLowerCase() === wcStore.answer.toLowerCase() ? 'correct' : 'wrong']"
						></span>
					</div>
				</div>

				<div class="share-buttons">
					<button
						class="button primary"
						@click="handleShare"
					>
						<Icon
							name="solar:copy-linear"
							size="1rem"
						/>
						{{ shareToast ? 'Copied!' : 'Copy result' }}
					</button>
					<button
						class="btn-x"
						@click="handleShareTwitter"
					>
						<Icon
							name="ri:twitter-x-fill"
							size="1rem"
						/>
						Share on X
					</button>
				</div>

				<NuxtLink
					to="/"
					class="back-home"
				>
					<Icon
						name="solar:alt-arrow-left-linear"
						size="0.9rem"
					/>
					Back to main game
				</NuxtLink>
			</div>
		</main>

		<!-- Stats modal -->
		<Teleport to="body">
			<Transition name="modal">
				<div
					v-if="showStats"
					class="wc-stats-overlay"
					@click.self="showStats = false"
				>
					<div class="wc-stats-modal">
						<div class="stats-modal-header">
							<div class="stats-modal-title">
								<Icon
									name="solar:cup-star-bold"
									size="1rem"
									class="stats-title-icon"
								/>
								<span>World Cup Statistics</span>
							</div>
							<button
								class="stats-close-btn"
								@click="showStats = false"
							>
								<Icon
									name="uil:times-circle"
									size="2rem"
								/>
							</button>
						</div>

						<div class="stats-spotlight">
							<div class="stats-win-rate">
								<span class="win-rate-number">{{ wcStatsStore.winPercentage }}</span>
								<div class="win-rate-label">
									<span class="win-rate-pct">%</span>
									<span class="win-rate-text">Win Rate</span>
								</div>
							</div>
						</div>

						<div class="stats-row">
							<div class="stat-cell">
								<span class="stat-number">{{ wcStatsStore.stats.gamesPlayed }}</span>
								<span class="stat-label">Played</span>
							</div>
							<div class="stat-cell">
								<span class="stat-number">{{ wcStatsStore.stats.wins }}</span>
								<span class="stat-label">Won</span>
							</div>
							<div class="stat-cell">
								<span class="stat-number">{{ wcStatsStore.stats.currentStreak }}</span>
								<span class="stat-label">Streak</span>
							</div>
							<div class="stat-cell">
								<span class="stat-number">{{ wcStatsStore.stats.maxStreak }}</span>
								<span class="stat-label">Best</span>
							</div>
						</div>

						<div class="stats-distribution">
							<p class="distribution-title">Guess Distribution</p>
							<div
								v-for="n in 6"
								:key="n"
								class="dist-row"
							>
								<span class="dist-label">{{ n }}</span>
								<div class="dist-bar-wrap">
									<div
										class="dist-bar"
										:style="{ width: distBarWidth(n) }"
									>
										<span class="dist-count">{{
											wcStatsStore.stats.guessDistribution[String(n)] || 0
										}}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from 'vue'
	import { useWCGameStore } from '../stores/wcGame'
	import { useWCStatsStore } from '../stores/wcStats'
	import { getWCSuggestions, getWCPlayerData } from '../composables/useWCFootballers'
	import type { WCFootballer } from '../composables/useWCFootballers'
	import { useAnalytics } from '../composables/useAnalytics'
	import { useHead } from 'nuxt/app'

	useHead({
		title: 'World Cup 2026 Event | Footballdle',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk/worldcup' }],
		meta: [
			{
				name: 'description',
				content:
					'Guess any World Cup 2026 player by surname in 6 tries. Free daily football guessing game — special WC edition.',
			},
			{ name: 'robots', content: 'index, follow' },
		],
	})

	const wcStore = useWCGameStore()
	const wcStatsStore = useWCStatsStore()
	const {
		trackWCGameStart,
		trackWCGuessSubmitted,
		trackWCGameWin,
		trackWCGameLoss,
		trackWCShare,
		trackWCStatsModal,
	} = useAnalytics()

	const searchQuery = ref('')
	const suggestions = ref<WCFootballer[]>([])
	const highlightedSuggestion = ref('')
	const shareToast = ref(false)
	const showStats = ref(false)
	let shareToastTimer: ReturnType<typeof setTimeout> | null = null

	const wrongGuesses = computed(() => wcStore.guesses.filter((g) => g.toLowerCase() !== wcStore.answer.toLowerCase()))

	const playerData = computed(() => getWCPlayerData(wcStore.answer))

	function getGuessData(guess: string) {
		return getWCPlayerData(guess)
	}

	function getAge(born: number): number {
		return new Date().getFullYear() - born
	}

	const positionAbbr: Record<string, string> = {
		Goalkeeper: 'G',
		Defender: 'D',
		Midfielder: 'M',
		Forward: 'F',
	}

	function shortPosition(pos: string | undefined): string {
		return pos ? (positionAbbr[pos] ?? pos) : ''
	}

	function shortContinent(c: string | undefined): string {
		if (!c) return ''
		return c.replace('North America', 'N. America').replace('South America', 'S. America')
	}

	onMounted(() => {
		wcStore.loadState()
		wcStatsStore.loadStats()
		if (!wcStore.gameOver) {
			trackWCGameStart(wcStatsStore.stats.gamesPlayed > 0)
		}
	})

	function openStats() {
		showStats.value = true
		trackWCStatsModal()
	}

	function handleWCKeyboardKey(key: string) {
		if (key === 'ENTER') {
			submitCurrent()
			return
		}
		if (key === 'BACKSPACE') {
			searchQuery.value = searchQuery.value.slice(0, -1)
		} else {
			searchQuery.value += key.toLowerCase()
		}
		if (searchQuery.value.length >= 2) {
			suggestions.value = getWCSuggestions(searchQuery.value)
			highlightedSuggestion.value = suggestions.value[0]?.name ?? ''
		} else {
			suggestions.value = []
			highlightedSuggestion.value = ''
		}
	}

	function trackGuessResult() {
		trackWCGuessSubmitted(wcStore.guesses.length)
		if (wcStore.gameOver) {
			if (wcStore.isWin) trackWCGameWin(wcStore.guesses.length)
			else trackWCGameLoss(wcStore.guesses.length)
		}
	}

	function selectSuggestion(name: string) {
		wcStore.submitGuess(name)
		trackGuessResult()
		searchQuery.value = ''
		suggestions.value = []
		highlightedSuggestion.value = ''
	}

	function submitCurrent() {
		if (suggestions.value.length) {
			const target = highlightedSuggestion.value || suggestions.value[0]?.name
			if (target) {
				selectSuggestion(target)
				return
			}
		}
		const q = searchQuery.value.trim().toLowerCase()
		if (!q) return
		wcStore.submitGuess(q)
		trackGuessResult()
		searchQuery.value = ''
		suggestions.value = []
		highlightedSuggestion.value = ''
	}

	function distBarWidth(n: number): string {
		const max = Math.max(1, ...Object.values(wcStatsStore.stats.guessDistribution).map(Number))
		const count = Number(wcStatsStore.stats.guessDistribution[String(n)] || 0)
		return `${Math.max(8, (count / max) * 100)}%`
	}

	function buildShareText(): string {
		const result = wcStore.isWin ? `${wcStore.guesses.length}/6` : 'X/6'
		const dots = wcStore.guesses
			.map((g) => (g.toLowerCase() === wcStore.answer.toLowerCase() ? '🟩' : '🟥'))
			.join('')
		return `Footballdle WC 2026 ⚽ #${wcStore.puzzleNumber}\n${result} ${dots}\n\nfootballdle.co.uk/worldcup`
	}

	async function handleShare() {
		const text = buildShareText()
		try {
			await navigator.clipboard.writeText(text)
		} catch {
			const ta = document.createElement('textarea')
			ta.value = text
			document.body.appendChild(ta)
			ta.select()
			document.execCommand('copy')
			document.body.removeChild(ta)
		}
		trackWCShare('copy')
		shareToast.value = true
		if (shareToastTimer) clearTimeout(shareToastTimer)
		shareToastTimer = setTimeout(() => {
			shareToast.value = false
		}, 2000)
	}

	function handleShareTwitter() {
		const text = buildShareText()
		trackWCShare('twitter')
		const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
		window.open(url, '_blank', 'noopener,noreferrer')
	}
</script>

<style scoped lang="scss">
	.wc-page {
		background: var(--bg-primary);
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		padding: 1rem;
	}

	// ============================================================================
	// HEADER
	// ============================================================================
	.wc-header {
		align-items: center;
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		margin: 0 auto 1rem;
		max-width: 500px;
		width: 100%;

		.back-link {
			align-items: center;
			color: var(--text-secondary);
			display: flex;
			flex: 1;
			flex-shrink: 0;
			font-size: 0.85rem;
			gap: 0.25rem;
			text-decoration: none;
			transition: color 0.2s;

			&:hover {
				color: var(--text-primary);
			}
		}

		.wc-title {
			align-items: center;
			display: flex;
			flex: 2;
			gap: 0.5rem;
			justify-content: center;

			.wc-badge {
				background: var(--color-gradient);
				border-radius: 2rem;
				color: #fff;
				font-size: 0.75rem;
				font-weight: 700;
				padding: 0.2rem 0.75rem;
			}

			.wc-puzzle {
				color: var(--text-secondary);
				font-size: 0.8rem;
			}
		}

		.stats-btn {
			align-items: center;
			background: transparent;
			border: none;
			color: var(--text-secondary);
			cursor: pointer;
			display: flex;
			flex: 1;
			flex-shrink: 0;
			justify-content: flex-end;
			padding: 0.25rem;
			transition: color 0.2s;

			&:hover {
				color: var(--text-primary);
			}
		}
	}

	// ============================================================================
	// TOAST
	// ============================================================================
	.error-toast {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		color: var(--text-primary);
		font-size: 0.85rem;
		font-weight: 600;
		left: 50%;
		padding: 0.5rem 1rem;
		position: fixed;
		top: 1rem;
		transform: translateX(-50%);
		z-index: 1000;
	}

	.toast-enter-active,
	.toast-leave-active {
		transition: all 0.25s ease;
	}

	.toast-enter-from,
	.toast-leave-to {
		opacity: 0;
		transform: translate(-50%, -8px);
	}

	// ============================================================================
	// MAIN
	// ============================================================================
	.wc-main {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 1rem;
		margin: 0 auto;
		max-width: 500px;
		width: 100%;

		.page-subtitle {
			color: var(--text-secondary);
			font-size: 0.9rem;
			margin: 0;
		}
	}

	// ============================================================================
	// GUESS LIST
	// ============================================================================
	.guess-list {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;

		.guess-chip {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-left: 3px solid var(--color-absent);
			border-radius: var(--global-border-radius);
			display: flex;
			gap: 0.5rem;
			justify-content: space-between;
			padding: 0.5rem 0.75rem;
			transition: opacity 0.2s;
			width: 100%;

			&.past {
				opacity: 0.55;
				transform: scale(0.97);
				transform-origin: left center;
			}

			.guess-name {
				color: var(--text-primary);
				flex-shrink: 0;
				font-size: 0.9rem;
				font-weight: 700;
				letter-spacing: 0.06em;
				min-width: 6rem;
			}

			.guess-attrs {
				align-items: center;
				display: flex;
				flex-wrap: nowrap;
				gap: 0.35rem;
				justify-content: flex-end;
				overflow: hidden;

				.attr {
					align-items: center;
					border-radius: 2rem;
					display: inline-flex;
					flex-shrink: 0;
					font-size: 0.7rem;
					font-weight: 600;
					gap: 0.25rem;
					padding: 0.2rem 0.55rem;
					white-space: nowrap;

					&.match {
						background: color-mix(in srgb, var(--color-success) 15%, transparent);
						border: 1px solid color-mix(in srgb, var(--color-success) 40%, transparent);
						color: var(--color-success);
					}

					&.miss {
						background: var(--bg-primary);
						border: 1px solid var(--border);
						color: var(--text-secondary);
					}
				}
			}
		}

		.guess-count {
			color: var(--text-secondary);
			font-size: 0.72rem;
			margin: 0.1rem 0 0;
			text-align: right;
		}
	}

	.guess-enter-active {
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.guess-enter-from {
		opacity: 0;
		transform: translateX(-12px);
	}

	// ============================================================================
	// KEYBOARD INPUT AREA
	// ============================================================================
	.wc-keyboard-area {
		background: var(--bg-primary);
		bottom: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-top: auto;
		padding-bottom: 0.5rem;
		position: sticky;
	}

	.suggestions {
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-bottom: none;
		border-radius: var(--global-border-radius) var(--global-border-radius) 0 0;
		max-height: 200px;
		overflow-y: auto;

		.suggestion-item {
			align-items: center;
			background: transparent;
			border: none;
			border-bottom: 1px solid var(--border);
			color: var(--text-primary);
			cursor: pointer;
			display: flex;
			gap: 0.75rem;
			justify-content: space-between;
			padding: 0.55rem 1rem;
			text-align: left;
			transition: background 0.15s;
			width: 100%;

			&:last-child {
				border-bottom: none;
			}

			&:hover,
			&.highlighted {
				background: var(--bg-secondary);
			}

			.suggestion-left {
				display: flex;
				flex-direction: column;
				gap: 0.1rem;
				min-width: 0;
			}

			.suggestion-name {
				font-size: 0.9rem;
				font-weight: 700;
				letter-spacing: 0.04em;
			}

			.suggestion-full {
				color: var(--text-secondary);
				font-size: 0.7rem;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.suggestion-meta {
				color: var(--text-secondary);
				flex-shrink: 0;
				font-size: 0.75rem;
				white-space: nowrap;
			}
		}
	}

	.wc-query-display {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		display: flex;
		gap: 0.5rem;
		justify-content: space-between;
		min-height: 2.75rem;
		padding: 0.5rem 0.75rem;

		.query-text {
			color: var(--text-primary);
			flex: 1;
			font-size: 1rem;
			font-weight: 700;
			letter-spacing: 0.08em;
		}

		.query-placeholder {
			color: var(--text-secondary);
			flex: 1;
			font-size: 0.9rem;
		}

		.submit-btn {
			background: var(--color-gradient);
			border: none;
			border-radius: calc(var(--global-border-radius) - 2px);
			color: #fff;
			cursor: pointer;
			flex-shrink: 0;
			font-size: 0.85rem;
			font-weight: 700;
			padding: 0.35rem 0.85rem;
			white-space: nowrap;
		}
	}

	// attach query display to bottom of suggestions list when open
	.wc-keyboard-area:has(.suggestions) .wc-query-display {
		border-radius: 0 0 var(--global-border-radius) var(--global-border-radius);
	}

	// ============================================================================
	// GAME OVER
	// ============================================================================
	.game-over-inline {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;

		.result-badge {
			align-items: center;
			border-radius: 2rem;
			color: #fff;
			display: inline-flex;
			font-size: 1rem;
			font-weight: 700;
			gap: 0.5rem;
			padding: 0.4rem 1rem;

			&.win {
				background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
			}

			&.loss {
				background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
			}
		}

		.answer-reveal {
			color: var(--text-primary);
			font-size: 0.95rem;
			margin: 0;

			strong {
				color: var(--primary-color);
				font-size: 1.1rem;
				letter-spacing: 0.08em;
			}

			.answer-meta {
				color: var(--text-secondary);
				font-size: 0.85rem;
			}
		}

		.answer-detail {
			color: var(--text-secondary);
			font-size: 0.8rem;
			margin: 0;
		}

		.share-card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--global-border-radius);
			padding: 0.75rem 1rem;

			.share-header {
				color: var(--text-secondary);
				font-size: 0.75rem;
				font-weight: 600;
				letter-spacing: 0.02em;
				margin-bottom: 0.5rem;
			}

			.share-dots {
				display: flex;
				gap: 4px;

				.dot {
					border-radius: 50%;
					height: 14px;
					width: 14px;

					&.correct {
						background: var(--color-success);
					}

					&.wrong {
						background: var(--color-absent);
					}
				}
			}
		}

		.share-buttons {
			display: flex;
			gap: 0.75rem;

			.button {
				align-items: center;
				display: flex;
				flex: 1;
				gap: 0.4rem;
				justify-content: center;
			}

			.btn-x {
				align-items: center;
				background: #000;
				border: 2px solid #000;
				border-radius: var(--border-radius);
				color: #fff;
				cursor: pointer;
				display: flex;
				flex: 1;
				font-size: 0.9rem;
				font-weight: 500;
				gap: 0.4rem;
				justify-content: center;
				padding: 0.5rem 1rem;
				transition: background 0.2s;

				&:hover {
					background: #222;
					border-color: #222;
				}
			}
		}

		.back-home {
			align-items: center;
			color: var(--text-secondary);
			display: inline-flex;
			font-size: 0.85rem;
			gap: 0.3rem;
			text-decoration: none;
			transition: color 0.2s;

			&:hover {
				color: var(--text-primary);
			}
		}
	}

	// ============================================================================
	// STATS MODAL
	// ============================================================================
	.wc-stats-overlay {
		align-items: flex-end;
		background: rgb(0 0 0 / 75%);
		display: flex;
		inset: 0;
		justify-content: center;
		position: fixed;
		z-index: 500;

		@media (width >= 480px) {
			align-items: center;
		}
	}

	.wc-stats-modal {
		background: linear-gradient(160deg, #0a1628 0%, #0d2137 55%, #091c13 100%);
		border: 1px solid rgb(255 255 255 / 8%);
		border-radius: 1.25rem 1.25rem 0 0;
		max-width: 480px;
		overflow: hidden;
		padding: 1.5rem 1.25rem 2rem;
		position: relative;
		width: 100%;

		@media (width >= 480px) {
			border-radius: 1.25rem;
		}

		&::before {
			background: radial-gradient(ellipse 70% 45% at 50% 0%, rgb(16 185 129 / 14%) 0%, transparent 70%);
			content: '';
			inset: 0;
			pointer-events: none;
			position: absolute;
		}
	}

	.stats-modal-header {
		align-items: center;
		display: flex;
		justify-content: space-between;
		margin-bottom: 1.75rem;
		position: relative;

		.stats-modal-title {
			align-items: center;
			color: #fff;
			display: flex;
			font-size: 0.8rem;
			font-weight: 700;
			gap: 0.4rem;
			letter-spacing: 0.1em;
			text-transform: uppercase;

			.stats-title-icon {
				color: #fbbf24;
			}
		}

		.stats-close-btn {
			align-items: center;
			background: rgb(255 255 255 / 8%);
			border: none;
			border-radius: 50%;
			color: rgb(255 255 255 / 55%);
			cursor: pointer;
			display: flex;
			height: 2rem;
			justify-content: center;
			transition:
				background 0.2s,
				color 0.2s;
			width: 2rem;

			&:hover {
				background: rgb(255 255 255 / 15%);
				color: #fff;
			}
		}
	}

	.stats-spotlight {
		display: flex;
		justify-content: center;
		margin-bottom: 1.75rem;
		position: relative;

		.stats-win-rate {
			align-items: flex-end;
			display: flex;
			gap: 0.3rem;

			.win-rate-number {
				color: #10b981;
				font-size: 5rem;
				font-weight: 800;
				letter-spacing: -0.04em;
				line-height: 0.9;
			}

			.win-rate-label {
				display: flex;
				flex-direction: column;
				padding-bottom: 0.5rem;

				.win-rate-pct {
					color: rgb(255 255 255 / 50%);
					font-size: 1.1rem;
					font-weight: 700;
					line-height: 1;
				}

				.win-rate-text {
					color: rgb(255 255 255 / 40%);
					font-size: 0.6rem;
					font-weight: 700;
					letter-spacing: 0.08em;
					text-transform: uppercase;
				}
			}
		}
	}

	.stats-row {
		border-bottom: 1px solid rgb(255 255 255 / 7%);
		border-top: 1px solid rgb(255 255 255 / 7%);
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		margin-bottom: 1.75rem;
		padding: 1rem 0;
		position: relative;

		.stat-cell {
			align-items: center;
			border-right: 1px solid rgb(255 255 255 / 7%);
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
			padding: 0.25rem 0;

			&:last-child {
				border-right: none;
			}

			.stat-number {
				color: #fff;
				font-size: 1.75rem;
				font-weight: 800;
				letter-spacing: -0.03em;
				line-height: 1;
			}

			.stat-label {
				color: rgb(255 255 255 / 40%);
				font-size: 0.62rem;
				font-weight: 700;
				letter-spacing: 0.07em;
				text-transform: uppercase;
			}
		}
	}

	.stats-distribution {
		position: relative;

		.distribution-title {
			color: rgb(255 255 255 / 40%);
			font-size: 0.62rem;
			font-weight: 700;
			letter-spacing: 0.1em;
			margin: 0 0 0.75rem;
			text-transform: uppercase;
		}

		.dist-row {
			align-items: center;
			display: flex;
			gap: 0.6rem;
			margin-bottom: 0.45rem;

			.dist-label {
				color: rgb(255 255 255 / 45%);
				flex-shrink: 0;
				font-size: 0.75rem;
				font-weight: 700;
				width: 0.75rem;
			}

			.dist-bar-wrap {
				flex: 1;

				.dist-bar {
					align-items: center;
					background: linear-gradient(90deg, #065f46 0%, #10b981 100%);
					border-radius: 3px;
					display: flex;
					justify-content: flex-end;
					min-width: 2rem;
					padding: 0.2rem 0.45rem;
					transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);

					.dist-count {
						color: rgb(255 255 255 / 85%);
						font-size: 0.65rem;
						font-weight: 700;
					}
				}
			}
		}
	}

	.modal-enter-active {
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.modal-leave-active {
		transition: all 0.2s ease;
	}

	.modal-enter-from,
	.modal-leave-to {
		opacity: 0;
		transform: translateY(20px);
	}
</style>
