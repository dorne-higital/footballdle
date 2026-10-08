<template>
	<div class="hub-sheets">
		<!-- Settings Modal -->
		<PitchCardModal
			v-if="modalsStore.showSettings"
			heading="Settings"
			accent="info"
			variant="small"
			@close="modalsStore.closeSettings"
		>
			<template #body>
				<ThemePickerSettings @buy-coffee="handleBuyMeCoffee" />
			</template>
		</PitchCardModal>

		<!-- Stats Modal -->
		<PitchCardModal
			v-if="modalsStore.showStats"
			heading="Statistics"
			accent="info"
			variant="small"
			@close="modalsStore.closeStats"
		>
			<template #body>
				<MatchdayStats />
			</template>
		</PitchCardModal>
	</div>
</template>

<script setup lang="ts">
	import { defineAsyncComponent } from 'vue'
	import { useModalsStore } from '../../stores/modals'
	import { useAnalytics } from '../../composables/useAnalytics'
	import ThemePickerSettings from './ThemePickerSettings.vue'
	import MatchdayStats from './MatchdayStats.vue'

	// The Settings and Stats sheets. In the app they're mounted by both layouts, so the
	// top bar's buttons open the same sheets on every screen.
	const PitchCardModal = defineAsyncComponent(() => import('./PitchCardModal.vue'))

	const modalsStore = useModalsStore()
	const { trackBuyMeCoffee } = useAnalytics()

	function handleBuyMeCoffee(location: string) {
		trackBuyMeCoffee(location)
		const btn = document.querySelector('#bmc-wbtn') as HTMLElement | null
		btn?.click()
	}
</script>

<style scoped lang="scss">
	.hub-sheets {
		display: contents;
	}
</style>
