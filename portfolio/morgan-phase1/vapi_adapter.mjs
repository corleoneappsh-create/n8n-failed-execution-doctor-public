export function normalizeVapiEndOfCall(envelope, context = {}) {
  const message = envelope?.message;
  if (!message || message.type !== 'end-of-call-report') {
    throw new Error('expected Vapi end-of-call-report message');
  }

  const callId = message.call?.id;
  const leadId = context.lead_id;
  if (!callId || !leadId) {
    throw new Error('Vapi call.id and external lead_id are required');
  }

  return {
    call_id: callId,
    lead_id: leadId,
    event_type: 'call.ended',
    need_confirmed: context.need_confirmed === true,
    budget_fit: context.budget_fit === true,
    timeline_days: Number.isFinite(context.timeline_days)
      ? context.timeline_days
      : null,
    decision_maker: context.decision_maker === true,
    meeting_requested: context.meeting_requested === true,
    summary: message.analysis?.summary ?? '',
    transcript_url: context.transcript_url ?? null,
    recording_url: context.recording_url ?? null,
  };
}
