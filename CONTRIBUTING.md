# 贡献指南 / Contributing Guide

[English version below ↓](#contributing-guide-english)

---

## 贡献指南（中文）

感谢你愿意为本项目贡献！以下是参与的方式和规范。

### 什么样的贡献最有价值

1. **更新过期数据** —— provider 限速、模型列表、隐私政策经常变化
2. **补充截图** —— `for-non-devs/` 的图文教程需要真实截图
3. **新增 provider** —— 必须满足收录标准（见下）
4. **修复错链 / 错字**
5. **补充客户端接入步骤**（尤其是客户端新版本后步骤变了）

### 收录标准（新 provider PR 必读）

新增 provider 必须满足**全部**条件：

- ✅ **永久免费层**：不是试用额度，不是"前 X 个月免费"
- ✅ **无需信用卡**：注册即可获得 key
- ✅ **公开文档**：有官方限速 / 模型页面可以核实
- ✅ **合规来源**：不接受任何"刷号"、"共享 key"类项目
- ✅ **有实际需求**：不是收了又没人用的冷门服务

### 数据更新规范（⚠️ 最重要）

改 provider 数据（限速、模型、隐私）**必须**：

1. **附官方页 URL**（不接受"我记得是这样"）
2. **更新 `providers.json`** 中对应 provider 的 `last_verified` 字段为今天日期
3. **更新对应的 markdown 文档** 中的 `Last Verified` 标注
4. **在 `data/evidence/<provider>/` 目录**留下证据文件（见 Phase 02 规范）
5. **PR 描述中写清楚**："原来是 X，官方页现在说是 Y，URL 是 Z，核对日期是 YYYY-MM-DD"

**不接受的 PR：**

- ❌ 数字改了但没有官方来源
- ❌ 分享或分发任何 API key
- ❌ 收录仅有试用额度的 provider
- ❌ 收录需要信用卡的"免费"层
- ❌ 教用户违反供应商 ToS 的内容（如多账号绕限速）

### 怎么提 PR

1. Fork 本仓库
2. 从 `main` 开新分支：`git checkout -b fix/openrouter-rpm-update`
3. 做改动，确保：
   - `node scripts/check-staleness.mjs` 通过（Phase 10 后可用）
   - 改了数字的地方同步改了 `providers.json` 和 markdown
4. 提 PR，填写 PR 模板中的所有必填项
5. 等 review

### 提 Issue

- **数据过期**：用"数据过期 / Data outdated"模板
- **新增 provider**：用"建议新增 provider"模板
- **客户端步骤失效**：用"客户端步骤失效"模板
- **其他**：自由描述，但请先搜一下有没有类似 issue

### 文档风格速查

- 中英文之间加空格：`使用 OpenRouter 的 key` ✅，`使用OpenRouter的key` ❌
- 数字与单位之间加空格：`20 RPM` ✅
- 限速数字必须有 `Last Verified: YYYY-MM-DD`
- 代码块必须标语言：` ```bash ` ✅，` ``` ` ❌

详见 `phases/conventions.md`（内部规范文档）。

---

## Contributing Guide (English)

Thank you for contributing! Here's how to participate.

### What contributions are most valuable

1. **Updating stale data** — provider rate limits, model lists, and privacy policies change frequently
2. **Adding screenshots** — the `for-non-devs/` illustrated tutorials need real screenshots
3. **Adding new providers** — must meet the inclusion criteria (see below)
4. **Fixing broken links / typos**
5. **Updating client integration steps** (especially after client version updates)

### Inclusion criteria (for new provider PRs)

A new provider must meet **all** of these:

- ✅ **Permanent free tier**: not a trial credit, not "free for the first X months"
- ✅ **No credit card required**: key accessible immediately after signup
- ✅ **Public documentation**: official rate-limit / model page that can be verified
- ✅ **Legitimate source**: no "burner accounts", no "shared key" projects
- ✅ **Actual demand**: not an obscure service nobody uses

### Data update rules (⚠️ most important)

When changing provider data (rate limits, models, privacy), you **must**:

1. **Provide the official page URL** ("I remember it was like this" is not accepted)
2. **Update `providers.json`** — bump the `last_verified` field to today's date
3. **Update the markdown doc** — update the `Last Verified` annotation
4. **Leave evidence** in `data/evidence/<provider>/` (see Phase 02 spec)
5. **In the PR description**, write: "Was X, official page now says Y, URL is Z, verified YYYY-MM-DD"

**PRs we will NOT merge:**

- ❌ Numbers changed without an official source
- ❌ Sharing or distributing any API key
- ❌ Adding providers that only have trial credits
- ❌ Adding credit-card-required "free" tiers
- ❌ Teaching ToS violations (e.g., multi-account quota bypass)

### How to submit a PR

1. Fork this repository
2. Create a new branch from `main`: `git checkout -b fix/openrouter-rpm-update`
3. Make your changes, ensuring:
   - `node scripts/check-staleness.mjs` passes (available after Phase 10)
   - Any changed numbers are updated in both `providers.json` and the markdown docs
4. Open a PR and fill in all required fields in the PR template
5. Wait for review

### Opening an Issue

- **Stale data**: use the "Data outdated" template
- **New provider suggestion**: use the "New provider" template
- **Client steps broken**: use the "Client broken" template
- **Other**: describe freely, but please search for duplicates first

### Doc style quick-reference

- Space between Chinese and English: `使用 OpenRouter 的 key` ✅
- Space between numbers and units: `20 RPM` ✅
- Rate-limit numbers must have `Last Verified: YYYY-MM-DD`
- Code blocks must have language tags: ` ```bash ` ✅, ` ``` ` ❌

See `phases/conventions.md` for the full internal style guide.
