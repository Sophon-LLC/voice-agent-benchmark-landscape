# Voice Agent Benchmark Landscape

An open, structured map of public benchmarks for voice agents, spoken assistants, speech-enabled tool use, computer action, ASR, and meeting understanding.

The landscape exists because “voice agent evaluation” currently covers several different problems that are easy to conflate. A benchmark may test speech recognition without testing task completion, or test tool calls without testing a live spoken interaction. This project makes those boundaries explicit.

> Status: landscape, not leaderboard. Facts were last verified on 2026-09-01 from the maintainers' public repositories, dataset cards, and papers. Inclusion does not imply endorsement.

## At a glance

| Benchmark | Primary focus | Spoken input | Spoken output | Multi-turn | Tool use | Goal completion | Computer/browser action | Meeting/long-form |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| [VoiceAgentBench](https://github.com/ola-krutrim/VoiceAgentBench) | Speech-based tool tasks and safety | Yes | No | Yes | Yes | Partial | No | No |
| [EVA](https://github.com/ServiceNow/eva) | End-to-end conversational voice-agent accuracy and experience | Yes | Yes | Yes | Yes | Yes | No | No |
| [VoiceAssistant-Eval](https://github.com/mathllm/VoiceAssistant-Eval) | General voice-assistant listening, speaking, viewing, and safety | Yes | Yes | Yes | No | No | No | No |
| [VoiceComputerBench / TalkAct](https://github.com/19PINE-AI/TalkAct) | Real-time voice conversation plus browser action | Yes | Yes | Yes | Yes | Yes | Yes | No |
| [tau2-bench / tau-Voice](https://github.com/sierra-research/tau2-bench) | Tool-agent-user interaction in real-world domains | Yes | Yes | Yes | Yes | Yes | No | No |
| [OpenBench](https://github.com/argmaxinc/OpenBench) | Reproducible ASR, diarization, and streaming benchmarks | Yes | No | No | No | No | No | Yes |
| [mu-bench](https://github.com/sierra-research/mu-bench) | Multilingual customer-service ASR | Yes | No | No | No | No | No | No |
| [ELITR-Bench](https://github.com/utter-project/ELITR-Bench) | Long-context LLM evaluation on meeting transcripts | No | No | Yes | No | Partial | No | Yes |
| [Audio Agent Bench Suite](https://huggingface.co/datasets/arcada-labs/audio-agent-bench-suite) | Multi-turn spoken-agent benchmark collection | Yes | Partial | Yes | Yes | Partial | No | No |

“Partial” means the capability appears in part of the suite or is evaluated indirectly. It does not mean weaker performance.

## What is still under-measured

The public landscape is strongest in conversational customer service, spoken tool selection, and ASR. It is much thinner at the intersection of:

- continuous desktop voice typing in arbitrary applications;
- long-form meeting transcription and structured notes;
- cross-application computer action;
- confirmation, reversibility, and side-effect safety;
- a single evaluation that connects transcription quality to successful user outcomes.

That gap is a useful research direction, not a claim that any existing benchmark is deficient. Each project was designed for a different evaluation question.

## Data

The machine-readable source is [`data/benchmarks.jsonl`](data/benchmarks.jsonl). Each row records capability coverage, public assets, licenses, and evidence notes. The values are intentionally conservative:

- `yes`: explicitly supported or evaluated by the public source;
- `no`: explicitly outside the published scope or not present in the available evaluation;
- `partial`: supported by only part of the suite or evaluated indirectly;
- `unclear`: the public material was insufficient to classify confidently.

Run the validator with:

```bash
npm run check
```

## Inclusion criteria

A project is included when it has a public benchmark, evaluation framework, or dataset and directly addresses at least one of these areas: spoken interaction, speech-to-tool behavior, voice-computer interaction, meeting understanding, streaming transcription, or voice-agent safety.

The list is deliberately not a catalog of commercial voice-agent products. It also excludes private evaluations that cannot be inspected.

## Contributing

Corrections and additions are welcome. Please include a first-party source and identify the exact field that should change. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Maintainer

Maintained by [Sophon LLC](https://github.com/Sophon-LLC), makers of [Cue](https://heycue.io) — a desktop voice agent for voice typing, meeting transcription, and cross-app action. Free to start + Cue Plus $19.99/month.

This repository is an independent landscape maintained for the community. Cue is not ranked against the listed benchmarks, and no benchmark owner has sponsored inclusion.

## License

MIT. See [`LICENSE`](LICENSE).
