<template>
  <div style="display:flex;flex-direction:column;height:100vh;overflow:hidden">
    <TopBar :active-tab="activeTab" @tab-change="switchTab" @export="exportHTML" @refresh-preview="refreshTrigger++" />
    <div class="main">
      <EditorPanel :is-mobile-active="activeTab === 'editor'" />
      <PreviewPanel :is-mobile-active="activeTab === 'preview'" :refresh-trigger="refreshTrigger" />
      <LibraryPanel :is-mobile-active="activeTab === 'library'" @loaded="onLibraryLoaded" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStoryStore } from '@/stores/storyStore.js'
import { generateHTML } from '@/utils/htmlGenerator.js'
import TopBar from '@/components/TopBar.vue'
import EditorPanel from '@/components/EditorPanel.vue'
import PreviewPanel from '@/components/PreviewPanel.vue'
import LibraryPanel from '@/components/LibraryPanel.vue'
import html2canvas from 'html2canvas'

const store = useStoryStore()
const activeTab = ref('editor')
const refreshTrigger = ref(0)

onMounted(() => {
  store.load()
})

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'preview') refreshTrigger.value++
}

function onLibraryLoaded() {
  if (window.innerWidth <= 768) switchTab('editor')
}

async function exportHTML() {
  const html = generateHTML(store.story)
  const filename = (store.story.title || 'story') + '.jpg'

  // 创建隐藏 iframe 用于完整渲染
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:480px;height:0;border:none;visibility:hidden'
  document.body.appendChild(iframe)

  await new Promise(resolve => {
    iframe.onload = resolve
    iframe.srcdoc = html
  })

  // 等待 iframe 内图片/字体加载完成
  const iframeDoc = iframe.contentDocument
  const iframeWin = iframe.contentWindow

  // ✅ 修复1：强制所有 fade-in 元素直接显示，跳过 IntersectionObserver
  iframeDoc.querySelectorAll('.fade-in').forEach(el => {
    el.classList.add('visible')
    el.style.opacity = '1'
    el.style.transform = 'none'
    el.style.transition = 'none'
  })

  // ✅ 修复2：等待字体 + 图片加载完成
  await Promise.all([
    iframeDoc.fonts?.ready ?? Promise.resolve(),
    ...Array.from(iframeDoc.images).map(img =>
      img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r })
    ),
  ])

  // 撑开 iframe 到内容完整高度
  const body = iframeDoc.body
  const fullHeight = Math.max(body.scrollHeight, body.offsetHeight)
  iframe.style.height = fullHeight + 'px'

  // 等一帧确保重排完成
  await new Promise(r => iframeWin.requestAnimationFrame(() => iframeWin.requestAnimationFrame(r)))

  const canvas = await html2canvas(body, {
    useCORS: true,
    allowTaint: false,
    scale: 2,           // 2x 清晰度
    width: 480,
    height: fullHeight,
    windowWidth: 480,
    windowHeight: fullHeight,
    scrollX: 0,
    scrollY: 0,
    // ✅ 修复3：告诉 html2canvas 忽略固定定位元素（目录、回顶部按钮）
    ignoreElements: el => {
      const cls = el.className || ''
      return cls.includes('toc') || el.id === 'sto' || cls.includes('status')
    },
  })

  document.body.removeChild(iframe)

  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/jpeg', 0.92)
  a.download = filename
  a.click()
}
</script>

<style scoped>
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
