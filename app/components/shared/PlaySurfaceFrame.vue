<template>
	<div class="play-surface-frame">
		<div
			class="touchline-arc"
			aria-hidden="true"
		/>
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.play-surface-frame {
		background:
			repeating-linear-gradient(100deg, var(--turf-stripe) 0 64px, var(--turf-base) 64px 128px);
		border: 2px solid var(--touchline-color);
		border-radius: var(--global-border-radius);
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
		padding: 0.6rem 0.4rem 0;
		position: relative;

		.touchline-arc {
			border: 1px solid var(--touchline-color);
			border-radius: 0 0 30px 30px;
			border-top: none;
			flex-shrink: 0;
			height: 14px;
			margin: 0 auto 0.4rem;
			width: 30px;
		}
	}
</style>
