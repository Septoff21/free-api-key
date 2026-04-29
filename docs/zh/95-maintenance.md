# 维护者手册

> 本文档面向项目维护者（有 repo write 权限的人）。
> 普通贡献者请看 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

[English](../../en/95-maintenance.md)

---

## 1. 日常维护节奏

| 频率 | 任务 |
|---|---|
| **每周** | GitHub Actions 自动运行 `real-key-smoke`（周一 09:00 UTC），检查 health log，处理失败 issue |
| **每月** | 检查 `providers.json` 数据是否过期（模型下线、限速变化）；更新 `last_verified` 字段 |
| **每季度** | 轮换探活用 key（建议每 3 个月更换一次）；检查 `CHANGELOG.md` 是否有未发布内容 |
| **发布前** | 在本地跑一次 `node scripts/test-real-keys.mjs --append-logs` 验证所有探针 |

---

## 2. 启用 Real Key Smoke（首次配置）

### 2.1 准备探活专用账号

> ⚠️ **强烈建议**：用专门为测试创建的账号，不要用个人日常账号。Key 泄漏时影响范围可控。

为以下 8 家 provider 各创建或指定一个测试 key：

| Provider | 注册链接 | Key 名称建议 |
|---|---|---|
| OpenRouter | https://openrouter.ai/keys | `free-api-key-smoke` |
| Gemini | https://aistudio.google.com/app/apikey | `free-api-key-smoke` |
| Groq | https://console.groq.com/keys | `free-api-key-smoke` |
| Cerebras | https://cloud.cerebras.ai/platform/keys | `free-api-key-smoke` |
| GitHub Models | https://github.com/settings/tokens | scope: `models:read` |
| Mistral | https://console.mistral.ai/api-keys | `free-api-key-smoke` |
| Cloudflare | https://dash.cloudflare.com/profile/api-tokens | `free-api-key-smoke` |

> 缺哪个 key，那家 provider 在探活时显示 "skipped"，**不影响其他 provider**。

### 2.2 添加 GitHub Secrets

仓库 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret 名 | 对应 Provider | 值 |
|---|---|---|
| `OPENROUTER_TEST_KEY` | OpenRouter | `sk-or-v1-...` |
| `GEMINI_TEST_KEY` | Gemini | `AIza...` |
| `GROQ_TEST_KEY` | Groq | `gsk_...` |
| `CEREBRAS_TEST_KEY` | Cerebras | `csk-...` |
| `GITHUB_MODELS_TEST_TOKEN` | GitHub Models | `ghp_...`（PAT with `models:read`）|
| `MISTRAL_TEST_KEY` | Mistral | `...` |
| `CLOUDFLARE_TEST_ACCOUNT_ID` | Cloudflare | 账号 ID（不是 key，是 32位十六进制 ID）|
| `CLOUDFLARE_TEST_API_TOKEN` | Cloudflare | API Token |

### 2.3 手动触发一次验证

GitHub → Actions → **Real Key Smoke Test** → **Run workflow** → Run

观察输出：
- ✓ 有 key 的 provider 应显示 `200 (XXms)`
- `–` 没配置的 provider 显示 `skipped`
- 运行结束后 `data/health/` 目录会有新的 commit

---

## 3. 处理 Smoke 失败

### 3.1 失败 Issue 格式

CI 自动创建的 issue 标题格式：`[smoke] Provider failure — YYYY-MM-DD`，标签：`smoke-failure`。

### 3.2 排查步骤

```
失败 error_class = auth
  → key 过期或被撤销 → 去 provider 控制台 revoke + 重新生成 → 更新 GitHub Secret

失败 error_class = not_found (404)
  → provider 改了 API 路径 → 查 provider changelog → 更新 scripts/lib/probe.mjs

失败 error_class = rate_limit (429)
  → 探活 key 触发了限速（每周 1 次应该不会）→ 检查是否有其他任务在用同一 key

失败 error_class = network
  → GitHub Actions runner 无法访问该 provider → 可能该区域临时不可用 → 等下次

失败 error_class = timeout (>30s)
  → Provider 响应极慢 → 检查 provider 状态页 → 更新 latency 基准
```

### 3.3 更新 `providers.json`

如果发现某 provider 改了端点或模型名：

1. 更新 `providers.json` 中对应 provider 的数据
2. 更新 `data/evidence/<provider>/limits.md` 或 `privacy.md`（记录新来源）
3. 更新 `scripts/lib/probe.mjs` 的探针 URL / model（如需要）
4. 更新 `last_verified` 字段
5. 更新 `CHANGELOG.md`
6. Commit + PR（不要直接 push main）

---

## 4. Key 安全与轮换

### 4.1 安全承诺

- GitHub Secrets 加密存储，仅在 workflow runtime 注入为环境变量
- Workflow 配置 `if: github.repository == ...` 阻止 fork 获取上游 secrets
- Workflow 不打印任何 env 变量，不记录响应 body
- 每次探针消耗 ≤ 1 token，年度总消耗 ≤ 416 token（8 provider × 52 次）

### 4.2 Key 泄漏处理

```
1. 立刻去 provider 控制台 Revoke（每家 provider 的 key 管理页）
2. 仓库 GitHub Secrets → 删除对应 secret
3. 重新生成 key → 更新 GitHub Secret
4. 检查 git log：git log --all -p | grep -i "sk-or\|gsk_\|AIza"
   若有明文提交，立刻 revoke 相关 key（已经泄露了）
5. 考虑跑 gitleaks：gitleaks detect --source . --report-path gitleaks.json
```

### 4.3 建议轮换周期

每 **3 个月**轮换一次探活 key（在日历上设提醒）。

---

## 5. 发布新版本

### 5.1 发布流程

```bash
# 1. 确认所有 phase 完成，CHANGELOG [Unreleased] 区域完整
cat CHANGELOG.md

# 2. 在本地跑一次完整探活
node scripts/test-real-keys.mjs --append-logs

# 3. 跑 key checker（检查 Phase 05 脚本）
npm run check

# 4. 验证 schema
node -e "
  const Ajv = require('ajv');
  const ajv = new Ajv({strict: false});
  const schema = require('./providers.schema.json');
  const data   = require('./providers.json');
  const valid  = ajv.validate(schema, data);
  console.log(valid ? '✓ schema valid' : ajv.errors);
"

# 5. 更新 CHANGELOG：把 [Unreleased] 改为 [x.y.z] - YYYY-MM-DD
# 6. Commit + Tag
git add -A
git commit -m "release: v1.0.0"
git tag -a v1.0.0 -m "v1.0.0 - first stable release"
git push && git push --tags
```

### 5.2 版本号规则（Semantic Versioning）

- **Major**（x.0.0）：重大结构改变（如 `providers.json` schema 不兼容升级）
- **Minor**（0.x.0）：新增 provider、新增文档章节
- **Patch**（0.0.x）：更新数据、修复错误、文案修改

---

## 6. 链接检查（手动）

定期检查文档中的外部链接是否失效：

```bash
# 安装 markdown-link-check
npm install -g markdown-link-check

# 检查单个文件
markdown-link-check docs/zh/01-openrouter.md

# 批量检查（CI 中可以跑）
find docs -name "*.md" | xargs -I{} markdown-link-check {} 2>&1 | grep -E "ERROR|DEAD"
```

---

## 7. 添加新 Provider

1. 在 `providers.json` 添加新 provider 条目（遵循 schema）
2. 写入 `data/evidence/<provider>/limits.md` + `privacy.md`（引用官方来源）
3. 创建 `docs/zh/<NN>-<name>.md` + `docs/en/<NN>-<name>.md`（使用 provider-doc 模板）
4. 更新 `docs/zh/06-privacy-matrix.md`（添加新行）
5. 更新 `docs/zh/capability/00-index.md`（添加新模型行）
6. 更新 `scripts/lib/probe.mjs`（添加新 provider 探针）
7. 更新 `scripts/test-real-keys.mjs` 的 `PROBES` 数组
8. 更新 `configs/litellm_config.yaml`（如有相关模型）
9. 更新 `CHANGELOG.md` + `providers.json` 的 `version` 字段（Minor bump）

---

## Sources

- GitHub Actions 官方文档: https://docs.github.com/en/actions
- shields.io endpoint badge: https://shields.io/badges/endpoint-badge
- Keep a Changelog: https://keepachangelog.com/en/1.1.0/
