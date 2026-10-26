<template>
  <section class="relative isolate min-h-screen overflow-hidden bg-[#050505] px-6 py-8 text-white md:px-12 md:py-10 flex flex-col justify-between select-none">
    <!-- Pixel Blast di sfondo con pixel grigi/visibili -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 opacity-80">
      <PixelBlast
        className="h-full w-full"
        color="#999999"
        :pixelSize="4"
        :patternScale="2"
        :patternDensity="0.8"
        :speed="0.35"
        :edgeFade="0.4"
      />
    </div>

    <!-- Header minimale -->
    <header class="relative z-20 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-white/80">
      <button
        type="button"
        class="hover:opacity-70 transition-opacity cursor-pointer flex items-center gap-2"
        @click="returnToStory"
      >
        <span>←</span> torna indietro
      </button>
      <span>// Personalità</span>
    </header>

    <!-- Main: SVG per le linee, Tilted Card centrale, Box in alto e Parole -->
    <main class="relative z-10 mx-auto flex min-h-[75vh] w-full max-w-[1700px] items-center justify-center py-12">
      <div 
        ref="containerRef"
        class="relative w-full h-[70vh] flex items-center justify-center perspective-1000"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        
        <!-- SVG per le linee di connessione tra la card e le parole -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible">
          <line 
            v-if="activeTrait"
            :x1="cardCenter.x" 
            :y1="cardCenter.y" 
            :x2="activeTrait.coords.x" 
            :y2="activeTrait.coords.y" 
            stroke="#FF7701" 
            stroke-width="2" 
            stroke-dasharray="4 4"
            class="animate-pulse"
          />
        </svg>

        <!-- Box descrizione in alto -->
        <div class="absolute top-2 z-30 max-w-lg p-5 bg-black/95 border border-[#FF7701] backdrop-blur-md shadow-2xl transition-all duration-200 text-center pointer-events-none"
             :class="{ 'opacity-100 translate-y-0': activeTrait, 'opacity-0 -translate-y-4': !activeTrait }"
        >
          <p v-if="activeTrait" class="text-white text-sm md:text-base font-mono leading-relaxed">
            <span class="text-[#FF7701]">//</span> {{ activeTrait.description }}
          </p>
        </div>

        <!-- Tilted Card centrale -->
        <div 
          ref="cardRef"
          @click="toggleExpand"
          class="absolute z-20 w-72 md:w-96 aspect-square overflow-hidden border border-[#FF7701] bg-black shadow-2xl cursor-pointer transition-transform duration-100 ease-out will-change-transform group"
          :style="{ transform: cardTransform }"
        >
          <img 
            src="/assets/about/profile-picture.webp" 
            alt="Sofia Zanini" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            draggable="false"
          />
          
          
          <div v-if="!isExpanded" class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="font-display text-base uppercase tracking-wider bg-[#FF7701] text-white px-4 py-2 font-bold shadow-lg">
              [ clicca per scoprire ]
            </span>
          </div>

          <span class="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-white/70 bg-black/60 px-2 py-0.5">
            [ personality ]
          </span>
        </div>

        <!-- Parole con effetto bubble che compaiono al click -->
        <div 
          v-show="isExpanded"
          class="absolute inset-0 z-25 pointer-events-none"
        >
          <div 
            v-for="(trait, index) in traits" 
            :key="index"
            :ref="el => setTraitRef(el, index)"
            @mouseenter="selectTrait(trait, index)"
            @mouseleave="clearTrait"
            class="absolute pointer-events-auto cursor-pointer trait-item bubble-hover"
            :style="trait.style"
          >
            <span 
              class="font-display font-medium text-2xl md:text-4xl px-4 py-2 tracking-tight shadow-2xl inline-block transition-all duration-200"
              :class="activeTrait?.label === trait.label ? 'bg-white text-black' : 'bg-[#FF7701] text-white'"
            >
              {{ trait.label }}
            </span>
          </div>
        </div>

      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-20 flex items-center justify-between font-mono text-[10px] text-white/40 md:text-xs">
      <span>sofia zanini — portfolio</span>
      <span>[personality]</span>
    </footer>
  </section>
</template>

<script setup>
import { inject, ref, reactive, onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import PixelBlast from '../components/PixelBlast.vue'

defineProps({
  group: {
    type: Object,
    required: true,
  },
})

const navigateWithTransition = inject('navigateWithTransition')
const activeTrait = ref(null)
const isExpanded = ref(false)
const cardRef = ref(null)
const containerRef = ref(null)
const cardTransform = ref('rotateX(0deg) rotateY(0deg) scale(1)')

const cardCenter = reactive({ x: 0, y: 0 })
const traitElements = []

function setTraitRef(el, index) {
  if (el) traitElements[index] = el
}

function returnToStory() {
  navigateWithTransition({ name: 'home' }, '#f2565b')
}

// Calcola il centro esatto della card rispetto al contenitore per le linee SVG
const updateCardCenter = () => {
  if (containerRef.value && cardRef.value) {
    const containerRect = containerRef.value.getBoundingClientRect()
    const cardRect = cardRef.value.getBoundingClientRect()
    cardCenter.x = cardRect.left + cardRect.width / 2 - containerRect.left
    cardCenter.y = cardRect.top + cardRect.height / 2 - containerRect.top
  }
}

const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  const rotateX = -((y - centerY) / centerY) * 15
  const rotateY = ((x - centerX) / centerX) * 15

  cardTransform.value = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
  updateCardCenter()
}

const handleMouseLeave = () => {
  cardTransform.value = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
}

const selectTrait = (trait, index) => {
  activeTrait.value = trait
  if (containerRef.value && traitElements[index]) {
    const containerRect = containerRef.value.getBoundingClientRect()
    const elRect = traitElements[index].getBoundingClientRect()
    trait.coords.x = elRect.left + elRect.width / 2 - containerRect.left
    trait.coords.y = elRect.top + elRect.height / 2 - containerRect.top
  }
}

const clearTrait = () => {
  activeTrait.value = null
}

const toggleExpand = async () => {
  isExpanded.value = !isExpanded.value
  
  if (isExpanded.value) {
    await nextTick()
    updateCardCenter()
    gsap.fromTo('.trait-item', 
      { scale: 0, opacity: 0, x: 0, y: 0 },
      { 
        scale: 1, 
        opacity: 1, 
        duration: 0.8, 
        stagger: 0.08, 
        ease: 'back.out(1.7)',
        onComplete: updateCardCenter
      }
    )
  }
}

onMounted(() => {
  setTimeout(updateCardCenter, 100)
})

// Posizioni e coordinate iniziali per le linee
const traits = reactive([
  { label: 'creativa', description: 'Mi piace raccogliere stimoli visivi differenti e trasformarli in idee concrete.', style: 'top: 15%; left: 15%; transform: rotate(-3deg);', coords: { x: 0, y: 0 } },
  { label: 'introversa', description: 'Osservare in silenzio e prendermi il tempo per elaborare i pensieri.', style: 'top: 18%; right: 15%; transform: rotate(2deg);', coords: { x: 0, y: 0 } },
  { label: 'curiosa', description: 'Vado sempre alla ricerca di connessioni inaspettate e punti di vista nuovi.', style: 'top: 48%; left: 5%; transform: rotate(-5deg);', coords: { x: 0, y: 0 } },
  { label: 'attenta', description: 'Credo che siano i dettagli microscopici a fare la differenza in un progetto.', style: 'top: 45%; right: 8%; transform: rotate(4deg);', coords: { x: 0, y: 0 } },
  { label: 'sensibile', description: 'Mi lascio attraversare dalle immagini, dai luoghi e dalle storie.', style: 'bottom: 12%; left: 18%; transform: rotate(2deg);', coords: { x: 0, y: 0 } },
  { label: 'riflessiva', description: 'Do forma ai pensieri con cura prima di tradurli in segni visivi.', style: 'bottom: 15%; right: 20%; transform: rotate(-2deg);', coords: { x: 0, y: 0 } },
  { label: 'determinata', description: 'Quando un’idea mi convince davvero, trovo il modo di portarla avanti.', style: 'bottom: 2%; left: 42%; transform: rotate(1deg);', coords: { x: 0, y: 0 } },
])
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.bubble-hover {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bubble-hover:hover {
  transform: scale(1.15) translateY(-4px);
}
</style>