---
title: "Log Triage v2: Sub-Millisecond Incident Log Search"
description: "Go-based log triage system that finds the closest log entry to an incident timestamp in sub-millisecond time across millions of log lines — reimagined from a production system at Amazon."
date: "Mar 20 2026"
repoURL: "https://github.com/Mister-Raggs/log-triage-v2"
tags: ["Go", "Kubernetes", "Docker", "Prometheus", "Observability", "Distributed Systems"]
---

## Overview

A reimagining of a production log triage system originally built at Amazon. The original system handled logs from a high-volume internal service generating ~42M rows/hour. During on-call incidents, engineers needed to quickly locate the relevant log entry nearest to a reported timestamp — the original solution reduced average triage time from 15 minutes to under 45 seconds.

v2 rewrites the core in Go, strips out internal dependencies, and adds observability and Kubernetes-native deployment so anyone can run it.

## Key Achievements

- **Sub-Microsecond Lookups**: Binary search over a time-sorted in-memory index — 49ns at 1k entries, 77ns at 1M entries (less than 2× growth over three orders of magnitude); cache-dominated, not comparison-bound
- **Parallel Ingestion Worker Pool**: Reader goroutine feeds raw lines into a channel; N worker goroutines parse in parallel; collector drains results and calls `InsertBatch` — replaces the prior single-goroutine pipeline
- **Write-Ahead Log**: Append-only WAL with batched fsync (every 1,000 entries or 500ms) and startup replay — recovers 29,984/30,000 entries in a crash test, bounded loss with no corruption
- **FIFO Eviction**: `--max-entries` flag caps index memory usage; oldest entries evicted automatically with an `evictions_total` Prometheus counter
- **Built-In Observability**: Prometheus metrics (request counts, latency histograms, index size, ingestion totals, parse errors, evictions) plus OpenTelemetry spans on `/query` (decode, index_lookup, encode)
- **Kubernetes-Native**: Multi-stage Docker build (~15MB image), K8s manifests with health/readiness probes and resource limits

## Architecture

```
Generator (sidecar) → Log File → Reader → Worker Pool (parse) → Collector → Sorted Index ← Binary Search ← HTTP :8080
                                                                       ↓
                                                                      WAL (append + batched fsync, replayed on startup)
```

Deployed as a Kubernetes pod with the generator running as a sidecar that writes logs, and the server ingesting, indexing, and serving queries.

## Why I Built It

At Amazon, the legacy system for log triage was Timber — an internal log aggregation tool with a 1-hour publish delay. Engineers on-call would manually sift through massive log volumes to find the relevant entry near an incident timestamp.

I built a layer on top of that: binary search for sub-second lookups, an MCP endpoint for programmatic access, AWS Step Functions for workflow orchestration, and LLM confidence scoring to automate on-call SOP decisions. That's what cut triage time from 15 minutes to under 45 seconds.

I rebuilt it in Go to make the core idea portable: better concurrency primitives, smaller binaries, observability from day one, and no internal dependencies — so the architecture speaks for itself.

## Technologies

Go · Docker · Kubernetes · Prometheus · OpenTelemetry · Zap
