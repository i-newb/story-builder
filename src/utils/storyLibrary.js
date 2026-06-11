import { cloneStory, migrateStory } from '@/stores/storyStore.js'

function parseStoryPayload(value) {
  if (!value) return {}
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return {}
    }
  }
  return value
}

export function normalizeStoryPayload(payload) {
  return parseStoryPayload(
    payload?.story ||
      payload?.data?.story ||
      payload?.content ||
      payload?.data?.content ||
      payload?.data ||
      payload,
  )
}

function getStoryItems(payload) {
  const candidates = [
    payload?.stories,
    payload?.data?.stories,
    payload?.list,
    payload?.data?.list,
    payload?.records,
    payload?.data?.records,
    payload?.data,
    payload,
  ]

  return candidates.find(Array.isArray) || []
}

export function normalizeStoryLibrary(payload) {
  return getStoryItems(payload).map(item => {
    const storyPayload = normalizeStoryPayload(item)
    const story = migrateStory(cloneStory(storyPayload))

    return {
      id: item.id || item._id || story.id,
      title: item.title || story.title || '未命名故事',
      tag: item.tag || story.tag || '',
      savedAt: item.updatedAt || item.createdAt || item.savedAt || '',
      story,
    }
  })
}
