---
company: "Hao AI Lab, UC San Diego"
role: "Student Researcher"
dateStart: "01/01/2026"
dateEnd: "Present"
tags: ["Python", "PyTorch", "Diffusers", "LoRA", "Observability"]
---

- Built a clean-room model-agnostic adaptive caching module for video-diffusion inference (residual-skip heuristic, no per-model adapters) — **22-47%** latency reduction on Wan2.1 across an SSIM **0.875–0.946** quality frontier; runs on Wan2.2 MoE where the per-model baseline crashes.
- Audited an LLM-agent GPU profiler's **34** skills against ground-truth Nsight Systems traces (H100 + L40S workloads), landing **2** maintainer-confirmed upstream bug fixes.
- First software port of FastVideo to NVIDIA's DGX Spark (GB10/Blackwell): **4** models running, full **4-bit (FP4)** inference enabled (**−24%** LTX2 denoise at 1080p, cos **~0.98** attn vs bf16), sampling-preset fix (sharpness **92→431**) and VAE bf16 flip shipped upstream.
- Cut Cosmos 2.5 inference latency **15.6%** on A100 by quantizing decoded frames on-GPU before a 500MB device-to-host transfer; output-identical (SSIM=1.0), cross-validated on H100/Wan.