---
title: "One Scene, Three Futures"
description: "Branching video generation on one B200 — three five-second futures from a single frame in 7.37 s, a choose-and-continue loop, and a measured line between generating fast and generating what was asked."
date: "Sep 27 2026"
tags: ["Python", "PyTorch", "Diffusers", "Observability"]
---

## The question

Video models are getting fast enough that a clip doesn't have to be a finished artifact — it can be a *move*. Pause at a frame, generate several possible next scenes, let someone choose one, and continue from where it ended. That's the core loop of an interactive world model, and I wanted to know how much of it already works on open weights.

I split it into two questions that are easy to blur together:

1. **Systems** — can one GPU generate every branch at once, fast enough to feel interactive?
2. **Control** — do the branches actually show the futures that were asked for?

## What I built

A branching pipeline on [FastVideo](https://github.com/hao-ai-lab/FastVideo) with LTX-2.3 Distilled:

- **Batched fork.** All three branches share one conditioning frame and seed and differ only in their action prompt, so they run as a single B=3 forward pass instead of three sequential generations.
- **Continuation state.** Each branch keeps its last nine frames. Choosing a branch makes that tail — not the original still — the input for the next fork, so the story carries its own history.
- **Choose-and-continue loop.** A local interface plays the three futures, takes a choice, and generates the next three-way fork from the selected branch.
- **A receipt for every run.** Pinned model revision, shapes, seeds, per-stage timings, GPU memory sampled every 250 ms, and hashes of the continuation frames. Every number on this page traces back to a JSON file, and the visual pass criteria were declared before generating.

## Results

**Systems: passed.** A warmed 512×768×121 BF16 run produced three five-second clips in **7.37 s to frames-ready** — roughly 15 seconds of video in half that time — at a sampled **~110 GiB** peak on a 179 GiB B200. A continuation fork from saved tail frames dropped from **15.9 s** to **8.4 s** once warm, with bit-identical outputs. (Warm numbers exclude model load and saving.)

**Control: split.** In a neutral studio scene, jump, crouch, and turn came out visibly distinct. Route choices didn't hold: a robot asked to take the left or right gate drifted to the center, and that miss reproduced with three separate unbatched generations — so batching isn't the cause. A moving-obstacle test, meant to give the choices real stakes, failed its contact criteria in every branch.

The finding I keep coming back to: **latency, visual quality, and control are three separate measurements**, and right now the fastest part of the stack is the smallest part of the problem.

## Where this goes

The goal is a live branching world: an obstacle approaches, three actions appear at once, a crowd votes, and the next fork starts from the resulting state — a shared, generated game that lasts as long as the audience keeps choosing well. Getting there is three problems, in order:

1. **Event control.** One obstacle has to follow a coherent trajectory in every branch and reach the actor on time. Next up: a matched B=1 obstacle diagnostic, then held-out scenes and seeds scored against predeclared trajectory and contact criteria. If text plus a first frame can't clear that bar, keyframes or motion conditioning come next.
2. **An authoritative world state.** Video tails carry appearance, not physics. A small deterministic simulator could own positions, timing, and collisions while the model renders the outcome — the simulator as referee, the model as renderer.
3. **A bounded live service.** A warm worker generating the next fork after each choice, behind measured click-to-play latency, a queue with a concurrency limit, per-visitor quotas, and a hard spend cap.

Branching futures from a shared state and choosing between them is also the basic loop of planning with world models in robotics — which is why the control gap is the interesting result here, not an embarrassing one.

[Read the full experiment — clips, failures, and receipts →](/blog/one-scene-three-futures/)
