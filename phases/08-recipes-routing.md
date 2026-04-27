# Phase 08: Recipes & Routing（场景指南 + 路由配置）

**前置阅读：** `PHASES.md` + `phases/00-context.md` + 前面所有 phase

## 1. Goal

按"用户想做什么"组织文档（recipe），并提供一份现成的多供应商路由配置（LiteLLM）。

## 2. Why Now

数据 / 文档 / 客户端都齐了。现在做"组合套餐"，让用户按场景挑路径。

## 3. 文件清单

### Recipes（双语 = 16 个）
```
docs/zh/30-recipes/
├── code-completion.md          # 代码补全
├── chatbot.md                  # 聊天机器人
├── agent-loop.md               # 跑 agent / tool use ⭐
├── vision-analyze.md           # 看图 / OCR ⭐
├── image-generation.md         # 出图 ⭐
├── offline-private.md          # 完全 Ollama
├── long-doc-rag.md             # 长上下文 / 整书塞
└── max-free-quota.md           # 多供应商路由 ⭐
docs/en/30-recipes/             # mirror，共 8 篇
```

### Routing 配置
```
configs/
├── litellm.config.yaml          # LiteLLM 多 provider 路由
├── litellm.fallback.yaml        # 降级策略示例
└── litellm.README.md            # 双语，怎么用
```

## 4. Recipe 模板

> **完整模板见 [`phases/templates/recipe.md`](templates/recipe.md)。** 下方为示例。

```markdown
# Recipe: 代码补全（Code Completion）

> Last Verified: 2026-04-27

## 我想做什么
"我希望在 IDE 里有 Cursor 那样的实时补全 + 解释，但不付费。"

## 推荐路径

### 路径 A：最佳质量（中等延迟）
- Provider: OpenRouter
- Model: `deepseek/deepseek-chat:free` 或 `qwen/qwen-2.5-coder-32b-instruct:free`
- Client: Cursor 或 Continue
- 配置链接: [Cursor 接入](../20-clients/cursor.md)

### 路径 B：最快（中等质量）
- Provider: Groq
- Model: `llama-3.3-70b-versatile`
- 适合：实时补全（300+ tok/s）

### 路径 C：完全本地
- Provider: Ollama
- Model: `qwen2.5-coder:7b` (8GB RAM 能跑)
- 适合：写公司代码 / 涉密代码

## 限制 / 坑
- :free 模型限速 20 RPM，密集补全可能触限
- Groq 模型选择有限
- 本地模型质量取决于硬件

## 进阶：混合路由
用 LiteLLM 把"快但简单的请求"扔给 Groq，"复杂请求"扔给 OpenRouter。
配置见 [configs/litellm.config.yaml](../../../configs/litellm.config.yaml)。

## Sources
- ...
```

## 5. 必写 8 个 recipe

| # | Recipe | 关键覆盖 |
|---|---|---|
| 1 | **code-completion** | Cursor / Continue / Cline，`code_specialized` 模型 |
| 2 | **chatbot** | 个人聊天 / 翻译 / Chatbox |
| 3 | **agent-loop** ⭐ | opencode / Cline / aider / LangChain，强调 `tool_use: native` 模型选择，含 Hermes 本地路径 |
| 4 | **vision-analyze** ⭐ | 用免费 key 看图、OCR、文档理解（链 `40-vision.md`） |
| 5 | **image-generation** ⭐ | Cloudflare Flux + Pollinations 两条路（链 `41-image-generation.md`） |
| 6 | **offline-private** | 完全 Ollama，含 vision (qwen2.5-vl) / agent (hermes3) |
| 7 | **long-doc-rag** | 长上下文 + 嵌入（Gemini 1M / Llama 128K） |
| 8 | **max-free-quota** ⭐ | 多供应商组合 + LiteLLM 路由 + 降级 |

⭐ 标注的 4 篇是用户明确强调的方向（agent / vision / image gen / 配额最大化）。

`max-free-quota.md` 是项目精华：
- 哪些供应商可以并用（不互斥）
- 用 LiteLLM 配本地 proxy，所有客户端指向 `http://localhost:4000`
- 按 "成本 / 质量 / 速度 / 能力" 四维分级路由
- 降级链：OpenRouter → Groq → Cerebras → Ollama
- 工具调用专用降级链（仅 native tool-use 模型）
- 视觉专用降级链（仅 vision 模型）
- **明确边界：** 不教多账号轮询绕额度（参考 `91-compliance.md`）

## 6. LiteLLM 配置示例

`configs/litellm.config.yaml`：

```yaml
model_list:
  # 主路：免费聚合
  - model_name: "smart"
    litellm_params:
      model: "openrouter/deepseek/deepseek-chat:free"
      api_key: os.environ/OPENROUTER_API_KEY

  # 快路：低延迟
  - model_name: "fast"
    litellm_params:
      model: "groq/llama-3.3-70b-versatile"
      api_key: os.environ/GROQ_API_KEY

  # 本地兜底
  - model_name: "local"
    litellm_params:
      model: "ollama/qwen2.5-coder:7b"
      api_base: "http://localhost:11434"

router_settings:
  routing_strategy: "simple-shuffle"
  num_retries: 2
  fallbacks:
    - smart: ["fast", "local"]
    - fast:  ["smart", "local"]
```

`configs/litellm.README.md` 教：
- `pip install litellm[proxy]`
- `litellm --config litellm.config.yaml --port 4000`
- 客户端用 `http://localhost:4000` 作为 base URL
- 中英双语

## 7. Acceptance Criteria

- [ ] 5 篇中文 recipe + 5 篇英文 recipe = 10 个文件
- [ ] 每篇有"我想做什么"章节（白话用例描述）
- [ ] 每篇至少 2 条推荐路径
- [ ] `configs/litellm.config.yaml` 用 LiteLLM 实测能起（agent 自己 `pip install litellm[proxy]` 跑一次）
- [ ] `configs/litellm.fallback.yaml` 演示降级
- [ ] `max-free-quota.md` 明确不教违规绕配额
- [ ] README 添加 recipes 入口
- [ ] CHANGELOG 更新

## 8. Out of Scope

- ❌ 不写 fine-tune / RAG / vector DB 相关 recipe（v1.0.0）
- ❌ 不写"绕过限速"教程
- ❌ 不写企业部署 / k8s

## 9. Estimated Effort

约 5-6 小时。
