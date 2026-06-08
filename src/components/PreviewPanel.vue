<template>
  <div class="preview-panel" :class="{ 'mobile-active': isMobileActive }" id="preview-panel">
    <div class="preview-label">预览（480px 手机宽度）</div>
    <div class="preview-frame-wrap">
      <iframe ref="frameRef" id="preview-frame" sandbox="allow-scripts allow-same-origin"></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useStoryStore } from '@/stores/storyStore.js'
import { generateHTML } from '@/utils/htmlGenerator.js'

const props = defineProps({
  isMobileActive: Boolean,
  refreshTrigger: Number,
})

const store = useStoryStore()
const frameRef = ref(null)
let previewDebounce = null
let savedScrollTop = 0

function renderPreview() {
  clearTimeout(previewDebounce)
  previewDebounce = setTimeout(() => {
    const newHtml = generateHTML(store.story)
    const frame = frameRef.value
    if (!frame) return
    try {
      if (frame.contentWindow && frame.contentDocument?.documentElement) {
        savedScrollTop = frame.contentWindow.scrollY || 0
      }
    } catch (e) { }
    frame.onload = () => {
      try {
        if (savedScrollTop > 0) frame.contentWindow.scrollTo(0, savedScrollTop)
      } catch (e) { }
      frame.onload = null
    }
    frame.srcdoc = newHtml
  }, 300)
}

// Watch story changes
watch(() => store.story, (val) => {
  renderPreview()
}, { deep: true })

// Watch manual refresh trigger
watch(() => props.refreshTrigger, (val) => {
  
})

onMounted(() => {
  renderPreview()
})

defineExpose({ renderPreview })
</script>

<style scoped>
  .preview-panel {
    flex: 1;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
  }

  .preview-label {
    padding: 8px 0 4px;
    font-size: 11px;
    color: var(--ink-2);
    letter-spacing: 1px;
    flex-shrink: 0;
    font-family: "ZCOOL KuaiLe", cursive;
  }

  .preview-frame-wrap {
    flex: 1;
    overflow-y: auto;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 0 12px 12px;
  }

  #preview-frame {
    width: 480px;
    min-width: 480px;
    border: none;
    border-radius: 8px;
    height: 100%;
    min-height: 500px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    background: #fff;
  }

  @media (max-width: 768px) {
    .preview-panel {
      width: 100%;
      display: none;
      height: calc(100vh - 52px);
    }

    .preview-panel.mobile-active {
      display: flex;
    }

    #preview-frame {
      width: calc(100vw - 24px);
      min-width: unset;
    }

    .preview-frame-wrap {
      padding: 12px 0;
    }
  }

  @media (min-width: 769px) {
    .preview-panel {
      display: flex !important;
    }
  }
</style>
