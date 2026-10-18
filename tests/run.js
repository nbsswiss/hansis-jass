// Testeinstieg für node und jsc. Im Browser: tests/test.html
import { run } from './testlib.js';
import './core.test.js';
import './ai.test.js';
import './ui.test.js';

const args = globalThis.scriptArgs ?? globalThis.arguments ?? (globalThis.process ? process.argv.slice(2) : []);
const failed = await run(args[0] || '');
if (failed) {
  if (globalThis.process) process.exit(1);
  else if (typeof quit === 'function') quit(1);
}
