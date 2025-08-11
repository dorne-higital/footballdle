<template>
	<div class="loader-container" :class="variant">
		<!-- Modern Spinner -->
		<div v-if="variant === 'spinner'" class="spinner-container">
			<div class="spinner">
				<div class="spinner-ring"></div>
				<div class="spinner-ring"></div>
				<div class="spinner-ring"></div>
			</div>
		</div>

		<!-- 3-Dot Animation -->
		<div v-if="variant === 'dots'" class="dots-container">
			<div class="dot"></div>
			<div class="dot"></div>
			<div class="dot"></div>
		</div>

		<!-- Compact Spinner for small contexts -->
		<div v-if="variant === 'compact'" class="compact-spinner">
			<div class="compact-ring"></div>
		</div>

		<!-- Loading Text -->
		<p v-if="showText" class="loading-text">{{ text }}</p>
	</div>
</template>

<script setup lang="ts">
interface Props {
	text?: string
	variant?: 'spinner' | 'dots' | 'compact'
	showText?: boolean
}

withDefaults(defineProps<Props>(), {
	text: 'Loading...',
	variant: 'spinner',
	showText: true
})
</script>

<style lang="scss" scoped>
	.loader-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		height: 100%;
		width: 100%;
		position: relative;
	}

  
	// ============================================================================
	// MODERN SPINNER
	// ============================================================================
	.spinner-container {
		position: relative;
		width: 80px;
		height: 80px;
	}

	.spinner {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.spinner-ring {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 3px solid transparent;
		border-radius: 50%;
		animation: spin 1.5s linear infinite;

		&:nth-child(1) {
			border-top-color: var(--primary-color);
			animation-delay: 0s;
		}

		&:nth-child(2) {
			border-right-color: var(--secondary-color);
			animation-delay: 0.5s;
		}

		&:nth-child(3) {
			border-bottom-color: var(--accent-color);
			animation-delay: 1s;
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	// ============================================================================
	// 3-DOT ANIMATION
	// ============================================================================
	.dots-container {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		justify-content: center;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--color-gradient);
		animation: dot-pulse 1.4s ease-in-out infinite both;

		&:nth-child(1) {
			animation-delay: 0s;
		}

		&:nth-child(2) {
			animation-delay: 0.2s;
		}

		&:nth-child(3) {
			animation-delay: 0.4s;
		}
	}

	@keyframes dot-pulse {
		0%, 80%, 100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1.2);
			opacity: 1;
		}
	}

		// ============================================================================
	// COMPACT SPINNER
	// ============================================================================
	.compact-spinner {
		position: relative;
		width: 24px;
		height: 24px;
	}

	.compact-ring {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 2px solid transparent;
		border-top-color: var(--primary-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	// ============================================================================
	// LOADING TEXT
	// ============================================================================
	.loading-text {
		color: var(--text-secondary);
		font-size: 1rem;
		font-weight: 500;
		margin: 0;
		text-align: center;
		animation: text-fade 2s ease-in-out infinite;
	}

	@keyframes text-fade {
		0%, 100% {
			opacity: 0.7;
		}
		50% {
			opacity: 1;
		}
	}

	// ============================================================================
	// VARIANT STYLES
	// ============================================================================
	.compact {
		gap: 0.5rem;
		
		.loading-text {
			font-size: 0.875rem;
		}
	}

	.dots {
		gap: 1rem;
	}
</style>