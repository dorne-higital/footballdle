<template>
	<button
		type="button"
		class="button primary share-result-btn"
		@click="share"
	>
		<Icon
			:name="isApp ? 'solar:share-linear' : 'solar:copy-linear'"
			size="1.05rem"
		/>
		{{ isApp ? 'Share' : copied ? 'Copied!' : 'Copy result' }}
	</button>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { useShare } from '../../composables/useShare'

	// The app opens the native share sheet; the website copies to the clipboard
	const props = defineProps<{ text: string }>()
	const emit = defineEmits<{ shared: [] }>()

	const isApp = !!useRuntimeConfig().public.isApp
	const { shareText } = useShare()
	const copied = ref(false)
	let timer: ReturnType<typeof setTimeout> | null = null

	async function share() {
		emit('shared')
		if (await shareText(props.text)) {
			copied.value = true
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => (copied.value = false), 2000)
		}
	}
</script>

<style scoped lang="scss">
	.share-result-btn {
		align-items: center;
		display: inline-flex;
		gap: 0.45rem;
		justify-content: center;
		min-height: 44px;
	}
</style>
