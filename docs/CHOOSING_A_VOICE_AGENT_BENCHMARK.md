# Choosing a Voice Agent Benchmark

“Voice AI” is not one evaluation problem. A useful benchmark plan starts with the user outcome, then adds the speech and interaction checks that can explain failures.

This guide separates three common product directions: voice agents that take action, voice typing systems, and meeting transcription assistants. It is a practical starting point, not a substitute for product-specific evaluation.

## 1. Voice agents that take action

Use this track when the system converses with a user, calls tools, changes state, or operates software.

The core outcome metric should be successful task completion. Speech recognition, tool selection, argument accuracy, latency, recovery, and confirmation behavior are diagnostic layers around that outcome.

| Evaluation need | Useful public starting point | What it contributes |
|---|---|---|
| Spoken tool selection and structured arguments | [VoiceAgentBench](https://github.com/ola-krutrim/VoiceAgentBench) | Audio-backed tool-call tasks, multi-step orchestration, multi-turn context, and refusal behavior |
| Complete live voice-agent conversations | [EVA](https://github.com/ServiceNow/eva) | Task accuracy and interaction-experience scoring across end-to-end spoken conversations |
| Voice plus browser action | [VoiceComputerBench / TalkAct](https://github.com/19PINE-AI/TalkAct) | Real-time phone interaction coupled to Playwright-based browser tasks |
| Dynamic user-agent-tool interaction | [tau2-bench / tau-Voice](https://github.com/sierra-research/tau2-bench) | Domain task success, tools, simulated users, and full-duplex voice evaluation |

Recommended product-specific additions:

- side-effect safety: confirmation before irreversible actions;
- recovery: correction after a misunderstood entity, date, or instruction;
- reversibility: whether an action can be inspected and undone;
- cross-application continuity: whether context survives transitions between apps;
- end-to-end latency: from end of speech to visible, correct progress;
- truthful completion: the agent must not claim success before the target state is verified.

Do not use tool-call accuracy alone as a proxy for task completion. A syntactically correct call can still modify the wrong object, fail downstream, or leave the user without a recoverable result.

## 2. Voice typing and dictation

Use this track when the primary job is turning speech into editable text inside arbitrary applications.

Word error rate is necessary but not sufficient. Users experience the complete editing burden: punctuation, formatting, names, numbers, code-switching, latency, insertion position, and the number of corrections needed before the text is usable.

| Evaluation need | Useful public starting point | What it contributes |
|---|---|---|
| Reproducible ASR and streaming tests | [OpenBench](https://github.com/argmaxinc/OpenBench) | Transcription pipelines, streaming measurements, datasets, and reproducible infrastructure |
| Multilingual customer-service speech | [mu-bench](https://github.com/sierra-research/mu-bench) | Real 8 kHz utterances across five locales with WER, semantic error, and latency-oriented evaluation |
| Broad audio understanding and spoken response quality | [VoiceAssistant-Eval](https://github.com/mathllm/VoiceAssistant-Eval) | Listening, speaking, robustness, multi-turn, and multimodal tasks; useful as an adjacent capability suite |

A practical voice-typing scorecard should include:

1. normalized WER or character error rate;
2. semantic error rate for meaning-changing mistakes;
3. entity accuracy for names, numbers, dates, URLs, and product terms;
4. punctuation and formatting correctness;
5. first-token and finalization latency;
6. correction burden, measured as user edits per accepted word;
7. application compatibility and insertion reliability;
8. multilingual and code-switching coverage.

No benchmark in this landscape fully measures continuous desktop dictation inside arbitrary applications. A product team should therefore combine a public ASR baseline with a private, consented corpus that reflects its actual microphones, languages, applications, and vocabulary.

## 3. Meeting transcription and understanding

Use this track when the system records or imports long conversations, separates speakers, produces transcripts, and generates useful follow-up artifacts.

This problem has at least three layers:

- capture quality: missing audio, overlap, noise, and channel handling;
- transcript quality: words, speakers, timestamps, and long-form consistency;
- understanding quality: summaries, decisions, action items, and grounded answers.

| Evaluation need | Useful public starting point | What it contributes |
|---|---|---|
| ASR, diarization, and long-form speech infrastructure | [OpenBench](https://github.com/argmaxinc/OpenBench) | Reproducible diarization and transcription evaluation across datasets with different access terms |
| Long-context reasoning over meeting transcripts | [ELITR-Bench](https://github.com/utter-project/ELITR-Bench) | Single- and multi-turn question answering and conversational evaluation over meeting transcripts |

Recommended product-specific additions:

- speaker-attributed WER and diarization error rate;
- named-entity and decision accuracy;
- action-item precision, recall, owner, and due-date accuracy;
- summary faithfulness with citation back to transcript spans;
- long-meeting degradation by 15- or 30-minute segment;
- recovery from reconnects, muted microphones, and device changes;
- privacy controls, retention behavior, and participant consent.

Transcript-only evaluation cannot reveal capture or diarization failures. Conversely, a low WER does not guarantee that summaries and action items are faithful.

## A minimal layered evaluation plan

For any of the three tracks, use four layers:

1. **User outcome** — did the user get the intended result?
2. **Interaction quality** — was the exchange timely, understandable, and recoverable?
3. **Component quality** — ASR, diarization, tool arguments, or generation accuracy.
4. **Safety and trust** — consent, confirmation, reversibility, privacy, and truthful status.

Report each layer separately. A single composite score is useful only when its weights match the product's real failure costs.

## Reproducibility checklist

Record at least:

- benchmark and dataset version or commit;
- model and provider versions;
- prompt, tool schemas, and system configuration;
- audio format and preprocessing;
- number of trials and sampling settings;
- latency measurement boundaries;
- judge model, rubric, and calibration examples;
- failed, timed-out, and refused runs rather than silently dropping them;
- license and access constraints for every dataset.

The structured comparison behind this guide is in [`data/benchmarks.jsonl`](../data/benchmarks.jsonl), with field-level interpretation documented in the project [README](../README.md).
