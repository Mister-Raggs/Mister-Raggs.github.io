---
title: "OneBusAway / maglev: OSS Contributions"
description: "Upstream contributions to OneBusAway's Go REST API — mutex contention profiling under k6 load, real-time detector fixes, and a versioned San Diego GTFS ground-truth store."
date: "Jul 14 2026"
repoURL: "https://github.com/OneBusAway/maglev"
tags: ["Go", "Distributed Systems", "Observability"]
---

## Overview

[OneBusAway](https://onebusaway.org/) is an open-source transit data platform used by transit agencies to serve real-time bus and rail data to millions of riders. `maglev` is the Go rewrite of its REST API — the service that answers "when is my bus arriving?" for every OneBusAway consumer app.

I've been contributing upstream fixes, load-test profiling, and local development infrastructure.

## Shipped

- **`StaleDetector` symmetric comparison fix** ([bfaa80c](https://github.com/OneBusAway/maglev/commit/bfaa80c)) — the stale real-time-data detector was doing an asymmetric time comparison that under- or over-flagged staleness depending on which timestamp arrived first. Symmetric comparison + a `trip-details` endpoint guard test to prevent regression.

## In progress

- **Mutex contention analysis under load** — profiled the server with `MAGLEV_PROFILE_MUTEX=1` under a 500 VU `k6` load. Identified `realTimeMutex` as the primary bottleneck: `rebuildMergedRealtimeLocked` holds a write lock while rebuilding lookup maps, blocking all concurrent API readers — the direct cause of a **75%+ failure rate** and 1-minute p-latency observed under load. Proposed fix: copy-on-write with `atomic.Value`, so readers become lock-free and the 30s updater swaps in a pre-computed merged view.
- **San Diego GTFS ground-truth store** — versioned/checksummed static feeds for MTS (21K trips, 4K stops, 105 routes) and UCSD Triton Transit (180 trips), with a `manifest.json` provenance file. Kept outside the `maglev` checkout so it's never accidentally committed; used for local validation of the API against realistic multi-agency data.

## Why This

Transit data services are exactly the shape of infra I like: real-time streams merged with static reference data, concurrent readers under variable load, and observability that matters (a slow API here means someone standing at a bus stop). The mutex contention finding is a textbook case of "profile before you guess" — a 30-second write lock every refresh cycle was invisible until the profiler pointed straight at it.

## Repository

- [OneBusAway/maglev](https://github.com/OneBusAway/maglev)
