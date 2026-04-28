> Mirror of [docs/zh/recipes/01-agent-loop.md](../../zh/recipes/01-agent-loop.md) (Chinese, canonical). If they drift, zh wins.

# Recipe: Agent Loop (Tool Use Loop)

> **Difficulty:** Intermediate · **Est. time:** 20 min · **Last Verified:** 2026-04-27

## Scenario

Build an Agent that autonomously uses tools to complete tasks: call tools, process results, decide next steps, loop until task complete.

## Recommended Models

| Need | Model | Reason |
|---|---|---|
| High-frequency free | Groq `llama-3.1-8b-instant` | 14.4K RPD, extremely fast |
| High quality | Cerebras `llama3.3-70b` | 14.4K RPD, WSE fast |
| Local privacy | Ollama `hermes3:8b` | Unlimited, tool-use trained |
| Multimodal Agent | Gemini `gemini-2.5-flash` | Vision + tools + reasoning |

## Full Code

```python
"""
agent_loop.py — Simple ReAct Agent Loop

Requirements: pip install openai
Run: python agent_loop.py
"""

import os, json
from openai import OpenAI

# ─── Config ────────────────────────────────────────────────────────────────────
# Switch providers by changing only these two lines
CLIENT = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ["GROQ_API_KEY"],
)
MODEL = "llama-3.1-8b-instant"

# ─── Tool Definitions ──────────────────────────────────────────────────────────
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the internet for the latest information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search keywords"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "Perform math calculations, return result",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "Python math expression, e.g. '2 ** 10'"},
                },
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Get the current time",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
]

# ─── Tool Implementations ──────────────────────────────────────────────────────
def search_web(query: str) -> str:
    """Simulated search (replace with Tavily / SerpAPI etc. in production)"""
    return f"Search results for '{query}': This is a simulated result. Replace with real API in production."

def calculate(expression: str) -> str:
    try:
        result = eval(expression, {"__builtins__": {}}, {})
        return str(result)
    except Exception as e:
        return f"Calculation error: {e}"

def get_current_time() -> str:
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

TOOL_IMPL = {
    "search_web": lambda args: search_web(**args),
    "calculate": lambda args: calculate(**args),
    "get_current_time": lambda args: get_current_time(),
}

# ─── Agent Main Loop ───────────────────────────────────────────────────────────
def run_agent(task: str, max_steps: int = 10) -> str:
    """
    ReAct Agent loop:
    1. LLM decides whether to call a tool
    2. If tool called, execute and return result to LLM
    3. Loop until LLM returns final answer (no more tool calls)
    """
    messages = [
        {
            "role": "system",
            "content": "You are an intelligent assistant that can use tools to complete tasks. Think step by step and use tools appropriately.",
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

        messages.append(msg.model_dump(exclude_unset=True))

        if finish_reason == "stop":
            print(f"✓ Final answer: {msg.content}")
            return msg.content

        if finish_reason == "tool_calls" and msg.tool_calls:
            for tc in msg.tool_calls:
                fn_name = tc.function.name
                fn_args = json.loads(tc.function.arguments)
                print(f"  🔧 Calling tool: {fn_name}({fn_args})")

                if fn_name in TOOL_IMPL:
                    result = TOOL_IMPL[fn_name](fn_args)
                else:
                    result = f"Unknown tool: {fn_name}"

                print(f"  📤 Tool result: {result}")

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result,
                })

    return "Agent reached max steps limit without completing the task."


# ─── Example Usage ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 50)
    print("Task: Calculate 2 to the power of 10, then get the current time")
    print("=" * 50)
    result = run_agent("What is 2 to the power of 10? Also tell me what time it is now.")
    print(f"\nFinal result: {result}")
```

## Switch to Local Ollama hermes3

```python
# Change only these two lines, rest of code unchanged
CLIENT = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)
MODEL = "hermes3:8b"
```

## Switch to Gemini (Multimodal Agent)

```python
CLIENT = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai",
    api_key=os.environ["GEMINI_API_KEY"],
)
MODEL = "gemini-2.5-flash"
```

## Notes

1. **Tool calls must wait for results** — Don't send concurrent requests; the agent loop is inherently sequential
2. **Set `max_steps` to prevent infinite loops** — LLMs can sometimes enter infinite tool call loops
3. **Handle tool errors gracefully** — Return error messages to the LLM so it can decide how to continue
4. **Message history grows** — For long tasks, consider truncating history or using summary compression
