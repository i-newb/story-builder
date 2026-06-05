<template>
  <div class="topbar">
    <div class="topbar-logo">故事生成器</div>
    <div class="topbar-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="$emit('tab-change', tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="topbar-actions">
      <button class="btn btn-ghost" @click="handleNew">＋ 新建</button>
      <button class="btn btn-ghost" @click="$emit('export')">⬇ 导出</button>
      <button class="btn btn-primary" @click="$emit('refresh-preview')">刷新预览</button>
    </div>
  </div>
</template>

<script setup>
import { useStoryStore } from '@/stores/storyStore.js'

const props = defineProps({
  activeTab: String,
})
const emit = defineEmits(['tab-change', 'export', 'refresh-preview'])

const store = useStoryStore()

const tabs = [
  { id: 'editor', label: '✏️ 编辑' },
  { id: 'preview', label: '👁 预览' },
  { id: 'library', label: '📚 故事库' },
]

function handleNew() {
  store.newStory()
}
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 52px;
  background: var(--surface);
  border-bottom: 1.5px solid var(--border);
  flex-shrink: 0;
  gap: 16px;
}
.topbar-logo {
  font-family: "Ma Shan Zheng", cursive;
  font-size: 20px;
  color: var(--accent);
  letter-spacing: 3px;
  flex-shrink: 0;
}
.topbar-tabs {
  display: flex;
  gap: 4px;
}
.tab-btn {
  padding: 5px 16px;
  border-radius: 6px;
  border: 1.5px solid transparent;
  font-size: 13px;
  cursor: pointer;
  font-family: "ZCOOL KuaiLe", cursive;
  letter-spacing: 1px;
  transition: all 0.2s;
  background: none;
  color: var(--ink-2);
}
.tab-btn.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}
.tab-btn:hover:not(.active) {
  background: var(--bg);
}
.topbar-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .topbar { padding: 0 10px; gap: 8px; }
  .topbar-logo { font-size: 15px; letter-spacing: 1px; }
  .topbar-actions { gap: 5px; }
  .tab-btn { padding: 5px 10px; font-size: 12px; }
}
</style>
