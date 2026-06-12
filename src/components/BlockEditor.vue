<template>
  <div class="block-editor">
    <template v-if="['narrator', 'quote', 'monologue'].includes(block.type)">
      <el-input :model-value="block.text" type="textarea" :rows="4" placeholder="输入文字"
        @input="update('text', $event)" />
    </template>

    <template v-if="block.type === 'timestamp'">
      <div class="dialogue-fields">
        <span class="mini-label">时间</span>
        <el-input size="small" :model-value="block.time" placeholder="例如：深夜" @input="update('time', $event)" />
        <span class="mini-label">地点</span>
        <el-input size="small" :model-value="block.place" placeholder="例如：城市高架桥" @input="update('place', $event)" />
      </div>
    </template>

    <template v-if="block.type === 'illustration'">
      <div class="dialogue-fields">
        <span class="mini-label">场景描述</span>
        <el-input :model-value="block.prompt" type="textarea" :rows="3"
          placeholder="例如：黄昏时分，一个男生手持玫瑰站在小区门口，简笔手绘风格、温暖配色、手账感、人物圆润可爱、要求构图完整" @input="update('prompt', $event)" />
        <div class="image-toolbar">
          <el-button
            size="small"
            type="primary"
            :loading="illusLoading"
            :disabled="auth.remainingImages <= 0"
            @click="generateIllustration"
          >
            生成插图
          </el-button>
          <el-button v-if="block.svg" size="small" @click="clearIllustration">清除</el-button>
        </div>
        <span class="status-text">插图剩余 {{ auth.remainingImages }} / {{ auth.usage.limit }}</span>
        <span v-if="illusStatus" class="status-text">{{ illusStatus }}</span>
        <div v-if="block.svg" class="illus-preview-thumb">
          <img :src="block.svg" alt="AI 生成插图" />
        </div>
        <div v-else class="illus-preview-empty">尚未生成插图</div>
      </div>
    </template>

    <template v-if="block.type === 'dialogue'">
      <div class="dialogue-fields">
        <span class="mini-label">说话人</span>
        <el-select size="small" :model-value="block.speaker" @change="update('speaker', $event)">
          <el-option v-for="char in characters" :key="char.id" :label="char.name" :value="char.id" />
        </el-select>
        <span class="mini-label">对话内容</span>
        <el-input :model-value="block.text" type="textarea" :rows="3" placeholder="对话内容"
          @input="update('text', $event)" />
        <span class="mini-label">内心旁白</span>
        <el-input :model-value="block.thought" placeholder="可留空" @input="update('thought', $event)" />
      </div>
    </template>

    <template v-if="block.type === 'phone'">
      <span class="mini-label">标题文字</span>
      <el-input size="small" :model-value="block.header || '-- 微信消息 --'" placeholder="-- 微信消息 --"
        @input="update('header', $event)" />
      <span class="mini-label">消息列表</span>
      <div class="phone-msgs">
        <div v-for="(msg, index) in block.messages || []" :key="index" class="phone-msg-row">
          <el-select size="small" :model-value="msg.charId" @change="updatePhoneMsg(index, 'charId', $event)">
            <el-option v-for="char in characters" :key="char.id" :label="char.name" :value="char.id" />
          </el-select>
          <el-input size="small" :model-value="msg.text" placeholder="消息内容"
            @input="updatePhoneMsg(index, 'text', $event)" />
          <el-button text type="danger" size="small" @click="deletePhoneMsg(index)">删除</el-button>
        </div>
      </div>
      <el-button class="add-msg-btn" size="small" plain @click="addPhoneMsg">添加消息</el-button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { generateAIImage } from '@/api/story.js'
import { useAuthStore } from '@/stores/authStore.js'
import { useStoryStore } from '@/stores/storyStore.js'

const props = defineProps({
  block: Object,
  characters: Array,
})

const auth = useAuthStore()
const store = useStoryStore()
const illusLoading = ref(false)
const illusStatus = ref('')

function update(key, value) {
  const parts = key.split('.')
  let target = props.block

  for (let index = 0; index < parts.length - 1; index += 1) {
    if (target[parts[index]] == null) return
    target = target[parts[index]]
  }

  target[parts[parts.length - 1]] = value
}

function updatePhoneMsg(index, key, value) {
  update(`messages.${index}.${key}`, value)
}

function clearIllustration() {
  update('svg', '')
  update('imageUrl', '')
}

function addPhoneMsg() {
  if (!props.block.messages) props.block.messages = []
  props.block.messages.push({ charId: props.characters?.[0]?.id || 'c0', side: 'left', text: '' })
}

function deletePhoneMsg(index) {
  props.block.messages?.splice(index, 1)
}

function buildImagePrompt(prompt) {
  const storyType = String(store.story?.tag || '').trim() || '温暖手绘风格'
  return `请为以下故事场景生成一张${storyType}的图片，要求逼真没有AI味。场景描述：${prompt}`
}

async function generateWithAI(fullPrompt) {
  const data = await generateAIImage({
    model: 'glm-image',
    prompt: fullPrompt,
    n: 1,
    size: '1024x1024',
  })
  if (data.error) throw new Error(data.error.message)
  auth.updateUsage(data.usage)

  const url = data.data?.[0]?.url
  if (!url) throw new Error('智谱 AI 未返回图片数据')
  return url
}

async function generateIllustration() {
  const prompt = (props.block.prompt || '').trim()
  if (!prompt) {
    ElMessage.warning('请先填写场景描述')
    return
  }

  illusLoading.value = true
  illusStatus.value = '生成中，请稍候'

  try {
    const fullPrompt = buildImagePrompt(prompt)
    const result = await generateWithAI(fullPrompt)

    update('svg', result)
    update('imageUrl', result)
    illusStatus.value = '插图已生成'
    setTimeout(() => {
      illusStatus.value = ''
    }, 3000)
  } catch (error) {
    illusStatus.value = error.message || '插图生成失败'
    ElMessage.error(illusStatus.value)
  } finally {
    illusLoading.value = false
  }
}
</script>

<style scoped lang="scss">
  .block-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .dialogue-fields {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .image-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
  }

  .status-text {
    font-size: 11px;
    color: var(--ink-2);
  }

  .phone-msgs {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .phone-msg-row {
    display: grid;
    grid-template-columns: 88px minmax(0, 1fr) auto;
    align-items: center;
    gap: 5px;
  }

  .add-msg-btn {
    width: 100%;
  }

  .illus-preview-thumb,
  .illus-preview-empty {
    margin-top: 4px;
    border-radius: 8px;
    border: 1.5px solid var(--border);
    background: #fafaf8;
  }

  .illus-preview-thumb {
    overflow: hidden;
    line-height: 0;
  }

  .illus-preview-thumb img {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
  }

  .illus-preview-empty {
    padding: 14px;
    text-align: center;
    color: var(--ink-2);
    font-size: 12px;
    border-style: dashed;
  }

  @media (max-width: 520px) {

    .image-toolbar,
    .phone-msg-row {
      grid-template-columns: 1fr;
    }
  }
</style>
