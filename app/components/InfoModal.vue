<template>
	<div v-if="show" class="modal-backdrop">
		<div class="modal sw-small">
			<div class="header">
				<h3>How to Play</h3>

				<Icon 
					name="uil:times-circle" 
					@click="$emit('close')" 
					size="1.5em" 
				/>
			</div>
		<slot>
			<h2>How to Play</h2>
			<p>Guess the 6-letter Premier League footballer surname in 6 tries. Each guess must be a valid surname. The answer resets daily at midnight UK time.</p>
		</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{ show: boolean }>()
</script>

<style scoped lang="scss">
	.modal-backdrop {
		position: fixed;
		top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;

			.modal {
				background: var(--bg-primary);
				padding: 2em;
				border-radius: var(--global-border-radius);
				position: relative;

				.header {
					padding: 1rem 0;
					border-bottom: 1px solid var(--border);
					display: flex;
					justify-content: space-between;
				}
			}
	}
.close {
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
}
</style> 