<template>
	<svg
		class="coin-stack"
		viewBox="0 0 60 60"
		aria-hidden="true"
	>
		<defs>
			<linearGradient
				id="coin-side"
				x1="0"
				x2="1"
			>
				<stop
					offset="0"
					stop-color="#B9791A"
				/>
				<stop
					offset=".5"
					stop-color="#E9A93A"
				/>
				<stop
					offset="1"
					stop-color="#A86A12"
				/>
			</linearGradient>
			<radialGradient
				id="coin-face"
				cx=".4"
				cy=".35"
				r=".8"
			>
				<stop
					offset="0"
					stop-color="#FFE7A3"
				/>
				<stop
					offset=".6"
					stop-color="#F6C453"
				/>
				<stop
					offset="1"
					stop-color="#E0A23A"
				/>
			</radialGradient>
		</defs>
		<!-- Drawn bottom-up so each coin sits on the one below -->
		<g
			v-for="i in count"
			:key="i"
			:transform="`translate(0 ${-(i - 1) * 8})`"
		>
			<path
				d="M10 44 v6 a20 6.5 0 0 0 40 0 v-6 z"
				fill="url(#coin-side)"
			/>
			<ellipse
				cx="30"
				cy="44"
				rx="20"
				ry="6.5"
				fill="url(#coin-face)"
			/>
			<ellipse
				cx="30"
				cy="44"
				rx="13.5"
				ry="4.2"
				fill="none"
				stroke="#C98A22"
				stroke-opacity=".55"
				stroke-width="1.4"
			/>
		</g>
	</svg>
</template>

<script setup lang="ts">
	// Tip jar artwork: 1, 2 or 3 stacked gold coins
	defineProps<{ count: number }>()
</script>

<style scoped>
	.coin-stack {
		display: block;
		height: 3.25rem;
		width: 3.25rem;
	}
</style>
