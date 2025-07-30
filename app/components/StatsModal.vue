<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <button class="close" @click="$emit('close')">&times;</button>
      <h2>Stats</h2>
      <p>Games played: {{ stats.gamesPlayed }}</p>
      <p>Wins: {{ stats.wins }}</p>
      <p>Losses: {{ stats.losses }}</p>
      <p>Current streak: {{ stats.currentStreak }}</p>
      <p>Max streak: {{ stats.maxStreak }}</p>
      <div v-if="nextGameTime">
        <h3>Next game in:</h3>
        <p>{{ countdown }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const props = defineProps<{ show: boolean, stats: any, nextGameTime?: Date }>()
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

<script lang="ts">
export default {}
</script> 