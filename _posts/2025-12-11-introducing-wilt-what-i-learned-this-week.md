---
title: "Introducing WILT: What I Learned This Week"
date: 2025-12-11T00:00:00-08:00
categories:
  - learning
  - AI
tags:
  - agentic-ai
  - machine-learning
  - deeplearning-ai
author_profile: true
excerpt: "My structured dive into Agentic AI workflows, design patterns, and practical implementation tips"
---

## Agentic AI

[Course Link: Agentic AI by DeepLearning.AI](https://learn.deeplearning.ai/courses/agentic-ai){:target="_blank"}

For someone who loves the idea of building Agents to outsource every minor task, I sure did delay some structured learning in the field.

This course taught me about the nuances of building Agents. I learned what it means to build your Agents, and if I had to do it myself, I'd be heading in with more confidence.

We started with agentic and non-agentic workflows, talked about what defines an agent and how different agents have different degrees of autonomy.

### My Takeaway:

- If your agent takes a single step to solve your problem, it's considered a non-agentic workflow (not a bad thing).
- The more predetermined (fixed) steps your workflow has (e.g. pre-coded tool use), the less autonomous your Agent will be. The Agent will still have autonomy in text generation, but will not take decisions autonomously, nor will it create tools (code for example) on the go.
- A more autonomous Agent benefits from parallelism and modularity, i.e being able to run multiple calls at the same time and updating its roster of tools to fit the situation. In fact you're better off using Agentic workflows than simply upgrading to the latest model every time (the performance gains are substantial).

## Task Decomposition + Agentic Evaluation

If you want your Agent to respond to reviews posted on your website, it might:
- Wait for a new review to be posted.
- Extract information from review text.
- Understand customer sentiment and expectation.
- Generate and post a reply in accordance with company policies.

I came up with this example on my own, but most LLMs have sufficient training data, and you don't need to decompose your tasks into individual steps manually.

When talking about Agentic performance, it's best understood with a confusion matrix:

|  | Per example ground truth | No per example ground truth |
|---|---|---|
| **Objective Eval** | * |  |
| **Subjective Eval**|  | * |

As you can imagine, objective results with per example ground truth are the easiest when it comes to Agent evaluation.

There's 2 different levels of evaluation: **pipeline evaluation** and **component-level evaluation**. Typically, depending on the final output you would take a call on whether you need component-level eval or not.

## Agentic Design Patterns

There are 4 patterns that help Agents excel:

1. **Reflection** - Reviewing the output generated as an initial draft, sometimes using an LLM judge.
2. **Tool Use** - Adding functionality such as web search, database lookup and repository management. MCP is a subset of tool use, but the idea is to avoid M × N custom wrappers (M Agents, N tools) and allowing for shared MCP servers.
3. **Planning** - Breaking down the given task into multiple achievable steps, same essence as task decomposition.
4. **Multi-Agent workflows** - Using different LLMs for different tasks, e.g. essay writer LLM, critic LLM in an article generation workflow.

## Practical Tips for Agentic Workflows

We went over practical tips for Agentic workflows, and here's some of the advice that stood out to me:

1. **More autonomy == more flexibility, but more room for error.** Especially in multi-agent workflows where each agent can talk to each other, it creates a lot of room for unexpected results. Planning is hard to control, so multiply that with the number of Agents and you have a proper recipe for surprises.

2. **Some LLMs are better at some tasks.** Not every LLM is built the same, some might be better at research, others might create stunning visuals. Find out which is which. (I personally love NotebookLM for academic work, but don't tell anyone).

3. **Build fast, break fast.** A quick messy implementation beats a delayed perfect implementation any day. Like any tech solution, there's value in faster iteration. Build fast + Analyze fast => Build better faster.

4. **Evaluation is what you make of it.** You know what you want the LLM to do, so every now and then you'll have to write evaluation code yourself. You have to be willing to create component level evals and find out where the pipeline is not performing as you expect. Also, focus where the Agent is going wrong, error analysis will determine where you should focus efforts.

5. **Cost is not the enemy.** There's a lot of places for cost and latency optimization in your workflow. For a model that might be irrelevant a year down the line, you can't afford to optimize every single component. Don't sweat the small stuff, focus on the biggest contributors.

6. **Create gold standards for subjective evaluation.** When there's no ground truth, use many ground truths. For example, favor using publications from a defined list of trusted sources.

7. **Formatting matters.** LLMs love JSON, so using that as output helps with both multi agent and reflection patterns.

---

**For inquiries, please contact:**

**Raghav Kachroo**
📧 Email: [rkachroo@ucsd.edu](mailto:rkachroo@ucsd.edu)
🌐 Website: [mister-raggs.github.io](https://mister-raggs.github.io)
💼 LinkedIn: [linkedin.com/in/raghavkachroo/](https://www.linkedin.com/in/raghavkachroo/){:target="_blank"}
