# Source Audit

This document records the first-party sources used for the landscape snapshot dated 2026-09-01. It exists to make corrections reviewable and to distinguish project-level code licenses from dataset licenses.

The audit confirms what maintainers publicly document. It is not legal advice and does not replace reading the complete license before reuse.

| Record | First-party capability evidence | License evidence | Audit note |
|---|---|---|---|
| VoiceAgentBench | [Repository](https://github.com/ola-krutrim/VoiceAgentBench), [dataset card](https://huggingface.co/datasets/krutrim-ai-labs/VoiceAgentBench), [paper](https://arxiv.org/abs/2510.07978) | [Code license](https://github.com/ola-krutrim/VoiceAgentBench/blob/main/LICENSE.md), [dataset license](https://huggingface.co/datasets/krutrim-ai-labs/VoiceAgentBench/blob/main/LICENSE.md) | Code and data use the Krutrim Community License Agreement 1.0, which is not an OSI open-source license and restricts commercial use. |
| EVA | [Repository](https://github.com/ServiceNow/eva) | [MIT license](https://github.com/ServiceNow/eva/blob/main/LICENSE) | The repository includes scenarios and framework code under the root MIT license. |
| VoiceAssistant-Eval | [Repository](https://github.com/mathllm/VoiceAssistant-Eval), [dataset card](https://huggingface.co/datasets/MathLLMs/VoiceAssistant-Eval), [paper](https://arxiv.org/abs/2509.22651) | [Dataset metadata](https://huggingface.co/datasets/MathLLMs/VoiceAssistant-Eval) | The dataset declares MIT. The GitHub repository did not expose a standalone code license in the reviewed root, so code is recorded as `not stated`. |
| VoiceComputerBench / TalkAct | [Repository](https://github.com/19PINE-AI/TalkAct), [paper](https://github.com/19PINE-AI/TalkAct/blob/main/paper/paper_arxiv.pdf) | [MIT license](https://github.com/19PINE-AI/TalkAct/blob/main/LICENSE) | The public repository contains the system, hermetic task sites, benchmark assets, and MIT license. |
| tau2-bench / tau-Voice | [Repository](https://github.com/sierra-research/tau2-bench), [paper](https://arxiv.org/abs/2603.13686) | [MIT license](https://github.com/sierra-research/tau2-bench/blob/main/LICENSE) | The framework documents text half-duplex and voice full-duplex evaluation under the repository license. |
| OpenBench | [Repository](https://github.com/argmaxinc/OpenBench) | [MIT code license](https://github.com/argmaxinc/OpenBench/blob/main/LICENSE) | Code is MIT; upstream datasets retain their own licenses and access restrictions, so data is recorded as `varies`. |
| mu-bench | [Repository](https://github.com/sierra-research/mu-bench), [dataset card](https://huggingface.co/datasets/sierra-research/mu-bench) | [Dual-license file](https://github.com/sierra-research/mu-bench/blob/main/LICENSE) | Code is Apache-2.0. Data is CC BY-NC 4.0 and gated on Hugging Face. |
| ELITR-Bench | [Repository](https://github.com/utter-project/ELITR-Bench), [paper](https://arxiv.org/abs/2403.20262) | [Code license](https://github.com/utter-project/ELITR-Bench/blob/main/LICENSE-CODE.txt), [data license](https://github.com/utter-project/ELITR-Bench/blob/main/LICENSE-DATA.txt) | Main code uses three-clause BSD-style terms; the file also carries Apache-2.0 notices for specified third-party files. Data is CC BY 4.0. |
| Audio Agent Bench Suite | [Dataset card](https://huggingface.co/datasets/arcada-labs/audio-agent-bench-suite) | [CC BY 4.0 metadata](https://huggingface.co/datasets/arcada-labs/audio-agent-bench-suite) | The suite card links six child datasets, but the suite repository itself exposed only its card at review time. Spoken-output scoring and real-time operation were not sufficiently documented, so those fields remain `unclear`. |

## Review checks

- Every row has at least one first-party source.
- Capability values use only `yes`, `no`, `partial`, or `unclear`.
- `partial` describes indirect or subset coverage, not product quality.
- Project code and upstream dataset licenses are recorded separately.
- Negative classifications mean the capability is outside the published evaluation scope or absent from the inspected public materials; they do not claim that the project could never support it.
- All referenced URLs returned HTTP 200 during the 2026-09-01 review.

Corrections should identify the exact row, field, proposed value, and a first-party source. See [`CONTRIBUTING.md`](../CONTRIBUTING.md).
