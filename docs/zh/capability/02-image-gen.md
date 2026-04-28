# 图片生成（Image Generation）矩阵

> **Last Verified:** 2026-04-27

[English](../../en/capability/02-image-gen.md) | [← 返回索引](00-index.md)

## 免费图片生成模型

**目前仅 Cloudflare Workers AI 在免费层提供图片生成功能。**

| 提供商 | 模型 | 分辨率 | 每天约可生成 | 格式 | 备注 |
|---|---|---|---:|---|---|
| **Cloudflare** | `@cf/black-forest-labs/flux-1-schnell` | 512-1024px | **~25 张** | PNG | FLUX.1 Schnell，速度快 |
| **Cloudflare** | `@cf/stabilityai/stable-diffusion-xl-base-1.0` | 1024×1024 | ~25 张 | PNG | SDXL，经典模型 |
| **Ollama** | `llama3.2-vision` + 外部 SD | 任意 | 无限 | 任意 | 需本地部署 ComfyUI/A1111 |

> 注：Gemini `gemini-2.0-flash-exp` 实验性支持图片输出，但通过 OpenAI 兼容端点访问时不稳定，暂不列入推荐。

## Cloudflare FLUX.1 Schnell 使用示例

```python
import os, requests
from PIL import Image
from io import BytesIO

ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
API_TOKEN  = os.environ["CLOUDFLARE_API_TOKEN"]

def generate_image(prompt: str, steps: int = 4, output_path: str = "output.png") -> str:
    """
    使用 Cloudflare FLUX.1 Schnell 生成图片
    steps: 1-8（快速模型，4步已有不错效果）
    """
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell"
    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {API_TOKEN}"},
        json={"prompt": prompt, "num_steps": steps},
        timeout=60,
    )
    resp.raise_for_status()
    image = Image.open(BytesIO(resp.content))
    image.save(output_path)
    return output_path

# 示例
path = generate_image(
    "一只橙色猫咪坐在窗边，阳光照射，油画风格，细节丰富",
    steps=4,
)
print(f"图片已保存：{path}")
```

## 批量生成示例

```python
import os, requests, time
from pathlib import Path
from PIL import Image
from io import BytesIO

ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
API_TOKEN  = os.environ["CLOUDFLARE_API_TOKEN"]
CF_URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell"

prompts = [
    "赛博朋克城市夜景，霓虹灯，雨天",
    "水彩风格，樱花树下的木屋",
    "极简主义，白色背景，几何图形",
]

output_dir = Path("generated_images")
output_dir.mkdir(exist_ok=True)

for i, prompt in enumerate(prompts):
    resp = requests.post(
        CF_URL,
        headers={"Authorization": f"Bearer {API_TOKEN}"},
        json={"prompt": prompt, "num_steps": 4},
        timeout=60,
    )
    if resp.ok:
        img = Image.open(BytesIO(resp.content))
        img.save(output_dir / f"image_{i+1}.png")
        print(f"✓ {i+1}/{len(prompts)}: {prompt[:30]}...")
    else:
        print(f"✗ {i+1}: HTTP {resp.status_code}")

    # 避免触发限速
    if i < len(prompts) - 1:
        time.sleep(2)
```

## 提示词技巧

### 高质量提示词结构

```
[主体描述], [风格], [光线/氛围], [构图], [细节修饰词]
```

**示例（中文）：**
- `"一个小女孩在雨中奔跑，吉卜力动画风格，温暖黄色调，侧面构图，细腻笔触"`
- `"未来城市概念图，低角度仰拍，蓝紫光源，科幻感，8K 细节"`
- `"传统水墨画，竹林，留白构图，静谧禅意"`

**示例（英文效果通常更稳定）：**
- `"anime girl in rain, Studio Ghibli style, warm lighting, side view, detailed"`
- `"futuristic cityscape, low angle shot, neon blue purple lights, 8K details"`

### 负向提示词（SDXL 支持，FLUX 不支持）

```python
# 仅 SDXL 模型支持 negative_prompt
resp = requests.post(
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0",
    headers={"Authorization": f"Bearer {API_TOKEN}"},
    json={
        "prompt": "一只猫咪，专业摄影，高清",
        "negative_prompt": "模糊, 变形, 低质量, 水印",
        "num_steps": 20,
        "guidance": 7.5,
        "width": 1024,
        "height": 1024,
    },
)
```

## 配额规划

每天 10,000 neurons，FLUX.1 Schnell 约 400 neurons/张：

| 图片数量 | 消耗 neurons | 剩余（用于文字） |
|---:|---:|---:|
| 5 张 | 2,000 | 8,000（约 400 次文字请求） |
| 10 张 | 4,000 | 6,000 |
| 25 张（约上限） | 10,000 | 0 |

**建议：** 先用文字生成需求，再用剩余 neurons 生图，避免图片消耗完当天配额。

## 选择建议

| 需求 | 推荐 |
|---|---|
| 免费云端图片生成 | Cloudflare FLUX.1 Schnell（唯一选择） |
| 无限本地图片生成 | Stable Diffusion（ComfyUI / A1111，需本地部署） |
| 高质量（付费可接受） | DALL-E 3、Midjourney、Ideogram |
| 快速验证提示词 | Cloudflare FLUX（4步快速预览） |
