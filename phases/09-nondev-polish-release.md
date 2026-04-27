# Phase 09: Non-Dev Tutorial + Polish + Release v1.0.0

**前置阅读：** `PHASES.md` + 前面所有 phase

## 1. Goal

最后一公里：
1. 给非开发者一份图文版"从零开始"
2. 全仓库一遍 polish（链接 / 一致性 / 漂移）
3. 打 v1.0.0 tag

## 2. Why Now

所有内容已就绪。现在让非开发者也能用，并稳定一个版本。

## 3. 文件清单

```
for-non-devs/zh/
├── 00-从零开始.md          # 总入口
├── 01-openrouter图文.md    # OpenRouter 全程截图
└── 02-gemini图文.md        # Gemini 全程截图
```

英文版**不做**（这部分主要是中文用户痛点；英文社区有大把视频教程）。在 README.en.md 注明：`The non-dev illustrated walkthrough is Chinese-only by design.`

## 4. 非开发者教程风格

- 假设读者只会用浏览器、能下载安装软件
- **每个动作配截图**（实在没法配截图就用 ASCII 框图描述）
- 名词第一次出现要解释（"API key" = "你的密码本"）
- 不用 terminal 命令；推荐图形化客户端（Chatbox）
- 末尾给"我搞砸了怎么办"FAQ

## 4.1 `00-从零开始.md` 大纲

```markdown
# 从零开始 —— 5 步用上免费 LLM

> 本教程不需要任何编程基础。

## 你将得到什么
- 一个能聊天的 AI（像 ChatGPT 但免费）
- 不限次数的代码 / 翻译 / 写作助手

## 你需要准备
- 一台能上网的电脑
- 一个邮箱
- 30 分钟

## 第一步：选一家 provider
看这张表，照着挑一个：

| 我想... | 选 | 难度 |
|---|---|---|
| 最快用上 | Gemini (谷歌) | ⭐ |
| 想用各种模型 | OpenRouter | ⭐⭐ |
| 完全离线 / 不联网 | Ollama | ⭐⭐⭐ |

## 第二步：拿 API key
（详见 [01-openrouter图文.md](01-openrouter图文.md) 或 [02-gemini图文.md](02-gemini图文.md)）

## 第三步：装一个客户端
推荐 Chatbox（中文界面，跨平台）：
- 下载：https://chatboxai.app
- 装好后打开

## 第四步：把 key 填进客户端
（步骤 + 截图）

## 第五步：开聊
（首条消息建议 + 常见问题）

## 我搞砸了怎么办
- 提示 401 → key 抄错了，回去复制一遍
- 提示 429 → 用得太快，等 1 分钟
- 网页打不开 → 可能需要「魔法上网」（本教程不涉及）
- 模型选项是空的 → 客户端版本太老，更新一下

## 进阶
看完本教程后想深入，去看：
- [docs/zh/01-openrouter.md](../../docs/zh/01-openrouter.md)
- [docs/zh/30-recipes/](../../docs/zh/30-recipes/)
```

## 4.2 截图规范

- 截图存放：`for-non-devs/zh/img/<slug>-NN.png`
- 文件名小写英文 + 数字，例 `openrouter-01-signup.png`
- 截图前**遮蔽真实 key**（用马赛克或假数据）
- 浏览器 zoom 100%，分辨率不超 1600px 宽
- markdown 引用：`![描述](img/openrouter-01-signup.png)`

> Agent 执行时如果**没有真实账号 / 没法实拍**，就在 markdown 里留 `[截图占位 - 请用户后补]` 标记，并在完成报告里列出。**不要用 AI 生成假截图**。

## 5. Polish 清单

### 5.1 全仓 grep 检查
- [ ] grep `TODO` —— 应只剩明确的 future work，没有"忘了写"的
- [ ] grep `Last Verified: 2026` —— 所有出现的日期都合理（执行当天附近）
- [ ] grep `your-username` / `YOUR_USERNAME` —— 该改成实际仓库地址或用 placeholder 但全仓一致
- [ ] 找断链：每个 markdown 里的 `](./...)` 路径都能解析到真实文件

### 5.2 数据一致性
- [ ] `providers.json` 的数字 vs 各 provider 文档的数字 一致
- [ ] 各 provider 文档的"最后验证"日期 vs `providers.json.providers[].last_verified` 一致
- [ ] 隐私表（`90-privacy.md`）vs `providers.json.privacy` 一致

### 5.3 双语对齐
- [ ] 每篇中文都有对应英文（除 `for-non-devs/`）
- [ ] 章节数 / 顺序对齐
- [ ] 表格行数对齐

### 5.4 README polish
- [ ] README.md 顶部的"5 分钟上手"现在是真的能 5 分钟（之前 phase 留的 TODO 全填）
- [ ] "收录的供应商"是从 `providers.json` 生成的最新表格
- [ ] 链接全可点

## 6. v1.0.0 Release 流程

1. 更新 `CHANGELOG.md`：
   - 把所有 `[Unreleased]` 内容移到新章节 `## [1.0.0] - YYYY-MM-DD`
   - 在底部添加 `[1.0.0]: ...` 链接
2. `providers.json` 顶部 `version: "1.0.0"`
3. README 状态栏更新为 v1.0.0
4. git tag：
   ```bash
   git add -A
   git commit -m "chore: release v1.0.0"
   git tag -a v1.0.0 -m "Free API Key v1.0.0"
   ```
5. **不要 push 到 remote** —— 让用户决定 push 哪里

## 7. Acceptance Criteria

- [ ] 3 个非开发者教程文件（`00-从零开始.md` + 两篇图文）
- [ ] 截图占位标记清晰（如有未截）
- [ ] 全仓 polish 清单通过
- [ ] CHANGELOG 有 `[1.0.0]` 章节
- [ ] git tag `v1.0.0` 已打（本地）
- [ ] 最终交付清单（给用户）：
  - 文件总数
  - 总字数（中文 + 英文）
  - 测试通过情况（`check-keys.mjs` 在 agent 机器上跑过 1 次的输出）
  - 已知 limitation 列表

## 8. Out of Scope

- ❌ Push 到 GitHub（用户决定）
- ❌ 注册 npm 包发布脚本（用户决定）
- ❌ v1.1.0 的内容
- ❌ 任何视频教程

## 9. 项目交付汇报模板

完成后给用户一份汇报：

```markdown
# Free API Key v1.0.0 —— 交付汇报

## 已完成
- [✓] Phase 01-09 全部完成
- 总文件数：~70
- 总字数：中 ~XX,XXX / 英 ~XX,XXX
- 提供商覆盖：8 家
- 客户端覆盖：7 个
- Recipes：5 篇
- 可执行脚本：check-keys.mjs（实测通过：贴输出片段）

## 已知 limitation
- 非开发者图文教程 N 张截图需用户补
- Gemini 在某些区域不可用（已在文档说明）
- ...

## 建议下一步
1. 用户审阅 → push GitHub
2. v1.1 候选：xxx
3. 维护节奏：每月核对 providers.json 一次
```

## 10. Estimated Effort

约 4-5 小时（其中非开发者教程 ~2 小时、polish ~1.5 小时、release ~30 分钟）。
