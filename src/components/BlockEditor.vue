<template>
  <div class="block-editor">
    <!-- Type selector -->
    <select class="block-select" :value="block.type" @change="onTypeChange">
      <option v-for="(label, type) in BLOCK_LABELS" :key="type" :value="type">{{ label }}</option>
    </select>

    <!-- Narrator / Quote / Monologue -->
    <template v-if="['narrator', 'quote', 'monologue'].includes(block.type)">
      <textarea class="mini-textarea" placeholder="输入文字…" :value="block.text"
        @input="update('text', $event.target.value)"></textarea>
    </template>

    <!-- Timestamp -->
    <template v-if="block.type === 'timestamp'">
      <div class="dialogue-fields">
        <span class="mini-label">时间</span>
        <input type="text" class="mini-input" style="margin-bottom:6px" placeholder="" :value="block.time"
          @input="update('time', $event.target.value)" />
        <span class="mini-label">地点（可留空）</span>
        <input type="text" class="mini-input" placeholder="" :value="block.place"
          @input="update('place', $event.target.value)" />
      </div>
    </template>

    <!-- Illustration -->
    <template v-if="block.type === 'illustration'">
      <div class="dialogue-fields">
        <span class="mini-label">场景描述（会发送给 AI 生成插图）</span>
        <textarea class="mini-textarea" style="height:60px" placeholder="如：黄昏时分，一个男生手持一束玫瑰花站在小区门口，背后是昏黄的路灯"
          :value="block.prompt" @input="update('prompt', $event.target.value)"></textarea>
        <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
          <button class="btn btn-primary" style="padding:6px 12px;font-size:12px" :disabled="illusLoading"
            @click="generateIllustration">
            {{ illusLoading ? '⏳ 生成中…' : '✦ AI 生成插图' }}
          </button>
          <button v-if="block.svg" class="btn btn-ghost" style="padding:6px 10px;font-size:12px;color:#e8636f"
            @click="update('svg', '')">× 清除</button>
          <span style="font-size:11px;color:var(--ink-2)">{{ illusStatus }}</span>
        </div>
        <div v-if="block.svg" class="illus-preview-thumb" v-html="block.svg"></div>
        <div v-else class="illus-preview-empty">尚未生成插图</div>
      </div>
    </template>

    <!-- Dialogue -->
    <template v-if="block.type === 'dialogue'">
      <div class="dialogue-fields">
        <div class="speaker-row">
          <div>
            <span class="mini-label">说话人</span>
            <select class="block-select" style="margin-bottom:0" :value="block.speaker"
              @change="update('speaker', $event.target.value)">
              <option v-for="char in characters" :key="char.id" :value="char.id">{{ char.name }}</option>
            </select>
          </div>
        </div>
        <span class="mini-label">对话内容</span>
        <textarea class="mini-textarea" placeholder="对话内容…" :value="block.text"
          @input="update('text', $event.target.value)"></textarea>
        <span class="mini-label">内心旁白（可留空）</span>
        <input type="text" class="mini-input" placeholder="说完这句话，我想到了…" :value="block.thought"
          @input="update('thought', $event.target.value)" />
      </div>
    </template>

    <!-- Phone -->
    <template v-if="block.type === 'phone'">
      <span class="mini-label">标题文字</span>
      <input type="text" class="mini-input" style="margin-bottom:6px" :value="block.header || '—— 微信消息 ——'"
        placeholder="—— 微信消息 ——" @input="update('header', $event.target.value)" />
      <span class="mini-label">消息列表</span>
      <div class="phone-msgs">
        <div v-for="(msg, mi) in (block.messages || [])" :key="mi" class="phone-msg-row">
          <select style="width:72px" :value="msg.charId" @change="updatePhoneMsg(mi, 'charId', $event.target.value)">
            <option v-for="char in characters" :key="char.id" :value="char.id">{{ char.name }}</option>
          </select>
          <input type="text" :value="msg.text" placeholder="消息内容…"
            @input="updatePhoneMsg(mi, 'text', $event.target.value)" />
          <button class="phone-msg-del" @click="$emit('delete-phone-msg', mi)">✕</button>
        </div>
      </div>
      <button class="add-msg-btn" @click="$emit('add-phone-msg')">＋ 添加消息</button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BLOCK_LABELS } from '@/utils/index.js'

const props = defineProps({
  block: Object,
  characters: Array,
  ci: Number,
  bi: Number,
})
const emit = defineEmits(['update', 'type-change', 'add-phone-msg', 'delete-phone-msg', 'svg-generated'])

const illusLoading = ref(false)
const illusStatus = ref('')

function update(key, value) {
  emit('update', { key, value })
}

function onTypeChange(e) {
  emit('type-change', e.target.value)
}

function updatePhoneMsg(mi, key, value) {
  emit('update', { key: `messages.${mi}.${key}`, value })
}

// 当前选择的生成引擎，默认 OpenAI
const imageEngine = ref('openai') // 'anthropic' | 'openai'

async function generateIllustration() {
  const prompt = (props.block.prompt || '').trim()
  if (!prompt) { alert('请先填写场景描述'); return }

  illusLoading.value = true
  illusStatus.value = '⏳ 生成中，请稍候…'

  const accentColor = '#C07858'
  const bgColor = '#F7F3EE'

  const anthropicPrompt  = `你是专业网页插画设计师，擅长手绘风格SVG故事插图。
  请为以下场景绘制一幅温暖手绘风格的SVG插图：
  场景描述：${prompt}
  故事主色调：${accentColor}，背景色参考：${bgColor}
  输出要求（严格遵守）：
  1. 只输出SVG代码，从<svg开始，以</svg>结束，前后无任何其他文字
  2. viewBox="0 0 400 240"，不要设置固定width/height属性
  3. 风格：简笔画+温暖配色+手账感，人物圆润可爱
  4. 有前景/中景/背景层次，整体构图完整
  5. 不要XML声明，不要注释，确保SVG语法正确可直接渲染`

  const openaiPrompt = `你是专业网页插画设计师，请为以下场景生成一张温暖手绘风格的插图：
  场景描述：${prompt}
  故事主色调：${accentColor}，背景色参考：${bgColor}
  风格：简笔画+温暖配色+手账感，人物圆润可爱
  有前景/中景/背景层次，整体构图完整`



  try {
    const result = imageEngine.value === 'anthropic'
      ? await generateWithAnthropic(anthropicPrompt)
      : await generateWithOpenAI(openaiPrompt)

    emit('update', { key: 'svg', value: result })
    illusStatus.value = '✓ 插图已生成'
    setTimeout(() => { illusStatus.value = '' }, 3000)
  } catch (err) {
    console.error('generateIllustration error:', err)
    illusStatus.value = '✗ ' + err.message
  } finally {
    illusLoading.value = false
  }


}


// ── Anthropic → SVG ──────────────────────────────────────────────────
async function generateWithAnthropic(fullPrompt) {
  const response = await fetch('/api/v1/anthropic/image-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: fullPrompt }],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = await response.json()
  if (data.error) throw new Error(data.error.message)

  const svgCode = (data.content || [])
    .filter(c => c.type === 'text')
    .map(c => c.text)
    .join('')

  const m = svgCode.match(/<svg[\s\S]*?<\/svg>/i)
  if (!m) throw new Error('AI 返回内容中未找到有效 SVG，请重试')

  return m[0].replace(/<svg/, '<svg style="width:100%;height:auto;display:block"')
}

// ── OpenAI → PNG base64 → <img> ──────────────────────────────────────
async function generateWithOpenAI(fullPrompt) {
  const response = await fetch('/api/v1/openai/image-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
      // response_format: 'b64_json',
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = await response.json()
  if (data.error) throw new Error(data.error.message)

  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI 未返回图片数据')

  return `<img src="data:image/png;base64,${b64}" style="width:100%;height:auto;display:block" alt="AI 生成插图" />`
}
</script>

<style scoped>
  .block-editor {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .dialogue-fields {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .speaker-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .phone-msgs {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .phone-msg-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .phone-msg-row select {
    width: 72px;
    padding: 4px;
    border: 1.5px solid var(--border);
    border-radius: 5px;
    font-size: 11px;
    background: #fafaf8;
    color: var(--ink);
    flex-shrink: 0;
  }

  .phone-msg-row input {
    flex: 1;
    padding: 4px 7px;
    border: 1.5px solid var(--border);
    border-radius: 5px;
    font-size: 12px;
    font-family: "Noto Sans SC", sans-serif;
    background: #fafaf8;
    color: var(--ink);
  }

  .phone-msg-row input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .phone-msg-del {
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    font-size: 12px;
    padding: 0 2px;
    flex-shrink: 0;
    transition: color 0.2s;
  }

  .phone-msg-del:hover {
    color: #e8636f;
  }

  .add-msg-btn {
    margin-top: 4px;
    width: 100%;
    padding: 5px;
    border: 1.5px dashed var(--border);
    border-radius: 5px;
    background: none;
    font-size: 11px;
    color: var(--ink-2);
    cursor: pointer;
    font-family: "ZCOOL KuaiLe", cursive;
    letter-spacing: 1px;
    transition: all 0.2s;
  }

  .add-msg-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .illus-preview-thumb {
    margin-top: 10px;
    border-radius: 8px;
    overflow: hidden;
    border: 1.5px solid var(--border);
    background: #fafaf8;
    line-height: 0;
  }

  .illus-preview-empty {
    margin-top: 10px;
    padding: 14px;
    text-align: center;
    color: var(--ink-2);
    font-size: 12px;
    background: #fafaf8;
    border-radius: 8px;
    border: 1.5px dashed var(--border);
  }
</style>
