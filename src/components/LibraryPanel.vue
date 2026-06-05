<template>
  <div class="library-panel" :class="{ 'mobile-active': isMobileActive }" id="library-panel">
    <div class="library-header">
      <span>📚 故事库</span>
      <span class="library-count">{{ store.library.length }} 篇</span>
    </div>
    <div class="library-scroll">
      <div v-if="store.library.length === 0" class="library-empty">
        还没有完成的故事<br />点击「完成」保存当前故事
      </div>
      <div
        v-for="item in store.library"
        :key="item.id"
        class="story-item"
        :class="{ active: item.id === store.activeStoryId }"
        @click="handleLoad(item.id)"
      >
        <div class="story-item-title">{{ item.title }}</div>
        <div class="story-item-meta">
          <span>{{ item.tag || '' }} · {{ item.savedAt }}</span>
          <button class="story-item-del" @click.stop="store.deleteFromLibrary(item.id)" title="删除">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStoryStore } from '@/stores/storyStore.js'

const props = defineProps({
  isMobileActive: Boolean,
})
const emit = defineEmits(['loaded'])

const store = useStoryStore()

function handleLoad(id) {
  store.loadStoryFromLibrary(id)
  emit('loaded')
}
</script>

<style scoped>
.library-panel {
  width: 220px;
  flex-shrink: 0;
  background: var(--surface);
  border-left: 1.5px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.library-header {
  padding: 12px 14px 8px;
  font-family: "ZCOOL KuaiLe", cursive;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--accent);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.library-count { font-size: 10px; color: var(--ink-2); font-family: "Noto Sans SC", sans-serif; letter-spacing: 0; }
.library-scroll { flex: 1; overflow-y: auto; padding: 8px; }
.library-scroll::-webkit-scrollbar { width: 3px; }
.library-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.library-empty { padding: 24px 12px; text-align: center; color: var(--ink-2); font-size: 12px; line-height: 2; }
.story-item {
  padding: 10px; border-radius: 7px; cursor: pointer;
  border: 1.5px solid transparent; transition: all 0.18s; margin-bottom: 5px;
}
.story-item:hover { background: var(--accent-soft); border-color: var(--accent); }
.story-item.active { background: var(--accent-soft); border-color: var(--accent); }
.story-item-title { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.story-item-meta { font-size: 10.5px; color: var(--ink-2); display: flex; justify-content: space-between; align-items: center; }
.story-item-del { background: none; border: none; color: #ccc; cursor: pointer; font-size: 11px; padding: 0 2px; line-height: 1; transition: color 0.2s; flex-shrink: 0; }
.story-item-del:hover { color: #e8636f; }

@media (max-width: 768px) {
  .library-panel { width: 100%; border-left: none; border-top: 1.5px solid var(--border); display: none; height: calc(100vh - 52px); }
  .library-panel.mobile-active { display: flex; }
}
@media (min-width: 769px) {
  .library-panel { display: flex !important; }
}
</style>
