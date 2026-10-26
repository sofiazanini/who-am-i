<template>
  <div
    ref="rootRef"
    class="relative w-full h-full"
    :style="
      {
        '--segments-x': segments,
        '--segments-y': segments,
        '--circ': 'calc(var(--radius) * 3.14)',
        '--rot-y': 'calc((360deg / var(--segments-x)) / 2)',
        '--rot-x': 'calc((360deg / var(--segments-y)) / 2)',
        '--item-width': 'calc(var(--circ) / var(--segments-x))',
        '--item-height': 'calc(var(--circ) / var(--segments-y))'
      } as StyleValue
    "
  >
    <div
      ref="mainRef"
      class="absolute inset-0 place-items-center grid bg-transparent overflow-hidden touch-none select-none rounded-[36px]"
    >
      <div
        class="place-items-center grid w-full h-full"
        :style="
          {
            perspective: 'calc(var(--radius) * 2)',
            perspectiveOrigin: '50% 50%',
            contain: 'layout size'
          } as StyleValue
        "
      >
        <div
          ref="sphereRef"
          :style="
            {
              willChange: 'transform',
              transformStyle: 'preserve-3d',
              transform: 'translateZ(calc(var(--radius) * -1))'
            } as StyleValue
          "
        >
          <div
            v-for="(item, i) in items"
            :key="`${item.x},${item.y},${i}`"
            :data-src="item.src"
            :data-title="item.title"
            :data-alt="item.alt"
            :data-video-url="item.videoUrl"
            :data-offset-x="item.x"
            :data-offset-y="item.y"
            :data-size-x="item.sizeX"
            :data-size-y="item.sizeY"
            :style="
              {
                '--offset-x': item.x,
                '--offset-y': item.y,
                '--item-size-x': item.sizeX,
                '--item-size-y': item.sizeY,
                width: 'calc(var(--item-width) * var(--item-size-x))',
                height: 'calc(var(--item-height) * var(--item-size-y))',
                position: 'absolute',
                top: '-999px',
                bottom: '-999px',
                left: '-999px',
                right: '-999px',
                margin: 'auto',
                transformStyle: 'preserve-3d',
                transformOrigin: '50% 50%',
                backfaceVisibility: 'hidden',
                transition: 'transform 300ms',
                transform: `rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg))) rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg))) translateZ(var(--radius))`
              } as StyleValue
            "
          >
            <div
              :style="
                {
                  position: 'absolute',
                  display: 'block',
                  inset: '10px',
                  borderRadius: 'var(--tile-radius, 12px)',
                  background: 'transparent',
                  overflow: 'hidden',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  transition: 'transform 300ms',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  transform: 'translateZ(0)',
                  pointerEvents: 'auto'
                } as StyleValue
              "
              role="button"
              tabindex="0"
              :aria-label="item.alt || 'Open image'"
              @pointerup="onTilePointerUp"
              @click="onTileClick"
              @keydown="onTileKeyDown"
            >
              <img
                :src="item.src"
                :draggable="false"
                :alt="item.alt"
                :style="
                  {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    pointerEvents: 'none',
                    backfaceVisibility: 'hidden',
                    filter: 'var(--image-filter, none)'
                  } as StyleValue
                "
              />
              <span
                v-if="item.videoUrl"
                aria-hidden="true"
                :style="{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  zIndex: '2',
                  display: 'grid',
                  width: '28px',
                  height: '28px',
                  placeItems: 'center',
                  border: '1px solid rgba(255,255,255,.8)',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,.7)',
                  color: '#fff',
                  fontSize: '10px',
                  pointerEvents: 'none'
                } as StyleValue"
              >
                ▶
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref="viewerRef"
        class="z-20 absolute inset-0 flex justify-center items-center pointer-events-none"
        :style="{ padding: 'var(--viewer-pad)' } as StyleValue"
      >
        <div
          ref="scrimRef"
          class="z-10 absolute inset-0 bg-black/40 transition-opacity duration-500 ease-linear"
          :style="
            {
              backdropFilter: 'blur(3px)',
              opacity: isEnlarging ? 1 : 0,
              pointerEvents: isEnlarging ? 'all' : 'none'
            } as StyleValue
          "
        />
        <div
          ref="frameRef"
          class="flex h-full aspect-[4/5]"
          :style="{ borderRadius: 'var(--enlarge-radius, 32px)' } as StyleValue"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

interface ImageItem {
  src: string;
  alt?: string;
  title?: string;
  videoUrl?: string;
}

interface DomeGalleryProps {
  images?: (string | ImageItem)[];
  fit?: number;
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
}

const DEFAULT_IMAGES: ImageItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Abstract art'
  },
  {
    src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Modern sculpture'
  },
  {
    src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Digital artwork'
  },
  {
    src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Contemporary art'
  },
  {
    src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Geometric pattern'
  },
  {
    src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Textured surface'
  },
  { src: 'https://pbs.twimg.com/media/Gyla7NnXMAAXSo_?format=jpg&name=large', alt: 'Social media image' }
];

const props = withDefaults(defineProps<DomeGalleryProps>(), {
  fit: 0.5,
  fitBasis: 'auto',
  minRadius: 600,
  maxRadius: Infinity,
  padFactor: 0.25,
  overlayBlurColor: '#120F17',
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35,
  dragDampening: 2,
  openedImageWidth: '250px',
  openedImageHeight: '350px',
  imageBorderRadius: '30px',
  openedImageBorderRadius: '30px',
  grayscale: true
});

const rootRef = useTemplateRef<HTMLDivElement>('rootRef');
const mainRef = useTemplateRef<HTMLElement>('mainRef');
const sphereRef = useTemplateRef<HTMLDivElement>('sphereRef');
const viewerRef = useTemplateRef<HTMLDivElement>('viewerRef');
const scrimRef = useTemplateRef<HTMLDivElement>('scrimRef');
const frameRef = useTemplateRef<HTMLDivElement>('frameRef');

const isEnlarging = ref(false);

const rotationRef = { x: 0, y: 0 };
const startRotRef = { x: 0, y: 0 };
let startPosRef: { x: number; y: number } | null = null;
let draggingRef = false;
let movedRef = false;
let inertiaRAF: number | null = null;
let openingRef = false;
let openStartedAtRef = 0;
let suppressClickUntil = 0;
let focusedElRef: HTMLElement | null = null;
let originalTilePositionRef: { left: number; top: number; width: number; height: number } | null = null;
let scrollLockedRef = false;
let resizeObserver: ResizeObserver | null = null;
let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
let enlargedOverlayRef: HTMLElement | null = null;

const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number): number => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number): number => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el: HTMLElement, name: string, fallback: number): number => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

interface TileCoord {
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
}
interface TileItem extends TileCoord {
  src: string;
  alt: string;
  title?: string;
  videoUrl?: string;
}

function buildItems(pool: (string | ImageItem)[], seg: number): TileItem[] {
  const xCols = Array.from({ length: seg }, (_, i) => (i - (seg - 1) / 2) * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];
  const maxX = Math.max(...xCols.map(Math.abs), 1);
  const coords: TileCoord[] = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys
      .filter(y => (x / maxX) ** 2 + (y / 5) ** 2 <= 1.12)
      .map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });
  const totalSlots = coords.length;
  if (pool.length === 0) return coords.map(c => ({ ...c, src: '', alt: '' }));
  if (pool.length > totalSlots) {
    console.warn(`[DomeGallery] ${pool.length} images > ${totalSlots} tiles. Some won't show.`);
  }
  const normalizedImages: ImageItem[] = pool.map(img =>
    typeof img === 'string'
      ? { src: img, alt: '' }
      : { src: img.src || '', alt: img.alt || '', title: img.title, videoUrl: img.videoUrl }
  );
  const usedImages: ImageItem[] = Array.from(
    { length: totalSlots },
    (_, i) => normalizedImages[i % normalizedImages.length]
  );
  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          [usedImages[i], usedImages[j]] = [usedImages[j], usedImages[i]];
          break;
        }
      }
    }
  }
  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt ?? '',
    title: usedImages[i].title,
    videoUrl: usedImages[i].videoUrl
  }));
}

const items = computed(() => buildItems(props.images ?? DEFAULT_IMAGES, props.segments));

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  return {
    rotateY: unit * (offsetX + (sizeX - 1) / 2),
    rotateX: unit * (offsetY - (sizeY - 1) / 2)
  };
}

const applyTransform = (xDeg: number, yDeg: number) => {
  const el = sphereRef.value;
  if (el) el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
};

const applyRootVars = () => {
  const root = rootRef.value;
  if (!root) return;
  root.style.setProperty('--overlay-blur-color', props.overlayBlurColor);
  root.style.setProperty('--tile-radius', props.imageBorderRadius);
  root.style.setProperty('--enlarge-radius', props.openedImageBorderRadius);
  root.style.setProperty('--image-filter', props.grayscale ? 'grayscale(1)' : 'none');
};

const computeRadius = () => {
  const root = rootRef.value;
  if (!root) return;
  const cr = root.getBoundingClientRect();
  const w = Math.max(1, cr.width);
  const h = Math.max(1, cr.height);
  const minDim = Math.min(w, h);
  const maxDim = Math.max(w, h);
  const aspect = w / h;
  let basis: number;
  switch (props.fitBasis) {
    case 'min':
      basis = minDim;
      break;
    case 'max':
      basis = maxDim;
      break;
    case 'width':
      basis = w;
      break;
    case 'height':
      basis = h;
      break;
    default:
      basis = aspect >= 1.3 ? w : minDim;
  }
  let radius = basis * props.fit;
  radius = Math.min(radius, h * 1.35);
  radius = clamp(radius, props.minRadius, props.maxRadius);
  const viewerPad = Math.max(8, Math.round(minDim * props.padFactor));
  root.style.setProperty('--radius', `${Math.round(radius)}px`);
  root.style.setProperty('--viewer-pad', `${viewerPad}px`);
  applyRootVars();
  applyTransform(rotationRef.x, rotationRef.y);

  const enlargedOverlay = enlargedOverlayRef;
  if (enlargedOverlay) {
    const targetHeight = Math.min(window.innerHeight * 0.78, 720);
    const targetWidth = targetHeight * (4 / 5);
    enlargedOverlay.style.left = `${(window.innerWidth - targetWidth) / 2}px`;
    enlargedOverlay.style.top = `${(window.innerHeight - targetHeight) / 2}px`;
    enlargedOverlay.style.width = `${targetWidth}px`;
    enlargedOverlay.style.height = `${targetHeight}px`;
  }
};

const lockScroll = () => {
  if (scrollLockedRef) return;
  scrollLockedRef = true;
  document.body.classList.add('dg-scroll-lock');
};

const unlockScroll = () => {
  if (!scrollLockedRef) return;
  if (rootRef.value?.getAttribute('data-enlarging') === 'true') return;
  scrollLockedRef = false;
  document.body.classList.remove('dg-scroll-lock');
};

const stopInertia = () => {
  if (inertiaRAF !== null) {
    cancelAnimationFrame(inertiaRAF);
    inertiaRAF = null;
  }
};

const startInertia = (vx: number, vy: number) => {
  const MAX_V = 1.4;
  let vX = clamp(vx, -MAX_V, MAX_V) * 80;
  let vY = clamp(vy, -MAX_V, MAX_V) * 80;
  let frames = 0;
  const d = clamp(props.dragDampening ?? 0.6, 0, 1);
  const frictionMul = 0.94 + 0.055 * d;
  const stopThreshold = 0.015 - 0.01 * d;
  const maxFrames = Math.round(90 + 270 * d);
  const step = () => {
    vX *= frictionMul;
    vY *= frictionMul;
    if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
      inertiaRAF = null;
      return;
    }
    if (++frames > maxFrames) {
      inertiaRAF = null;
      return;
    }
    const nextX = clamp(rotationRef.x - vY / 200, -props.maxVerticalRotationDeg, props.maxVerticalRotationDeg);
    const nextY = wrapAngleSigned(rotationRef.y + vX / 200);
    rotationRef.x = nextX;
    rotationRef.y = nextY;
    applyTransform(nextX, nextY);
    inertiaRAF = requestAnimationFrame(step);
  };
  stopInertia();
  inertiaRAF = requestAnimationFrame(step);
};

const onDragStart = (e: MouseEvent | TouchEvent) => {
  if (focusedElRef) return;
  stopInertia();
  draggingRef = true;
  movedRef = false;
  startRotRef.x = rotationRef.x;
  startRotRef.y = rotationRef.y;
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  startPosRef = { x: clientX, y: clientY };
};

const onDragMove = (e: MouseEvent | TouchEvent) => {
  if (focusedElRef || !draggingRef || !startPosRef) return;
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  const dxTotal = clientX - startPosRef.x;
  const dyTotal = clientY - startPosRef.y;
  if (!movedRef && dxTotal * dxTotal + dyTotal * dyTotal > 16) movedRef = true;
  const nextX = clamp(
    startRotRef.x - dyTotal / props.dragSensitivity,
    -props.maxVerticalRotationDeg,
    props.maxVerticalRotationDeg
  );
  const nextY = wrapAngleSigned(startRotRef.y + dxTotal / props.dragSensitivity);
  if (rotationRef.x !== nextX || rotationRef.y !== nextY) {
    rotationRef.x = nextX;
    rotationRef.y = nextY;
    applyTransform(nextX, nextY);
  }
};

const onDragEnd = (e: MouseEvent | TouchEvent) => {
  if (!draggingRef) return;
  draggingRef = false;
  if (movedRef && startPosRef) {
    const clientX = 'changedTouches' in e ? (e.changedTouches[0]?.clientX ?? 0) : e.clientX;
    const clientY = 'changedTouches' in e ? (e.changedTouches[0]?.clientY ?? 0) : e.clientY;
    const vx = clamp(((clientX - startPosRef.x) / props.dragSensitivity) * 0.02, -1.2, 1.2);
    const vy = clamp(((clientY - startPosRef.y) / props.dragSensitivity) * 0.02, -1.2, 1.2);
    if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) startInertia(vx, vy);
    suppressClickUntil = performance.now() + 150;
  }
  movedRef = false;
};

const openItemFromElement = (el: HTMLElement) => {
  if (openingRef) return;
  openingRef = true;
  openStartedAtRef = performance.now();
  lockScroll();

  const parent = el.parentElement;
  if (!parent) {
    openingRef = false;
    unlockScroll();
    return;
  }

  focusedElRef = el;
  el.setAttribute('data-focused', 'true');

  const offsetX = getDataNumber(parent, 'offsetX', 0);
  const offsetY = getDataNumber(parent, 'offsetY', 0);
  const sizeX = getDataNumber(parent, 'sizeX', 2);
  const sizeY = getDataNumber(parent, 'sizeY', 2);

  const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, props.segments);
  const parentY = normalizeAngle(parentRot.rotateY);
  const globalY = normalizeAngle(rotationRef.y);
  let rotY = -(parentY + globalY) % 360;
  if (rotY < -180) rotY += 360;
  const rotX = -parentRot.rotateX - rotationRef.x;

  parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
  parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

  const refDiv = document.createElement('div');
  refDiv.style.cssText = `
    position: absolute;
    display: block;
    inset: 10px;
    opacity: 0;
    border-radius: var(--tile-radius, 12px);
    background: transparent;
    overflow: hidden;
    backface-visibility: hidden;
    transform: rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg) translateZ(0);
    pointer-events: none;
  `;
  parent.appendChild(refDiv);
  void refDiv.offsetHeight;

  const tileR = refDiv.getBoundingClientRect();

  if (tileR.width <= 0 || tileR.height <= 0) {
    openingRef = false;
    focusedElRef = null;
    parent.removeChild(refDiv);
    unlockScroll();
    return;
  }

  originalTilePositionRef = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
  el.style.visibility = 'hidden';
  el.style.zIndex = '0';

  const targetHeight = Math.min(window.innerHeight * 0.78, 720);
  const targetSize = {
    width: targetHeight * (4 / 5),
    height: targetHeight,
  };
  const finalLeft = (window.innerWidth - targetSize.width) / 2;
  const finalTop = (window.innerHeight - targetSize.height) / 2;

  const overlay = document.createElement('dialog');
  overlay.className = 'dg-enlarge';
  overlay.style.cssText = `
    position: fixed;
    left: ${finalLeft}px;
    top: ${finalTop}px;
    width: ${targetSize.width}px;
    height: ${targetSize.height}px;
    opacity: 1;
    z-index: 99999;
    will-change: transform, opacity;
    transform-origin: top left;
    transition: none;
    transform: translate(${tileR.left - finalLeft}px, ${tileR.top - finalTop}px) scale(${tileR.width / targetSize.width}, ${tileR.height / targetSize.height});
    border-radius: var(--enlarge-radius, 32px);
    border: 0;
    padding: 0;
    margin: 0;
    max-width: none;
    max-height: none;
    color: #fff;
    background: transparent;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
    pointer-events: auto;
  `;
  if (!document.getElementById('dg-enlarge-backdrop-style')) {
    const backdropStyle = document.createElement('style');
    backdropStyle.id = 'dg-enlarge-backdrop-style';
    backdropStyle.textContent = '.dg-enlarge::backdrop { background: transparent; }';
    document.head.appendChild(backdropStyle);
  }
  overlay.addEventListener('click', event => {
    if (event.target === overlay) closeEnlargedImage();
  });
  overlay.addEventListener('cancel', event => {
    event.preventDefault();
    closeEnlargedImage();
  });

  const rawSrc = parent.dataset['src'] ?? el.querySelector('img')?.src ?? '';
  const title = parent.dataset['title'] ?? parent.dataset['alt'] ?? 'Poster';
  const img = document.createElement('img');
  img.src = rawSrc;
  img.style.cssText = `width:100%;height:100%;object-fit:cover;filter:${props.grayscale ? 'grayscale(1)' : 'none'};`;
  overlay.appendChild(img);
  const caption = document.createElement('div');
  caption.textContent = title;
  caption.style.cssText = 'position:absolute;left:0;right:0;bottom:0;padding:42px 20px 16px;color:#fff;font:500 12px/1.4 "JetBrains Mono",monospace;letter-spacing:.12em;text-transform:uppercase;background:linear-gradient(transparent,rgba(0,0,0,.85));pointer-events:none;';
  overlay.appendChild(caption);

  const videoUrl = parent.dataset['videoUrl'];
  if (videoUrl) {
    const videoButton = document.createElement('button');
    videoButton.type = 'button';
    videoButton.textContent = '▶  Guarda il processo';
    videoButton.setAttribute('aria-label', `Guarda il video di processo: ${title}`);
    videoButton.style.cssText = 'position:absolute;right:16px;bottom:16px;z-index:2;padding:10px 12px;border:1px solid rgba(255,255,255,.65);background:rgba(0,0,0,.72);color:#fff;font:500 10px/1.2 "JetBrains Mono",monospace;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;pointer-events:auto;';
    const stopGalleryDrag = (event: Event) => event.stopPropagation();
    videoButton.addEventListener('pointerdown', stopGalleryDrag);
    videoButton.addEventListener('mousedown', stopGalleryDrag);
    videoButton.addEventListener('touchstart', stopGalleryDrag, { passive: true });
    videoButton.addEventListener('click', event => {
      event.stopPropagation();
      const currentVideo = overlay.querySelector('video');
      if (currentVideo) {
        currentVideo.pause();
        currentVideo.remove();
        img.style.display = '';
        videoButton.textContent = '▶  Guarda il processo';
        videoButton.setAttribute('aria-label', `Guarda il video di processo: ${title}`);
        return;
      }

      const video = document.createElement('video');
      video.src = videoUrl;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('aria-label', `Video di processo: ${title}`);
      video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000;';
      img.style.display = 'none';
      overlay.insertBefore(video, caption);
      videoButton.textContent = '↩  Torna al poster';
      videoButton.setAttribute('aria-label', `Torna al poster: ${title}`);
      void video.play().catch(() => {});
    });
    overlay.appendChild(videoButton);
  }
  document.body.appendChild(overlay);
  overlay.showModal();
  enlargedOverlayRef = overlay;
  requestAnimationFrame(() => {
    if (!overlay.isConnected) return;
    overlay.style.transition = `transform ${props.enlargeTransitionMs}ms cubic-bezier(.2,.8,.2,1), opacity ${props.enlargeTransitionMs}ms ease`;
    void overlay.offsetWidth;
    overlay.style.opacity = '1';
    overlay.style.transform = 'translate(0, 0) scale(1, 1)';
  });
  rootRef.value?.setAttribute('data-enlarging', 'true');
  isEnlarging.value = true;
};

const closeEnlargedImage = () => {
  if (performance.now() - openStartedAtRef < 250) return;
  const el = focusedElRef;
  if (!el) return;
  const parent = el.parentElement;
  const overlay = enlargedOverlayRef;
  if (!overlay || !parent) return;

  const refDiv = Array.from(parent.children).find(c => (c as HTMLElement).style?.opacity === '0' && c !== el) as
    | HTMLElement
    | undefined;

  const originalPos = originalTilePositionRef;

  if (!originalPos) {
    overlay.remove();
    enlargedOverlayRef = null;
    if (refDiv) refDiv.remove();
    parent.style.setProperty('--rot-y-delta', '0deg');
    parent.style.setProperty('--rot-x-delta', '0deg');
    el.style.visibility = '';
    el.style.zIndex = '0';
    focusedElRef = null;
    rootRef.value?.removeAttribute('data-enlarging');
    isEnlarging.value = false;
    openingRef = false;
    unlockScroll();
    return;
  }

  const currentRect = overlay.getBoundingClientRect();
  const rootRect = rootRef.value?.getBoundingClientRect();
  if (!rootRect) return;

  const origRel = {
    left: originalPos.left - rootRect.left,
    top: originalPos.top - rootRect.top,
    width: originalPos.width,
    height: originalPos.height
  };
  const overlayRel = {
    left: currentRect.left - rootRect.left,
    top: currentRect.top - rootRect.top,
    width: currentRect.width,
    height: currentRect.height
  };

  const animOverlay = document.createElement('div');
  animOverlay.style.cssText = `
    position: absolute;
    left: ${overlayRel.left}px;
    top: ${overlayRel.top}px;
    width: ${overlayRel.width}px;
    height: ${overlayRel.height}px;
    z-index: 9999;
    border-radius: var(--enlarge-radius, 32px);
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    transition: all ${props.enlargeTransitionMs}ms ease-out;
    pointer-events: none;
    margin: 0;
    transform: none;
  `;
  const activeVideo = overlay.querySelector('video');
  activeVideo?.pause();
  activeVideo?.remove();
  const origImg = overlay.querySelector('img');
  if (origImg) {
    const imgClone = origImg.cloneNode() as HTMLImageElement;
    imgClone.style.cssText = 'width:100%;height:100%;object-fit:cover;filter:var(--image-filter,none);';
    animOverlay.appendChild(imgClone);
  }

  if (overlay instanceof HTMLDialogElement && overlay.open) overlay.close();
  overlay.remove();
  enlargedOverlayRef = null;
  rootRef.value?.removeAttribute('data-enlarging');
  isEnlarging.value = false;
  rootRef.value?.appendChild(animOverlay);
  void animOverlay.getBoundingClientRect();

  requestAnimationFrame(() => {
    animOverlay.style.left = `${origRel.left}px`;
    animOverlay.style.top = `${origRel.top}px`;
    animOverlay.style.width = `${origRel.width}px`;
    animOverlay.style.height = `${origRel.height}px`;
    animOverlay.style.opacity = '0';
  });

  const cleanup = () => {
    animOverlay.remove();
    originalTilePositionRef = null;
    if (refDiv) refDiv.remove();
    parent.style.transition = 'none';
    el.style.transition = 'none';
    parent.style.setProperty('--rot-y-delta', '0deg');
    parent.style.setProperty('--rot-x-delta', '0deg');
    requestAnimationFrame(() => {
      el.style.visibility = '';
      el.style.opacity = '0';
      el.style.zIndex = '0';
      focusedElRef = null;
      requestAnimationFrame(() => {
        parent.style.transition = 'transform 300ms';
        el.style.transition = 'opacity 300ms ease-out';
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          setTimeout(() => {
            el.style.transition = '';
            el.style.opacity = '';
            openingRef = false;
            if (!draggingRef && rootRef.value?.getAttribute('data-enlarging') !== 'true') {
              document.body.classList.remove('dg-scroll-lock');
            }
          }, 300);
        });
      });
    });
  };

  animOverlay.addEventListener('transitionend', cleanup, { once: true });
};

const onTilePointerUp = (e: PointerEvent) => {
  if (movedRef) return;
  if (openingRef) return;
  draggingRef = false;
  openItemFromElement(e.currentTarget as HTMLElement);
};

const onTileClick = (e: MouseEvent) => {
  if (performance.now() < suppressClickUntil || movedRef || openingRef) return;
  openItemFromElement(e.currentTarget as HTMLElement);
};

const onTileKeyDown = (e: KeyboardEvent) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  if (openingRef) return;
  openItemFromElement(e.currentTarget as HTMLElement);
};

onMounted(() => {
  const root = rootRef.value;
  const main = mainRef.value;
  if (!root || !main) return;

  applyTransform(rotationRef.x, rotationRef.y);

  resizeObserver = new ResizeObserver(computeRadius);
  resizeObserver.observe(root);

  main.addEventListener('mousedown', onDragStart, { passive: true });
  main.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('mousemove', onDragMove, { passive: true });
  window.addEventListener('touchmove', onDragMove, { passive: true });
  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchend', onDragEnd);

  scrimRef.value?.addEventListener('click', closeEnlargedImage);

  keydownHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeEnlargedImage();
  };
  window.addEventListener('keydown', keydownHandler);
});

onUnmounted(() => {
  stopInertia();
  resizeObserver?.disconnect();
  const main = mainRef.value;
  if (main) {
    main.removeEventListener('mousedown', onDragStart);
    main.removeEventListener('touchstart', onDragStart);
  }
  scrimRef.value?.removeEventListener('click', closeEnlargedImage);
  window.removeEventListener('mousemove', onDragMove);
  window.removeEventListener('touchmove', onDragMove);
  window.removeEventListener('mouseup', onDragEnd);
  window.removeEventListener('touchend', onDragEnd);
  if (keydownHandler) window.removeEventListener('keydown', keydownHandler);
  enlargedOverlayRef?.remove();
  enlargedOverlayRef = null;
  document.body.classList.remove('dg-scroll-lock');
});

watch(() => props, computeRadius, {
  deep: true
});
</script>