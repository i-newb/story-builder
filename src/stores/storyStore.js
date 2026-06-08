import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { newCharId, resetCharIdCounter, NUMERALS } from "@/utils/index.js";

const STORAGE_KEY = "storyGenerator_draft";
const LIBRARY_KEY = "storyGenerator_library";

function migrateStory(s) {
  if (!s.characters) {
    s.characters = [
      { id: "c0", name: s.charA ? s.charA.name : "角色1", color: s.charA ? s.charA.color : "#E0F0E4", side: "right" },
      { id: "c1", name: s.charB ? s.charB.name : "角色2", color: s.charB ? s.charB.color : "#FFF0E8", side: "left" },
    ];
    delete s.charA;
    delete s.charB;
    (s.chapters || []).forEach((ch) => {
      (ch.blocks || []).forEach((b) => {
        if (b.type === "dialogue") {
          if (b.speaker === "A") b.speaker = "c0";
          else if (b.speaker === "B") b.speaker = "c1";
        }
        if (b.type === "phone") {
          (b.messages || []).forEach((m) => {
            if (m.side === "right" && !m.charId) m.charId = "c0";
            else if (!m.charId) m.charId = "c1";
          });
        }
      });
    });
  }
  return s;
}

const defaultStory = () => ({
  title: "标题",
  subtitle: "副标题",
  tag: "图文故事",
  ending: "愿每个人都能拥有自己真正想要的生活",
  characters: [
    { id: "c0", name: "角色1", color: "#E0F0E4", side: "right" },
    { id: "c1", name: "角色2", color: "#FFF0E8", side: "left" },
  ],
  accent: "#C07858",
  bg: "#F7F3EE",
  chapters: [{ title: "第一章", numeral: "一", blocks: [] }],
});

const defalutDraft = {
  title: "默认",
  subtitle: "",
  tag: "图文故事",
  ending: "未完待续...",
  characters: [
    {
      id: "c0",
      name: "楚子航",
      color: "#E0F0E4",
      side: "right",
    },
    {
      id: "c1",
      name: "楚天骄",
      color: "#FFF0E8",
      side: "left",
    },
    {
      id: "c7074",
      name: "神秘骑士",
      color: "#E8E0FF",
      side: "left",
    },
  ],
  accent: "#c07858",
  bg: "#f7f3ee",
  chapters: [
    {
      title: "雨夜高架",
      numeral: "一",
      blocks: [
        {
          type: "timestamp",
          text: "",
          thought: "",
          speaker: "c0",
          messages: [],
          header: "",
          time: "深夜",
          place: "城市高架桥",
        },
        {
          type: "narrator",
          text: "暴雨像无数根银针，从漆黑的天空坠落。\n黑色迈巴赫穿过积水，车灯切开浓重的雨幕。\n雨刷疯狂摆动。\n却依旧看不清前方。\n车内安静得过分。\n只有发动机低沉的轰鸣。",
          speaker: "c0",
        },
        {
          type: "narrator",
          text: "楚天骄单手扶着方向盘。另一只手夹着没点燃的香烟。他看起来和平时一样随意。甚至有些吊儿郎当。",
          speaker: "c0",
        },
        {
          type: "dialogue",
          text: "儿子",
          thought: "",
          speaker: "c1",
          messages: [],
          header: "",
        },
        {
          type: "dialogue",
          text: "你知道这车多少钱吗？",
          thought: "",
          speaker: "c1",
          messages: [],
          header: "",
        },
        {
          type: "narrator",
          text: "楚子航没有回答。\n窗外的雨倒映在他的侧脸。\n像一道道流动的伤痕。",
          speaker: "c0",
        },
        {
          type: "dialogue",
          text: "反正把你卖了也赔不起。",
          thought: "楚天骄自顾自笑了。",
          speaker: "c1",
          messages: [],
          header: "",
        },
      ],
    },
    {
      title: "对峙",
      numeral: "二",
      blocks: [
        {
          type: "timestamp",
          text: "",
          thought: "",
          speaker: "c0",
          messages: [],
          header: "",
          place: "桥面尽头 ",
        },
        {
          type: "narrator",
          text: "一道身影\n高大的黑色战马。\n披着破碎风氅的骑士。\n独眼燃烧着金色火焰。\n仿佛来自神话深处。",
          speaker: "c0",
        },
        {
          type: "dialogue",
          text: "那是什么东西？",
          thought: "楚子航握紧座椅扶手,掌心已经被汗水浸透。他听见自己的声音在发抖。",
          speaker: "c0",
          messages: [],
          header: "",
        },
        {
          type: "dialogue",
          text: "记住\n等会儿无论发生什么\n都不要回头",
          thought: "楚天骄推开车门。雨水拍打在他的脸上。",
          speaker: "c1",
          messages: [],
          header: "",
        },
        {
          type: "dialogue",
          text: "你要干什么？",
          thought: "楚子航猛地抬头",
          speaker: "c0",
          messages: [],
          header: "",
        },
        {
          type: "narrator",
          text: "楚天骄从后备箱抽出长刀。\n刀锋在雷光下泛起炽烈的红色。\n仿佛燃烧的流星。",
          speaker: "c0",
        },
        {
          type: "dialogue",
          text: "去给你争一条活路。",
          thought: "",
          speaker: "c1",
          messages: [],
          header: "",
        },
        {
          type: "narrator",
          text: "骑士缓缓举起长枪。\n黑影开始向前移动。\n暴雨变成一场盛大的葬礼。",
          thought: "",
          speaker: "c0",
          messages: [],
          header: "",
        },
        {
          type: "phone",
          text: "儿子。\n这次。",
          thought: "",
          speaker: "c1",
          messages: [
            {
              side: "left",
              text: "儿子",
            },
            {
              side: "left",
              text: "这次",
            },
            {
              side: "left",
              text: "相信老爹",
            },
          ],
          header: "—— 楚天骄 ——",
        },
        {
          type: "monologue",
          text: "雷光坠落。\n世界被照成惨白色。\n迈巴赫的引擎发出野兽般的咆哮。\n而战争，\n在这一刻开始。",
          thought: "",
          speaker: "c0",
          messages: [],
          header: "",
        },
      ],
    },
  ],
};

export const useStoryStore = defineStore("story", () => {
  const story = ref(defaultStory());
  const library = ref([]);
  const activeStoryId = ref(null);

  // Load from localStorage
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      story.value = migrateStory(saved ? JSON.parse(saved) : defalutDraft);
    } catch (e) {}
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

  // Characters
  function addChar() {
    story.value.characters.push({ id: newCharId(), name: "新角色", color: "#E8E0FF", side: "left" });
    save();
  }

  function deleteChar(ci) {
    if (story.value.characters.length <= 1) {
      alert("至少保留一个角色");
      return;
    }
    const removedId = story.value.characters[ci].id;
    story.value.characters.splice(ci, 1);
    story.value.chapters.forEach((ch) => {
      ch.blocks.forEach((b) => {
        if (b.type === "dialogue" && b.speaker === removedId) b.speaker = story.value.characters[0].id;
        if (b.type === "phone") {
          (b.messages || []).forEach((m) => {
            if (m.charId === removedId) m.charId = story.value.characters[0].id;
          });
        }
      });
    });
    save();
  }

  // Chapters
  function addChapter() {
    const idx = story.value.chapters.length;
    const defaultSpeaker = story.value.characters[0] ? story.value.characters[0].id : "c0";
    story.value.chapters.push({
      title: "新章节",
      numeral: NUMERALS[idx] || String(idx + 1),
      blocks: [{ type: "narrator", text: "", speaker: defaultSpeaker }],
    });
    save();
  }

  function deleteChapter(ci) {
    if (story.value.chapters.length <= 1) {
      alert("至少保留一个章节");
      return;
    }
    story.value.chapters.splice(ci, 1);
    save();
  }

  // Blocks
  function addBlock(ci) {
    const defaultSpeaker = story.value.characters[0] ? story.value.characters[0].id : "c0";
    story.value.chapters[ci].blocks.push({ type: "narrator", text: "", speaker: defaultSpeaker });
    save();
  }

  function deleteBlock(ci, bi) {
    story.value.chapters[ci].blocks.splice(bi, 1);
    save();
  }

  function changeBlockType(ci, bi, newType) {
    const old = story.value.chapters[ci].blocks[bi];
    const defaultSpeaker = story.value.characters[0] ? story.value.characters[0].id : "c0";
    story.value.chapters[ci].blocks[bi] = {
      type: newType,
      text: old.text || "",
      thought: "",
      speaker: old.speaker || defaultSpeaker,
      messages: old.messages || [],
      header: old.header || "",
    };
    save();
  }

  function addPhoneMsg(ci, bi) {
    if (!story.value.chapters[ci].blocks[bi].messages) story.value.chapters[ci].blocks[bi].messages = [];
    story.value.chapters[ci].blocks[bi].messages.push({ side: "left", text: "" });
    save();
  }

  function deletePhoneMsg(ci, bi, mi) {
    story.value.chapters[ci].blocks[bi].messages.splice(mi, 1);
    save();
  }

  // Library
  function completeStory() {
    if (!story.value.title || story.value.title.trim() === "") {
      alert("请先填写故事标题再保存");
      return false;
    }
    const now = new Date().toLocaleDateString("zh-CN");
    if (activeStoryId.value) {
      const idx = library.value.findIndex((s) => s.id === activeStoryId.value);
      if (idx !== -1) {
        library.value[idx] = {
          ...library.value[idx],
          title: story.value.title,
          tag: story.value.tag,
          savedAt: now,
          story: JSON.parse(JSON.stringify(story.value)),
        };
        saveLibrary();
        return "✓ 已更新！";
      }
    }
    const saved = {
      id: Date.now(),
      title: story.value.title,
      tag: story.value.tag,
      savedAt: now,
      story: JSON.parse(JSON.stringify(story.value)),
    };
    library.value.unshift(saved);
    activeStoryId.value = saved.id;
    saveLibrary();
    return "✓ 已保存！";
  }

  function loadStoryFromLibrary(id) {
    const found = library.value.find((s) => s.id === id);
    if (!found) return;
    story.value = migrateStory(JSON.parse(JSON.stringify(found.story)));
    activeStoryId.value = id;
    save();
  }

  function deleteFromLibrary(id) {
    if (!confirm("确认删除这篇故事？")) return;
    library.value = library.value.filter((s) => s.id !== id);
    if (activeStoryId.value === id) activeStoryId.value = null;
    saveLibrary();
  }

  function newStory() {
    if (!confirm("新建故事将清空当前编辑内容，确认？")) return;
    story.value = defaultStory();
    activeStoryId.value = null;
    resetCharIdCounter(2);
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
  };
});
