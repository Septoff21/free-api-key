import { defineConfig } from 'vitepress'

// ────────────────────────────────────────────
// Sidebar definitions
// ────────────────────────────────────────────

const zhSidebar = [
  {
    text: '🌟 零基础入门',
    items: [
      { text: '5 步用上免费 AI', link: '/for-non-devs/zh/00-从零开始' },
      { text: 'OpenRouter 图文教程', link: '/for-non-devs/zh/01-openrouter图文' },
      { text: 'Gemini 图文教程', link: '/for-non-devs/zh/02-gemini-tuweng' },
    ],
  },
  {
    text: '📦 提供商详情',
    collapsed: false,
    items: [
      { text: 'OpenRouter — 模型超市', link: '/docs/zh/01-openrouter' },
      { text: 'Gemini — 谷歌出品', link: '/docs/zh/02-gemini' },
      { text: 'Groq — 极速推理', link: '/docs/zh/03-groq' },
      { text: 'Cerebras — 硅晶芯片', link: '/docs/zh/04-cerebras' },
      { text: 'GitHub Models — 微软', link: '/docs/zh/05-github-models' },
      { text: 'Mistral — 欧洲之光', link: '/docs/zh/06-mistral' },
      { text: 'Cloudflare Workers AI', link: '/docs/zh/07-cloudflare' },
      { text: 'Ollama — 完全本地', link: '/docs/zh/08-ollama' },
    ],
  },
  {
    text: '🔒 隐私与安全',
    items: [
      { text: '隐私矩阵对比', link: '/docs/zh/06-privacy-matrix' },
    ],
  },
  {
    text: '🎯 能力矩阵',
    collapsed: true,
    items: [
      { text: '总览 Quick-Ref', link: '/docs/zh/capability/00-index' },
      { text: '视觉输入 (Vision-In)', link: '/docs/zh/capability/01-vision-in' },
      { text: '图像生成 (Image-Gen)', link: '/docs/zh/capability/02-image-gen' },
      { text: 'Agent 工具调用', link: '/docs/zh/capability/03-agent-tool-use' },
      { text: '长上下文', link: '/docs/zh/capability/04-long-context' },
      { text: '代码生成', link: '/docs/zh/capability/05-code' },
      { text: '推理能力', link: '/docs/zh/capability/06-reasoning' },
      { text: '其他模态 (音频/视频)', link: '/docs/zh/capability/07-other-modalities' },
    ],
  },
  {
    text: '🔧 客户端接入',
    collapsed: true,
    items: [
      { text: 'opencode CLI', link: '/docs/zh/clients/01-opencode' },
      { text: 'Cline (VS Code)', link: '/docs/zh/clients/02-cline' },
      { text: 'Continue', link: '/docs/zh/clients/03-continue' },
      { text: 'Cursor BYOK', link: '/docs/zh/clients/04-cursor' },
      { text: 'LibreChat', link: '/docs/zh/clients/05-librechat' },
      { text: 'Open WebUI', link: '/docs/zh/clients/06-openwebui' },
      { text: 'Chatbox', link: '/docs/zh/clients/07-chatbox' },
    ],
  },
  {
    text: '📖 场景 Recipes',
    collapsed: true,
    items: [
      { text: 'Agent 循环 (ReAct)', link: '/docs/zh/recipes/01-agent-loop' },
      { text: '视觉分析', link: '/docs/zh/recipes/02-vision-analyze' },
      { text: 'LiteLLM Router', link: '/docs/zh/recipes/03-litellm-router' },
      { text: '图像生成', link: '/docs/zh/recipes/04-image-generation' },
      { text: '配额最大化', link: '/docs/zh/recipes/05-quota-maximizer' },
    ],
  },
  {
    text: '⚙️ 运维参考',
    collapsed: true,
    items: [
      { text: '服务状态', link: '/docs/zh/97-status' },
      { text: '新鲜度策略', link: '/docs/zh/96-freshness-policy' },
      { text: '维护手册', link: '/docs/zh/95-maintenance' },
    ],
  },
]

const enSidebar = [
  {
    text: '📦 Providers',
    collapsed: false,
    items: [
      { text: 'OpenRouter', link: '/docs/en/01-openrouter' },
      { text: 'Gemini', link: '/docs/en/02-gemini' },
      { text: 'Groq', link: '/docs/en/03-groq' },
      { text: 'Cerebras', link: '/docs/en/04-cerebras' },
      { text: 'GitHub Models', link: '/docs/en/05-github-models' },
      { text: 'Mistral', link: '/docs/en/06-mistral' },
      { text: 'Cloudflare Workers AI', link: '/docs/en/07-cloudflare' },
      { text: 'Ollama (local)', link: '/docs/en/08-ollama' },
    ],
  },
  {
    text: '🔒 Privacy',
    items: [
      { text: 'Privacy Matrix', link: '/docs/en/06-privacy-matrix' },
    ],
  },
  {
    text: '🎯 Capability Matrix',
    collapsed: true,
    items: [
      { text: 'Quick-Ref Index', link: '/docs/en/capability/00-index' },
    ],
  },
  {
    text: '🔧 Client Guides',
    collapsed: true,
    items: [
      { text: 'opencode CLI', link: '/docs/en/clients/01-opencode' },
      { text: 'Cline (VS Code)', link: '/docs/en/clients/02-cline' },
      { text: 'Continue', link: '/docs/en/clients/03-continue' },
      { text: 'Cursor BYOK', link: '/docs/en/clients/04-cursor' },
      { text: 'LibreChat', link: '/docs/en/clients/05-librechat' },
      { text: 'Open WebUI', link: '/docs/en/clients/06-openwebui' },
      { text: 'Chatbox', link: '/docs/en/clients/07-chatbox' },
    ],
  },
  {
    text: '📖 Recipes',
    collapsed: true,
    items: [
      { text: 'Agent Loop (ReAct)', link: '/docs/en/recipes/01-agent-loop' },
      { text: 'Vision Analyze', link: '/docs/en/recipes/02-vision-analyze' },
      { text: 'LiteLLM Router', link: '/docs/en/recipes/03-litellm-router' },
      { text: 'Image Generation', link: '/docs/en/recipes/04-image-generation' },
      { text: 'Quota Maximizer', link: '/docs/en/recipes/05-quota-maximizer' },
    ],
  },
  {
    text: '⚙️ Operations',
    collapsed: true,
    items: [
      { text: 'Status', link: '/docs/en/97-status' },
      { text: 'Freshness Policy', link: '/docs/en/96-freshness-policy' },
      { text: 'Maintenance', link: '/docs/en/95-maintenance' },
    ],
  },
]

// ────────────────────────────────────────────
// Main config
// ────────────────────────────────────────────

export default defineConfig({
  srcDir: '.',
  outDir: '.vitepress/dist',
  cacheDir: '.vitepress/cache',

  // Existing docs use relative file-system paths written before VitePress.
  // localhost:* links are intentional (Docker dev URLs).
  ignoreDeadLinks: true,

  // GitHub Pages: set base to your repo name
  // e.g. '/free-api-key/' if your repo is github.com/YOU/free-api-key
  base: '/free-api-key/',

  lang: 'zh-CN',
  title: '免费 AI API 指南',
  description: '8 大免费 LLM API 提供商完整指南 · 零代码入门 · 一键检测 · 双语文档',

  head: [
    ['meta', { name: 'theme-color', content: '#5B8AF0' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '免费 AI API 指南' }],
    ['meta', { property: 'og:description', content: '8 大免费 LLM API 提供商 · 零代码入门 · 一键检测' }],
  ],

  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: '免费 AI 指南',

    // ── Search ──────────────────────────────
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索' },
              modal: {
                noResultsText: '无相关结果',
                resetButtonTitle: '清除',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
              },
            },
          },
        },
      },
    },

    // ── Navigation ──────────────────────────
    nav: [
      {
        text: '🚀 零基础入门',
        link: '/for-non-devs/zh/00-从零开始',
        activeMatch: '/for-non-devs/',
      },
      {
        text: '📦 提供商',
        link: '/docs/zh/01-openrouter',
        activeMatch: '/docs/zh/(0[1-8]|06-privacy)',
      },
      {
        text: '🔧 客户端',
        link: '/docs/zh/clients/01-opencode',
        activeMatch: '/docs/zh/clients/',
      },
      {
        text: '📖 更多',
        items: [
          { text: '🎯 能力矩阵', link: '/docs/zh/capability/00-index' },
          { text: '🍳 场景 Recipes', link: '/docs/zh/recipes/01-agent-loop' },
          { text: '🔒 隐私矩阵', link: '/docs/zh/06-privacy-matrix' },
          { text: '📊 服务状态', link: '/docs/zh/97-status' },
        ],
      },
      {
        text: 'English',
        items: [
          { text: 'Provider Docs', link: '/docs/en/01-openrouter' },
          { text: 'Client Guides', link: '/docs/en/clients/01-opencode' },
          { text: 'Recipes', link: '/docs/en/recipes/01-agent-loop' },
          { text: 'Status', link: '/docs/en/97-status' },
        ],
      },
    ],

    // ── Sidebar ─────────────────────────────
    sidebar: {
      '/for-non-devs/': zhSidebar,
      '/docs/zh/': zhSidebar,
      '/docs/en/': enSidebar,
    },

    // ── Social links ─────────────────────────
    socialLinks: [
      { icon: 'github', link: 'https://github.com/septoff21/free-api-key' },
    ],

    // ── Footer ───────────────────────────────
    footer: {
      message: '代码 <a href="https://opensource.org/licenses/MIT">MIT License</a> · 文档 <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC-BY-SA 4.0</a>',
      copyright: '© 2026 free-api-key contributors',
    },

    // ── Edit link ────────────────────────────
    editLink: {
      pattern: 'https://github.com/septoff21/free-api-key/edit/main/:path',
      text: '在 GitHub 上编辑此页面',
    },

    // ── Last updated ─────────────────────────
    lastUpdated: {
      text: '最后更新于',
      formatOptions: { dateStyle: 'short' },
    },

    // ── i18n strings ─────────────────────────
    docFooter: { prev: '上一篇', next: '下一篇' },
    outline: { label: '页面目录', level: [2, 3] },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换浅色模式',
    darkModeSwitchTitle: '切换深色模式',
  },

  // ── Exclude non-doc markdown files ─────────
  srcExclude: [
    'README.md',
    'README.en.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'PHASES.md',
    'phases/**',
    'data/**',
    'node_modules/**',
  ],
})
