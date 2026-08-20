# n8n Workflow Reliability Audit Checklist

Use this checklist before changing a production n8n workflow after an incident or before a high-risk deployment.

## Reliability checks

- Identify the exact trigger, failing node, and last known good execution.
- Check authentication failures, expired credentials, scopes, and 401/403 responses.
- Check rate limits, retry behavior, backoff, and 429 responses.
- Verify retries are idempotent and cannot create duplicate records, messages, orders, or payments.
- Inspect webhook paths, HTTP endpoints, timeouts, and network dependencies.
- Check expressions and item-linking against missing, empty, malformed, and multi-item inputs.
- Verify failure paths do not silently report success or skip critical downstream steps.
- Confirm secrets and customer data are not exposed in logs, exported examples, or screenshots.
- Test reconnect/restart behavior and confirm state survives process or network interruptions.
- Leave one regression check that reproduces the original failure before calling the workflow fixed.

## Free proof path

For a failed execution, try the public [n8n Failed Execution Doctor](https://apify.com/boris-automation/my-actor) with synthetic or sanitized JSON. No live n8n credentials are required.

For the expanded checklist and implementation notes, use the [public n8n workflow audit checklist](https://n8n-doctor.167-233-67-162.sslip.io/guides/n8n-workflow-audit-checklist/?utm_source=github&utm_medium=repository&utm_campaign=n8n_workflow_audit_checklist&utm_content=github_doc).

## Fixed-scope help

If you want one workflow reviewed end to end, the [n8n Workflow Reliability Audit](https://zbewt1-yh.myshopify.com/products/n8n-workflow-reliability-audit-1-workflow?utm_source=github&utm_medium=repository&utm_campaign=n8n_workflow_audit_checklist&utm_content=github_doc_buy) is $49 for one workflow.

You can also [open a redacted audit request](https://github.com/corleoneappsh-create/n8n-failed-execution-doctor-public/issues/new?template=workflow-audit.yml). Do not include credentials, tokens, PHI, customer records, or other sensitive data.
