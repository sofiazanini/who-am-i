<template>
  <canvas ref="canvas" class="fixed inset-0 w-full h-full pointer-events-none z-0"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx, raf
const gridSize = 20 // dimensione della griglia
const activeCells = ref(new Map())

// non fa strecciare la griglia aggiornando le dimensioni del canvas
function resize() {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

function draw() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  const w = canvas.value.width
  const h = canvas.value.height

  // Griglia
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 0.5
  
  ctx.beginPath()
  for (let x = 0; x <= w; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, h) }
  for (let y = 0; y <= h; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(w, y) }
  ctx.stroke()

  // Generazione casuale, il numero è la probabilità
  if (Math.random() < 0.05) { 
    const c = Math.floor(Math.random() * (w / gridSize))
    const r = Math.floor(Math.random() * (h / gridSize))
    const key = `${c}-${r}`
    if (!activeCells.value.has(key)) {
      activeCells.value.set(key, { opacity: 0, fadingIn: true })
    }
  }

  // Render celle
  activeCells.value.forEach((cell, key) => {
    if (cell.fadingIn) {
      cell.opacity += 0.08
      if (cell.opacity >= 1) cell.fadingIn = false
    } else {
      cell.opacity -= 0.03
    }

    if (cell.opacity <= 0) {
      activeCells.value.delete(key)
    } else {
      const [c, r] = key.split('-').map(Number)
      ctx.fillStyle = `rgba(252, 254, 15, ${cell.opacity})` //giallo
      ctx.fillRect(c * gridSize + 1, r * gridSize + 1, gridSize - 2, gridSize - 2) // poco più piccolo della griglia
    }
  })

  raf = requestAnimationFrame(draw)
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resize() // Imposta dimensioni iniziali
  window.addEventListener('resize', resize) // Aggiungi listener
  draw()
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize) // Importante: pulizia
})
</script>