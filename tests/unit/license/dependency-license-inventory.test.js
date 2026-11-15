import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryFromLock } from '../../../scripts/dependency-license-inventory.mjs';

test('inventory records the final nested unscoped package name', () => {
  const inventory = inventoryFromLock({
    name: 'wave',
    version: '1.0.0',
    lockfileVersion: 3,
    packages: {
      'node_modules/parse-entities': { version: '2.0.0', license: 'MIT' },
      'node_modules/parse-entities/node_modules/unist-util-stringify-position': { version: '4.0.0', license: 'MIT' }
    }
  });
  assert.equal(
    inventory.packages.find(pkg => pkg.installPath.endsWith('/node_modules/unist-util-stringify-position')).name,
    'unist-util-stringify-position'
  );
});

test('inventory records the complete scoped package name for nested and root installs', () => {
  const inventory = inventoryFromLock({
    name: 'wave',
    version: '1.0.0',
    lockfileVersion: 3,
    packages: {
      'node_modules/parse-entities': { version: '2.0.0', license: 'MIT' },
      'node_modules/parse-entities/node_modules/@types/unist': { version: '2.0.11', license: 'MIT' },
      'node_modules/@types/node': { version: '22.0.0', license: 'MIT' }
    }
  });
  assert.equal(
    inventory.packages.find(pkg => pkg.installPath.endsWith('/node_modules/@types/unist')).name,
    '@types/unist'
  );
  assert.equal(
    inventory.packages.find(pkg => pkg.installPath === 'node_modules/@types/node').name,
    '@types/node'
  );
});
