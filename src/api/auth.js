import request from './request.js'

export function login(payload) {
  return request.post('/auth/login', payload)
}

export function register(payload) {
  return request.post('/auth/register', payload)
}

export function fetchCurrentUser() {
  return request.get('/auth/user')
}
