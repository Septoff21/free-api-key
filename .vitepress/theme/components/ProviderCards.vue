<template>
  <div class="provider-grid">
    <a
      v-for="p in providers"
      :key="p.key"
      :href="withBase(p.link)"
      class="provider-card"
    >
      <div class="provider-card-header">
        <span class="provider-card-icon">{{ p.icon }}</span>
        <div>
          <div class="provider-card-name">{{ p.name }}</div>
          <p class="provider-card-tagline">{{ p.tagline }}</p>
        </div>
      </div>

      <p class="provider-card-desc">{{ p.desc }}</p>

      <div class="provider-card-tags">
        <span
          v-for="tag in p.tags"
          :key="tag.label"
          :class="['tag', `tag-${tag.type}`]"
        >{{ tag.label }}</span>
      </div>

      <div class="provider-card-footer">
        <span>{{ p.tier }}</span>
        <span class="arrow">→</span>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress'

interface Tag {
  label: string
  type: 'free' | 'fast' | 'private' | 'vision' | 'image' | 'local' | 'default'
}

interface Provider {
  key: string
  icon: string
  name: string
  tagline: string
  desc: string
  tags: Tag[]
  tier: string
  link: string
}

const providers: Provider[] = [
  {
    key: 'openrouter',
    icon: '🛒',
    name: 'OpenRouter',
    tagline: '模型聚合超市 · 200+ 模型一个 Key',
    desc: '一个账号，访问 DeepSeek、Llama、Gemma 等 200+ 模型。免费额度充足，不绑定信用卡。',
    tags: [
      { label: '免费', type: 'free' },
      { label: '不训练数据', type: 'private' },
      { label: '工具调用', type: 'default' },
      { label: '200+ 模型', type: 'default' },
    ],
    tier: '⭐⭐ 新手友好',
    link: '/docs/zh/01-openrouter',
  },
  {
    key: 'gemini',
    icon: '♊',
    name: 'Google Gemini',
    tagline: '谷歌出品 · 有谷歌账号即可',
    desc: '免费层开箱即用，Gemini 2.0 Flash 支持视觉输入。注意：免费层数据可能用于训练。',
    tags: [
      { label: '免费', type: 'free' },
      { label: '视觉输入', type: 'vision' },
      { label: '工具调用', type: 'default' },
      { label: '⚠️ 训练数据', type: 'default' },
    ],
    tier: '⭐ 最容易上手',
    link: '/docs/zh/02-gemini',
  },
  {
    key: 'groq',
    icon: '⚡',
    name: 'Groq',
    tagline: '业界最快推理 · LPU 专用芯片',
    desc: 'GroqLPU 让 Llama 3、Mixtral 达到极低延迟。追求极速响应的首选，免费层慷慨。',
    tags: [
      { label: '免费', type: 'free' },
      { label: '极速', type: 'fast' },
      { label: '不训练数据', type: 'private' },
      { label: '语音转文字', type: 'default' },
    ],
    tier: '⭐ 简单',
    link: '/docs/zh/03-groq',
  },
  {
    key: 'cerebras',
    icon: '🧠',
    name: 'Cerebras',
    tagline: '硅晶片推理 · 超低延迟',
    desc: 'CS-3 硅晶片让 Llama 3.1 达到毫秒级首字节。学术/研究免费，速度比 GPU 快数倍。',
    tags: [
      { label: '免费', type: 'free' },
      { label: '极速', type: 'fast' },
      { label: '不训练数据', type: 'private' },
    ],
    tier: '⭐ 简单',
    link: '/docs/zh/04-cerebras',
  },
  {
    key: 'github-models',
    icon: '🐙',
    name: 'GitHub Models',
    tagline: '微软/GitHub · 需 GitHub 账号',
    desc: '登录 GitHub 即可试用 GPT-4o、Phi、Mistral 等微软生态模型，限速较严，适合测试。',
    tags: [
      { label: '免费', type: 'free' },
      { label: '不训练数据', type: 'private' },
      { label: '视觉输入', type: 'vision' },
      { label: '微软生态', type: 'default' },
    ],
    tier: '⭐ 简单',
    link: '/docs/zh/05-github-models',
  },
  {
    key: 'mistral',
    icon: '🌬️',
    name: 'Mistral',
    tagline: '欧洲之光 · GDPR 合规',
    desc: '法国开源 AI 旗舰，Codestral 代码补全专用。欧盟 GDPR 合规，不收集提示内容。',
    tags: [
      { label: '免费', type: 'free' },
      { label: 'GDPR', type: 'private' },
      { label: '代码特化', type: 'default' },
      { label: 'FIM 补全', type: 'default' },
    ],
    tier: '⭐ 简单',
    link: '/docs/zh/06-mistral',
  },
  {
    key: 'cloudflare',
    icon: '☁️',
    name: 'Cloudflare Workers AI',
    tagline: '全球 CDN 推理 · 支持图像生成',
    desc: '唯一同时支持文字生成 + 图像生成的免费提供商。FLUX、SDXL 图像生成免费可用。',
    tags: [
      { label: '免费', type: 'free' },
      { label: '图像生成', type: 'image' },
      { label: '全球 CDN', type: 'fast' },
      { label: '不训练数据', type: 'private' },
    ],
    tier: '⭐⭐ 需配置',
    link: '/docs/zh/07-cloudflare',
  },
  {
    key: 'ollama',
    icon: '🦙',
    name: 'Ollama',
    tagline: '完全本地 · 终极隐私保障',
    desc: '在你的电脑本地运行 Llama、Qwen、Phi 等模型。零网络请求，数据永不离开本机。',
    tags: [
      { label: '完全免费', type: 'free' },
      { label: '本地运行', type: 'local' },
      { label: '无限速', type: 'fast' },
      { label: '零隐私风险', type: 'private' },
    ],
    tier: '⭐⭐⭐ 需安装',
    link: '/docs/zh/08-ollama',
  },
]
</script>
