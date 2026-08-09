import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

import { diagnoseIncident } from '../src/incident.js';

describe('Store default input', () => {
    it('prefills a valid synthetic failure that produces a non-empty diagnosis', () => {
        const schema = JSON.parse(fs.readFileSync('.actor/input_schema.json', 'utf8'));
        const input = {
            workflow: schema.properties.workflow.prefill,
            execution: schema.properties.execution.prefill,
        };
        const result = diagnoseIncident(input);
        expect(result.failureCount).toBe(1);
        expect(result.primaryCategory).toBe('authentication');
        expect(result.diagnosticStatus).toBe('FAILED_EXECUTION_ANALYZED');
        expect(result.lastNodeExecuted).toBe('CRM API');
    });
});
