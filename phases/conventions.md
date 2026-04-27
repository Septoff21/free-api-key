# Conventions（规范汇总）

> 所有 phase 共用的规范统一在这里。Phase 文档只引用、不重复。
> 更新这一页 → 必须 bump `CHANGELOG.md` 并在 `_status.md` 留记录。

---

## 1. 文件 / 路径

### 1.1 命名
- 一律小写英文 + 连字符。例：`openrouter.md`、`check-keys.mjs`、`max-free-quota.md`
- 数字前缀两位数：`01-foundation.md` 不是 `1-foundation.md`
- 特殊数字段：
  - `00-09` 基础 / 入口
  - `10-19` 维护 / 流程
  - `01-08` provider 文档（与 `providers.json` 索引顺序一致）
  - `20-` 客户端
  - `30-` recipes
  - `90-99` 横向通用文档
- Provider key 在 `providers.json`：`snake_case` → `github_models`、`cloudflare`

### 1.2 目录
执行 agent 不得擅自创建未列出的顶级目录。如需新增（如 `data/`、`.github/`），先记到所在 phase 的 "Notes for next phase" 或开 issue。

### 1.3 编码 & 换行
- UTF-8（**无 BOM**），LF 换行
- Windows 上 git 配置：`core.autocrlf=input`
- 每个文件末尾保留一个空行

---

## 2. Markdown 风格

### 2.1 标题
- H1 全文唯一。文档标题用 H1，文档内章节从 H2 起
- 不用 `=====` / `-----` underline 风格，统一 `#`

### 2.2 中文排版
- 中英文之间**留半角空格**：`使用 OpenRouter 的 key`
- 数字与中文之间留空格：`20 次/分钟`
- 标点用全角：`，。：；！？`
- 引号用直角：`「」` 或 `""`，不用弯引号

### 2.3 强调
- 关键警告用 `> ⚠️ ...` 引用块，不滥用
- **加粗**用于关键名词第一次出现
- *斜体*仅用于英文术语

### 2.4 链接
- 站内：相对路径，**不带 `./` 前缀**。例 `[OpenRouter](docs/zh/01-openrouter.md)`
- 跨语言：`docs/zh/X.md` ↔ `docs/en/X.md` 互相在文档头部链接
- 外链：完整 URL，不缩短

### 2.5 表格
- 用 GitHub 表格语法
- 数字列右对齐 (`---:`)，文本列左对齐 (`:---`)
- 不在表格里塞代码块（用脚注或单独章节）

### 2.6 代码块
- 必须带语言标记：```` ```bash ````、```` ```json ````、```` ```python ````
- 没有合适语言用 ```` ```text ````
- 不要把多个无关命令塞同一个代码块

---

## 3. 数据 / 真实性

### 3.1 三级真相
1. **官方页**（最新）—— 用 `WebFetch` 拉
2. **`providers.json`**（结构化镜像）—— 项目内单一真相源
3. **markdown 文档**（人类可读）—— 引用 `providers.json`

**永远不要**只在 markdown 里写数字而不更新 `providers.json`。

### 3.2 Last Verified
任何包含会变化数字（rate limit、模型列表、定价）的文件，**头部必须**：

```markdown
> Last Verified: 2026-04-27
```

`providers.json` 每个 provider 对象有独立的 `last_verified`。

### 3.3 拿不准就标 unknown
- 找不到明确说法 → `"unknown"` + `notes` 解释
- **永远不要**用记忆 / 猜测填空。错的数字比缺数字更糟。

### 3.4 Sources 章节
任何展示数据的文档底部必须有：

```markdown
## Sources
- https://example.com/docs (fetched 2026-04-27)
- https://example.com/pricing (fetched 2026-04-27)
```

每个 URL 标注 fetch 日期。

---

## 4. 双语

### 4.1 主语言
中文是 canonical；英文为 mirror。冲突时以中文为准。

### 4.2 mirror 声明
英文文档首行必须：
```markdown
> Mirror of [docs/zh/X.md](../zh/X.md). Chinese is canonical; if drift, zh wins.
```

中文文档首行必须有"English"链接：
```markdown
[English](../en/X.md)
```

### 4.3 翻译质量
- 不机械直译：「心得」→ "Tips" 不是 "Insights"
- 技术术语用业界通用说法
- 警告句保持简洁有力

### 4.4 例外
- `for-non-devs/` 仅中文（此区面向中文小白用户，英文社区有大量同类资源）
- `phases/` 仅中文（内部文档，agent 之间协作）
- `CHANGELOG.md` 英文（标准格式）
- `CONTRIBUTING.md` 双语合并在一篇
- `LICENSE` 标准英文

---

## 5. Commit / Changelog

### 5.1 Commit message
格式：`<type>(<scope>): <summary>`

| type | 用途 |
|---|---|
| `phase` | 完成某 phase 的主要交付，例 `phase(02): fill providers.json with 8 providers` |
| `data`  | 更新 provider 数据，例 `data(openrouter): rpd 50→1000 (paid tier change)` |
| `docs`  | 文档更新（非 phase 主线）|
| `fix`   | 修 bug / 错链 / 错字 |
| `chore` | 工具 / config / 仓库整理 |
| `feat`  | 新特性（脚本 / 工具）|

### 5.2 CHANGELOG.md
[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) 格式严格遵守：

```markdown
## [Unreleased]

### Added
- ...

### Changed
- ...

### Deprecated / Removed / Fixed / Security
- ...
```

每个 phase 完成必须更新 `[Unreleased]`。版本发布时按 SemVer 切到具体版本号。

### 5.3 SemVer
- `MAJOR.MINOR.PATCH`
- 新增 provider / 新增 phase 模块 → MINOR
- 数据修正 / 文档修正 → PATCH
- 破坏性结构改动（schema 升级）→ MAJOR

---

## 6. 隐私 / 安全

### 6.1 永不提交的内容
- 任何真实 API key（哪怕是用户自己的临时测试 key）
- `.env` 文件（除 `.env.example`）
- 个人邮箱 / 真实姓名（除非用户明确要求）
- 任何含 token 的截图（必须打码）

### 6.2 .gitignore 兜底
即使你认为不会泄漏，仍须确保 `.gitignore` 覆盖 `.env`、`*.key`、`secrets/`。

### 6.3 检查机制
推荐 git pre-commit 装 [gitleaks](https://github.com/gitleaks/gitleaks)。Phase 10 详述。

---

## 7. 工具偏好

### 7.1 文件操作
- 写 / 改 → `Write` / `Edit`
- 读 → `Read`
- 列 → `Glob`
- 搜 → `Grep`
- **不**用 bash heredoc / `cat <<EOF` 写大文件

### 7.2 Shell
- Windows + bash 环境：用 forward slash `/`，不用 `\`
- 路径含空格用双引号
- 跨平台脚本一律 Node.js（不写 .bat / .ps1，除非用户要求）

### 7.3 网络
- `WebFetch` 用于拉官方页（小、快、缓存 15 分钟）
- `WebSearch` 用于探索（找 changelog / blog 等）
- 永远不要 `curl` 拉文档内容到本地（agent 上下文已有 WebFetch）

---

## 8. 工作汇报

### 8.1 Phase 完成汇报
每个 phase 结束，给用户一段：

```
## Phase NN 完成
- 交付：<文件清单 / 数量>
- 测过：<具体跑过什么>
- 卡点：<如有>
- 偏离 phase 文档之处：<如有，及原因>
- 建议下一步：<下个 phase / 微调当前 phase>
```

### 8.2 _status.md 留痕
追加一行：

```markdown
## Phase NN — <name> — 2026-MM-DD — <model>
<两句总结>
```

### 8.3 卡住时
- 先**停下来**，不瞎写
- 在汇报里明确"我需要用户决定 X，因为 Y"
- 不要把"猜"包装成"决定"

---

## 9. 范围纪律

### 9.1 Phase 边界
看到诱人但属于其他 phase 的工作 → 写到当前 phase 的 "Notes for next phase"，不顺手做。

### 9.2 不创造文件膨胀
- 不写"占位"文件
- 不为"以后可能用到"建目录
- 不主动加 `NOTES.md` / `IDEAS.md` / `TODO.md`

### 9.3 偏离 phase 文档
若执行中发现 phase 文档本身不对：
1. 不要硬上
2. 在汇报里说明问题 + 建议改法
3. 用户拍板后**先改 phase 文档再继续**

---

## 10. 术语表（Glossary）

### 10.1 配额 / 接口

| 术语 | 含义 |
|---|---|
| RPM / RPD | Requests Per Minute / Day |
| TPM / TPD | Tokens Per Minute / Day |
| BYOK | Bring Your Own Key —— 用户自带 key 接入客户端 |
| Opt-out | 默认会，需要主动关 |
| Free tier | 永久免费层（不含试用额度）|
| OpenAI compatible | 接口兼容 OpenAI SDK |
| ToS | Terms of Service |
| PAT | Personal Access Token (GitHub) |

### 10.2 Provider 类型

| 术语 | 含义 |
|---|---|
| Aggregator | 模型聚合器（如 OpenRouter）|
| First-party | 模型创造者直营（如 Gemini）|
| Inference provider | 第三方推理服务（如 Groq、Cerebras）|
| Local | 本地运行（如 Ollama）|

### 10.3 模型能力维度（Phase 11 用）

| 术语 | 含义 |
|---|---|
| Modality in | 模型能接受的输入：text / image / audio / video / pdf |
| Modality out | 模型能产出的输出：text / image / audio |
| Vision-in / VL | 视觉理解：图片输入 → 文本输出（如 GPT-4o、Gemini Vision、LLaVA）|
| Image-gen | 图片生成：文本 → 图片输出（如 Flux、SDXL）|
| Tool use / Function calling | 模型能输出结构化工具调用，让外部代码执行 |
| Native tool use | 模型在训练阶段就学会 OpenAI tool calling 协议（DeepSeek、Qwen2.5、Gemini 2.0 等）|
| Prompt-based tool use | 靠 prompt 模板模拟，可靠性差 |
| JSON mode | 强制模型输出合法 JSON |
| Streaming | 按 token 流式返回（SSE）|
| Reasoning model | 输出可见思考过程（如 R1、o1、QwQ）|
| Long context | ≥ 200K tokens（v1.0 标准） |
| CoT | Chain of Thought —— 思维链 |

### 10.4 Agent 相关

| 术语 | 含义 |
|---|---|
| Harness | Agent 框架 / 壳子，如 opencode、Cline、aider、LangChain、CrewAI |
| ReAct loop | Reasoning + Acting 循环（思考→调工具→观察→再思考）|
| Hermes format | Nous Research 推的工具调用格式，本地模型常用 |
| MCP | Model Context Protocol（Anthropic 推的工具协议，本项目 v1.0 不深入）|

### 10.5 维护 / 数据

| 术语 | 含义 |
|---|---|
| Freshness | 数据相对官方页的新鲜度（≤ 30 天 / 31-60 / 61-90 / >90）|
| Staleness gate | CI 拦截过期数据的机制 |
| Snapshot | 官方页内容的哈希快照，用于检测变化 |
| Probe | 真 key 测活的最小请求（≤ 1 token）|
| Smoke test | 烟雾测试 —— 最低限度验活，不是端到端 |
| Evidence | Phase 02 收集的官方页证据，存 `data/evidence/` |
| Health log | Phase 12 探针历史日志，存 `data/health/` |

新增术语 → 加到对应小节 + 全仓 grep 替换不一致用法。

---

**Last updated:** 2026-04-27
