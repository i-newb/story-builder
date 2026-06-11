<template>
  <section class="ai-panel">
    <div class="section-title">
      <span>AI 自动生成</span>
      <span class="quota-text">故事剩余 {{ auth.remainingStories }} / {{ auth.usage.limit }}</span>
    </div>
    <el-form label-position="top" size="small" class="ai-form">
      <el-form-item label="故事创意">
        <el-input
          v-model="form.idea"
          type="textarea"
          :rows="3"
          placeholder="例如：雨夜高架上，普通少年遇到来自神话世界的骑士"
        />
      </el-form-item>

      <div class="ai-grid">
        <el-form-item label="类型">
          <el-select v-model="form.genre" placeholder="选择类型">
            <el-option label="都市奇幻" value="都市奇幻" />
            <el-option label="青春治愈" value="青春治愈" />
            <el-option label="悬疑反转" value="悬疑反转" />
            <el-option label="古风仙侠" value="古风仙侠" />
            <el-option label="科幻未来" value="科幻未来" />
          </el-select>
        </el-form-item>

        <el-form-item label="叙事风格">
          <el-select v-model="form.tone" placeholder="选择风格">
            <el-option label="电影感" value="电影感" />
            <el-option label="轻小说" value="轻小说" />
            <el-option label="温柔细腻" value="温柔细腻" />
            <el-option label="强冲突短剧" value="强冲突短剧" />
          </el-select>
        </el-form-item>
      </div>

      <div class="ai-grid">
        <el-form-item label="章节数">
          <el-input-number v-model="form.chapterCount" :min="1" :max="8" controls-position="right" />
        </el-form-item>

        <el-form-item label="写入方式">
          <el-radio-group v-model="form.mode">
            <el-radio-button label="replace">覆盖</el-radio-button>
            <el-radio-button label="append">追加</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </div>

      <el-form-item label="主要角色">
        <el-input
          v-model="form.characters"
          placeholder="例如：楚子航，沉默少年；楚天骄，不靠谱但强大的父亲"
        />
      </el-form-item>

      <div class="ai-actions">
        <el-button type="primary" :loading="loading" :disabled="auth.remainingStories <= 0" @click="handleGenerate">
          {{ loading ? '生成中' : '生成故事' }}
        </el-button>
        <el-button @click="fillFromCurrent">读取当前设定</el-button>
      </div>
    </el-form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { generateAIStory } from '@/api/story.js'
import { useAuthStore } from '@/stores/authStore.js'
import { useStoryStore } from '@/stores/storyStore.js'

const auth = useAuthStore()
const store = useStoryStore()
const loading = ref(false)

const form = reactive({
  idea: '',
  genre: '都市奇幻',
  tone: '电影感',
  chapterCount: 3,
  characters: '',
  mode: 'replace',
})

function fillFromCurrent() {
  form.idea = [store.story.title, store.story.subtitle].filter(Boolean).join('：')
  form.characters = store.story.characters
    .map(character => `${character.name}，${character.side === 'right' ? '右侧气泡' : '左侧气泡'}`)
    .join('；')
}

function extractStoryPayload(response) {
  const payload = response?.story || response?.data?.story || response?.data || response
  if (typeof payload === 'object') return payload
  throw new Error('AI 返回格式无法识别')
}

async function handleGenerate() {
  if (!form.idea.trim()) {
    ElMessage.warning('请先填写故事创意')
    return
  }

  loading.value = true
  try {
    const response = await generateAIStory({
      idea: form.idea,
      genre: form.genre,
      tone: form.tone,
      chapterCount: form.chapterCount,
      characters: form.characters,
    })
    auth.updateUsage(response.usage)
    const generatedStory = extractStoryPayload(response)
    store.applyGeneratedStory(generatedStory, form.mode)
    ElMessage.success(form.mode === 'append' ? 'AI 故事已追加' : 'AI 故事已写入')
  } catch (error) {
    ElMessage.error(error.message || '故事生成失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.ai-panel {
  padding: 12px;
  margin-bottom: 18px;
  border: 1.5px solid var(--accent-soft);
  border-radius: 8px;
  background: #fffaf7;
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

.quota-text {
  font-family: "Noto Sans SC", sans-serif;
  font-size: 11px;
  letter-spacing: 0;
  color: var(--ink-2);
  white-space: nowrap;
}

.ai-form {
  :deep(.el-form-item) {
    margin-bottom: 10px;
  }

  :deep(.el-input-number) {
    width: 100%;
  }
}

.ai-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ai-actions {
  display: flex;
  gap: 8px;

  .el-button {
    flex: 1;
  }
}

@media (max-width: 520px) {
  .ai-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
