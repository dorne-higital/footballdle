<template>
	<div class="play-layout">
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.play-layout {
		align-items: stretch;
		display: flex;
		height: 100dvh;
		justify-content: center;
		overflow: hidden;
		padding: 1rem;
		position: relative;
		width: 100%;
	}
</style>
