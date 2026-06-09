import axios from 'axios'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
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

    return Promise.reject(new Error(status ? `HTTP ${status}: ${message}` : message))
  },
)

export default request
