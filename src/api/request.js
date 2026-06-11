import axios from 'axios'

const AUTH_STORAGE_KEY = 'story-builder-auth'

function getStoredSession() {
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

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 360000,
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use(config => {
  const session = getStoredSession()
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }

  return config
})

request.interceptors.response.use(
  response => response.data,
  error => {
    const status = error.response?.status
    const data = error.response?.data
    const message =
      data?.error?.message ||
      data?.message ||
      error.message ||
      '接口请求失败'

    if (status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      window.dispatchEvent(new CustomEvent('story-builder-auth-expired'))
    }

    return Promise.reject(new Error(status ? `HTTP ${status}: ${message}` : message))
  },
)

export default request
