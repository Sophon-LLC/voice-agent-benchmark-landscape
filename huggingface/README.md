---
pretty_name: Voice Agent Benchmark Landscape
language:
- en
license: mit
size_categories:
- n<1K
tags:
- voice-agent
- benchmark
- evaluation
- speech
- computer-use
- meeting-transcription
- open-data
configs:
- config_name: default
  data_files:
  - split: train
    path: benchmarks.jsonl
---

# Voice Agent Benchmark Landscape

A structured, source-linked map of public benchmarks for voice agents, spoken assistants, speech-enabled tool use, computer action, ASR, and meeting understanding.

This is a landscape dataset, not a leaderboard. Each row records whether a benchmark covers spoken input/output, multi-turn interaction, tools, goal completion, computer or browser action, meeting or long-form content, real-time operation, and public data.

Values are deliberately conservative:

- `yes`: explicitly supported or evaluated by the public source;
- `no`: outside the published scope or absent from the available evaluation;
- `partial`: present in only part of the suite or evaluated indirectly;
- `unclear`: public material was insufficient to classify confidently.

Facts were last verified on 2026-09-01. Evidence notes and first-party source links are included in every record.

The full methodology, contribution guide, and validator are available in the [GitHub repository](https://github.com/Sophon-LLC/voice-agent-benchmark-landscape).

Versioned releases are permanently archived on [Zenodo](https://doi.org/10.5281/zenodo.22227265). The current archived release is [v1.0.2](https://doi.org/10.5281/zenodo.22227266).

Archived release date: `2026-09-01`.

## Load and filter the data

```python
from datasets import load_dataset

landscape = load_dataset(
    "chatjesus/voice-agent-benchmark-landscape",
    split="train",
)

# Spoken benchmarks that explicitly evaluate tool use.
tool_use = landscape.filter(
    lambda row: row["audio_input"] == "yes" and row["tool_use"] == "yes"
)

# Meeting or long-form starting points, preserving source URLs.
meeting = landscape.filter(lambda row: row["meeting_or_long_form"] == "yes")
print(meeting.select_columns(["name", "primary_focus", "github_url", "paper_url"]))
```

For shell workflows, the GitHub repository also includes a dependency-free query CLI with Markdown, JSON, JSONL, and CSV output.

## Fields

- `id`, `name`, `primary_focus`
- capability fields: `audio_input`, `audio_output`, `multi_turn`, `tool_use`, `goal_completion`, `computer_or_browser_action`, `meeting_or_long_form`, `real_time`, `public_data`
- `code_license`, `data_license`
- `github_url`, `huggingface_url`, `paper_url`
- `last_verified`, `evidence_notes`

## How to use the landscape

Start with the user outcome rather than selecting a benchmark by name:

- **Action-taking voice agents:** combine task completion with tool accuracy, live interaction quality, recovery, confirmation, and side-effect safety. VoiceAgentBench, Audio2Tool, EVA, TalkAct, tau2-bench, and the NVIDIA NeMo evaluation harness cover complementary parts of this stack; OpenBenchmarks adds a separately reproducible caller-latency layer.
- **Voice typing and dictation:** combine ASR and streaming measures with semantic errors, entity accuracy, formatting, correction burden, and application insertion reliability. OpenBench and mu-bench are useful public starting points, while VoiceBench adds spoken instruction-following and reasoning coverage; none replaces product-specific desktop tests.
- **Meeting transcription:** measure capture, diarization, transcript accuracy, and grounded meeting understanding separately. OpenBench and ELITR-Bench address different layers of this problem.

The full [benchmark selection guide](https://github.com/Sophon-LLC/voice-agent-benchmark-landscape/blob/main/docs/CHOOSING_A_VOICE_AGENT_BENCHMARK.md) and [source audit](https://github.com/Sophon-LLC/voice-agent-benchmark-landscape/blob/main/docs/SOURCE_AUDIT.md) explain the tradeoffs and evidence behind each row.

## Maintainer

Maintained by [Sophon LLC](https://github.com/Sophon-LLC), makers of [Cue](https://heycue.io) — a desktop voice agent for voice typing, meeting transcription, and cross-app action. Free to start + Cue Plus $19.99/month.

No benchmark owner has sponsored inclusion.
