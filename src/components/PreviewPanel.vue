<template>
  <div class="preview-panel" :class="{ 'mobile-active': isMobileActive }" id="preview-panel">
    <div class="preview-label">预览：480px 手机宽度</div>

    <div class="preview-frame-wrap">
      <article class="story-preview" :style="previewVars">
        <header class="preview-header">
          <div class="header-tag">{{ story.tag }}</div>
          <h1>
            <span>{{ story.title }}</span>
          </h1>
          <div class="sub">{{ story.subtitle }}</div>
          <div class="deco"></div>
        </header>

        <template v-for="(chapter, chapterIndex) in story.chapters" :key="chapterIndex">
          <section class="chapter" :id="`ch${chapterIndex}`">
            <div class="chapter-num">{{ getChapterNumber(chapter, chapterIndex) }}</div>
            <div class="chapter-line"></div>
            <div class="chapter-title">{{ chapter.title }}</div>
          </section>

          <template v-for="(block, blockIndex) in chapter.blocks || []" :key="blockKey(chapterIndex, blockIndex, block)">
            <div v-if="block.type === 'narrator'" class="panel">
              <div class="narrator">{{ block.text }}</div>
            </div>

            <div v-else-if="block.type === 'monologue'" class="panel">
              <div class="monologue">{{ block.text }}</div>
            </div>

            <div v-else-if="block.type === 'quote'" class="quote-card">
              <p>{{ block.text }}</p>
            </div>

            <div v-else-if="block.type === 'dialogue'" class="panel">
              <div class="dialogue-row" :class="{ rev: isRightSpeaker(block.speaker) }">
                <div class="avatar" :style="{ background: getCharacter(block.speaker).color }">
                  {{ getAvatarLabel(getCharacter(block.speaker).name) }}
                </div>
                <div class="bwrap">
                  <div class="bname">{{ getCharacter(block.speaker).name }}</div>
                  <div
                    class="bubble"
                    :class="isRightSpeaker(block.speaker) ? 'b' : 'a'"
                    :style="{ background: getCharacter(block.speaker).color }"
                  >
                    {{ block.text }}
                    <span v-if="block.thought" class="thought">{{ block.thought }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="block.type === 'phone'" class="panel">
              <div class="phone-chat">
                <div class="phone-header">{{ block.header || '-- 微信消息 --' }}</div>
                <div
                  v-for="(message, messageIndex) in block.messages || []"
                  :key="messageIndex"
                  class="msg-row"
                  :class="{ right: isRightMessage(message) }"
                >
                  <div class="msg-bubble" :class="isRightMessage(message) ? 'right' : 'left'">
                    {{ message.text }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="block.type === 'timestamp'" class="timestamp-bar">
              <span class="ts-dot">●</span>
              <span class="ts-text">{{ [block.time, block.place].filter(Boolean).join(' · ') }}</span>
            </div>

            <div v-else-if="block.type === 'illustration' && block.svg" class="illus-block">
              <img :src="block.svg" alt="AI 插图" />
            </div>
          </template>
        </template>

        <footer class="end-card">
          <div class="end-hearts">♥ ♥ ♥</div>
          <div class="end-sub">{{ story.ending }}</div>
        </footer>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStoryStore } from '@/stores/storyStore.js'
import { hexToRgba, normalizeHexColor, NUMERALS } from '@/utils/index.js'

defineProps({
  isMobileActive: Boolean,
})

const store = useStoryStore()
const story = computed(() => store.story)

const fallbackCharacter = { name: '?', color: '#eeeeee', side: 'left' }

const previewVars = computed(() => {
  const accent = normalizeHexColor(story.value.accent, '#C07858')
  const bg = normalizeHexColor(story.value.bg, '#F7F3EE')

  return {
    '--preview-bg': bg,
    '--preview-accent': accent,
    '--preview-accent-soft': hexToRgba(accent, 0.15),
    '--preview-char-a': normalizeHexColor(story.value.characters?.[0]?.color, '#E0F0E4'),
    '--preview-char-b': normalizeHexColor(story.value.characters?.[1]?.color, '#FFF0E8'),
  }
})

function getChapterNumber(chapter, chapterIndex) {
  return chapter.numeral || NUMERALS[chapterIndex] || String(chapterIndex + 1)
}

function getCharacter(characterId) {
  const characters = Array.isArray(story.value.characters) ? story.value.characters : []
  return characters.find(character => character.id === characterId) || characters[0] || fallbackCharacter
}

function isRightSpeaker(characterId) {
  return getCharacter(characterId).side === 'right'
}

function isRightMessage(message) {
  return getCharacter(message.charId).side === 'right' || message.side === 'right'
}

function getAvatarLabel(name) {
  const chars = Array.from(name || '?')
  return chars[chars.length - 1] || '?'
}

function blockKey(chapterIndex, blockIndex, block) {
  return `${chapterIndex}-${blockIndex}-${block.type}`
}
</script>

<style scoped lang="scss">
.preview-panel {
  flex: 1;
  min-height: 0;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.preview-label {
  padding: 8px 0 4px;
  font-size: 11px;
  color: var(--ink-2);
  letter-spacing: 1px;
  flex-shrink: 0;
  font-family: "ZCOOL KuaiLe", cursive;
}

.preview-frame-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0 12px 12px;
}

.story-preview {
  flex: 0 0 auto;
  width: 480px;
  min-width: 480px;
  min-height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  background: var(--preview-bg);
  color: #2d2b2a;
  font-family: "Noto Sans SC", sans-serif;
  overflow: hidden;
  padding: 0 14px 80px;
  user-select: none;
}

.preview-header {
  text-align: center;
  padding: 48px 20px 36px;
}

.header-tag {
  display: inline-block;
  font-family: "ZCOOL KuaiLe", cursive;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--preview-accent);
  border: 1.5px solid var(--preview-accent);
  padding: 3px 12px;
  border-radius: 20px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.preview-header h1 {
  font-family: "Ma Shan Zheng", cursive;
  font-size: 40px;
  color: #2d2b2a;
  letter-spacing: 6px;
  margin-bottom: 10px;
}

.preview-header h1 span {
  color: var(--preview-accent);
}

.sub {
  font-family: "ZCOOL KuaiLe", cursive;
  font-size: 13px;
  color: #6b6460;
  letter-spacing: 2px;
  margin-bottom: 14px;
}

.deco {
  width: 50px;
  height: 3px;
  background: var(--preview-accent);
  margin: 0 auto;
  border-radius: 2px;
  opacity: 0.6;
}

.chapter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 36px 0 18px;
}

.chapter-num {
  font-family: "Ma Shan Zheng", cursive;
  font-size: 30px;
  color: var(--preview-accent);
  flex-shrink: 0;
  line-height: 1;
}

.chapter-line {
  flex: 1;
  height: 1.5px;
  background: linear-gradient(90deg, var(--preview-accent), transparent);
  opacity: 0.4;
}

.chapter-title {
  font-family: "ZCOOL KuaiLe", cursive;
  font-size: 15px;
  color: #6b6460;
  letter-spacing: 2px;
  flex-shrink: 0;
}

.panel {
  background: #fff;
  border: 2px solid #3d3a38;
  border-radius: 8px;
  margin-bottom: 14px;
  overflow: hidden;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.07);
}

.narrator {
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.95;
  color: #6b6460;
  font-style: italic;
  background: linear-gradient(135deg, #fafaf8, #f5f2ee);
  white-space: pre-line;
}

.monologue {
  padding: 16px 18px;
  border-left: 3px solid var(--preview-accent);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), var(--preview-bg));
  font-size: 13px;
  line-height: 1.9;
  font-style: italic;
  white-space: pre-line;
}

.dialogue-row {
  display: flex;
  gap: 10px;
  padding: 14px;
  align-items: flex-start;
}

.dialogue-row.rev {
  flex-direction: row-reverse;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid #3d3a38;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #6b6460;
}

.bwrap {
  max-width: 75%;
}

.bname {
  font-size: 11px;
  font-weight: 700;
  color: #6b6460;
  margin-bottom: 4px;
}

.bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.75;
  word-break: break-word;
  white-space: pre-line;
}

.bubble.a {
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  border-bottom-left-radius: 4px;
}

.bubble.b {
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  border-bottom-right-radius: 4px;
}

.thought {
  font-size: 11px;
  color: #6b6460;
  font-style: italic;
  display: block;
  margin-top: 6px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  padding-top: 6px;
  white-space: pre-line;
}

.phone-chat {
  padding: 14px;
  background: #ededed;
}

.phone-header {
  text-align: center;
  font-size: 11px;
  color: #888;
  margin-bottom: 12px;
  font-family: "ZCOOL KuaiLe", cursive;
}

.msg-row {
  display: flex;
  margin-bottom: 8px;
}

.msg-row.right {
  justify-content: flex-end;
}

.msg-bubble {
  max-width: 72%;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.65;
  word-break: break-word;
  white-space: pre-line;
}

.msg-bubble.left {
  background: #fff;
  border-radius: 4px 12px 12px 12px;
}

.msg-bubble.right {
  background: #9fd280;
  border-radius: 12px 4px 12px 12px;
  color: #1a3d0a;
}

.timestamp-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 18px 0 10px;
}

.ts-dot {
  font-size: 7px;
  color: #f5c842;
  line-height: 1;
  flex-shrink: 0;
  text-shadow: 0 0 4px rgba(245, 200, 66, 0.5);
}

.ts-text {
  display: inline-block;
  background: #fffbec;
  border: 1px solid #f0e0a0;
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 11.5px;
  color: #7a6020;
  letter-spacing: 0.5px;
}

.illus-block {
  margin-bottom: 14px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #3d3a38;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.07);
  background: #fff;
  line-height: 0;
}

.illus-block img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  display: block;
}

.quote-card {
  background: #2d2b2a;
  border-radius: 8px;
  padding: 24px 20px;
  margin-bottom: 14px;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.quote-card::before {
  content: '"';
  position: absolute;
  top: -10px;
  left: 10px;
  font-family: "Ma Shan Zheng", cursive;
  font-size: 100px;
  color: rgba(255, 255, 255, 0.06);
  line-height: 1;
}

.quote-card p {
  font-size: 13.5px;
  line-height: 1.9;
  color: #eee8e0;
  position: relative;
  z-index: 1;
  white-space: pre-line;
}

.end-card {
  text-align: center;
  padding: 40px 20px;
  background: #fff;
  border: 2px solid #3d3a38;
  border-radius: 8px;
  margin-top: 32px;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.07);
}

.end-hearts {
  font-size: 20px;
  letter-spacing: 6px;
  margin-bottom: 12px;
  color: var(--preview-accent);
}

.end-sub {
  font-size: 12px;
  color: #6b6460;
  line-height: 2;
  white-space: pre-line;
}

@media (max-width: 768px) {
  .preview-panel {
    width: 100%;
    display: none;
    height: calc(100vh - 52px);

    &.mobile-active {
      display: flex;
    }
  }

  .preview-frame-wrap {
    padding: 12px 0;
  }

  .story-preview {
    width: calc(100vw - 24px);
    min-width: unset;
  }
}

@media (min-width: 769px) {
  .preview-panel {
    display: flex !important;
  }
}
</style>
