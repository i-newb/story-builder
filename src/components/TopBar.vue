<template>
  <header class="topbar">
    <div class="topbar-logo">故事生成器</div>

    <el-segmented
      class="topbar-tabs"
      :model-value="activeTab"
      :options="tabs"
      size="small"
      @update:model-value="$emit('tab-change', $event)"
    />

    <div class="topbar-actions">
      <el-button size="small" @click="handleNew">新建</el-button>
      <el-button size="small" @click="$emit('export')">导出</el-button>
      <el-button size="small" type="primary" @click="$emit('refresh-preview')">刷新预览</el-button>
    </div>
  </header>
</template>

<script setup>
import { useStoryStore } from '@/stores/storyStore.js'

defineProps({
  activeTab: String,
})

defineEmits(['tab-change', 'export', 'refresh-preview'])

const store = useStoryStore()

const tabs = [
  { label: '编辑', value: 'editor' },
  { label: '预览', value: 'preview' },
  { label: '故事库', value: 'library' },
]

function handleNew() {
  store.newStory()
}
</script>

<style scoped lang="scss">
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
  flex-shrink: 0;
}

.topbar-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 720px) {
  .topbar {
    padding: 0 10px;
    gap: 8px;
  }

  .topbar-logo {
    font-size: 16px;
    letter-spacing: 1px;
  }

  .topbar-actions {
    gap: 4px;

    .el-button {
      padding: 5px 8px;
    }
  }
}

@media (max-width: 560px) {
  .topbar-logo {
    display: none;
  }

  .topbar {
    justify-content: center;
  }
}
</style>
