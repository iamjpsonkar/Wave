import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = '.github/workflows';
const files = readdirSync(directory).filter(file => /\.ya?ml$/i.test(file)).sort();
const errors = [];
for (const file of files) {
  const path = join(directory, file), source = readFileSync(path, 'utf8');
  const fail = message => errors.push(`${path}: ${message}`);
  if (!/^permissions:/m.test(source)) fail('missing top-level least-privilege permissions block');
  if (!/^concurrency:/m.test(source)) fail('missing concurrency policy');
  if (!/^\s+timeout-minutes:\s*\d+/m.test(source)) fail('missing explicit job timeout');
  if (/pull_request_target/.test(source)) fail('pull_request_target is prohibited by repository policy');
  for (const line of source.split('\n')) {
    const match = line.match(/^\s*uses:\s*([^\s#]+)/);
    if (match && !match[1].startsWith('./') && !/@[a-f0-9]{40}$/i.test(match[1])) {
      fail(`action or reusable workflow is not pinned to a full commit SHA: ${match[1]}`);
    }
  }
}
if (errors.length) { for (const error of errors) console.error(`::error::${error}`); process.exitCode = 1; }
else console.log(`Validated ${files.length} workflows: permissions, concurrency, timeouts, fork-event policy and immutable action pins.`);
