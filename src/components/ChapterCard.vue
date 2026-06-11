<template>
  <div class="chapter-card">
    <div class="chapter-header" :class="{ open: isOpen }" @click="isOpen = !isOpen">
      <span class="chapter-num-badge">{{ chapter.numeral }}</span>
      <span class="chapter-name-preview">{{ chapter.title || '未命名章节' }}</span>
      <button class="chapter-delete" @click.stop="deleteChapter">删除</button>
      <span class="chapter-toggle">⌄</span>
    </div>

    <div class="chapter-body" :class="{ open: isOpen }">
      <label class="mini-label">章节标题</label>
      <input type="text" class="mini-input" :value="chapter.title" @input="chapter.title = $event.target.value" />

      <label class="mini-label">序号</label>
      <input
        type="text"
        class="mini-input chapter-numeral"
        :value="chapter.numeral"
        @input="chapter.numeral = $event.target.value"
      />

      <Draggable
        class="block-list"
        :list="chapter.blocks"
        :item-key="getBlockDragKey"
        handle=".block-drag-handle"
        ghost-class="block-ghost"
        chosen-class="block-chosen"
        drag-class="block-dragging"
      >
        <template #item="{ element: block, index: blockIndex }">
        <div class="block-item">
          <div class="block-header" :class="{ open: openBlocks.has(getBlockDragKey(block)) }" @click="toggleBlock(block)">
            <button class="block-drag-handle" type="button" title="拖拽排序" @click.stop>↕</button>
            <span class="block-type-dropdown" @click.stop>
              <el-dropdown trigger="click" @command="newType => changeBlockType(blockIndex, newType)">
                <button class="block-type-tag block-type-select" :class="BLOCK_TAG_CLASS[block.type]" type="button">
                  {{ BLOCK_LABELS[block.type] }}
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="(label, type) in BLOCK_LABELS"
                      :key="type"
                      :command="type"
                      :disabled="type === block.type"
                    >
                      {{ label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </span>
            <span class="block-preview">{{ getBlockPreview(block) }}</span>
            <button class="block-del" @click.stop="deleteBlock(blockIndex)">删除</button>
          </div>
          <div class="block-body" :class="{ open: openBlocks.has(getBlockDragKey(block)) }">
            <BlockEditor
              :block="block"
              :characters="characters"
            />
          </div>
        </div>
        </template>
      </Draggable>

      <button class="add-block-btn" @click="addBlock">添加内容块</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Draggable from 'vuedraggable'
import BlockEditor from './BlockEditor.vue'
import { BLOCK_LABELS, BLOCK_TAG_CLASS, getBlockPreview } from '@/utils/index.js'

const props = defineProps({
  chapter: Object,
  chapters: Array,
  characters: Array,
  ci: Number,
})

const isOpen = ref(false)
const openBlocks = ref(new Set())
const blockDragKeys = new WeakMap()
let blockDragKeySeed = 0

function getBlockDragKey(block) {
  if (!blockDragKeys.has(block)) {
    blockDragKeySeed += 1
    blockDragKeys.set(block, `block-${props.ci}-${blockDragKeySeed}`)
  }

  return blockDragKeys.get(block)
}

function toggleBlock(block) {
  const blockKey = getBlockDragKey(block)
  if (openBlocks.value.has(blockKey)) openBlocks.value.delete(blockKey)
  else openBlocks.value.add(blockKey)
}

function deleteChapter() {
  if (!props.chapters?.[props.ci]) return

  if (props.chapters.length <= 1) {
    alert('至少保留一个章节')
    return
  }

  props.chapters.splice(props.ci, 1)
}

function addBlock() {
  const defaultSpeaker = props.characters?.[0]?.id || 'c0'
  props.chapter.blocks.push({ type: 'narrator', text: '', speaker: defaultSpeaker })
}

function deleteBlock(blockIndex) {
  props.chapter.blocks.splice(blockIndex, 1)
}

function changeBlockType(blockIndex, newType) {
  const old = props.chapter.blocks[blockIndex]
  if (!old) return

  const defaultSpeaker = props.characters?.[0]?.id || 'c0'
  props.chapter.blocks[blockIndex] = {
    type: newType,
    text: old.text || '',
    thought: '',
    speaker: old.speaker || defaultSpeaker,
    messages: old.messages || [],
    header: old.header || '',
    time: old.time || '',
    place: old.place || '',
    prompt: old.prompt || '',
    svg: old.svg || '',
    imageUrl: old.imageUrl || '',
  }

  openBlocks.value.add(getBlockDragKey(props.chapter.blocks[blockIndex]))
}

watch(
  () => props.chapter.blocks.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      const block = props.chapter.blocks[newLength - 1]
      if (block) openBlocks.value.add(getBlockDragKey(block))
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

.block-drag-handle {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--ink-2);
  cursor: grab;
  flex-shrink: 0;
  font-size: 13px;
  line-height: 20px;
  padding: 0;

  &:active {
    cursor: grabbing;
  }
}

.block-ghost {
  opacity: 0.45;
}

.block-chosen {
  border-color: var(--accent);
}

.block-dragging {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.block-type-tag {
  border: none;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 10px;
  font-family: "ZCOOL KuaiLe", cursive;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.block-type-select {
  cursor: pointer;
  line-height: 1.4;

  &::after {
    content: "⌄";
    margin-left: 4px;
    font-size: 9px;
  }
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
