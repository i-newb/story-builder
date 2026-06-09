<template>
  <div class="app-shell">
    <TopBar
      :active-tab="activeTab"
      @tab-change="switchTab"
      @export="exportHTML"
      @refresh-preview="refreshTrigger++"
    />
    <main class="main">
      <EditorPanel :is-mobile-active="activeTab === 'editor'" />
      <PreviewPanel :is-mobile-active="activeTab === 'preview'" :refresh-trigger="refreshTrigger" />
      <LibraryPanel :is-mobile-active="activeTab === 'library'" @loaded="onLibraryLoaded" />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import html2canvas from 'html2canvas'
import { useStoryStore } from '@/stores/storyStore.js'
import { generateHTML } from '@/utils/htmlGenerator.js'
import TopBar from '@/components/TopBar.vue'
import EditorPanel from '@/components/EditorPanel.vue'
import PreviewPanel from '@/components/PreviewPanel.vue'
import LibraryPanel from '@/components/LibraryPanel.vue'

const store = useStoryStore()
const activeTab = ref('editor')
const refreshTrigger = ref(0)

onMounted(() => {
  store.load()
})

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'preview') refreshTrigger.value += 1
}

function onLibraryLoaded() {
  if (window.innerWidth <= 768) switchTab('editor')
}

async function exportHTML() {
  const html = generateHTML(store.story)
  const filename = `${store.story.title || 'story'}.jpg`

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:480px;height:0;border:none;visibility:hidden'
  document.body.appendChild(iframe)

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
  iframe.style.height = `${fullHeight}px`

  await new Promise(resolve => iframeWin.requestAnimationFrame(() => iframeWin.requestAnimationFrame(resolve)))

  const canvas = await html2canvas(body, {
    useCORS: true,
    allowTaint: false,
    scale: 2,
    width: 480,
    height: fullHeight,
    windowWidth: 480,
    windowHeight: fullHeight,
    scrollX: 0,
    scrollY: 0,
    ignoreElements: element => {
      const className = String(element.className || '')
      return className.includes('toc') || element.id === 'sto' || className.includes('status')
    },
  })

  document.body.removeChild(iframe)

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/jpeg', 0.92)
  link.download = filename
  link.click()
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

@media (max-width: 768px) {
  .main {
    flex-direction: column;
    position: relative;
  }
}
</style>
