<template>
  <Analytics />
  <div class="min-h-screen bg-black text-white overflow-x-hidden">
    <Intro v-if="showIntro" @done="finishIntro" /> <!-- se è true c'è l'intro, poi cambia in @done -->

    <template v-else>
      <div class="relative z-10">
        <router-view /> <!-- fa caricare le pagine -->
      </div>
    </template>

    <div
      v-if="transitionVisible"
      ref="transitionRef"
      class="fixed bottom-0 left-0 z-[100] h-1.5 w-full origin-left"
      :style="{ backgroundColor: transitionColor }"
      aria-hidden="true"
    ></div>
  </div>
</template>

<script setup>
import { nextTick, provide, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import Intro from './components/Intro.vue'
import { Analytics } from '@vercel/analytics/vue'

const INTRO_KEY = 'intro-shown' // serve per capire se è già stata vista l'intro
const showIntro = ref(sessionStorage.getItem(INTRO_KEY) !== 'true') // se già vista salta al sito
const router = useRouter()
const transitionRef = ref(null)
const transitionVisible = ref(false)
const transitionColor = ref('#8A81E1')
let isTransitioning = false

function finishIntro() {
  sessionStorage.setItem(INTRO_KEY, 'true') // blocca l'intro per i prossimi refresh
  showIntro.value = false // nasconde l'intro e carica il sito
}

function animateTransition(target, vars) {
  return new Promise((resolve) => {
    gsap.to(target, { ...vars, onComplete: resolve })
  })
}

async function navigateWithTransition(route, color) {
  if (isTransitioning) return
  isTransitioning = true
  transitionColor.value = color
  transitionVisible.value = true
  await nextTick()

  const curtain = transitionRef.value
  if (!curtain) {
    transitionVisible.value = false
    isTransitioning = false
    return
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const duration = reducedMotion ? 0.01 : 1
  gsap.set(curtain, { height: '6px', y: 0, scaleX: 1, transformOrigin: 'left bottom' })

  try {
    await animateTransition(curtain, { height: '100vh', duration, ease: 'power3.in' })
    await router.push(route)
    await nextTick()
    await animateTransition(curtain, { y: '-100%', duration, ease: 'power3.inOut' })
  } finally {
    transitionVisible.value = false
    isTransitioning = false
  }
}

provide('navigateWithTransition', navigateWithTransition)
</script>
