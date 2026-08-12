# Morgan — Vapi + n8n + Twilio Phase 1 proof

This is a bounded, synthetic-data proof for the public paid-project brief for an outbound AI voice agent. It is not connected to live phone numbers, production CRM credentials, or customer data.

## Phase 1 objective

Prove one inspectable event path before any live outbound calling:

1. accept a synthetic lead/call event;
2. normalize qualification fields;
3. calculate a deterministic lead score;
4. produce a CRM-ready update payload;
5. produce a booking/high-intent routing decision;
6. surface failure/retry metadata without performing duplicate side effects.

## Proposed event contract

Required identifiers:
- `call_id`
- `lead_id`
- `event_type`

Qualification fields:
- `need_confirmed` (boolean)
- `budget_fit` (boolean)
- `timeline_days` (integer or null)
- `decision_maker` (boolean)
- `meeting_requested` (boolean)

Evidence fields:
- `transcript_url` (optional test URL)
- `recording_url` (optional test URL)
- `summary` (sanitized text)

## Deterministic scoring

For the proof only:
- need confirmed: +30
- budget fit: +25
- decision maker: +20
- timeline <= 30 days: +15
- meeting requested: +10

Score >= 70 => `high_intent`.
Score 40–69 => `qualified_followup`.
Score < 40 => `low_intent`.

The scoring rule is intentionally explicit and replaceable. The client should provide the real qualification criteria before production.

## Output contract

The Phase 1 output should contain:
- normalized call/lead IDs;
- score and score band;
- CRM update object;
- booking requested flag;
- high-intent alert flag;
- transcript/recording references when present;
- `retry_safe` and `dedupe_key` metadata.

## Production gates

Before live calling:
- client confirms CRM and scheduler;
- client supplies actual scoring criteria;
- consent/compliance rules for outbound calls are confirmed for the target jurisdiction and lead source;
- Vapi/Twilio credentials remain client-controlled;
- webhook authentication is enabled;
- idempotency/deduplication is tested;
- retry limits are bounded;
- live human handoff is treated as a separate add-on milestone;
- test numbers/sample records pass before any real lead mutation.

## Acceptance criteria for a paid Phase 1

A successful Phase 1 should demonstrate, with synthetic/test data:
- the same event cannot create duplicate CRM/booking side effects;
- malformed events fail closed with a useful diagnostic;
- one high-intent sample reaches the alert branch;
- one ordinary qualified sample reaches follow-up without alerting;
- one low-intent sample produces no booking action;
- all outputs are inspectable and documented;
- exported n8n JSON and a short handoff/runbook are provided.

No claim is made here that Vapi/Twilio production calls have been executed. This proof is deliberately limited to the backend contract and safety/reliability shape.