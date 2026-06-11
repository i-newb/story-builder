<template>
  <div class="editor-panel" :class="{ 'mobile-active': isMobileActive }" id="editor-panel">
    <div class="editor-scroll">
      <AiStoryPanel />

      <section class="section-group">
        <div class="section-title">基本信息</div>
        <el-form label-position="top" size="small">
          <el-form-item label="故事标题">
            <el-input v-model="story.title" placeholder="故事标题" />
          </el-form-item>
          <el-form-item label="副标题">
            <el-input v-model="story.subtitle" placeholder="副标题" />
          </el-form-item>
          <el-form-item label="标签文字">
            <el-input v-model="story.tag" placeholder="例如：图文故事、泪点记录" />
          </el-form-item>
          <el-form-item label="结尾寄语">
            <el-input v-model="story.ending" type="textarea" :rows="3" placeholder="结尾文字" />
          </el-form-item>
        </el-form>
      </section>

      <section class="section-group">
        <div class="section-title">人物设置</div>
        <div v-for="(char, index) in story.characters" :key="char.id" class="char-row">
          <span class="char-index">{{ index + 1 }}</span>
          <el-input v-model="char.name" size="small" placeholder="角色名称" />
          <el-color-picker v-model="char.color" size="small" />
          <el-select v-model="char.side" size="small" class="char-side">
            <el-option label="左侧" value="left" />
            <el-option label="右侧" value="right" />
          </el-select>
          <el-button
            v-if="story.characters.length > 1"
            text
            type="danger"
            size="small"
            title="删除角色"
            @click="deleteChar(index)"
          >
            删除
          </el-button>
        </div>
        <el-button class="wide-action" plain type="success" size="small" @click="addChar">添加角色</el-button>
      </section>

      <section class="section-group">
        <div class="section-title">主题配色</div>
        <div class="color-row">
          <label class="color-field">
            <span>主色调</span>
            <el-color-picker v-model="story.accent" />
          </label>
          <label class="color-field">
            <span>页面背景</span>
            <el-color-picker v-model="story.bg" />
          </label>
        </div>
      </section>

      <section class="section-group">
        <div class="section-title">章节内容</div>
        <div class="chapters-list">
          <ChapterCard
            v-for="(chapter, chapterIndex) in story.chapters"
            :key="chapterIndex"
            :chapter="chapter"
            :chapters="story.chapters"
            :characters="story.characters"
            :ci="chapterIndex"
          />
        </div>
        <el-button class="wide-action" plain type="primary" size="small" @click="addChapter">添加章节</el-button>
      </section>
    </div>

    <div class="editor-footer">
      <el-button class="save-button" type="success" :style="saveBtnStyle" @click="handleComplete">
        {{ saveBtnText }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { createStory, fetchStories, updateStory } from '@/api/story.js'
import { useStoryStore } from '@/stores/storyStore.js'
import { newCharId, NUMERALS } from '@/utils/index.js'
import { normalizeStoryLibrary } from '@/utils/storyLibrary.js'
import AiStoryPanel from './AiStoryPanel.vue'
import ChapterCard from './ChapterCard.vue'

defineProps({
  isMobileActive: Boolean,
})

const store = useStoryStore()
const story = computed(() => store.story)

const saveBtnText = ref('完成，保存到故事库')
const saveBtnStyle = ref({})

async function handleComplete() {
  const result = await completeStory()
  if (!result) return

  saveBtnText.value = result
  saveBtnStyle.value = { background: '#5a8d6a', borderColor: '#5a8d6a' }
  setTimeout(() => {
    saveBtnText.value = '完成，保存到故事库'
    saveBtnStyle.value = {}
  }, 1800)
}

async function completeStory() {
  if (!story.value.title?.trim()) {
    alert('请先填写故事标题再保存')
    return false
  }

  if (store.activeStoryId) {
    await updateStory(store.activeStoryId, { story: story.value })
    await refreshLibrary()
    return '已更新'
  }

  const result = await createStory({ story: story.value })
  store.activeStoryId = result?.story?.id || null
  await refreshLibrary()
  return '已保存'
}

async function refreshLibrary() {
  const result = await fetchStories()
  store.library = normalizeStoryLibrary(result)
}

function addChar() {
  story.value.characters.push({ id: newCharId(), name: '新角色', color: '#E8E0FF', side: 'left' })
}

function deleteChar(index) {
  if (!story.value.characters[index]) return

  if (story.value.characters.length <= 1) {
    alert('至少保留一个角色')
    return
  }

  const removedId = story.value.characters[index].id
  story.value.characters.splice(index, 1)
  const fallbackSpeaker = story.value.characters[0].id

  story.value.chapters.forEach(chapter => {
    chapter.blocks.forEach(block => {
      if (block.type === 'dialogue' && block.speaker === removedId) block.speaker = fallbackSpeaker
      if (block.type === 'phone') {
        ;(block.messages || []).forEach(message => {
          if (message.charId === removedId) message.charId = fallbackSpeaker
        })
      }
    })
  })
}

function addChapter() {
  const index = story.value.chapters.length
  const defaultSpeaker = story.value.characters[0]?.id || 'c0'
  story.value.chapters.push({
    title: '新章节',
    numeral: NUMERALS[index] || String(index + 1),
    blocks: [{ type: 'narrator', text: '', speaker: defaultSpeaker }],
  })
}
</script>

<style scoped lang="scss">
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

.section-group {
  margin-bottom: 24px;

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.section-title {
  font-family: "ZCOOL KuaiLe", cursive;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--accent);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--accent-soft);
  }
}

.char-row {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) 36px 72px auto;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border: 1.5px solid var(--border);
  border-radius: 7px;
  background: #fafaf8;
  margin-bottom: 7px;
}

.char-index {
  font-family: "Ma Shan Zheng", cursive;
  font-size: 16px;
  color: var(--accent);
  text-align: center;
}

.char-side {
  width: 72px;
}

.wide-action {
  width: 100%;
  margin-top: 4px;
}

.color-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.color-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 10px;
  border: 1.5px solid var(--border);
  border-radius: 7px;
  background: #fafaf8;
  font-size: 12px;
  color: var(--ink-2);
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.editor-footer {
  padding: 12px 16px;
  border-top: 1.5px solid var(--border);
  flex-shrink: 0;
}

.save-button {
  width: 100%;
}

@media (max-width: 768px) {
  .editor-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1.5px solid var(--border);
    display: none;
    height: calc(100vh - 52px);
    max-height: none;
  }

  .editor-panel.mobile-active {
    display: flex;
  }
}

@media (max-width: 520px) {
  .char-row {
    grid-template-columns: 20px minmax(0, 1fr) 36px 72px;

    .el-button {
      grid-column: 2 / -1;
      justify-self: end;
    }
  }

  .color-row {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) {
  .editor-panel {
    display: flex !important;
  }
}
</style>
