<template>
	<div
		v-if="prompt"
		class="update-prompt"
		role="dialog"
		aria-modal="true"
		aria-labelledby="update-title"
	>
		<div class="update-card">
			<Icon
				name="solar:refresh-circle-bold"
				size="2.5rem"
				class="update-icon"
			/>
			<h2 id="update-title">Update available</h2>
			<p>{{ prompt.message }}</p>
			<a
				v-if="prompt.storeUrl"
				:href="prompt.storeUrl"
				class="primary"
				target="_blank"
				rel="noopener"
				@click="prompt = null"
				>Update now</a
			>
			<button
				type="button"
				class="later"
				@click="prompt = null"
			>
				Later
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	// The gentle "update available" sheet raised by plugins/app-config.client.ts
	const prompt = useState<{ message: string; storeUrl: string } | null>('update-prompt', () => null)
</script>

<style scoped lang="scss">
	.update-prompt {
		align-items: flex-end;
		background: rgb(0 0 0 / 55%);
		display: flex;
		inset: 0;
		justify-content: center;
		position: fixed;
		z-index: 210;
	}

	.update-card {
		align-items: center;
		background: var(--bg-secondary);
		border-radius: 28px 28px 0 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 480px;
		padding: 1.5rem 1.5rem calc(env(safe-area-inset-bottom) + 1.25rem);
		text-align: center;
		width: 100%;

		h2 {
			font-family: var(--font-display);
			margin: 0;
		}

		p {
			color: var(--text-secondary);
			line-height: 1.5;
			margin: 0 0 0.5rem;
		}
	}

	.update-icon {
		color: var(--primary-color);
	}

	.primary,
	.later {
		align-items: center;
		border-radius: 0.9rem;
		display: flex;
		font: inherit;
		font-weight: 800;
		justify-content: center;
		min-height: 50px;
		text-decoration: none;
		width: 100%;
	}

	.primary {
		background: var(--primary-color);
		color: var(--on-success);
	}

	.later {
		background: none;
		border: 0;
		color: var(--text-secondary);
		cursor: pointer;
		min-height: 44px;
	}
</style>
