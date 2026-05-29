<template>
	<footer class="site-footer">
		<button
			class="footer-toggle"
			@click="open = !open"
			:aria-expanded="open"
		>
			<Icon
				:name="open ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-up-linear'"
				size="0.75rem"
			/>
			Legal
		</button>
		<Transition name="footer-expand">
			<div
				v-if="open"
				class="footer-links"
			>
				<span class="footer-copy">© {{ year }} Footballdle</span>
				<span class="footer-sep">·</span>
				<NuxtLink to="/privacy-policy">Privacy Policy</NuxtLink>
				<span class="footer-sep">·</span>
				<NuxtLink to="/about">About</NuxtLink>
			</div>
		</Transition>
	</footer>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	const open = ref(false)
	const year = new Date().getFullYear()
</script>

<style scoped lang="scss">
	.site-footer {
		bottom: 0;
		left: 0;
		position: fixed;
		right: 0;
		z-index: 50;
	}

	.footer-toggle {
		align-items: center;
		background: var(--bg-secondary);
		border: none;
		border-top: 1px solid var(--border);
		color: var(--text-secondary);
		cursor: pointer;
		display: flex;
		font-size: 0.7rem;
		gap: 0.3rem;
		justify-content: center;
		padding: 0.3rem 1rem;
		width: 100%;

		&:hover {
			color: var(--text-primary);
		}
	}

	.footer-links {
		align-items: center;
		background: var(--bg-secondary);
		border-top: 1px solid var(--border);
		display: flex;
		flex-wrap: wrap;
		font-size: 0.75rem;
		gap: 0.5rem;
		justify-content: center;
		padding: 0.5rem 1rem;

		a {
			color: var(--text-secondary);
			text-decoration: none;
			transition: color 0.2s;

			&:hover {
				color: var(--primary-color);
			}
		}

		.footer-copy {
			color: var(--text-secondary);
		}

		.footer-sep {
			color: var(--border);
		}
	}

	.footer-expand-enter-active,
	.footer-expand-leave-active {
		max-height: 60px;
		overflow: hidden;
		transition: max-height 0.2s ease;
	}

	.footer-expand-enter-from,
	.footer-expand-leave-to {
		max-height: 0;
	}
</style>
