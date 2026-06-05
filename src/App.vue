<template>
  <div style="display:flex;flex-direction:column;height:100vh;overflow:hidden">
    <TopBar
      :active-tab="activeTab"
      @tab-change="switchTab"
      @export="exportHTML"
      @refresh-preview="refreshTrigger++"
    />
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

function exportHTML() {
  const html = generateHTML(store.story)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = (store.story.title || 'story') + '.html'
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<style scoped>
.main {
  display: flex;
  flex: 1;
  overflow: hidden;
}
@media (max-width: 768px) {
  .main { flex-direction: column; position: relative; }
}
</style>
