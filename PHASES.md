# Free API Key —— 开发计划总览 (Phase Index)

> 这是项目的**入口文档**。任何接手开发的 agent（Claude Sonnet / Haiku 等）应该**先读这一篇**，再读对应 phase 文档，然后开始执行。

---

## 项目一句话定位

**面向中文用户**的免费 LLM API 实用手册 + 工具包。不只是列清单，还要让用户真正用起来：能验证 key、能接到客户端、能按场景挑供应商、非开发者也能看懂。

## 为什么做这个（差异化）

英文社区已有优秀的清单类项目（[cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) 是最权威的）。但**没有一个项目**同时具备：

1. 中英双语
2. 一键 key 检查脚本
3. 隐私/数据训练矩阵
4. 客户端接入指南（opencode / Cursor / Cline / Continue / LibreChat / OpenWebUI / Chatbox）
5. 场景化 recipes
6. 非开发者图文教程

我们的位置：**站在 cheahjs 肩膀上，补齐使用层。** README 必须明确 attribution，不与之竞争数据广度，而是补足"工具 + 中文 + 真用得起来"。

---

## Phase 索引

| Phase | 名称 | 核心交付 | 依赖 | 预计文件数 |
|---|---|---|---|---|
| **00** | Context（背景） | 给执行 agent 的项目背景 | - | 1 |
| **01** | Foundation | 仓库骨架、双语 README 框架、CHANGELOG、CONTRIBUTING、LICENSE、`.gitignore`、`providers.json` schema | - | ~10 |
| **02** | Providers Data | `providers.json` 填入 8 家核心 provider 的结构化数据 + 验证证据 | 01 | 1 + 16 evidence |
| **03** | Provider Docs (中文) | `docs/zh/0X-<provider>.md` × 8 篇 | 02 | 8 |
| **04** | Provider Docs (English) | `docs/en/0X-<provider>.md` × 8 篇（镜像 03） | 03 | 8 |
| **05** | Key Checker Script | `scripts/check-keys.mjs` —— 一键验证 key 状态 | 02 | ~10 |
| **06** | Cross-Cutting Docs | 隐私矩阵 / 合规边界 / 安全基线 / 故障排查（双语） | 02 | ~8 |
| **07** | Client Integration | opencode / Cline / Continue / Cursor / LibreChat / OpenWebUI / Chatbox 接入指南 | 02, 06 | ~14 |
| **08** | Recipes & Routing | 场景指南（双语） + LiteLLM 路由配置 | 07 | ~10 |
| **09** | Non-Dev Tutorial + Release | 图文版教程 + 最终 polish + v1.0.0 release | 08, 11, 12 | ~5 |
| **10** | Maintenance & Freshness | GitHub Actions / Issue 模板 / 维护手册 / 数据新鲜度政策 | 09 | ~20 |
| **11** | Capability Matrices | 多维能力矩阵：vision / tool-use / image-gen / 长上下文 / 代码 / 推理 / 其他模态 | 02 | ~16 |
| **12** | Real Key Smoke Testing | 真 key 周期性验活（CI + 本地）、状态页、健康徽章 | 05, 10 | ~14 |

**总规模估计：~150 个文件，2 个 workflow set（本地脚本 + CI），1 个数据文件 + 健康日志。**

### 推荐执行顺序

`01 → 02 → 03 → 04 → 05 → 06 → 11 → 07 → 08 → 12 → 10 → 09`

> Phase 11（能力矩阵）在 06 之后做，因为它需要 06 的隐私 / 合规作上下文，但又给 07 的客户端文档提供 "tool use 兼容矩阵" 引用。
> Phase 12（真 key 测试）放 10 之前是因为它共用 10 的 GitHub Actions 框架。
> Phase 09（发布）必须最后做。

### 共享资料（不属于任何单一 phase）

| 文件 | 说明 |
|---|---|
| `phases/conventions.md` | **所有规范的单一真相源** —— 文件命名、Markdown 风格、双语、commit、changelog、术语表 |
| `phases/templates/provider-doc.md` | Phase 03/04 写 provider 文档的模板 |
| `phases/templates/client-doc.md` | Phase 07 写客户端文档的模板 |
| `phases/templates/recipe.md` | Phase 08 写 recipe 的模板 |

每个 phase 开工前**必须先读 `conventions.md`**。

---

## 给执行 Agent 的硬规则（READ FIRST）

> 详细规范见 [`phases/conventions.md`](phases/conventions.md)。本节是**最关键的 10 条**摘要。冲突时以 `conventions.md` 为准。

### 1. 自包含原则
- 你（执行 agent）**没有这之前的对话历史**。所有需要的上下文都在 `phases/00-context.md` 和当前 phase 文档里。
- 如果 phase 文档里说不清楚，**停下来问用户**，不要瞎猜。

### 2. 数据真实性原则（最重要）
- **永远不要凭记忆写 rate limit 数字。** 知识截止日期之后供应商规则会变。
- 写 provider 数据前必须用 `WebFetch` 拉取该 provider 的官方限速/定价页，并在文档底部标注：
  ```
  Last Verified: 2026-04-27
  Sources:
    - https://openrouter.ai/docs/limits  (拉取于 2026-04-27)
  ```
- 拿不准就用 `(unverified)` 标记，**不要编**。

### 3. 单一真相源
- 限速、模型名、endpoint 等结构化数据**只能在 `providers.json` 写一次**。
- 文档里引用时，如果可能就用模板渲染；不行就在文档头部写 `<!-- generated from providers.json @ <commit> -->`。
- 改数据 → 改 `providers.json`，不要在 markdown 里直接改数字。

### 4. 不创造文件膨胀
- 严格按 phase 文档里列的"交付清单"创建文件。
- 不要主动加额外的 README / SUMMARY / NOTES 文件。
- 不要写"未来可能用到"的占位文件。

### 5. 提交规范
- 每完成一个 phase 创建一个 commit（如果是 git repo）。
- Commit message 格式：`phase(NN): <summary>` 例 `phase(01): scaffold repo structure and bilingual README`
- **每个 phase 结尾必须更新 `CHANGELOG.md`**，按 [Keep a Changelog](https://keepachangelog.com/) 格式。

### 6. 时间标注规范
- 所有日期写绝对日期 `YYYY-MM-DD`，不要写"今天 / 上周"。
- 涉及配额/限速的页面顶部必须有 `Last Verified: YYYY-MM-DD`。
- 使用执行当天的日期，不要照抄 phase 文档里的示例日期。

### 7. 双语规范
- 中文是**主语言**（这个项目面向中文用户）。
- 英文文档**必须**和中文同步，但允许稍简。每篇英文文档头部加：`> Mirror of [docs/zh/...](../zh/...). Maintained best-effort; if drift, zh is canonical.`
- 文件名一律英文 + 数字前缀。

### 8. 验收原则
- 每个 phase 文档末尾有 `Acceptance Criteria` 清单。
- **跑一遍这个清单，每条勾过才算完。** 不要自我感觉良好就交付。
- Phase 5 之后任何能跑的脚本，**必须实际跑过一次**并贴出输出片段，而不是"理论上能跑"。

### 9. 边界 / 范围
- 每个 phase 有 `Out of Scope` 章节。
- 看到诱人但属于下个 phase 的工作 —— **忍住**，写到 phase 文档底部的 "Notes for next phase" 里。

### 10. 工具偏好
- 写 / 改文件用 Write / Edit，不用 bash heredoc。
- 检索用 Grep / Glob。
- 只有 shell 操作（git、运行脚本）才用 Bash / PowerShell。

---

## 工作目录

`C:\Users\algov\free api key\`

Windows + bash shell。脚本要跨平台（推荐 Node.js）。

## 用户

- 中文母语，需要中文沟通。
- 既是开发者也是普通用户的代言人。
- 重视文档质量、规范、changelog 纪律。
- 喜欢"先讨论 → 对齐 → 再动手"的节奏，不喜欢盲目铺代码。

## 当前状态

工作目录目前**空的**。从 Phase 01 开始建。

---

## 如何开始

1. 读 `phases/00-context.md`（项目背景）
2. 读 `phases/conventions.md`（规范汇总）
3. 读 `phases/0N-<name>.md`（你被分配的 phase）
4. 如果 phase 提及模板，读 `phases/templates/<name>.md`
5. 完成，跑 acceptance checklist
6. 更新 `CHANGELOG.md` 的 `[Unreleased]`
7. 把完成情况追加到 `phases/_status.md`
8. 给用户一段汇报（格式见 `conventions.md` § 8.1）

---

## 维护节奏（v1.0.0 发布后）

详见 [`phases/10-maintenance.md`](phases/10-maintenance.md)。要点：

| 频率 | 谁 | 做什么 |
|---|---|---|
| 自动·周 | GitHub Actions | freshness check / link check / dep update |
| 手动·月 | 维护者 | 轮换核对 1 家 provider |
| 手动·季 | 维护者 | 全仓 polish + recipe 实跑 |
| 手动·年 | 维护者 | 评估新增 / 移除 provider |

**v1.0.0 发布前不算"已交付"** —— Phase 10 是项目质量保障的一部分，不是事后补丁。

---

**Last updated:** 2026-04-27
