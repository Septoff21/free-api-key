# OpenRouter

> **类型：** 聚合器（Aggregator）
> **OpenAI 兼容：** ✅
> **Last Verified:** 2026-04-27 ([sources](#sources))

[English](../en/01-openrouter.md)

## 一句话

OpenRouter 是一个 AI 模型网关，汇聚了数百个来自 Google、Meta、Mistral 等的模型，通过统一 OpenAI 兼容 API 访问。免费用户无需绑卡即可使用带 `:free` 后缀的模型，充值 $10 后每日限额从 50 次跃升至 1000 次。

## 适合谁

- ✅ 想用一个 key 访问多个主流模型的开发者
- ✅ 测试对比不同模型输出效果
- ✅ 有时想用 Gemini 有时想用 Llama，统一切换
- ❌ 对延迟极度敏感（请求多一跳路由）
- ❌ 需要确定底层模型隐私保证（需自查各模型方政策）

## 怎么拿 key

1. 访问 [https://openrouter.ai/keys](https://openrouter.ai/keys)，用 GitHub / Google 账号登录
2. 点击 **Create Key**，填入名称
3. 复制密钥，写入 `.env`：`OPENROUTER_API_KEY=sk-or-...`

> 💡 不需要绑信用卡即可使用免费模型。充值 $10（支持支付宝等）后 RPD 从 50 提升至 1000。

## 怎么用

### 命令行（curl）

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/llama-3.3-70b-instruct:free",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Python（OpenAI SDK）

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)
resp = client.chat.completions.create(
    model="meta-llama/llama-3.3-70b-instruct:free",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
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
|---|---:|---|
| `meta-llama/llama-3.3-70b-instruct:free` | 131 072 | 强通用模型，支持工具调用 |
| `google/gemini-2.0-flash-exp:free` | 1 048 576 | 1M 上下文，支持图片输入 |
| `deepseek/deepseek-chat-v3-0324:free` | 65 536 | 极佳代码 + 对话能力 |
| `qwen/qwq-32b:free` | 131 072 | 推理型模型，思考链可见 |
| `mistralai/mistral-small-3.1-24b-instruct:free` | 131 072 | 支持视觉，工具调用 |
| `google/gemma-3-27b-it:free` | 131 072 | Google Gemma 3 开源版 |

> 完整列表：[https://openrouter.ai/models?q=free](https://openrouter.ai/models?q=free)
> 数据来自 `providers.json` (Last Verified: 2026-04-27)

## 限速

- **20 RPM** — 每分钟最多 20 次请求
- **50 RPD**（无余额）/ **1000 RPD**（充值 $10+）— 每日限额
- HTTP 响应头 `x-ratelimit-limit-requests`、`x-ratelimit-remaining-requests` 可查剩余

> 详见 [https://openrouter.ai/docs/api/reference/limits](https://openrouter.ai/docs/api/reference/limits)

## 隐私 ⚠️

| 项 | 答案 |
|---|---|
| 是否用你的数据训模型？ | **No**（OpenRouter 自身不训练） |
| 是否记录 prompts？ | Unknown |
| 保留时长 | Unknown |
| 人工审查 | No |
| 政策链接 | [https://openrouter.ai/privacy](https://openrouter.ai/privacy) |

> ⚠️ OpenRouter 本身不训练，但请求会被路由到底层模型方（Google、Meta 等），各方有独立隐私政策。如对隐私敏感，请确认具体 `:free` 模型背后的提供商政策。

## 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| `401 Unauthorized` | Key 无效或格式错 | 确认 key 以 `sk-or-` 开头，检查 header 格式 |
| `429 Too Many Requests` | 超出 RPM 或 RPD 限制 | 加指数退避重试；考虑充值 $10 提高 RPD |
| `404 model not found` | 模型 ID 不含 `:free` 后缀 | 在模型 ID 末尾加 `:free`，如 `llama-3.3-70b-instruct:free` |
| `503 Service Unavailable` | 底层模型提供商暂时不可用 | 换用其他 `:free` 模型或稍后重试 |

## 接到客户端

- [opencode](../../docs/zh/clients/opencode.md)
- [Cursor](../../docs/zh/clients/cursor.md)
- [Cline](../../docs/zh/clients/cline.md)
- [Continue](../../docs/zh/clients/continue.md)
- [Chatbox](../../docs/zh/clients/chatbox.md)

## 心得

1. **切换模型零成本** — 只改 `model` 字段，代码完全不变。遇到某模型配额耗尽直接换另一个 `:free` 模型。
2. **充 $10 是最值的操作** — 从 50 RPD 到 1000 RPD，成本极低，适合轻量级生产使用。
3. **用 `/api/v1/auth/key` 检查 key 状态** — `GET /api/v1/auth/key` 返回余额、RPD 剩余，非常适合脚本自检。
4. **免费模型每天轮换** — 建议代码里用配置文件管理 model ID，不要硬编码，方便快速切换。
5. **加 `HTTP-Referer` 头** — OpenRouter 文档建议加入自己的项目 URL，有助于追踪用量来源。

## Sources

- [https://openrouter.ai/docs/api/reference/limits](https://openrouter.ai/docs/api/reference/limits) (fetched 2026-04-27)
- [https://openrouter.ai/models](https://openrouter.ai/models) (fetched 2026-04-27)
- [https://openrouter.ai/privacy](https://openrouter.ai/privacy) (fetched 2026-04-27)
- [https://openrouter.ai/faq](https://openrouter.ai/faq) (fetched 2026-04-27)
