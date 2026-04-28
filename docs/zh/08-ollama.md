# Ollama（本地）

> **类型：** 本地运行（Local）
> **OpenAI 兼容：** ✅（`/v1/` 端点）
> **Last Verified:** 2026-04-27 ([sources](#sources))

[English](../en/08-ollama.md)

## 一句话

Ollama 是在本地电脑上运行开源大模型的工具，**零 API Key、零限速、零费用、零隐私风险**。模型下载后完全离线推理，数据永远不离开你的机器。代价是需要一台足够好的电脑（建议 8GB+ RAM，有 GPU 更佳）。

## 适合谁

- ✅ 对隐私要求极高（医疗、法律、商业机密等敏感数据）
- ✅ 需要无限调用，不在乎 RPM/RPD 的场景
- ✅ 网络环境恶劣或无法访问外部 API（内网环境）
- ✅ 想在本地运行 agent、代码补全工具（hermes3、qwen2.5-coder）
- ❌ 电脑配置较低（<8GB RAM），模型速度会很慢
- ❌ 需要最新、最强的闭源模型（GPT-4o、Claude 等只能通过 API 访问）

## 怎么安装

### macOS / Linux

```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 启动服务（默认在后台运行）
ollama serve
```

### Windows

1. 访问 [https://ollama.com/download](https://ollama.com/download)，下载 Windows 安装包
2. 安装后 Ollama 自动在后台运行（系统托盘图标）

### 下载模型

```bash
# 通用对话（推荐入门）
ollama pull qwen2.5:7b

# 代码补全
ollama pull qwen2.5-coder:7b

# 图片分析（视觉）
ollama pull llava:13b

# Agent 工具调用
ollama pull hermes3:8b

# 推理模型
ollama pull deepseek-r1:8b
```

> 💡 国内下载 Ollama 模型可能较慢，建议使用加速工具或在有良好网络的环境下拉取。下载完成后即可完全离线使用。

## 怎么用

### 命令行（直接对话）

```bash
ollama run qwen2.5:7b "你好，介绍一下你自己"
```

### 命令行（curl，OpenAI 兼容格式）

```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:7b",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Python（OpenAI SDK，无需修改代码）

```python
from openai import OpenAI

# 注意：本地无需 API Key
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # 任意字符串均可
)
resp = client.chat.completions.create(
    model="qwen2.5:7b",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",  // 任意字符串
});
```

### 工具调用（hermes3 推荐）

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)

tools = [{
    "type": "function",
    "function": {
        "name": "search_web",
        "description": "搜索网络信息",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
}]

resp = client.chat.completions.create(
    model="hermes3:8b",
    messages=[{"role": "user", "content": "搜索最新的 AI 新闻"}],
    tools=tools,
)
print(resp.choices[0].message.tool_calls)
```

### 视觉分析（llava 图片输入）

```python
import base64
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
with open("image.jpg", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="llava:13b",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}},
            {"type": "text", "text": "图片里有什么？"},
        ],
    }],
)
print(resp.choices[0].message.content)
```

## 推荐模型

| 模型 | 大小 | 场景 | 最低 RAM |
|---|---:|---|---:|
| `qwen2.5:7b` | ~4 GB | 通用对话、工具调用 | 8 GB |
| `qwen2.5-coder:7b` | ~4 GB | 代码补全、生成 | 8 GB |
| `hermes3:8b` | ~5 GB | Agent、工具调用 | 8 GB |
| `llava:13b` | ~8 GB | 图片分析（视觉） | 16 GB |
| `deepseek-r1:8b` | ~5 GB | 推理、数学 | 8 GB |
| `llama3.3:70b` | ~40 GB | 高质量对话 | 48 GB |
| `qwen2.5-coder:32b` | ~20 GB | 顶级代码能力 | 32 GB |

> 完整模型库：[https://ollama.com/library](https://ollama.com/library)

## 限速

- **无限速** — 完全受本地硬件限制
- CPU 推理：7B 模型约 10-30 tok/s
- GPU 推理（NVIDIA/Apple Silicon）：7B 模型约 50-150 tok/s
- 可通过 `OLLAMA_NUM_CTX` 环境变量调整上下文窗口大小

## 隐私 ⚠️

| 项 | 答案 |
|---|---|
| 是否用你的数据训模型？ | **No（不可能，本地离线）** |
| 是否记录 prompts？ | **No** |
| 保留时长 | **0 天（不存储）** |
| 人工审查 | **No** |
| 政策链接 | [https://ollama.com/privacy](https://ollama.com/privacy) |

> **隐私金标准**：100% 本地运行，推理期间零网络请求，数据永不离开本机。如需禁用启动时遥测，设置 `OLLAMA_NO_ANALYTICS=1`。

## 常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| `Connection refused` | Ollama 服务未启动 | 运行 `ollama serve` 或检查系统托盘 |
| `model not found` | 模型未下载 | 运行 `ollama pull <model>` |
| 生成速度极慢 | 纯 CPU 运行，模型过大 | 换小一号模型，或启用 GPU |
| 上下文截断 | 默认 num_ctx=2048 | 设置 `OLLAMA_NUM_CTX=8192` 或在 Modelfile 中配置 |
| 内存不足崩溃 | 模型超出 RAM | 换更小的模型（7B→3B）或增加 swap |

## 接到客户端

- [opencode](../../docs/zh/clients/opencode.md)（本地 provider 配置）
- [Cursor](../../docs/zh/clients/cursor.md)（Ollama 提供商）
- [Cline](../../docs/zh/clients/cline.md)（自定义 OpenAI 兼容端点）
- [Continue](../../docs/zh/clients/continue.md)（原生 Ollama 支持）
- [Open WebUI](../../docs/zh/clients/openwebui.md)（最佳 Ollama 图形界面）

## 心得

1. **hermes3 是 Agent 最佳本地选择** — 专门针对工具调用微调，opencode / 各类 Agent 框架接入效果明显优于普通 Llama。
2. **qwen2.5-coder 超出预期** — 代码能力追平甚至超过部分云端模型，7B 版本仅需 8GB RAM，性价比极高。
3. **上下文窗口要手动调大** — 默认 `num_ctx=2048` 远不够，建议设置 `OLLAMA_NUM_CTX=8192`（至少），代码任务建议 32768。
4. **GPU 加速收益显著** — 有 NVIDIA GPU 或 Apple Silicon Mac 的用户体验差距巨大，强烈建议开启 GPU 推理。
5. **作为其他提供商的离线备份** — 在 Agent 代码里加本地 Ollama 作为 fallback，云端 API 配额耗尽时无缝切换。

## Sources

- [https://ollama.com](https://ollama.com) (fetched 2026-04-27)
- [https://github.com/ollama/ollama](https://github.com/ollama/ollama) (fetched 2026-04-27)
- [https://ollama.com/library](https://ollama.com/library) (fetched 2026-04-27)
- [https://ollama.com/privacy](https://ollama.com/privacy) (fetched 2026-04-27)
