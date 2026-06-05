<template>
  <div class="chapter-card">
    <div class="chapter-header" :class="{ open: isOpen }" @click="isOpen = !isOpen">
      <span class="chapter-num-badge">{{ chapter.numeral }}</span>
      <span class="chapter-name-preview">{{ chapter.title || '（未命名章节）' }}</span>
      <button class="chapter-delete" @click.stop="$emit('delete')">✕</button>
      <span class="chapter-toggle">▼</span>
    </div>
    <div class="chapter-body" :class="{ open: isOpen }">
      <div class="field" style="margin-bottom:6px">
        <label class="mini-label">章节标题</label>
        <input type="text" class="mini-input" :value="chapter.title" @input="$emit('update-title', $event.target.value)" />
      </div>
      <div class="field" style="margin-bottom:8px">
        <label class="mini-label">序号（汉字）</label>
        <input type="text" class="mini-input" style="width:80px" :value="chapter.numeral" @input="$emit('update-numeral', $event.target.value)" />
      </div>

      <!-- Blocks list -->
      <div class="block-list">
        <div v-for="(block, bi) in chapter.blocks" :key="bi" class="block-item">
          <div class="block-header" :class="{ open: openBlocks.has(bi) }" @click="toggleBlock(bi)">
            <span class="block-type-tag" :class="BLOCK_TAG_CLASS[block.type]">{{ BLOCK_LABELS[block.type] }}</span>
            <span class="block-preview">{{ getBlockPreview(block) }}</span>
            <button class="block-del" @click.stop="$emit('delete-block', bi)">✕</button>
          </div>
          <div class="block-body" :class="{ open: openBlocks.has(bi) }">
            <BlockEditor
              :block="block"
              :characters="characters"
              :ci="ci"
              :bi="bi"
              @update="(payload) => $emit('update-block', bi, payload)"
              @type-change="(newType) => $emit('change-block-type', bi, newType)"
              @add-phone-msg="$emit('add-phone-msg', bi)"
              @delete-phone-msg="(mi) => $emit('delete-phone-msg', bi, mi)"
            />
          </div>
        </div>
      </div>

      <button class="add-block-btn" @click="$emit('add-block')">＋ 添加内容块</button>
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
const emit = defineEmits([
  'delete', 'update-title', 'update-numeral',
  'add-block', 'delete-block', 'update-block', 'change-block-type',
  'add-phone-msg', 'delete-phone-msg',
])

const isOpen = ref(false)
const openBlocks = ref(new Set())

function toggleBlock(bi) {
  if (openBlocks.value.has(bi)) openBlocks.value.delete(bi)
  else openBlocks.value.add(bi)
}

// Auto open new block
watch(() => props.chapter.blocks.length, (newLen, oldLen) => {
  if (newLen > oldLen) {
    openBlocks.value.add(newLen - 1)
  }
})
</script>

<style scoped>
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
}
.chapter-header:hover { background: var(--accent-soft); }
.chapter-header.open { border-bottom-color: var(--border); }
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
  font-size: 10px;
  color: var(--ink-2);
  transition: transform 0.2s;
}
.chapter-header.open .chapter-toggle { transform: rotate(180deg); }
.chapter-delete {
  background: none; border: none; color: #ccc; cursor: pointer;
  font-size: 14px; padding: 0 2px; line-height: 1; transition: color 0.2s;
}
.chapter-delete:hover { color: #e8636f; }
.chapter-body { display: none; padding: 10px; flex-direction: column; gap: 8px; }
.chapter-body.open { display: flex; }

.block-list { display: flex; flex-direction: column; gap: 6px; }
.block-item { border: 1.5px solid var(--border); border-radius: 6px; background: var(--surface); overflow: hidden; }
.block-header {
  display: flex; align-items: center; gap: 6px; padding: 6px 8px;
  background: #f5f2ee; border-bottom: 1px solid transparent; cursor: pointer;
}
.block-header.open { border-bottom-color: var(--border); }
.block-type-tag { font-size: 10px; padding: 2px 7px; border-radius: 10px; font-family: "ZCOOL KuaiLe", cursive; letter-spacing: 1px; }
.tag-narrator { background: #eee8ff; color: #7a5ea8; }
.tag-dialogue { background: var(--green-soft); color: #4a8a55; }
.tag-phone { background: #e0f0ff; color: #4a78b0; }
.tag-quote { background: #2a2825; color: #eee8e0; }
.tag-monologue { background: var(--accent-soft); color: var(--accent); }
.tag-timestamp { background: #FFF8E0; color: #A07820; }
.tag-illustration { background: #EDE8F8; color: #6040A8; }
.block-preview { flex: 1; font-size: 11px; color: var(--ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.block-del { background: none; border: none; color: #ccc; cursor: pointer; font-size: 12px; padding: 0 2px; line-height: 1; transition: color 0.2s; }
.block-del:hover { color: #e8636f; }
.block-body { display: none; padding: 8px; }
.block-body.open { display: block; }

.add-block-btn {
  width: 100%; padding: 6px; border: 1.5px dashed var(--border); border-radius: 6px;
  background: none; font-size: 12px; color: var(--ink-2); cursor: pointer;
  font-family: "ZCOOL KuaiLe", cursive; letter-spacing: 1px; transition: all 0.2s; margin-top: 4px;
}
.add-block-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
</style>
