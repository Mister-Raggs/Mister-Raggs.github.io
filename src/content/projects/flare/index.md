---
title: "Flare: LLM-Powered Log Anomaly Detection"
description: "End-to-end log anomaly detection pipeline with multi-model comparison (Isolation Forest, LOF, One-Class SVM), MLflow experiment tracking, and LLM summarization on real HDFS log data."
date: "Mar 17 2026"
repoURL: "https://github.com/mister-raggs/flare"
tags: ["Python", "LLM Pipelines", "LLM Evaluation", "Observability", "FastAPI", "Docker"]
---

## Overview

Flare ingests raw log data, detects anomalies using classical ML (Isolation Forest, LOF, One-Class SVM on Drain3-extracted template features), clusters related signals into incidents via DBSCAN, and summarizes each incident in plain English using Claude Sonnet — with severity assessment, root cause analysis, and actionable remediation steps. Every run is tracked in MLflow with full experiment comparison and dataset lineage.

## Key Achievements

- **Real Benchmark**: Isolation Forest achieves F1=0.642, Precision=0.688, Recall=0.601 on the full HDFS dataset (11.2M lines, 575K blocks, 16.8K anomalies — 2.9% anomaly rate) at ~40ms CPU-only latency per detection
- **MLflow Sweep Pipeline**: End-to-end experiment tracking across model types, feature sets, and hyperparameters — every sweep logs metrics, params, artifacts, and dataset lineage; parse cache + progress bar make sweeps incremental
- **Feature Ablation**: `feature_set` ablation in `AnomalyDetector` quantifies the contribution of template frequency, sequence features, and StandardScaler normalization across the full sweep
- **Drain3 Validation**: `flare drain3 validate` command scores template extraction quality with both supervised metrics (against labeled anomalies) and unsupervised metrics (template stability, cluster purity)
- **ModelServer for Inference**: Dedicated inference-only path with pre-warm at API startup — keeps detection latency predictable under load by eliminating cold-start overhead
- **LLM-as-Judge Evaluation**: Automated quality rubric scoring (relevance 5/5, specificity 5/5, actionability 4/5) using a second LLM call — enables CI-friendly eval without human labeling; 4.67/5 mean quality across runs
- **Multi-Format Log Parsing**: Auto-detects HDFS, OpenSSH, syslog formats; heuristic generic fallback for arbitrary logs; Drain3 template state persists across restarts
- **Live Demo Streaming**: SSE endpoint replays shuffled HDFS blocks at 5 lines/sec through the full detection pipeline; configurable stream length (50–500 lines), live at `167.172.216.126:8000`

## Architecture

```
Raw Logs → Drain3 Parsing → Feature Pipeline → [Isolation Forest | LOF | One-Class SVM]
                                 │                          │
                                 └──────────────────────────┴── MLflow tracking
                                                            ↓
                                                       DBSCAN Clustering → Claude Sonnet → LLM-as-Judge Eval
```

## Tech Stack

Python 3.11+ · Drain3 · scikit-learn · MLflow · Anthropic API · FastAPI · Pydantic · Docker · GitHub Actions CI
