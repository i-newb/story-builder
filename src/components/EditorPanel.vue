<template>
  <div class="editor-panel" :class="{ 'mobile-active': isMobileActive }" id="editor-panel">
    <div class="editor-scroll">
      <AiStoryPanel />

      <section class="section-group">
        <div class="section-title">基本信息</div>
        <el-form label-position="top" size="small">
          <el-form-item label="故事标题">
            <el-input v-model="story.title" placeholder="故事标题" @input="store.save()" />
          </el-form-item>
          <el-form-item label="副标题">
            <el-input v-model="story.subtitle" placeholder="副标题" @input="store.save()" />
          </el-form-item>
          <el-form-item label="标签文字">
            <el-input v-model="story.tag" placeholder="例如：图文故事、泪点记录" @input="store.save()" />
          </el-form-item>
          <el-form-item label="结尾寄语">
            <el-input v-model="story.ending" type="textarea" :rows="3" placeholder="结尾文字" @input="store.save()" />
          </el-form-item>
        </el-form>
      </section>

      <section class="section-group">
        <div class="section-title">人物设置</div>
        <div v-for="(char, index) in story.characters" :key="char.id" class="char-row">
          <span class="char-index">{{ index + 1 }}</span>
          <el-input v-model="char.name" size="small" placeholder="角色名称" @input="store.save()" />
          <el-color-picker v-model="char.color" size="small" @change="store.save()" />
          <el-select v-model="char.side" size="small" class="char-side" @change="store.save()">
            <el-option label="左侧" value="left" />
            <el-option label="右侧" value="right" />
          </el-select>
          <el-button
            v-if="story.characters.length > 1"
            text
            type="danger"
            size="small"
            title="删除角色"
            @click="store.deleteChar(index)"
          >
            删除
          </el-button>
        </div>
        <el-button class="wide-action" plain type="success" size="small" @click="store.addChar()">添加角色</el-button>
      </section>

      <section class="section-group">
        <div class="section-title">主题配色</div>
        <div class="color-row">
          <label class="color-field">
            <span>主色调</span>
            <el-color-picker v-model="story.accent" @change="store.save()" />
          </label>
          <label class="color-field">
            <span>页面背景</span>
            <el-color-picker v-model="story.bg" @change="store.save()" />
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
            :ci="chapterIndex"
            :characters="story.characters"
            @delete="store.deleteChapter(chapterIndex)"
            @update-title="value => { chapter.title = value; store.save() }"
            @update-numeral="value => { chapter.numeral = value; store.save() }"
            @add-block="store.addBlock(chapterIndex)"
            @delete-block="blockIndex => store.deleteBlock(chapterIndex, blockIndex)"
            @update-block="(blockIndex, payload) => updateBlock(chapterIndex, blockIndex, payload)"
            @change-block-type="(blockIndex, newType) => store.changeBlockType(chapterIndex, blockIndex, newType)"
            @add-phone-msg="blockIndex => store.addPhoneMsg(chapterIndex, blockIndex)"
            @delete-phone-msg="(blockIndex, messageIndex) => store.deletePhoneMsg(chapterIndex, blockIndex, messageIndex)"
          />
        </div>
        <el-button class="wide-action" plain type="primary" size="small" @click="store.addChapter()">添加章节</el-button>
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
import { useStoryStore } from '@/stores/storyStore.js'
import AiStoryPanel from './AiStoryPanel.vue'
import ChapterCard from './ChapterCard.vue'

defineProps({
  isMobileActive: Boolean,
})

const store = useStoryStore()
const story = computed(() => store.story)

const saveBtnText = ref('完成，保存到故事库')
const saveBtnStyle = ref({})

function handleComplete() {
  const result = store.completeStory()
  if (!result) return

  saveBtnText.value = result
  saveBtnStyle.value = { background: '#5a8d6a', borderColor: '#5a8d6a' }
  setTimeout(() => {
    saveBtnText.value = '完成，保存到故事库'
    saveBtnStyle.value = {}
  }, 1800)
}

function updateBlock(chapterIndex, blockIndex, { key, value }) {
  const parts = key.split('.')
  let target = story.value.chapters[chapterIndex].blocks[blockIndex]

  for (let index = 0; index < parts.length - 1; index += 1) {
    target = target[parts[index]]
  }

  target[parts[parts.length - 1]] = value
  store.save()
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
