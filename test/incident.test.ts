import { describe, expect, it } from 'vitest';

import { diagnoseIncident } from '../src/incident.js';

const workflow = {
    name: 'Lead Sync',
    nodes: [
        { name: 'CRM API', type: 'n8n-nodes-base.httpRequest' },
        { name: 'Transform', type: 'n8n-nodes-base.set' },
    ],
};

describe('diagnoseIncident', () => {
    it('classifies authentication failures', () => {
        const execution = {
            data: { resultData: { lastNodeExecuted: 'CRM API', runData: {
                'CRM API': [{ error: { message: 'Request failed: unauthorized', httpCode: 401 } }],
            } } },
        };
        const result = diagnoseIncident({ workflow, execution });
        expect(result.failureCount).toBe(1);
        expect(result.primaryCategory).toBe('authentication');
        expect(result.failures[0].node).toBe('CRM API');
    });
    it('classifies rate limits and suggests backoff', () => {
        const execution = {
            data: { resultData: { runData: {
                'CRM API': [{ error: { message: 'Too many requests', statusCode: 429 } }],
            } } },
        };
        const result = diagnoseIncident({ workflow, execution });
        expect(result.primaryCategory).toBe('rate_limit');
        expect(result.failures[0].recommendedNextStep.toLowerCase()).toContain('backoff');
    });

    it('classifies ECONNABORTED as timeout', () => {
        const execution = { resultData: { error: { message: 'ECONNABORTED timeout of 300000ms exceeded' }, lastNodeExecuted: 'CRM API' } };
        const result = diagnoseIncident({ workflow, execution });
        expect(result.primaryCategory).toBe('timeout');
        expect(result.lastNodeExecuted).toBe('CRM API');
    });

    it('returns an explicit empty diagnostic state', () => {
        const result = diagnoseIncident({ workflow, execution: { data: { resultData: {} } } });
        expect(result.failureCount).toBe(0);
        expect(result.diagnosticStatus).toBe('NO_STRUCTURED_ERROR_FOUND');
    });
});
