---
title: "Flare: LLM-Powered Log Anomaly Detection"
description: "End-to-end log anomaly detection pipeline combining Isolation Forest with LLM summarization, built on real HDFS log data with automated quality evaluation."
date: "Mar 17 2026"
repoURL: "https://github.com/mister-raggs/flare"
tags: ["Python", "LLM Pipelines", "LLM Evaluation", "Observability", "FastAPI", "Docker"]
---

## Overview

Flare ingests raw log data, detects anomalies using classical ML (Isolation Forest on Drain3-extracted template features), clusters related signals into incidents via DBSCAN, and summarizes each incident in plain English using Claude Sonnet — with severity assessment, root cause analysis, and actionable remediation steps.

## Key Achievements

- **Real Benchmark**: Isolation Forest achieves F1=0.642, Precision=0.688, Recall=0.601 on the full HDFS dataset (11.2M lines, 575K blocks, 16.8K anomalies — 2.9% anomaly rate); features are per-block Drain3 template frequency vectors learned across the full dataset
- **LLM-as-Judge Evaluation**: Automated quality rubric scoring (relevance 5/5, specificity 5/5, actionability 4/5) using a second LLM call — enables CI-friendly eval without human labeling
- **Multi-Format Log Parsing**: Auto-detects HDFS, OpenSSH, syslog formats; heuristic generic fallback for arbitrary logs; Drain3 template state persists across restarts
- **Live Demo Streaming**: SSE endpoint replays shuffled HDFS blocks at 5 lines/sec through the full detection pipeline — each run randomizes block order for different results; configurable stream length (50–500 lines)
- **Production-Ready API**: FastAPI REST layer with Pydantic validation, structured logging, CORS, and auto-generated OpenAPI docs; live at `167.172.216.126:8000`

## Architecture

```
Raw Logs → Drain3 Parsing → Isolation Forest → DBSCAN Clustering → Claude Sonnet → Eval
```

## Tech Stack

Python 3.11+ · Drain3 · scikit-learn · Anthropic API · FastAPI · Pydantic · Docker · GitHub Actions CI (121 tests)
