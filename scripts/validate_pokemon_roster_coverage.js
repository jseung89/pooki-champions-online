#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = (p, fallback) => { try { return JSON.parse(fs.readFileSync(path.join(root,p),'utf8')); } catch { return fallback; } };
const master = read('data/pokemon_master_gen1_2.json', []);
const profiles = read('data/render_profiles_custom.json', {});
const learnsets = read('data/adventure_levelup_learnsets.json', {});
const allowed = read('data/adventure_pokemon_allowed_moves.json', {});
const missing = { profiles: [], learnsets: [], allowedMoves: [], sprites: [], types: [], baseStats: [], evolutionStage: [] };
for (const p of master) {
  const keys = [p.nameKo, p.name, p.apiName, String(p.id)].filter(Boolean);
  if (!profiles[p.apiName]) missing.profiles.push(`${p.id}:${p.nameKo}`);
  if (!keys.some(k => learnsets[k])) missing.learnsets.push(`${p.id}:${p.nameKo}`);
  if (!keys.some(k => allowed[k])) missing.allowedMoves.push(`${p.id}:${p.nameKo}`);
  if (!p.spriteFront && !p.frontSprite) missing.sprites.push(`${p.id}:${p.nameKo}`);
  if (!Array.isArray(p.types) || !p.types.length) missing.types.push(`${p.id}:${p.nameKo}`);
  if (!p.baseStats || !Object.keys(p.baseStats).length) missing.baseStats.push(`${p.id}:${p.nameKo}`);
  if (p.evolutionStage === null || p.evolutionStage === undefined) missing.evolutionStage.push(`${p.id}:${p.nameKo}`);
}
console.log(JSON.stringify({ total: master.length, missing }, null, 2));
const hardFail = missing.sprites.length || missing.types.length || missing.baseStats.length || missing.evolutionStage.length;
process.exit(hardFail ? 1 : 0);
