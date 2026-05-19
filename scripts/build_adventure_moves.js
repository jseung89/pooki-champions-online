#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const rawPath = path.join(root, 'data', 'adventure_moves_raw.json');
const outPath = path.join(root, 'data', 'adventure_moves.json');
const blockedPath = path.join(root, 'data', 'adventure_blocked_moves.json');
function readJson(file, fallback){ try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return fallback; } }
const raw = readJson(rawPath, { moves: [] });
const blocked = new Set(readJson(blockedPath, { blocked: [] }).blocked || []);
const safeMoves = (raw.moves || []).filter(m => m && !blocked.has(m.id) && !blocked.has(m.name) && !blocked.has(m.apiName));
if (safeMoves.length) {
  fs.writeFileSync(outPath, JSON.stringify({ moves: safeMoves }, null, 2));
  console.log(`[Adventure] wrote ${safeMoves.length} curated moves to ${outPath}`);
} else {
  console.log('[Adventure] no raw moves to build; existing adventure_moves.json left unchanged.');
}
