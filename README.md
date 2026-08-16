# n8n Failed Execution Doctor

> **Unofficial community tool.** This project is not affiliated with, endorsed by, or sponsored by n8n GmbH.


[![CI](https://github.com/corleoneappsh-create/n8n-failed-execution-doctor-public/actions/workflows/test.yaml/badge.svg)](https://github.com/corleoneappsh-create/n8n-failed-execution-doctor-public/actions/workflows/test.yaml)
[![Release](https://img.shields.io/github/v/release/corleoneappsh-create/n8n-failed-execution-doctor-public)](https://github.com/corleoneappsh-create/n8n-failed-execution-doctor-public/releases)


Diagnose a failed n8n execution without connecting to the customer's live n8n instance.

**Try it free:** [Run the public n8n Failed Execution Doctor on Apify](https://apify.com/boris-automation/my-actor) with a synthetic example or your sanitized workflow/execution JSON. No live n8n credentials are required.

**Troubleshooting first?** Use the free [n8n Failed Execution Troubleshooting Checklist](docs/n8n-failed-execution-troubleshooting-checklist.md) before changing a production workflow.

**Need hands-on help?** The fixed-scope **n8n Workflow Reliability Audit is $49 for one workflow**. See the [synthetic sample deliverable](https://github.com/corleoneappsh-create/n8n-workflow-preflight-action/blob/main/examples/SAMPLE_RELIABILITY_AUDIT.md), [open a redacted audit request](https://github.com/corleoneappsh-create/n8n-failed-execution-doctor-public/issues/new?template=workflow-audit.yml), or [buy the audit directly](https://zbewt1-yh.myshopify.com/products/n8n-workflow-reliability-audit-1-workflow?ref=github_doctor_audit&utm_source=github&utm_medium=repository&utm_campaign=n8n_workflow_audit&utm_content=doctor_top_cta). Never include credentials or sensitive customer data.

### Good fit for real production breakage

Use the Doctor when an n8n workflow *runs* but the business result is missing or unreliable—for example:

- CRM syncs that silently stop updating records;
- lead-routing workflows that drop, duplicate, or misroute leads;
- webhook/API steps failing on 401/403 auth errors, 429 rate limits, timeouts, or bad payloads;
- expression/item-linking failures that only appear with real data;
- recurring incidents where you need a concrete failing node and next diagnostic step before touching production.

If the same incident keeps returning, the scoped audit path is designed for one workflow first: reproduce the failure with redacted evidence, identify the brittle handoff, define the smallest safe fix, and leave a short regression checklist.

[![n8n Failed Execution Doctor Pro preview](https://n8n-doctor.167-233-67-162.sslip.io/n8n-doctor-pro-hero.png)](https://n8n-doctor.167-233-67-162.sslip.io/?src=github_doctor)

Provide two JSON objects:
- the exported n8n workflow;
- the failed execution JSON.

The Actor returns the failing node, node type, normalized error category, sanitized error message, and a concrete next diagnostic step.

## Why this is different

This is not another generic workflow linter. It focuses on incidents that already happened: failed runs, timeouts, authentication failures, rate limits, invalid API payloads, expression/item-linking errors, and network failures.

It is deterministic: no external LLM call is required for the core diagnosis, which keeps latency and platform cost low.


## Free Lite n8n workflow

Want to run the same core diagnosis entirely inside n8n? **[Download the Lite workflow JSON](https://github.com/corleoneappsh-create/n8n-failed-execution-doctor-public/releases/latest/download/n8n-failed-execution-doctor-lite.json)** or inspect [`examples/n8n-failed-execution-doctor-lite.json`](examples/n8n-failed-execution-doctor-lite.json).

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

**Buy Incident Doctor Pro — $19:** https://zbewt1-yh.myshopify.com/cart/43168384745534:1

**See full Pro details:** https://n8n-doctor.167-233-67-162.sslip.io/?src=github_doctor

### Reliability Toolkit bundle — $29

If you also want to catch workflow risks **before deployment**, the Reliability Toolkit Pro includes Incident Doctor Pro plus a zero-dependency preflight scanner, Markdown/JSON reports, broken-connection and webhook checks, domain/credential inventory, and a ready-to-use GitHub CI template.

**Buy Toolkit bundle — $29:** https://zbewt1-yh.myshopify.com/cart/43173943803966:1

**Toolkit details:** https://n8n-doctor.167-233-67-162.sslip.io/?src=github_doctor_toolkit

### Lite vs Pro

| Capability | Free Lite | Pro v0.3.0 |
|---|:---:|:---:|
| Failing/last node detection | ✓ | ✓ |
| Root-cause classification | ✓ | ✓ |
| Sanitized error evidence | ✓ | ✓ |
| Focused next diagnostic step | ✓ | ✓ |
| Batch incident diagnosis | — | ✓ |
| Severity heuristic | — | ✓ |
| Retry-safety guidance | — | ✓ |
| Workflow risk hints | — | ✓ |
| Markdown incident report | — | ✓ |
| Sample input/output package | — | ✓ |

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
