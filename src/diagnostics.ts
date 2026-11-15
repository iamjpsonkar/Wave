export type DiagnosticLevel = 'error' | 'warn' | 'info' | 'debug';
export type DiagnosticFields = Record<string, string | number | boolean | null | undefined>;
export interface DiagnosticEvent { level: DiagnosticLevel; event: string; timestamp: string; operationId: string; fields: DiagnosticFields }
export interface DiagnosticSink { write(event: DiagnosticEvent): void }

const SENSITIVE_KEY = /(content|markdown|document|token|secret|password|credential|path|filename|asset|email|user)/i;
const sinks = new Set<DiagnosticSink>();
let configuredLevel: DiagnosticLevel = 'warn';
const levels: Record<DiagnosticLevel, number> = { error: 0, warn: 1, info: 2, debug: 3 };
function safeFields(fields: DiagnosticFields): DiagnosticFields {
  const safe: DiagnosticFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (SENSITIVE_KEY.test(key)) { safe[key] = '[redacted]'; continue; }
    if (value === null || value === undefined || typeof value === 'boolean' || typeof value === 'number') safe[key] = value;
    else safe[key] = value.slice(0, 160);
  }
  return safe;
}
export function configureDiagnostics(level: DiagnosticLevel): void { configuredLevel = level; }
export function addDiagnosticSink(sink: DiagnosticSink): () => void { sinks.add(sink); return () => sinks.delete(sink); }
export function createOperationId(): string { return globalThis.crypto?.randomUUID?.() ?? `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
export function reportDiagnostic(level: DiagnosticLevel, event: string, fields: DiagnosticFields = {}, operationId = createOperationId()): void {
  if (levels[level] > levels[configuredLevel]) return;
  const record: DiagnosticEvent = { level, event: event.slice(0, 120), timestamp: new Date().toISOString(), operationId, fields: safeFields(fields) };
  for (const sink of sinks) { try { sink.write(record); } catch { /* Diagnostic sinks must never disrupt application work. */ } }
  if (level === 'error') console.error('[Wave]', record);
  else if (level === 'warn') console.warn('[Wave]', record);
  else if (configuredLevel === 'debug') console.info('[Wave]', record);
}
export function resetDiagnosticsForTests(): void { sinks.clear(); configuredLevel = 'warn'; }
