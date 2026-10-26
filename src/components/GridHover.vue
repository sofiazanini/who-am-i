<template>
  <canvas ref="canvas" class="absolute inset-0 w-full h-full pointer-events-auto"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx, raf

// dimensione cella (densità griglia)
const cellSize = 18 
let cols = 0
let rows = 0

// gestione scia
let trail = []        
const trailLength = 15 // quanto dura la scia
const maxDist = 100     // raggio d'azione mouse

// caratteri ordinati per densità visiva
const asciiChars = [' ', '.', ':', '-', '=', '+', '*', '%', '@', '#']

function resize() {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  cols = Math.ceil(window.innerWidth / cellSize)
  rows = Math.ceil(window.innerHeight / cellSize)
}

function onMouseMove(e) {
  trail.unshift({ x: e.clientX, y: e.clientY })
  if (trail.length > trailLength) {
    trail.pop()
  }
}

function onMouseLeave() {
  trail = []
}

function draw() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  if (trail.length > 0 && raf % 2 === 0) { 
    trail.pop() 
  }

  // area in alto per la navbar (12% dello schermo)
  const fadeZone = window.innerHeight * 0.12

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * cellSize
      const y = j * cellSize
      const cx = x + cellSize / 2
      const cy = y + cellSize / 2

      let maxIntensity = 0

      for (let k = 0; k < trail.length; k++) {
        const point = trail[k]
        const dist = Math.hypot(point.x - cx, point.y - cy)
        const ageFactor = 1 - (k / trailLength) 
        const intensity = Math.max(0, 1 - dist / maxDist) * ageFactor

        if (intensity > maxIntensity) {
          maxIntensity = intensity
        }
      }

      // puntini fissi di sfondo (texture del sito)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.font = `${cellSize}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('.', cx, cy)

      // calcolo dissolvenza per non coprire i testi in alto
      let fadeFactor = 1
      if (cy < fadeZone) {
        fadeFactor = Math.max(0, cy / fadeZone) // scende a 0 man mano che sale a 0px
      }

      // disegno scia ascii sfumata
      if (maxIntensity > 0.05 && fadeFactor > 0.01) {
        const charIndex = Math.floor(maxIntensity * (asciiChars.length - 1))
        const char = asciiChars[charIndex]

        // rimpicciolisco il font vicino al bordo alto
        const dynamicSize = cellSize * fadeFactor
        ctx.font = `${dynamicSize}px monospace`

        ctx.fillStyle = `rgba(255, 255, 255, ${maxIntensity * 0.9 * fadeFactor})`
        ctx.fillText(char, cx, cy)
      }
    }
  }

  raf = requestAnimationFrame(draw)
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseleave', onMouseLeave)
  draw()
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseleave', onMouseLeave)
})
</script>