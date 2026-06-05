<template>
  <div class="editor-panel" :class="{ 'mobile-active': isMobileActive }" id="editor-panel">
    <div class="editor-scroll">
      <!-- META -->
      <div class="section-group">
        <div class="section-title">基本信息</div>
        <div class="field">
          <label>故事标题</label>
          <input type="text" v-model="story.title" placeholder="故事标题" @input="store.save()" />
        </div>
        <div class="field">
          <label>副标题</label>
          <input type="text" v-model="story.subtitle" placeholder="副标题" @input="store.save()" />
        </div>
        <div class="field">
          <label>标签文字（小）</label>
          <input type="text" v-model="story.tag" placeholder="如：图文故事、沸点记录" @input="store.save()" />
        </div>
        <div class="field">
          <label>结尾寄语</label>
          <textarea v-model="story.ending" placeholder="结尾文字…" @input="store.save()"></textarea>
        </div>
      </div>

      <!-- CHARACTERS -->
      <div class="section-group">
        <div class="section-title">人物设置</div>
        <div v-for="(char, ci) in story.characters" :key="char.id" class="char-row">
          <div class="char-row-top">
            <span class="char-index">{{ ci + 1 }}</span>
            <input class="mini-input char-name-input" v-model="char.name" placeholder="角色名称" @input="store.save()" />
            <input type="color" class="char-color-input" v-model="char.color" @input="store.save()" @change="store.save()" />
            <select class="char-side-select" v-model="char.side" @change="store.save()">
              <option value="left">左侧</option>
              <option value="right">右侧</option>
            </select>
            <button v-if="story.characters.length > 1" class="char-del-btn" @click="store.deleteChar(ci)" title="删除角色">✕</button>
          </div>
        </div>
        <button class="add-chapter-btn" style="margin-top:6px;border-color:var(--green);color:var(--green)" @click="store.addChar()">＋ 添加角色</button>
      </div>

      <!-- THEME -->
      <div class="section-group">
        <div class="section-title">主题配色</div>
        <div class="color-row">
          <div class="color-field">
            <label>主色调（标题/强调）</label>
            <input type="color" v-model="story.accent" @input="store.save()" @change="store.save()" />
          </div>
          <div class="color-field">
            <label>页面背景色</label>
            <input type="color" v-model="story.bg" @input="store.save()" @change="store.save()" />
          </div>
        </div>
      </div>

      <!-- CHAPTERS -->
      <div class="section-group">
        <div class="section-title">章节内容</div>
        <div class="chapters-list">
          <ChapterCard
            v-for="(chapter, ci) in story.chapters"
            :key="ci"
            :chapter="chapter"
            :ci="ci"
            :characters="story.characters"
            @delete="store.deleteChapter(ci)"
            @update-title="(v) => { chapter.title = v; store.save() }"
            @update-numeral="(v) => { chapter.numeral = v; store.save() }"
            @add-block="store.addBlock(ci)"
            @delete-block="(bi) => store.deleteBlock(ci, bi)"
            @update-block="(bi, payload) => updateBlock(ci, bi, payload)"
            @change-block-type="(bi, newType) => store.changeBlockType(ci, bi, newType)"
            @add-phone-msg="(bi) => store.addPhoneMsg(ci, bi)"
            @delete-phone-msg="(bi, mi) => store.deletePhoneMsg(ci, bi, mi)"
          />
        </div>
        <button class="add-chapter-btn" @click="store.addChapter()">＋ 添加章节</button>
      </div>
    </div>
    <div class="editor-footer">
      <button class="btn-complete" :style="saveBtnStyle" @click="handleComplete">{{ saveBtnText }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStoryStore } from '@/stores/storyStore.js'
import ChapterCard from './ChapterCard.vue'

const props = defineProps({
  isMobileActive: Boolean,
})

const store = useStoryStore()
const story = computed(() => store.story)

const saveBtnText = ref('✓ 完成，保存到故事库')
const saveBtnStyle = ref({})

function handleComplete() {
  const result = store.completeStory()
  if (result) {
    saveBtnText.value = result
    saveBtnStyle.value = { background: '#5a8d6a' }
    setTimeout(() => {
      saveBtnText.value = '✓ 完成，保存到故事库'
      saveBtnStyle.value = {}
    }, 1800)
  }
}

function updateBlock(ci, bi, { key, value }) {
  // Handle nested keys like "messages.0.text"
  const parts = key.split('.')
  let obj = story.value.chapters[ci].blocks[bi]
  for (let i = 0; i < parts.length - 1; i++) {
    obj = obj[parts[i]]
  }
  obj[parts[parts.length - 1]] = value
  store.save()
}
</script>

<style scoped>
.editor-panel {
  width: var(--sidebar-w);
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1.5px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.editor-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.section-group { margin-bottom: 24px; }
.section-title {
  font-family: "ZCOOL KuaiLe", cursive;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--accent);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-title::after { content: ""; flex: 1; height: 1px; background: var(--accent-soft); }
.field { margin-bottom: 12px; }
.field label { display: block; font-size: 12px; color: var(--ink-2); margin-bottom: 4px; font-weight: 500; }
.field input, .field textarea, .field select {
  width: 100%; padding: 8px 10px; border: 1.5px solid var(--border); border-radius: 6px;
  font-size: 13px; font-family: "Noto Sans SC", sans-serif; color: var(--ink);
  background: #fafaf8; transition: border-color 0.2s; resize: vertical;
}
.field input:focus, .field textarea:focus, .field select:focus { outline: none; border-color: var(--accent); }
.field textarea { min-height: 72px; }

.color-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.color-field label { font-size: 11.5px; color: var(--ink-2); display: block; margin-bottom: 4px; }
.color-field input[type="color"] {
  width: 100%; height: 36px; border: 1.5px solid var(--border);
  border-radius: 6px; cursor: pointer; padding: 2px 4px; background: #fafaf8;
}

.char-row { border: 1.5px solid var(--border); border-radius: 7px; background: #fafaf8; margin-bottom: 7px; overflow: hidden; }
.char-row-top { display: flex; align-items: center; gap: 7px; padding: 8px 10px; }
.char-index { font-family: "Ma Shan Zheng", cursive; font-size: 16px; color: var(--accent); flex-shrink: 0; width: 16px; text-align: center; }
.char-name-input { flex: 1; min-width: 0; }
.char-color-input { width: 32px; height: 28px; border: 1.5px solid var(--border); border-radius: 5px; padding: 2px; cursor: pointer; background: #fafaf8; flex-shrink: 0; }
.char-side-select { width: 58px; padding: 4px 4px; border: 1.5px solid var(--border); border-radius: 5px; font-size: 11px; font-family: "Noto Sans SC", sans-serif; background: #fafaf8; color: var(--ink); flex-shrink: 0; }
.char-side-select:focus { outline: none; border-color: var(--accent); }
.char-del-btn { background: none; border: none; color: #ccc; cursor: pointer; font-size: 13px; padding: 0 2px; flex-shrink: 0; transition: color 0.2s; }
.char-del-btn:hover { color: #e8636f; }

.chapters-list { display: flex; flex-direction: column; gap: 8px; }
.add-chapter-btn {
  width: 100%; padding: 8px; border: 1.5px dashed var(--accent-soft); border-radius: 8px;
  background: none; font-size: 13px; color: var(--accent); cursor: pointer;
  font-family: "ZCOOL KuaiLe", cursive; letter-spacing: 2px; transition: all 0.2s; margin-top: 4px;
}
.add-chapter-btn:hover { background: var(--accent-soft); }

.editor-footer { padding: 12px 16px; border-top: 1.5px solid var(--border); flex-shrink: 0; }
.btn-complete {
  width: 100%; padding: 9px; border-radius: 7px; border: none;
  background: var(--green); color: #fff; font-size: 13px;
  font-family: "ZCOOL KuaiLe", cursive; letter-spacing: 2px; cursor: pointer;
  transition: background 0.18s; box-shadow: 0 2px 6px rgba(126,173,136,0.3);
}
.btn-complete:hover { background: #6a9d74; }

@media (max-width: 768px) {
  .editor-panel { width: 100%; border-right: none; border-bottom: 1.5px solid var(--border); display: none; height: calc(100vh - 52px); max-height: none; }
  .editor-panel.mobile-active { display: flex; }
}
@media (min-width: 769px) {
  .editor-panel { display: flex !important; }
}
</style>
