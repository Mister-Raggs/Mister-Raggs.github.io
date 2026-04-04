---
title: "Building Flare: LLM-Powered Incident Detection on Real Log Data"
description: "How I built an end-to-end log anomaly detection pipeline that combines classical ML with LLM summarization — and what I learned about evaluating LLM output in production-adjacent systems."
date: "Mar 17 2026"
---

## The problem

An on-call engineer at a company running HDFS clusters might see 50,000 new log lines per minute during an incident. Most of them are noise — normal block transfers, routine replication confirmations, heartbeats. Buried in that stream are the three lines that actually matter: a connection reset, a failed block receive, a timeout that cascades into data loss.

The standard response is alerts on keyword matches and static thresholds. But keyword-based alerting doesn't scale. You either drown in false positives ("ERROR" appears in a stack trace that's actually handled) or miss the anomaly that doesn't contain any obvious keywords. The HDFS dataset from Loghub captures this reality: 11 million log lines, 575,000 blocks, with labeled anomalies that human operators identified after the fact.

I wanted to build a system that does what a good SRE does manually — parse the logs, identify the anomalous patterns, group related signals, and explain what happened — but faster and with an audit trail.

## The architecture

Flare is a five-stage pipeline. Each stage has a clear contract with the next.

```
Raw Logs → Ingestion → Detection → Clustering → LLM Summarization → Eval
```

**Ingestion** parses raw HDFS log lines with regex and feeds each message through Drain3, an online log template miner. The output is structured `LogEvent` objects with template IDs, block IDs, timestamps, and extracted parameters.

**Detection** groups events by block ID and builds a feature vector per block: a histogram of template occurrence counts plus aggregate features (total events, unique templates). Isolation Forest scores each block. Anomalous blocks have template distributions that look different from the norm.

**Clustering** takes the anomalous blocks and groups them into incidents using DBSCAN on their normalized feature vectors. Each incident gets enriched with the original log lines, templates, and time range — this is the context packet the LLM needs.

**LLM Summarization** sends each incident to Claude Sonnet with a chain-of-thought prompt. The model outputs structured JSON: explanation, severity, root cause, remediation steps, and confidence score.

**Eval** runs on two levels. Classical: precision/recall/F1 against ground truth labels. LLM: a second model call scores the first on relevance, specificity, and actionability.

The key design choice is that each stage is independently testable. The detection pipeline works without the LLM. The LLM works on pre-computed incidents. The eval harness works on saved results. You can swap any layer without touching the others.

## The classical baseline

Before the LLM sees anything, Drain3 does the heavy lifting of turning unstructured text into features.

Drain3 is a streaming log parser that builds a template tree. When it sees `Receiving block blk_-1608999687919862906 src: /10.250.19.102:54106 dest: /10.250.19.102:50010`, it extracts the template `Receiving block <*> src: <*> dest: <*>` and assigns a cluster ID. Over time, it converges on a stable set of templates. On the HDFS sample, 86 log lines collapse into 8 unique templates.

This matters because it transforms the problem. Instead of "find anomalies in text," it becomes "find blocks whose template frequency distribution is unusual." Normal HDFS blocks follow a predictable lifecycle: `Receiving block` → `PacketResponder terminating` → `Received block`. Anomalous blocks break this pattern — they show `IOException`, `WARN`, or `ERROR` templates that never appear in normal operations.

Isolation Forest on these template histograms gets perfect precision and recall on the small curated sample (F1 = 1.0 at contamination=0.15). On the full HDFS dataset — 11.2M lines, 575K blocks, 16,838 anomalies — it achieves F1=0.642, Precision=0.688, Recall=0.601. The degradation is expected: the model needs enough blocks to learn a meaningful normal distribution, and some anomalous blocks look structurally similar to normal ones at the template frequency level. Sequence-aware features would close that gap.

## The LLM layer

The prompt design went through three iterations.

**V1: Raw dump.** I sent the raw log lines to the model with "explain what happened." The output was verbose, generic, and hard to parse.

**V2: Template-only.** I sent just the extracted templates and anomaly scores. The output was too abstract — the model had no specific block IDs or error messages to reference.

**V3: Full context with chain-of-thought.** The final version sends the incident as a structured prompt: time range, block IDs, anomaly scores, up to 50 raw log lines, and the extracted templates. The system prompt enforces a strict JSON schema. The user prompt asks the model to reason step by step: identify patterns, compare to normal operations, determine root cause, assess severity, suggest remediation.

Here's what the model produces for a real incident:

```json
{
  "severity": "high",
  "explanation": "A block transfer operation failed due to a network connection being reset by the remote peer.",
  "root_cause": "Network instability or resource exhaustion on the remote DataNode caused the TCP connection to be reset during block transfer.",
  "remediation": [
    {"action": "Check network connectivity between DataNodes", "priority": "immediate"},
    {"action": "Verify block replication factor", "priority": "immediate"},
    {"action": "Review DataNode heap and thread dumps", "priority": "short-term"}
  ],
  "confidence": 0.85
}
```

## Evaluating LLM output

This is the hardest part, and the part I think matters most.

You can't compute F1 on natural language. So I built a rubric-based evaluation using LLM-as-judge. A second model call scores the first on three dimensions, each 1-5:

- **Relevance:** Does the explanation match what the logs actually show?
- **Specificity:** Is this specific to THIS incident, or generic advice?
- **Actionability:** Can an engineer act on the remediation steps?

The judge sees both the original logs and the generated explanation, so it can verify whether the explanation is grounded.

Every eval run also tracks token counts, latency, and estimated cost. For 3 incidents on the sample dataset, summarization costs about $0.004 and takes 4-10 seconds end to end.

## What I'd do differently

**Streaming responses.** The current implementation blocks until the full JSON response is complete. For a real-time dashboard, you'd want to stream partial results.

**Better clustering.** DBSCAN on template frequency vectors is a blunt instrument. A vector store with embeddings of the log sequences would capture semantic similarity between incidents.

**Temporal features.** The current feature vector is a bag of template counts. Sequence-aware features (template transition probabilities, time deltas) would catch slow-burn anomalies that frequency alone misses. This is the clearest path to improving recall beyond 0.6.

**Integration with real infrastructure.** A production version would consume from Fluent Bit or an OTEL collector, maintain persistent template state, and push summaries to PagerDuty or Slack.

Since writing this, I've added multi-format log parsing (HDFS, OpenSSH, syslog, generic heuristic fallback), Drain3 template persistence across restarts, and a log replayer that streams any file through the detection pipeline at configurable speed with tumbling-window detection. The architecture is now closer to something you'd actually deploy.

---

Repository: [github.com/mister-raggs/flare](https://github.com/mister-raggs/flare)
