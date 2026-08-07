import { Actor } from 'apify';

import { diagnoseIncident, type IncidentInput } from './incident.js';

await Actor.main(async () => {
    const input = await Actor.getInput<IncidentInput>();
    if (!input?.workflow || !input?.execution) {
        throw new Error('Both workflow and execution JSON objects are required.');
    }

    const diagnosis = diagnoseIncident(input);
    const eventName = process.env.ACTOR_CHARGE_EVENT_NAME?.trim();
    if (eventName) {
        await Actor.charge({ eventName });
    }

    await Actor.pushData(diagnosis);
    await Actor.setValue('DIAGNOSIS', diagnosis);
}, { timeoutSecs: 0 });
