---
title: "One scene, three futures: the GPU kept up, but the choices did not always"
description: "I batched three five-second video futures from one frame on a B200, built a choice-and-continue interface, and found that fast generation and controllable outcomes are very different things."
date: "Sep 27 2026"
draft: false
---

I wanted a video to behave like a choice in a game: pause at one frame, generate three possible next scenes, let someone pick one, and continue from the chosen result.

The first engineering result was encouraging. From one image, I generated three separate five-second clips in a single batched call on one GPU. In a warmed studio run, the frames were ready in **7.37 seconds**. Then I asked a robot to take the right-hand path. It went left.

That contrast became the project. **Getting three videos quickly is not the same as getting three requested futures.**

## Two gates, not one

I built this in [FastVideo](https://github.com/hao-ai-lab/FastVideo) with LTX-2.3 Distilled. Each branch starts from the same image and seed; only its action prompt changes. The prototype batches all three branches into one model forward pass, saves separate MP4s, and retains the last nine frames of each as possible continuation state.

I kept two questions separate:

1. **Systems:** Can one GPU hold and generate B=3, and how long does that take?
2. **Control:** Do the three videos actually show the three different requested outcomes?

A receipt can answer the first question. It cannot answer the second.

For the main tests I used dense BF16, 512×768, 121 frames at 24 fps, eight denoising steps plus three refinement steps, and one B200. The warmed studio B=3 call took **7.37 seconds to frames-ready** and sampled **113,042 MiB** of GPU-wide memory on a **183,359 MiB** device. That is one measured workload, not a cold-start or click-to-play service latency. The clip saves, model load, and website delivery are additional costs.

[Studio run receipt](/media/three-futures/receipts/studio-b3.json)

## Where the choices failed

My first scene had a delivery robot approaching three routes. I requested forest, center, and coast futures from the same starting frame. The system generated three files, but the coast request often headed toward the wrong path. Making the route closer, writing more explicit steering instructions, trying different seeds, and doubling the clip duration did not make the three-way choice reliable in the tested scenes.

I tried a simpler visual target: three color-coded gates. The clip below uses **three separate B=1 generations**, not a batched run. The blue and green requests still converge toward the yellow center gate; yellow is the one that works. This matters because it shows that, for this scene, the miss does not require batching.

<video src="/media/three-futures/three-gates-b1-three-up.mp4" poster="/media/three-futures/gates-poster.jpg" controls muted playsinline preload="metadata" aria-label="Three separate robot clips requested to enter blue, yellow, and green gates; the blue and green choices miss their gates" style="width:100%;height:auto;border-radius:6px;"></video>

[Three-gate B=1 receipt](/media/three-futures/receipts/three-gates-b1.json)

The hypothesis is that the starting image's geometry and the model's motion prior can overpower the text instruction. That is **an inference**, not a diagnosed internal mechanism. I cannot turn a few failed scenes into a population-level claim about LTX-2.3.

## Where the choices worked

I switched to a neutral studio frame: one person in a red jacket, no route geometry, no moving prop. The three prompts asked for a jump, a crouch, and a turn in place. The three outputs were visibly distinct, and I accepted them on full-motion review against those action criteria.

<img src="/media/three-futures/studio-source.png" alt="The one neutral studio frame shared by the jump, crouch, and turn generations" style="width:100%;max-width:640px;height:auto;border-radius:6px;" />

<video src="/media/three-futures/studio-actions-three-up.mp4" poster="/media/three-futures/studio-poster.jpg" controls muted playsinline preload="metadata" aria-label="Three batched clips from one studio image: jump, crouch, and turn" style="width:100%;height:auto;border-radius:6px;"></video>

This is a positive control, not a universal pass rate. It tells me prompt-following is **task- and scene-dependent**: the same batching machinery that could not make the robot reliably choose a lane could separate these body actions in one scene and seed.

## Choosing a future and continuing it

The next step was a local choice-and-continue interface. I selected the **turn** branch, supplied three new prompts, and generated a second three-way fork from that branch's nine saved tail frames. The chosen history, not the original still, became the next input. The interface delivered the new clips and a joined playback of the selected path.

Here is the selected first clip followed by one of its newly generated continuations. Only **turn** was continued in this pilot; the unselected jump and crouch videos were retained as artifacts, not secretly generated into further storylines.

<video src="/media/three-futures/selected-turn.mp4" controls muted playsinline preload="metadata" aria-label="The selected first-stage turn branch" style="width:100%;height:auto;border-radius:6px;"></video>

<video src="/media/three-futures/turn-continuation-new.mp4" controls muted playsinline preload="metadata" aria-label="A new continuation generated from the selected turn branch's final nine frames" style="width:100%;height:auto;border-radius:6px;"></video>

That proves one end-to-end interaction worked locally. It does **not** prove that every continuation prompt was obeyed, or that a stranger could click and see the result in eight seconds. In a separate same-container timing test, two identical tail passes reached frames-ready in **15.88 seconds and then 8.35 seconds**; the saved outputs were bit-identical. Warmup changes the latency story, but those numbers still exclude cold start, transfer, save, and playback.

[Local continuation receipt](/media/three-futures/receipts/live-continuation.json) · [Same-container timing receipt](/media/three-futures/receipts/tail-warm-b3.json)

## The obstacle test that stopped the game idea

I then tried to give the choices stakes. One yellow padded cylinder starts in front of the person. It should roll through their standing position. Jump should clear it; crouch and turn should be blocked. The rule was fixed **before** generation, and the videos—not the prompt labels—had to show the result.

The actor performed different actions, but the shared physical event did not hold together. In the crouch and turn clips, the cylinder moves toward the camera and out of view instead of crossing the actor. Jump is the only branch where the interaction partly resembles the intended event, but it is not a clean, trustworthy crossing. I cannot assign a survival winner from these videos.

Jump:

<video src="/media/three-futures/obstacle-jump.mp4" poster="/media/three-futures/obstacle-poster.jpg" controls muted playsinline preload="metadata" aria-label="Jump branch of the obstacle test; the interaction is only partially legible" style="width:100%;height:auto;border-radius:6px;"></video>

Crouch and turn:

<video src="/media/three-futures/obstacle-crouch.mp4" controls muted playsinline preload="metadata" aria-label="Crouch branch of the obstacle test; the cylinder travels toward the camera and leaves view" style="width:100%;height:auto;border-radius:6px;"></video>

<video src="/media/three-futures/obstacle-turn.mp4" controls muted playsinline preload="metadata" aria-label="Turn branch of the obstacle test; the cylinder travels toward the camera and leaves view" style="width:100%;height:auto;border-radius:6px;"></video>

The obstacle run used the same B=3 model path but was **not** the warmed studio timing benchmark. Its one forward call took **27.98 seconds to frames-ready after model load**. Comparing 27.98 with 7.37 as if only the obstacle changed would be misleading: warmup conditions differ.

[Obstacle run receipt](/media/three-futures/receipts/obstacle-b3.json)

## What this project is—and is not

The technical result is a working batched fork and a working local selection-to-continuation path, paired with a clear semantic boundary. I can show someone three prerecorded futures on a static website. I cannot honestly call the obstacle version a physics game or let the model decide who survived.

If I pursue the obstacle question further, the discriminating test is narrow: rerun one failing branch at B=1 with the *identical* image, prompt, and seed. If it fails again, batching is not necessary for that failure; if it works, the batched path deserves a closer audit. After that, a guided/keyframed or externally simulated obstacle would be a **different interface**, and should be labeled as such.

## What the ideal version could become

The version I would like to build is a live, branching scene: an obstacle approaches, three actions appear together, viewers choose one, and the next three futures begin from the resulting state. A crowd could vote on which branch to continue and try to build the longest surviving streak. But the current clips are not yet trustworthy enough to make the video itself the referee.

There are three conditions for that experience:

1. **Reliable event control.** The same obstacle must keep a coherent trajectory in *every* branch and visibly reach the actor at the expected time. The next measurement is the matched B=1 obstacle diagnostic, followed by held-out scenes and seeds with predeclared trajectory and contact criteria. If text and a first frame cannot meet that bar, extra keyframes or motion controls might help—but then the experiment becomes a guided-video system, not free-form text control.
2. **An authoritative game state.** A video tail preserves appearance, but it does not tell a game engine where the cylinder is or whether a collision occurred. If model-only physical outcomes stay unreliable, a small deterministic simulator could own object positions, obstacle timing, and survival rules while the video model renders possible actions. That could still make a compelling interactive demo, provided we are explicit that the simulator—not the model—decides who survived.
3. **A bounded live service.** If the visual gate passes, a warm worker could generate the next fork after a choice. To put that behind this website, I would need measured click-to-play latency, a queue and concurrency limit, per-visitor quotas, expiring access codes, and a hard operator spend cap. GitHub Pages can host a prerecorded replay today; it cannot safely be the GPU service by itself.

A vote could choose which *already generated* branch to continue. That would measure audience preference, not whether the model followed its prompt. A useful research dataset would keep those two labels separate: what viewers wanted, and what independent reviewers actually saw.

The broader lesson for me is simple: **latency, visual quality, and control are different measurements.** A fast video is not automatically a useful action, and a convincing single clip is not automatically a reliable interactive system.

---

**Methods and limits:** LTX-2.3 Distilled revision `22b09fb1860a944bf10fa21f033d957d9ab9ec20`; one B200; dense BF16; 512×768×121 at 24 fps; 8+3 steps. The studio and obstacle runs use seed 22. Their run IDs are `pilot-20260926-studio-actions-b3-s22-1` and `pilot-20260927-obstacle-b3-s22-1`. The three-gate B=1 run is `pilot-20260925-three-gates-b1-s22-1`. These are selected diagnostic scenes, not a blinded multi-scene evaluation. All conclusions about visual adherence are limited to the reviewed clips; no general model success rate is claimed.
