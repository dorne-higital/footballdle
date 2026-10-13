<template>
	<svg
		class="club-crest"
		viewBox="0 0 40 46"
		role="img"
		:aria-label="`${club} badge`"
	>
		<defs>
			<clipPath :id="clipId">
				<path :d="outline" />
			</clipPath>
		</defs>
		<!-- Outer edge (light theme), so white badges and trims don't vanish; the fill covers its inner half -->
		<path
			class="edge"
			:d="outline"
			fill="none"
			stroke-width="4.5"
		/>
		<g :clip-path="`url(#${clipId})`">
			<rect
				width="40"
				height="46"
				:fill="style.bg"
			/>
			<template v-if="crest.pattern === 'stripes'">
				<rect
					v-for="x in [8, 20, 32]"
					:key="x"
					:x="x - 2.5"
					width="5"
					height="46"
					:fill="crest.alt"
				/>
			</template>
			<rect
				v-else-if="crest.pattern === 'halves'"
				x="20"
				width="20"
				height="46"
				:fill="crest.alt"
			/>
			<rect
				v-else-if="crest.pattern === 'band'"
				y="31"
				width="40"
				height="15"
				:fill="crest.alt"
			/>
			<circle
				v-else-if="crest.pattern === 'hoop'"
				cx="20"
				cy="22"
				r="14.5"
				fill="none"
				:stroke="crest.alt"
				stroke-width="2"
			/>
		</g>
		<path
			:d="outline"
			fill="none"
			:stroke="crest.trim"
			stroke-width="2.5"
		/>
		<!-- A plate behind the code keeps it readable over stripes and halves -->
		<rect
			v-if="busy"
			x="6"
			y="15.5"
			width="28"
			height="13"
			rx="3"
			:fill="style.bg"
		/>
		<text
			x="20"
			y="22"
			text-anchor="middle"
			dominant-baseline="central"
			:fill="style.fg"
			font-size="10"
			font-weight="800"
			letter-spacing="0.5"
		>
			{{ style.code }}
		</text>
	</svg>
</template>

<script setup lang="ts">
	import { computed, useId } from 'vue'
	import { clubStyle } from '../../utils/clubs'

	// A club's badge for Player Cards: our own design from its shape and colours (see
	// utils/clubs.ts), never the real crest
	const props = defineProps<{ club: string }>()
	const clipId = `crest-${useId()}`
	const style = computed(() => clubStyle(props.club))
	const crest = computed(() => style.value.crest!)
	const busy = computed(() => crest.value.pattern === 'stripes' || crest.value.pattern === 'halves')

	const OUTLINES = {
		shield: 'M3 3 H37 V22 C37 33 29 40 20 44 C11 40 3 33 3 22 Z',
		round: 'M20 3 A19 19 0 1 1 19.99 3 Z',
		square: 'M9 3 H31 Q37 3 37 9 V37 Q37 43 31 43 H9 Q3 43 3 37 V9 Q3 3 9 3 Z',
	} as const
	const outline = computed(() => OUTLINES[crest.value.shape])
</script>

<style scoped lang="scss">
	.club-crest {
		display: block;
		flex-shrink: 0;
		font-family: var(--font-display, inherit);
		height: 2.6rem;
		overflow: visible;
		width: auto;

		.edge {
			stroke: transparent;
		}
	}

	:global(html.app-shell.app-light .club-crest .edge) {
		stroke: rgb(0 0 0 / 32%);
	}
</style>
