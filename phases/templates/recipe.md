# Recipe 文档模板

> Phase 08 写场景指南时使用。

---

```markdown
# Recipe: <用例名>

> Last Verified: YYYY-MM-DD

[English](../../en/30-recipes/<slug>.md)

## 我想做什么

<白话用户视角："我希望..."，2-3 句>

## 推荐路径

### 路径 A：<名字，如"最佳质量">

**适合：** <场景描述>

- **Provider:** <name>
- **Model:** `<model-id>`
- **Client:** <client name>
- **配置：** <一句话或链接到客户端文档>

**为什么这条路：** <一句解释>

### 路径 B：<名字，如"最快">

(同结构)

### 路径 C：<名字，如"完全本地">

(同结构)

## 完整示例

​```<lang>
<可粘贴可跑的最小示例代码>
​```

## 限制 / 坑

- <限制 1，如限速触发条件>
- <限制 2>
- <限制 3>

## 进阶：组合方案

<如适用：用 LiteLLM 路由，按 quality/speed/cost 分级>

​```yaml
# configs/litellm.config.yaml 片段
<相关配置>
​```

详见 [configs/litellm.README.md](../../../configs/litellm.README.md)。

## FAQ

**Q: <常见问题 1>**
A: <答案>

**Q: <常见问题 2>**
A: <答案>

## Sources

- <相关 provider 文档>
- <如引用了官方 blog / docs>
```

---

## 写作铁律

1. 至少 2 条推荐路径（如能列 3 条更好：质量优先 / 速度优先 / 隐私优先）
2. 每条路径必须有"为什么这条路"一句话解释
3. **完整示例必须能跑**（代码块前若未实测，标 `<!-- untested -->`）
4. "限制 / 坑"章节诚实写，不要美化
5. 不要教绕配额 / 多账号轮询（违 ToS 行为另见 `91-compliance.md`）
