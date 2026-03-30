---
title: "LLM Fine-tuning for Patient Routing"
description: "Clinical decision support system using BioBERT fine-tuning with AWS Bedrock and FastAPI. Achieved 91.6% accuracy across 1,000+ assessments with optimized inference."
date: "Sep 10 2025"
demoURL: "https://ieeexplore.ieee.org/document/11252667"
tags: ["Python", "FastAPI", "AWS", "LLM Pipelines", "LLM Evaluation", "PyTorch"]
---

## Overview

Application of fine-tuned large language models for healthcare decision support. Using BioBERT as the base model, this project developed an intelligent patient routing system that classifies patient cases with high accuracy — fast enough to be practical in a clinical workflow.

## Key Achievements

- **91.6% accuracy** on 1,000+ test assessments
- **Inference optimization**: Reduced latency from 16s to 5s per request
- **Production-ready**: Deployed on AWS Bedrock with FastAPI
- **Published**: IEEE paper

## Why This Project

Triage decisions in clinical settings often depend on information buried in unstructured notes. The question this work tried to answer was whether a fine-tuned model could reduce that gap in a way that was fast enough to be practical — the 16s → 5s inference work came directly from that constraint.

## Technologies

BioBERT · AWS Bedrock · FastAPI · PyTorch
