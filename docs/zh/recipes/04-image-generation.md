# Recipe：图片生成（Text-to-Image）

> **难度：** 初级 · **预计时间：** 10 分钟 · **Last Verified:** 2026-04-27

[English](../../en/recipes/04-image-generation.md)

## 场景

用免费 API 生成图片：插图、封面、UI 概念图、产品原型图等。

## 唯一免费云端选项：Cloudflare FLUX.1 Schnell

免费层约 **25 张/天**（10,000 neurons，约 400 neurons/张）。

## 完整代码

```python
"""
image_gen.py — Cloudflare Workers AI 图片生成

依赖：pip install requests Pillow
"""

import os, requests, time
from pathlib import Path
from PIL import Image
from io import BytesIO

ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
API_TOKEN  = os.environ["CLOUDFLARE_API_TOKEN"]

MODELS = {
    "flux-schnell": "@cf/black-forest-labs/flux-1-schnell",
    "sdxl":         "@cf/stabilityai/stable-diffusion-xl-base-1.0",
}


def generate(
    prompt: str,
    model: str = "flux-schnell",
    steps: int = 4,           # FLUX: 1-8，SDXL: 10-50
    width: int = 1024,
    height: int = 1024,
    negative_prompt: str = "",  # 仅 SDXL 支持
    output_path: str | None = None,
) -> Path:
    """
    生成图片并保存为 PNG

    返回：保存路径
    """
    model_id = MODELS.get(model, model)
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{model_id}"

    payload = {"prompt": prompt, "num_steps": steps}
    if model == "sdxl":
        payload.update({
            "width": width,
            "height": height,
            "guidance": 7.5,
        })
        if negative_prompt:
            payload["negative_prompt"] = negative_prompt

    t0 = time.time()
    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {API_TOKEN}"},
        json=payload,
        timeout=60,
    )
    elapsed = time.time() - t0
    resp.raise_for_status()

    # 保存图片
    if output_path is None:
        safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in prompt[:30])
        output_path = f"generated_{safe_name}.png"

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    image = Image.open(BytesIO(resp.content))
    image.save(out)

    print(f"✓ 已生成：{out}  ({elapsed:.1f}s, {image.size[0]}x{image.size[1]}px)")
    return out


def batch_generate(prompts: list[str], model: str = "flux-schnell", delay: float = 2.0) -> list[Path]:
    """
    批量生成（自动延时避免限速）
    """
    results = []
    total = len(prompts)
    for i, prompt in enumerate(prompts):
        print(f"\n[{i+1}/{total}] {prompt[:50]}...")
        try:
            path = generate(prompt, model=model, output_path=f"output/image_{i+1:03d}.png")
            results.append(path)
        except requests.HTTPError as e:
            print(f"  ✗ 失败：{e}")
            results.append(None)
        if i < total - 1:
            time.sleep(delay)
    return results


# ─── 提示词工具 ────────────────────────────────────────────────────────────────

STYLE_PRESETS = {
    "anime":       "anime style, detailed, vibrant colors, Studio Ghibli",
    "watercolor":  "watercolor painting, soft edges, delicate colors",
    "oil":         "oil painting, rich textures, classical art",
    "photo":       "photorealistic, 8K, professional photography, sharp focus",
    "pixel":       "pixel art, 16-bit, retro game style",
    "sketch":      "pencil sketch, black and white, hand drawn",
    "minimalist":  "minimalist design, clean lines, simple composition",
    "cyberpunk":   "cyberpunk aesthetic, neon lights, dark atmosphere",
}

def styled_prompt(subject: str, style: str = "photo", extra: str = "") -> str:
    """构建高质量提示词"""
    preset = STYLE_PRESETS.get(style, style)
    parts = [subject, preset]
    if extra:
        parts.append(extra)
    return ", ".join(parts)


# ─── 使用示例 ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # 示例 1：单张生成
    generate(
        styled_prompt("a cat sitting on a windowsill", "anime", "cherry blossoms outside"),
        model="flux-schnell",
        steps=4,
        output_path="output/cat_anime.png",
    )

    # 示例 2：批量生成（注意每天约 25 张上限）
    batch_generate([
        styled_prompt("mountain landscape at sunset", "watercolor"),
        styled_prompt("futuristic robot", "cyberpunk"),
        styled_prompt("cozy coffee shop interior", "photo", "warm lighting, morning"),
    ])

    # 示例 3：SDXL（更高分辨率，支持负向提示词）
    generate(
        "portrait of a young woman, professional headshot",
        model="sdxl",
        steps=25,
        negative_prompt="blurry, distorted, low quality, extra fingers",
        output_path="output/portrait_sdxl.png",
    )
```

## 配额监控

```python
def estimate_neurons_used(image_count: int, model: str = "flux-schnell") -> dict:
    """估算已使用的 neurons"""
    NEURONS_PER_IMAGE = {
        "flux-schnell": 400,
        "sdxl": 450,
    }
    n = NEURONS_PER_IMAGE.get(model, 400)
    used = image_count * n
    remaining = max(0, 10_000 - used)
    return {
        "images_generated": image_count,
        "neurons_used": used,
        "neurons_remaining": remaining,
        "text_requests_remaining": remaining // 30,  # ~30 neurons/1K tokens
    }

# 今天已生成 5 张，还剩多少？
stats = estimate_neurons_used(5)
print(f"剩余 neurons: {stats['neurons_remaining']}")
print(f"可用于文字请求: ~{stats['text_requests_remaining']} 次")
```

## 提示词模板库

```python
TEMPLATES = {
    "产品图":    "{product}，白色背景，专业产品摄影，极简风格，高清",
    "头像":     "{character}，头像，正面，细节丰富，{style}风格",
    "封面":     "{title}主题封面，{genre}风格，引人注目，高清",
    "场景图":   "{scene}，{time}，{weather}，氛围感，{style}",
    "概念图":   "{concept}，未来感，科技感，蓝紫色调，超现实主义",
}

def fill_template(template_key: str, **kwargs) -> str:
    return TEMPLATES[template_key].format(**kwargs)

# 示例
prompt = fill_template("场景图", scene="海边咖啡馆", time="黄昏", weather="微风", style="油画")
print(prompt)
# → 海边咖啡馆，黄昏，微风，氛围感，油画
```
