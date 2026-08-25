require('dotenv').config();
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}/enrich`;

async function runCase(casesClient, testCase) {
  const res = await casesClient.post(BASE_URL, testCase.input);
  if (res.status !== 200) {
    return { name: testCase.name, pass: false, reason: `HTTP ${res.status}: ${JSON.stringify(res.body)}` };
  }
  const out = res.body;
  const exp = testCase.expected;
  const failures = [];

  const accepted = [exp.category, ...(exp.accept_alternatives ?? [])];
  if (!accepted.includes(out.category)) {
    failures.push(`category: expected ${accepted.join('|')} (alt ok), got "${out.category}"`);
  }
  if (exp.quality_flags_include && !out.quality_flags?.includes(exp.quality_flags_include)) {
    failures.push(`quality_flags: expected to include "${exp.quality_flags_include}", got ${JSON.stringify(out.quality_flags)}`);
  }
  if (typeof exp.confidence_below === 'number' && !(out.confidence < exp.confidence_below)) {
    failures.push(`confidence: expected below ${exp.confidence_below}, got ${out.confidence}`);
  }

  return failures.length === 0
    ? { name: testCase.name, pass: true, output: out }
    : { name: testCase.name, pass: false, reason: failures.join('; '), output: out };
}

async function main() {
  const casesPath = path.join(__dirname, '..', 'evals', 'cases.json');
  const cases = JSON.parse(await readFile(casesPath, 'utf8'));

  // keep-alive agent so all calls reuse one connection
  const http = require('node:http');
  const agent = new http.Agent({ keepAlive: true });
  const casesClient = {
    post(url, body) {
      return new Promise((resolve, reject) => {
        const req = http.request(url, { method: 'POST', agent, headers: { 'Content-Type': 'application/json' } }, (res) => {
          let data = '';
          res.on('data', (c) => { data += c; });
          res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
        });
        req.on('error', reject);
        req.end(JSON.stringify(body));
      });
    },
  };

  console.log(`Running ${cases.length} eval cases against ${BASE_URL} ...\n`);
  const filters = process.argv.slice(2).map((f) => f.toLowerCase());
  const selected = filters.length > 0
    ? cases.filter((c) => filters.some((f) => c.name.toLowerCase().includes(f)))
    : cases;
  const results = [];
  for (const testCase of selected) {
    process.stdout.write(`- ${testCase.name} ... `);
    try {
      const result = await runCase(casesClient, testCase);
      results.push(result);
      console.log(result.pass ? 'PASS' : `FAIL — ${result.reason}`);
    } catch (err) {
      results.push({ name: testCase.name, pass: false, reason: err.message });
      console.log(`FAIL — ${err.message}`);
    }
  }

  const passed = results.filter((r) => r.pass).length;
  console.log(`\nScore: ${passed}/${results.length} (${Math.round((passed / results.length) * 100)}%)`);
  const failed = results.filter((r) => !r.pass);
  if (failed.length > 0) {
    console.log('\nFailed cases:');
    failed.forEach((f) => console.log(`  ✗ ${f.name}\n    ${f.reason}${f.output ? `\n    got: ${JSON.stringify(f.output)}` : ''}`));
  }
}

main().catch((err) => {
  console.error(`Eval run failed: ${err.message}`);
  process.exit(1);
});
