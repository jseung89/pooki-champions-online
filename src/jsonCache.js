const fs = require('node:fs');

// External edits become visible within refreshMs; admin saves invalidate immediately.
// Return copies so request-specific edits cannot corrupt the cached source data.
function createJsonCache({ io = fs, now = Date.now, refreshMs = 1000 } = {}) {
  const entries = new Map();
  function read(file, fallback = {}) {
    const time = now(), cached = entries.get(file);
    if (cached && time < cached.checkAt) return structuredClone(cached.value);
    let stat;
    try { stat = io.statSync(file); }
    catch (err) {
      if (err.code !== 'ENOENT') throw err;
      entries.delete(file);
      return structuredClone(fallback);
    }
    const signature = `${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}`;
    if (cached && cached.signature === signature) {
      cached.checkAt = time + refreshMs;
      return structuredClone(cached.value);
    }
    const value = JSON.parse(io.readFileSync(file, 'utf8') || '{}');
    entries.set(file, { signature, value, checkAt: time + refreshMs });
    return structuredClone(value);
  }
  return { read, invalidate: file => entries.delete(file) };
}

module.exports = { createJsonCache };
