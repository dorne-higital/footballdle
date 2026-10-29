<template>
	<!-- Website on a computer: the side menu that replaces the tab bar (shown from 1024px
	     wide by assets/_app-web-desktop.scss; hidden everywhere else) -->
	<aside class="desktop-rail">
		<NuxtLink
			to="/"
			class="rail-brand"
			aria-label="Footballdle, Matchday"
		>
			<span
				class="rail-mark"
				aria-hidden="true"
				>F</span
			>
			<span class="rail-name">Footballdle</span>
		</NuxtLink>

		<div class="rail-pills">
			<HintPill />
			<MatchdayStreakPill />
		</div>

		<nav
			class="rail-nav"
			aria-label="Main"
		>
			<NuxtLink
				v-for="tab in APP_TABS"
				:key="tab.to"
				:to="tab.to"
				:class="['rail-link', { active: active === tab.to }]"
				:aria-current="active === tab.to ? 'page' : undefined"
			>
				<Icon
					:name="active === tab.to ? tab.iconActive : tab.icon"
					size="1.3rem"
				/>
				{{ tab.label }}
			</NuxtLink>
		</nav>

		<div class="rail-app">
			<p class="rail-app-title">
				<Icon
					name="solar:smartphone-linear"
					size="1.1rem"
				/>
				Footballdle on iPhone
			</p>
			<p class="rail-app-text">Hint packs, Pro and iCloud backup.</p>
			<a
				v-if="APP_STORE_LIVE"
				:href="APP_STORE_URL"
				target="_blank"
				rel="noopener noreferrer"
				class="rail-app-link"
			>
				Get the app
			</a>
			<p
				v-else
				class="rail-app-soon"
			>
				Coming soon to the App Store
			</p>
		</div>
	</aside>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import HintPill from './HintPill.vue'
	import MatchdayStreakPill from '../shared/MatchdayStreakPill.vue'
	import { APP_TABS, tabFor } from '../../utils/appTabs'
	import { APP_STORE_LIVE, APP_STORE_URL } from '../../utils/appStore'

	const route = useRoute()
	// Games and other screens above the tabs belong to Play
	const active = computed(() => tabFor(route.path) ?? '/')
</script>

<style scoped lang="scss">
	.desktop-rail {
		display: none;
	}

	// The site-wide link hover line (assets/_typography.scss) doesn't belong on the logo or the menu
	.desktop-rail a:hover {
		border-bottom-color: transparent;
	}

	.rail-brand {
		align-items: center;
		color: var(--text-primary);
		display: flex;
		gap: 0.75rem;
		padding: 0 0.4rem;
		text-decoration: none;
	}

	.rail-mark {
		align-items: center;
		background: radial-gradient(circle at 50% 0%, #1a5638, #07130d 75%);
		border-radius: 0.65rem;
		box-shadow: 0 0 0 1px rgb(47 224 138 / 30%);
		color: #f2fbf5;
		display: flex;
		font-family: var(--font-display);
		font-size: 1.4rem;
		height: 2.5rem;
		justify-content: center;
		width: 2.5rem;
	}

	.rail-name {
		font-family: var(--font-display);
		font-size: 1.25rem;
	}

	.rail-pills {
		align-items: center;
		display: flex;
		gap: 0.5rem;
		padding: 0 0.4rem;
	}



	.rail-nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.rail-link {
		align-items: center;
		border-radius: 0.75rem;
		color: var(--text-secondary);
		display: flex;
		font-size: 0.95rem;
		font-weight: 700;
		gap: 0.75rem;
		height: 2.9rem;
		padding: 0 0.9rem;
		text-decoration: none;
		transition:
			background 0.15s,
			color 0.15s;

		&:hover {
			background: color-mix(in srgb, var(--fl-raised) 60%, transparent);
			color: var(--text-primary);
		}

		&.active {
			background: var(--fl-raised);
			color: var(--text-primary);

			:deep(svg) {
				color: var(--primary-color);
			}
		}
	}

	.rail-app {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-top: auto;
		padding: 1rem;

		p {
			margin: 0;
		}
	}

	.rail-app-title {
		align-items: center;
		color: var(--text-primary);
		display: flex;
		font-size: 0.9rem;
		font-weight: 800;
		gap: 0.5rem;

		:deep(svg) {
			color: var(--primary-color);
		}
	}

	.rail-app-text {
		color: var(--text-secondary);
		font-size: 0.82rem;
		line-height: 1.45;
	}

	.rail-app-soon,
	.rail-app-link {
		color: var(--primary-color);
		font-size: 0.82rem;
		font-weight: 800;
	}
</style>
