import test from 'node:test';
import assert from 'node:assert/strict';
import { addDiagnosticSink, clearDiagnosticHistory, configureDiagnostics, createOperationId, getDiagnosticHistory, reportDiagnostic, resetDiagnosticsForTests } from '../../../src/diagnostics.ts';

test.afterEach(() => resetDiagnosticsForTests());

test('diagnostic events include stable structure and operation correlation', () => {
  const events = [];
  addDiagnosticSink({ write: event => events.push(event) });
  const operationId = createOperationId();
  reportDiagnostic('error', 'storage:write-failed', { operation: 'save', attempt: 2 }, operationId);
  assert.equal(events.length, 1);
  assert.equal(events[0].level, 'error');
  assert.equal(events[0].event, 'storage:write-failed');
  assert.equal(events[0].operationId, operationId);
  assert.equal(events[0].fields.operation, 'save');
  assert.equal(typeof events[0].timestamp, 'string');
});

test('diagnostics redact sensitive fields before dispatch', () => {
  const events = [];
  addDiagnosticSink({ write: event => events.push(event) });
  reportDiagnostic('warn', 'workspace:operation', { documentContent: '# private', filePath: '/private/notes.md', operation: 'backup' });
  assert.equal(events[0].fields.documentContent, '[redacted]');
  assert.equal(events[0].fields.filePath, '[redacted]');
  assert.equal(events[0].fields.operation, 'backup');
});

test('diagnostic levels suppress messages below configured verbosity', () => {
  const events = [];
  addDiagnosticSink({ write: event => events.push(event) });
  configureDiagnostics('warn');
  reportDiagnostic('debug', 'test:debug');
  reportDiagnostic('info', 'test:info');
  reportDiagnostic('warn', 'test:warn');
  assert.deepEqual(events.map(event => event.level), ['warn']);
});

test('diagnostic sink failures never replace application control flow', () => {
  addDiagnosticSink({ write: () => { throw new Error('sink failure'); } });
  assert.doesNotThrow(() => reportDiagnostic('error', 'storage:write-failed'));
});

test('diagnostic history is bounded, copyable and explicitly clearable', () => {
  configureDiagnostics('debug');
  for (let index = 0; index < 250; index += 1) reportDiagnostic('debug', 'test:event', { sequence: index });
  const report = getDiagnosticHistory();
  assert.equal(report.length, 200);
  assert.equal(report[0].fields.sequence, 50);
  report[0].fields.sequence = -1;
  assert.equal(getDiagnosticHistory()[0].fields.sequence, 50);
  clearDiagnosticHistory();
  assert.equal(getDiagnosticHistory().length, 0);
});
