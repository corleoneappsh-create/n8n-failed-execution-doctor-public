# n8n Failed Execution Troubleshooting Checklist

A practical checklist for diagnosing a failed or unreliable n8n workflow without guessing and without pasting production credentials into third-party tools.

> **Unofficial community resource.** This project is not affiliated with, endorsed by, or sponsored by n8n GmbH.

## 1. Preserve the evidence first

Before changing the workflow, save a redacted copy of:

- the workflow JSON;
- the failed execution JSON;
- the exact failing node name and type;
- the timestamp and n8n version;
- the HTTP status/error code if one exists;
- whether the failure is deterministic or intermittent.

Do not include passwords, API keys, bearer tokens, cookies, webhook secrets, customer PII, or unnecessary payload data.

## 2. Classify the failure

Start with the smallest evidence-backed category:

- **401/403** → authentication or authorization;
- **429** → rate limit or quota;
- **400/422** → invalid request or payload shape;
- **timeout / ETIMEDOUT / ECONNABORTED** → timeout or upstream latency;
- **DNS / connection / socket errors** → network or endpoint reachability;
- **undefined fields / item-linking errors** → expression or data-shape issue;
- **wrong business result with no hard error** → inspect branching, filtering, deduplication, and downstream state.

Do not retry blindly before knowing whether the operation is safe to repeat.

## 3. Check the handoff before the failing node

For the node immediately before the failure, verify:

1. expected item count;
2. required fields exist;
3. field types are correct;
4. expressions resolve to the intended values;
5. credentials/reference names point to the intended integration;
6. URLs, methods, headers, and payload structure match the current upstream API contract.

A surprising number of “API failures” are actually bad data handed to the API.

## 4. Separate retryable from non-retryable incidents

Usually safer to retry after the root cause is addressed:

- transient network errors;
- some 429 responses after respecting backoff;
- idempotent reads;
- idempotent writes with a verified idempotency key.

Potentially dangerous to retry without additional checks:

- payment or billing writes;
- create/order/send operations;
- webhook-triggered mutations;
- workflows without deduplication or idempotency controls.

## 5. Reproduce with sanitized evidence

Prefer a minimal reproduction using synthetic or redacted data. Confirm the same node fails for the same reason before touching production credentials or live customer data.

## 6. Verify the recovery, not just the absence of an error

After the fix, check the actual business result:

- expected record was created or updated once;
- no duplicate message/order/contact was generated;
- downstream nodes received the expected item count;
- the workflow completed within acceptable latency;
- a second controlled run does not reintroduce the incident.

## Free deterministic diagnostic

The public **n8n Failed Execution Doctor Lite** can classify common failed-execution evidence without requiring a live n8n login or external LLM.

- Free Lite workflow: https://github.com/corleoneappsh-create/n8n-failed-execution-doctor-public/releases/latest/download/n8n-failed-execution-doctor-lite.json
- Public Doctor / Pro details: https://n8n-doctor.167-233-67-162.sslip.io/?src=github-checklist
- Broader reliability review: [n8n Workflow Reliability Audit Checklist](n8n-workflow-reliability-audit-checklist.md)

The paid Pro/Toolkit path is optional. The checklist above is intentionally useful on its own.
