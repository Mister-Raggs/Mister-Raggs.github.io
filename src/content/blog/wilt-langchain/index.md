---
title: "WILT: LangChain Essentials — ReAct, Streaming, Tools, and MCP"
description: "My hands-on exploration of LangChain essentials, covering ReAct, streaming, tools, MCP, and agentic workflows."
date: "Dec 15 2025"
---

## LangChain Essentials Labs

[Course: LangChain Essentials (Python)](https://academy.langchain.com/courses/take/langchain-essentials-python/)

The Labs in LangChain are a lot more hands-on, but I can see in action a lot of concepts that were introduced in the DeepLearning.AI course.

Similar to the Planning design pattern, they introduce **ReAct** — Reasoning + Act.

### Lab 1: Agent Workflow
The Reflection design pattern in action — if the SQL tool raises errors, the agent will try to revise its approach through a humanlike logical process.

### Lab 2: Models and Messages
The various roles that play a part in the workflow (system, human, model, tool etc.). We can choose between different input formats for the models, from LangChain-specific classes to strings and dictionaries.

### Lab 3: Streaming
Streaming to reduce latency between app and user. Messages streams LLM output token by token, while value streams state after each step. `get_stream_writer` allows writing custom streams (e.g. tool data).

### Lab 4 & 5: Tools and MCP
Tools are essentially functions with a `@tool` decorator and a detailed docstring to help the LLM identify when to invoke the tool. MCP provides a standard interface for tools and applications to connect. The LangSmith Agent debugger is a great way to visualize the calls and steps in the workflow.

### Lab 6: Context Management
Agents manage context through a runtime that includes stores for long-term and context for short-term history. This is different from the system prompt — the system prompt is broad instructions that define the direction of the Agent, while the context tells the Agent what it has been up to lately. Use `InMemorySaver` for local testing; production agents need something like `langgraph-checkpoint-postgres`.

### Lab 7: Structured Output
For Agents to integrate into existing systems, their outputs need to often follow a specific pattern. Easily defined with `response_format` in LangChain using Pydantic models, TypedDicts, or JSON schema.

### Lab 8: Middleware and Dynamic Prompts
Middleware functions are placed at key points in the ReAct workflow — guardrails, connection setup, model retries, caching. Dynamic prompting allows choosing prompts on the fly with runtime context.

### Lab 9: Human in the Loop
Human-in-the-Loop as Middleware — approvals, injections, and edits. Set up using the `allowed_decisions` parameter. Best parallel: Copilot asking for permission before executing code in the terminal.

## Open Questions

- How is context managed in production LLMs? You can't have an infinitely increasing context window. In practice it would take the summary of the old chat, plug it into a fresh instance of the LLM, and continue as normal.
- How does an Agent like NotebookLM evaluate its visual output? When training on slide decks, how does it know if it's creating good content? When they were training NotebookLM, did it break a page into smaller chunks and see if the words make sense?
