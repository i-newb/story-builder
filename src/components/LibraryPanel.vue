<template>
  <div class="library-panel" :class="{ 'mobile-active': isMobileActive }" id="library-panel">
    <div class="library-header">
      <span>故事库</span>
      <span class="library-count">{{ store.library.length }} 篇</span>
    </div>
    <div class="library-scroll">
      <div v-if="store.library.length === 0" class="library-empty">
        还没有保存的故事<br />请先完成并保存到故事库
      </div>
      <div v-for="item in store.library" :key="item.id" class="story-item"
        :class="{ active: item.id === store.activeStoryId }">
        <div class="story-item-title">{{ item.title }}</div>
        <div class="story-item-meta">
          <span>{{ item.tag || '' }} · {{ item.savedAt }}</span>
        </div>
        <div class="story-item-actions">
          <button class="story-item-btn" @click.stop="handleEdit(item.id)">编辑</button>
          <button class="story-item-btn" @click.stop="handlePreview(item.id)">预览</button>
          <button class="story-item-del" title="删除" @click.stop="handleDelete(item.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox  } from 'element-plus';
import { deleteStory, fetchStories, fetchStoryById } from '@/api/story.js'
import { cloneStory, migrateStory, useStoryStore } from '@/stores/storyStore.js'
import { normalizeStoryLibrary, normalizeStoryPayload } from '@/utils/storyLibrary.js'

defineProps({
  isMobileActive: Boolean,
})

const emit = defineEmits(['story-edit', 'story-preview'])
const store = useStoryStore()

async function handleEdit(id) {
  await loadStoryFromLibrary(id)
  emit('story-edit')
}

async function handlePreview(id) {
  await loadStoryFromLibrary(id)
  emit('story-preview')
}

async function handleDelete(id) {
  ElMessageBox .confirm('确定要删除这篇故事吗？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await deleteStory(id)
    if (store.activeStoryId === id) store.activeStoryId = null
    await refreshLibrary()
  }).catch(() => {
    // 取消删除
  })

}

async function loadStoryFromLibrary(id) {
  const result = await fetchStoryById(id)
  store.story = migrateStory(cloneStory(normalizeStoryPayload(result)))
  store.activeStoryId = id
}

async function refreshLibrary() {
  const result = await fetchStories()
  store.library = normalizeStoryLibrary(result)
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
    border: 1.5px solid #e5aaaa;
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

  .story-item-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .story-item-btn,
  .story-item-del {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 11px;
    padding: 0 2px;
    line-height: 1;
    flex-shrink: 0;
  }

  .story-item-btn {
    color: var(--accent);
  }

  .story-item-del {
    color: #bd5962;
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
