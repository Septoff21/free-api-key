# Phase 04: Provider Docs (English)

**前置阅读：** `phases/03-provider-docs-zh.md`（先读完中文版的逻辑）

## 1. Goal

把 phase 03 的 8 篇中文文档镜像成英文版。

## 2. Why Now

中文版结构已稳定。趁结构不会再大改，立刻把英文版也建起来，避免后续中英漂移。

## 3. 文件清单

```
docs/en/01-openrouter.md
docs/en/02-gemini.md
docs/en/03-groq.md
docs/en/04-cerebras.md
docs/en/05-github-models.md
docs/en/06-mistral.md
docs/en/07-cloudflare.md
docs/en/08-ollama.md
```

## 4. 翻译规范

- **首行必须有：** `> Mirror of [docs/zh/0X-xxx.md](../zh/0X-xxx.md). Chinese is canonical; if drift, zh wins.`
- 链接（"接到客户端"等）改指向 `../en/...`
- 代码块 / curl / SDK 示例**保持原样**，只翻译注释和文字说明
- 表格表头译成英文，但表格内容（如模型 ID）保持原样
- "Last Verified" 日期保持和中文版一致
- "Sources" 章节直接复制中文版（URL 不译）

## 5. 翻译质量要求

- 不要机械直译。"心得" → "Tips" 而不是 "Insights"
- 技术术语用业界通用说法（"limit" / "rate limit" / "context window"）
- 警告句保持简洁有力，不要为了显得"完整"加废话

## 6. Acceptance Criteria

- [ ] 8 篇英文文档都已创建
- [ ] 每篇首行有 mirror 声明
- [ ] 每篇内部链接指向 `../en/...` 而非 `../zh/...`
- [ ] 与中文版**章节数、章节顺序、表格行数**完全一致
- [ ] 所有数字与 `providers.json` 一致
- [ ] 修改 `README.en.md`，添加这 8 篇的链接
- [ ] CHANGELOG 更新

## 7. Out of Scope

- 英文版的客户端 / recipe / 隐私矩阵（其他 phase）
- 任何中文版还没有的章节（如果想加，先回去改中文版再镜像）

## 8. Estimated Effort

约 2-3 小时（每篇 ~20 分钟，主要是翻译，结构无需重思）。
