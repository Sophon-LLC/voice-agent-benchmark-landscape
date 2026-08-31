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

## Fields

- `id`, `name`, `primary_focus`
- capability fields: `audio_input`, `audio_output`, `multi_turn`, `tool_use`, `goal_completion`, `computer_or_browser_action`, `meeting_or_long_form`, `real_time`, `public_data`
- `code_license`, `data_license`
- `github_url`, `huggingface_url`, `paper_url`
- `last_verified`, `evidence_notes`

## Maintainer

Maintained by [Sophon LLC](https://github.com/Sophon-LLC), makers of [Cue](https://heycue.io) — a desktop voice agent for voice typing, meeting transcription, and cross-app action. Free to start + Cue Plus $19.99/month.

No benchmark owner has sponsored inclusion.
