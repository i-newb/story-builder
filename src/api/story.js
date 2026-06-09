import request from './request.js'

export function generateStory(payload) {
  return request.post('/story/generate', payload)
}

export function generateZhipuImage(payload) {
  return request.post('/zhipu/image-generate', payload)
}
