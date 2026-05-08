<template>
	<div class="loader-container">
		<div class="dots">
			<div class="dot"></div>
			<div class="dot"></div>
			<div class="dot"></div>
		</div>
		<p class="text">Loading...</p>
	</div>
</template>

<style lang="scss" scoped>
	.loader-container {
		align-items: center;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: center;
		left: 0;
		position: fixed;
		top: 0;
		width: 100%;
		z-index: 9999;

		.dots {
			align-items: center;
			display: flex;
			gap: 0.5rem;
			justify-content: center;
		}

		.dot {
			animation: dot-pulse 1.4s ease-in-out infinite both;
			background: var(--primary-color);
			border-radius: 50%;
			height: 12px;
			width: 12px;

			&:nth-child(1) {
				animation-delay: -0.32s;
			}

			&:nth-child(2) {
				animation-delay: -0.16s;
			}

			&:nth-child(3) {
				animation-delay: 0s;
			}
		}

		.text {
			color: var(--text-primary);
			font-size: 0.9rem;
			font-weight: 500;
			margin-top: 1.5rem;
		}
	}

	@keyframes dot-pulse {
		0%,
		80%,
		100% {
			opacity: 0.5;
			transform: scale(0.8);
		}

		40% {
			opacity: 1;
			transform: scale(1.2);
		}
	}
</style>
