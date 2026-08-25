<template>
	<BaseModal
		:heading="heading"
		:variant="variant"
		:align="align"
		:style="`accent-${accent}`"
		@close="$emit('close')"
	>
		<template
			v-if="$slots.body"
			#body
		>
			<slot name="body" />
		</template>
		<template
			v-if="$slots.footer"
			#footer
		>
			<slot name="footer" />
		</template>
	</BaseModal>
</template>

<script setup lang="ts">
	import BaseModal from '../BaseModal.vue'

	withDefaults(
		defineProps<{
			heading?: string
			variant?: 'small' | 'medium' | 'large' | 'fullscreen'
			align?: 'left' | 'center' | 'right'
			accent?: 'win' | 'loss' | 'neutral' | 'info'
		}>(),
		{
			variant: 'small',
			align: 'center',
			accent: 'neutral',
		},
	)

	defineEmits(['close'])
</script>

<style lang="scss">
	// Unscoped: layers accent chrome onto BaseModal's own .modal element via the
	// `style` prop it already exposes for passing a custom class through.
	.modal.accent-win,
	.modal.accent-loss,
	.modal.accent-neutral,
	.modal.accent-info {
		&::before {
			border-radius: var(--global-border-radius) var(--global-border-radius) 0 0;
			content: '';
			height: 4px;
			left: 0;
			position: absolute;
			right: 0;
			top: 0;
		}
	}

	.modal.accent-win::before {
		background: var(--pitchcard-accent-win);
	}

	.modal.accent-loss::before {
		background: var(--pitchcard-accent-loss);
	}

	.modal.accent-neutral::before {
		background: var(--pitchcard-accent-neutral);
	}

	.modal.accent-info::before {
		background: var(--pitchcard-accent-info);
	}
</style>
