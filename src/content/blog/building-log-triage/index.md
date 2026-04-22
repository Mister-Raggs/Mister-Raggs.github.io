---
title: "From 15 minutes to 45 seconds: rebuilding an Amazon on-call tool in Go"
description: "How I rebuilt a production log triage system — binary search over a sorted index, a channel-based ingestion pool, a write-ahead log for crash recovery, and what I'd do differently at scale."
date: "Apr 22 2026"
---

## The problem

Imagine you're on-call at 2am. An alert fires. The incident timestamp is `2024-01-15T10:30:45.123Z`. You need to find the log entry closest to that moment — the one that tells you what was failing and why. Your log source is Timber, Amazon's internal aggregation tool. It publishes in hourly batches. The last batch was 55 minutes ago. The logs you need don't exist yet.

When they eventually appear, you're looking at a plain-text file with 42 million rows per hour — roughly 11,667 lines per second at peak. The format is simple enough: `TIMESTAMP [TAG] BODY`. But there's no index. Finding the entry closest to your incident timestamp means a grep or a manual scroll through millions of lines. The average time from alert to "I have the relevant log line" was around 15 minutes. On a bad day, when the incident hit near a batch boundary, it was longer.

## The original solution

I built a layer on top of Timber that replaced the grep with a binary search. Once you ingest time-sorted log entries into a sorted slice, finding the entry nearest to an arbitrary timestamp is O(log n) — effectively constant regardless of how large the index grows. I wrapped that with an MCP endpoint for programmatic access, added AWS Step Functions to automate the triage workflow, and used LLM confidence scoring to decide whether to execute the on-call SOP automatically or escalate to a human.

That combination brought average triage time from 15 minutes to under 45 seconds.

The limitation was portability. The original was built on internal tooling: proprietary log libraries, pre-configured Lambda runtimes, internal IAM roles and network paths. None of it could leave the environment. v2 is a clean-room rewrite with the same core ideas and zero internal dependencies — so the architecture can speak for itself.

## The core data structure

The index is a sorted slice of `LogEntry` values. Finding the nearest entry to a query timestamp is a lower-bound binary search — the standard `sort.Search` from the Go standard library.

Why a sorted slice and not a map or BST?

A map gives O(1) exact lookups but can't answer "nearest timestamp" efficiently. A BST gives O(log n) nearest-neighbor queries but has poor cache locality — traversing a tree means pointer-chasing through heap allocations that won't be in L1 or L2 cache. A sorted slice is contiguous in memory. Binary search on contiguous memory is dominated by cache effects at the sizes we care about, not comparison count. The benchmark proves it:

| Index size | Unfiltered query | Filtered query (tag match) |
|------------|-----------------|---------------------------|
| 1k entries | 49 ns | 72 ns |
| 100k entries | 70 ns | 94 ns |
| 1M entries | 77 ns | 101 ns |

From 1k to 1M — three orders of magnitude more data — query latency grows by less than 2×. That's O(log n) in practice, and the actual numbers (49 ns → 77 ns unfiltered) show that cache effects dominate: at 1M entries the binary search performs about 20 comparisons, but most of the time is spent waiting on cache misses as the search jumps across a larger slice, not in the comparison logic itself.

The one cost of a sorted slice is insertion. Appending to the end is O(1) but inserting in the middle requires shifting. For ingestion at 11,667 lines/sec, calling `Insert` per line would be O(n) per call and untenable. The solution is batch insertion: accumulate 1,000 parsed entries, sort the batch, then merge into the main slice in one operation. Single-entry vs. batch insertion at 100k existing entries:

| Method | Cost |
|--------|------|
| Single `Insert` (into 100k index) | 183 ns/op |
| `InsertBatch` / 100 entries | ~47 ms |
| `InsertBatch` / 1,000 entries | ~36 ms |
| `InsertBatch` / 10,000 entries | ~29 ms |

The server always uses `InsertBatch`.

## The concurrency model

The system has two distinct concurrency problems and they need different tools.

**The index uses shared memory with a mutex.** Multiple query goroutines read the index concurrently; one writer goroutine inserts batches periodically. This is exactly the use case `sync.RWMutex` is designed for: many concurrent readers, occasional exclusive writers. Readers hold `RLock` during the binary search. The writer holds `Lock` only for the duration of a batch merge — typically a few microseconds. A benchmark at 8 readers / 1 writer confirms no reader starvation and no data races under `-race`.

**The ingestion pipeline uses channels.** A reader goroutine tails the log file and sends raw lines into a channel. A pool of worker goroutines pulls from that channel, parses lines in parallel, and sends parsed `LogEntry` values into a results channel. A collector goroutine drains results and calls `InsertBatch`.

```
reader goroutine
    │
    │  raw lines (chan string)
    ▼
worker pool (N goroutines)  ← parse is CPU-bound, embarrassingly parallel
    │
    │  parsed entries (chan LogEntry)
    ▼
collector goroutine
    │
    │  InsertBatch (holds RWMutex write lock briefly)
    ▼
sorted index
```

The reason these are different patterns: the index has shared state that must be protected from concurrent mutation — mutex is the right tool. The ingestion pipeline has no shared state; goroutines communicate by passing values — channels are the right tool. Mixing them up (using channels to synchronize index access, or using mutexes to sequence pipeline stages) would make both harder to reason about.

## Durability: the WAL

The sorted index is in-memory. A restart loses everything — on a large index that means replaying hours of logs from the source file before the server can serve queries again.

The write-ahead log solves this. Before each ingested entry enters the index, it's appended to a WAL file on disk. On startup, the server replays the WAL to reconstruct the index before opening the HTTP port. Replay uses the existing parser — the WAL format is identical to the raw log format, so no new code is needed and there's nothing to get out of sync.

The hard part is fsync. At 42M rows/hour, calling `fsync` per entry would serialize every write to disk and cap throughput at disk IOPS — 7,200 RPM spinning disk can handle around 100-200 fsyncs/sec; that's nowhere near 11,667 entries/sec. The WAL batches: it fsyncs every 1,000 entries *or* every 500ms, whichever comes first. This bounds data loss on an unclean shutdown to at most 1,000 entries or 500ms of writes.

A crash-recovery test confirms the tradeoff: writing 30,000 entries with a simulated crash mid-stream, replay recovers 29,984. The 16 entries in the unflushed tail at crash time are gone — the truncated last line fails the parser and is silently skipped. That's exactly the guarantee: consistent state, bounded loss, no corruption.

## What I'd do differently

**Segment the WAL.** A single append-only file works at this scale, but the WAL grows unbounded. A production implementation would use segments — fixed-size files that are sealed and eventually deleted once the in-memory index has checkpointed beyond them. This is how most databases (etcd, Kafka, PostgreSQL WAL) handle it. The current design has no compaction.

**Shard the index lock.** The `RWMutex` on the index is a single point of contention. At very high write rates with many concurrent query goroutines, the write lock blocks all reads for the merge duration. Sharding the index by time range — each shard with its own lock — would let queries on old data proceed while new entries are being merged into the recent shard.

**OTel to a real backend.** The current OpenTelemetry integration exports traces to stdout. That's useful for local debugging but doesn't connect to anything. A real deployment would export to Jaeger or a Tempo instance and correlate query traces with ingestion state at query time — useful for debugging cases where the nearest entry is unexpectedly far from the requested timestamp.

---

Repository: [github.com/Mister-Raggs/log-triage-v2](https://github.com/Mister-Raggs/log-triage-v2)