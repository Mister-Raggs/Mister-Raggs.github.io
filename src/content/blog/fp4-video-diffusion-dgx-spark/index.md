---
title: "231s to 192s: 4-bit video diffusion on a $3,000 desktop"
description: "Quantizing a video model's linear layers to 4-bit cut a 1080p generation by 39 seconds — and did nothing at all on the next two models I tried it on. The gap is the interesting part."
date: "Aug 23 2026"
draft: false
---

## The question

A DGX Spark is a Blackwell desktop: 128 GB of unified memory, roughly $3,000. The spec sheet says it supports FP4. But "supports" and "benefits from" are very different claims, and I wanted to know which one was true for video generation.

So I ran the simplest experiment I could think of. Generate a 1080p clip with LTX-2. Generate it again with the model's linear layers quantized to 4-bit. Change nothing else.

End to end, 231 seconds became 192.

That's a real win. It's also the least interesting thing I learned.

## The part that surprised me

I quantized the linear layers of two other models the same way, expecting roughly the same result. On Wan-2.1 it was break-even. On Cosmos-2.5 it came out at −1.1%, which is indistinguishable from noise.

Same technique, same hardware, same kernel, three different verdicts. Why?

Because "is 4-bit faster" was never the right question. The real one is: how much of the work are you actually quantizing? LTX-2 works on comparatively short sequences, so its linear layers are where the time actually goes. Cosmos-2.5 runs sequences around 31k tokens long, and attention cost grows with the square of that — about 95% of its step. Speeding up its linear layers couldn't have helped no matter how good the kernel was.

I could have worked that out from the FLOP budget before writing a line of code. I didn't. That's the part I actually kept.

## Where the time went

For the curious, the full breakdown — LTX-2.3-distilled, 1088×1920, 121 frames, five measured runs after two warmups:

| Stage | bf16 | 4-bit | Δ |
|---|---|---|---|
| Base denoising | 61.97 s | 44.17 s | −28.7% |
| Refine denoising | 109.29 s | 86.59 s | −20.8% |
| **Total denoise** | **171.26 s** | **130.76 s** | **−23.7%** |
| Upsample + VAE decode | 53.4 s | 54.4 s | +1.0 s (noise) |

The VAE decode isn't quantized and barely moves, which is the sanity check I care about most. The savings show up exactly where the change was applied, and nowhere else.

## Did the quality survive?

4-bit is lossy, so the speed number means nothing on its own. Left is the baseline, right is 4-bit, same prompt and same seed:

<video src="/media/ltx2-fp4/compare.mp4" poster="/media/ltx2-fp4/poster.jpg" controls loop muted playsinline preload="metadata" style="width:100%;height:auto;border-radius:6px;"></video>

Watch them for a second and you'll notice they aren't the same video — the cookies are stacked differently. That isn't damage. A few-step sampler is sensitive enough that any small numerical nudge lands it on a different, equally valid output.

<img src="/media/ltx2-fp4/still_040.jpg" alt="The same frame index from each run, side by side" style="width:100%;height:auto;border-radius:6px;" />

Which is what makes the obvious metric useless here. SSIM against the baseline scores 0.79, which sounds alarming until you remember what SSIM does: it compares pixels at fixed positions. A cookie that landed slightly to the left reads as damage. The metric genuinely cannot tell "different" from "worse."

Sharpness statistics set the same trap one level down. The 4-bit clip measures noticeably "less sharp" — until you zoom into the background and see why:

<img src="/media/ltx2-fp4/still_crop.jpg" alt="Magnified crop of the static background wall from each run" style="width:100%;height:auto;border-radius:6px;" />

The paint speckle on the back wall is in different places in the two runs. Different samples simply contain different amounts of fine detail, and any sharpness proxy will happily report that as a quality gap.

So the claim I'll defend is a narrow one: no visible quality loss on this clip. Not "identical," which would be false.

## What I got wrong

My first writeup of this said the speedup was *smaller* at 1080p than at lower resolution, and explained it with a tidy story about attention taking over at higher resolutions.

Both numbers in that comparison were real measurements. They were also both from the same run — I'd compared one stage against another and labelled it as two resolutions. Against the actual lower-resolution run, the trend goes the other way: the win *grows* as resolution goes up.

The irritating part is that I'd predicted that correctly in my notes beforehand. The explanation was tidy enough that I never checked it against my own data.

## Caveats

- One machine, one prompt, one observer on the quality call.
- Attention stays in full precision throughout — this only touches linear layers.
- `torch.compile` is off, to isolate the effect. A compiled baseline would likely narrow the gap.
- The comparison against lower resolution isn't a controlled sweep; frame count and step schedule differ too. It shows a direction, not a scaling law.

---

The benchmark harness and full numbers are in [hao-ai-lab/FastVideo#1594](https://github.com/hao-ai-lab/FastVideo/pull/1594).
