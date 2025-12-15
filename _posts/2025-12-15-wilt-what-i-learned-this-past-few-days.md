---
title: "WILT: What I Learned These Past Few Days"
date: 2025-12-15T00:00:00-08:00
categories:
  - learning
  - AI
tags:
  - agentic-ai
  - langchain
  - machine-learning
author_profile: true
excerpt: "My hands-on exploration of LangChain essentials, covering ReAct, streaming, tools, MCP, and agentic workflows"
---

## LangChain Essentials Labs

[Course Link: LangChain Essentials (Python)](https://academy.langchain.com/courses/take/langchain-essentials-python/){:target="_blank"}

The Labs in LangChain are a lot more hands-on, but I can see in action a lot of concepts that were introduced in the DLAI course.

Similar (perhaps the same thing?) to the Planning design pattern, they introduce ReAct, which stands for Reasoning + Act.

### Lab 1: Agent Workflow
In the Lab 1 Agent workflow we can see the Reflection design pattern in action, where if the SQL tool raises errors when running, it will try to revise its approach through a humanlike logical process. We can also visibly see the call_id for each message, which did not fully make sense to me in the DLAI course.

### Lab 2: Models and Messages
For Lab 2 we head into models and messages, the various roles that play a part in the workflow (system, human, model, tool etc.). We can choose between different input formats for the models, from LangChain specific classes to strings and dictionaries. We get to look at the internals of the communication between different nodes (human, tool, model) and how to decompose the output format and find out about message metadata (token, model usage).

### Lab 3: Streaming
Lab 3 talked about streaming to reduce latency between app and user. Messages streams LLM output token by token, while value streams state after each step (human msg -> ai mesg -> tool etc.)
We can use get_stream_writer to write custom streams (e.g. tool data) and multiple streaming options can be combined together as per use case.

### Lab 4 & 5: Tools and MCP
Lab 4 and 5 introduced Tools and MCP. They're essentially functions, with a tool decorator and (preferably) detailed docstring detailing tool usage to help the LLM identify when to invoke the tool. MCP provides a standard interface for tools and applications to connect. The LangSmith Agent debugger is also a cool way to visualize the calls and steps in the workflow, on top of seeing how many tokens / compute time / cost is being utilized.

### Lab 6: Context Management
Lab 6 was all about how Agents manage context. The stream that we talked about in Lab is also part of the runtime, which also includes stores for long-term and context for short-term history. This is different from the system prompt; the system prompt is broad instructions that define the direction of the Agent every time you ask it to perform a task, while the context tells the Agent what it has been up to lately (also this context is dynamic and keeps changing). We use the checkpointing argument to define the store which will define what we use to store the context (InMemorySaver for testing this locally but production grade Agents would need something like langgraph-checkpoint-postgres).

### Lab 7: Structured Output
Lab 7 defined what role Structured output plays in the Agentic workflow. For Agents to integrate into existing systems, their outputs would need to often follow a specific pattern. These can be easily defined with the response_format argument in LangChain with Pydantic Base models, TypedDicts in Python, data classes and even Json schema.

### Lab 8: Middleware and Dynamic Prompts
Lab 8 went into Middleware and Dynamic Prompts. These are functions placed in key points in the ReAct workflow, serving key purposes like guardrails, connection setup, model retries, caching etc.
Dynamic prompting would allow choosing prompts on the fly with runtime context and current state with an enriched context (from the middleware).

### Lab 9: Human in the Loop
Lab 9 wrapped up by introducing Human in the Loop as Middleware. It covers approvals (allowing code / tools to be run), injections and allowing edits.
It's easy to set this up using the allowed_decisions parameter, and the best parallel I could draw would be Copilot asking for permission before executing code in the terminal.

## Questions and Reflections

Overall, this feels like a comprehensive introduction to LangChain essentials, and any additional documentation for setting up an Agentic workflow in production seems fairly straightforward. I'll be moving on to the LangGraph essentials course next, but here are some questions that I'm left with at the end of this course:

- How is context managed in production LLMs? I can't imagine (and I don't see it happening in practice either) ChatGPT storing an infinitely increasing context, even if it is a long term. While I was at Amazon, the internal Agent would have history limits, after a certain point they'd prompt you to compress the chat history or you could not continue to use the same chat. I assume in practice it would essentially take the summary of the old chat, plug it into a fresh instance of the LLM( if that's even a thing ) and then continue as normal.
- I see something different in practice with ChatGPT, it still allows you to use a chat for a long time, but the longer a chat becomes the slower it becomes to use the chat and the RAM usage on my slightly dusty M1 Air spikes. I remember a point where Claude had a chat window limit, after which you'd have to essentially create a new chat, but I'm not sure if that still exists. What's a better way to do this?
- How does an Agent like NotebookLM evaluate its output? I'm talking specifically about the Slide Deck, and it creates amazing visuals, with a few errors here and there (visuals are usually perfect, the smaller text sometimes gives away that it's AI generated, I'll attach an image if I can find one). It only gives a resulting PDF, but with screenshots and Preview it is hardly any work to convert it into an actual submission for whatever assignment is due this week (remember you're bound to secrecy). But how does it evaluate these images? How does it know if it's creating good / great / bad content? When they were training NotebookLM, did it break a page into smaller chunks and see if the words make sense? This video by Julia Turc breaks down how Transformers are taking over work done by CNNs, and I don't think that answers my questions but it is very cool to think about: [https://youtu.be/KnCRTP11p5U?si=HNjfLBO0joXp7CMC](https://youtu.be/KnCRTP11p5U?si=HNjfLBO0joXp7CMC)

I love to chat about all things Agents, expanding their use cases and how to evaluate them. You can find me at:

**Raghav Kachroo**
📧 Email: [rkachroo@ucsd.edu](mailto:rkachroo@ucsd.edu)
🌐 Website: [mister-raggs.github.io](https://mister-raggs.github.io)
💼 LinkedIn: [linkedin.com/in/raghavkachroo/](https://www.linkedin.com/in/raghavkachroo/){:target="_blank"}
