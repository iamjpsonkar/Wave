#!/usr/bin/env node
/**
 * Check Wave's resolved npm dependency license metadata against the committed
 * exact-version inventory. This is a metadata control, not a legal review.
 */
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const LOCK_PATH = new URL('../package-lock.json', import.meta.url);
const INVENTORY_PATH = new URL('../etc/legal/dependency-license-inventory.json', import.meta.url);
const KNOWN_LICENSES = new Set([
  '0BSD', 'Apache-2.0', 'Artistic-2.0', 'BlueOak-1.0.0', 'BSD-2-Clause',
  'BSD-3-Clause', 'CC-BY-4.0', 'CC0-1.0', 'ISC', 'MIT', 'OFL-1.1',
  'Unlicense', 'Zlib'
]);

function parseArgs(args) {
  const options = { json: false, updateInventory: false };
  for (const arg of args) {
    if (arg === '--json') options.json = true;
    else if (arg === '--update-inventory') options.updateInventory = true;
    else throw new Error('Unknown argument: ' + arg);
  }
  if (options.json && options.updateInventory) throw new Error('Use either --json or --update-inventory, not both.');
  return options;
}

function licenseValue(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object' && typeof value.type === 'string') return value.type.trim();
  return '';
}

function inventoryFromLock(lock, lockBlobSha) {
  if (!lock.packages || typeof lock.packages !== 'object') {
    throw new Error('package-lock.json is missing the packages map; regenerate it with the supported npm version.');
  }
  const packages = [];
  for (const [installPath, metadata] of Object.entries(lock.packages)) {
    if (!installPath.startsWith('node_modules/')) continue;
    const license = licenseValue(metadata.license);
    packages.push({
      installPath,
      name: installPath.slice('node_modules/'.length),
      version: String(metadata.version || ''),
      license: license || null,
      source: metadata.resolved || null,
      integrity: metadata.integrity || null,
      devOnly: metadata.dev === true
    });
  }
  packages.sort((a,b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
  const licenseCounts = {};
  for (const pkg of packages) {
    const key = pkg.license || '(missing)';
    licenseCounts[key] = (licenseCounts[key] || 0) + 1;
  }
  const root = lock.packages[''] || {};
  return {
    generatedFrom: 'package-lock.json',
    baselineMainCommit: '7e895f26b05288dc8edfebcf03e14efe954950f5',
    lockfileBlobSha,
    root: {
      name: lock.name || root.name || null,
      version: lock.version || root.version || null,
      license: root.license || null,
      lockfileVersion: lock.lockfileVersion,
      dependencies: root.dependencies || {},
      devDependencies: root.devDependencies || {}
    },
    packageCount: packages.length,
    licenseCounts,
    packages
  };
}

function findMetadataProblems(inventory) {
  const missing = inventory.packages.filter(pkg => !pkg.license);
  const unknown = inventory.packages.filter(pkg => pkg.license && !KNOWN_LICENSES.has(pkg.license));
  return { missing, unknown };
}

try {
  const options = parseArgs(process.argv.slice(2));
  const lockText = await readFile(LOCK_PATH, 'utf8');
  const lock = JSON.parse(lockText);
  if (lock.lockfileVersion !== 3) {
    throw new Error('Expected npm lockfileVersion 3; found ' + lock.lockfileVersion);
  }

  const inventory = inventoryFromLock(lock, null);
  const problems = findMetadataProblems(inventory);
  if (options.updateInventory) {
    await writeFile(INVENTORY_PATH, JSON.stringify(inventory, null, 2) + '\n', 'utf8');
    console.log('Updated etc/legal/dependency-license-inventory.json with ' + inventory.packageCount + ' locked packages.');
  } else if (options.json) {
    process.stdout.write(JSON.stringify({ ...inventory, ...problems }, null, 2) + '\n');
  } else {
    let committed;
    try {
      committed = JSON.parse(await readFile(INVENTORY_PATH, 'utf8'));
    } catch (error) {
      throw new Error('Committed dependency inventory is missing or invalid. Run npm run license:audit:update and review the resulting diff. ' + (error instanceof Error ? error.message : String(error)));
    }
    const currentComparable = { ...inventory, lockfileBlobSha: undefined, baselineMainCommit: undefined };
    const committedComparable = { ...committed, lockfileBlobSha: undefined, baselineMainCommit: undefined };
    const inventoryMatches = JSON.stringify(currentComparable) === JSON.stringify(committedComparable);

    console.log('Locked packages: ' + inventory.packageCount);
    for (const [license,count] of Object.entries(inventory.licenseCounts).sort(([a],[b]) => a.localeCompare(b))) {
      console.log('  ' + license + ': ' + count);
    }
    if (!inventoryMatches) {
      console.error('The committed dependency inventory is stale. After reviewing changed dependencies and upstream notices, run npm run license:audit:update and commit the reviewed inventory.');
    }
    if (problems.missing.length) {
      console.error('Packages with missing license metadata: ' + problems.missing.map(pkg => pkg.name + '@' + pkg.version).join(', '));
    }
    if (problems.unknown.length) {
      console.error('Packages needing manual SPDX review: ' + problems.unknown.map(pkg => pkg.name + '@' + pkg.version + ' (' + pkg.license + ')').join(', '));
    }
    console.log('This check verifies lockfile declarations and inventory freshness only; it does not establish legal compatibility or fulfill attribution obligations.');
    if (!inventoryMatches || problems.missing.length || problems.unknown.length) process.exitCode = 1;
  }
} catch (error) {
  console.error('[license-audit] ' + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 2;
}
