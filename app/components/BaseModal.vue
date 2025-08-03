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
				<div class="body flex-center" :class="align">
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
		componentName?: string,
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
	}
)
</script>

<style scoped lang="scss">
	.base-modal {
		align-items: center;
		background: rgba(0,0,0,0.4);
		bottom: 0;
		display: flex;
		justify-content: center;
		left: 0;
		position: fixed;
		right: 0;
		top: 0;
		z-index: 1000;

		.modal {
			align-items: stretch;
			background: var(--bg-secondary);
			border-radius: var(--global-border-radius);
			box-shadow: 0 8px 32px rgba(0,0,0,0.18);
			color: var(--text-primary);
			display: flex;
			flex-direction: column;
			max-width: 90vw;
			max-height: 90vh;
			overflow: hidden;
			padding: .5rem;
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
				
				@media (max-width: 600px) {
					max-width: 100vw;
					max-height: 100dvh;
					width: 100vw;
					height: 100dvh;
					border-radius: 0;
				}
			}

			.header {
				border-bottom: 1px solid var(--border);
				padding: .5rem .5rem 1rem;
			}

			.body {
				padding: 1rem .5rem;
				flex: 1;
				overflow-y: auto;
				min-height: 0;

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
				padding: 1rem .5rem .5rem;
			}
		}
	}
</style> 