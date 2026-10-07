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
			<h1>Send feedback</h1>

			<div
				v-if="sent"
				class="sent"
				role="status"
			>
				<Icon
					name="solar:check-circle-bold"
					size="2.5rem"
				/>
				<h2>Thanks, that's on its way</h2>
				<p>Every message gets read. Missing players are usually added within a few days.</p>
				<button
					type="button"
					class="secondary-btn"
					@click="reset"
				>
					Send another
				</button>
			</div>

			<form
				v-else
				class="feedback-form"
				@submit.prevent="send"
			>
				<p>Missing a player, spotted a bug or got an idea? Let us know.</p>

				<fieldset class="categories">
					<legend>What's it about?</legend>
					<button
						v-for="c in CATEGORIES"
						:key="c.value"
						type="button"
						:class="['chip', { active: category === c.value }]"
						:aria-pressed="category === c.value"
						@click="category = c.value"
					>
						<Icon
							:name="c.icon"
							size="1rem"
						/>
						{{ c.label }}
					</button>
				</fieldset>

				<label
					v-if="category === 'missing-player'"
					class="field"
				>
					<span>Player name and club</span>
					<input
						v-model.trim="player"
						type="text"
						autocomplete="off"
						placeholder="e.g. Bukayo Saka, Arsenal"
						maxlength="120"
						required
					/>
				</label>

				<label class="field">
					<span>{{ category === 'missing-player' ? 'Anything else? (optional)' : 'Your message' }}</span>
					<textarea
						v-model.trim="message"
						rows="5"
						maxlength="3000"
						:required="category !== 'missing-player'"
						:placeholder="PLACEHOLDERS[category]"
					></textarea>
				</label>

				<label class="field">
					<span>Your email (optional, if you'd like a reply)</span>
					<input
						v-model.trim="email"
						type="email"
						autocomplete="email"
						inputmode="email"
						maxlength="200"
					/>
				</label>

				<!-- Honeypot for bots; people never see it -->
				<input
					v-model="botcheck"
					type="checkbox"
					class="botcheck"
					tabindex="-1"
					autocomplete="off"
					aria-hidden="true"
				/>

				<p
					v-if="error"
					class="error"
					role="alert"
				>
					{{ error }}
				</p>

				<button
					type="submit"
					class="send-btn"
					:disabled="sending"
				>
					{{ sending ? 'Sending…' : 'Send feedback' }}
				</button>
			</form>
		</main>

		<SiteFooter />
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue'

	// Web3Forms delivers the message to the owner's inbox. The access key is meant to
	// sit in client code: it only lets people send to that inbox and never reveals it.
	const WEB3FORMS_KEY = '4c9946f4-fca1-46f7-82fd-38cedb614d74'

	type Category = 'missing-player' | 'suggestion' | 'improvement' | 'issue' | 'other'
	const CATEGORIES: { value: Category; label: string; icon: string }[] = [
		{ value: 'missing-player', label: 'Missing player', icon: 'solar:user-plus-linear' },
		{ value: 'suggestion', label: 'App suggestion', icon: 'solar:lightbulb-linear' },
		{ value: 'improvement', label: 'Improvement', icon: 'solar:magic-stick-3-linear' },
		{ value: 'issue', label: 'Issue', icon: 'solar:bug-linear' },
		{ value: 'other', label: 'Something else', icon: 'solar:chat-round-dots-linear' },
	]
	const PLACEHOLDERS: Record<Category, string> = {
		'missing-player': 'e.g. he signed last week',
		suggestion: 'What would make Footballdle better?',
		improvement: 'What could work better?',
		issue: 'What happened, and on which screen?',
		other: 'Go on…',
	}

	const config = useRuntimeConfig()
	const route = useRoute()
	const initial = CATEGORIES.find(c => c.value === route.query.topic)?.value ?? 'missing-player'

	const category = ref<Category>(initial)
	const player = ref('')
	const message = ref('')
	const email = ref('')
	const botcheck = ref(false)
	const sending = ref(false)
	const sent = ref(false)
	const error = ref('')

	async function send() {
		if (sending.value) return
		error.value = ''
		sending.value = true
		const label = CATEGORIES.find(c => c.value === category.value)?.label ?? 'Feedback'
		try {
			const res = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({
					access_key: WEB3FORMS_KEY,
					subject: `Footballdle feedback: ${label}${player.value ? ` (${player.value})` : ''}`,
					from_name: 'Footballdle feedback',
					botcheck: botcheck.value,
					category: label,
					...(player.value && { player: player.value }),
					message: message.value || '(no message)',
					...(email.value && { email: email.value, replyto: email.value }),
					platform: config.public.isApp ? 'iOS app' : 'Website',
					device: navigator.userAgent,
				}),
			})
			const data = await res.json().catch(() => ({}))
			if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`)
			sent.value = true
		} catch {
			error.value = navigator.onLine
				? "Couldn't send that just now. Please try again in a minute."
				: "You're offline. Connect to the internet and try again."
		} finally {
			sending.value = false
		}
	}

	function reset() {
		player.value = ''
		message.value = ''
		sent.value = false
	}

	useHead({
		title: 'Send Feedback | Footballdle',
		link: [{ rel: 'canonical', href: 'https://footballdle.co.uk/feedback' }],
		meta: [
			{
				name: 'description',
				content: 'Report a missing player, a bug or an idea for Footballdle, the daily Premier League footballer guessing game.',
			},
		],
	})
</script>

<style scoped lang="scss">
	@use '../../assets/static-page';

	.feedback-form {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;

		p {
			margin-bottom: 0;
		}
	}

	.categories {
		border: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0;
		padding: 0;

		legend {
			color: var(--text-primary);
			font-size: 0.9rem;
			font-weight: 700;
			margin-bottom: 0.5rem;
			padding: 0;
		}
	}

	.chip {
		align-items: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-primary);
		cursor: pointer;
		display: inline-flex;
		font: inherit;
		font-size: 0.9rem;
		font-weight: 600;
		gap: 0.35rem;
		min-height: 40px;
		padding: 0 0.9rem;

		&.active {
			background: color-mix(in srgb, var(--primary-color) 18%, var(--bg-secondary));
			border-color: var(--primary-color);
			color: var(--primary-color);
		}
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;

		span {
			color: var(--text-primary);
			font-size: 0.9rem;
			font-weight: 700;
		}

		input,
		textarea {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 0.8rem;
			box-sizing: border-box;
			color: var(--text-primary);
			font: inherit;
			// 16px stops iOS zooming into the field
			font-size: 16px;
			padding: 0.75rem 0.9rem;
			resize: vertical;
			width: 100%;

			&:focus {
				border-color: var(--primary-color);
				outline: none;
			}
		}
	}

	.botcheck {
		height: 0;
		opacity: 0;
		pointer-events: none;
		position: absolute;
		width: 0;
	}

	.error {
		color: var(--error-color, #ff6b6b);
		font-weight: 600;
	}

	.send-btn {
		background: var(--primary-color);
		border: 0;
		border-radius: 0.9rem;
		color: #06140d;
		cursor: pointer;
		font: inherit;
		font-weight: 800;
		min-height: 50px;

		&:disabled {
			opacity: 0.6;
		}
	}

	.sent {
		align-items: center;
		color: var(--primary-color);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 2rem 0;
		text-align: center;

		h2 {
			margin-top: 0.5rem;
		}
	}

	.secondary-btn {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		color: var(--text-primary);
		cursor: pointer;
		font: inherit;
		font-weight: 700;
		min-height: 44px;
		padding: 0 1.25rem;
	}
</style>
