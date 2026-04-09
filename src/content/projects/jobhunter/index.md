---
title: "JobHunter"
description: "Automated job scraper that monitors 13 companies every 30 minutes, deduplicates postings in SQLite, and emails new listings via Resend API — deployed on a DigitalOcean VPS with a live dashboard."
date: "Apr 9 2026"
demoURL: "http://167.172.216.126"
repoURL: "https://github.com/mister-raggs/JobHunter"
tags: ["Python", "SQLite", "SQLAlchemy", "Web Scraping", "DigitalOcean"]
---

## Overview

JobHunter runs on a DigitalOcean VPS and checks 13 target companies for new job postings every 30 minutes between 6am–8pm PST. New listings are deduplicated against a local SQLite database and emailed immediately via the Resend API. A live dashboard updates with each run, showing per-company job counts and all tracked postings — with a built-in 30-minute delay so email always delivers first.

## Key Features

- **Multi-scraper architecture**: Supports 7 scraper types (Greenhouse, Ashby, Eightfold, Phenom, Apple, Qualcomm, Uber) covering 13 companies
- **Early-exit pagination**: Stops fetching mid-page as soon as a known job ID is encountered, cutting unnecessary network requests on repeat runs
- **SQLite deduplication**: `notified` column tracks email state — jobs that fail to send are automatically retried next run
- **Resend API email**: HTML digest of new postings; avoids DigitalOcean's SMTP block by using HTTPS
- **Structured logging + per-run metrics**: Logs duration, fetch count, new count, and errors per company to stdout and a persistent log file
- **Live dashboard**: Static HTML report regenerated each cron cycle, served via nginx — shows stat cards per company and a full job table

## Architecture

```
cron (*/30 6-20 PST) → fetch_jobs() [early-exit pagination]
                      → SQLite dedup → Resend email
                      → generate_report() → nginx → live URL
```

## Tech Stack

Python 3.13 · SQLAlchemy · SQLite · Resend API · nginx · DigitalOcean · pytest