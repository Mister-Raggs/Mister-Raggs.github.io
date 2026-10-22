---
title: "OneBusAway / maglev: OSS Contributions"
description: "9 merged fixes to OneBusAway's Go transit API, each from a spec-conformance bug I found and filed: query radius, sort order, result caps, route-type filtering, and reference handling."
date: "Jul 14 2026"
repoURL: "https://github.com/OneBusAway/maglev"
tags: ["Go", "Distributed Systems", "Observability"]
---

## Overview

[OneBusAway](https://onebusaway.org/) is an open-source transit data platform used by transit agencies to serve real-time bus and rail data to millions of riders. `maglev` is the Go rewrite of its REST API — the service that answers "when is my bus arriving?" for every OneBusAway consumer app.

I've been contributing upstream fixes, load-test profiling, and local development infrastructure.

## Shipped

Nine merged fixes, each from a spec-conformance bug I found and filed against the OneBusAway API spec:

- [#1173](https://github.com/OneBusAway/maglev/pull/1173): `StaleDetector` compared timestamps asymmetrically, so staleness flags depended on which one arrived first
- [#1183](https://github.com/OneBusAway/maglev/pull/1183): `routes-for-agency` exposed pagination the spec doesn't support
- [#1193](https://github.com/OneBusAway/maglev/pull/1193): `routes-for-agency` ignored `includeReferences=false`
- [#1252](https://github.com/OneBusAway/maglev/pull/1252): `stops-for-location` didn't clamp `maxCount` above the cap
- [#1253](https://github.com/OneBusAway/maglev/pull/1253): `stops-for-location` sorted on the raw stop ID instead of the combined `agency_stop` ID the spec requires
- [#1270](https://github.com/OneBusAway/maglev/pull/1270): `stops-for-location` mishandled stop-code queries
- [#1272](https://github.com/OneBusAway/maglev/pull/1272): route-type searches applied the result cap before the service filter, dropping valid matches
- [#1351](https://github.com/OneBusAway/maglev/pull/1351): `stops-for-location` ignored `includeReferences`
- [#1352](https://github.com/OneBusAway/maglev/pull/1352): `stops-for-location` rejected time formats the spec documents

[All my maglev PRs →](https://github.com/OneBusAway/maglev/pulls?q=is%3Apr+author%3AMister-Raggs)

## In progress

- **Mutex contention analysis under load** — profiled the server with `MAGLEV_PROFILE_MUTEX=1` under a 500 VU `k6` load. Identified `realTimeMutex` as the primary bottleneck: `rebuildMergedRealtimeLocked` holds a write lock while rebuilding lookup maps, blocking all concurrent API readers — the direct cause of a **75%+ failure rate** and 1-minute p-latency observed under load. Proposed fix: copy-on-write with `atomic.Value`, so readers become lock-free and the 30s updater swaps in a pre-computed merged view.
- **San Diego GTFS ground-truth store** — versioned/checksummed static feeds for MTS (21K trips, 4K stops, 105 routes) and UCSD Triton Transit (180 trips), with a `manifest.json` provenance file. Kept outside the `maglev` checkout so it's never accidentally committed; used for local validation of the API against realistic multi-agency data.

## Why This

Transit data services are exactly the shape of infra I like: real-time streams merged with static reference data, concurrent readers under variable load, and observability that matters (a slow API here means someone standing at a bus stop). The mutex contention finding is a textbook case of "profile before you guess" — a 30-second write lock every refresh cycle was invisible until the profiler pointed straight at it.

## Repository

- [OneBusAway/maglev](https://github.com/OneBusAway/maglev)
