// Mini-Testbibliothek ohne Abhängigkeiten: läuft in node, jsc (macOS) und im Browser.
const tests = [];
export const out = (msg) => (typeof print === 'function' && typeof window === 'undefined' ? print(msg) : console.log(msg));

export function test(name, fn) { tests.push({ name, fn }); }

export function eq(actual, expected, msg = '') {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg}\n    erwartet: ${e}\n    erhalten: ${a}`);
}
export function ok(cond, msg = 'Bedingung nicht erfüllt') { if (!cond) throw new Error(msg); }
export function throws(fn, msg = 'Fehler erwartet') {
  try { fn(); } catch { return; }
  throw new Error(msg);
}
export const sameSet = (a, b, msg) => eq([...a].sort((x, y) => x - y), [...b].sort((x, y) => x - y), msg);

export async function run(filter = '') {
  let passed = 0, failed = 0;
  const t0 = Date.now();
  for (const t of tests) {
    if (filter && !t.name.includes(filter)) continue;
    try {
      await t.fn();
      passed++;
    } catch (e) {
      failed++;
      out(`✗ ${t.name}\n    ${e && e.message}`);
    }
  }
  out(`${failed ? '✗' : '✓'} ${passed} bestanden, ${failed} fehlgeschlagen (${Date.now() - t0} ms)`);
  return failed;
}
