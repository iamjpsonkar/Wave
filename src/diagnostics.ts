export type DiagnosticLevel = 'error' | 'warn' | 'info' | 'debug';
export type DiagnosticPrimitive = number | boolean | null | undefined;
export type DiagnosticFields = Record<string, DiagnosticPrimitive | string>;
export interface DiagnosticError { name: string; message: string; cause?: DiagnosticError }
export interface DiagnosticEvent { level: DiagnosticLevel; event: string; timestamp: string; operationId: string; fields: DiagnosticFields; error?: DiagnosticError }
export interface DiagnosticSink { write(event: DiagnosticEvent): void }
const sinks = new Set<DiagnosticSink>();
const MAX_DIAGNOSTIC_EVENTS = 200;
const MAX_CAUSE_DEPTH = 3;
const diagnosticHistory: DiagnosticEvent[] = [];
let configuredLevel: DiagnosticLevel = 'warn';
const levels: Record<DiagnosticLevel, number> = { error: 0, warn: 1, info: 2, debug: 3 };
const allowedEvent = /^[a-z][a-z0-9-]*(?::[a-z][a-z0-9-]*){0,5}$/;
const allowedValues: Record<string, RegExp> = {
  operation: /^[a-z][a-z0-9-]{0,39}$/, stage: /^[a-z][a-z0-9-]{0,39}$/,
  source: /^(window|timer|ui|storage|recovery|settings|search)$/,
  boundary: /^(root|persistence|autosave|recovery|backup|restore)$/,
  errorName: /^[A-Za-z][A-Za-z0-9]{0,39}$/, attempt: /^\d{1,4}$/,
  count: /^\d{1,6}$/, durationMs: /^\d{1,8}$/,
  recovered: /^(true|false)$/, hasDraft: /^(true|false)$/, sink: /^(local|console|test)$/
};
const SENSITIVE_KEY = /(content|markdown|document|token|secret|password|credential|path|filename|asset|email|user|message|stack|cause|url|uri|name)/i;
function sanitizeErrorValue(value: unknown, depth = 0): DiagnosticError | undefined {
  if (!value || depth >= MAX_CAUSE_DEPTH) return undefined;
  const error = value instanceof Error ? value : undefined;
  const rawName = error?.name || (typeof value === 'object' ? 'Error' : 'NonErrorThrown');
  const name = /^[A-Za-z][A-Za-z0-9]{0,39}$/.test(rawName) ? rawName : 'Error';
  // Exception prose is untrusted and may contain document text. Keep only the
  // standard error class; do not attempt heuristic redaction of arbitrary prose.
  const result: DiagnosticError = { name, message: 'Details omitted for privacy.' };
  if (error && 'cause' in error) {
    const cause = sanitizeErrorValue((error as Error & { cause?: unknown }).cause, depth + 1);
    if (cause) result.cause = cause;
  }
  return result;
}
function safeFields(fields: DiagnosticFields): DiagnosticFields {
  const safe: DiagnosticFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (SENSITIVE_KEY.test(key)) { safe[key] = '[redacted]'; continue; }
    if (typeof value === 'string') { const rule = allowedValues[key]; safe[key] = rule && rule.test(value) ? value : '[redacted]'; }
    else if (value === null || value === undefined || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) safe[key] = value;
    else safe[key] = '[redacted]';
  }
  return safe;
}
export function configureDiagnostics(level: DiagnosticLevel): void { configuredLevel = level; }
export function addDiagnosticSink(sink: DiagnosticSink): () => void { sinks.add(sink); return () => sinks.delete(sink); }
export function createOperationId(): string { return globalThis.crypto?.randomUUID?.() ?? `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
export function reportDiagnostic(level: DiagnosticLevel, event: string, fields: DiagnosticFields = {}, operationId = createOperationId(), cause?: unknown): void {
  if (levels[level] > levels[configuredLevel]) return;
  const record: DiagnosticEvent = { level, event: allowedEvent.test(event) ? event : 'diagnostic:invalid-event', timestamp: new Date().toISOString(), operationId, fields: safeFields(fields), ...(cause === undefined ? {} : { error: sanitizeErrorValue(cause) }) };
  diagnosticHistory.push(record);
  if (diagnosticHistory.length > MAX_DIAGNOSTIC_EVENTS) diagnosticHistory.splice(0, diagnosticHistory.length - MAX_DIAGNOSTIC_EVENTS);
  for (const sink of sinks) { try { sink.write(record); } catch { /* Diagnostic sinks must never disrupt application work. */ } }
  if (level === 'error') console.error('[Wave]', record);
  else if (level === 'warn') console.warn('[Wave]', record);
  else if (configuredLevel === 'debug') console.info('[Wave]', record);
}
export function getDiagnosticHistory(): DiagnosticEvent[] { return diagnosticHistory.map(event => ({ ...event, fields: { ...event.fields }, ...(event.error ? { error: { ...event.error, ...(event.error.cause ? { cause: { ...event.error.cause } } : {}) } } : {}) })); }
export function clearDiagnosticHistory(): void { diagnosticHistory.length = 0; }
export function resetDiagnosticsForTests(): void { sinks.clear(); diagnosticHistory.length = 0; configuredLevel = 'warn'; }
