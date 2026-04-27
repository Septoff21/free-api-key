# Phase 00: Project Context（背景）

> 不交付任何代码或文档。这是给执行 agent 的"入职材料"。读完它你才能理解后续 phase 在做什么。

---

## 1. 项目目标

为中文用户做一个**免费 LLM API 实用手册 + 工具包**。

**用户痛点：**
- 想白嫖 LLM 但不知道有哪些供应商、限速多少
- 知道 OpenRouter / Gemini / Groq 但不知道怎么接到 Cursor / opencode / Cline 这些客户端
- 不知道哪些供应商会拿你的数据训模型（重要！）
- 非开发者完全不知道怎么开始
- 现有的英文项目（cheahjs/free-llm-api-resources）是好资源，但纯文档、纯英文、对小白门槛高

## 2. 用户画像

两类：

**A. 开发者**
- 会复制粘贴命令，会读 README
- 想要：可执行脚本、配置模板、客户端接入指南、路由策略
- 痛点：每次换供应商要重新搞一套环境

**B. 非开发者 / 半技术**
- 会用 ChatGPT 网页版，但 `export API_KEY=...` 看不懂
- 想要：截图教程、复制粘贴的步骤
- 痛点：教程默认你懂 terminal

文档要照顾两类，方法是分层：核心文档面向 A，`for-non-devs/` 面向 B。

## 3. 覆盖的供应商（v1.0.0）

按优先级排序，**只收录"永久免费层"，不收录试用额度**。

| # | Provider | 类型 | 为什么必收 |
|---|---|---|---|
| 1 | **OpenRouter** | 聚合器 | 一个 key 通吃所有模型，OpenAI 兼容，最适合做统一入口 |
| 2 | **Google Gemini (AI Studio)** | 一手 | 单家免费额度最大，2.5 Pro / Flash 都有 |
| 3 | **Groq** | 推理服务 | 速度最快，Llama / Kimi 免费额度可观 |
| 4 | **Cerebras** | 推理服务 | 推理速度比 Groq 还猛，免费额度小但够玩 |
| 5 | **GitHub Models** | 一手聚合 | 用 GitHub 账号就能用，模型多 |
| 6 | **Mistral La Plateforme** | 一手 | Codestral 免费，欧洲合规 |
| 7 | **Cloudflare Workers AI** | 推理服务 | 10万 neuron/天免费 |
| 8 | **Ollama** | 本地 | 完全免费 + 隐私 + 离线，作为兜底 |

**不收录的：**
- 任何"24-48 小时刷新"的可疑 key 列表项目（违 ToS）
- 仅试用额度（如 Anthropic / OpenAI 注册送 $5）
- 已经收费但有 free tier 名义的（HF Inference 现在大部分要付费）—— 除非真的能稳定用

## 4. 项目最终结构（目标态）

```
free-api-key/
├── README.md                  # 中文（主），README.en.md 英文
├── CHANGELOG.md               # Keep a Changelog 格式
├── CONTRIBUTING.md
├── LICENSE                    # MIT 或 CC-BY-SA-4.0（用户决定）
├── .gitignore
├── PHASES.md                  # 已存在
├── phases/                    # 已存在
│   ├── 00-context.md ~ 09-*.md
│   └── _status.md
├── providers.json             # 单一真相源
├── docs/
│   ├── zh/
│   │   ├── 01-openrouter.md
│   │   ├── 02-gemini.md
│   │   ├── 03-groq.md
│   │   ├── 04-cerebras.md
│   │   ├── 05-github-models.md
│   │   ├── 06-mistral.md
│   │   ├── 07-cloudflare-ai.md
│   │   ├── 08-ollama.md
│   │   ├── 20-clients/        # 客户端接入
│   │   │   ├── opencode.md
│   │   │   ├── cline.md
│   │   │   ├── continue.md
│   │   │   ├── cursor.md
│   │   │   ├── librechat.md
│   │   │   ├── openwebui.md
│   │   │   └── chatbox.md
│   │   ├── 30-recipes/
│   │   │   ├── code-completion.md
│   │   │   ├── chatbot.md
│   │   │   ├── agent-loop.md
│   │   │   ├── offline-private.md
│   │   │   └── max-free-quota.md
│   │   ├── 90-privacy.md       # 隐私/训练数据矩阵
│   │   ├── 91-compliance.md    # 合规边界
│   │   ├── 92-security.md      # 安全基线
│   │   └── 93-troubleshooting.md
│   └── en/                    # 镜像 zh
├── scripts/
│   ├── check-keys.mjs
│   ├── package.json
│   └── README.md
├── configs/
│   ├── .env.example
│   ├── litellm.config.yaml
│   └── gitignore.template
└── for-non-devs/
    └── zh/
        ├── 00-从零开始.md
        ├── 01-openrouter图文.md
        └── 02-gemini图文.md
```

## 5. 关键约定

### 文档风格
- **中文优先**，能用白话不用术语
- 每篇 provider 文档严格遵循同一个模板（见 phase 03）
- 限速 / 配额数字必须有 `Last Verified: YYYY-MM-DD` 标注
- 引用官方页必须给链接

### 数据流
```
官方页（真相源）
    ↓ 人工核对（Last Verified）
providers.json（结构化）
    ↓ 引用
docs/*.md + scripts/check-keys.mjs
```

**永远不要在 markdown 里硬编码会过期的数字而不注明来源。**

### 隐私矩阵（项目最大差异化）
每家供应商必须明确标注：
- **训练数据使用**：Yes / No / Opt-out
- **数据保留时长**：例 "30 days"
- **是否记录 prompts**
- **是否人工审查**

这一表是普通用户最需要、又最查不到的。值得花精力做对。

### 合规边界
要明确写出：
- 多账号轮询哪些 OK 哪些不 OK（OpenAI 禁，Gemini 多 GCP project 合规）
- 哪些行为会触发封号（高并发、爬虫式调用、明显 abuse 模式）

不要回避这话题；用户需要知道边界。

## 6. 必读外部资源

执行 phase 02-04 时**必须 WebFetch 这些页面**核对数据：

- OpenRouter docs: https://openrouter.ai/docs
- OpenRouter free models: https://openrouter.ai/models?max_price=0
- Google AI Studio limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Groq limits: https://console.groq.com/docs/rate-limits
- Cerebras docs: https://inference-docs.cerebras.ai/
- GitHub Models limits: https://docs.github.com/en/github-models/prototyping-with-ai-models#rate-limits
- Mistral pricing: https://mistral.ai/technology/#pricing
- Cloudflare Workers AI pricing: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Ollama: https://ollama.com/

参考但不抄：
- https://github.com/cheahjs/free-llm-api-resources
- https://github.com/amardeeplakshkar/awesome-free-llm-apis

## 7. 命名规范

- 文件名：英文小写 + 连字符，例 `openrouter.md`、`check-keys.mjs`
- Markdown 内中文标题 OK，英文文档用英文标题
- Provider key 在 `providers.json` 里：`openrouter`、`gemini`、`groq`、`cerebras`、`github_models`、`mistral`、`cloudflare`、`ollama`（snake_case）
- 模型名按官方原样写，不翻译

## 8. 不做什么（Out of Scope for v1.0.0）

- 不做账号注册自动化（违 ToS）
- 不做 key 中转 / 代理服务（这是 alistaitsacle 那种可疑项目的路子）
- 不收录付费 API 的"试用额度"
- 不做 Web UI / 前端面板
- 不做模型微调相关
- 不写中转的"魔法上网"教程（独立话题，让用户自行解决网络）

## 9. 用户性格 / 协作偏好

- 中文沟通
- 喜欢先讨论清楚再动手
- 重视规范（changelog、版本、Last Verified 这些）
- 不喜欢空泛的"完整方案"，喜欢分阶段交付可用产物
- 看到一次性塞太多东西会让你重做

**协作模式：每个 phase 完成后，简短汇报"做了什么 + 卡在哪 + 下一步建议"，等用户确认再开下一个 phase。**

---

读完这一篇，你应该能回答：
1. 这个项目和 cheahjs 的区别是什么？
2. 为什么 v1.0.0 只收 8 家不收 24 家？
3. 隐私矩阵为什么是核心差异化？
4. 多账号轮询能不能写？答案是什么？

如果其中任何一个回答不上来，回到上面对应章节重读。
