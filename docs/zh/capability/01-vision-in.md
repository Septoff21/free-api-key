# 视觉输入（图片分析）矩阵

> **Last Verified:** 2026-04-27

[English](../../en/capability/01-vision-in.md) | [← 返回索引](00-index.md)

## 支持图片/视频输入的免费模型

| 提供商 | 模型 | 图片 | 视频 | PDF | 上下文 | RPD | 备注 |
|---|---|:---:|:---:|:---:|---:|---:|---|
| **Gemini** | `gemini-2.5-pro` | ✅ | ✅ | ✅ | 1 048 576 | 100 | 最强多模态，推理加持 |
| **Gemini** | `gemini-2.5-flash` | ✅ | ✅ | ✅ | 1 048 576 | 250 | 最佳性价比，速度快 |
| **Gemini** | `gemini-2.0-flash` | ✅ | ✅ | — | 1 048 576 | 1 500 | 最高 RPD，适合高频图片任务 |
| **Gemini** | `gemini-2.0-flash-lite` | ✅ | — | — | 1 048 576 | 1 500 | 最轻量 |
| **OpenRouter** | `google/gemini-2.0-flash-exp:free` | ✅ | — | — | 1 048 576 | 50/1000⁺ | OR 路由 Gemini，无需 Google 账号 |
| **OpenRouter** | `mistralai/mistral-small-3.1:free` | ✅ | — | — | 131 072 | 50/1000⁺ | Mistral 视觉，多语言强 |
| **GitHub Models** | `openai/gpt-4o` | ✅ | — | — | 128 000 | 50 | GPT-4o 视觉，无 OpenAI 账号 |
| **GitHub Models** | `openai/gpt-4.1-mini` | ✅ | — | — | 128 000 | 50 | 轻量 GPT-4 视觉 |
| **GitHub Models** | `mistral-ai/mistral-small` | ✅ | — | — | 32 768 | 150 | Low 层，更高 RPD |
| **Mistral** | `mistral-small-latest` | ✅ | — | — | 131 072 | 无限† | 2 RPM，1B tok/月 |
| **Groq** | `llama-3.2-11b-vision-preview` | ✅ | — | — | 8 192 | 1 000 | Groq 唯一视觉模型 |
| **Cloudflare** | `@cf/meta/llama-3.2-11b-vision-instruct` | ✅ | — | — | 8 192 | ~200⁺⁺ | 10K neurons/天，约 30-60 neurons/1K tokens |
| **Ollama** | `llava:13b` | ✅ | — | — | 4 096 | 无限 | 本地，隐私最高，~8GB |
| **Ollama** | `llava-llama3` | ✅ | — | — | 4 096 | 无限 | Llama3 底座视觉模型 |

> † Mistral 以 token/月 计量（1B tok/月），无 RPD 限制
> ⁺ OpenRouter RPD: 无余额 50，充 $10 后 1000
> ⁺⁺ Cloudflare 以 neurons/天 计量

## 使用建议

### 最多图片：Gemini 2.0 Flash（15 RPM / 1500 RPD）

```python
from openai import OpenAI
import base64, os

client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai",
    api_key=os.environ["GEMINI_API_KEY"],
)

def analyze_image(image_path: str, question: str) -> str:
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()
    ext = image_path.rsplit(".", 1)[-1].lower()
    mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
            "gif": "image/gif", "webp": "image/webp"}.get(ext, "image/jpeg")
    resp = client.chat.completions.create(
        model="gemini-2.0-flash",
        messages=[{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{img_b64}"}},
                {"type": "text", "text": question},
            ],
        }],
    )
    return resp.choices[0].message.content
```

### 最高隐私：Ollama + llava

```bash
ollama pull llava:13b
```

```python
from openai import OpenAI
import base64

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

with open("image.jpg", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="llava:13b",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}},
            {"type": "text", "text": "描述这张图片"},
        ],
    }],
)
```

### 不需要 Google/OpenAI 账号：OpenRouter Gemini `:free`

```python
from openai import OpenAI
import base64, os

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)
# model: google/gemini-2.0-flash-exp:free
```

## 视频输入（仅 Gemini 原生 API）

只有 Google Gemini 2.5 Pro/Flash 和 2.0 Flash 原生支持视频输入（通过 File API 上传或 YouTube URL）：

```python
import google.generativeai as genai
import os

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# 上传视频文件
video_file = genai.upload_file("video.mp4")

model = genai.GenerativeModel("gemini-2.0-flash")
response = model.generate_content([
    video_file,
    "总结这个视频的主要内容"
])
print(response.text)
```

## 选择决策树

```
需要视觉输入？
  ├─ 需要视频？ → Gemini 2.5 Pro/Flash（原生 API）
  ├─ 需要 PDF？ → Gemini 2.5 系列
  ├─ 隐私敏感？ → Ollama llava:13b
  ├─ 无 Google 账号？ → OpenRouter gemini:free 或 GitHub gpt-4o
  ├─ 高频图片（>250/天）？ → Gemini 2.0 Flash（1500 RPD）
  └─ 一般图片分析？ → Gemini 2.5 Flash（最佳性价比）
```
