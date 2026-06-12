<template>
  <AuthPanel v-if="auth.bootstrapped && !auth.isLoggedIn" @authenticated="handleAuthenticated" />
  <div v-else-if="auth.bootstrapped" class="app-shell">
    <TopBar
      :active-tab="activeTab"
      @tab-change="switchTab"
      @export="exportHTML"
    />
    <main class="main">
      <EditorPanel :is-mobile-active="activeTab === 'editor'" />
      <PreviewPanel :is-mobile-active="activeTab === 'preview'" />
      <LibraryPanel
        :is-mobile-active="activeTab === 'library'"
        @story-edit="onLibraryLoaded"
        @story-preview="onLibraryPreview"
      />
    </main>
  </div>
  <div v-else class="app-loading">加载中...</div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import html2canvas from 'html2canvas'
import { fetchStories } from '@/api/story.js'
import { useAuthStore } from '@/stores/authStore.js'
import { defaultStory, useStoryStore } from '@/stores/storyStore.js'
import { resetCharIdCounter } from '@/utils/index.js'
import { generateHTML } from '@/utils/htmlGenerator.js'
import { normalizeStoryLibrary } from '@/utils/storyLibrary.js'
import AuthPanel from '@/components/AuthPanel.vue'
import TopBar from '@/components/TopBar.vue'
import EditorPanel from '@/components/EditorPanel.vue'
import PreviewPanel from '@/components/PreviewPanel.vue'
import LibraryPanel from '@/components/LibraryPanel.vue'

const EXPORT_WIDTH = 480
const EXPORT_SCALE = 4
const MAX_CANVAS_PIXELS = 80_000_000

const auth = useAuthStore()
const store = useStoryStore()
const activeTab = ref('editor')
const loadedLibraryUserId = ref(null)
const libraryLoading = ref(false)

onMounted(async () => {
  const restored = await auth.restoreSession()
  if (restored) await ensureLibraryLoaded(true)
})

watch(
  () => auth.user?.id,
  async (userId, oldUserId) => {
    if (userId === oldUserId) return
    loadedLibraryUserId.value = null
    store.library = []
    if (userId) await ensureLibraryLoaded(true)
  },
)

async function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'library') await ensureLibraryLoaded()
}

function onLibraryLoaded() {
  if (window.innerWidth <= 768) switchTab('editor')
}

function onLibraryPreview() {
  switchTab('preview')
}

async function loadLibrary() {
  const result = await fetchStories()
  store.library = normalizeStoryLibrary(result)
}

async function handleAuthenticated() {
  activeTab.value = 'editor'
  store.story = defaultStory()
  store.activeStoryId = null
  resetCharIdCounter(2)
  await ensureLibraryLoaded(true)
}

async function ensureLibraryLoaded(force = false) {
  const userId = auth.user?.id
  if (!userId || libraryLoading.value) return
  if (!force && loadedLibraryUserId.value === userId) return

  libraryLoading.value = true
  try {
    await loadLibrary()
    loadedLibraryUserId.value = userId
  } finally {
    libraryLoading.value = false
  }
}

async function exportHTML() {
  const html = generateHTML(store.story)
  const filename = `${sanitizeFilename(store.story.title || 'story')}.png`

  const iframe = document.createElement('iframe')
  iframe.style.cssText = `position:fixed;left:-9999px;top:0;width:${EXPORT_WIDTH}px;height:0;border:none;visibility:hidden`
  document.body.appendChild(iframe)

  try {
    await new Promise(resolve => {
      iframe.onload = resolve
      iframe.srcdoc = html
    })

    const iframeDoc = iframe.contentDocument
    const iframeWin = iframe.contentWindow

    iframeDoc.querySelectorAll('.fade-in').forEach(element => {
      element.classList.add('visible')
      element.style.opacity = '1'
      element.style.transform = 'none'
      element.style.transition = 'none'
    })

    await Promise.all([
      iframeDoc.fonts?.ready ?? Promise.resolve(),
      ...Array.from(iframeDoc.images).map(image =>
        image.complete ? Promise.resolve() : new Promise(resolve => {
          image.onload = resolve
          image.onerror = resolve
        }),
      ),
    ])

    const body = iframeDoc.body
    const fullHeight = Math.max(body.scrollHeight, body.offsetHeight)
    const exportScale = getExportScale(fullHeight)
    iframe.style.height = `${fullHeight}px`

    await new Promise(resolve => iframeWin.requestAnimationFrame(() => iframeWin.requestAnimationFrame(resolve)))

    const canvas = await html2canvas(body, {
      useCORS: true,
      allowTaint: false,
      scale: exportScale,
      width: EXPORT_WIDTH,
      height: fullHeight,
      windowWidth: EXPORT_WIDTH,
      windowHeight: fullHeight,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: null,
      ignoreElements: element => {
        const className = String(element.className || '')
        return className.includes('toc') || element.id === 'sto' || className.includes('status')
      },
    })

    await downloadCanvas(canvas, filename)
  } finally {
    document.body.removeChild(iframe)
  }
}

function getExportScale(fullHeight) {
  const maxScale = Math.sqrt(MAX_CANVAS_PIXELS / (EXPORT_WIDTH * fullHeight))
  return Math.max(1, Math.min(EXPORT_SCALE, maxScale))
}

function sanitizeFilename(value) {
  return String(value).trim().replace(/[\\/:*?"<>|]/g, '_') || 'story'
}

function downloadCanvas(canvas, filename) {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (!blob) {
        const fallbackLink = document.createElement('a')
        fallbackLink.href = canvas.toDataURL('image/png')
        fallbackLink.download = filename
        fallbackLink.click()
        resolve()
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      resolve()
    }, 'image/png')
  })
}
</script>

<style scoped lang="scss">
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  color: var(--ink-2);
  background: var(--bg);
}

@media (max-width: 768px) {
  .main {
    flex-direction: column;
    position: relative;
  }
}
</style>
