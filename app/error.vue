<template>
	<div class="error-page">
		<nav class="error-nav">
			<NuxtLink
				to="/"
				class="back-link"
				@click="clearError({ redirect: '/' })"
			>
				<Icon
					name="solar:alt-arrow-left-linear"
					size="1rem"
				/>
				Play Footballdle
			</NuxtLink>
		</nav>

		<main class="error-main">
			<div class="error-code">{{ error.statusCode }}</div>

			<h1 class="error-title">
				{{ error.statusCode === 404 ? 'Oops, you look to be offside' : 'Something went wrong' }}
			</h1>

			<p class="error-message">
				{{ error.statusCode === 404 ? "VAR can't help you now" : 'An unexpected error occurred.' }}
			</p>

			<NuxtLink
				to="/"
				class="button primary"
				@click="clearError({ redirect: '/' })"
			>
				Back to Footballdle

				<Icon
					name="solar:alt-arrow-right-linear"
					size="1rem"
				/>
			</NuxtLink>
		</main>

		<footer class="error-footer">
			<p>Daily Premier League footballer guessing game.</p>
			<NuxtLink
				to="/"
				@click="clearError({ redirect: '/' })"
				>footballdle.co.uk</NuxtLink
			>
		</footer>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		error: {
			statusCode: number
			statusMessage?: string
			message?: string
		}
	}>()
</script>

<style lang="scss">
	@use '../assets/main';
</style>

<style scoped lang="scss">
	.error-page {
		background: var(--bg-gradient);
		min-height: 100dvh;
		padding: 0 1rem 3rem;
	}

	.error-nav {
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

	.error-main {
		margin: 0 auto;
		max-width: 480px;
		padding-top: 4rem;
		text-align: center;

		.error-code {
			color: var(--primary-color);
			font-size: 6rem;
			font-weight: 900;
			letter-spacing: -0.05em;
			line-height: 1;
			margin-bottom: 3rem;
			opacity: 0.15;
		}

		.error-title {
			color: var(--text-primary);
			font-size: 1.75rem;
			font-weight: 700;
			margin-bottom: 0.75rem;
			margin-top: -3rem;
		}

		.error-message {
			color: var(--text-secondary);
			font-size: 1rem;
			margin-bottom: 2rem;
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

	.error-footer {
		border-top: 1px solid var(--border);
		color: var(--text-secondary);
		font-size: 0.8rem;
		margin: 4rem auto 0;
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
