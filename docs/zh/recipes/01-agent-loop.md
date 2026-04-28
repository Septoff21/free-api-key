# Recipe：Agent 循环（Tool Use Loop）

> **难度：** 中级 · **预计时间：** 20 分钟 · **Last Verified:** 2026-04-27

[English](../../en/recipes/01-agent-loop.md)

## 场景

构建一个能够自主使用工具完成任务的 Agent：调用工具、处理结果、决定下一步、循环直到任务完成。

## 推荐模型

| 需求 | 模型 | 理由 |
|---|---|---|
| 高频免费 | Groq `llama-3.1-8b-instant` | 14.4K RPD，极速 |
| 高质量 | Cerebras `llama3.3-70b` | 14.4K RPD，WSE 快速 |
| 本地隐私 | Ollama `hermes3:8b` | 无限，tool-use 专训 |
| 多模态 Agent | Gemini `gemini-2.5-flash` | 视觉+工具+推理 |

## 完整代码

```python
"""
agent_loop.py — 简单 ReAct Agent 循环

依赖：pip install openai
运行：python agent_loop.py
"""

import os, json
from openai import OpenAI

# ─── 配置 ──────────────────────────────────────────────────────────────────────
# 切换不同提供商只需改这两行
CLIENT = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ["GROQ_API_KEY"],
)
MODEL = "llama-3.1-8b-instant"

# ─── 工具定义 ──────────────────────────────────────────────────────────────────
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "搜索互联网获取最新信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "搜索关键词"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "执行数学计算，返回结果",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "Python 数学表达式，如 '2 ** 10'"},
                },
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "获取当前时间",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
]

# ─── 工具实现 ──────────────────────────────────────────────────────────────────
def search_web(query: str) -> str:
    """模拟搜索（真实使用时接入 Tavily / SerpAPI 等）"""
    return f"搜索结果：关于 '{query}' 的信息：这是模拟的搜索结果，实际部署时替换为真实 API。"

def calculate(expression: str) -> str:
    try:
        result = eval(expression, {"__builtins__": {}}, {})
        return str(result)
    except Exception as e:
        return f"计算错误：{e}"

def get_current_time() -> str:
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

TOOL_IMPL = {
    "search_web": lambda args: search_web(**args),
    "calculate": lambda args: calculate(**args),
    "get_current_time": lambda args: get_current_time(),
}

# ─── Agent 主循环 ──────────────────────────────────────────────────────────────
def run_agent(task: str, max_steps: int = 10) -> str:
    """
    ReAct Agent 循环：
    1. LLM 决定是否调用工具
    2. 如果调用工具，执行并将结果返回给 LLM
    3. 循环，直到 LLM 返回最终答案（不再调用工具）
    """
    messages = [
        {
            "role": "system",
            "content": "你是一个智能助手，可以使用工具来完成任务。请逐步思考，合理使用工具。",
        },
        {"role": "user", "content": task},
    ]

    for step in range(max_steps):
        print(f"\n── Step {step + 1} ──")

        resp = CLIENT.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )

        msg = resp.choices[0].message
        finish_reason = resp.choices[0].finish_reason

        # 添加 assistant 消息到历史
        messages.append(msg.model_dump(exclude_unset=True))

        if finish_reason == "stop":
            # LLM 给出最终答案
            print(f"✓ 最终答案：{msg.content}")
            return msg.content

        if finish_reason == "tool_calls" and msg.tool_calls:
            # 执行所有工具调用
            for tc in msg.tool_calls:
                fn_name = tc.function.name
                fn_args = json.loads(tc.function.arguments)
                print(f"  🔧 调用工具：{fn_name}({fn_args})")

                if fn_name in TOOL_IMPL:
                    result = TOOL_IMPL[fn_name](fn_args)
                else:
                    result = f"未知工具：{fn_name}"

                print(f"  📤 工具结果：{result}")

                # 将工具结果加入消息历史
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result,
                })

    return "Agent 达到最大步数限制，未能完成任务。"


# ─── 运行示例 ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 50)
    print("任务：计算 2 的 10 次方，然后搜索这个数的意义")
    print("=" * 50)
    result = run_agent("计算 2 的 10 次方是多少？然后告诉我现在几点。")
    print(f"\n最终结果：{result}")
```

## 切换到本地 Ollama hermes3

```python
# 只改这两行，其余代码不变
CLIENT = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)
MODEL = "hermes3:8b"
```

## 切换到 Gemini（多模态 Agent）

```python
CLIENT = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai",
    api_key=os.environ["GEMINI_API_KEY"],
)
MODEL = "gemini-2.5-flash"
```

## 注意事项

1. **工具调用必须等待结果** — 不要并发发多个请求，Agent 循环本质是顺序的
2. **设置 `max_steps` 防止死循环** — LLM 有时会陷入无限工具调用循环
3. **工具错误要优雅处理** — 将错误信息返回给 LLM，让它决定如何继续
4. **消息历史会变长** — 长任务要考虑截断历史或使用摘要压缩
