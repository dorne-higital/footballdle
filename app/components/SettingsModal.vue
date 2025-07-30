<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <button class="close" @click="$emit('close')">&times;</button>
      <slot>
        <h2>Settings</h2>
        <p>Settings go here.</p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ show: boolean }>()
</script>

<script lang="ts">
export default {}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 2em;
  border-radius: 8px;
  min-width: 300px;
  position: relative;
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