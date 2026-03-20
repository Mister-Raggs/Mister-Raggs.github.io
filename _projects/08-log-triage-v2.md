---
layout: page
title: "Log Triage v2: Sub-Millisecond Incident Log Search"
date: 2026-03-20
description: >
  Go-based log triage system that finds the closest log entry to an incident timestamp in sub-millisecond time across millions of log lines — reimagined from a production system at Amazon.
---

**[View on GitHub](https://github.com/Mister-Raggs/log-triage-v2)**

## Overview

A reimagining of a production log triage system originally built at Amazon. The original system handled logs from a high-volume internal service generating ~42M rows/hour. During on-call incidents, engineers needed to quickly locate the relevant log entry nearest to a reported timestamp — the original solution reduced average triage time from 15 minutes to under 45 seconds.

v2 rewrites the core in Go, strips out internal dependencies, and adds observability and Kubernetes-native deployment so anyone can run it.

## Key Achievements

- **Sub-Millisecond Lookups**: Binary search over a time-sorted in-memory index finds the nearest log entry across millions of lines in under 1ms
- **Production-Scale Simulation**: Log generator replicates real volume (42M rows/hour / 11,667 lines/sec) without internal dependencies
- **Built-In Observability**: Prometheus metrics for request counts, latency histograms, index size, ingestion totals, and parse error counts
- **Kubernetes-Native**: Multi-stage Docker build (~15MB image), K8s manifests with health/readiness probes and resource limits
- **Clean Separation of Concerns**: Ingestion, indexing, query, and analysis are distinct packages with clear interfaces

## Architecture

```
Generator (sidecar) --> Log File --> Ingestion Goroutine --> Sorted Index (binary search) --> HTTP Server (:8080)
```

Deployed as a Kubernetes pod with the generator running as a sidecar that writes logs, and the server ingesting, indexing, and serving queries.

## Why I Built It

At Amazon, the legacy system for log triage was Timber — an internal log aggregation tool with a 1-hour publish delay. Engineers on-call would manually sift through massive log volumes to find the relevant entry near an incident timestamp.

I built a layer on top of that: binary search for sub-second lookups, an MCP endpoint for programmatic access, AWS Step Functions for workflow orchestration, and LLM confidence scoring to automate on-call SOP decisions. That's what cut triage time from 15 minutes to under 45 seconds.

I rebuilt it in Go to make the core idea portable: better concurrency primitives, smaller binaries, observability from day one, and no internal dependencies — so the architecture speaks for itself.

## Technologies

- Go
- Docker (multi-stage, ~15MB image)
- Kubernetes
- Prometheus
- Zap (structured logging)
