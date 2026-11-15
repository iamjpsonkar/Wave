#!/usr/bin/env node
/**
 * Verify the locked npm dependency license metadata used by Wave.
 *
 * This is an evidence-gathering guard, not a legal compatibility engine.
 * It reads exact resolved versions from package-lock.json and fails closed
 * when a package has no unambiguous, supported SPDX expression.
 */
import { readFile } from 'node:fs/promises';
import process from 'node:process';

const LOCK_PATH = new URL('../package-lock.json', import.meta.url);
const KNOWN_SIMPLE_LICENSES = new Set([
  'MIT', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause',
  '0BSD', 'CC-BY-4.0', 'CC0-1.0', 'OFL-1.1', 'Unlicense',
  'Artistic-2.0', 'BlueOak-1.0.0', 'Zlib'
]);

function parseArgs(args) {
  const options = { json: false, allowUnknown: false };
  for (const arg of args) {
    if (arg === '--json') options.json = true;
    else if (arg === '--allow-unknown') options.allowUnknown = true;
    else throw new Error('Unknown argument: ' + arg);
  }
  return options;
}

function licenseValue(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object' && typeof value.type === 'string') return value.type.trim();
  return '';
}

function isKnownExpression(expression) {
  // Deliberately supports only simple identifiers and parenthesized AND/OR
  // combinations of recognized SPDX identifiers; deprecated/LicenseRef
  // expressions are surfaced for manual review rather than silently passed.
  const normalized = expression.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = normalized.split(' ').filter(Boolean);
  if (!tokens.length) return false;
  let expectLicense = true;
  for (const token of tokens) {
    if (expectLicense) {
      if (!KNOWN_SIMPLE_LICENSES.has(token)) return false;
    } else if (token !== 'AND' && token !== 'OR' && token !== 'WITH') return false;
    expectLicense = !expectLicense;
  }
  return !expectLicense;
}

function inventory(lock) {
  if (!lock.packages || typeof lock.packages !== 'object') {
    throw new Error('package-lock.json is missing the packages map; regenerate it with the supported npm version.');
  }
  const packages = [];
  for (const [installPath, metadata] of Object.entries(lock.packages)) {
    if (!installPath.startsWith('node_modules/')) continue;
    const license = licenseValue(metadata.license);
    packages.push({
      name: installPath.slice('node_modules/'.length),
      version: String(metadata.version || ''),
      license: license || null,
      source: metadata.resolved || null,
      integrity: metadata.integrity || null,
      known: license ? isKnownExpression(license) : false
    });
  }
  return packages.sort((a,b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
}

try {
  const options = parseArgs(process.argv.slice(2));
  const lock = JSON.parse(await readFile(LOCK_PATH, 'utf8'));
  if (lock.lockfileVersion !== 3) throw new Error('Expected npm lockfileVersion 3; found ' + lock.lockfileVersion);
  const packages = inventory(lock);
  const missing = packages.filter(p => !p.license);
  const unknown = packages.filter(p => p.license && !p.known);
  const summary = {};
  for (const pkg of packages) summary[pkg.license || '(missing)'] = (summary[pkg.license || '(missing)'] || 0) + 1;
  const report = {
    lockfileVersion: lock.lockfileVersion,
    packageCount: packages.length,
    licenseCounts: Object.fromEntries(Object.entries(summary).sort(([a],[b]) => a.localeCompare(b))),
    missing,
    unknown,
    packages
  };
  if (options.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    console.log('Locked packages: ' + report.packageCount);
    for (const [license,count] of Object.entries(report.licenseCounts)) console.log('  ' + license + ': ' + count);
    if (missing.length) console.error('Packages with missing license metadata: ' + missing.map(p => p.name+'@'+p.version).join(', '));
    if (unknown.length) console.error('Packages needing manual SPDX review: ' + unknown.map(p => p.name+'@'+p.version+' ('+p.license+')').join(', '));
    console.log('This check validates metadata shape only; it does not establish legal compatibility or fulfill attribution obligations.');
  }
  if (missing.length || (!options.allowUnknown && unknown.length)) process.exitCode = 1;
} catch (error) {
  console.error('[license-audit] ' + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 2;
}
