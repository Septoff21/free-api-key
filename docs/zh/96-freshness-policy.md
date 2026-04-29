# 数据新鲜度政策

> 本文档描述项目如何定义、检测和处理过期数据。

[English](../../en/96-freshness-policy.md)

## 背景

免费 LLM API 生态变化极快：限速调整、模型下线、隐私政策更新随时可能发生。  
`providers.json` 中每条 provider 数据都有一个 `last_verified` 字段，记录上次人工核对的日期。

## 新鲜度等级

| `last_verified` 距今 | 等级 | 图标 | 行为 |
|---|---|:-:|---|
| ≤ 30 天 | Fresh | ✅ | 正常显示，无警告 |
| 31–60 天 | Aging | 🟡 | 文档建议提示"建议复核" |
| 61–90 天 | Stale | 🟠 | CI 输出 warning，触发 freshness issue |
| > 90 天 | Outdated | 🔴 | CI **fail**，PR 无法合并 |

## 自动检测机制

### 1. 每周官方页快照（`freshness-check.yml`）

每周一 08:00 UTC 运行：
- 抓取 `providers.json` 中每个 provider 的 `limits_url` 和 `policy_url`
- 计算页面内容的 SHA-256 哈希
- 与上周快照比较
- 发现变化 → 自动开 issue，标签 `data-update-needed`

快照存储在 `data/snapshots/<provider>.<type>.json`：
```json
{
  "provider": "groq",
  "page_type": "limits",
  "url": "https://console.groq.com/docs/rate-limits",
  "fetched_at": "2026-04-28T08:00:00Z",
  "sha256": "abc123...",
  "size_bytes": 15234
}
```

### 2. PR Staleness Gate（`staleness-gate.yml`）

所有改动 `providers.json` 的 PR 都会触发：
- 检查所有 provider 的 `last_verified` 是否超过 90 天
- 超过则 PR 检查失败，**必须先更新数据才能合并**

### 3. 本地检查

```bash
# 检查是否有超期数据（90天）
node scripts/check-staleness.mjs

# 只警告，不报错（60天）
node scripts/check-staleness.mjs --max-age 60 --warn-only

# JSON 格式输出（CI 集成）
node scripts/check-staleness.mjs --json
```

## 数据更新流程

接到 `data-update-needed` issue 后：

```
1. 查看 issue 中的快照 diff（哪个 provider，哪个页面）
2. 访问官方页核实变化内容
3. 更新 providers.json：
   - 修改变化的字段（如 rpm、rpd、模型名）
   - 更新 last_verified 为今天日期（YYYY-MM-DD）
4. 更新对应的 docs/zh/0X-*.md（显示给用户的内容）
5. 更新 docs/en/0X-*.md（英文 mirror）
6. 更新 data/evidence/<provider>/limits.md（保存新的官方来源引用）
7. 更新 CHANGELOG.md：## [Unreleased] ### Changed
8. 创建 PR，关联 issue
9. PR 通过 staleness gate 检查后合并
10. 关闭 issue
```

## 给贡献者：怎样提交数据更新

1. Fork 仓库
2. 按上述流程更新数据
3. 运行 `node scripts/check-staleness.mjs` 确认无报错
4. 提交 PR（填写 PR checklist 中的 Sources 表格，粘贴官方来源）

**不确定数据是否准确？** 先开一个 `data-outdated` issue，让维护者核实后再合并。

## 历史数据归档

已停服或移除免费层的 provider 文档会移至 `docs/zh/_archive/`，保留历史记录，不直接删除。

## 为什么 90 天是硬限制

- 主流 LLM API 服务的策略通常每季度更新一次
- 90 天 = 一个季度，超过这个时间数据可靠性大幅下降
- 更短的阈值（如 30 天）会给维护者带来过大压力
- 更长的阈值（如 180 天）会让用户拿到过时数据，损害信任
