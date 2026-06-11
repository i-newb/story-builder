import request from "./request.js";

export function generateAIStory(payload) {
  return request.post("/ai/story-generate", payload);
}

export function generateAIImage(payload) {
  return request.post("/ai/image-generate", payload);
}

export function fetchStories() {
  return request.get("/story-list");
}

export function fetchStoryById(id) {
  return request.post(`/story-detail`, { id });
}

export function createStory(payload) {
  return request.post("/story-add", payload);
}

export function updateStory(id, payload) {
  return request.put(`/story-update`, { id, ...payload });
}

export function deleteStory(id) {
  return request.delete("/story-delete", { data: { id } });
}
