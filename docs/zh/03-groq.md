# Groq

> **类型：** 推理服务（Inference Provider）
> **OpenAI 兼容：** ✅
> **Last Verified:** 2026-04-27 ([sources](#sources))

[English](../en/03-groq.md)

## 一句话

Groq 使用自研 LPU（语言处理单元）芯片运行推理，速度是 GPU 的 5-10 倍，免费层 30 RPM / 14.4K RPD，支持 Llama 3.x、DeepSeek-R1、QwQ 推理模型，以及 Whisper 语音转文字。极速是 Groq 的核心卖点。

## 适合谁

- ✅ 需要极低延迟、高吞吐量推理（500+ tok/s）
- ✅ 实时对话、流式输出场景
- ✅ 大量调用小模型（8B 每日 14.4K 次）
- ✅ 语音转文字（Whisper）
- ❌ 需要图片输入的复杂视觉任务（仅有 11B 视觉预览版）
- ❌ 对 70B 模型有高频需求（RPD 仅 1K）

## 怎么拿 key

1. 访问 [https://console.groq.com/keys](https://console.groq.com/keys)，用 Google / GitHub 账号注册
2. 点击 **Create API Key**，填写名称
3. 复制密钥，写入 `.env`：`GROQ_API_KEY=gsk_...`

> 💡 无需绑卡，立即可用。中国大陆访问 Groq API 通常需要代理。

## 怎么用

### 命令行（curl）

```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Python（OpenAI SDK）

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ["GROQ_API_KEY"],
)
resp = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});
```

### 语音转文字（Whisper）

```python
from groq import Groq  # pip install groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])
with open("audio.mp3", "rb") as f:
    transcription = client.audio.transcriptions.create(
        model="whisper-large-v3",
        file=f,
        language="zh",
    )
print(transcription.text)
```

## 免费模型（部分）

| 模型 | 上下文 | RPM | RPD | 备注 |
|---|---:|---:|---:|---|
| `llama-3.1-8b-instant` | 131 072 | 30 | 14 400 | 最高配额，极速首选 |
| `llama-3.3-70b-versatile` | 131 072 | 30 | 1 000 | 高质量通用模型 |
| `llama-3.2-11b-vision-preview` | 8 192 | 30 | 1 000 | 图片分析（预览版） |
| `deepseek-r1-distill-llama-70b` | 131 072 | 30 | 1 000 | 推理，思考链可见 |
| `qwen-qwq-32b` | 131 072 | 30 | 1 000 | 推理，数学/代码强 |
| `whisper-large-v3` | — | 20 | 2 000 | 语音转文字 |

> 完整列表：[https://console.groq.com/docs/models](https://console.groq.com/docs/models)
> 数据来自 `providers.json` (Last Verified: 2026-04-27)

## 限速

- **30 RPM / 14.4K RPD**（8B 模型，6K TPM / 500K TPD）
- **30 RPM / 1K RPD**（70B 及推理模型，TPD 100K）
- **20 RPM / 2K RPD**（Whisper 音频）
- HTTP 头 `x-ratelimit-limit-requests`、`x-ratelimit-remaining-requests`、`x-ratelimit-limit-tokens` 可查剩余

> 详见 [https://console.groq.com/docs/rate-limits](https://console.groq.com/docs/rate-limits)

## 隐私 ⚠️

| 项 | 答案 |
|---|---|
| 是否用你的数据训模型？ | **No**（GroqCloud 不训练） |
| 是否记录 prompts？ | Unknown |
| 保留时长 | Unknown |
| 人工审查 | No |
| 政策链接 | [https://groq.com/privacy-policy/](https://groq.com/privacy-policy/) |

> GroqCloud API 受独立的 Groq Cloud Services Agreement 管辖，不适用主站消费者隐私政策。API 数据不用于模型训练。

## 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| `401 Unauthorized` | Key 无效 | 检查 key 以 `gsk_` 开头，Header 格式正确 |
| `429 Too Many Requests` | 超 RPM/RPD/TPM | 查响应头确认哪项超限，加退避重试 |
| `400 model not found` | 模型 ID 拼写错 | 从 `/v1/models` 接口获取正确 ID |
| `Connection timeout` | 网络问题 | 配置代理：`HTTPS_PROXY=http://127.0.0.1:7890` |

## 接到客户端

- [opencode](../../docs/zh/clients/opencode.md)
- [Cursor](../../docs/zh/clients/cursor.md)
- [Cline](../../docs/zh/clients/cline.md)
- [Continue](../../docs/zh/clients/continue.md)
- [Chatbox](../../docs/zh/clients/chatbox.md)

## 心得

1. **8B 模型是流水线首选** — 14.4K RPD + 极速，非常适合 agent 内部大量调用（分类/改写/提取等）。
2. **推理模型 70B 配额很低** — QwQ / DeepSeek-R1 每天只有 1K 次，留给真正需要深度推理的场景。
3. **配额查响应头** — `x-ratelimit-remaining-requests` 直接告诉你剩余次数，脚本里轮询这个值决定是否切换模型。
4. **Whisper 速度极快** — 同样基于 LPU，音频转写比其他服务快 3-5 倍，适合实时字幕场景。
5. **流式输出必开** — 高速模型配合 `stream: true`，首 token 延迟极低，体验与本地运行接近。

## Sources

- [https://console.groq.com/docs/rate-limits](https://console.groq.com/docs/rate-limits) (fetched 2026-04-27)
- [https://console.groq.com/docs/models](https://console.groq.com/docs/models) (fetched 2026-04-27)
- [https://groq.com/privacy-policy/](https://groq.com/privacy-policy/) (fetched 2026-04-27)
