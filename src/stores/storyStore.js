import { defineStore } from "pinia";
import { ref } from "vue";
import { newCharId, NUMERALS } from "@/utils/index.js";

const VALID_BLOCK_TYPES = new Set(["narrator", "dialogue", "phone", "quote", "monologue", "timestamp", "illustration"]);

const defaultCharacters = () => [
  { id: "c0", name: "角色1", color: "#E0F0E4", side: "right" },
  { id: "c1", name: "角色2", color: "#FFF0E8", side: "left" },
];

export const defaultStory = () => ({
  title: "标题",
  subtitle: "副标题",
  tag: "图文故事",
  ending: "未完待续...",
  characters: defaultCharacters(),
  accent: "#C07858",
  bg: "#F7F3EE",
  chapters: [{ title: "第一章", numeral: "一", blocks: [] }],
});

export function cloneStory(value) {
  return JSON.parse(JSON.stringify(value));
}

export function migrateStory(story) {
  const draft = story && typeof story === "object" ? story : defaultStory();

  if (!Array.isArray(draft.chapters) || draft.chapters.length === 0) {
    draft.chapters = defaultStory().chapters;
  }

  if (!draft.characters) {
    draft.characters = [
      { id: "c0", name: draft.charA?.name || "角色1", color: draft.charA?.color || "#E0F0E4", side: "right" },
      { id: "c1", name: draft.charB?.name || "角色2", color: draft.charB?.color || "#FFF0E8", side: "left" },
    ];
    delete draft.charA;
    delete draft.charB;
  }

  if (!Array.isArray(draft.characters) || draft.characters.length === 0) {
    draft.characters = defaultCharacters();
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
  const characterIds = new Set(characters.map((char) => char.id));
  const fallbackSpeaker = characters[0]?.id || "c0";
  const resolveCharacterId = (value) => nameToId.get(value) || (characterIds.has(value) ? value : fallbackSpeaker);

  const chapters =
    Array.isArray(source.chapters) && source.chapters.length
      ? source.chapters.map((chapter, chapterIndex) => ({
          title: chapter.title || `第${chapterIndex + 1}章`,
          numeral: chapter.numeral || NUMERALS[chapterIndex] || String(chapterIndex + 1),
          blocks: Array.isArray(chapter.blocks)
            ? chapter.blocks.map((block) => {
                const type = VALID_BLOCK_TYPES.has(block.type) ? block.type : "narrator";
                const speaker = resolveCharacterId(block.speaker);
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
                  imageUrl: block.imageUrl || "",
                };

                if (type === "phone") {
                  normalized.messages = normalized.messages.map((message) => ({
                    charId: resolveCharacterId(message.charId || message.speaker),
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
        const next = { ...char, id: newCharId() };
        idMap.set(char.id, next.id);
        newCharacters.push(next);
      });

      story.value.characters = [...story.value.characters, ...newCharacters];
      story.value.chapters = [...story.value.chapters, ...normalized.chapters.map((chapter) => ({
        ...chapter,
        blocks: chapter.blocks.map((block) => {
          if (block.type === "dialogue" && idMap.has(block.speaker)) return { ...block, speaker: idMap.get(block.speaker) };
          if (block.type === "phone") {
            return {
              ...block,
              messages: (block.messages || []).map((message) => ({
                ...message,
                charId: idMap.get(message.charId) || message.charId,
              })),
            };
          }
          return block;
        }),
      }))];
      return;
    }

    story.value = normalized;
    activeStoryId.value = null;
  }

  return {
    story,
    library,
    activeStoryId,
    applyGeneratedStory,
  };
});
