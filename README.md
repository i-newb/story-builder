# 故事生成器 — Vue 3 + Vite

原 `index.html` 单文件应用已重构为 **Vue 3 + Vite + Pinia** 项目。

## 项目结构

```
story-generator/
├── index.html              # Vite 入口 HTML
├── vite.config.js          # Vite 配置
├── package.json
└── src/
    ├── main.js             # 应用入口，挂载 Vue + Pinia
    ├── App.vue             # 根组件（布局 + 标签页切换 + 导出）
    ├── styles/
    │   └── global.css      # 全局样式与 CSS 变量
    ├── stores/
    │   └── storyStore.js   # Pinia store（故事数据 + localStorage 持久化）
    ├── utils/
    │   ├── index.js        # 工具函数、常量（BLOCK_LABELS、escHtml 等）
    │   └── htmlGenerator.js # 生成预览/导出用的完整 HTML 字符串
    └── components/
        ├── TopBar.vue      # 顶部导航栏（Logo、标签页、操作按钮）
        ├── EditorPanel.vue # 左侧编辑面板（元信息、角色、配色、章节）
        ├── ChapterCard.vue # 单个章节折叠卡片（含内容块列表）
        ├── BlockEditor.vue # 单个内容块编辑器（旁白/对话/手机/金句/…）
        ├── PreviewPanel.vue# 中间预览面板（iframe 实时渲染）
        └── LibraryPanel.vue# 右侧故事库面板
```

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:5173 即可。

## 构建生产版本

```bash
npm run build      # 输出到 dist/
npm run preview    # 本地预览构建产物
```

## AI 插图生成

`BlockEditor.vue` 中的 `generateIllustration()` 默认通过 `/api/v1/messages` 代理调用 Anthropic API。
本地开发时请启动代理服务器（或修改 `vite.config.js` 添加 proxy 配置）。

```js
// vite.config.js 开发代理示例
server: {
  proxy: {
    '/api': {
      target: 'https://api.anthropic.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY }
    }
  }
}
```
