import { test, eq } from './testlib.js';
import { scoreParts } from '../src/ui/tafel.js';

test('Jasstafel: Punkte in 100er, 50er, 20er und Rest zerlegen', () => {
  eq(scoreParts(1487), { hundreds: 14, fifties: 1, twenties: 1, rest: 17 });
  eq(scoreParts(2290), { hundreds: 22, fifties: 1, twenties: 2, rest: 0 });
  eq(scoreParts(19), { hundreds: 0, fifties: 0, twenties: 0, rest: 19 });
  for (const n of [0, 7, 49, 50, 99, 157, 257, 2513]) {
    const p = scoreParts(n);
    eq(p.hundreds * 100 + p.fifties * 50 + p.twenties * 20 + p.rest, n, `Summe ${n}`);
  }
});
