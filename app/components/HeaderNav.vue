<template>
	<section
		:class="componentName"
		class="sw-small"
	>
		<div class="left-section">
			<Icon
				v-if="showBackButton"
				name="solar:home-smile-linear"
				size="1.5rem"
				@click="$emit('back-to-menu')"
				class="back-to-menu"
			/>
		</div>

		<div class="button-container">
			<a
				href="https://buymeacoffee.com/dhorne92E"
				target="_blank"
				rel="noopener noreferrer"
				class="coffee-link"
				@click="$emit('buy-coffee', 'header')"
				aria-label="Buy me a coffee"
			>
				<Icon
					name="uil:coffee"
					size="1.5em"
				/>
			</a>

			<Icon
				name="uil:info-circle"
				@click="$emit('show-info')"
				size="1.5em"
			/>

			<Icon
				name="uil:setting"
				@click="$emit('show-settings')"
				size="1.5em"
			/>

			<Icon
				name="uil:statistics"
				@click="$emit('show-stats')"
				size="1.5em"
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			componentName?: string
			showBackButton?: boolean
		}>(),
		{
			componentName: 'header-nav',
			showBackButton: false,
		},
	)
</script>

<style scoped lang="scss">
	.header-nav {
		align-items: center;
		display: flex;
		justify-content: space-between;
		padding: 0;
		width: 100%;

		.left-section {
			align-items: center;
			display: flex;
		}

		.button-container {
			align-items: center;
			display: flex;
			gap: 0.5rem;

			span {
				cursor: pointer;
			}

			.coffee-link {
				align-items: center;
				border-bottom: none;
				color: var(--text-primary);
				display: flex;
				text-decoration: none;
				transition: all 0.2s;

				&:hover {
					border-bottom: none;
					color: var(--primary-color);
					transform: scale(1.1);
				}
			}
		}

		.back-to-menu {
			color: var(--text-primary);
			cursor: pointer;
			transition: all 0.2s;

			&:hover {
				transform: scale(1.1);
			}
		}
	}
</style>
