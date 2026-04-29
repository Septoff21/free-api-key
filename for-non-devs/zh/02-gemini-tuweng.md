# Gemini 注册图文教程

> **适合：** 有谷歌账号、想最快用上 AI 的用户
> **难度：** ⭐ 最简单（约 3 分钟）
> **需要：** Google 账号 + 浏览器

返回：[← 从零开始](00-从零开始.md)

---

## Gemini 是什么？

Gemini 是谷歌开发的 AI 模型，`gemini-2.0-flash` 是目前免费层里综合性能最好的选项之一。

**免费配额：** 每分钟 15 次请求，每天 1500 次  
**⚠️ 隐私提示：** 免费层的对话内容可能被谷歌用于改进模型。如需隐私保护，请用 OpenRouter 或 Ollama。

---

## 第一步：进入 Google AI Studio

1. 打开浏览器，访问 [https://aistudio.google.com](https://aistudio.google.com)
2. 用你的 **Google 账号** 登录（如果弹出登录窗口，选择你的 Google 账户）

[截图占位 - gemini-01-aistudio.png：Google AI Studio 登录/首页]

> 💡 **提示：** 如果你在中国大陆，`aistudio.google.com` 可能需要代理才能访问。如果访问不了，改用 [OpenRouter 教程](01-openrouter图文.md)。

---

## 第二步：获取 API Key

1. 登录后，找到左侧菜单或顶部导航，点击 **"Get API key"（获取 API Key）**

[截图占位 - gemini-02-get-apikey-button.png：AI Studio 首页，箭头指向 Get API key]

2. 点击 **"Create API key"（创建 API Key）**
3. 如果问你选哪个项目，选 **"Create API key in new project"（在新项目中创建）**

[截图占位 - gemini-03-create-key.png：创建 API Key 对话框]

4. 页面显示一串以 `AIzaSy` 开头的 Key

[截图占位 - gemini-04-key-shown.png：API Key 显示页面，打码示例，箭头指向复制按钮]

5. 点击复制按钮，把 Key 粘贴到记事本临时保存

> ⚠️ Key 格式示例：`AIzaSyABCDEF1234567890xxxxxxxxxxxxxxx`

---

## 第三步：确认免费模型

免费使用（无需付费）的模型：

| 模型 | 每分钟限制 | 每天限制 | 特点 |
|---|:-:|:-:|---|
| `gemini-2.0-flash` | 15 次 | 1,500 次 | 快速，综合强，**推荐** |
| `gemini-2.5-flash` | 10 次 | 250 次 | 推理更强，但配额少 |
| `gemini-1.5-flash` | 15 次 | 1,500 次 | 旧版，稳定 |

**新手推荐：`gemini-2.0-flash`**

---

## 第四步：填入 Chatbox（回到主教程）

你现在有了：
- ✅ Gemini API Key（`AIzaSy...`）
- ✅ 推荐模型：`gemini-2.0-flash`

回到主教程 → [第四步：把 API Key 填进 Chatbox](00-从零开始.md#第四步把-api-key-填进-chatbox)

---

## 隐私说明

使用 Gemini 免费 API 前请了解：

> Google AI Studio 的免费 API 使用条款允许谷歌将您的输入和输出用于改进其产品和服务，包括用于 AI 模型训练。
>
> — [Google AI Studio 服务条款](https://ai.google.dev/terms)

**简单来说：** 你的聊天内容谷歌可能会看到，并用于训练模型。

**如果你在处理：** 私人信息、公司机密、医疗数据 → 请换用不训练数据的提供商（OpenRouter / Groq / Ollama）。

---

## 常见问题

**Q: 提示 "API key not valid"（API Key 无效）？**
Key 可能没复制完整。回到 AI Studio 重新复制一遍，注意不要带多余空格。

**Q: 每天 1500 次够用吗？**
日常聊天完全够。如果做批量任务或大量问答，可能不够，建议搭配 Groq（也有 1400+ 次/天免费）。

**Q: 中国大陆访问 aistudio.google.com 很慢？**
是的，谷歌服务在大陆需要代理。API 本身（`generativelanguage.googleapis.com`）在部分地区可以直连，但 AI Studio 网站可能需要代理。

**Q: Chatbox 里选 "Google Gemini" 还是 "OpenAI API"？**
选 **Google Gemini**（Chatbox 内置支持），直接填 Key 即可，不需要手动填 Base URL。
