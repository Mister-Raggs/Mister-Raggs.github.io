---
title: "Building Flare: LLM-Powered Incident Detection on Real Log Data"
date: 2026-03-17T00:00:00-07:00
categories:
  - ai
tags:
  - observability
  - anomaly-detection
  - llm
  - aiops
  - python
author_profile: true
excerpt: "How I built an end-to-end log anomaly detection pipeline that combines classical ML with LLM summarization — and what I learned about evaluating LLM output in production-adjacent systems."
---

## The problem

An on-call engineer at a company running HDFS clusters might see 50,000 new log lines per minute during an incident. Most of them are noise — normal block transfers, routine replication confirmations, heartbeats. Buried in that stream are the three lines that actually matter: a connection reset, a failed block receive, a timeout that cascades into data loss.

The standard response is alerts on keyword matches and static thresholds. But keyword-based alerting doesn't scale. You either drown in false positives ("ERROR" appears in a stack trace that's actually handled) or miss the anomaly that doesn't contain any obvious keywords. The HDFS dataset from Loghub captures this reality: 11 million log lines, 575,000 blocks, with labeled anomalies that human operators identified after the fact.

I wanted to build a system that does what a good SRE does manually — parse the logs, identify the anomalous patterns, group related signals, and explain what happened — but faster and with an audit trail.

<!-- more -->

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

Isolation Forest on these template histograms gets perfect precision and recall on the sample dataset (F1 = 1.0 at contamination=0.15). That's partly because the sample is small and the anomalies are distinct. On the full HDFS dataset, you'd expect degradation — blocks that are "slow" rather than "broken" are harder to catch with frequency features alone. You'd want temporal features (time between events), sequence features (n-gram of template transitions), or embeddings.

But the baseline gives the LLM something real to work with. An Isolation Forest score of -0.23 doesn't mean much to a human. An LLM explanation grounded in the actual log lines does.

## The LLM layer

The prompt design went through three iterations.

**V1: Raw dump.** I sent the raw log lines to the model with "explain what happened." The output was verbose, generic, and hard to parse. It would say things like "there appears to be a network issue" without pointing at specific evidence.

**V2: Template-only.** I sent just the extracted templates and anomaly scores. The output was too abstract — the model had no specific block IDs or error messages to reference.

**V3: Full context with chain-of-thought.** The final version sends the incident as a structured prompt: time range, block IDs, anomaly scores, up to 50 raw log lines, and the extracted templates. The system prompt enforces a strict JSON schema. The user prompt asks the model to reason step by step: identify patterns, compare to normal operations, determine root cause, assess severity, suggest remediation.

Here's what the model sees and produces for a real incident:

**Input (truncated):**
```
Incident #0
Time Range: 081109 204005 to 081109 204007
Blocks: blk_-3544583377289625738
Anomaly Score: -0.2310

Log Lines:
  Receiving block blk_-3544583377289625738 src: /10.250.11.85
  WARN IOException in BlockReceiver for block blk_-3544583377289625738
  ERROR Exception in receiveBlock ... java.io.IOException: Connection reset
```

**Output:**
```json
{
  "severity": "high",
  "explanation": "A block transfer operation failed due to a network connection
    being reset by the remote peer. The DataXceiver thread encountered a
    java.io.IOException while receiving block data.",
  "root_cause": "Network instability or resource exhaustion on the remote
    DataNode caused the TCP connection to be reset during block transfer.",
  "remediation": [
    {"action": "Check network connectivity between DataNodes", "priority": "immediate"},
    {"action": "Verify block replication factor", "priority": "immediate"},
    {"action": "Review DataNode heap and thread dumps", "priority": "short-term"}
  ],
  "confidence": 0.85
}
```

The chain-of-thought matters here. Without it, the model tends to assign "medium" severity to everything. With it, it examines the evidence (IOException + connection reset + failed receive = data loss risk) and arrives at "high."

All outputs are validated against Pydantic schemas. If the model returns malformed JSON or a severity level that doesn't match the enum, it fails fast rather than silently passing garbage downstream.

## Evaluating LLM output

This is the hardest part, and the part I think matters most.

You can't compute F1 on natural language. The model might say "network instability caused the failure" and a human might say "the remote DataNode dropped the connection" — both are correct, but string matching says they're different. Traditional NLP metrics (BLEU, ROUGE) don't capture whether an explanation is actually useful to an on-call engineer.

So I built a rubric-based evaluation using LLM-as-judge. A second model call scores the first on three dimensions, each 1-5:

- **Relevance:** Does the explanation match what the logs actually show? A score of 1 means the explanation references things not in the log data. A 5 means every claim is grounded in specific log evidence.
- **Specificity:** Is this specific to THIS incident, or is it generic advice? "Check your logs for errors" is a 1. "The IOException on blk_-3544583377289625738 indicates a TCP reset during block receive" is a 5.
- **Actionability:** Can an engineer act on the remediation steps? "Fix the issue" is a 1. "Check network connectivity between 10.250.11.85 and the receiving DataNode, verify block replication factor" is a 5.

The judge sees both the original logs and the generated explanation, so it can verify whether the explanation is grounded.

Is this perfect? No. The judge model has its own biases — it tends to be generous with scores. With more time, I'd build a golden dataset of 50-100 human-scored explanations and calibrate the judge against those. I'd also track score distributions over time to catch model regression. But as a first-pass automated eval that runs in CI without human labeling, it works well enough to catch the failure modes that matter: generic responses, hallucinated root causes, and vague remediation.

Every eval run also tracks token counts, latency, and estimated cost. For 3 incidents on the sample dataset, summarization costs about $0.004 and takes 4-10 seconds end to end, including detection.

## What I'd do differently

**Streaming responses.** The current implementation blocks until the full JSON response is complete. For a real-time dashboard, you'd want to stream partial results — show the severity badge immediately while the remediation steps are still generating.

**Better clustering.** DBSCAN on template frequency vectors is a blunt instrument. A vector store with embeddings of the log sequences would capture semantic similarity between incidents, not just statistical similarity. You could also use it for retrieval: "show me the last time we saw an incident like this."

**Temporal features.** The current feature vector is a bag of template counts. It doesn't know that `Receiving block` should be followed by `PacketResponder terminating` within 2 seconds. Sequence-aware features (template transition probabilities, time deltas) would catch slow-burn anomalies that frequency alone misses.

**Integration with real infrastructure.** Flare reads files and API requests. A production version would consume from Fluent Bit or an OTEL collector, maintain persistent template state, and push summaries to PagerDuty or Slack.

## Links

- **Repository:** [github.com/mister-raggs/flare](https://github.com/mister-raggs/flare)
- **API docs:** Run `docker-compose up` and open `http://localhost:8000/docs`
- **Dashboard:** `http://localhost:8000/dashboard`

I built Flare because I wanted to understand the full loop: from raw signals to ML detection to LLM explanation to structured evaluation. If you work on observability tooling or have thoughts on evaluating LLM output in ops contexts, I'd be interested to hear from you — reach out on [LinkedIn](https://www.linkedin.com/in/raghavkachroo).
