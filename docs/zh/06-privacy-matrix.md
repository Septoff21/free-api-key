# 隐私与数据安全矩阵

> **Last Verified:** 2026-04-27
> 数据来自 `data/evidence/<provider>/privacy.md`

[English](../en/06-privacy-matrix.md)

## 一分钟读懂

| 提供商 | 训练你的数据？ | 记录 prompts？ | 人工审查？ | 合规框架 | 推荐用途 |
|---|:---:|:---:|:---:|---|---|
| **Gemini (AI Studio)** | ⚠️ **Yes** | Yes | Yes（可能） | — | 非敏感场景 |
| **OpenRouter** | ✅ No | Unknown | No | — | 一般用途 |
| **Groq** | ✅ No | Unknown | No | DPA 可签 | 一般用途 |
| **Cerebras** | ✅ No | Unknown | No | — | 一般用途 |
| **GitHub Models** | ✅ No（GitHub 自身） | Unknown | No | — | 原型验证 |
| **Mistral** | ✅ No（需 opt-in） | Unknown | No | **GDPR** | 隐私优先 |
| **Cloudflare** | ✅ No | Unknown | No | SOC2/GDPR | 企业合规 |
| **Ollama（本地）** | ✅ No（不可能） | **No** | **No** | 完全本地 | 最高隐私 |

> 图例：✅ 已明确不训练 / ⚠️ 训练或存在风险 / Unknown = 官方未明确说明

---

## 详细解读

### 🔴 Gemini（AI Studio）— 唯一训练用户数据的提供商

**最重要的一条：免费层默认训练。**

Google 在 Gemini API 服务条款中明确表示，使用免费 AI Studio API 时：
- Google **可能将你的输入/输出用于改进模型**
- **人工审查员**可能查看你的提示词（prompt）
- 这一行为**默认开启**，无法在免费层关闭

**适用规则：**
- ✅ 可以用于：代码调试（无商业机密）、学习、公开内容处理
- ❌ 不要用于：个人身份信息（PII）、医疗数据、法律材料、商业合同、公司内部文件

**解决方案：**
- 付费升级到 **Vertex AI** — 承诺不使用数据训练模型
- 切换至其他不训练的提供商（Groq、Cerebras、Mistral 等）

---

### 🟡 OpenRouter — 平台不训练，底层提供商各异

OpenRouter 本身不训练。但它是**聚合器**，请求会被路由到底层模型方：

| `:free` 模型 | 底层提供商 | 提供商训练政策 |
|---|---|---|
| `google/gemini-*:free` | Google | ⚠️ 可能训练（见上） |
| `meta-llama/llama-*:free` | Meta / 第三方推理 | 通常不训练 |
| `deepseek/*:free` | DeepSeek / 第三方 | 通常不训练 |
| `mistralai/*:free` | Mistral / 第三方 | 通常不训练 |

**建议：** 敏感任务避免使用带 Google 路由的 `:free` 模型。

---

### 🟡 GitHub Models — GitHub 不训练，底层商业模型方各异

GitHub 自身不训练，但：
- 使用 `openai/gpt-4o` → OpenAI 的政策适用（API 用户一般不训练）
- 使用 `anthropic/claude-*` → Anthropic 的政策适用
- 平台定位为"原型环境"，不提供生产级 SLA 或隐私保证

---

### 🟢 Groq — 不训练，但有独立协议

- GroqCloud API 受 **Groq Cloud Services Agreement** 管辖（≠ 主站消费者隐私政策）
- 明确：**不用 API 数据训练模型**
- 企业用户可签 DPA（数据处理协议）
- 建议：发送生产数据前阅读 GroqCloud 服务条款

---

### 🟢 Cerebras — 不训练，推理即用即弃

- API 数据仅用于即时推理，之后丢弃
- 无人工审查
- 建议中等隐私要求场景

---

### 🟢 Mistral — 最强隐私保证之一

法国公司，受 EU 法律约束：
- **默认不训练**（需要显式 opt-in 同意才会使用数据）
- GDPR 合规，数据主体权利有保障
- 无人工审查
- **欧洲企业合规首选**，也适合对数据驻留有要求的场景

---

### 🟢 Cloudflare Workers AI — 企业级隐私

- 明确：**不使用客户内容训练模型**（Workers AI 文档 + DPA 确认）
- SOC 2 Type II 认证
- GDPR 合规
- 适合对基础设施有信任度要求的团队

---

### 🟢 Ollama（本地）— 绝对隐私

- 完全本地运行，**物理上无法将数据发送到外部**
- 推理过程中零网络请求
- 无遥测（可配置关闭启动遥测）
- **敏感数据唯一推荐方案**

---

## 按场景选择

### 场景 A：我要处理用户个人信息（PII）

→ **Ollama（本地）** 首选；次选 Mistral / Cloudflare（不训练且合规）
→ **绝对不用** Gemini 免费层

### 场景 B：医疗 / 法律 / 金融数据

→ **Ollama（本地）** — 数据不出机器
→ 如必须用云端：Mistral（GDPR）或 Cloudflare（SOC2）

### 场景 C：商业代码 / 专有算法

→ Ollama / Mistral / Groq（有 DPA）
→ 避免 Gemini 免费层

### 场景 D：非敏感学习 / 公开内容

→ 所有提供商均可，Gemini 免费层的高配额在此场景完全合理

### 场景 E：欧盟数据，有 GDPR 合规要求

→ **Mistral**（法国公司，EU 司法管辖）
→ Cloudflare（有 EU DPA）

---

## 最佳实践

### 1. 敏感数据脱敏再发送

```python
import re

def redact_pii(text: str) -> str:
    """简单示例：脱去手机号和邮箱"""
    text = re.sub(r'\b1[3-9]\d{9}\b', '[手机号]', text)
    text = re.sub(r'[\w.+-]+@[\w-]+\.\w+', '[邮箱]', text)
    return text

prompt = redact_pii(user_input)
response = call_api(prompt)
```

### 2. 本地 + 云端混合架构

```
敏感数据  →  Ollama（本地）  →  结果
非敏感数据 →  Groq / Cerebras（云端）→  结果
```

```python
def smart_route(text: str, is_sensitive: bool):
    if is_sensitive:
        return call_ollama(text)   # 本地，零泄漏
    else:
        return call_groq(text)     # 云端，快速
```

### 3. 不要在 prompt 里放 key 或密码

永远不要：
```python
prompt = f"帮我检查这个代码，AWS_SECRET={secret}"  # ❌ 危险！
```

应该：
```python
prompt = "帮我检查这个代码逻辑，密钥变量已替换为占位符"  # ✅
```

### 4. 定期审查 .env 文件权限

```bash
# 检查 .env 文件权限（Linux/macOS）
ls -la .env
# 应该是 -rw------- (600)，如果不是：
chmod 600 .env
```

### 5. 在 CI 中用 secret 注入，不用文件

GitHub Actions：
```yaml
env:
  OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
```

---

## 隐私等级速查

```
高隐私需求（医疗/法律/PII）
  └─ Ollama（本地）────────────────── ⭐⭐⭐⭐⭐ 零风险
  └─ Mistral ──────────────────────── ⭐⭐⭐⭐  GDPR + 不训练
  └─ Cloudflare ───────────────────── ⭐⭐⭐⭐  SOC2 + 不训练

中等隐私需求（商业代码/内部文档）
  └─ Groq ─────────────────────────── ⭐⭐⭐   不训练，有 DPA
  └─ Cerebras ─────────────────────── ⭐⭐⭐   不训练
  └─ GitHub Models ────────────────── ⭐⭐⭐   GitHub 不训练

低隐私需求（公开内容/学习）
  └─ OpenRouter ───────────────────── ⭐⭐    平台不训练，底层各异
  └─ Gemini 免费层 ─────────────────── ⭐     明确训练用户数据 ⚠️
```

---

## Sources

- `data/evidence/*/privacy.md` — 每个提供商独立证据文件
- [https://ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms)
- [https://mistral.ai/privacy/](https://mistral.ai/privacy/)
- [https://developers.cloudflare.com/workers-ai/](https://developers.cloudflare.com/workers-ai/)
- [https://groq.com/privacy-policy/](https://groq.com/privacy-policy/)
