---
company: "Hao AI Lab, UC San Diego"
role: "Student Researcher"
dateStart: "01/01/2026"
dateEnd: "Present"
tags: ["Python", "PyTorch"]
---

Built end-to-end LoRA and full fine-tuning support for Cosmos 2.5 in FastVideo — `Cosmos25TrainingPipeline` with flow-matching scheduler, 18-channel input, and Reason1 embeddings; 2000-step run converged to 0.067 loss. Traced silent training failures across the stack including LoRA injection failing due to `ReplicatedLinear` vs `nn.Linear`, VAE config overwriting by Wan-specific defaults, and hardcoded CFG dropout shape.
