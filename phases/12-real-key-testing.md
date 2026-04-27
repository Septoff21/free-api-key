# Phase 12: Real Key Smoke Testing（真 key 周期性验活）

**前置阅读：** `PHASES.md` + `phases/conventions.md` + Phase 05 (key checker) + Phase 10 (maintenance)

> Phase 05 的 checker 验证"key 格式 + endpoint 可达"。**这个 phase 验证"key 真的能发出请求并拿到响应"。**

---

## 1. Goal

每周用一组维护者持有的真 key 给每家 provider 发一次最小请求（"hi" → 1 token），记录成功 / 失败 / 延迟，自动暴露问题。

## 2. Why

`providers.json` 里的限速、endpoint 数据可能是对的，**但 provider 实际服务可能：**
- 改了 path（404）
- 改了 auth header 格式
- 该区域被封
- 模型已下线
- 限速规则变严

只有真发请求才能发现。

## 3. 硬约束（**全部必须满足**）

- ✅ **每次最小请求**：`max_tokens: 1`、prompt = "hi"。每家 ≤ 5 总 token / 次
- ✅ **每周 1 次**：1 年 ~52 次，对任何 provider 配额都是噪声级
- ✅ **真 key 仅在 GitHub Secrets**，且只对 push-to-main 触发的 workflow 暴露（`pull_request_target` 禁用）
- ✅ **不记录 key**、不记录响应内容、只记录 status code + 延迟 + error class
- ✅ **缺 key 优雅跳过**，不 fail 整个 run（让贡献者 fork 后也能跑 dry-run）
- ✅ **失败不重试**（避免扩大配额消耗）
- ✅ **手动 dispatch 限频**：禁止 1 小时内手动触发 > 2 次（GitHub Actions 自带 concurrency 控制）

## 4. 交付清单

```
.github/workflows/
└── real-key-smoke.yml          # GitHub Actions: 每周一 09:00 UTC + 手动 dispatch

scripts/
├── test-real-keys.mjs           # 维护者本地版（release 前必跑）
└── lib/probe.mjs                # 单 provider 探针逻辑（被 check-keys 和 test-real-keys 共用）

data/health/
├── _index.json                  # 最新一次结果（生成 badge 用）
├── openrouter.jsonl             # append-only 历史
├── gemini.jsonl
├── groq.jsonl
├── cerebras.jsonl
├── github_models.jsonl
├── mistral.jsonl
├── cloudflare.jsonl
└── ollama.jsonl                 # 本地，仅本地版会写

scripts/generate-status-badge.mjs    # 从 _index.json 生成 shields.io endpoint JSON
data/health/badge.json               # commit 到 main，README 引用

docs/zh/97-status.md             # 公开状态页
docs/en/97-status.md
```

## 5. probe.mjs 行为规约

### 5.1 接口

```js
// scripts/lib/probe.mjs
export async function probe(provider, key, opts) {
  // returns:
  // {
  //   provider: "openrouter",
  //   ok: boolean,
  //   status_code: number | null,
  //   latency_ms: number,
  //   error_class: "auth" | "rate_limit" | "not_found" | "network" | "timeout" | null,
  //   timestamp: ISO8601 string,
  //   probe_kind: "minimal_chat" | "models_list" | "local_tags"
  // }
}
```

### 5.2 各 provider 探针规则

| Provider | 类型 | 请求 |
|---|---|---|
| OpenRouter | `minimal_chat` | POST `/chat/completions` model=`deepseek/deepseek-chat:free`, `max_tokens:1`, content="hi" |
| Gemini | `minimal_chat` | OpenAI 兼容入口 + `gemini-2.0-flash-exp`, `max_tokens:1` |
| Groq | `minimal_chat` | model=`llama-3.1-8b-instant`（**故意选小模型，省配额**） |
| Cerebras | `minimal_chat` | model=`llama3.1-8b` |
| GitHub Models | `minimal_chat` | model=`openai/gpt-4o-mini` |
| Mistral | `minimal_chat` | model=`open-mistral-7b` |
| Cloudflare | `minimal_chat` | model=`@cf/meta/llama-3.1-8b-instruct` |
| Ollama | `local_tags` | GET `/api/tags`（不发推理请求；有则✓）|

### 5.3 错误分类

| HTTP / 现象 | error_class |
|---|---|
| 401 / 403 | `auth` |
| 429 | `rate_limit` |
| 404 | `not_found` |
| ECONNREFUSED / DNS / SSL | `network` |
| > 30s | `timeout` |

## 6. GitHub Actions Workflow

`.github/workflows/real-key-smoke.yml` 关键设计：

```yaml
name: Real Key Smoke Test

on:
  schedule:
    - cron: "0 9 * * 1"          # 每周一 09:00 UTC
  workflow_dispatch:              # 手动触发

concurrency:
  group: real-key-smoke
  cancel-in-progress: false

permissions:
  contents: write                  # 需要 commit health logs
  issues: write                    # 失败开 issue

jobs:
  smoke:
    runs-on: ubuntu-latest
    if: github.repository == github.event.repository.full_name  # 阻止 fork 用上游 secrets
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }

      - name: Install
        working-directory: scripts
        run: npm ci

      - name: Probe (each provider; missing keys skipped gracefully)
        id: probe
        env:
          OPENROUTER_API_KEY:        ${{ secrets.OPENROUTER_TEST_KEY }}
          GEMINI_API_KEY:            ${{ secrets.GEMINI_TEST_KEY }}
          GROQ_API_KEY:              ${{ secrets.GROQ_TEST_KEY }}
          CEREBRAS_API_KEY:          ${{ secrets.CEREBRAS_TEST_KEY }}
          GITHUB_TOKEN:              ${{ secrets.GITHUB_MODELS_TEST_TOKEN }}
          MISTRAL_API_KEY:           ${{ secrets.MISTRAL_TEST_KEY }}
          CLOUDFLARE_ACCOUNT_ID:     ${{ secrets.CLOUDFLARE_TEST_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN:      ${{ secrets.CLOUDFLARE_TEST_API_TOKEN }}
        run: node scripts/test-real-keys.mjs --append-logs

      - name: Generate badge
        run: node scripts/generate-status-badge.mjs

      - name: Commit health logs + badge
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/health/
          git diff --staged --quiet || git commit -m "chore(health): smoke run $(date -u +%Y-%m-%d)"
          git push

      - name: Open issue if any provider failed
        if: steps.probe.outputs.failed_count != '0'
        uses: actions/github-script@v7
        with:
          script: |
            // 读 data/health/_index.json，开/更新 issue
            // 标签：smoke-failure
```

**为什么 `if: github.repository == ...`：** Fork 触发的 workflow 默认拿不到 secrets（GitHub 安全策略），但加这道额外 guard 防御 supply-chain 攻击场景。

## 7. 本地版 `test-real-keys.mjs`

维护者**每次发布前**手动跑：

```bash
cd scripts
cp ../configs/.env.example .env  # 填入维护者的 test key
npm run test:real
```

输出和 CI 一致。**本地版多一个 ollama 探针**（CI 跑不动本地 Ollama）。

## 8. 状态页 / 徽章

### 8.1 `data/health/_index.json`

```json
{
  "generated_at": "2026-04-27T09:03:12Z",
  "summary": {
    "ok": 7,
    "failed": 1,
    "skipped": 0,
    "total": 8
  },
  "providers": {
    "openrouter":   { "ok": true,  "latency_ms": 412, "last_run": "2026-04-27T09:00:34Z" },
    "gemini":       { "ok": true,  "latency_ms": 287, "last_run": "..." },
    "cerebras":     { "ok": false, "error_class": "auth", "latency_ms": 134, "last_run": "..." }
  }
}
```

### 8.2 Badge

`data/health/badge.json` (shields.io endpoint 格式)：

```json
{
  "schemaVersion": 1,
  "label": "providers",
  "message": "7/8 OK",
  "color": "yellow"
}
```

color 规则：
- 8/8 → green
- 6-7/8 → yellow
- ≤5/8 → red

README 引用：

```markdown
![Providers Health](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/<user>/free-api-key/main/data/health/badge.json)
```

### 8.3 `docs/zh/97-status.md`

公开状态页。结构：

```markdown
# 项目健康状态

> 自动更新。最近一次跑：从 _index.json 读
> 历史日志：data/health/<provider>.jsonl

| Provider | 状态 | 上次延迟 | 上次时间 |
|---|:-:|---:|---|
| OpenRouter | ✅ | 412ms | 2026-04-27 09:00 |
| Gemini     | ✅ | 287ms | ... |
| Cerebras   | ❌ | -     | ... |
| ...

## 我的请求失败但状态显示 OK 怎么办？

- 我们一周一探活；中间出问题不会立刻反映
- 我们的探针非常轻量，可能你的请求触发了别的限制
- 看 [docs/zh/93-troubleshooting.md](93-troubleshooting.md)
- 在 [GitHub Issues](...) 报告

## 历史趋势

<未来可加可视化；v1.0 不做>
```

## 9. 维护者 Setup 文档

写在 `docs/zh/95-maintenance.md` 的"启用 Real Key Smoke"章节：

```markdown
## 启用真 key 测活（仅维护者）

1. 注册 8 家 provider，**专门为测试用**的账号（不要用日常账号）
2. 各 provider 控制台创建 key，命名 `free-api-key-smoke`
3. 仓库 → Settings → Secrets and variables → Actions → New secret
4. 添加：
   - OPENROUTER_TEST_KEY
   - GEMINI_TEST_KEY
   - GROQ_TEST_KEY
   - CEREBRAS_TEST_KEY
   - GITHUB_MODELS_TEST_TOKEN（PAT，scope: models:read）
   - MISTRAL_TEST_KEY
   - CLOUDFLARE_TEST_ACCOUNT_ID
   - CLOUDFLARE_TEST_API_TOKEN
5. **不需要全填**。缺哪个该 provider 那行显示 "skipped"，不影响其他
6. Actions → Real Key Smoke Test → Run workflow（手动跑一次验证）

## 我的 key 会被泄漏吗？

- GitHub Secrets 加密存，仅 workflow 运行时注入
- workflow 配置 `if: github.repository == ...` 阻止 fork 拿到
- workflow 不打印 env、不打印 response body
- 真 key 测活只在每周 1 次 + 手动触发，单次 ≤ 5 token

## key 万一泄漏怎么办？

1. 立刻去 provider 控制台 revoke
2. 重新生成、更新 GitHub Secret
3. 看 commit history 是否有意外提交（gitleaks 检查）
```

## 10. Acceptance Criteria

- [ ] `.github/workflows/real-key-smoke.yml` YAML 合法 (`yamllint`)
- [ ] `scripts/lib/probe.mjs` 8 家 provider 探针都实现
- [ ] `scripts/test-real-keys.mjs` 本地实测：
  - 全空 env 跑 → 所有 provider 标 `skipped`，退出码 0
  - 配 1 个真 key 跑 → 该 provider 出现在 `_index.json`
  - 故意配错 key 跑 → `error_class: "auth"`
- [ ] `scripts/generate-status-badge.mjs` 从假数据生成正确颜色 badge
- [ ] `data/health/_index.json` 和 `<provider>.jsonl` 格式合规
- [ ] `docs/zh/97-status.md` + 英文版 = 2 个文件
- [ ] `docs/zh/95-maintenance.md` 加"启用 Real Key Smoke"章节
- [ ] README 顶部加 badge
- [ ] **维护者已自测**：手动 run 过一次 GitHub Actions（贴 run URL 到完成汇报里）
- [ ] CHANGELOG 更新

## 11. Out of Scope

- ❌ 端到端对话测试（只发 1-token 探针）
- ❌ 每个 model 单独探活（每 provider 1 个，避免配额轰炸）
- ❌ 性能 benchmark（speed_tier 字段是估算，非测出）
- ❌ 自动通知（邮件 / Discord / Slack）—— 用户已明确不要
- ❌ 自动修 `providers.json`（出错只开 issue 让人审）

## 12. 风险与应对

**风险：维护者 quota 被这工作流耗尽**
→ 1 周 1 次 × 1 token × 8 家 = 一年 416 token 总量。可忽略

**风险：维护者 key 泄漏**
→ 测活专用账号；每年轮换；workflow 配 `if: github.repository == ...`

**风险：Health 日志膨胀**
→ JSONL 一行 ~150 字节 × 52 次/年 × 8 家 ≈ 60KB/年。十年也才 600KB。无需归档

**风险：探针频繁触发 abuse 检测**
→ 每周 1 次远低于任何家阈值

## 13. Estimated Effort

约 5-7 小时（含本地实测 + GitHub Actions 调试 + 状态页文案）。

---

## 附：和 Phase 05 (check-keys.mjs) 的关系

| | Phase 05 check-keys | Phase 12 test-real-keys |
|---|---|---|
| 谁跑 | 用户本地 | CI（cron）+ 维护者本地 |
| 频率 | 用户随时 | 每周 1 次 |
| 验什么 | key 格式、endpoint 域名解析、auth ping | 真发请求拿响应 |
| 消耗 token | 0（多数家不消耗） | ≤ 1 token / 家 / 次 |
| 共享代码 | 共用 `scripts/lib/probe.mjs`（Phase 12 抽出） | 同 |

Phase 05 必须**先抽出** `lib/probe.mjs`（如果当时一体写在 `check-keys.mjs` 里）。Phase 12 重构来共享。
