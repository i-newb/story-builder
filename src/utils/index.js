export function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function nl2br(s) {
  return String(s || '').replace(/\n/g, '<br>')
}

export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export const NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

export const BLOCK_LABELS = {
  narrator: '旁白',
  dialogue: '对话',
  phone: '手机聊天',
  quote: '金句卡片',
  monologue: '内心独白',
  timestamp: '时间地点',
  illustration: '场景插图',
}

export const BLOCK_TAG_CLASS = {
  narrator: 'tag-narrator',
  dialogue: 'tag-dialogue',
  phone: 'tag-phone',
  quote: 'tag-quote',
  monologue: 'tag-monologue',
  timestamp: 'tag-timestamp',
  illustration: 'tag-illustration',
}

export function getBlockPreview(block) {
  if (block.type === 'phone') return block.header || '手机消息'
  if (block.type === 'timestamp') return [block.time, block.place].filter(Boolean).join(' · ') || '时间地点'
  if (block.type === 'illustration') return (block.prompt || '').slice(0, 30) || '场景插图'
  return (block.text || '').replace(/\n/g, ' ').slice(0, 30)
}

let _charIdCounter = 2
export function newCharId() {
  return 'c' + (++_charIdCounter + Date.now() % 10000)
}
export function resetCharIdCounter(n = 2) {
  _charIdCounter = n
}
