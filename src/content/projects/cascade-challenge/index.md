---
title: "CASCADE: Driving Scenario Retrieval"
description: "Text-to-video retrieval for compositional driving scenarios, built for NVIDIA's CASCADE challenge: 0.243 to 0.434 R-Precision over five submissions, running offline on one A100 in under six hours."
date: "Nov 29 2026"
repoURL: "https://github.com/Mister-Raggs/cascade-scenario-retrieval"
tags: ["Python", "PyTorch", "LoRA", "Docker"]
---

The CASCADE challenge, run by NVIDIA for the NeurIPS 2026 World Models in Physical AI workshop, gives you dashcam clips and descriptions like *"A signaling bus turns left while an adult pedestrian walks."* For each description you rank the clips, and a clip only counts if every part of it is there. Everything runs inside a container you hand over, offline, on one A100 80 GB, within six hours.

My final entry scored **0.434 R-Precision**, up from **0.243** on my first, which was below the organizers' baseline of 0.264.

## What I built

- **Questions instead of similarity.** A regex parser breaks each query into small facts (95 atom types), and a LoRA-fine-tuned Qwen3.8-27B answers each one as a yes/no question about the clip. Together with two smaller additions, this was the biggest single step, +0.084.
- **Cheap questions.** The model never generates text. It reads the yes/no logit gap once, and each video is encoded once and its attention cache shared across all of its questions, so an extra question costs only its own few tokens.
- **A learned scorer and a sentence verifier.** A linear listwise scorer combines 25 signals per query-clip pair, and a second fine-tuned adapter checks the whole sentence on each query's top 50 candidates. It was trained on near misses, clips that have every fact but in the wrong order or on the wrong road user.
- **Fitting their box.** The portal had an undocumented size limit, so I cut the 27B model from 55.6 GB to 27.9 GB with per-row int8 weights and a two-row output layer, at a cost of 0.002 R-Precision. Every package was checked offline against the research code before upload.

## The finding I'd keep

My 711 development queries turned out to be only 64 scenarios, each phrased about 11 ways. Paraphrases of the same scenario score almost identically (correlation about 0.95), so my test could only detect gains of about 0.023, while every real improvement was between 0.005 and 0.017. Three ideas it rejected passed on all six cells once I switched to the validation queries, and they became the biggest gains in my final entry.

[Read the full write-up →](/blog/cascade-scenario-retrieval/)
