# Google Gemini（AI Studio）

> **类型：** 一手（First Party）
> **OpenAI 兼容：** ✅（通过 `/v1beta/openai/` 兼容端点）
> **Last Verified:** 2026-04-27 ([sources](#sources))

[English](../en/02-gemini.md)

## 一句话

Google 官方的 Gemini API，通过 AI Studio 免费获取 key，无需绑卡。支持 1M token 超长上下文、图片/视频/PDF 多模态输入、原生工具调用，Gemini 2.5 Pro 还内置推理（思考链）。**注意：免费层 Google 会用你的数据改进模型。**

## 适合谁

- ✅ 需要超长上下文处理（1M token，整本书分析）
- ✅ 视频/图片/PDF 多模态输入场景
- ✅ 需要推理型模型（2.5 Pro 思考链）
- ✅ 国内可访问（需稳定网络，部分地区需代理）
- ❌ 对数据隐私要求高（免费层会被训练）
- ❌ 需要高频调用（免费层 RPM 最低 5）

## 怎么拿 key

1. 访问 [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)，用 Google 账号登录
2. 点击 **Create API key**
3. 选择 "Create API key in new project" 或关联已有项目
4. 复制密钥，写入 `.env`：`GEMINI_API_KEY=AIza...`

> 💡 不需要绑信用卡。Key 立即可用，无审核。中国大陆可能需要代理访问 AI Studio 页面及 API。

## 怎么用

### 原生方式（query param）

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "你好"}]}]}'
```

### OpenAI 兼容方式（推荐）

```bash
curl https://generativelanguage.googleapis.com/v1beta/openai/chat/completions \
  -H "Authorization: Bearer $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Python（OpenAI SDK）

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai",
    api_key=os.environ["GEMINI_API_KEY"],
)
resp = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
  apiKey: process.env.GEMINI_API_KEY,
});
```

### 图片输入示例

```python
import base64, os
from openai import OpenAI

client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai",
    api_key=os.environ["GEMINI_API_KEY"],
)
with open("image.jpg", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}},
            {"type": "text", "text": "这张图片里有什么？"},
        ],
    }],
)
```

## 免费模型（部分）

| 模型 | 上下文 | RPM | RPD | 备注 |
|---|---:|---:|---:|---|
| `gemini-2.5-pro` | 1 048 576 | 5 | 100 | 最强，推理+多模态 |
| `gemini-2.5-flash` | 1 048 576 | 10 | 250 | 最佳性价比，推理模式可选 |
| `gemini-2.0-flash` | 1 048 576 | 15 | 1500 | 快速多模态 |
| `gemini-2.0-flash-lite` | 1 048 576 | 15 | 1500 | 最轻量，高频简单任务 |

> 完整列表：[https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
> 数据来自 `providers.json` (Last Verified: 2026-04-27)

## 限速

- **gemini-2.5-pro：5 RPM / 100 RPD / 250K TPM**
- **gemini-2.5-flash：10 RPM / 250 RPD / 250K TPM**
- **gemini-2.0-flash / lite：15 RPM / 1500 RPD / 250K TPM**
- 响应头不返回剩余配额，需自己计数

> 详见 [https://ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits)

## 隐私 ⚠️

| 项 | 答案 |
|---|---|
| 是否用你的数据训模型？ | **Yes（免费层）** |
| 是否记录 prompts？ | Yes |
| 保留时长 | Unknown |
| 人工审查 | Yes（可能） |
| 政策链接 | [https://ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms) |

> ⚠️ **重要警告：** AI Studio 免费层，Google 可能将你的输入/输出用于改进模型，并允许人工审查。请勿在免费层发送任何涉及个人隐私、商业机密、医疗、法律等敏感数据。
> 如需零训练保证，请升级到 Vertex AI（付费）。

## 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| `400 API_KEY_INVALID` | Key 错误或被撤销 | 在 AI Studio 重新生成 key |
| `429 RESOURCE_EXHAUSTED` | 超过 RPM 或 RPD | 降速，等下一分钟/天；2.5 Pro RPM 仅 5 |
| `403 Permission denied` | Key 所属项目未启用 Gemini API | 在 Google Cloud Console 启用 API |
| `Connection refused` | 国内网络问题 | 配置代理：`HTTPS_PROXY=http://127.0.0.1:7890` |

## 接到客户端

- [opencode](../../docs/zh/clients/opencode.md)
- [Cursor](../../docs/zh/clients/cursor.md)
- [Cline](../../docs/zh/clients/cline.md)
- [Continue](../../docs/zh/clients/continue.md)
- [Chatbox](../../docs/zh/clients/chatbox.md)

## 心得

1. **2.5-flash 是日常首选** — 10 RPM/250 RPD，质量接近 Pro，速度快，够大多数场景用。
2. **1M 上下文善用** — 一次传入整本代码库/长篇文章比分批处理简单，且准确度更高。
3. **免费 RPD 很低，攒着用 2.5 Pro** — Pro 仅 100 RPD，留给真正需要高质量推理的任务。
4. **PDF/视频直传** — Gemini 原生支持上传文件，无需转格式，省事。
5. **OpenAI 兼容端点快速迁移** — 已有 OpenAI SDK 代码只需改 `base_url` 和 `api_key`。

## Sources

- [https://ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits) (fetched 2026-04-27)
- [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) (fetched 2026-04-27)
- [https://ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms) (fetched 2026-04-27)
