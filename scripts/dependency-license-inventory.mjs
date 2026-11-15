/** Pure lockfile-to-inventory normalization helpers. */
function licenseValue(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object' && typeof value.type === 'string') return value.type.trim();
  return '';
}

function packageNameFromInstallPath(installPath) {
  // Lockfile install paths can contain ancestor packages for nested installs.
  // The package name is the final node_modules segment and may be scoped.
  const marker = '/node_modules/';
  const finalSegment = installPath.lastIndexOf(marker);
  const packagePath = finalSegment >= 0
    ? installPath.slice(finalSegment + marker.length)
    : installPath.slice('node_modules/'.length);
  if (packagePath.startsWith('@')) {
    const [scope, name] = packagePath.split('/');
    return scope && name ? scope + '/' + name : packagePath;
  }
  return packagePath.split('/')[0];
}

export function inventoryFromLock(lock) {
  if (!lock.packages || typeof lock.packages !== 'object') {
    throw new Error('package-lock.json is missing the packages map; regenerate it with the supported npm version.');
  }
  const packages = [];
  for (const [installPath, metadata] of Object.entries(lock.packages)) {
    if (!installPath.startsWith('node_modules/')) continue;
    const license = licenseValue(metadata.license);
    packages.push({
      installPath,
      name: packageNameFromInstallPath(installPath),
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

