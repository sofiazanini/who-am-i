<template>
  <main class="story-experience relative min-h-screen overflow-hidden bg-[#090909] text-white">
    <section
      ref="sectionRef"
      class="story-section relative isolate min-h-screen overflow-hidden px-5 py-16 md:px-12 md:py-20"
    >
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 min-h-screen opacity-[0.45]">
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

      <div class="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[1600px] flex-col">
        <h2 class="story-title mt-[8vh] text-center font-display text-[12vw] font-light leading-[0.9] tracking-[-0.065em] md:mt-[5vh] md:text-[8.5vw]">
          Chi è Sofia?
        </h2>

        <div class="keyword-cloud relative mt-[8vh] flex flex-1 flex-wrap content-center items-center justify-center gap-x-4 gap-y-6 md:mt-[7vh]">
          <template v-for="group in groups" :key="group.id">
            <button
              v-for="word in group.words"
              :key="word.label"
              :ref="setWordRef"
              type="button"
              class="keyword-chip relative font-display font-light leading-none tracking-[-0.055em] text-white"
              :class="[
                word.size,
                { 'is-dimmed': activeCategory && activeCategory !== group.id },
              ]"
              :style="{
                backgroundColor: group.color,
                '--word-tilt': `${word.tilt}deg`,
                '--word-x': word.x,
                '--word-y': word.y,
              }"
              :aria-label="`Apri l’ambito ${group.label}: ${word.label}`"
              @mouseenter="setHover(group.id, word.label)"
              @mouseleave="clearHover"
              @focus="setHover(group.id, word.label)"
              @blur="clearHover"
              @click="openGroup(group, word)"
            >
              {{ word.label }}
              <span v-if="hoveredWord === word.label" class="keyword-category" :style="{ color: group.color }">
                {{ group.label }}
              </span>
            </button>
          </template>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelBlast from './PixelBlast.vue'
import { storyGroups as groups } from '../data/storyGroups.js'

gsap.registerPlugin(ScrollTrigger)

const sectionRef = ref(null)
const activeCategory = ref(null)
const hoveredWord = ref(null)
const wordElements = []
let animationContext
const navigateWithTransition = inject('navigateWithTransition')

function setWordRef(element) {
  if (element && !wordElements.includes(element)) wordElements.push(element)
}

function setHover(groupId, wordLabel) {
  activeCategory.value = groupId
  hoveredWord.value = wordLabel
}

function clearHover() {
  activeCategory.value = null
  hoveredWord.value = null
}

function openGroup(group, word) {
  const route = { name: group.id }
  if (group.id === 'personality') route.query = { trait: word.label }
  navigateWithTransition(route, group.color)
}

onMounted(() => {
  animationContext = gsap.context(() => {
    gsap.fromTo(wordElements,
      { y: -280, opacity: 0, rotation: (index) => (index % 2 ? 18 : -18) },
      {
        y: 0,
        opacity: 1,
        rotation: (index) => {
          const word = wordElements[index]?.textContent.trim()
          for (const group of groups) {
            const matchingWord = group.words.find((item) => item.label === word)
            if (matchingWord) return matchingWord.tilt
          }
          return 0
        },
        duration: 1.5,
        stagger: { each: 0.09, from: 'random' },
        ease: 'bounce.out',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top 70%',
          once: true,
        },
      },
    )
  }, sectionRef.value)
})

onUnmounted(() => {
  animationContext?.revert()
})
</script>

<style scoped>
.keyword-chip {
  padding: 0.04em 0.12em 0.1em;
  transform: rotate(var(--word-tilt));
  cursor: pointer;
  transition: filter 350ms ease, opacity 350ms ease, transform 250ms ease;
}

.keyword-category {
  position: absolute;
  bottom: calc(100% + 0.65rem);
  left: 50%;
  z-index: 2;
  padding: 0.35rem 0.5rem;
  border: 1px solid currentColor;
  background: #090909;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  transform: translateX(-50%);
  pointer-events: none;
}

.keyword-cloud {
  min-height: clamp(27rem, 56vh, 42rem);
}

.keyword-chip:hover,
.keyword-chip:focus-visible {
  outline: none;
}

.keyword-chip.is-dimmed {
  filter: brightness(0.28) saturate(0.45);
}

@media (min-width: 1280px) {
  .keyword-cloud {
    display: block;
  }

  .keyword-chip {
    position: absolute;
    left: var(--word-x);
    top: var(--word-y);
  }
}

@media (prefers-reduced-motion: reduce) {
  .keyword-chip {
    transition-duration: 0.01ms;
  }
}
</style>
