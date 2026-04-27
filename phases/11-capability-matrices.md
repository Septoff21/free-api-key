# Phase 11: Capability Matrices（多维能力矩阵）

**前置阅读：** `PHASES.md` + `phases/00-context.md` + `phases/conventions.md` + Phase 02 完成

> 这个 phase 回答用户"**哪家能干 X**"的问题，按能力维度横切 8 家 provider。

---

## 1. Goal

把"我要做 X"变成"看一张表就知道用哪家"。维度独立、可组合、面向真实用例。

## 2. 为什么需要

普通用户最常问的不是"OpenRouter 支持什么"，而是"哪家免费能看图？"、"哪家能跑 agent？"、"哪家能出图？"——按 provider 组织的文档无法直接回答这种横向问题。

## 3. 七大能力维度

| 维度 | 含义 | 用户常问 |
|---|---|---|
| **Vision-in** | 模型能"看"图（图片输入 → 文本输出） | "免费看图问问题" |
| **Image-gen** | 模型能"画"图（文本/图片 → 图片输出） | "免费出图" |
| **Agent / Tool use** | 函数调用 / 工具调用 | "跑 opencode / Cline / 自定义 agent" |
| **Long context** | 长上下文（≥200K tokens） | "塞整本书 / 整个仓库" |
| **Code-specialized** | 代码专精模型 | "代码补全 / 代码 review" |
| **Reasoning** | 可见思考过程（CoT trace） | "复杂数学 / 推理" |
| **Other modalities** | 音频 in/out、视频 in、PDF 直读 | 边角需求 |

> JSON mode / streaming 不单列文档，作为每篇能力页的子条件。

## 4. 文件清单（双语，14 + 2 个文件）

```
docs/zh/
├── 40-vision.md                 # 图片输入
├── 41-image-generation.md       # 图片输出
├── 42-agent-tools.md            # 工具调用 / Agent
├── 43-long-context.md           # 长上下文
├── 44-code.md                   # 代码专精
├── 45-reasoning.md              # 推理模型
├── 46-other-modalities.md       # 音频/视频/PDF
└── 49-capability-index.md       # 总入口
docs/en/                         # mirror，共 8 篇
```

## 5. 每篇能力页的标准结构

> **完整模板**：在本 phase 完成时，agent 应另存一份 `phases/templates/capability-doc.md`（结构如下），后续社区贡献沿用。

```markdown
# 能力：<名称>

> Last Verified: 2026-04-27

[English](../en/4X-<slug>.md)

## TL;DR（非开发者也能懂的一句话）

<例：能让 AI 看你发的图，告诉你图里有什么。>

## 我用得上吗？

- 适合：<场景列举>
- 不适合：<反例>
- 完全免费：<是 / 部分>

## 矩阵：哪家支持？

| Provider | 支持 | 免费模型 | 上下文 | 限速 | 备注 |
|---|:-:|---|---:|---|---|
| OpenRouter | ✅ | `<id>` | 64K | 20 RPM | 免费层有限 |
| Gemini | ✅ | `gemini-2.0-flash-exp` | 1M | 15 RPM | **质量最好** |
| Groq | ⚠️ | `llama-3.2-11b-vision` | 8K | - | 仅基础 |
| Cerebras | ❌ | - | - | - | 不支持 |
| GitHub Models | ✅ | `openai/gpt-4o-mini` | 128K | 模糊 | - |
| Mistral | ✅ | `pixtral-12b-2409` | 128K | - | - |
| Cloudflare | ✅ | `@cf/llava-hf/llava-1.5-7b-hf` | 4K | - | - |
| Ollama | ✅ | `llava` / `qwen2.5-vl` | 视模型 | 本地 | 隐私最好 |

> 数据由 `providers.json` 渲染。每行链接到对应 provider 文档。

## 推荐路径

### 路径 A：质量优先
<具体推荐 + 一句解释>

### 路径 B：完全离线
<具体推荐>

### 路径 C：批量场景
<如适用>

## 怎么用（最小可跑示例）

​```python
# 用 OpenAI SDK + Gemini OpenAI 兼容入口看图
from openai import OpenAI
client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=os.environ["GEMINI_API_KEY"],
)
resp = client.chat.completions.create(
    model="gemini-2.0-flash-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "这张图里有什么？"},
            {"type": "image_url", "image_url": {"url": "https://..."}},
        ],
    }],
)
​```

## 常见坑

- <每篇至少 3 条具体陷阱>

## 进阶组合

- 配套 recipe：[`30-recipes/<相关>.md`](30-recipes/<>.md)
- 接客户端：链接到客户端文档

## Sources

- <用过的官方页 URL>
```

## 6. 各能力页的关键内容要点

### 6.1 `40-vision.md`（图片输入 = Vision-Language）

**必须覆盖的小节：**
- 图片传入方式：URL vs base64
- 单次最多几张图
- 单图最大尺寸 / 分辨率（多数 ≤ 20 MB / ≤ 4096px）
- 中文 OCR 表现差异（Gemini > Pixtral > LLaVA）
- 视觉模型限速通常**比文字更紧**，注意

**重点强调免费首选：**
- **Gemini 2.0 Flash Exp** —— 免费、质量好、长上下文
- **Cloudflare LLaVA** —— 完全免费 + 自托管特性
- **Ollama qwen2.5-vl** —— 本地 + 中文支持

### 6.2 `41-image-generation.md`（图片输出）

**和其他维度本质不同 ——** 多数 LLM provider 不出图。**收录策略：**

- 主推：**Cloudflare Workers AI** 的 `@cf/black-forest-labs/flux-1-schnell`、`@cf/stabilityai/stable-diffusion-xl-base-1.0`
- 候补：**Pollinations AI** —— 完全无 key 免费，但不收进 `providers.json`（无 ToS 约束、不可控），仅作 alt 提及，明示风险
- 本地：**ComfyUI / Automatic1111 + SD/Flux 模型** —— 本项目不教安装，仅指路

**必含小节：**
- 模型对比（Flux schnell / SDXL / LLM 内置 image gen）
- 分辨率、步数、引导（CFG）的"免费档"建议
- NSFW 过滤
- 商用版权（**不要轻易商用，多数模型许可证有限制**）

### 6.3 `42-agent-tools.md`（工具调用 / Agent）⭐

**这一篇是用户明确要求加的，重点写。**

**Tool use 三档：**
| 档 | 含义 | 例 |
|---|---|---|
| `native` | 模型原生 function calling，OpenAI 协议级支持 | GPT-4o-mini、Gemini 2.0、Claude（非免费）、Llama 3.3、Qwen 2.5 |
| `prompt` | 靠 prompt 模板模拟（兼容性差） | 早期 Llama、原版 Mixtral |
| `none` | 不支持 / 极弱 | 老的开源小模型 |

**Agent harness 兼容矩阵：**

| Harness | 推荐 provider | 推荐模型 | 备注 |
|---|---|---|---|
| **opencode** | OpenRouter / Gemini / Groq | `gemini-2.0-flash-exp`、`qwen-2.5-coder-32b` | TOML 配置 OpenAI 兼容 |
| **Cline (VSCode)** | OpenRouter / Gemini | DeepSeek / Gemini | 内置 provider 选择器 |
| **aider** | OpenRouter | DeepSeek / Qwen2.5-Coder | `--model` 切换 |
| **LangChain / LangGraph** | OpenRouter / Gemini | 任何 native tool 模型 | OpenAI SDK 通吃 |
| **LlamaIndex** | 同上 | 同上 | - |
| **CrewAI** | OpenRouter | Llama 3.3 70B free | 多 agent |
| **smolagents (HF)** | OpenRouter | Qwen 2.5 / DeepSeek | 轻量 |
| **Hermes / Nous tool-format** | Ollama | `hermes3:8b`、`hermes3:70b` | 本地，工具格式优秀 |

**写作要点：**
- 解释 OpenAI tool calling 协议为什么是事实标准
- 讲清 free 模型的 tool use **可靠性差异**（DeepSeek > Llama 3.3 > Gemini Flash > Mistral 7B），用户跑 agent 失败常因此
- Hermes / 本地路径：教 `ollama pull hermes3` + 配置 OpenAI 兼容入口
- 多步推理 agent（ReAct loop）：限速会很快用完，要规划

### 6.4 `43-long-context.md`

**阈值：≥200K 算长上下文（v1.0.0 标准）**

主推：
- **Gemini 2.0 Flash** — 1M context 免费
- **OpenRouter `:free` 系列** — 部分 128K
- **Llama 3.3 70B** — 128K

注意点：
- 长上下文 ≠ 实际能用满。多数模型在 ~50K 后质量明显下降
- 限速按 token 算，长上下文容易触 TPM
- RAG 通常更划算

### 6.5 `44-code.md`

矩阵列：模型 / 上下文 / 代码语言覆盖 / IDE 适配

主推：
- DeepSeek V3 / DeepSeek-Coder
- Qwen 2.5 Coder 32B
- Codestral (Mistral)
- 本地：`qwen2.5-coder:7b`

### 6.6 `45-reasoning.md`

**推理模型 = 可见 CoT trace 或 thinking 段：**
- DeepSeek-R1（OpenRouter `:free`）
- Gemini 2.0 Flash Thinking Exp（免费）
- 本地：QwQ 32B、`deepseek-r1:7b`

提醒：
- 推理模型**消耗 token 数倍于普通模型**（思考过程也算）
- 限速更紧
- 不是所有任务都需要推理（chat 杀鸡用牛刀）

### 6.7 `46-other-modalities.md`

边角需求合并一篇：
- **音频 in（语音转文字）**：Cloudflare Whisper、Groq Whisper（**Groq Whisper 是隐藏宝藏，速度极快**）
- **音频 out（TTS）**：Cloudflare、Pollinations
- **视频 in**：Gemini 2.0（仅它免费支持）
- **PDF 直读**：Gemini（直接吞 PDF）、其他需先 OCR

### 6.8 `49-capability-index.md`（总入口）

一张大表：维度 × provider，单元格用 ✅ / ⚠️ / ❌。这是 README 链接的入口页。

```markdown
# 能力总览

| Capability \\ Provider | OR | Gem | Groq | Cer | GH | Mis | CF | Olm |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Vision-in (看图) | ✅ | ⭐ | ⚠️ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Image-gen (出图) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⭐ | 🔧 |
| Tool use | ⭐ | ⭐ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Long ctx (≥200K) | ✅ | ⭐ | ❌ | ❌ | ✅ | ❌ | ❌ | 🔧 |
| Code 专精 | ⭐ | ✅ | ✅ | ❌ | ✅ | ⭐ | ❌ | 🔧 |
| Reasoning | ⭐ | ⭐ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | 🔧 |
| 音频 / TTS / 视频 | ⚠️ | ⭐ | ⭐ | ❌ | ❌ | ❌ | ✅ | ⚠️ |

图例：⭐ 推荐 ✅ 支持 ⚠️ 受限 / 实验 ❌ 不支持 🔧 取决于本地模型
```

## 7. Schema 字段（Phase 01 已扩展，此处提醒）

每个 model 对象现在有：
- `modalities_in` / `modalities_out`
- `tool_use`: `native | prompt | none`
- `json_mode` / `streaming` / `reasoning` / `code_specialized`
- `speed_tier`: `fast | medium | slow`
- `best_for`: `["chat", "agent", "vision", "code", "creative", "ocr", "translation"]`

每个 provider 对象有 derived `capabilities_summary`。

**Phase 11 不能动 schema** —— 如发现字段不够，先回头改 Phase 01 schema 并写 evidence，再继续。

## 8. Acceptance Criteria

- [ ] 7 篇中文能力页 + 1 篇索引 = 8 个 zh 文件
- [ ] 8 篇英文镜像
- [ ] 每篇头部 `Last Verified` + TL;DR + 矩阵
- [ ] 矩阵中所有支持标记可在 `providers.json` 中**字段验证**（grep 抽查 3 篇）
- [ ] 每篇至少 1 个最小可跑示例（agent 实测一次，未测的标 `<!-- untested -->`）
- [ ] `42-agent-tools.md` 包含 ≥6 个 harness（含 opencode / Hermes / aider / LangChain）
- [ ] `41-image-generation.md` 明示 Pollinations 不在 `providers.json` 但提及它的原因
- [ ] `49-capability-index.md` 大表覆盖 7 维 × 8 provider = 56 单元格全填
- [ ] `phases/templates/capability-doc.md` 已抽出
- [ ] README 加 "按能力查"入口指向 `49-capability-index.md`
- [ ] CHANGELOG 更新

## 9. Out of Scope

- ❌ 不收录付费 / 试用额度的能力（如 Claude vision 不在）
- ❌ 不评测模型质量（这是文档项目，不是 benchmark）
- ❌ 不写"如何 fine-tune 一个 vision 模型"
- ❌ 不写 RAG 框架对比（属于上层应用）

## 10. 风险

- **风险：能力数据快速过期**（model 升级 / 新增）→ Phase 10 freshness 机制覆盖
- **风险：Pollinations 等 no-auth 服务被滥用关闭** → 文档明示风险，不依赖

## 11. Estimated Effort

约 6-8 小时。`42-agent-tools.md` 和 `40-vision.md` 是重头戏，各 ~1.5 小时；其余 ~30-40 分钟一篇。
