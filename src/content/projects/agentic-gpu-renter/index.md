---
title: "GPU Rental AI Agent"
description: "AI agent that automatically finds, rents, and manages cloud GPUs across multiple vendors with intelligent failure recovery and machine-to-machine payments."
date: "Jan 10 2026"
repoURL: "https://github.com/Mister-Raggs/agentic-gpu-renter"
tags: ["TypeScript", "Agentic Systems", "LLM Pipelines"]
---

## Overview

An autonomous LLM agent that manages cloud GPU rental from multiple vendors, capable of orchestrating complex workflows including vendor selection, budgeting, payment processing, job submission, and recovery from failures. The system survives crashes and serverless restarts through durable state management.

## Key Achievements

- **Autonomous Multi-Step Orchestration**: Agent handles entire GPU rental lifecycle from vendor selection through job completion
- **Intelligent Planning**: Structured JSON planning with Llama-3 via Fireworks AI, evaluating cost, reliability, and historical failures
- **Durable State Machine**: MongoDB-backed persistence supports multi-hour workflows across restarts and serverless boundaries
- **Automatic Failure Recovery**: When vendors fail mid-job, agent reloads reasoning history, replans, and switches vendors without losing progress
- **x402 Payment Integration**: Machine-to-machine payments via Coinbase CDP with automatic 402-challenge handling
- **Robust Testing**: Mock multi-vendor ecosystem with simulated job logs, payment errors, and failure injection

## Why I Built It

GPU access is one of the most manual parts of ML workflows — checking availability across vendors, babysitting jobs, handling failures mid-run. I wanted to see how far an agent with durable state could go in handling the full lifecycle autonomously, including replanning when a vendor fails partway through.

## Technologies

TypeScript · MongoDB · Fireworks AI (Llama 3) · x402 / Coinbase CDP · Vercel
