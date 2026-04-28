# Recipe：视觉分析（图片/截图理解）

> **难度：** 初级 · **预计时间：** 10 分钟 · **Last Verified:** 2026-04-27

[English](../../en/recipes/02-vision-analyze.md)

## 场景

将图片传给 LLM 进行分析：截图理解、OCR 文字识别、图表解读、产品图分析等。

## 推荐模型

| 需求 | 模型 | 理由 |
|---|---|---|
| 高频（1500 RPD） | Gemini `gemini-2.0-flash` | 最高 RPD 视觉模型 |
| 最佳质量 | Gemini `gemini-2.5-pro` | 推理+视觉，100 RPD |
| 无 Google 账号 | GitHub `openai/gpt-4o` | GPT-4o 视觉，50 RPD |
| 本地隐私 | Ollama `llava:13b` | 完全离线 |

## 核心代码

```python
"""
vision_analyze.py — 通用图片分析

支持 URL 图片和本地文件，自动选择最佳编码方式
"""

import os, base64
from pathlib import Path
from openai import OpenAI

def create_client(provider: str = "gemini") -> tuple[OpenAI, str]:
    """根据提供商返回 (client, model)"""
    configs = {
        "gemini": (
            "https://generativelanguage.googleapis.com/v1beta/openai",
            os.environ.get("GEMINI_API_KEY", ""),
            "gemini-2.0-flash",
        ),
        "github": (
            "https://models.github.ai/inference",
            os.environ.get("GITHUB_TOKEN", ""),
            "openai/gpt-4o",
        ),
        "ollama": (
            "http://localhost:11434/v1",
            "ollama",
            "llava:13b",
        ),
        "openrouter": (
            "https://openrouter.ai/api/v1",
            os.environ.get("OPENROUTER_API_KEY", ""),
            "google/gemini-2.0-flash-exp:free",
        ),
    }
    base_url, api_key, model = configs[provider]
    return OpenAI(base_url=base_url, api_key=api_key), model


def analyze_image(
    image: str,           # 文件路径 或 URL
    question: str,
    provider: str = "gemini",
    detail: str = "auto", # "low" / "high" / "auto"
) -> str:
    client, model = create_client(provider)

    # 构建图片内容
    if image.startswith("http://") or image.startswith("https://"):
        # URL 图片
        image_content = {"type": "image_url", "image_url": {"url": image, "detail": detail}}
    else:
        # 本地文件 → base64
        path = Path(image)
        ext = path.suffix.lower().lstrip(".")
        mime_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
                    "gif": "image/gif", "webp": "image/webp", "bmp": "image/bmp"}
        mime = mime_map.get(ext, "image/jpeg")
        with open(path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        image_content = {
            "type": "image_url",
            "image_url": {"url": f"data:{mime};base64,{b64}", "detail": detail},
        }

    resp = client.chat.completions.create(
        model=model,
        messages=[{
            "role": "user",
            "content": [image_content, {"type": "text", "text": question}],
        }],
        max_tokens=1024,
    )
    return resp.choices[0].message.content


# ─── 预设任务 ──────────────────────────────────────────────────────────────────

def ocr_extract(image: str, provider: str = "gemini") -> str:
    """提取图片中的所有文字（OCR）"""
    return analyze_image(
        image,
        "请提取这张图片中的所有文字，保持原始格式和排版。如果是表格，以 Markdown 表格格式输出。",
        provider,
    )

def describe_chart(image: str, provider: str = "gemini") -> str:
    """分析图表/数据可视化"""
    return analyze_image(
        image,
        "这是一张图表。请：1）描述图表类型和主题，2）列出关键数据点，3）总结主要趋势或结论。",
        provider,
    )

def analyze_screenshot(image: str, provider: str = "gemini") -> str:
    """分析 UI 截图"""
    return analyze_image(
        image,
        "这是一张软件/网页截图。请描述：1）界面的主要功能区域，2）当前显示的内容，3）任何明显的 UI 问题或错误信息。",
        provider,
    )

def check_code_screenshot(image: str, provider: str = "gemini") -> str:
    """从代码截图中提取并分析代码"""
    return analyze_image(
        image,
        "这是一张代码截图。请：1）提取所有代码，2）分析代码的功能，3）指出任何潜在问题。以 Markdown 代码块格式输出提取的代码。",
        provider,
    )


# ─── 批量处理 ──────────────────────────────────────────────────────────────────

def batch_analyze(image_paths: list[str], question: str, provider: str = "gemini") -> list[dict]:
    """批量分析多张图片"""
    import time
    results = []
    for i, img in enumerate(image_paths):
        print(f"处理 {i+1}/{len(image_paths)}: {img}")
        try:
            result = analyze_image(img, question, provider)
            results.append({"image": img, "result": result, "error": None})
        except Exception as e:
            results.append({"image": img, "result": None, "error": str(e)})
        # 避免触发限速
        if i < len(image_paths) - 1:
            time.sleep(0.5)  # Gemini 15 RPM = 4 秒/请求，但这里加小延迟
    return results


# ─── 使用示例 ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # 示例 1：分析网络图片
    result = analyze_image(
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
        "这张图片里有什么？",
        provider="gemini",
    )
    print("图片分析：", result)

    # 示例 2：OCR 本地截图
    # text = ocr_extract("screenshot.png", provider="gemini")
    # print("提取文字：", text)

    # 示例 3：本地隐私分析（Ollama）
    # result = analyze_image("private_doc.png", "总结文档内容", provider="ollama")
    # print("本地分析：", result)
```

## 快速使用

```bash
# 一行命令分析图片
python -c "
from vision_analyze import analyze_image
print(analyze_image('screenshot.png', '这张截图里有什么错误？', 'gemini'))
"
```
