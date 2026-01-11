---
layout: page
title: Smart GPU Rental Agent
date: 2023-01-01
description: >
  AI agent that automatically finds, rents, and manages cloud GPUs across multiple vendors with intelligent failure recovery.
---

**[View on GitHub](https://github.com/Mister-Raggs/agentic-gpu-renter)**

## Overview

An autonomous LLM agent that manages cloud GPU rental from multiple vendors, capable of orchestrating complex workflows including vendor selection, budgeting, payment processing, job submission, and recovery from failures. The system survives crashes and serverless restarts through durable state management.

## Key Achievements

- **Autonomous Multi-Step Orchestration**: Agent handles entire GPU rental lifecycle from vendor selection through job completion
- **Intelligent Planning**: Structured JSON planning with Llama-3 via Fireworks AI, evaluating cost, reliability, and historical failures
- **Durable State Machine**: MongoDB-backed persistence supports multi-hour workflows across restarts and serverless boundaries
- **Automatic Failure Recovery**: When vendors fail mid-job, agent reloads reasoning history, replans, and switches vendors without losing progress
- **x402 Payment Integration**: Machine-to-machine payments via Coinbase CDP with automatic 402-challenge handling and transaction logging
- **Robust Testing**: Mock multi-vendor ecosystem with simulated job logs, payment errors, and failure injection

## Technical Implementation

- **LLM Reasoning**: Fireworks AI (Llama 3) with structured JSON action plans for dynamic strategy adaptation
- **Stateless Execution**: Vercel serverless functions enable resilient tick-based execution
- **Vendor Management**: Simulated APIs with realistic failure modes for comprehensive testing
- **Historical Learning**: Agent adapts strategy based on previous failures and vendor reliability data

## Technologies

- TypeScript
- MongoDB
- Fireworks AI (Llama 3)
- x402 / Coinbase CDP
- Vercel

