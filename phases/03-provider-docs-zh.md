# Phase 03: Provider Docs（中文）

**前置阅读：** `PHASES.md` + `phases/00-context.md` + `phases/02-providers-json.md`

## 1. Goal

为 8 家 provider 各写一篇中文文档，遵循同一个模板。

## 2. Why Now

`providers.json` 已有结构化数据。现在要把它变成"人能读、能跟着操作"的文档。

## 3. 文件清单

```
docs/zh/01-openrouter.md
docs/zh/02-gemini.md
docs/zh/03-groq.md
docs/zh/04-cerebras.md
docs/zh/05-github-models.md
docs/zh/06-mistral.md
docs/zh/07-cloudflare.md
docs/zh/08-ollama.md
```

## 4. 标准模板（必须严格遵循）

> **完整模板见 [`phases/templates/provider-doc.md`](templates/provider-doc.md)。** 写每一篇前先读模板。下面是简化示意。

```markdown
# OpenRouter

> **类型：** 聚合器（一个 key 通吃所有模型）
> **OpenAI 兼容：** ✅
> **Last Verified:** 2026-04-27 ([sources](#sources))

[English](../en/01-openrouter.md)

## 一句话

OpenRouter 是模型聚合器，注册即可用 30+ 免费模型（DeepSeek V3、Llama 3.3 70B、Gemini Flash 等），完全 OpenAI 协议兼容，是最适合做"统一入口"的免费方案。

## 适合谁

- ✅ 想用一个 key 试遍各家模型
- ✅ 已经在用 OpenAI SDK，不想改代码
- ❌ 高并发场景（限速较紧）

## 怎么拿 key

1. 打开 https://openrouter.ai/sign-up
2. 用 Google / GitHub 账号登录（也可邮箱）
3. 进 https://openrouter.ai/keys 点 `Create Key`
4. 命名（如 `local-dev`），复制保存（**只显示一次**）

> 💡 不需要绑卡。但如果以后充过 $10，免费额度从 50/day 提升到 1000/day。

## 怎么用

### 命令行（curl）

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek/deepseek-chat:free",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Python（OpenAI SDK）

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)
resp = client.chat.completions.create(
    model="deepseek/deepseek-chat:free",
    messages=[{"role": "user", "content": "你好"}],
)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

## 免费模型（部分）

| 模型 | 上下文 | 备注 |
|---|---|---|
| `deepseek/deepseek-chat:free` | 64K | 通用，质量好 |
| `meta-llama/llama-3.3-70b-instruct:free` | 128K | 大参数 |
| `google/gemini-flash-1.5:free` | 1M | 长上下文 |
| ... | ... | ... |

> 完整列表：https://openrouter.ai/models?max_price=0
> 数字来自 `providers.json` (Last Verified: 2026-04-27)

## 限速

- **20 RPM**（每分钟 20 次请求）
- **50 RPD**（未充值账户）/ **1000 RPD**（曾充过 $10+ 的账户）
- HTTP 头返回 `x-ratelimit-*`，可以脚本读取剩余配额

## 隐私 ⚠️

| 项 | 答案 |
|---|---|
| 是否用你的数据训模型？ | Opt-out（默认会，可在设置关闭） |
| 是否记录 prompts？ | 是 |
| 保留时长 | 约 30 天 |
| 政策链接 | https://openrouter.ai/privacy |

> 关掉训练：登录 → Settings → Privacy → "Disable model providers training on your data"
> **重要：** 即使 OpenRouter 关了，底层模型方（如某些 free 模型背后的 host）可能仍记录。涉密内容请直接用本地 Ollama。

## 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| `401 Unauthorized` | key 错或被回收 | 重新去 keys 页确认 |
| `429 Too Many Requests` | 触限速 | 等 60 秒；或检查 `x-ratelimit-reset` |
| `402 Insufficient Credits` | 用了非 :free 模型 | 改用带 `:free` 后缀的模型 |

## 接到客户端

- [opencode](20-clients/opencode.md)
- [Cursor](20-clients/cursor.md)
- [Cline](20-clients/cline.md)
- [Continue](20-clients/continue.md)

> 这些链接现在可能 404（phase 07 才做），无所谓，先放着

## 心得

1. **优先用 :free 后缀模型** —— 不带后缀的会扣 credit
2. **加 `HTTP-Referer` 和 `X-Title` 头** —— OpenRouter 排行榜会展示，对小项目有曝光
3. **流式（streaming）支持完整** —— 和 OpenAI SDK 行为一致
4. **不要做 key 共享** —— OpenRouter 反 abuse 比较严格，封号易解封难

## Sources

- https://openrouter.ai/docs/api-reference/limits (fetched 2026-04-27)
- https://openrouter.ai/models?max_price=0 (fetched 2026-04-27)
- https://openrouter.ai/privacy (fetched 2026-04-27)
```

## 5. 各 provider 的特殊点

写每篇时注意：

- **gemini**：要写多 GCP project 的合规边界（`phases/00-context.md` § 5 已说是合规的）
- **groq**：强调速度，但模型选择有限
- **cerebras**：免费额度小，强调 demo / 探索用途
- **github_models**：需要 GitHub PAT，scope 是 `models:read`，没有就用普通 PAT
- **mistral**：欧洲合规优势、Codestral 代码补全
- **cloudflare**：账户 ID + API token 双参数，比别家麻烦一点
- **ollama**：完全本地，章节"怎么拿 key"改成"怎么装"

## 6. Acceptance Criteria

- [ ] 8 个 markdown 文件都按模板结构完成
- [ ] 每篇头部有 `Last Verified` + 链接到 `Sources` 章节
- [ ] 每篇至少有 1 个 curl + 1 个 Python 例子（Ollama 例外，给本地命令）
- [ ] 每篇都有"隐私 ⚠️"表格
- [ ] 每篇都有"常见错误"表格
- [ ] 文档里所有数字（限速、模型上下文等）都和 `providers.json` 一致
- [ ] 链接到 phase 07 的客户端文档（即使现在 404 也写上）
- [ ] CHANGELOG 更新

## 7. Out of Scope

- ❌ 英文版（phase 04）
- ❌ 客户端接入详细教程（phase 07，这里只放链接）
- ❌ 隐私矩阵汇总（phase 06，这里每篇只写本家）

## 8. Estimated Effort

约 4-5 小时（每篇 ~30 分钟）。
