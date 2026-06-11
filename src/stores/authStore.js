import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchCurrentUser, login as loginRequest, register as registerRequest } from '@/api/auth.js'

const AUTH_STORAGE_KEY = 'story-builder-auth'

function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null')
    if (!session?.token || !session?.expiresAt || Number(session.expiresAt) <= Date.now()) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return session
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

function saveSession(payload) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
    token: payload.token,
    expiresAt: payload.expiresAt,
  }))
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref('')
  const expiresAt = ref(0)
  const bootstrapped = ref(false)

  const isLoggedIn = computed(() => Boolean(token.value && user.value && expiresAt.value > Date.now()))
  const usage = computed(() => user.value?.usage || { storyGenerations: 0, imageGenerations: 0, limit: 5 })
  const remainingStories = computed(() => Math.max(0, usage.value.limit - usage.value.storyGenerations))
  const remainingImages = computed(() => Math.max(0, usage.value.limit - usage.value.imageGenerations))

  function applySession(payload) {
    token.value = payload.token
    expiresAt.value = Number(payload.expiresAt)
    user.value = payload.user
    saveSession(payload)
  }

  function clearSession() {
    token.value = ''
    expiresAt.value = 0
    user.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  async function restoreSession() {
    const session = readSession()
    if (!session) {
      bootstrapped.value = true
      return false
    }

    token.value = session.token
    expiresAt.value = Number(session.expiresAt)

    try {
      const result = await fetchCurrentUser()
      user.value = result.user
      bootstrapped.value = true
      return true
    } catch {
      clearSession()
      bootstrapped.value = true
      return false
    }
  }

  async function login(credentials) {
    const result = await loginRequest(credentials)
    applySession(result)
    return result
  }

  async function register(credentials) {
    const result = await registerRequest(credentials)
    applySession(result)
    return result
  }

  function updateUsage(nextUsage) {
    if (!user.value || !nextUsage) return
    user.value = {
      ...user.value,
      usage: {
        ...user.value.usage,
        ...nextUsage,
      },
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('story-builder-auth-expired', clearSession)
  }

  return {
    user,
    token,
    expiresAt,
    bootstrapped,
    isLoggedIn,
    usage,
    remainingStories,
    remainingImages,
    restoreSession,
    login,
    register,
    clearSession,
    updateUsage,
  }
})
