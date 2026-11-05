<template>
	<section
		class="seo-intro"
		:aria-label="heading"
	>
		<component
			:is="level"
			class="seo-title"
			>{{ heading }}</component
		>
		<div class="seo-body">
			<slot />
		</div>
		<nav
			v-if="links.length"
			class="seo-links"
			aria-label="More from Footballdle"
		>
			<NuxtLink
				v-for="l in links"
				:key="l.to"
				:to="l.to"
				:title="l.label"
				>{{ l.label }}</NuxtLink
			>
		</nav>
	</section>
</template>

<script setup lang="ts">
	// Website only (search, plan H2-H4): a few plain lines under a game or the Matchday saying
	// what the page is, for people arriving from Google and for Google itself. Server-rendered;
	// never shown in the iPhone app.
	withDefaults(
		defineProps<{
			heading: string
			level?: 'h1' | 'h2'
			links?: { to: string; label: string }[]
		}>(),
		{ level: 'h2', links: () => [] },
	)
</script>

<style scoped lang="scss">
	.seo-intro {
		border-top: 1px solid var(--border);
		color: var(--text-secondary);
		display: grid;
		font-size: 0.88rem;
		gap: 0.5rem;
		line-height: 1.6;
		margin: 1.5rem auto 0;
		max-width: 40rem;
		padding: 1.25rem 0 0.5rem;
		width: 100%;
	}

	.seo-title {
		color: var(--text-primary);
		font-size: 1rem;
		font-weight: 800;
		line-height: 1.3;
		margin: 0;
	}

	.seo-body {
		display: grid;
		gap: 0.5rem;

		:deep(p) {
			margin: 0;
		}
	}

	.seo-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 1rem;

		a {
			color: var(--primary-color);
			font-weight: 700;
			text-decoration: none;

			&:hover {
				text-decoration: underline;
			}
		}
	}
</style>
