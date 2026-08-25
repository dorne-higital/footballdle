<template>
	<div
		v-if="publisherId && slotId"
		class="ad-unit"
	>
		<ins
			ref="insEl"
			class="adsbygoogle"
			style="display: block"
			:data-ad-client="publisherId"
			:data-ad-slot="slotId"
			data-ad-format="auto"
			data-full-width-responsive="true"
		/>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue'

	const config = useRuntimeConfig()
	const publisherId = config.public.adsensePublisherId
	const slotId = config.public.adsenseSlotId

	const insEl = ref<HTMLElement | null>(null)

	onMounted(() => {
		if (!publisherId || !slotId || import.meta.dev) return
		// Nuxt dev-mode hydration can remount this component; adsbygoogle throws
		// an uncaught error if push() is called twice for the same slot.
		if ((window as any).__adsbygooglePushed) return
		try {
			;(window as any).adsbygoogle = (window as any).adsbygoogle || []
			;(window as any).adsbygoogle.push({})
			;(window as any).__adsbygooglePushed = true
		} catch {
			// adsbygoogle not ready yet — script loads async
		}
	})
</script>

<style scoped>
	.ad-unit {
		margin: 1.25rem 0;
		min-height: 100px;
		overflow: hidden;
		text-align: center;
		width: 100%;
	}
</style>
