# 其他模态矩阵（音频输入 / 视频输入）

> **Last Verified:** 2026-04-27

[English](../../en/capability/07-other-modalities.md) | [← 返回索引](00-index.md)

## 音频输入（语音转文字）

| 提供商 | 模型 | RPM | RPD | 格式 | 特点 |
|---|---|---:|---:|---|---|
| **Groq** | `whisper-large-v3` | 20 | 2 000 | mp3/mp4/wav/flac/ogg | LPU 极速，速度~实时 5x |
| **Groq** | `whisper-large-v3-turbo` | 20 | 2 000 | 同上 | 速度更快，精度略低 |
| **Cloudflare** | `@cf/openai/whisper` | — | ~100† | mp3/wav/flac | neurons 计量 |
| **Cloudflare** | `@cf/openai/whisper-large-v3-turbo` | — | ~100† | 同上 | Turbo 版 |
| **Ollama** | `whisper.cpp`（需单独安装） | 无限 | 无限 | 本地文件 | 完全本地，隐私最高 |

> † Cloudflare 以 neurons 计量，音频 neurons 消耗取决于时长

## Groq Whisper 使用示例

```python
import os
from groq import Groq  # pip install groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])

def transcribe(audio_path: str, language: str = "zh") -> str:
    """
    语音转文字，支持中文/英文等
    language: zh, en, ja, ko, fr, de 等
    """
    with open(audio_path, "rb") as f:
        transcription = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=f,
            language=language,
            response_format="verbose_json",  # 包含时间戳
        )
    return transcription.text

# 翻译（任意语言 → 英文）
def translate_to_english(audio_path: str) -> str:
    with open(audio_path, "rb") as f:
        translation = client.audio.translations.create(
            model="whisper-large-v3",
            file=f,
        )
    return translation.text

# 示例
text = transcribe("meeting_recording.mp3", language="zh")
print(text)
```

### 带时间戳的转录（字幕生成）

```python
import os
from groq import Groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])

def transcribe_with_timestamps(audio_path: str) -> list[dict]:
    """返回带时间戳的片段列表，用于生成字幕"""
    with open(audio_path, "rb") as f:
        result = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=f,
            language="zh",
            response_format="verbose_json",
            timestamp_granularities=["segment"],
        )

    segments = []
    for seg in result.segments:
        segments.append({
            "start": seg.start,
            "end": seg.end,
            "text": seg.text,
        })
    return segments

def to_srt(segments: list[dict]) -> str:
    """生成 SRT 字幕格式"""
    def fmt_time(t: float) -> str:
        h, m = divmod(int(t), 3600)
        m, s = divmod(m, 60)
        ms = int((t - int(t)) * 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

    lines = []
    for i, seg in enumerate(segments, 1):
        lines.append(str(i))
        lines.append(f"{fmt_time(seg['start'])} --> {fmt_time(seg['end'])}")
        lines.append(seg["text"].strip())
        lines.append("")
    return "\n".join(lines)

# 示例
segments = transcribe_with_timestamps("video.mp3")
srt = to_srt(segments)
with open("subtitles.srt", "w", encoding="utf-8") as f:
    f.write(srt)
print("字幕已生成：subtitles.srt")
```

## Cloudflare Whisper 使用示例

```python
import os, requests

ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
API_TOKEN  = os.environ["CLOUDFLARE_API_TOKEN"]

def cf_transcribe(audio_path: str) -> str:
    with open(audio_path, "rb") as f:
        resp = requests.post(
            f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/openai/whisper",
            headers={"Authorization": f"Bearer {API_TOKEN}"},
            files={"audio": f},
            timeout=60,
        )
    resp.raise_for_status()
    return resp.json()["result"]["text"]
```

## 视频输入（仅 Gemini 支持）

Gemini 2.5 Pro/Flash 和 2.0 Flash 是免费层唯一支持原生视频输入的模型。

```python
import os, time
import google.generativeai as genai  # pip install google-generativeai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def analyze_video(video_path: str, question: str) -> str:
    """上传视频并分析（最大 2GB，最长 2 小时）"""
    print(f"正在上传视频：{video_path}")
    video_file = genai.upload_file(video_path)

    # 等待视频处理完成
    while video_file.state.name == "PROCESSING":
        time.sleep(5)
        video_file = genai.get_file(video_file.name)

    if video_file.state.name == "FAILED":
        raise RuntimeError("视频处理失败")

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content([video_file, question])

    # 清理上传的文件
    genai.delete_file(video_file.name)

    return response.text

# 示例
result = analyze_video(
    "tutorial_video.mp4",
    "这个视频演示的是什么技术？列出主要步骤",
)
print(result)
```

## 模态汇总

| 模态 | 输入 | 输出 | 最佳免费方案 |
|---|:---:|:---:|---|
| 文本 | ✅ | ✅ | 全部提供商 |
| 图片（输入） | ✅ | — | Gemini 2.0 Flash（1500 RPD） |
| 图片（输出/生成） | — | ✅ | Cloudflare FLUX.1 |
| 音频（转文字） | ✅ | — | Groq Whisper（2K RPD，极速） |
| 视频（输入） | ✅ | — | Gemini 2.0/2.5（原生 API） |
| PDF | ✅ | — | Gemini 2.5 系列 |

## 选择建议

| 需求 | 推荐 |
|---|---|
| 大量音频转文字 | Groq Whisper（2K RPD，LPU 加速） |
| 视频内容分析 | Gemini 2.0 Flash（原生视频支持） |
| 本地音频处理（隐私） | whisper.cpp 本地部署 |
| 字幕自动生成 | Groq Whisper verbose_json + 时间戳 |
| 音频翻译为英文 | Groq Whisper translations API |
