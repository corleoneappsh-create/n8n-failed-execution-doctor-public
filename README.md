# n8n Failed Execution Doctor

> **Unofficial community tool.** This project is not affiliated with, endorsed by, or sponsored by n8n GmbH.


Diagnose a failed n8n execution without connecting to the customer's live n8n instance.

Provide two JSON objects:
- the exported n8n workflow;
- the failed execution JSON.

The Actor returns the failing node, node type, normalized error category, sanitized error message, and a concrete next diagnostic step.

## Why this is different

This is not another generic workflow linter. It focuses on incidents that already happened: failed runs, timeouts, authentication failures, rate limits, invalid API payloads, expression/item-linking errors, and network failures.

It is deterministic: no external LLM call is required for the core diagnosis, which keeps latency and platform cost low.


## Free Lite n8n workflow

Want to run the same core diagnosis entirely inside n8n? Import [`examples/n8n-failed-execution-doctor-lite.json`](examples/n8n-failed-execution-doctor-lite.json).

The Lite workflow uses only two core n8n nodes (`Execute Workflow Trigger` + `Code`), requires no external API key or LLM, and returns the failing node, root-cause category, sanitized error message, and a focused next diagnostic step for one incident item.

The exact JSON in this repository has been imported successfully into an isolated **n8n 2.33.7** runtime. It is inactive by default.

## Pro workflow — batch diagnosis and incident reports

If you need a self-contained n8n workflow rather than the Actor, **n8n Failed Execution Doctor Pro v0.3.0** adds:

- batch diagnosis for multiple failed-execution items in one run;
- deterministic severity and retry-safety heuristics;
- workflow risk hints;
- ready-to-copy Markdown incident reports;
- sample input/output and a commercial internal-use license.

It requires no external LLM, API key, database, or live n8n login. The Pro workflow has been imported and executed end-to-end on n8n 2.33.7.

**Pro details and purchase:** https://n8n-doctor.167-233-67-162.sslip.io/?src=github

## Privacy boundary

The Actor does not need n8n credentials and does not log in to a live n8n instance. Common secret-like strings in error messages are redacted and returned messages are truncated. Users should still remove unnecessary sensitive execution data before submitting JSON.

## Categories detected

- `authentication`: 401/403, authorization, credential and token failures;
- `rate_limit`: HTTP 429 and rate-limit responses;
- `timeout`: timeout, ETIMEDOUT and ECONNABORTED;
- `network`: connection, DNS, socket and reachability failures;
- `invalid_input`: HTTP 400/422, validation and malformed request failures;
- `expression`: undefined fields, expression and item-linking problems;
- `execution_error`: structured failures that do not match a more specific class.

## Output

Each run writes one diagnosis to the default dataset and to the `DIAGNOSIS` key-value record. A no-error input returns `NO_STRUCTURED_ERROR_FOUND` rather than inventing a root cause.

## Apify deployment

The code supports Apify pay-per-event through the `incident-diagnosed` event. Configure that event in Apify Console and set `ACTOR_CHARGE_EVENT_NAME=incident-diagnosed` for the production Actor.

Local PPE validation has been completed with Apify's test mode and a single charge event per completed diagnosis.
