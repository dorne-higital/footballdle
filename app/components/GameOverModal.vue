<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <button class="close" @click="$emit('close')">&times;</button>
      <h2 v-if="isWin">You win!</h2>
      <h2 v-else>You lose!</h2>
      <p>The answer was <strong>{{ answer }}</strong></p>
      <button @click="$emit('share')">Share</button>
      <div v-if="nextGameTime">
        <h3>Next game in:</h3>
        <p>{{ countdown }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const props = defineProps<{ show: boolean, isWin: boolean, answer: string, nextGameTime?: Date }>()
const countdown = ref('')
let interval: any
function updateCountdown() {
  if (!props.nextGameTime) return
  const now = new Date()
  const nextGame = typeof props.nextGameTime === 'string'
    ? new Date(props.nextGameTime)
    : props.nextGameTime
  const diff = nextGame.getTime() - now.getTime()
  if (diff <= 0) {
    countdown.value = '00:00:00'
    return
  }
  const hours = Math.floor(diff / 1000 / 60 / 60)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  countdown.value = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})
onUnmounted(() => {
  clearInterval(interval)
})
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