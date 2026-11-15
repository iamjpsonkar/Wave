#!/usr/bin/env node
/**
 * Check Wave's resolved npm dependency license metadata against the committed
 * exact-version inventory. This is a metadata control, not a legal review.
 */
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { inventoryFromLock } from './dependency-license-inventory.mjs';

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

  const inventory = inventoryFromLock(lock);
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
    const comparable = value => ({
      generatedFrom: value.generatedFrom,
      root: value.root,
      packageCount: value.packageCount,
      licenseCounts: Object.fromEntries(Object.entries(value.licenseCounts || {}).sort(([a],[b]) => a.localeCompare(b))),
      packages: [...(value.packages || [])].map(pkg => ({
        installPath: pkg.installPath,
        name: pkg.name,
        version: pkg.version,
        license: pkg.license,
        source: pkg.source,
        integrity: pkg.integrity,
        devOnly: pkg.devOnly === true
      })).sort((a,b) => a.installPath.localeCompare(b.installPath))
    });
    const inventoryMatches = JSON.stringify(comparable(inventory)) === JSON.stringify(comparable(committed));

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
