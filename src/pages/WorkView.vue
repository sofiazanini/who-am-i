<template>
  <section class="relative isolate flex h-screen flex-col justify-between overflow-hidden bg-[#050505] px-5 py-6 text-white md:px-12 md:py-8">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 opacity-[0.35]">
      <PixelBlast
        className="h-full w-full"
        color="#B19EEF"
        :pixelSize="4"
        :patternScale="2"
        :patternDensity="0.8"
        :speed="0.35"
        :edgeFade="0.1"
      />
    </div>

    <header class="relative z-20 flex items-center justify-between border-b border-white/15 pb-4 font-mono text-[10px] uppercase tracking-[0.18em] md:text-xs">
      <button
        type="button"
        class="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-60"
        @click="returnToStory"
      >
        <span aria-hidden="true">←</span> TORNA INDIETRO
      </button>
      <span class="text-white/55">// {{ group.label }}</span>
    </header>

    <main class="relative z-10 mx-auto flex min-h-0 w-full max-w-[1700px] flex-1 flex-col items-center justify-center">
      <div class="h-[72vh] min-h-[340px] w-full md:h-[78vh] md:min-h-[480px]">
        <DomeGallery
          v-if="galleryImages.length"
          :images="galleryImages"
          :segments="30"
          :fit="0.30"
          :minRadius="950"
          :maxRadius="900"
          :padFactor="2.5"
          :maxVerticalRotationDeg="8"
          :grayscale="false"
          overlayBlurColor="#050505"
          openedImageWidth="min(45vw, 440px)"
          openedImageHeight="min(75vh, 550px)"
          imageBorderRadius="32px"
          openedImageBorderRadius="22px"
        />
        <p v-else class="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-widest text-white/50">
          Caricamento poster…
        </p>
      </div>
    </main>

    <footer class="relative z-20 flex items-center justify-between border-t border-white/15 pt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-white/45 md:text-[10px]">
      <span>sofia zanini — portfolio</span>
      <span>{{ posterProjects.length }} poster</span>
    </footer>

  </section>
</template>

<script setup>
import { computed, inject } from 'vue'
import DomeGallery from '../components/DomeGallery.vue'
import PixelBlast from '../components/PixelBlast.vue'

defineProps({
  group: {
    type: Object,
    required: true,
  },
})

const navigateWithTransition = inject('navigateWithTransition')

const posterProjects = [
  {
    title: 'Beauty in Fragments',
    image: '/assets/works/beauty-in-fragments_post-01.jpg',
    videoUrl: '/assets/works/beauty-in-fragments.mp4',
  },
  {
    title: 'Between the Traces',
    image: '/assets/works/between-the-traces_post-01.jpg',
    videoUrl: '/assets/works/between-the-traces_process.mp4',
  },
  { title: 'Burning Memory', image: '/assets/works/burning-memory_post-01.jpg' },
  { title: 'Chaos Is Not Only Outside', image: '/assets/works/chaos-is-not-only-outside_post-01.jpg' },
  {
    title: 'Could the Human Soul Survive Without Music?',
    image: '/assets/works/could-the-human-soul-survive-without-music_post-01.jpg',
    videoUrl: '/assets/works/could-the-human-soul-survive-without-music_post.mp4',
  },
  {
    title: 'Crazy Things Happen',
    image: '/assets/works/crazy-things-happen_post-01.jpg',
    videoUrl: '/assets/works/crazy-things-happen_post-02.mp4',
  },
  { title: 'Create and Destroy', image: '/assets/works/create-and-destroy_post-01.jpg' },
  {
    title: 'Digital Bloom',
    image: '/assets/works/digital-bloom_post-01.jpg',
    videoUrl: '/assets/works/digital-bloom_post.mp4',
  },
  { title: 'Don’t Stop Crying Babe', image: '/assets/works/dont-stop-crying-babe_post-01.jpg' },
  { title: 'Eyes on You', image: '/assets/works/eyes-on-you_post-01.jpg' },
  { title: 'Forever Is Composed of Nows', image: '/assets/works/forever-is-composed-of-nows-post-01.jpg' },
  { title: 'Invisible Blueprint', image: '/assets/works/invisible-blueprint_post-01.jpg' },
  {
    title: 'Landscape in Motion',
    image: '/assets/works/landscape-in-motion_post-01.jpg',
    videoUrl: '/assets/works/landscape-in-motion_post.mp4',
  },
  { title: 'Let Me Down Easy', image: '/assets/works/let-me-down-easy_post-01.jpg' },
  {
    title: 'Let the World Inspire You',
    image: '/assets/works/let-the-world-inspire-you_post-01.jpg',
    videoUrl: '/assets/works/let-the-world-inspire-you_post-02.mp4',
  },
  {
    title: 'MAD',
    image: '/assets/works/mad_post-02.jpg',
    videoUrl: '/assets/works/mad_post-frame.mp4',
  },
  {
    title: 'Portrait of Desperation',
    image: '/assets/works/portrait-of-desperation_post-01.jpg',
    videoUrl: '/assets/works/portrait-of-desperation_post.mp4',
  },
  {
    title: 'Rough Diamond',
    image: '/assets/works/rough-diamond_post-01.jpg',
    videoUrl: '/assets/works/rough-diamond_post-02.mp4',
  },
  { title: 'Say, Isn’t It Strange', image: '/assets/works/say-isnt-it-strange_post-01.jpg' },
  {
    title: 'Softness in Pride',
    image: '/assets/works/softness-in-pride-01.jpg',
    videoUrl: '/assets/works/softness-in-pride_post.mp4',
  },
  {
    title: 'Unstable Archives',
    image: '/assets/works/unstable-archives_post-01.jpg',
    videoUrl: '/assets/works/unstable-archives_post.mp4',
  },
  { title: 'We Are All Strange', image: '/assets/works/we-are-all-strange_post-01.jpg' },
  {
    title: 'What Remains',
    image: '/assets/works/what-remains_post-01.jpg',
    videoUrl: '/assets/works/what-remains_process.mp4',
  },
  { title: 'What’s Truly at the Origin', image: '/assets/works/whats-truly-at-the-origin_post-01.jpg' },
  { title: 'Yellow Abyss', image: '/assets/works/yellow-abyss_post-01.jpg' },
]

const galleryImages = computed(() => posterProjects.map((project) => ({
  src: project.image,
  alt: project.title,
  title: project.title,
  videoUrl: project.videoUrl || null,
})))

function returnToStory() {
  navigateWithTransition({ name: 'home' }, '#f2565b')
}
</script>