> Mirror of [docs/zh/recipes/02-vision-analyze.md](../../zh/recipes/02-vision-analyze.md) (Chinese, canonical). If they drift, zh wins.

# Recipe: Vision Analysis (Image / Screenshot Understanding)

> **Difficulty:** Beginner · **Est. time:** 10 min · **Last Verified:** 2026-04-27

## Scenario

Send images to an LLM for analysis: screenshot understanding, OCR text extraction, chart interpretation, product image analysis, etc.

## Recommended Models

| Need | Model | Reason |
|---|---|---|
| High-frequency (1500 RPD) | Gemini `gemini-2.0-flash` | Highest RPD vision model |
| Best quality | Gemini `gemini-2.5-pro` | Reasoning + vision, 100 RPD |
| No Google account | GitHub `openai/gpt-4o` | GPT-4o vision, 50 RPD |
| Local privacy | Ollama `llava:13b` | Fully offline |

## Core Code

```python
"""
vision_analyze.py — Universal image analysis

Supports URL images and local files, auto-selects best encoding
"""

import os, base64
from pathlib import Path
from openai import OpenAI

def create_client(provider: str = "gemini") -> tuple[OpenAI, str]:
    """Return (client, model) based on provider"""
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
    image: str,           # file path or URL
    question: str,
    provider: str = "gemini",
    detail: str = "auto", # "low" / "high" / "auto"
) -> str:
    client, model = create_client(provider)

    # Build image content
    if image.startswith("http://") or image.startswith("https://"):
        # URL image
        image_content = {"type": "image_url", "image_url": {"url": image, "detail": detail}}
    else:
        # Local file → base64
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


# ─── Preset Tasks ──────────────────────────────────────────────────────────────

def ocr_extract(image: str, provider: str = "gemini") -> str:
    """Extract all text from an image (OCR)"""
    return analyze_image(
        image,
        "Extract all text from this image, preserving original formatting. If there's a table, output it in Markdown table format.",
        provider,
    )

def describe_chart(image: str, provider: str = "gemini") -> str:
    """Analyze a chart / data visualization"""
    return analyze_image(
        image,
        "This is a chart. Please: 1) describe the chart type and topic, 2) list key data points, 3) summarize the main trends or conclusions.",
        provider,
    )

def analyze_screenshot(image: str, provider: str = "gemini") -> str:
    """Analyze a UI screenshot"""
    return analyze_image(
        image,
        "This is a software/webpage screenshot. Please describe: 1) the main functional areas of the interface, 2) the currently displayed content, 3) any visible UI issues or error messages.",
        provider,
    )

def check_code_screenshot(image: str, provider: str = "gemini") -> str:
    """Extract and analyze code from a code screenshot"""
    return analyze_image(
        image,
        "This is a code screenshot. Please: 1) extract all code, 2) analyze what the code does, 3) identify any potential issues. Output the extracted code in a Markdown code block.",
        provider,
    )


# ─── Batch Processing ──────────────────────────────────────────────────────────

def batch_analyze(image_paths: list[str], question: str, provider: str = "gemini") -> list[dict]:
    """Analyze multiple images in batch"""
    import time
    results = []
    for i, img in enumerate(image_paths):
        print(f"Processing {i+1}/{len(image_paths)}: {img}")
        try:
            result = analyze_image(img, question, provider)
            results.append({"image": img, "result": result, "error": None})
        except Exception as e:
            results.append({"image": img, "result": None, "error": str(e)})
        if i < len(image_paths) - 1:
            time.sleep(0.5)
    return results


# ─── Usage Examples ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Example 1: Analyze a web image
    result = analyze_image(
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
        "What's in this image?",
        provider="gemini",
    )
    print("Image analysis:", result)

    # Example 2: OCR local screenshot
    # text = ocr_extract("screenshot.png", provider="gemini")
    # print("Extracted text:", text)

    # Example 3: Local private analysis (Ollama)
    # result = analyze_image("private_doc.png", "Summarize this document", provider="ollama")
    # print("Local analysis:", result)
```

## Quick One-liner

```bash
python -c "
from vision_analyze import analyze_image
print(analyze_image('screenshot.png', 'What errors are visible in this screenshot?', 'gemini'))
"
```
