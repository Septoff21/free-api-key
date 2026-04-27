# Provider 文档模板

> 这是 phase 03/04 写 provider 文档时**必须遵循**的结构。
> 复制这一篇，把 `<占位>` 替换成具体内容，**章节顺序不可改**。

---

```markdown
# <Provider Name>

> **类型：** <聚合器 / 一手 / 推理服务 / 本地>
> **OpenAI 兼容：** <✅ / ❌>
> **Last Verified:** YYYY-MM-DD ([sources](#sources))

[English](../en/0X-<key>.md)

## 一句话

<两到三句话讲清楚：是什么、最大特点、最适合谁>

## 适合谁

- ✅ <典型场景 1>
- ✅ <典型场景 2>
- ❌ <不适合的场景>

## 怎么拿 key

1. <步骤 1>
2. <步骤 2>
3. <步骤 3>

> 💡 <重要提示，如"不需要绑卡"、"需要 GitHub 账号"等>

## 怎么用

### 命令行（curl）

​```bash
curl <endpoint> \
  -H "Authorization: Bearer $<ENV_VAR>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<example-free-model>",
    "messages": [{"role": "user", "content": "你好"}]
  }'
​```

### Python（OpenAI SDK）

​```python
from openai import OpenAI

client = OpenAI(
    base_url="<base_url>",
    api_key=os.environ["<ENV_VAR>"],
)
resp = client.chat.completions.create(
    model="<example-free-model>",
    messages=[{"role": "user", "content": "你好"}],
)
​```

### Node.js

​```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "<base_url>",
  apiKey: process.env.<ENV_VAR>,
});
​```

## 免费模型（部分）

| 模型 | 上下文 | 备注 |
|---|---:|---|
| `<model-id-1>` | <ctx> | <说明> |
| `<model-id-2>` | <ctx> | <说明> |
| `<model-id-3>` | <ctx> | <说明> |

> 完整列表：<官方模型页 URL>
> 数据来自 `providers.json` (Last Verified: YYYY-MM-DD)

## 限速

- **<X> RPM** — <说明>
- **<Y> RPD** — <说明>
- HTTP 头 `<header-names>` 返回剩余配额

> 详见 <官方限速页 URL>

## 隐私 ⚠️

| 项 | 答案 |
|---|---|
| 是否用你的数据训模型？ | <Yes / No / Opt-out / Unknown> |
| 是否记录 prompts？ | <Yes / No / Unknown> |
| 保留时长 | <X 天 / Unknown> |
| 人工审查 | <Yes / No / Unknown> |
| 政策链接 | <URL> |

> <如有"怎么关训练"步骤，写这里>
> ⚠️ <重要警示：如"即便关了，底层模型方政策独立">

## 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| `401 Unauthorized` | <原因> | <解决> |
| `429 Too Many Requests` | <原因> | <解决> |
| `<其他典型错误>` | <原因> | <解决> |

## 接到客户端

- [opencode](20-clients/opencode.md)
- [Cursor](20-clients/cursor.md)
- [Cline](20-clients/cline.md)
- [Continue](20-clients/continue.md)
- [Chatbox](20-clients/chatbox.md)

## 心得

1. **<心得 1>** — <说明>
2. **<心得 2>** — <说明>
3. **<心得 3>** — <说明>

<可选：4-5 条>

## Sources

- <官方限速页 URL> (fetched YYYY-MM-DD)
- <官方模型页 URL> (fetched YYYY-MM-DD)
- <官方隐私政策 URL> (fetched YYYY-MM-DD)
```

---

## 写作铁律

1. **不漏任何章节**，即便某项是 unknown 也要写"未查到明确说法"
2. **数字必须和 `providers.json` 一致** —— grep 检查一次
3. **示例代码必须能跑**（agent 实测一次，不实测的留 `<!-- untested -->` 标记）
4. **心得章节** ≤ 5 条，每条 ≤ 2 行
5. **隐私 ⚠️ 章节** 如果一项是 "Yes (训练)"，必须在引用块里给警示
6. **Sources** 至少 2 个 URL，每个标 fetch 日期

## 字数预期

每篇 600-1000 字（中文）/ 800-1200 词（英文）。超出 → 多余信息挪到独立 sub-doc 或 recipe。
