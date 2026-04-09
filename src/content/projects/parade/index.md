---
title: "Parade: VC-Funded Job Discovery Pipeline"
description: "Automated job discovery pipeline that monitors VC funding news, resolves companies via Clearbit with graceful degradation, scrapes careers pages across Lever/Greenhouse/Ashby, and delivers a daily digest of tech roles by email."
date: "Mar 01 2026"
repoURL: "https://github.com/Mister-Raggs/Parade"
tags: ["Python"]
---

## Overview

Parade is a personal job discovery pipeline built around a simple observation: newly funded companies hire fast, but by the time they show up on job boards, the early window is gone. Parade closes that gap by watching funding news in real time and surfacing relevant tech roles before they're widely listed.

The system runs as a five-stage pipeline: fetch funding announcements from RSS feeds, identify company websites, locate careers pages, scrape for tech roles, and send a filtered digest by email.

## How It Works

**Stage 1 — RSS Ingestion**
Fetches funding announcements from TechCrunch, Crunchbase, and VentureBeat within a configurable lookback window (default 24 hours).

**Stage 2 — Company Resolution**
Resolves each company's website by parsing the source article, then falling back to the Clearbit autocomplete API, then DuckDuckGo. Clearbit is monitored with a healthcheck that logs a degradation warning and falls back gracefully when unavailable. Resolution method and scraper type are logged per company for each run.

**Stage 3 — Careers Scraping**
Scrapes each careers page for open roles and filters by a configurable keyword list covering engineering, data, infrastructure, ML, and platform roles.

**Stage 4 — Email Rendering**
Renders a structured HTML and plain-text digest grouped by company, including funding context alongside each role listing.

**Stage 5 — Delivery**
Sends the digest via Gmail with a subject line summarizing how many funded companies are actively hiring and the total role count.

## Why I Built It

Job boards are reactive. By the time a company posts on LinkedIn or Greenhouse, they've often already made early hires through their network. Funding announcements are a leading signal — companies that just closed a round are actively building. Parade automates the part that would otherwise mean checking three news sites and clicking through careers pages every morning.

## Technologies

Python · feedparser · BeautifulSoup · Gmail SMTP · Jinja2
