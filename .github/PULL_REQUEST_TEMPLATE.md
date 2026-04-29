## 改了什么 / What Changed

<!-- 简要说明本 PR 的目的 / Brief description of this PR's purpose -->

## Checklist

> 请勾选适用项 / Check all that apply

### 数据变更 / Data Changes
- [ ] 改了 `providers.json` → 已更新对应 provider 的 `last_verified` 字段
- [ ] 改了限速数字 → `providers.json` 和 `docs/zh/0X-*.md` 已同步更新
- [ ] 改了隐私数据 → `docs/zh/06-privacy-matrix.md` 已同步
- [ ] 改了 capability 信息 → `docs/zh/capability/00-index.md` 已同步

### 文档变更 / Doc Changes
- [ ] 改了中文文档 → 对应英文 mirror 已同步更新（或明确说明允许临时漂移）
- [ ] 新增文档 → 双语版本都已创建（zh + en）
- [ ] 改了链接 → 本地跑过 `node scripts/check-links.mjs`（如有此脚本）

### 代码变更 / Code Changes
- [ ] 改了 `providers.schema.json` → 跑过 `npm run validate`（schema 验证）
- [ ] 改了 `scripts/` 下的脚本 → 本地实测过
- [ ] 改了 `.github/workflows/` → YAML 语法已验证（`yamllint` 或 VS Code）

### 通用 / General
- [ ] `CHANGELOG.md` 已更新（`## [Unreleased]` 区域）
- [ ] 本地跑过 `node scripts/check-staleness.mjs`（无 provider 数据超期）

## Sources

<!-- 如果修改了 provider 数据，必须列出官方来源 -->
<!-- If you modified provider data, list official sources here -->

| 数据项 | 官方来源 URL | 查阅日期 |
|---|---|---|
| *(例：Groq RPD)* | *(https://...)* | *(YYYY-MM-DD)* |
