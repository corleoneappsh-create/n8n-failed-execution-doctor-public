import { describe, expect, it } from 'vitest';
import { normalizeVapiEndOfCall } from './vapi_adapter.mjs';

const envelope = {
  message: {
    type: 'end-of-call-report',
    call: { id: 'call_vapi_test_001' },
    analysis: { summary: 'Synthetic Vapi end-of-call report.' },
  },
};

describe('Vapi end-of-call adapter', () => {
  it('normalizes the documented Vapi server-message envelope', () => {
    const result = normalizeVapiEndOfCall(envelope, {
      lead_id: 'lead_test_001',
      need_confirmed: true,
      budget_fit: true,
      timeline_days: 14,
      decision_maker: true,
      meeting_requested: true,
    });

    expect(result.call_id).toBe('call_vapi_test_001');
    expect(result.lead_id).toBe('lead_test_001');
    expect(result.event_type).toBe('call.ended');
    expect(result.summary).toBe('Synthetic Vapi end-of-call report.');
  });

  it('fails closed for another Vapi message type', () => {
    expect(() => normalizeVapiEndOfCall({
      message: { type: 'status-update', call: { id: 'call_test' } },
    }, { lead_id: 'lead_test' })).toThrow('expected Vapi end-of-call-report message');
  });

  it('requires a stable external CRM lead id', () => {
    expect(() => normalizeVapiEndOfCall(envelope, {}))
      .toThrow('Vapi call.id and external lead_id are required');
  });
});
