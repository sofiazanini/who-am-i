<template>
  <section class="relative isolate flex h-screen flex-col justify-between overflow-hidden bg-[#090909] px-6 py-8 text-white md:px-16 md:py-10">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-0">
      <PixelBlast
        className="h-full w-full"
        color="#B19EEF"
        :pixelSize="4"
        :patternScale="2"
        :patternDensity="0.8"
        :speed="0.35"
        :edgeFade="0.4"
      />
    </div>

    <!-- Header -->
    <header class="relative z-20 flex items-center justify-between border-b border-white/10 pb-5 font-mono">
      <button
        type="button"
        class="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-wider transition-opacity hover:opacity-70 md:text-sm"
        @click="returnToStory"
      >
        <span aria-hidden="true">←</span>
        TORNA INDIETRO
      </button>
      <span class="text-xs tracking-widest text-white/50">// {{ group.label }}</span>
    </header>

    <!-- Paragrafo statico centrale -->
    <main class="relative z-10 mx-auto my-auto flex w-full max-w-[1100px] items-center justify-center px-4 text-center">
      <p class="w-full font-light tracking-[-0.02em] leading-[1.5] text-[#d5c8ff] text-[clamp(1.25rem,2.4vw,2.2rem)] font-display">
        Sono Sofia, ho 21 anni e sono nata e cresciuta a Brescia. Ho due fratelli e fin da piccola, grazie a mio papà, mi sono avvicinata alla musica, che è stato uno dei motivi per cui ho voluto iniziare questo percorso nell’arte. Mi sono laureata a inizio ottobre e ho scelto di continuare gli studi con il biennio in Digital Design.
      </p>
    </main>

    <!-- Footer -->
    <footer class="relative z-20 flex items-center justify-between border-t border-white/10 pt-5 font-mono text-[10px] text-white/40 md:text-xs">
      <span>sofia zanini — portfolio</span>
      <span>[{{ group.id }}]</span>
    </footer>
  </section>
</template>

<script setup>
import { inject } from 'vue'
import PixelBlast from '../components/PixelBlast.vue'

defineProps({
  group: {
    type: Object,
    required: true,
  },
})

const navigateWithTransition = inject('navigateWithTransition')

function returnToStory() {
  navigateWithTransition({ name: 'home' }, '#f2565b')
}
</script>