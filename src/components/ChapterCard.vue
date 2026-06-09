<template>
  <div class="chapter-card">
    <div class="chapter-header" :class="{ open: isOpen }" @click="isOpen = !isOpen">
      <span class="chapter-num-badge">{{ chapter.numeral }}</span>
      <span class="chapter-name-preview">{{ chapter.title || '未命名章节' }}</span>
      <button class="chapter-delete" @click.stop="$emit('delete')">删除</button>
      <span class="chapter-toggle">⌄</span>
    </div>

    <div class="chapter-body" :class="{ open: isOpen }">
      <label class="mini-label">章节标题</label>
      <input type="text" class="mini-input" :value="chapter.title" @input="$emit('update-title', $event.target.value)" />

      <label class="mini-label">序号</label>
      <input
        type="text"
        class="mini-input chapter-numeral"
        :value="chapter.numeral"
        @input="$emit('update-numeral', $event.target.value)"
      />

      <div class="block-list">
        <div v-for="(block, blockIndex) in chapter.blocks" :key="blockIndex" class="block-item">
          <div class="block-header" :class="{ open: openBlocks.has(blockIndex) }" @click="toggleBlock(blockIndex)">
            <span class="block-type-tag" :class="BLOCK_TAG_CLASS[block.type]">{{ BLOCK_LABELS[block.type] }}</span>
            <span class="block-preview">{{ getBlockPreview(block) }}</span>
            <button class="block-del" @click.stop="$emit('delete-block', blockIndex)">删除</button>
          </div>
          <div class="block-body" :class="{ open: openBlocks.has(blockIndex) }">
            <BlockEditor
              :block="block"
              :characters="characters"
              :ci="ci"
              :bi="blockIndex"
              @update="payload => $emit('update-block', blockIndex, payload)"
              @type-change="newType => $emit('change-block-type', blockIndex, newType)"
              @add-phone-msg="$emit('add-phone-msg', blockIndex)"
              @delete-phone-msg="messageIndex => $emit('delete-phone-msg', blockIndex, messageIndex)"
            />
          </div>
        </div>
      </div>

      <button class="add-block-btn" @click="$emit('add-block')">添加内容块</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import BlockEditor from './BlockEditor.vue'
import { BLOCK_LABELS, BLOCK_TAG_CLASS, getBlockPreview } from '@/utils/index.js'

const props = defineProps({
  chapter: Object,
  ci: Number,
  characters: Array,
})

defineEmits([
  'delete',
  'update-title',
  'update-numeral',
  'add-block',
  'delete-block',
  'update-block',
  'change-block-type',
  'add-phone-msg',
  'delete-phone-msg',
])

const isOpen = ref(false)
const openBlocks = ref(new Set())

function toggleBlock(blockIndex) {
  if (openBlocks.value.has(blockIndex)) openBlocks.value.delete(blockIndex)
  else openBlocks.value.add(blockIndex)
}

watch(
  () => props.chapter.blocks.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      openBlocks.value.add(newLength - 1)
    }
  },
)
</script>

<style scoped lang="scss">
.chapter-card {
  border: 1.5px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: #fafaf8;
}

.chapter-header {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  background: var(--bg);
  border-bottom: 1px solid transparent;
  transition: all 0.2s;

  &:hover {
    background: var(--accent-soft);
  }

  &.open {
    border-bottom-color: var(--border);

    .chapter-toggle {
      transform: rotate(180deg);
    }
  }
}

.chapter-num-badge {
  font-family: "Ma Shan Zheng", cursive;
  font-size: 16px;
  color: var(--accent);
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.chapter-name-preview {
  flex: 1;
  font-size: 12.5px;
  color: var(--ink);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-toggle {
  font-size: 12px;
  color: var(--ink-2);
  transition: transform 0.2s;
}

.chapter-delete,
.block-del {
  background: none;
  border: none;
  color: #bd5962;
  cursor: pointer;
  font-size: 11px;
  padding: 0 2px;
  line-height: 1;
}

.chapter-body {
  display: none;
  padding: 10px;
  flex-direction: column;
  gap: 8px;

  &.open {
    display: flex;
  }
}

.chapter-numeral {
  width: 80px;
}

.block-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.block-item {
  border: 1.5px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  overflow: hidden;
}

.block-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #f5f2ee;
  border-bottom: 1px solid transparent;
  cursor: pointer;

  &.open {
    border-bottom-color: var(--border);
  }
}

.block-type-tag {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 10px;
  font-family: "ZCOOL KuaiLe", cursive;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.tag-narrator {
  background: #eee8ff;
  color: #7a5ea8;
}

.tag-dialogue {
  background: var(--green-soft);
  color: #4a8a55;
}

.tag-phone {
  background: #e0f0ff;
  color: #4a78b0;
}

.tag-quote {
  background: #2a2825;
  color: #eee8e0;
}

.tag-monologue {
  background: var(--accent-soft);
  color: var(--accent);
}

.tag-timestamp {
  background: #fff8e0;
  color: #a07820;
}

.tag-illustration {
  background: #ede8f8;
  color: #6040a8;
}

.block-preview {
  flex: 1;
  font-size: 11px;
  color: var(--ink-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.block-body {
  display: none;
  padding: 8px;

  &.open {
    display: block;
  }
}

.add-block-btn {
  width: 100%;
  padding: 6px;
  border: 1.5px dashed var(--border);
  border-radius: 6px;
  background: none;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
  font-family: "ZCOOL KuaiLe", cursive;
  letter-spacing: 1px;
  transition: all 0.2s;
  margin-top: 4px;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
}
</style>
