import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { scoreCallEnded } from './scorer.mjs';

const fixtures = JSON.parse(
  readFileSync(new URL('./synthetic-events.json', import.meta.url), 'utf8'),
);

describe('Morgan Phase 1 scorer', () => {
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const result = scoreCallEnded(fixture.event);
      expect(result.score).toBe(fixture.expected.score);
      expect(result.score_band).toBe(fixture.expected.score_band);
      expect(result.alert).toBe(fixture.expected.alert);
      expect(result.booking_requested).toBe(fixture.expected.booking_requested);
      expect(result.dedupe_key).toBe(fixture.expected.dedupe_key);
    });
  }

  it('fails closed for wrong event type', () => {
    expect(() => scoreCallEnded({
      call_id: 'call_test_004',
      lead_id: 'lead_test_004',
      event_type: 'call.started',
    })).toThrow('expected call.ended event');
  });

  it('fails closed without stable identifiers', () => {
    expect(() => scoreCallEnded({ event_type: 'call.ended' }))
      .toThrow('call_id and lead_id are required');
  });
});
