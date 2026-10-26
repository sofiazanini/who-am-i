<template>
  <main class="h-screen w-screen overflow-hidden bg-black text-white relative select-none flex items-center justify-center">
    <GridHover />

    <!-- Container principale -->
    <div class="relative w-full h-full flex items-center justify-center z-10 pointer-events-none px-4">
      
      <!-- Badge pixelato in alto a sinistra -->
      <div ref="pixelBadge" class="absolute left-[20%] md:left-[27%] top-[22%] md:top-[15%] pointer-events-auto cursor-default z-20 w-[14vw] md:w-[15vw] max-w-lg invert ">
        <img src="/assets/home/pixel-badge.png" class="w-full h-auto object-contain hover:bg-white -rotate-6 animate-pulse" alt="Pixel Badge" draggable="false" />
      </div>

      <!-- Immagine Camera (destra) -->
      <div ref="rightImg" class="absolute right-[22%] md:right-[17%] top-[18%] md:top-[14%] pointer-events-auto cursor-crosshair transition-filter duration-50 ease-out hover:invert w-[36vw] md:w-[28vw] max-w-lg z-20">
        <img src="/assets/home/img-camera.png" class="w-full h-auto object-contain rotate-3" alt="Camera ASCII" draggable="false" />
      </div>

      <!-- Immagine Computer (sinistra) -->
      <div ref="computerImg" class="absolute left-[22%] md:left-[17%] top-[45%] md:top-[50%] pointer-events-auto cursor-crosshair transition-filter duration-50 ease-out hover:invert w-[36vw] md:w-[28vw] max-w-lg z-30">
        <img src="/assets/home/img-computer.png" class="w-full h-auto object-contain -rotate-2" alt="Computer ASCII" draggable="false" />
      </div>

      <!-- Nome su due righe al centro -->
      <div class="absolute left-[35%] top-[41%] z-40 text-left pointer-events-auto cursor-default">
        <h1 class="font-display text-[12vw] md:text-[12vw] leading-[0.86] font-light tracking-[-0.05em] normal-case">
          <span class="inline-block bg-black px-5 translate-x-[40%] mb-5 hover:invert">Sofia</span>
          <span class="block bg-black px-5 hover:invert">Zanini</span>
        </h1>
      </div>

    </div>
  </main>
  <StorySection />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import GridHover from '../components/GridHover.vue'
import StorySection from '../components/StorySection.vue'

const rightImg = ref(null)
const computerImg = ref(null)
const pixelBadge = ref(null)

const handleMouseMove = (e) => {
  const { clientX, clientY } = e
  const xPos = (clientX / window.innerWidth) - 0.5
  const yPos = (clientY / window.innerHeight) - 0.5

  gsap.to(rightImg.value, { 
    x: xPos * -25, 
    y: yPos * -18, 
    rotation: 3 + (xPos * -2), 
    duration: 1, 
    ease: 'power2.out' 
  })

  gsap.to(computerImg.value, { 
    x: xPos * 25, 
    y: yPos * 18, 
    rotation: -2 + (xPos * 2), 
    duration: 1, 
    ease: 'power2.out' 
  })

  gsap.to(pixelBadge.value, {
    x: xPos * 35,
    y: yPos * 25,
    duration: 1,
    ease: 'power2.out'
  })
}

const handleMouseLeave = () => {
  gsap.to(rightImg.value, { x: 0, y: 0, rotation: 3, duration: 1.2, ease: 'power3.out' })
  gsap.to(computerImg.value, { x: 0, y: 0, rotation: -2, duration: 1.2, ease: 'power3.out' })
  gsap.to(pixelBadge.value, { x: 0, y: 0, duration: 1.2, ease: 'power3.out' })
}

onMounted(() => {
  gsap.fromTo(rightImg.value, 
    { opacity: 0, scale: 0.9, y: -20 }, 
    { opacity: 1, scale: 1, y: 0, duration: 1.5, delay: 0.1, ease: 'power4.out' }
  )

  gsap.fromTo(computerImg.value, 
    { opacity: 0, scale: 0.9, y: 30 }, 
    { opacity: 1, scale: 1, y: 0, duration: 1.5, delay: 0.2, ease: 'power4.out' }
  )

  gsap.fromTo(pixelBadge.value, 
    { opacity: 0, scale: 0.8 }, 
    { opacity: 1, scale: 1, duration: 1.2, delay: 0.3, ease: 'power4.out' }
  )

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseleave', handleMouseLeave)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseleave', handleMouseLeave)
})
</script>