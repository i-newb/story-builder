<template>
  <header class="topbar">
    <div class="topbar-logo">故事生成器</div>

    <el-segmented class="topbar-tabs" :model-value="activeTab" :options="tabs" size="small"
      @update:model-value="$emit('tab-change', $event)" />

    <div class="topbar-actions">
      <el-button size="small" @click="handleNew">新建</el-button>
      <el-button size="small" @click="$emit('export')">导出</el-button>
      <el-dropdown trigger="click" placement="bottom-end">
        <button class="avatar-button" type="button" title="用户菜单">
          <span class="avatar-face">
            <span class="avatar-head"></span>
            <span class="avatar-body"></span>
          </span>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <div class="topbar-user">{{ auth.user?.username }}</div>
            <el-dropdown-item @click="handleLogout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { defaultStory, useStoryStore } from '@/stores/storyStore.js'
import { useAuthStore } from '@/stores/authStore.js'
import { resetCharIdCounter } from '@/utils/index.js'

defineProps({
  activeTab: String,
})

defineEmits(['tab-change', 'export'])

const store = useStoryStore()
const auth = useAuthStore()

const tabs = [
  { label: '编辑', value: 'editor' },
  { label: '预览', value: 'preview' },
  { label: '故事库', value: 'library' },
]

function handleNew() {
  if (!confirm('新建故事会清空当前编辑内容，确认继续？')) return
  store.story = defaultStory()
  store.activeStoryId = null
  resetCharIdCounter(2)
}

function handleLogout() {
  auth.clearSession()
  store.story = defaultStory()
  store.library = []
  store.activeStoryId = null
  resetCharIdCounter(2)
}
</script>

<style scoped lang="scss">
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px 0 24px;
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
    align-items: center;
    margin-left: auto;
    gap: 8px;
    flex-shrink: 0;
  }

  .topbar-user {
    max-width: 160px;
    padding: 8px 14px 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    color: var(--ink-2);
    line-height: 1.4;
    border-bottom: 1px solid var(--border);
  }

  .avatar-button {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1.5px solid var(--border);
    border-radius: 50%;
    background: #fffaf7;
    cursor: pointer;
    transition: border-color 0.18s, background 0.18s;

    &:hover,
    &:focus-visible {
      border-color: var(--accent);
      background: var(--accent-soft);
      outline: none;
    }
  }

  .avatar-face {
    width: 18px;
    height: 18px;
    position: relative;
    display: block;
  }

  .avatar-head,
  .avatar-body {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    border: 1.6px solid var(--accent);
  }

  .avatar-head {
    top: 1px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--surface);
  }

  .avatar-body {
    bottom: 1px;
    width: 14px;
    height: 8px;
    border-radius: 8px 8px 4px 4px;
    border-bottom: none;
  }

  @media (max-width: 720px) {
    .topbar {
      padding: 0 20px 0 10px;
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

    .avatar-button {
      width: 28px;
      height: 28px;
    }
  }

  @media (max-width: 560px) {
    .topbar-logo {
      display: none;
    }

    .topbar {
      justify-content: flex-start;
    }
  }
</style>
