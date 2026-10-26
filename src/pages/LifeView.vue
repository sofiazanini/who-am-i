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
        class="flex items-center gap-2 text-xs uppercase tracking-wider transition-opacity hover:opacity-70 md:text-sm cursor-pointer"
        @click="returnToStory"
      >
        <span aria-hidden="true">←</span>
        torna indietro
      </button>
      <span class="text-xs tracking-widest text-white/50">// {{ group.label }}</span>
    </header>

    <!-- Solo quest’area scorre: sfondo, header, indicatore e footer restano fermi. -->
    <main
      ref="mainRef"
      class="life-scroll relative z-10 mx-auto min-h-0 w-full max-w-[1400px] flex-1 overflow-y-auto overscroll-contain"
      :class="{ 'is-reduced-motion': reduceMotion }"
    >
      <div ref="copyRef" class="life-copy life-track">
        <div class="life-window">
          <div class="life-lines-window">
            <p ref="paragraphRef" class="life-paragraph">
              Sono Sofia, ho 21 anni e sono nata e cresciuta a Brescia. Ho due fratelli e fin da piccola grazie a mio papà mi sono avvicinata alla musica, che è stato uno dei motivi per cui ho voluto iniziare questo percorso nell'arte. Mi sono laureata a inizio ottobre e ho scelto di continuare gli studi con il biennio in Digital Design.
            </p>
          </div>
        </div>
      </div>
    </main>

    <aside v-if="!reduceMotion" class="life-progress" aria-label="Progresso della lettura">
      <div class="life-progress-track">
        <div ref="scrollbarThumb" class="life-progress-fill"></div>
      </div>
    </aside>

    <!-- Footer -->
    <footer class="relative z-20 flex items-center justify-between border-t border-white/10 pt-5 font-mono text-[10px] text-white/40 md:text-xs">
      <span>sofia zanini — portfolio</span>
      <span>[{{ group.id }}]</span>
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

defineProps({
  group: {
    type: Object,
    required: true,
  },
})

const navigateWithTransition = inject('navigateWithTransition')
const mainRef = ref(null)
const copyRef = ref(null)
const paragraphRef = ref(null)
const scrollbarThumb = ref(null)
const reduceMotion = ref(false)
let animationContext
let splitText
let isActive = true

function returnToStory() {
  navigateWithTransition({ name: 'home' }, '#f2565b')
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion.value) return

  document.fonts.ready.then(() => {
    if (!isActive || !paragraphRef.value) return

    animationContext = gsap.context(() => {
      splitText = SplitText.create(paragraphRef.value, {
        type: 'lines, chars',
        linesClass: 'life-line',
        charsClass: 'life-char',
        mask: 'lines',
        autoSplit: true,
        onSplit: (split) => {
          const lineHeight = parseFloat(window.getComputedStyle(paragraphRef.value).lineHeight)
          const lineCount = split.lines.length
          const scrollDistance = Math.max(lineHeight * lineCount, mainRef.value.clientHeight)
          copyRef.value.style.height = `${mainRef.value.clientHeight + scrollDistance}px`
          gsap.set(split.chars, { yPercent: 110, opacity: 0, color: '#4B4657' })
          gsap.set(split.lines[0]?.querySelectorAll('.life-char'), {
            yPercent: 0,
            opacity: 1,
            color: '#D5C8FF',
          })

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: copyRef.value,
              scroller: mainRef.value,
              start: 'top top',
              end: `+=${scrollDistance}`,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          })

          split.lines.forEach((line, index) => {
            const chars = line.querySelectorAll('.life-char')
            const lineStart = index
            const enteringWindow = index >= 4

            if (enteringWindow) {
              timeline.to(
                paragraphRef.value,
                {
                  y: -((index - 3) * lineHeight),
                  duration: 0.18,
                  ease: 'none',
                },
                lineStart,
              )
            }

            timeline.to(
              chars,
              {
                yPercent: 0,
                opacity: 1,
                color: '#D5C8FF',
                duration: 0.82,
                stagger: { each: 0.012 },
                ease: 'power2.out',
              },
              lineStart + (enteringWindow ? 0.18 : 0),
            )
          })

          if (scrollbarThumb.value) {
            const timelineDuration = timeline.duration()
            timeline.fromTo(
              scrollbarThumb.value,
              { scaleY: 0 },
              { scaleY: 1, duration: timelineDuration, ease: 'none' },
              0,
            )
          }

          return timeline
        },
      })
    }, mainRef.value)
  })
})

onUnmounted(() => {
  isActive = false
  splitText?.revert()
  animationContext?.revert()
})
</script>

<style scoped>
.life-copy {
  min-height: 100%;
  font-family: var(--font-display, inherit);
  font-size: clamp(3.25rem, 7vw, 7rem);
  font-weight: 300;
  letter-spacing: -0.04em;
  line-height: 1.075;
}

.life-track {
  position: relative;
  min-height: 100%;
}

.life-window {
  position: sticky;
  top: 0;
  display: flex;
  height: 70vh;
  align-items: center;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%);
}

.life-lines-window {
  width: 100%;
  height: 4.3em;
  overflow: hidden;
}

.life-paragraph {
  width: 100%;
  will-change: transform;
}

:deep(.life-char) {
  display: inline-block;
  will-change: transform, opacity, color;
}

.life-scroll {
  scrollbar-width: none;
}

.life-scroll::-webkit-scrollbar {
  display: none;
}

.life-progress {
  position: fixed;
  top: 15vh;
  right: max(1.5rem, calc((100vw - 1400px) / 2));
  z-index: 30;
  height: 70vh;
  width: 3px;
  pointer-events: none;
}

.life-progress-track {
  height: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(255 255 255 / 18%);
}

.life-progress-fill {
  height: 100%;
  width: 100%;
  border-radius: inherit;
  background: linear-gradient(to bottom, #b19eef, #410cbc);
  transform: scaleY(0);
  transform-origin: top;
  will-change: transform;
}

.is-reduced-motion .life-track,
.is-reduced-motion .life-window {
  position: static;
  height: auto;
  overflow: visible;
  min-height: 100%;
  mask-image: none;
  -webkit-mask-image: none;
}

.is-reduced-motion .life-lines-window {
  height: auto;
  overflow: visible;
}

.is-reduced-motion .life-paragraph {
  height: auto;
  overflow: visible;
  color: #d5c8ff;
}

@media (prefers-reduced-motion: reduce) {
  .life-progress {
    display: none;
  }
}
</style>
