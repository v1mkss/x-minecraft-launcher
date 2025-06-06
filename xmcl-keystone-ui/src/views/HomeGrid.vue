<template>
  <GridLayout
    class="z-1"
    :layout.sync="layout"
    :responsive-layouts="layouts"
    :is-draggable="true"
    :cols="cols"
    :col-num="12"
    :row-height="32"
    :is-resizable="true"
    :responsive="true"
    :vertical-compact="true"
    :use-css-transforms="true"
    @breakpoint-changed="onBreakpoint"
  >
    <GridItem
      v-for="item in layout"
      :key="item.i"
      :x="item.x"
      :y="item.y"
      :w="item.w"
      :h="item.h"
      :min-w="item.minW"
      :min-h="item.minH"
      :i="item.i"
      drag-allow-from=".v-card__title"
      drag-ignore-from=".no-drag"
      :class="{ 'screenshot-item': Number(item.i) === CardType.Screenshots }"
      @container-resized="onResized"
      @resized="onResized"
    >
      <HomeModCard
        v-if="isType(item.i, CardType.Mod)"
        :row-count="modRowCount"
        :row="item.h - 4"
      />
      <HomeResourcePacksCard
        v-else-if="isType(item.i, CardType.ResourcePack)"
        :row-count="resourcePackRowCount"
        :row="item.h - 4"
      />
      <HomeShaderPackCard
        v-else-if="isType(item.i, CardType.ShaderPack)"
      />
      <HomeSavesCard
        v-else-if="isType(item.i, CardType.Save)"
        :row-count="saveRowCount"
        :row="item.h - 4"
      />
      <HomeScreenshotCard
        v-else-if="isType(item.i, CardType.Screenshots)"
        :width="item.w"
        :height="screenshotHeight"
        :instance="instance"
      />
    </GridItem>
  </GridLayout>
</template>
<script lang="ts" setup>
import { useLocalStorageCache } from '@/composables/cache'
import { kInstance } from '@/composables/instance'
import { kUpstream } from '@/composables/instanceUpdate'
import { injection } from '@/util/inject'
import debounce from 'lodash.debounce'
import { GridItem, GridLayout } from 'vue-grid-layout'
import HomeModCard from './HomeModCard.vue'
import HomeResourcePacksCard from './HomeResourcePacksCard.vue'
import HomeSavesCard from './HomeSavesCard.vue'
import HomeScreenshotCard from './HomeScreenshotCard.vue'
import HomeShaderPackCard from './HomeShaderPackCard.vue'

const { instance } = injection(kInstance)

enum CardType {
  Mod,
  ResourcePack,
  ShaderPack,
  Save,
  Screenshots,
}

provide(kUpstream, computed(() => ({ upstream: instance.value.upstream, minecraft: instance.value.runtime.minecraft })))

function rawType(type: CardType) {
  return type + ''
}

function isType(id: string, type: CardType) {
  const [typeString, param] = id.split('@')
  return Number(typeString) === type
}

interface GridItemType {
  x: number
  y: number
  w: number
  h: number
  i: string
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

const cols = { lg: 12, md: 12, sm: 6, xs: 4, xxs: 4 }

const layouts = useLocalStorageCache('cardsLayout', () => ({
  md: [
    { x: 0, y: 0, w: 3, h: 9, minW: 2, minH: 4, i: rawType(CardType.Mod) },
    { x: 9, y: 0, w: 3, h: 9, minW: 2, minH: 4, i: rawType(CardType.ResourcePack) },
    { x: 3, y: 0, w: 3, h: 4, minW: 2, minH: 4, i: rawType(CardType.Save) },
    { x: 6, y: 0, w: 3, h: 4, minW: 2, minH: 4, i: rawType(CardType.ShaderPack) },
    { x: 3, y: 4, w: 6, h: 5, minW: 3, minH: 4, i: rawType(CardType.Screenshots) },
  ],
  lg: [
    { x: 0, y: 0, w: 3, h: 9, minW: 2, minH: 4, i: rawType(CardType.Mod) },
    { x: 9, y: 0, w: 3, h: 9, minW: 2, minH: 4, i: rawType(CardType.ResourcePack) },
    { x: 3, y: 0, w: 3, h: 4, minW: 2, minH: 4, i: rawType(CardType.Save) },
    { x: 6, y: 0, w: 3, h: 4, minW: 2, minH: 4, i: rawType(CardType.ShaderPack) },
    { x: 3, y: 4, w: 6, h: 5, minW: 3, minH: 4, i: rawType(CardType.Screenshots) },
  ],
  sm: [
    { x: 0, y: 0, w: 2, h: 6, minW: 2, minH: 4, i: rawType(CardType.Mod) },
    { x: 2, y: 0, w: 2, h: 5, minW: 2, minH: 4, i: rawType(CardType.ResourcePack) },
    { x: 2, y: 5, w: 2, h: 5, minW: 2, minH: 4, i: rawType(CardType.ShaderPack) },
    { x: 0, y: 6, w: 2, h: 4, minW: 2, minH: 4, i: rawType(CardType.Save) },
    { x: 4, y: 0, w: 2, h: 10, minW: 2, minH: 4, i: rawType(CardType.Screenshots) },
  ],
  xs: [
    { x: 0, y: 0, w: 2, h: 6, minW: 2, minH: 4, i: rawType(CardType.Mod) },
    { x: 2, y: 4, w: 2, h: 4, minW: 2, minH: 4, i: rawType(CardType.Save) },
    { x: 0, y: 6, w: 2, h: 6, minW: 2, minH: 4, i: rawType(CardType.ResourcePack) },
    { x: 2, y: 0, w: 2, h: 4, minW: 2, minH: 4, i: rawType(CardType.ShaderPack) },
    { x: 2, y: 8, w: 2, h: 4, minW: 1, minH: 4, i: rawType(CardType.Screenshots) },
  ],
}), JSON.stringify, JSON.parse)

const layout = ref([] as GridItemType[])

let lastBreakpoint = ''

const onBreakpoint = (newBreakpoint: string) => {
  if (lastBreakpoint) {
    layouts.value[lastBreakpoint] = layout.value
    localStorage.setItem('cardsLayout', JSON.stringify(layouts.value))
  }
  lastBreakpoint = newBreakpoint
}

const containerWidths = reactive({
  [CardType.Mod]: 0,
  [CardType.ResourcePack]: 0,
  [CardType.Save]: 0,
  [CardType.ShaderPack]: 0,
} as Record<string, number>)

const screenshotHeight = ref(0)

const saveLayouts = debounce(() => {
  localStorage.setItem('cardsLayout', JSON.stringify(layouts.value))
}, 500)

let screenshotItem = undefined as undefined | HTMLElement

const onResized = (i: string, newH: number, newW: number, newHPx: number, newWPx: number) => {
  containerWidths[i] = newWPx
  if (Number(i) === CardType.Screenshots) {
    if (!screenshotItem) {
      screenshotItem = document.getElementsByClassName('screenshot-item').item(0) as HTMLElement
    }
    if (screenshotItem) {
      nextTick().then(() => {
        const h = screenshotItem!.style.height
        screenshotHeight.value = Number(h.substring(0, h.length - 2))
      })
    } else {
      screenshotHeight.value = Number(newHPx)
    }
  }
  layouts.value[lastBreakpoint] = layout.value
  saveLayouts()
}

const getRowCount = (width: number) => width ? Math.floor((width - 34) / 30) : 7
const resourcePackRowCount = computed(() => getRowCount(containerWidths[CardType.ResourcePack]))
const modRowCount = computed(() => getRowCount(containerWidths[CardType.Mod]))
const saveRowCount = computed(() => getRowCount(containerWidths[CardType.Save]))
</script>


<style scoped>
.vue-grid-layout {
  padding: 0 4px;
}

.vue-grid-item:not(.vue-grid-placeholder) {
    /* background: #ccc; */
}

.vue-grid-placeholder {
  background: var(--color-primary);
}
.vue-grid-item .resizing {
    opacity: 0.9;
}
.vue-draggable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 0;
    left: 0;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='5' fill='#FFFFFF'/></svg>") no-repeat;
    background-position: bottom right;
    padding: 0 8px 8px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: pointer;
}
</style>
