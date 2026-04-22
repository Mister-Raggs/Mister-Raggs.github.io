---
title: "WILT: Agentic AI Workflows and Design Patterns"
description: "My structured dive into Agentic AI workflows, design patterns, and practical implementation tips from the DeepLearning.AI course."
date: "Dec 11 2025"
draft: true
---

## Agentic AI

[Course: Agentic AI by DeepLearning.AI](https://learn.deeplearning.ai/courses/agentic-ai)

For someone who loves the idea of building Agents to outsource every minor task, I sure did delay some structured learning in the field.

This course taught me about the nuances of building Agents — what it means to build your own, and how different agents have different degrees of autonomy.

### My Takeaway

- If your agent takes a single step to solve your problem, it's considered a non-agentic workflow (not a bad thing).
- The more predetermined (fixed) steps your workflow has (e.g. pre-coded tool use), the less autonomous your Agent will be. The Agent will still have autonomy in text generation, but will not take decisions autonomously, nor will it create tools on the go.
- A more autonomous Agent benefits from parallelism and modularity — being able to run multiple calls at the same time and updating its roster of tools to fit the situation. In fact you're better off using Agentic workflows than simply upgrading to the latest model every time.

## Task Decomposition + Agentic Evaluation

When talking about Agentic performance, it's best understood with a confusion matrix:

|  | Per example ground truth | No per example ground truth |
|---|---|---|
| **Objective Eval** | ✓ |  |
| **Subjective Eval** |  | ✓ |

There are 2 different levels of evaluation: **pipeline evaluation** and **component-level evaluation**. Typically, depending on the final output you would take a call on whether you need component-level eval or not.

## Agentic Design Patterns

There are 4 patterns that help Agents excel:

1. **Reflection** — Reviewing the output generated as an initial draft, sometimes using an LLM judge.
2. **Tool Use** — Adding functionality such as web search, database lookup and repository management. MCP is a subset of tool use, but the idea is to avoid M × N custom wrappers and allow for shared MCP servers.
3. **Planning** — Breaking down the given task into multiple achievable steps.
4. **Multi-Agent workflows** — Using different LLMs for different tasks, e.g. essay writer LLM + critic LLM in an article generation workflow.

## Practical Tips

1. **More autonomy == more flexibility, but more room for error.** Especially in multi-agent workflows where each agent can talk to each other, it creates a lot of room for unexpected results.

2. **Some LLMs are better at some tasks.** Not every LLM is built the same. Find out which is which.

3. **Build fast, break fast.** A quick messy implementation beats a delayed perfect implementation any day.

4. **Evaluation is what you make of it.** You know what you want the LLM to do — every now and then you'll have to write evaluation code yourself. Focus where the Agent is going wrong.

5. **Cost is not the enemy.** For a model that might be irrelevant a year down the line, you can't afford to optimize every single component. Focus on the biggest contributors.

6. **Create gold standards for subjective evaluation.** When there's no ground truth, use many ground truths.

7. **Formatting matters.** LLMs love JSON, so using that as output helps with both multi-agent and reflection patterns.
