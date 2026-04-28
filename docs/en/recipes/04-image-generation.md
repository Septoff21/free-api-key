> Mirror of [docs/zh/recipes/04-image-generation.md](../../zh/recipes/04-image-generation.md) (Chinese, canonical). If they drift, zh wins.

# Recipe: Image Generation (Text-to-Image)

> **Difficulty:** Beginner · **Est. time:** 10 min · **Last Verified:** 2026-04-27

## Scenario

Generate images with free APIs: illustrations, covers, UI concept art, product mockups, etc.

## Only Free Cloud Option: Cloudflare FLUX.1 Schnell

Free tier: approximately **25 images/day** (10,000 neurons, ~400 neurons/image).

## Full Code

```python
"""
image_gen.py — Cloudflare Workers AI Image Generation

Requirements: pip install requests Pillow
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
    steps: int = 4,           # FLUX: 1-8, SDXL: 10-50
    width: int = 1024,
    height: int = 1024,
    negative_prompt: str = "",  # SDXL only
    output_path: str | None = None,
) -> Path:
    """
    Generate an image and save as PNG

    Returns: saved file path
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

    # Save image
    if output_path is None:
        safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in prompt[:30])
        output_path = f"generated_{safe_name}.png"

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    image = Image.open(BytesIO(resp.content))
    image.save(out)

    print(f"✓ Generated: {out}  ({elapsed:.1f}s, {image.size[0]}x{image.size[1]}px)")
    return out


def batch_generate(prompts: list[str], model: str = "flux-schnell", delay: float = 2.0) -> list[Path]:
    """
    Batch generation (auto-delay to avoid rate limiting)
    """
    results = []
    total = len(prompts)
    for i, prompt in enumerate(prompts):
        print(f"\n[{i+1}/{total}] {prompt[:50]}...")
        try:
            path = generate(prompt, model=model, output_path=f"output/image_{i+1:03d}.png")
            results.append(path)
        except requests.HTTPError as e:
            print(f"  ✗ Failed: {e}")
            results.append(None)
        if i < total - 1:
            time.sleep(delay)
    return results


# ─── Prompt Tools ──────────────────────────────────────────────────────────────

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
    """Build a high-quality prompt"""
    preset = STYLE_PRESETS.get(style, style)
    parts = [subject, preset]
    if extra:
        parts.append(extra)
    return ", ".join(parts)


# ─── Usage Examples ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Example 1: Single image
    generate(
        styled_prompt("a cat sitting on a windowsill", "anime", "cherry blossoms outside"),
        model="flux-schnell",
        steps=4,
        output_path="output/cat_anime.png",
    )

    # Example 2: Batch generation (note ~25 images/day limit)
    batch_generate([
        styled_prompt("mountain landscape at sunset", "watercolor"),
        styled_prompt("futuristic robot", "cyberpunk"),
        styled_prompt("cozy coffee shop interior", "photo", "warm lighting, morning"),
    ])

    # Example 3: SDXL (higher resolution, supports negative prompts)
    generate(
        "portrait of a young woman, professional headshot",
        model="sdxl",
        steps=25,
        negative_prompt="blurry, distorted, low quality, extra fingers",
        output_path="output/portrait_sdxl.png",
    )
```

## Quota Monitoring

```python
def estimate_neurons_used(image_count: int, model: str = "flux-schnell") -> dict:
    """Estimate neurons consumed"""
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

# Generated 5 images today, how many left?
stats = estimate_neurons_used(5)
print(f"Remaining neurons: {stats['neurons_remaining']}")
print(f"Available for text requests: ~{stats['text_requests_remaining']}")
```
