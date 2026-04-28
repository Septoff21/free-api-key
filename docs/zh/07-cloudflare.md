# Cloudflare Workers AI

> **类型：** 推理服务（Inference Provider）
> **OpenAI 兼容：** ❌（原生 REST API；可通过 AI Gateway 接入 OpenAI 兼容层）
> **Last Verified:** 2026-04-27 ([sources](#sources))

[English](../en/07-cloudflare.md)

## 一句话

Cloudflare Workers AI 是唯一在免费层同时提供**文本生成 + 图片生成 + 语音转文字 + 视觉分析**四合一的服务，每天 10,000 neurons 免费额度（约 200-500 次文本请求或 25 张图片）。需要同时使用 Account ID 和 API Token 两个凭证，URL 结构独特。

## 适合谁

- ✅ 需要免费图片生成（FLUX.1 Schnell，约 25 张/天）
- ✅ 需要多模态一站式（文字、图片输入/输出、音频）
- ✅ 已有 Cloudflare 账号（Workers / Pages 用户）
- ✅ 对 Cloudflare 基础设施有信任（SOC2、GDPR 合规）
- ❌ 需要 OpenAI SDK 直接兼容（URL 结构不同，需适配）
- ❌ 需要大量文本调用（10K neurons/天 = ~500 次文本请求）

## 怎么拿 key

需要两个凭证：**Account ID** + **API Token**。

### 第一步：获取 Account ID

1. 登录 [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. 右侧边栏找到 **Account ID**，复制
3. 写入 `.env`：`CLOUDFLARE_ACCOUNT_ID=...`

### 第二步：创建 API Token

1. 访问 [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token**
3. 选择模板 **Workers AI** 或自定义权限（需要 `Workers AI:Read`）
4. 生成并复制 token
5. 写入 `.env`：`CLOUDFLARE_API_TOKEN=...`

> 💡 Cloudflare 账号注册无需绑卡（但部分功能需要），Workers AI 免费层不需要付费计划。

## 怎么用

### 命令行（curl）

```bash
# 文本生成
curl "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Python（requests 直接调用）

```python
import os, requests

ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
API_TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]

def cf_run(model, payload):
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{model}"
    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {API_TOKEN}"},
        json=payload,
    )
    return resp.json()

# 文本生成
result = cf_run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    {"messages": [{"role": "user", "content": "你好"}]},
)
print(result["result"]["response"])
```

### 图片生成（FLUX.1 Schnell）

```python
import os, requests, base64
from PIL import Image
from io import BytesIO

ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
API_TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]

resp = requests.post(
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell",
    headers={"Authorization": f"Bearer {API_TOKEN}"},
    json={"prompt": "一只可爱的熊猫在竹林里，水彩画风格"},
)
# 返回二进制图片数据
image = Image.open(BytesIO(resp.content))
image.save("output.png")
print("图片已保存为 output.png")
```

### 语音转文字（Whisper）

```python
import os, requests

ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
API_TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]

with open("audio.mp3", "rb") as f:
    resp = requests.post(
        f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/openai/whisper",
        headers={"Authorization": f"Bearer {API_TOKEN}"},
        files={"audio": f},
    )
print(resp.json()["result"]["text"])
```

## 免费模型（部分）

| 模型 | 类型 | 备注 |
|---|---|---|
| `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | 文本 | 主力文本模型，工具调用 |
| `@cf/meta/llama-3.2-11b-vision-instruct` | 文本+视觉 | 图片分析 |
| `@cf/black-forest-labs/flux-1-schnell` | 图片生成 | 约 25 张/天（400 neurons/张） |
| `@cf/openai/whisper` | 语音→文字 | 音频转录 |
| `@cf/qwen/qwen2.5-coder-32b-instruct` | 文本（代码） | 顶级开源代码模型 |
| `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | 文本（推理） | 推理+思考链 |

> 完整列表：[https://developers.cloudflare.com/workers-ai/models/](https://developers.cloudflare.com/workers-ai/models/)
> 数据来自 `providers.json` (Last Verified: 2026-04-27)

## 限速

- **10,000 neurons/天**（免费配额，以"算力单位"计量，非 token 数）
- 文字模型：约 20-50 neurons/1K tokens → 约 200-500 次短对话/天
- 图片生成：约 400 neurons/张 → **约 25 张/天**
- 无 RPM 限制的明确说明，但超出 neurons 配额后请求失败

> 详见 [https://developers.cloudflare.com/workers-ai/platform/limits/](https://developers.cloudflare.com/workers-ai/platform/limits/)

## 隐私 ⚠️

| 项 | 答案 |
|---|---|
| 是否用你的数据训模型？ | **No** |
| 是否记录 prompts？ | Unknown |
| 保留时长 | Unknown |
| 人工审查 | No |
| 政策链接 | [https://www.cloudflare.com/privacypolicy/](https://www.cloudflare.com/privacypolicy/) |

> Cloudflare 不使用客户内容训练 AI 模型（见 Workers AI 文档及 DPA）。企业级隐私标准（SOC2、GDPR）。主站隐私政策主要覆盖 CDN/DNS 服务，Workers AI 适用 Cloudflare DPA。

## 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| `401 Unauthorized` | Token 无效或缺少权限 | 确认 Token 有 Workers AI 权限 |
| `400 Account not found` | Account ID 错误 | 从 Dashboard 重新复制 Account ID |
| `429 / neurons exceeded` | 超出 10K neurons/天 | 等明天配额重置，或升级付费计划 |
| `404 Model not found` | 模型 ID 格式错（缺少 `@cf/` 前缀） | 用完整格式如 `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |

## 接到客户端

- [opencode](../../docs/zh/clients/opencode.md)（通过 AI Gateway OpenAI 兼容层）
- [Chatbox](../../docs/zh/clients/chatbox.md)（自定义 API 端点）

> 注意：直接调用 Workers AI API 不是 OpenAI 格式。如需 OpenAI 兼容，可通过 Cloudflare AI Gateway 中转。

## 心得

1. **图片生成是最大亮点** — 免费层唯一可以生成图片的服务，FLUX.1 Schnell 质量不错，25 张/天够个人项目用。
2. **neurons 不等于 tokens** — 规划配额时要以 neurons 计算，不要用 token 计数类比。
3. **URL 里嵌 Account ID 是独特设计** — 建议封装成 helper 函数，避免每次都拼 URL。
4. **通过 AI Gateway 获得 OpenAI 兼容** — 在 Cloudflare Dashboard 创建 AI Gateway，可以用 OpenAI SDK + OpenAI 兼容 URL 访问 Workers AI。
5. **组合使用多模态** — 同一个 key 可以文字、图片生成、图片识别、语音转文字全覆盖，适合多媒体内容处理管道。

## Sources

- [https://developers.cloudflare.com/workers-ai/platform/limits/](https://developers.cloudflare.com/workers-ai/platform/limits/) (fetched 2026-04-27)
- [https://developers.cloudflare.com/workers-ai/models/](https://developers.cloudflare.com/workers-ai/models/) (fetched 2026-04-27)
- [https://www.cloudflare.com/privacypolicy/](https://www.cloudflare.com/privacypolicy/) (fetched 2026-04-27)
