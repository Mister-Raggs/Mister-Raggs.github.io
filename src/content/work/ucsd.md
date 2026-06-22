---
company: "Hao AI Lab, UC San Diego"
role: "Student Researcher"
dateStart: "01/01/2026"
dateEnd: "Present"
tags: ["Python", "PyTorch", "Diffusers", "LoRA", "Observability"]
---

- Bringing FastVideo (open-source video-diffusion framework) up on NVIDIA's DGX Spark (GB10/Blackwell, 128GB unified memory) — **first software port**. Catalogued 4 models with measured bottleneck profiles, built FlashAttention-2 from source for the new arch, shipped sampling-preset + VAE-precision fixes (~20% decode speedup at SSIM=0.9999).
- Reopened a documented NVFP4 (4-bit quantization) dead-end on Blackwell — a minimal `ptxas` probe proved the block-scaled MMA instructions assemble + run under CUDA 13 (prior block was a toolchain artifact, not silicon); narrowed the remaining kernel issue to a scale-factor register-layout difference vs. the previous Blackwell generation.
- Cut Cosmos 2.5 inference latency by **15.6%** end-to-end on A100 using Nsight Systems (`nsys`) traces — diagnosed that a "slow stage" was absorbing a deferred half-gigabyte GPU→CPU transfer; fix casts frames to 8-bit on the GPU before the copy. Cross-validated on a second GPU/model, output-identical (SSIM=1.0).
- Surfaced a **24%** torch.compile speedup that was off-by-default and undocumented; built a warmup-correct A/B harness, eliminated a default-on graph break, and shipped FlashAttention as a traceable custom op with full backward registration — enables graph-capture and training-under-compile.
- Audited an LLM-agent-based GPU profiler against ground-truth `nsys` traces on kernel-bound (H100) and comm-bound (L40S) workloads — shipped two maintainer-confirmed bug fixes upstream; retracted three of my own would-be-false claims pre-filing via re-runs and source checks.
