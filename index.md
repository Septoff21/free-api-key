---
layout: home

hero:
  name: "免费 AI API 指南"
  text: "8 大提供商 · 完全免费 · 零门槛"
  tagline: 不需要信用卡，不需要月租费。30 分钟配置好属于你的 AI 助手。
  image:
    src: /logo.svg
    alt: 免费 AI API 指南
  actions:
    - theme: brand
      text: 🚀 零基础 5 步入门
      link: /for-non-devs/zh/00-从零开始
    - theme: alt
      text: 📋 查看提供商文档
      link: /docs/zh/01-openrouter
    - theme: alt
      text: English →
      link: /docs/en/01-openrouter

features:
  - icon: 🌐
    title: 8 大提供商，全部免费
    details: OpenRouter · Gemini · Groq · Cerebras · GitHub Models · Mistral · Cloudflare Workers AI · Ollama。每家都有真实可用的免费额度，每月零花费。
  - icon: 🔍
    title: 一键检测 Key 是否有效
    details: 运行 <code>npm run check</code>，30 秒内测完所有 Key。彩色输出 ✓ / – / ✗，支持 CI JSON 模式。
  - icon: 📖
    title: 零基础图文教程
    details: 为完全不懂编程的用户设计的图文教程。5 步完成配置，包含截图说明和常见问题解答。
  - icon: 🔒
    title: 隐私矩阵对比
    details: 哪家训练数据？哪家有人工审核？每家提供商的隐私政策完整对比，帮你做出明智选择。
  - icon: ⚡
    title: 实时健康监控
    details: GitHub Actions 每周自动探测所有 Key 是否可用，生成状态徽章，有问题自动开 Issue。
  - icon: 🌍
    title: 完整双语文档
    details: 所有文档均有中文（权威版）和英文镜像。包含 curl · Python · Node.js 三种语言示例。
---

<div class="vp-doc" style="max-width:1152px;margin:0 auto;padding:0 24px;">

## 8 大提供商，选一个适合你的

<ProviderCards />

---

<div class="stats-row">
  <div class="stat-item">
    <span class="stat-number">8</span>
    <span class="stat-label">免费提供商</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">25+</span>
    <span class="stat-label">免费模型</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">¥0</span>
    <span class="stat-label">月度费用</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">7</span>
    <span class="stat-label">客户端接入指南</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">5</span>
    <span class="stat-label">场景 Recipes</span>
  </div>
</div>

---

## 快速开始路线图

### 🟢 路线 A：我是完全的新手（推荐大多数人）

1. 阅读 → **[零基础 5 步入门](/for-non-devs/zh/00-从零开始)**
2. 选择提供商 → **[Gemini（最简单）](/for-non-devs/zh/02-gemini-tuweng)** 或 **[OpenRouter（模型多）](/for-non-devs/zh/01-openrouter图文)**
3. 下载 **[Chatbox](https://chatboxai.app)** → 30 分钟内开始聊天

### 🔵 路线 B：我有一定技术基础

1. 直接看 **[提供商详细文档](/docs/zh/01-openrouter)**（含 curl / Python / Node.js 示例）
2. 复制 `configs/.env.example` → 填入 Key → `npm run check` 验证
3. 按需查看 **[客户端接入指南](/docs/zh/clients/01-opencode)** 或 **[场景 Recipes](/docs/zh/recipes/01-agent-loop)**

### 🟣 路线 C：我想在 AI 工具中使用（Cline、Cursor 等）

1. 看 **[客户端接入指南](/docs/zh/clients/01-opencode)** — 涵盖 7 种常用工具
2. 用 **[LiteLLM Router Recipe](/docs/zh/recipes/03-litellm-router)** 实现多提供商故障转移
3. 参考 **[能力矩阵](/docs/zh/capability/00-index)** 选择最适合你任务的模型

---

## 选择提供商

| 我的需求 | 推荐 | 理由 |
|---|---|---|
| 最简单，马上用 | **Gemini** | 有谷歌账号即可，无需配置 |
| 最多模型 | **OpenRouter** | 200+ 模型，一个 Key 全搞定 |
| 响应最快 | **Groq / Cerebras** | LPU / 硅晶片，毫秒级延迟 |
| 图像生成 | **Cloudflare Workers AI** | FLUX、SDXL 免费可用 |
| 完全隐私 | **Ollama** | 100% 本地，数据零外泄 |
| 欧盟 GDPR | **Mistral** | 法国公司，GDPR 合规 |

> 💡 **小提示：** 不确定选哪个？先用 Gemini 或 OpenRouter 开始，之后随时可以添加其他提供商。

</div>
