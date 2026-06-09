<template>
  <div class="library-panel" :class="{ 'mobile-active': isMobileActive }" id="library-panel">
    <div class="library-header">
      <span>故事库</span>
      <span class="library-count">{{ store.library.length }} 篇</span>
    </div>
    <div class="library-scroll">
      <div v-if="store.library.length === 0" class="library-empty">
        还没有保存的故事<br />点击“完成，保存到故事库”保存当前内容
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
          <button class="story-item-del" title="删除" @click.stop="store.deleteFromLibrary(item.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStoryStore } from '@/stores/storyStore.js'

defineProps({
  isMobileActive: Boolean,
})

const emit = defineEmits(['loaded'])
const store = useStoryStore()

function handleLoad(id) {
  store.loadStoryFromLibrary(id)
  emit('loaded')
}
</script>

<style scoped lang="scss">
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

.library-count {
  font-size: 10px;
  color: var(--ink-2);
  font-family: "Noto Sans SC", sans-serif;
  letter-spacing: 0;
}

.library-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.library-empty {
  padding: 24px 12px;
  text-align: center;
  color: var(--ink-2);
  font-size: 12px;
  line-height: 2;
}

.story-item {
  padding: 10px;
  border-radius: 7px;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.18s;
  margin-bottom: 5px;

  &:hover,
  &.active {
    background: var(--accent-soft);
    border-color: var(--accent);
  }
}

.story-item-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.story-item-meta {
  font-size: 10.5px;
  color: var(--ink-2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.story-item-del {
  background: none;
  border: none;
  color: #bd5962;
  cursor: pointer;
  font-size: 11px;
  padding: 0 2px;
  line-height: 1;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .library-panel {
    width: 100%;
    border-left: none;
    border-top: 1.5px solid var(--border);
    display: none;
    height: calc(100vh - 52px);

    &.mobile-active {
      display: flex;
    }
  }
}

@media (min-width: 769px) {
  .library-panel {
    display: flex !important;
  }
}
</style>
