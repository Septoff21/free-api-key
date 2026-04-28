# Cerebras Inference

> **类型：** 推理服务（Inference Provider）
> **OpenAI 兼容：** ✅
> **Last Verified:** 2026-04-27 ([sources](#sources))

[English](../en/04-cerebras.md)

## 一句话

Cerebras 使用自研 WSE（晶圆级芯片）提供 AI 推理，单芯片算力远超 GPU 集群。免费层每日 **1M tokens**、30 RPM、14.4K RPD，60K TPM 的吞吐量是市场上最慷慨的免费额度之一。适合需要快速、大量生成文字的场景。

## 适合谁

- ✅ 需要超高吞吐量（60K TPM，文档批处理、大量生成）
- ✅ 每日 1M token 配额（个人开发者足以覆盖大多数需求）
- ✅ 代理工作流（llama3.1-8b 支持工具调用，速度极快）
- ❌ 需要图片/视频输入（Cerebras 仅支持纯文本）
- ❌ 需要超长上下文（8B 模型仅 8K context）

## 怎么拿 key

1. 访问 [https://cloud.cerebras.ai](https://cloud.cerebras.ai)，注册账号
2. 登录后进入 **API Keys** 页面
3. 点击 **Create API Key**，复制密钥
4. 写入 `.env`：`CEREBRAS_API_KEY=csk-...`

> 💡 无需绑卡，注册即用。中国大陆需要代理。

## 怎么用

### 命令行（curl）

```bash
curl https://api.cerebras.ai/v1/chat/completions \
  -H "Authorization: Bearer $CEREBRAS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1-8b",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Python（OpenAI SDK）

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cerebras.ai/v1",
    api_key=os.environ["CEREBRAS_API_KEY"],
)
resp = client.chat.completions.create(
    model="llama3.3-70b",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://api.cerebras.ai/v1",
  apiKey: process.env.CEREBRAS_API_KEY,
});
```

### 工具调用（Tool Use）示例

```python
import os, json
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cerebras.ai/v1",
    api_key=os.environ["CEREBRAS_API_KEY"],
)

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "获取指定城市的天气",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        },
    },
}]

resp = client.chat.completions.create(
    model="llama3.3-70b",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools,
    tool_choice="auto",
)
print(resp.choices[0].message.tool_calls)
```

## 免费模型（部分）

| 模型 | 上下文 | RPM | RPD | TPD | 备注 |
|---|---:|---:|---:|---:|---|
| `llama3.1-8b` | 8 192 | 30 | 14 400 | 1 000 000 | 最快，工具调用，高配额 |
| `llama3.3-70b` | 128 000 | 30 | 14 400 | 1 000 000 | 高质量，128K 上下文 |
| `qwen-3-235b-a22b` | 32 768 | 30 | 14 400 | 1 000 000 | Qwen3 MoE，推理增强 |

> 完整列表：[https://inference-docs.cerebras.ai/introduction](https://inference-docs.cerebras.ai/introduction)
> 数据来自 `providers.json` (Last Verified: 2026-04-27)

## 限速

- **30 RPM / 14.4K RPD / 1M TPD / 60K TPM**（主要模型）
- 1M tokens/day = 大约 750 篇标准文章，对个人开发者非常够用
- HTTP 头 `x-ratelimit-limit`、`x-ratelimit-remaining` 可查剩余

> 详见 [https://inference-docs.cerebras.ai/support/rate-limits](https://inference-docs.cerebras.ai/support/rate-limits)

## 隐私 ⚠️

| 项 | 答案 |
|---|---|
| 是否用你的数据训模型？ | **No** |
| 是否记录 prompts？ | Unknown |
| 保留时长 | Unknown |
| 人工审查 | No |
| 政策链接 | [https://cerebras.ai/privacy-policy](https://cerebras.ai/privacy-policy) |

> Cerebras 不使用 API 用户数据训练模型，请求仅用于即时推理。

## 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| `401 Unauthorized` | Key 无效或格式错 | 确认 key 以 `csk-` 开头 |
| `429 Too Many Requests` | 超 RPM 或 TPM | 加退避重试；TPM 60K 已很高，通常是 RPM 超限 |
| `400 context_length_exceeded` | llama3.1-8b 超过 8K 上下文 | 改用 llama3.3-70b（128K 上下文） |
| `Connection timeout` | 网络问题 | 配置代理 |

## 接到客户端

- [opencode](../../docs/zh/clients/opencode.md)
- [Cursor](../../docs/zh/clients/cursor.md)
- [Cline](../../docs/zh/clients/cline.md)
- [Continue](../../docs/zh/clients/continue.md)
- [Chatbox](../../docs/zh/clients/chatbox.md)

## 心得

1. **1M TPD 是真正的生产级免费额度** — 比其他免费服务高出 5-10 倍，非常适合批量处理、数据清洗、大量摘要生成等任务。
2. **8B 模型做 Agent 内部调用** — 工具调用 + 极速 + 高配额，理想的"Agent 工作马"，复杂任务用 70B 验证，日常循环用 8B。
3. **注意 8B 上下文只有 8K** — 长文档必须用 70B（128K）或分块处理。
4. **60K TPM 适合流式批处理** — 同时发起多个流式请求，总体吞吐量极高。
5. **Qwen3-235B 开启 thinking** — 最新 MoE 模型支持扩展思考，对需要深度推理但又想用免费层的场景是惊喜。

## Sources

- [https://inference-docs.cerebras.ai/support/rate-limits](https://inference-docs.cerebras.ai/support/rate-limits) (fetched 2026-04-27)
- [https://inference-docs.cerebras.ai/introduction](https://inference-docs.cerebras.ai/introduction) (fetched 2026-04-27)
- [https://cerebras.ai/privacy-policy](https://cerebras.ai/privacy-policy) (fetched 2026-04-27)
