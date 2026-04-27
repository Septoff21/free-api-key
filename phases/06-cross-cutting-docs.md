# Phase 06: Cross-Cutting Docs（横向通用文档）

**前置阅读：** `PHASES.md` + `phases/00-context.md` + `phases/02-providers-json.md`

## 1. Goal

把分散在各 provider 文档里的隐私 / 合规 / 安全 / 故障排查信息汇总成 4 篇横向参考。

## 2. Why Now

`providers.json` 已有数据。横向汇总比每篇 provider 文档单独写更有用 —— 用户对比时一目了然。

## 3. 文件清单（双语，共 8 个文件）

```
docs/zh/90-privacy.md       docs/en/90-privacy.md
docs/zh/91-compliance.md    docs/en/91-compliance.md
docs/zh/92-security.md      docs/en/92-security.md
docs/zh/93-troubleshooting.md  docs/en/93-troubleshooting.md
```

## 4. 各文档大纲

### 4.0 隐私研究方法论（先读）

写 `90-privacy.md` 前必须按以下方法核实每家的隐私字段，**不能直接照抄 `providers.json`**（那是上次的快照，可能已变）：

**步骤 1: WebFetch 政策页**
fetch `providers.json[provider].privacy.policy_url`。如已 redirect / 改版，先 WebSearch 找当前页。

**步骤 2: 关键词 grep**
在政策文本里查这些关键词及其上下文：

| 关键词（en） | 含义 | 看法 |
|---|---|---|
| `train`, `training`, `improve our models` | 训练用途 | 出现即提示用数据 |
| `retain`, `retention`, `delete after` | 保留时长 | 找具体天数 |
| `log`, `logged`, `record` | 记录 prompt | 看是否区分 free / paid |
| `human review`, `manual inspection` | 人工审查 | 注意"出于安全目的" 实际是是 |
| `opt out`, `unless you opt out` | 可关闭 | 默认开 vs 默认关 |
| `enterprise`, `paid tier`, `subscribers` | 分级差异 | free 通常更宽松（对厂商）|

**步骤 3: 区分语义陷阱**

- ❌ "We don't sell your data" 不等于 "We don't train on it"
- ❌ "Anonymized" 不等于 "Not used"
- ❌ "Aggregated" 通常是用了
- ✅ 明确说 "We do not use your inputs to train..." 才是 No
- ✅ 明确说 "By default we use... unless you opt out" 才是 Opt-out

**步骤 4: 多源交叉**

政策页常含糊。补充查：
- 该 provider 的 ToS（不只是 Privacy Policy）
- 官方 FAQ
- 官方 blog 中关于隐私的 announcement
- 仅作辅助，不作单一来源

**步骤 5: 留证据**

每家在 `data/evidence/<provider>/privacy.YYYY-MM-DD.md` 中粘贴**逐字原文段落**（不要意译）。文档表格里的结论必须能从这段原文推出。

---

### 4.1 `90-privacy.md` —— 隐私 / 数据训练矩阵 ⭐

**这是项目最大差异化。认真做。**

结构：

```markdown
# 隐私 / 数据训练矩阵

> 免费 ≠ 无成本。很多免费供应商会用你的 prompt 训模型。这一页帮你做选择。
> Last Verified: 2026-04-27

## 速查表

| Provider | 训练数据 | 记录 prompt | 保留时长 | 人工审查 | 政策 |
|---|---|---|---|---|---|
| OpenRouter | Opt-out | 是 | 30天 | 否 | [link]() |
| Gemini Free | **是** | 是 | - | 是（人评） | [link]() |
| Gemini Paid | 否 | 30天 | - | 否 | - |
| Groq | 否 | 是 | 30天 | 否 | - |
| Cerebras | 否 | - | - | - | - |
| GitHub Models | 否 (per ToS) | 是 | - | - | - |
| Mistral La Plateforme | Opt-out | - | - | - | - |
| Cloudflare WAI | 否 | 否 | - | - | - |
| Ollama | **否（本地）** | 否 | - | 否 | - |

## 怎么读这张表

- **训练数据 = 是** → 你写的所有内容都可能被拿去训下一代模型。**不要发任何敏感内容**。
- **训练数据 = Opt-out** → 默认会用，你需要主动去设置里关。
- **训练数据 = 否** → 受 ToS 保护不会用，但仍会保留一段时间用于反 abuse。
- **本地（Ollama）** → 数据从不离开你的机器。

## 关训练的具体步骤

### Gemini
1. 用 paid tier（哪怕 $0 余额，绑卡即生效）
2. 或：明确接受免费层会被训
3. AI Studio 的设置里没有"关训练"开关 —— 免费就是用数据换额度

### OpenRouter
- Settings → Privacy → "Disable model providers training on your data"
- ⚠️ 这只关 OpenRouter 自己的；底层模型方（如某 free 模型背后的 host）独立政策

### Mistral
- Console → Settings → Data Processing → opt-out 选项

## 涉密 / 商用建议

- **涉密** → 只用 Ollama 本地
- **客户数据** → Cloudflare WAI 或 Mistral 付费层
- **代码片段（非核心）** → OpenRouter 关训练 OK
- **闲聊 / 学习** → 任意

## Sources
- 各 provider 隐私政策（见 providers.json）
```

### 4.2 `91-compliance.md` —— 合规 / 滥用边界

要明确写 —— 不要回避。

```markdown
# 合规边界 / 怎样用不会被封

## 总原则
- 看 ToS：每家供应商的 ToS 是真相源
- 不做大批量、不做 abuse 模式
- 多账号 / 多 key 的合规度因家而异（见下）

## 分家说明

### OpenAI
- ❌ 多账号绕额度 → 明确禁止
- ❌ 共享 key → 明确禁止

### OpenRouter
- ❌ 多账号绕 50/day → 灰色，反 abuse 严
- ✅ 单账号绑卡升 1000/day → 推荐

### Google Gemini
- ✅ **多 GCP project 是合规的** —— 每个 project 独立配额
- 一个 Google 账号下能开多 project，每 project 一份 1500/day
- 这是 Google 文档明确支持的设计

### Groq / Cerebras / Mistral
- ToS 没明确禁多账号，但反 abuse 系统会盯异常 IP / device fingerprint
- 一台电脑开 10 账号 → 高概率被识别

### GitHub Models
- 一个 GitHub 账号一份配额，多账号违 GitHub 主 ToS（创建多账号本身违规）

## 容易被封的行为
- 24/7 持续打满限速
- 明显爬虫式调用（短时间 100+ 请求）
- key 公开在 GitHub / 任何 git history
- 用 free key 跑商用产品（小心！）

## 安全降级
- 用 LiteLLM 等 router 多供应商负载分散
- 详见 [docs/zh/30-recipes/max-free-quota.md](30-recipes/max-free-quota.md)（phase 08）
```

### 4.3 `92-security.md` —— 安全基线

```markdown
# 安全基线 —— 别让 key 泄漏

## 最常见的灾难
GitHub 自动扫描 commit history 里的 key 模式。**一旦推上去**，5 分钟内就有人在用你的额度。

## .gitignore
项目根放好：
```
.env
.env.*
!.env.example
```

## 已经推上去了怎么办
1. **立刻去 provider 控制台 revoke 那个 key**（不要先删 commit！）
2. 然后用 `git filter-repo` 或 BFG 清 history
3. force push（团队仓库需协调）

## key 来源
- 永远从环境变量读，不写代码里
- 不要塞 frontend（任何前端代码都是公开的）
- 不要塞 client app（移动端 / 桌面端用户能反编译）

## 轮换
- 每 90 天换一次 key（多数 provider 控制台一键 rotate）
- 离职 / 转手项目 → 立刻 rotate

## 检测泄漏
推荐 git pre-commit hook（gitleaks / detect-secrets）
```

### 4.4 `93-troubleshooting.md` —— 故障排查

```markdown
# 故障排查

## 401 Unauthorized
- key 错或回收
- header 拼错（应是 `Authorization: Bearer xxx`，不是 `Bearer: xxx`）
- Cloudflare 漏了 account_id
- GitHub Models PAT scope 错（要 `models:read`）

## 403 Forbidden
- key 对，但额度耗尽 / 账户冻结 / 区域受限
- Gemini 在 EU 某些区域（如英国）受限

## 429 Too Many Requests
- 触限速。看 `x-ratelimit-reset` 头等多久
- 多账号轮询前先看 `91-compliance.md`

## 网络
- 中国大陆访问 Gemini / Groq 通常要代理
- Node 脚本 `HTTPS_PROXY=http://127.0.0.1:7890`
- curl `--proxy http://127.0.0.1:7890`

## SSL 错误
- 多半是公司 / 学校代理插了证书
- Node：`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`
- 不要用 `NODE_TLS_REJECT_UNAUTHORIZED=0`

## 模型找不到
- :free 后缀漏写
- 模型已下线（看 provider 公告）

## 流式响应卡住
- 客户端没处理 SSE
- 看 OpenAI SDK 文档的 `stream=True`
```

## 5. Acceptance Criteria

- [ ] 4 篇中文 + 4 篇英文 = 8 个文件已创建
- [ ] 隐私表与 `providers.json` 数据完全一致
- [ ] 合规章节针对 8 家 provider 每家都有说法
- [ ] 安全章节包含 `.gitignore` / 泄漏处理 / 轮换 三件套
- [ ] 故障章节覆盖 401/403/429/网络/SSL/模型 五大类
- [ ] 每篇头部 `Last Verified`
- [ ] README.md / README.en.md 更新链接到这 4 篇
- [ ] CHANGELOG 更新

## 6. Out of Scope

- ❌ 客户端故障（phase 07 各客户端文档自带）
- ❌ Recipes（phase 08）
- ❌ 进阶 abuse 抗性技术（不做）

## 7. Estimated Effort

约 3-4 小时（隐私表是核心，要细做；其余三篇较直接）。
