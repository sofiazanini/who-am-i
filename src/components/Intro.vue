<template>
  <div ref="introRef" class="fixed inset-0 z-999 bg-black text-white flex items-center justify-center px-6">
    <GridHover />

    <div class="relative z-10 w-full max-w-2xl px-4 text-center">
      <h1 
        ref="textRef"
        class="font-display text-3xl md:text-6xl leading-tight break-word"
      >
        </h1>
    </div>

    <div ref="progressBarRef" class="absolute bottom-0 left-0 w-full h-1.5 bg-white origin-left scale-x-0 z-10"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import GridHover from './GridHover.vue'

gsap.registerPlugin(ScrambleTextPlugin)

const emit = defineEmits(['done'])
const introRef = ref(null)
const textRef = ref(null)
const progressBarRef = ref(null)

const fullText = "Ciao! Sono Sofia, piacere di conoscerti!"

onMounted(() => {
  const tl = gsap.timeline({ onComplete: () => emit('done') })

  // Barra di caricamento
  tl.to(progressBarRef.value, { scaleX: 1, duration: 5, ease: 'none' })

  // Animazione Scramble testo
  tl.to(textRef.value, {
    duration: 5,
    scrambleText: {
      text: fullText,
      chars: 'upperAndLower',
      revealDelay: 0.5,
      speed: 0.3,
      preserveLength: true
    }
  }, 0)

  // Chiusura
  tl.to(progressBarRef.value, { height: '100vh', duration: 0.5, ease: 'power3.in' }, "+=1")
  tl.to(introRef.value, { y: '-100%', duration: 0.5, ease: 'power3.inOut' })
})
</script>