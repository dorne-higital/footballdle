<template>
	<div class="scout-autocomplete">
		<div class="input-row">
			<input
				ref="inputEl"
				v-model="query"
				type="text"
				class="input"
				placeholder="Guess a Premier League player…"
				autocomplete="off"
				:disabled="disabled"
				@keydown.down.prevent="moveHighlight(1)"
				@keydown.up.prevent="moveHighlight(-1)"
				@keydown.enter.prevent="submitHighlighted"
				@keydown.esc="query = ''"
			/>
			<button
				type="button"
				class="submit-btn"
				:disabled="disabled || !query.trim()"
				@click="submitHighlighted"
			>
				Guess
			</button>
		</div>

		<ul
			v-if="suggestions.length"
			class="suggestions"
		>
			<li
				v-for="(player, i) in suggestions"
				:key="player.name"
				:class="{ active: i === highlightedIndex }"
				@mouseenter="highlightedIndex = i"
				@mousedown.prevent="select(player.name)"
			>
				<span class="s-name">{{ player.name }}</span>
				<span class="s-meta">{{ player.club }}</span>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, watch } from 'vue'
	import { useScoutReportStore } from '../../stores/scoutReport'

	withDefaults(
		defineProps<{
			disabled?: boolean
		}>(),
		{ disabled: false },
	)

	const emit = defineEmits<{ guess: [name: string] }>()

	const store = useScoutReportStore()
	const query = ref('')
	const highlightedIndex = ref(0)
	const inputEl = ref<HTMLInputElement | null>(null)

	const suggestions = computed(() => store.searchPlayers(query.value))

	watch(suggestions, () => {
		highlightedIndex.value = 0
	})

	function moveHighlight(delta: number) {
		if (!suggestions.value.length) return
		const len = suggestions.value.length
		highlightedIndex.value = (highlightedIndex.value + delta + len) % len
	}

	function submitHighlighted() {
		const target = suggestions.value[highlightedIndex.value]?.name ?? query.value
		select(target)
	}

	function select(name: string) {
		if (!name.trim()) return
		emit('guess', name)
		query.value = ''
		highlightedIndex.value = 0
		inputEl.value?.focus()
	}
</script>

<style scoped lang="scss">
	.scout-autocomplete {
		position: relative;
		width: 100%;
	}

	.input-row {
		display: flex;
		gap: 0.5rem;
	}

	.input {
		background: var(--bg-secondary);
		border: 2px solid var(--border);
		border-radius: var(--global-border-radius);
		color: var(--text-primary);
		flex: 1;
		font-family: var(--font-body);
		font-size: 0.95rem;
		min-width: 0;
		padding: 0.7rem 0.9rem;
		transition: border-color 0.2s;

		&:focus {
			border-color: var(--primary-color);
			outline: none;
		}

		&:disabled {
			cursor: not-allowed;
			opacity: 0.6;
		}

		&::placeholder {
			color: var(--text-secondary);
		}
	}

	.submit-btn {
		background: var(--primary-color);
		border: 1px solid var(--primary-color);
		border-radius: var(--global-border-radius);
		color: #fff;
		flex-shrink: 0;
		font-family: var(--font-display);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		padding: 0 1.1rem;
		text-transform: uppercase;
		transition: all 0.2s;

		&:hover:not(:disabled) {
			background: color-mix(in srgb, var(--primary-color) 88%, black);
		}

		&:disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
	}

	.suggestions {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		box-shadow: 0 10px 28px -16px rgb(20 30 20 / 22%);
		left: 0;
		list-style: none;
		margin: 0.4rem 0 0;
		max-height: 220px;
		overflow-y: auto;
		padding: 0.35rem;
		position: absolute;
		right: 0;
		top: 100%;
		z-index: 5;

		li {
			align-items: center;
			border-radius: calc(var(--global-border-radius) - 4px);
			cursor: pointer;
			display: flex;
			gap: 0.5rem;
			justify-content: space-between;
			padding: 0.5rem 0.6rem;

			&.active,
			&:hover {
				background: color-mix(in srgb, var(--primary-color) 12%, transparent);
			}

			.s-name {
				color: var(--text-primary);
				font-weight: 600;
				text-transform: capitalize;
			}

			.s-meta {
				color: var(--text-secondary);
				font-size: 0.78rem;
			}
		}
	}
</style>
