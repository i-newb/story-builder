import { defineStore } from "pinia";
import { ref } from "vue";
import { newCharId, resetCharIdCounter, NUMERALS } from "@/utils/index.js";

const STORAGE_KEY = "storyGenerator_draft";
const LIBRARY_KEY = "storyGenerator_library";
const VALID_BLOCK_TYPES = new Set(["narrator", "dialogue", "phone", "quote", "monologue", "timestamp", "illustration"]);

const defaultCharacters = () => [
  { id: "c0", name: "角色1", color: "#E0F0E4", side: "right" },
  { id: "c1", name: "角色2", color: "#FFF0E8", side: "left" },
];

const defaultStory = () => ({
  title: "标题",
  subtitle: "副标题",
  tag: "图文故事",
  ending: "未完待续...",
  characters: defaultCharacters(),
  accent: "#C07858",
  bg: "#F7F3EE",
  chapters: [{ title: "第一章", numeral: "一", blocks: [] }],
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function migrateStory(story) {
  const draft = story || defaultStory();

  if (!draft.characters) {
    draft.characters = [
      { id: "c0", name: draft.charA?.name || "角色1", color: draft.charA?.color || "#E0F0E4", side: "right" },
      { id: "c1", name: draft.charB?.name || "角色2", color: draft.charB?.color || "#FFF0E8", side: "left" },
    ];
    delete draft.charA;
    delete draft.charB;
  }

  const fallbackSpeaker = draft.characters[0]?.id || "c0";
  (draft.chapters || []).forEach((chapter) => {
    chapter.blocks = chapter.blocks || [];
    chapter.blocks.forEach((block) => {
      if (!VALID_BLOCK_TYPES.has(block.type)) block.type = "narrator";
      if (!block.speaker) block.speaker = fallbackSpeaker;
      if (block.type === "dialogue") {
        if (block.speaker === "A") block.speaker = "c0";
        if (block.speaker === "B") block.speaker = "c1";
      }
      if (block.type === "phone") {
        block.messages = block.messages || [];
        block.messages.forEach((message) => {
          if (!message.charId) {
            message.charId = message.side === "right" ? "c0" : draft.characters[1]?.id || fallbackSpeaker;
          }
        });
      }
    });
  });

  return draft;
}

function normalizeGeneratedStory(input) {
  const source = input?.story || input || {};
  const base = defaultStory();

  const characters =
    Array.isArray(source.characters) && source.characters.length
      ? source.characters.map((char, index) => ({
          id: char.id || `c${index}`,
          name: char.name || `角色${index + 1}`,
          color: char.color || (index % 2 === 0 ? "#E0F0E4" : "#FFF0E8"),
          side: char.side === "right" ? "right" : "left",
        }))
      : defaultCharacters();

  const nameToId = new Map(characters.map((char) => [char.name, char.id]));
  const fallbackSpeaker = characters[0]?.id || "c0";

  const chapters =
    Array.isArray(source.chapters) && source.chapters.length
      ? source.chapters.map((chapter, chapterIndex) => ({
          title: chapter.title || `第${chapterIndex + 1}章`,
          numeral: chapter.numeral || NUMERALS[chapterIndex] || String(chapterIndex + 1),
          blocks: Array.isArray(chapter.blocks)
            ? chapter.blocks.map((block) => {
                const type = VALID_BLOCK_TYPES.has(block.type) ? block.type : "narrator";
                const speaker = nameToId.get(block.speaker) || block.speaker || fallbackSpeaker;
                const normalized = {
                  type,
                  text: block.text || "",
                  thought: block.thought || "",
                  speaker,
                  messages: Array.isArray(block.messages) ? block.messages : [],
                  header: block.header || "",
                  time: block.time || "",
                  place: block.place || "",
                  prompt: block.prompt || "",
                  svg: block.svg || "",
                };

                if (type === "phone") {
                  normalized.messages = normalized.messages.map((message) => ({
                    charId: nameToId.get(message.charId) || nameToId.get(message.speaker) || message.charId || fallbackSpeaker,
                    side: message.side === "right" ? "right" : "left",
                    text: message.text || "",
                  }));
                }

                return normalized;
              })
            : [],
        }))
      : base.chapters;

  return migrateStory({
    title: source.title || base.title,
    subtitle: source.subtitle || "",
    tag: source.tag || base.tag,
    ending: source.ending || base.ending,
    characters,
    accent: source.accent || base.accent,
    bg: source.bg || base.bg,
    chapters,
  });
}

export const useStoryStore = defineStore("story", () => {
  const story = ref(defaultStory());
  const library = ref([]);
  const activeStoryId = ref(null);

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      story.value = migrateStory(saved ? JSON.parse(saved) : defaultStory());
    } catch (e) {
      story.value = defaultStory();
    }

    try {
      library.value = JSON.parse(localStorage.getItem(LIBRARY_KEY) || "[]");
    } catch (e) {
      library.value = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(story.value));
    } catch (e) {}
  }

  function saveLibrary() {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(library.value));
    } catch (e) {}
  }

  function addChar() {
    story.value.characters.push({ id: newCharId(), name: "新角色", color: "#E8E0FF", side: "left" });
    save();
  }

  function deleteChar(index) {
    if (story.value.characters.length <= 1) {
      alert("至少保留一个角色");
      return;
    }

    const removedId = story.value.characters[index].id;
    story.value.characters.splice(index, 1);
    const fallbackSpeaker = story.value.characters[0].id;

    story.value.chapters.forEach((chapter) => {
      chapter.blocks.forEach((block) => {
        if (block.type === "dialogue" && block.speaker === removedId) block.speaker = fallbackSpeaker;
        if (block.type === "phone") {
          (block.messages || []).forEach((message) => {
            if (message.charId === removedId) message.charId = fallbackSpeaker;
          });
        }
      });
    });

    save();
  }

  function addChapter() {
    const index = story.value.chapters.length;
    const defaultSpeaker = story.value.characters[0]?.id || "c0";
    story.value.chapters.push({
      title: "新章节",
      numeral: NUMERALS[index] || String(index + 1),
      blocks: [{ type: "narrator", text: "", speaker: defaultSpeaker }],
    });
    save();
  }

  function deleteChapter(index) {
    if (story.value.chapters.length <= 1) {
      alert("至少保留一个章节");
      return;
    }
    story.value.chapters.splice(index, 1);
    save();
  }

  function addBlock(chapterIndex) {
    const defaultSpeaker = story.value.characters[0]?.id || "c0";
    story.value.chapters[chapterIndex].blocks.push({ type: "narrator", text: "", speaker: defaultSpeaker });
    save();
  }

  function deleteBlock(chapterIndex, blockIndex) {
    story.value.chapters[chapterIndex].blocks.splice(blockIndex, 1);
    save();
  }

  function changeBlockType(chapterIndex, blockIndex, newType) {
    const old = story.value.chapters[chapterIndex].blocks[blockIndex];
    const defaultSpeaker = story.value.characters[0]?.id || "c0";
    story.value.chapters[chapterIndex].blocks[blockIndex] = {
      type: newType,
      text: old.text || "",
      thought: "",
      speaker: old.speaker || defaultSpeaker,
      messages: old.messages || [],
      header: old.header || "",
      time: old.time || "",
      place: old.place || "",
      prompt: old.prompt || "",
      svg: old.svg || "",
    };
    save();
  }

  function addPhoneMsg(chapterIndex, blockIndex) {
    const block = story.value.chapters[chapterIndex].blocks[blockIndex];
    const fallbackSpeaker = story.value.characters[0]?.id || "c0";
    if (!block.messages) block.messages = [];
    block.messages.push({ charId: fallbackSpeaker, side: "left", text: "" });
    save();
  }

  function deletePhoneMsg(chapterIndex, blockIndex, messageIndex) {
    story.value.chapters[chapterIndex].blocks[blockIndex].messages.splice(messageIndex, 1);
    save();
  }

  function completeStory() {
    if (!story.value.title?.trim()) {
      alert("请先填写故事标题再保存");
      return false;
    }

    const savedAt = new Date().toLocaleDateString("zh-CN");
    if (activeStoryId.value) {
      const index = library.value.findIndex((item) => item.id === activeStoryId.value);
      if (index !== -1) {
        library.value[index] = {
          ...library.value[index],
          title: story.value.title,
          tag: story.value.tag,
          savedAt,
          story: clone(story.value),
        };
        saveLibrary();
        return "已更新";
      }
    }

    const saved = {
      id: Date.now(),
      title: story.value.title,
      tag: story.value.tag,
      savedAt,
      story: clone(story.value),
    };
    library.value.unshift(saved);
    activeStoryId.value = saved.id;
    saveLibrary();
    return "已保存";
  }

  function loadStoryFromLibrary(id) {
    const found = library.value.find((item) => item.id === id);
    if (!found) return;
    story.value = migrateStory(clone(found.story));
    activeStoryId.value = id;
    save();
  }

  function deleteFromLibrary(id) {
    if (!confirm("确认删除这篇故事？")) return;
    library.value = library.value.filter((item) => item.id !== id);
    if (activeStoryId.value === id) activeStoryId.value = null;
    saveLibrary();
  }

  function newStory() {
    if (!confirm("新建故事会清空当前编辑内容，确认继续？")) return;
    story.value = defaultStory();
    activeStoryId.value = null;
    resetCharIdCounter(2);
    save();
  }

  function applyGeneratedStory(generatedStory, mode = "replace") {
    const normalized = normalizeGeneratedStory(generatedStory);

    if (mode === "append") {
      const existingByName = new Map(story.value.characters.map((char) => [char.name, char]));
      const idMap = new Map();
      const newCharacters = [];

      normalized.characters.forEach((char) => {
        const existing = existingByName.get(char.name);
        if (existing) {
          idMap.set(char.id, existing.id);
          return;
        }

        const nextChar = { ...char, id: newCharId() };
        idMap.set(char.id, nextChar.id);
        newCharacters.push(nextChar);
      });

      const appendedChapters = clone(normalized.chapters).map((chapter) => ({
        ...chapter,
        blocks: chapter.blocks.map((block) => ({
          ...block,
          speaker: idMap.get(block.speaker) || block.speaker,
          messages: (block.messages || []).map((message) => ({
            ...message,
            charId: idMap.get(message.charId) || message.charId,
          })),
        })),
      }));

      story.value.characters.push(...newCharacters);
      story.value.chapters.push(...appendedChapters);
      if (!story.value.subtitle && normalized.subtitle) story.value.subtitle = normalized.subtitle;
      if (!story.value.ending && normalized.ending) story.value.ending = normalized.ending;
    } else {
      story.value = normalized;
      activeStoryId.value = null;
    }

    save();
  }

  return {
    story,
    library,
    activeStoryId,
    load,
    save,
    addChar,
    deleteChar,
    addChapter,
    deleteChapter,
    addBlock,
    deleteBlock,
    changeBlockType,
    addPhoneMsg,
    deletePhoneMsg,
    completeStory,
    loadStoryFromLibrary,
    deleteFromLibrary,
    newStory,
    applyGeneratedStory,
  };
});
