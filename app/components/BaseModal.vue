<template>
	<div
		:class="componentName"
		@click.self="$emit('close')"
	>
		<div
			class="modal"
			:class="[`${variant}`, theme, style]"
			role="dialog"
			aria-modal="true"
		>
			<div class="header flex-between">
				<h3>{{ heading }}</h3>

				<Icon
					name="uil:times-circle"
					@click="$emit('close')"
					size="1.5rem"
				/>
			</div>

			<template v-if="slots.body">
				<div
					class="body flex-center"
					:class="align"
				>
					<slot name="body" />
				</div>
			</template>

			<template v-if="slots.footer">
				<div class="footer flex-center">
					<slot name="footer" />
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useSlots } from 'vue'

	const slots = useSlots()

	const props = withDefaults(
		defineProps<{
			componentName?: string
			show?: boolean
			heading?: string
			theme?: string // e.g. 'dark', 'light', or custom
			style?: string // custom class
			align?: 'left' | 'center' | 'right'
			variant?: 'small' | 'medium' | 'large' | 'fullscreen'
			image?: string
		}>(),
		{
			componentName: 'base-modal',
			variant: 'medium',
			theme: '',
			style: '',
			align: 'center',
			show: true,
		},
	)
</script>

<style scoped lang="scss">
	.base-modal {
		align-items: center;
		background: rgb(0 0 0 / 40%);
		inset: 0;
		display: flex;
		justify-content: center;
		position: fixed;
		z-index: 1000;

		.modal {
			align-items: stretch;
			background: var(--bg-secondary);
			border-radius: var(--global-border-radius);
			box-shadow: 0 8px 32px rgb(0 0 0 / 18%);
			color: var(--text-primary);
			display: flex;
			flex-direction: column;
			max-height: 90vh;
			max-width: 90vw;
			overflow: hidden;
			padding: 0.5rem;
			position: relative;
			transition: box-shadow 0.2s;
			width: 100%;

			&.small {
				max-width: 350px;
			}

			&.medium {
				max-width: 600px;
			}

			&.large {
				max-width: 900px;
			}

			&.fullscreen {
				max-width: 900px;

				@media (width <= 600px) {
					border-radius: 0;
					height: 100dvh;
					max-height: 100dvh;
					max-width: 100vw;
					width: 100vw;
				}
			}

			.header {
				border-bottom: 1px solid var(--border);
				padding: 0.5rem 0.5rem 1rem;
			}

			.body {
				flex: 1;
				min-height: 0;
				overflow-y: auto;
				padding: 1rem 0.5rem;

				&.left {
					align-items: flex-start;
					text-align: left;
				}

				&.center {
					align-items: center;
				}

				&.right {
					align-items: flex-end;
				}

				// Custom scrollbar styling
				&::-webkit-scrollbar {
					width: 6px;
				}

				&::-webkit-scrollbar-track {
					background: var(--bg-primary);
					border-radius: 3px;
				}

				&::-webkit-scrollbar-thumb {
					background: var(--border);
					border-radius: 3px;
				}

				&::-webkit-scrollbar-thumb:hover {
					background: var(--border-hover);
				}
			}

			.footer {
				border-top: 1px solid var(--border);
				padding: 1rem 0.5rem 0.5rem;
			}
		}
	}
</style>
