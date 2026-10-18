// Web Worker: rechnet die Computer-Züge, damit die Oberfläche flüssig bleibt.
import { decide } from './player.js';

self.onmessage = (e) => {
  const { id, kind, view, settings } = e.data;
  try {
    self.postMessage({ id, result: decide(kind, view, settings, {}) });
  } catch (err) {
    self.postMessage({ id, error: String(err && err.stack || err) });
  }
};
