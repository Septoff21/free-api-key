# Mistral La Plateforme

> **类型：** 一手（First Party）
> **OpenAI 兼容：** ✅
> **Last Verified:** 2026-04-27 ([sources](#sources))

[English](../en/06-mistral.md)

## 一句话

法国 AI 公司 Mistral 的官方 API，免费"Experiment"计划提供全部模型（含旗舰 Mistral Large 和 256K 上下文代码模型 Codestral），每月 **1B token** 额度，仅限速 2 RPM。GDPR 合规，默认不用数据训练，对隐私敏感的欧洲/国内用户友好。

## 适合谁

- ✅ 需要代码补全（Codestral，256K 上下文，FIM 支持）
- ✅ 对数据隐私要求较高（法国 GDPR 合规，不训练数据）
- ✅ 每月用量不超过 1B tokens（个人项目绰绰有余）
- ✅ 需要视觉输入（Mistral Small 3.1 支持图片）
- ❌ 需要高频实时调用（2 RPM 非常低，必须做重试）
- ❌ 需要推理/思考链模型（Mistral 目前免费层不含专属推理模型）

## 怎么拿 key

1. 访问 [https://console.mistral.ai/api-keys](https://console.mistral.ai/api-keys)，注册 Mistral 账号
2. 选择 **Experiment**（免费）计划
3. 点击 **Create new key**，填写名称
4. 复制密钥，写入 `.env`：`MISTRAL_API_KEY=...`

> 💡 无需绑卡，选 Experiment 计划即为免费。Codestral 需要单独在 [https://console.mistral.ai/](https://console.mistral.ai/) 启用，并使用独立端点。

## 怎么用

### 命令行（curl）

```bash
curl https://api.mistral.ai/v1/chat/completions \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral-small-latest",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Python（OpenAI SDK）

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.mistral.ai/v1",
    api_key=os.environ["MISTRAL_API_KEY"],
)
resp = client.chat.completions.create(
    model="mistral-small-latest",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://api.mistral.ai/v1",
  apiKey: process.env.MISTRAL_API_KEY,
});
```

### Codestral 代码补全（FIM）

```python
import os, requests

resp = requests.post(
    "https://codestral.mistral.ai/v1/fim/completions",
    headers={
        "Authorization": f"Bearer {os.environ['MISTRAL_API_KEY']}",
        "Content-Type": "application/json",
    },
    json={
        "model": "codestral-latest",
        "prompt": "def fibonacci(n):",
        "suffix": "\n    return result",
        "max_tokens": 256,
    },
)
print(resp.json()["choices"][0]["message"]["content"])
```

### 视觉输入（Mistral Small）

```python
import os, base64
from openai import OpenAI

client = OpenAI(
    base_url="https://api.mistral.ai/v1",
    api_key=os.environ["MISTRAL_API_KEY"],
)
with open("image.jpg", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="mistral-small-latest",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}},
            {"type": "text", "text": "这张图有什么？"},
        ],
    }],
)
```

## 免费模型（部分）

| 模型 | 上下文 | 备注 |
|---|---:|---|
| `mistral-small-latest` | 131 072 | Small 3.1，视觉+工具调用 |
| `mistral-large-latest` | 131 072 | 旗舰模型，强通用能力 |
| `codestral-latest` | 256 000 | 代码专用，256K，FIM 补全 |
| `open-mistral-nemo` | 131 072 | 12B 开源，快速多语言 |

> 完整列表：[https://docs.mistral.ai/getting-started/models/](https://docs.mistral.ai/getting-started/models/)
> 数据来自 `providers.json` (Last Verified: 2026-04-27)

## 限速

- **2 RPM** — 每分钟仅 2 次请求，**必须实现指数退避重试**
- **1B tokens/月** — 非常充裕，约合 750M 中文字
- HTTP 头 `x-ratelimit-limit`、`x-ratelimit-remaining` 可查剩余

> 详见 [https://docs.mistral.ai/getting-started/quickstart/](https://docs.mistral.ai/getting-started/quickstart/)

## 隐私 ⚠️

| 项 | 答案 |
|---|---|
| 是否用你的数据训模型？ | **No**（需要显式 opt-in） |
| 是否记录 prompts？ | Unknown |
| 保留时长 | Unknown |
| 人工审查 | No |
| 政策链接 | [https://mistral.ai/privacy/](https://mistral.ai/privacy/) |

> 默认不训练。Mistral 是法国公司，严格遵守 GDPR，隐私保护力度强于大多数美国提供商。如需用数据改进模型，需要显式 opt-in 同意。

## 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| `401 Unauthorized` | Key 无效 | 检查 key 格式，在控制台确认 key 状态 |
| `429 Too Many Requests` | 超过 2 RPM | 加 30 秒+ 的退避等待，2 RPM 每隔 30 秒才能发一次 |
| `404 model not found` | Codestral 需要不同端点 | Codestral 用 `https://codestral.mistral.ai/v1` |
| `400 Input too long` | 超过模型上下文 | Codestral 256K，其他 128K，通常不会超 |

## 接到客户端

- [opencode](../../docs/zh/clients/opencode.md)（Codestral 可用于代码补全）
- [Cursor](../../docs/zh/clients/cursor.md)
- [Cline](../../docs/zh/clients/cline.md)
- [Continue](../../docs/zh/clients/continue.md)（Codestral FIM 集成）
- [Chatbox](../../docs/zh/clients/chatbox.md)

## 心得

1. **2 RPM 要用队列** — 严格限速，代码里必须有 rate limiter，每次调用前等上一次至少 30 秒后再发。
2. **Codestral 是代码补全神器** — 256K 上下文，支持 FIM（fill-in-middle），接入 Continue / Copilot 等编辑器插件效果拔群。
3. **隐私优先选 Mistral** — 欧洲监管 + 默认不训练，企业项目合规成本低。
4. **1B token/月够一个小团队** — 合理分配给多个功能，不要让单个 agent 无限消耗。
5. **Mistral Large 别浪费 RPM** — Large 模型质量最高，把 2 RPM 配额留给真正需要高质量的请求，日常任务用 Nemo/Small。

## Sources

- [https://docs.mistral.ai/getting-started/quickstart/](https://docs.mistral.ai/getting-started/quickstart/) (fetched 2026-04-27)
- [https://docs.mistral.ai/getting-started/models/](https://docs.mistral.ai/getting-started/models/) (fetched 2026-04-27)
- [https://mistral.ai/privacy/](https://mistral.ai/privacy/) (fetched 2026-04-27)
