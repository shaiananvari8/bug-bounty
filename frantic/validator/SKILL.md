---
name: frantic-claim-verification-validator
description: Validate the Frantic #39 guide, evidence JSON, and report against the bounty acceptance checklist.
source:
  type: cli-tool
  command: node
  args:
    - validate.mjs
  timeout_seconds: 30
  sandbox:
    profile: readonly
    cwd_policy: skill-directory
inputs:
  artifact_root:
    type: string
    required: true
    description: Path to the local artifact root containing claim-verification.md, evidence.json, and report.md.
runx:
  category: ops
  input_resolution:
    required:
      - artifact_root
---

# Frantic Claim Verification Validator

This local validation skill checks the Frantic bounty #39 artifacts before public delivery. It does not submit anything. It reads the guide, evidence JSON, and report, then verifies that the required artifact names, live API sources, lifecycle steps, review boundary, correct and wrong delivery examples, runx version evidence, and report bullet count are present.
