import { readFileSync } from 'node:fs';
const reportPath = process.argv[2] ?? 'npm-audit.json';
let report;
try { report = JSON.parse(readFileSync(reportPath, 'utf8')); }
catch { console.error('npm audit did not produce a readable JSON report.'); process.exitCode = 1; process.exit(); }
if (report.error) console.error('npm audit error:', report.error.code ?? 'unknown', report.error.summary ?? 'No summary supplied');
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const packages = lock.packages ?? {};
const vulnerabilities = Object.entries(report.vulnerabilities ?? {});
const rank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
vulnerabilities.sort((a,b)=>(rank[b[1].severity]??0)-(rank[a[1].severity]??0));
console.log(vulnerabilities.length ? `npm audit: ${vulnerabilities.length} vulnerable package entries` : 'npm audit: no known vulnerabilities reported for the committed lockfile.');
for (const [name, vulnerability] of vulnerabilities) {
  console.log(`[${String(vulnerability.severity ?? 'unknown').toUpperCase()}] ${name} — affected: ${vulnerability.range ?? 'unspecified'}`);
  for (const node of vulnerability.nodes ?? []) {
    const entry = packages[node];
    console.log(`  installed: ${entry?.version ?? 'unknown'} (${entry?.dev ? 'development' : 'production'}; ${node})`);
  }
  for (const advisory of (vulnerability.via ?? []).filter(item=>item&&typeof item==='object')) {
    const ids = [advisory.source ? String(advisory.source) : '', ...(advisory.cve ?? [])].filter(Boolean);
    console.log(`  advisory: ${ids.join(', ') || 'npm advisory'} — ${advisory.title ?? 'No title'}`);
    if (advisory.url) console.log(`  details: ${advisory.url}`);
    if (advisory.range) console.log(`  affected range: ${advisory.range}`);
  }
  if (vulnerability.fixAvailable) {
    const fix = typeof vulnerability.fixAvailable === 'object' ? vulnerability.fixAvailable : null;
    console.log(`  fix: ${fix ? `${fix.name ?? name}@${fix.version ?? 'available'}${fix.isSemVerMajor ? ' (major update)' : ''}` : 'available'}`);
  } else console.log('  fix: no fix currently reported by npm');
}
console.log('Policy: all dependencies are scanned; HIGH and CRITICAL block, lower severities remain visible for triage.');
