# Contributing

Corrections and additions are welcome through GitHub issues or pull requests.

For each proposed change:

1. Link to a first-party repository, dataset card, project page, or paper.
2. Name the exact field that should change.
3. Explain whether the capability is directly evaluated or only supported by part of a suite.
4. Update `last_verified` for the affected record.
5. Keep the record compatible with [`data/schema.json`](data/schema.json).
6. Run `npm test`.

Coverage changes are release-ready only after two independent human reviews: one reviewer traces every changed capability value to the linked first-party evidence, and another checks the complete record, license fields, and wording. Automation verifies structure and source availability; it does not prove that a source supports a capability claim.

Source fields intentionally use a narrow host policy: GitHub for repository links, Hugging Face for dataset cards, and arXiv or GitHub for paper artifacts. Open an issue before adding another first-party host so its redirect and audit behavior can be reviewed.

Please do not submit product-directory entries, affiliate links, copied marketing text, performance claims without an inspectable result, or rankings based on incomparable metrics.
