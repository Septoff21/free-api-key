# GitHub Models

> **类型：** 聚合器（Aggregator）
> **OpenAI 兼容：** ✅
> **Last Verified:** 2026-04-27 ([sources](#sources))

[English](../en/05-github-models.md)

## 一句话

GitHub 在 Marketplace 提供的模型试验场，使用 GitHub Personal Access Token（PAT）即可免费访问 GPT-4o、Llama 3.3、DeepSeek-R1、Phi-4 等数十个顶级模型。无需 OpenAI 账号，有 GitHub 账号即可。适合快速原型验证，**不适合生产环境**。

## 适合谁

- ✅ 已有 GitHub 账号，想快速试用 GPT-4o 而不申请 OpenAI 账号
- ✅ 对比评测不同模型（OpenAI / Meta / Mistral / Microsoft / DeepSeek）
- ✅ 低频原型开发、Demo 验证
- ❌ 生产环境（官方标注为"prototyping only"）
- ❌ 高频调用（高级模型仅 50 RPD）
- ❌ 敏感数据（底层提供商政策各异）

## 怎么拿 key

### 方法一：Fine-grained PAT（推荐）

1. 访问 [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. 点击 **Generate new token → Fine-grained token**
3. 在 **Permissions** 里找到 **Models** → 设为 `Read-only`
4. 生成并复制 token
5. 写入 `.env`：`GITHUB_TOKEN=github_pat_...`

### 方法二：经典 PAT（Classic）

1. 访问 [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. 点击 **Generate new token (classic)**
3. 无需特别勾选 scope（默认权限即可访问 Models）
4. 生成并复制 token

> 💡 不需要绑卡。PAT 使用 GitHub 账号权限，无需单独注册。可在 GitHub Marketplace 的 Models 页面直接测试模型。

## 怎么用

### 命令行（curl）

```bash
curl https://models.github.ai/inference/chat/completions \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Python（OpenAI SDK）

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://models.github.ai/inference",
    api_key=os.environ["GITHUB_TOKEN"],
)
resp = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});
```

### 视觉输入（GPT-4o 图片分析）

```python
import os, base64
from openai import OpenAI

client = OpenAI(
    base_url="https://models.github.ai/inference",
    api_key=os.environ["GITHUB_TOKEN"],
)
with open("screenshot.png", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}},
            {"type": "text", "text": "描述这张截图里的内容"},
        ],
    }],
)
```

## 免费模型（部分）

| 模型 | 上下文 | 配额层级 | RPM | RPD | 备注 |
|---|---:|---|---:|---:|---|
| `openai/gpt-4o` | 128 000 | High | 10 | 50 | 顶级多模态，无需 OpenAI 账号 |
| `openai/gpt-4.1-mini` | 128 000 | High | 10 | 50 | 快速版 GPT-4，性价比高 |
| `meta/llama-3.3-70b-instruct` | 128 000 | High | 10 | 50 | 最强开源模型之一 |
| `microsoft/phi-4` | 16 384 | Low | 15 | 150 | 微软 Phi-4，代码/推理强 |
| `deepseek/deepseek-r1` | 65 536 | High | 10 | 50 | 推理模型，思考链 |
| `mistral-ai/mistral-small` | 32 768 | Low | 15 | 150 | 视觉+工具调用 |

> 完整列表：[https://github.com/marketplace/models](https://github.com/marketplace/models)
> 数据来自 `providers.json` (Last Verified: 2026-04-27)

## 限速

- **Low 层（小模型）：15 RPM / 150 RPD**（每请求 8K input / 4K output tokens）
- **High 层（大模型）：10 RPM / 50 RPD**（每请求 8K input / 4K output tokens）
- 无 token 响应头，需自行计数

> 详见 [https://docs.github.com/en/github-models/prototyping-with-ai-models](https://docs.github.com/en/github-models/prototyping-with-ai-models)

## 隐私 ⚠️

| 项 | 答案 |
|---|---|
| 是否用你的数据训模型？ | **No**（GitHub 自身不训练） |
| 是否记录 prompts？ | Unknown |
| 保留时长 | Unknown |
| 人工审查 | No |
| 政策链接 | [https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement) |

> GitHub 自身不用数据训练模型，但底层提供商（OpenAI、Anthropic、Meta 等）适用各自政策。
> ⚠️ 官方明确定位为"原型环境"，**不要用于生产或发送敏感数据**。

## 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| `401 Unauthorized` | PAT 无效或权限不足 | 确认 token 有效，Fine-grained PAT 需要 Models:read |
| `429 Too Many Requests` | 超 RPM/RPD | High 层 50 RPD 很快耗尽，换 Low 层模型 |
| `400 Invalid model` | 模型 ID 缺少 `provider/` 前缀 | 用完整格式如 `openai/gpt-4o` |
| `413 Request too large` | 单次请求超 8K 输入 token | 缩减输入或分批发送 |

## 接到客户端

- [opencode](../../docs/zh/clients/opencode.md)
- [Cursor](../../docs/zh/clients/cursor.md)
- [Cline](../../docs/zh/clients/cline.md)
- [Continue](../../docs/zh/clients/continue.md)
- [Chatbox](../../docs/zh/clients/chatbox.md)

## 心得

1. **"薅 GPT-4o"的最简途径** — 有 GitHub 账号直接用，无需折腾 OpenAI 账号或信用卡，50 RPD 够日常实验。
2. **Low 层模型配额更高** — Phi-4、Mistral-Small 是 150 RPD，做高频测试优先用这些。
3. **4K 输出上限要注意** — 无论模型能力多强，单次最多输出 4K tokens，长文生成需要分段。
4. **模型 ID 必须带提供商前缀** — 格式是 `openai/gpt-4o`，不是 `gpt-4o`，这是新手最常犯的错误。
5. **仅做原型，准备好迁移方案** — 验证可行后，直接迁移到对应模型提供商的正式 API，GitHub Models 不提供 SLA 保证。

## Sources

- [https://docs.github.com/en/github-models/prototyping-with-ai-models](https://docs.github.com/en/github-models/prototyping-with-ai-models) (fetched 2026-04-27)
- [https://docs.github.com/en/github-models/responsible-use-of-github-models](https://docs.github.com/en/github-models/responsible-use-of-github-models) (fetched 2026-04-27)
- [https://github.com/marketplace/models](https://github.com/marketplace/models) (fetched 2026-04-27)
