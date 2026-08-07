export type JsonObject = Record<string, unknown>;

export interface IncidentInput {
    workflow: JsonObject;
    execution: JsonObject;
}

export interface FailureFinding {
    node: string | null;
    nodeType: string | null;
    category: string;
    statusCode: string | number | null;
    message: string;
    recommendedNextStep: string;
}

const SECRET_PATTERNS = [
    /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;}]+/gi,
    /bearer\s+[A-Za-z0-9._~+/-]{8,}/gi,
];

function asObject(value: unknown): JsonObject | null {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonObject) : null;
}
function safeMessage(value: unknown): string {
    let text = String(value ?? '').replace(/\s+/g, ' ').trim();
    for (const pattern of SECRET_PATTERNS) {
        text = text.replace(pattern, '[REDACTED]');
    }
    return text.slice(0, 300);
}

function classify(message: string, statusCode: unknown): [string, string] {
    const text = `${String(statusCode ?? '')} ${message}`.toLowerCase();
    if (['401', '403', 'unauthorized', 'forbidden', 'credential', 'authentication'].some((x) => text.includes(x))) {
        return ['authentication', 'Verify the n8n credential reference, auth scheme, token scope and expiry; then retest only the failing node.'];
    }
    if (['429', 'rate limit', 'too many requests'].some((x) => text.includes(x))) {
        return ['rate_limit', 'Add bounded retry with exponential backoff and respect Retry-After or the upstream rate-limit policy.'];
    }
    if (['timeout', 'timed out', 'etimedout', 'econnaborted'].some((x) => text.includes(x))) {
        return ['timeout', 'Set an explicit timeout, retry only idempotent work, and isolate the slow external call from the main path.'];
    }
    if (['econn', 'dns', 'network', 'connection refused', 'socket hang up'].some((x) => text.includes(x))) {
        return ['network', 'Check endpoint reachability, DNS and TLS first; then add bounded retries and an explicit failure path.'];
    }
    if (['400', '422', 'invalid', 'validation', 'bad request'].some((x) => text.includes(x))) {
        return ['invalid_input', 'Inspect the outbound payload/schema and validate required fields before the failing node.'];
    }
    if (['expression', 'undefined', 'cannot read', 'not defined', 'item linking'].some((x) => text.includes(x))) {
        return ['expression', 'Validate referenced fields, item linking and optional values before evaluating the expression.'];
    }
    return ['execution_error', 'Reproduce the failing node with the same sanitized input, then add an explicit error path before re-enabling automation.'];
}

function nodeTypeMap(workflow: JsonObject): Map<string, string> {
    const map = new Map<string, string>();
    const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
    for (const rawNode of nodes) {
        const node = asObject(rawNode);
        if (!node) continue;
        const name = String(node.name ?? '');
        if (name) map.set(name, String(node.type ?? ''));
    }
    return map;
}

function resultData(execution: JsonObject): JsonObject {
    const data = asObject(execution.data);
    return asObject(data?.resultData) ?? asObject(execution.resultData) ?? {};
}
function findingFromError(node: string | null, nodeType: string | null, rawError: unknown): FailureFinding {
    const error = asObject(rawError);
    const rawMessage = error?.message ?? error?.description ?? error?.name ?? rawError ?? 'Execution failed';
    const statusCode = (error?.httpCode ?? error?.statusCode ?? error?.status ?? null) as string | number | null;
    const message = safeMessage(rawMessage);
    const [category, recommendedNextStep] = classify(message, statusCode);
    return { node, nodeType, category, statusCode, message, recommendedNextStep };
}

export function diagnoseIncident(input: IncidentInput) {
    if (!Array.isArray(input.workflow.nodes)) {
        throw new Error('workflow.nodes must be an array');
    }
    const types = nodeTypeMap(input.workflow);
    const result = resultData(input.execution);
    const lastNode = result.lastNodeExecuted ? String(result.lastNodeExecuted) : null;
    const runData = asObject(result.runData) ?? {};
    const failures: FailureFinding[] = [];

    for (const [nodeName, rawRuns] of Object.entries(runData)) {
        if (!Array.isArray(rawRuns)) continue;
        for (const rawRun of rawRuns) {
            const run = asObject(rawRun);
            if (!run?.error) continue;
            failures.push(findingFromError(nodeName, types.get(nodeName) ?? null, run.error));
        }
    }
    if (result.error && failures.length === 0) {
        failures.push(findingFromError(lastNode, lastNode ? (types.get(lastNode) ?? null) : null, result.error));
    }

    const counts = new Map<string, number>();
    for (const failure of failures) {
        counts.set(failure.category, (counts.get(failure.category) ?? 0) + 1);
    }
    const primaryCategory = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown';

    return {
        workflowName: String(input.workflow.name ?? ''),
        lastNodeExecuted: lastNode,
        failureCount: failures.length,
        primaryCategory,
        failures,
        diagnosticStatus: failures.length ? 'FAILED_EXECUTION_ANALYZED' : 'NO_STRUCTURED_ERROR_FOUND',
        privacyNote: 'Error messages are truncated and common secret-like values are redacted. Review source execution data before production changes.',
    };
}
