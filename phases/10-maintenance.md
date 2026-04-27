# Phase 10: Maintenance & Freshness（维护机制）

**前置阅读：** `PHASES.md` + `phases/00-context.md` + `phases/conventions.md`

> 这个 phase 让项目**自己保持新鲜**。免费 LLM 生态变化快，没有维护机制 3 个月就过期。

---

## 1. Goal

把"实时更新"做成**有纪律的流程**而非"看心情更新"：
1. 自动检测官方页变化
2. CI 拒绝过期数据
3. 社区贡献渠道顺畅
4. 维护节奏明确

## 2. Why Now

v1.0.0 内容已稳。如果不立刻配上维护机制，v1.0 就是"截至发布日的快照"，发布即过期。

## 3. 交付清单

```
.github/
├── workflows/
│   ├── freshness-check.yml         # 每周 cron：检测官方页变化
│   ├── staleness-gate.yml          # PR 必跑：拦过期数据
│   ├── checker-smoke.yml           # 每周 cron：跑 check-keys.mjs（mock 模式）
│   └── link-check.yml              # 每周 cron：全仓 markdown 链接检查
├── ISSUE_TEMPLATE/
│   ├── data-outdated.yml           # "我发现某 provider 数据过期"
│   ├── new-provider.yml            # "建议新增某 provider"
│   ├── client-broken.yml           # "某客户端接入步骤已失效"
│   └── config.yml                  # disable blank issues
├── PULL_REQUEST_TEMPLATE.md        # 必填项：动了哪个 provider，更新 last_verified 没有
├── CODEOWNERS                      # 占位：用户决定
└── dependabot.yml                  # scripts/ 依赖周更

scripts/
├── check-staleness.mjs             # 本地版的 staleness gate
├── check-links.mjs                 # 本地链接检查
└── fetch-snapshots.mjs             # 抓官方页保存哈希

data/
└── snapshots/                      # 官方页历史快照（哈希 + 抓取时间）
    ├── openrouter.limits.json
    ├── gemini.limits.json
    └── ...

docs/zh/
├── 95-maintenance.md               # 维护手册（双语）
└── 96-freshness-policy.md          # 数据新鲜度政策
docs/en/
├── 95-maintenance.md
└── 96-freshness-policy.md
```

---

## 4. 核心机制详解

### 4.1 数据新鲜度政策

`docs/zh/96-freshness-policy.md` 的核心规则：

| `last_verified` 距今 | 状态 | 行为 |
|---|---|---|
| ≤ 30 天 | ✅ Fresh | 正常显示 |
| 31-60 天 | 🟡 Aging | 文档自动加横幅"数据可能过期，建议复核" |
| 61-90 天 | 🟠 Stale | CI warning，触发自动 issue |
| > 90 天 | 🔴 Outdated | CI **fail**，PR 不能合 |

实现：`scripts/check-staleness.mjs` 读 `providers.json`，按今天日期算差值，输出报告 + 退出码。

### 4.2 官方页快照机制

`scripts/fetch-snapshots.mjs`：
- 读 `providers.json` 每个 provider 的 `limits_url` / `policy_url`
- WebFetch 内容（在 GitHub Actions 里用 `curl` + 简单 HTML→text）
- 计算 SHA-256 哈希
- 存到 `data/snapshots/<provider>.<page-type>.json`：
  ```json
  {
    "url": "https://openrouter.ai/docs/limits",
    "fetched_at": "2026-04-27T08:00:00Z",
    "sha256": "abc123...",
    "size_bytes": 12453
  }
  ```
- 比对上次哈希：变了 → 输出 diff 摘要

GitHub Actions `freshness-check.yml`（每周一 UTC 08:00 跑）：
1. 跑 `fetch-snapshots.mjs`
2. 检测到变化 → 自动开 issue：`[freshness] OpenRouter limits page changed on 2026-04-27`
3. issue body 含变更前后哈希、URL、当前 `providers.json` 数据
4. 加标签 `data-update-needed` + `provider:openrouter`

### 4.3 PR Staleness Gate

`.github/workflows/staleness-gate.yml`：
- 触发：所有 PR
- 跑 `node scripts/check-staleness.mjs --max-age 90`
- 任何 provider 超 90 天 → fail
- PR 模板里强制勾选"我已更新 last_verified（如修改了 provider 数据）"

### 4.4 Smoke Check

`.github/workflows/checker-smoke.yml`：
- 每周一跑 `check-keys.mjs --mock`（不需要真 key 的 dry-run）
- 验证脚本本身没坏
- 验证每个 provider 的 `checker.endpoint` 域名仍解析

注意：**不存真 key 进 GitHub Secrets**。如果用户后续愿意提供测试 key，加可选 job。

### 4.5 Link Check

`.github/workflows/link-check.yml`：
- 用 `lychee` 或 `markdown-link-check`
- 每周扫全仓
- 死链 → 开 issue

---

## 5. 文档：`95-maintenance.md`（维护手册）

给后续维护者（不一定是当初的开发者）看的。结构：

```markdown
# 维护手册

## 谁来维护
- 主仓维护者（README 列名单）
- 社区 PR

## 节奏
- **周** —— 自动 freshness-check 跑一次，处理 issue
- **月** —— 维护者人工核对一家 provider（轮换 8 家 ≈ 8 个月转一圈）
- **季度** —— 跑全仓 polish（链接、截图、recipe 试一遍）
- **年** —— 大版本评估（要不要加新 provider / 移除停服 provider）

## 接到 freshness issue 怎么处理
1. 检查 issue 里的 diff 摘要
2. WebFetch 该官方页确认变化
3. 改 `providers.json`：bump `last_verified`，调整数字
4. 改对应 `docs/zh/0X-xxx.md` 和 `docs/en/0X-xxx.md`
5. 更新 `data/snapshots/<provider>.<page>.json`（删掉旧的，下次 cron 自动重建）
6. CHANGELOG `## [Unreleased] ### Changed`
7. PR，关联 issue
8. 合并

## 加新 provider
1. 评估：永久免费？无 abuse 风险？社区有需求？
2. 走 phase 02 → 03 → 04 流程（迷你版）
3. CHANGELOG `### Added`，bump MINOR

## 移除 provider
1. 触发条件：停服 / 不再有免费层 / 出现明显 abuse 风险
2. 标 deprecated 一个 release 周期
3. 下一个 MINOR 移除
4. 旧文档移到 `docs/zh/_archive/`，不删，便于历史参考

## 应急流程
- 大量用户报"OpenRouter 全废" → 先发紧急 issue 顶置，再调查
- key checker 误报 → 立刻打补丁发 PATCH，不等周期
```

## 6. PR / Issue 模板要点

### 6.1 `data-outdated.yml`（issue）

```yaml
name: 数据过期 / Data outdated
description: 你发现某 provider 的限速、模型、隐私政策等已变
labels: ["data-update-needed"]
body:
  - type: dropdown
    attributes:
      label: 哪个 Provider
      options: [openrouter, gemini, groq, cerebras, github_models, mistral, cloudflare, ollama]
  - type: dropdown
    attributes:
      label: 哪类数据
      options: [rate-limits, models, pricing, privacy-policy, base-url, other]
  - type: textarea
    attributes:
      label: 当前文档说
  - type: textarea
    attributes:
      label: 实际官方页说
  - type: input
    attributes:
      label: 官方页 URL
  - type: textarea
    attributes:
      label: 何时发现 / 截图
```

### 6.2 `new-provider.yml`（issue）
- Provider 名 / homepage / 是否永久免费 / 限速 / 隐私 / 为什么应该收

### 6.3 `client-broken.yml`（issue）
- 哪个客户端 / 哪个版本 / 哪步坏了

### 6.4 `PULL_REQUEST_TEMPLATE.md`

```markdown
## 改了什么 / What changed

## Checklist
- [ ] 改的是 provider 数据？→ 已更新 `last_verified`
- [ ] 改的是数字？→ 同步改了 `providers.json` 和对应 markdown
- [ ] 改了中文？→ 同步改了英文（或显式说明 mirror 漂移）
- [ ] 改了 schema？→ 跑过 `ajv validate`
- [ ] CHANGELOG 已更新
- [ ] 本地跑过 `node scripts/check-staleness.mjs`
- [ ] 本地跑过 `node scripts/check-links.mjs`（如改了链接）

## Sources
<!-- 如果改了数据，列出官方页 URL + 你的核对截图 / 摘录 -->
```

---

## 7. 自动化的硬约束

- **GitHub Actions 不能跑需要真 key 的测试。** 我们项目要面向公众贡献，不能要求贡献者上传 key。
- **不写需要服务器 / 数据库的服务。** 一切都是静态 + cron。
- **不发邮件 / Slack 通知。** 只靠 GitHub issue / PR 闭环。
- **不调用付费 API。** 全部在免费 GitHub Actions 额度内。

## 8. Acceptance Criteria

- [ ] `.github/workflows/` 4 个 yml 都已创建，YAML 语法合法（`yamllint` 通过）
- [ ] `.github/ISSUE_TEMPLATE/` 4 个模板齐
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` 有强制 checklist
- [ ] `.github/dependabot.yml` 配置 npm 周更
- [ ] `scripts/check-staleness.mjs` 实测：手工把 `providers.json` 某 `last_verified` 改成 100 天前，脚本退出码 1
- [ ] `scripts/check-links.mjs` 实测：故意写个死链，脚本能识别
- [ ] `scripts/fetch-snapshots.mjs` 实测：第一次跑生成快照、第二次跑无变化时静默
- [ ] `docs/zh/95-maintenance.md` + `96-freshness-policy.md` + 英文版 = 4 个文件
- [ ] README.md 加一节"项目状态 / 维护"指向 `95-maintenance.md` 和 GitHub Actions badge
- [ ] CHANGELOG `## [Unreleased] ### Added` 加 Phase 10 条目
- [ ] 跑一遍 freshness-check workflow（GitHub Actions UI 手动触发）确认能 green

## 9. Out of Scope

- ❌ 真 key 的端到端测试（隐私 + 操作风险）
- ❌ 自动 PR 机器人（renovate / autobot 改 providers.json）—— 数据要人审
- ❌ 国际化贡献者面板 / 翻译协作平台
- ❌ Discord / Slack 集成

## 10. 风险

**风险：GitHub Actions 免费额度紧张**
- 4 个 workflow 每周各跑一次，每次 < 5 分钟，远低于 2000 min/月免费额度
- public repo 完全免费，不算配额

**风险：官方页结构变了，fetch-snapshots 解析错位**
- 应对：脚本只比哈希，不解析结构。变了就开 issue 让人审，不自动改数据

**风险：cheahjs / 上游清单更新比我们快**
- 应对：维护手册里加"季度对照 cheahjs 的 README"步骤

## 11. Estimated Effort

约 5-7 小时（其中 3 个 workflow 实测 + 维护手册中英）。

---

## 附：维护节奏一览

| 频率 | 谁 | 做什么 |
|---|---|---|
| 自动·周 | GitHub Actions | freshness check / link check / dep update |
| 手动·月 | 维护者 | 轮换核对 1 家 provider（8 家 ≈ 8 月一轮） |
| 手动·季 | 维护者 | 全仓 polish + recipe 实跑 |
| 手动·年 | 维护者 | 评估新增 / 移除 provider，发 MINOR |
