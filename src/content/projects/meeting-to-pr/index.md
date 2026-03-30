---
title: "Meeting-to-PR: Voice-Driven Code Generation"
description: "Voice-driven code generation system that transforms verbal developer conversations into production-ready GitHub pull requests via an AI-powered Discord bot."
date: "Jan 24 2026"
repoURL: "https://github.com/Mister-Raggs/VoiceCode"
tags: ["Python", "Agentic Systems", "LLM Pipelines"]
---

**Role: System Architect & Technical Lead**

## Overview

Meeting-to-PR is an AI-powered Discord bot that transforms verbal developer conversations into production-ready GitHub pull requests. Developers describe coding tasks in natural language; the system autonomously generates code changes, creates PRs, runs automated reviews, and applies fixes — streamlining the entire development workflow.

## System Architecture

Built as a modular three-component pipeline:

- **Discord Voice Layer** — Transcribes conversations using ElevenLabs and extracts task requirements via conversational AI
- **Coding Agent** — Generates code changes in isolated Daytona sandboxes and creates GitHub PRs
- **Orchestration & Review** — Coordinates the pipeline, manages automated reviews, and handles iterative fixes

## My Contributions

- Designed the complete system architecture and data contracts enabling parallel development across three team members
- Architected state machine for task lifecycle: `PENDING → CODING → CREATING_PR → REVIEWING → FIXING → DONE`
- Designed conversation flow and state machine for natural language task extraction
- Designed central orchestration layer with auto-fix loop (max 3 attempts) and Sentry integration

## Key Impact

- Reduced conceptual code-to-PR workflow from 30+ minutes to under 2 minutes
- Enabled true hands-free development through voice-driven task creation
- Created clean component interfaces enabling parallel team development

## Why I Built It

Writing code is rarely the bottleneck — context switching is. The idea was to remove the overhead between a verbal decision in a meeting and an actual PR, and use it as a real test of how far multi-agent orchestration could go with minimal human-in-the-loop steps.

## Technologies

Python · asyncio · Discord.py · ElevenLabs · Daytona SDK · Claude API · PyGithub · Sentry
