---
layout: page
title: "Flare: LLM-Powered Log Anomaly Detection"
date: 2026-03-17
description: >
  End-to-end log anomaly detection pipeline combining Isolation Forest with LLM summarization, built on real HDFS log data with automated quality evaluation.
---

**[View on GitHub](https://github.com/mister-raggs/flare)** | **[Read the blog post](/ai/building-flare-llm-powered-incident-detection/)**

## Overview

Flare ingests raw log data, detects anomalies using classical ML (Isolation Forest on Drain3-extracted template features), clusters related signals into incidents via DBSCAN, and summarizes each incident in plain English using Claude Sonnet — with severity assessment, root cause analysis, and actionable remediation steps.

## Key Achievements

- **Classical + LLM Pipeline**: Isolation Forest achieves F1=1.0 on HDFS sample data; LLM layer adds human-readable explanations grounded in specific log evidence
- **LLM-as-Judge Evaluation**: Automated quality rubric scoring (relevance, specificity, actionability) using a second LLM call — enables CI-friendly eval without human labeling
- **Production-Ready API**: FastAPI REST layer with Pydantic validation, structured logging, CORS, and auto-generated OpenAPI docs
- **Full Observability**: Token usage, latency, and cost tracking on every LLM call; chain-of-thought prompting with confidence scoring

## Architecture

```
Raw Logs → Drain3 Parsing → Isolation Forest → DBSCAN Clustering → Claude Sonnet → Eval
```

## Tech Stack

Python 3.11+, Drain3, scikit-learn, Anthropic API, FastAPI, Pydantic, Docker, GitHub Actions CI (72 tests, all mocked for CI)
