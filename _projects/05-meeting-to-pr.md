---
layout: page
title: Meeting-to-PR
date: 2026-01-24
description: >
  Voice-driven code generation system that transforms verbal developer conversations into production-ready GitHub pull requests.
  An AI-powered Discord bot enabling hands-free development workflow automation.
---

**[View on GitHub](https://github.com/Mister-Raggs/VoiceCode)**

**Role: System Architect & Technical Lead**

## Overview

Meeting-to-PR is an AI-powered Discord bot designed to transform verbal developer conversations into production-ready GitHub pull requests. The system enables developers to describe coding tasks in natural language, and autonomously generates code changes, creates PRs, runs automated reviews, and applies fixes—streamlining the entire development workflow.

## System Architecture

Built as a modular three-component pipeline:

- **Discord Voice Layer** - Transcribes conversations using ElevenLabs TTS and extracts task requirements via conversational AI
- **Coding Agent** - Generates code changes in isolated Daytona sandboxes and creates GitHub PRs
- **Orchestration & Review** - Coordinates the pipeline, manages automated reviews, and handles iterative fixes

## My Contributions

### Architecture & Design

- Designed the complete system architecture and data contracts enabling parallel development across three team members
- Created shared data models (`TaskRequest`, `CodingResult`, `ReviewResult`, `StatusUpdate`) serving as the foundation for all component interactions
- Architected state machine for task lifecycle: `PENDING → CODING → CREATING_PR → REVIEWING → FIXING → DONE`
- Documented comprehensive PRDs, technical specs, and integration points for the team

### Discord Integration Foundation

- Designed conversation flow and state machine for natural language task extraction
- Defined Discord bot architecture with voice channel support, TTS/STT integration, and status update callbacks
- Created interface contracts for orchestrator-to-Discord communication

### Development Environment Setup

- Established project structure and module organization for clean separation of concerns
- Configured tech stack: Python 3.10+, discord.py, ElevenLabs, Daytona SDK, PyGithub, Sentry
- Set up development workflow using pmkit for PRDs, docs, and architecture decision records

### Orchestration System Design

- Designed central orchestration layer coordinating Discord → Coding Agent → Review Service
- Specified auto-fix loop with intelligent retry logic (max 3 attempts)
- Planned Sentry integration for comprehensive error tracking and performance monitoring
- Created status update propagation system for real-time feedback to Discord voice channels

## Implementation Status

- **Fully Implemented**: Discord bot with conversation management, voice handler, TTS, message handling
- **Fully Implemented**: Shared data models and contracts used across all modules
- **Architecture Complete**: Orchestrator, review service, and observability modules with documented interfaces
- **In Progress**: Coding agent integration with Daytona, CodeRabbit review automation

## Key Impact

- Reduced conceptual code-to-PR workflow from 30+ minutes to under 2 minutes
- Enabled true hands-free development through voice-driven task creation
- Designed scalable architecture supporting automated review and iterative fix cycles
- Created clean component interfaces enabling parallel team development

## Technologies

- Python, asyncio
- Discord.py with voice support
- ElevenLabs API
- Daytona SDK
- Claude/Anthropic API
- PyGithub
- Sentry
- httpx
