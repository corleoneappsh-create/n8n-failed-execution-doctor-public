export function scoreCallEnded(event) {
  if (!event || event.event_type !== 'call.ended') {
    throw new Error('expected call.ended event');
  }
  if (!event.call_id || !event.lead_id) {
    throw new Error('call_id and lead_id are required');
  }

  let score = 0;
  if (event.need_confirmed === true) score += 25;
  if (event.budget_fit === true) score += 20;
  if (Number.isFinite(event.timeline_days) && event.timeline_days <= 30) score += 20;
  if (event.decision_maker === true) score += 15;
  if (event.meeting_requested === true) score += 20;

  const scoreBand = score >= 70
    ? 'high_intent'
    : score >= 35
      ? 'qualified_followup'
      : 'low_intent';

  const routeAction = scoreBand === 'high_intent'
    ? 'book_and_alert'
    : scoreBand === 'qualified_followup'
      ? 'follow_up'
      : 'nurture';

  return {
    call_id: event.call_id,
    lead_id: event.lead_id,
    event_type: event.event_type,
    dedupe_key: `${event.call_id}:${event.event_type}`,
    score,
    score_band: scoreBand,
    route_action: routeAction,
    alert: scoreBand === 'high_intent',
    booking_requested: event.meeting_requested === true,
    summary: event.summary ?? '',
    transcript_url: event.transcript_url ?? null,
    recording_url: event.recording_url ?? null,
  };
}
