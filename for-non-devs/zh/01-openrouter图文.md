# OpenRouter 注册图文教程

> **适合：** 想访问多种免费 AI 模型的用户
> **难度：** ⭐⭐ 简单（约 5 分钟）
> **需要：** 邮箱 + 浏览器

返回：[← 从零开始](00-从零开始.md)

---

## OpenRouter 是什么？

OpenRouter 是一个 AI 模型聚合平台，通过一个账号可以访问数十种 AI 模型（包括 DeepSeek、Llama、Gemma 等），其中很多有**永久免费配额**。

**免费限制（无需充值）：** 每天约 50 次请求，模型有限  
**充值 $10 后：** 每天 1000 次请求，解锁更多免费模型

---

## 第一步：注册账号

1. 打开浏览器，访问 [https://openrouter.ai](https://openrouter.ai)

[截图占位 - openrouter-01-homepage.png：OpenRouter 首页，箭头指向 Sign Up 按钮]

2. 点击右上角 **Sign Up（注册）**
3. 选择注册方式：
   - **Google 账号**（推荐，最快）
   - 邮箱 + 密码

[截图占位 - openrouter-02-signup.png：注册页面，显示 Google 登录选项]

4. 按提示完成注册（如用邮箱注册，去邮箱点击验证链接）

---

## 第二步：创建 API Key

1. 登录后，点击右上角头像 → **Keys**（或直接访问 `openrouter.ai/keys`）

[截图占位 - openrouter-03-keys-menu.png：已登录状态，头像下拉菜单，箭头指向 Keys]

2. 点击 **Create Key（创建 Key）**
3. **Name（名称）** 随便填，例如 `chatbox-key`
4. **Credit limit（消费上限）** 保持默认（留空 = 无上限，但免费账户本来没有额度，不影响）
5. 点击 **Create（创建）**

[截图占位 - openrouter-04-create-key.png：创建 Key 对话框，填写名称]

6. 页面会弹出一串以 `sk-or-v1-` 开头的字符

> ⚠️ **这是唯一一次完整显示**！立刻复制并保存到安全地方。

[截图占位 - openrouter-05-key-revealed.png：Key 显示弹窗，打码后的示例，箭头指向复制按钮]

7. 点击复制图标，把 Key 粘贴到记事本临时保存

---

## 第三步：选择免费模型

OpenRouter 上以 `:free` 结尾的模型是永久免费的，推荐：

| 模型名 | 特点 | 适合场景 |
|---|---|---|
| `deepseek/deepseek-chat:free` | 中文最强，综合最好 | 日常聊天、写作 |
| `meta-llama/llama-3.3-70b-instruct:free` | 英文强，逻辑好 | 英文写作、分析 |
| `google/gemini-2.0-flash-exp:free` | 谷歌模型，速度快 | 快速问答 |

**新手推荐用 `deepseek/deepseek-chat:free`**。

---

## 第四步：填入 Chatbox（回到主教程）

你现在有了：
- ✅ OpenRouter API Key（`sk-or-v1-...`）
- ✅ 推荐模型（`deepseek/deepseek-chat:free`）

回到主教程 → [第四步：把 API Key 填进 Chatbox](00-从零开始.md#第四步把-api-key-填进-chatbox)

---

## 查看用量（以后会用到）

登录 OpenRouter → 右上角头像 → **Activity（活动记录）**

可以看到每次请求使用了哪个模型、消耗了多少。

---

## 常见问题

**Q: 我需要充值吗？**  
不需要。免费账户每天约 50 次请求，日常聊天够用。充值 $10 可以解锁每天 1000 次。

**Q: 模型显示 "Rate limited"（限速）了怎么办？**  
等几分钟。免费模型有每分钟请求数限制，稍等即可恢复。

**Q: 我在中国大陆，网站打不开？**  
OpenRouter 在大陆可能需要代理工具访问。如果打不开，可以先用 Gemini 方案（国内更容易访问）。
