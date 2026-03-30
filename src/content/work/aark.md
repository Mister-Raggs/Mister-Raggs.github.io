---
company: "Aark Global"
role: "Software Developer, AI/ML"
dateStart: "04/01/2023"
dateEnd: "09/01/2024"
tags: ["Python", "Distributed Systems", "Elasticsearch", "SQL"]
---

Developed an async document ingestion pipeline processing 18,000+ pages/day, distributing tasks via Azure Queue Storage to a VM worker pool. Implemented a read/write routing layer during datastore migration — reads from Cosmos DB replicas, writes to MongoDB primary — maintaining sub-100ms P95 latency throughout cutover. Designed a full-text search pipeline ingesting scanned PDFs through OCR into indexed Elasticsearch documents, enabling sub-180ms query latency over previously unsearchable content.
