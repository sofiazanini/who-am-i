<template>
  <section class="relative isolate flex h-screen flex-col overflow-hidden bg-[#090909] px-6 py-8 text-white md:px-16 md:py-10">
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

    <header class="relative z-20 flex shrink-0 items-center justify-between border-b border-white/10 pb-5 font-mono">
      <button
        type="button"
        class="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-wider transition-opacity hover:opacity-70 md:text-sm"
        @click="returnToStory"
      >
        ← TORNA INDIETRO
      </button>
      <p class="text-xs tracking-widest text-white/50">// {{ group.label }}</p>
    </header>

    <main
      ref="scrollRef"
      class="scrollbar-none relative z-10 min-h-0 w-full flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth"
    >
      <article
        v-for="(paragraph, index) in paragraphs"
        :key="index"
        class="mx-auto flex min-h-full w-full max-w-[1500px] snap-center items-center justify-center px-4"
      >
        <p :data-life-text="index" class="w-full m-0 text-white font-display font-light text-[clamp(3.5rem,7vw,8.5rem)] leading-[1.1] hyphens-none break-normal [overflow-wrap:normal] [perspective:1000px]">
          {{ paragraph }}
        </p>
      </article>
    </main>

    <footer class="relative z-20 flex shrink-0 items-center justify-between border-t border-white/10 pt-5 font-mono text-[10px] text-white/40 md:text-xs">
      <p>sofia zanini — portfolio</p>
      <p>[{{ group.id }}]</p>
    </footer>
  </section>
</template>

<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import PixelBlast from '../components/PixelBlast.vue'

gsap.registerPlugin(ScrollTrigger, SplitText)

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
})

const navigateWithTransition = inject('navigateWithTransition')
const scrollRef = ref(null)
const paragraphs = [
  'Sono Sofia, ho 21 anni e sono nata e cresciuta a Brescia.',
  "Mi sono avvicinata alla musica da piccola, e poi ho iniziato questo percorso nell’arte.",
  'Mi sono laureata a inizio ottobre e ho scelto di continuare gli studi in Digital Design.',
]

let splitTexts = []
let animationContext
let isActive = true

function returnToStory() {
  navigateWithTransition({ name: 'home' }, props.group.color)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  document.fonts.ready.then(() => {
    if (!isActive || !scrollRef.value) return

    animationContext = gsap.context(() => {
      const textElements = gsap.utils.toArray('[data-life-text]', scrollRef.value)

      splitTexts = textElements.map((element) => {
        return SplitText.create(element, {
          type: 'lines, words, chars',
          autoSplit: true,
          onSplit: (split) => {
            return gsap.from(split.chars, {
              y: 100,
              rotationX: -90,
              opacity: 0,
              duration: 1,
              ease: 'power4.out',
              stagger: 0.02,
              scrollTrigger: {
                trigger: element.closest('article'),
                scroller: scrollRef.value,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            })
          },
        })
      })
    }, scrollRef.value)

    ScrollTrigger.refresh()
  })
})

onUnmounted(() => {
  isActive = false
  splitTexts.forEach((splitText) => splitText.revert())
  animationContext?.revert()
})
</script>

<style scoped>
:deep([data-life-text] *) {
  will-change: transform, opacity;
  display: inline-block;
}

@media (prefers-reduced-motion: reduce) {
  main {
    scroll-behavior: auto;
    scroll-snap-type: none;
  }
}
</style>
