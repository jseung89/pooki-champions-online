#!/usr/bin/env node
// PokeAPI level-up learnset collector for Adventure Mode.
// Usage: node scripts/fetch_adventure_levelup_learnsets.js
// This script is optional and does not run during npm check/start.
const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUT = path.join(DATA_DIR, 'adventure_levelup_learnsets.json');
async function fetchJson(url){ const r = await fetch(url); if(!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); }
async function main(){
  const starter = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'adventure_starter_pool.json'), 'utf8'));
  const names = [...new Set((starter.starters||[]).map(x=>x.apiName).filter(Boolean))];
  const out = {};
  for(const name of names){
    try{
      const p = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const rows=[];
      for(const mv of p.moves||[]){
        for(const d of mv.version_group_details||[]){
          if(d.move_learn_method?.name === 'level-up' && Number(d.level_learned_at)>0) rows.push({level:Number(d.level_learned_at), move: mv.move.name});
        }
      }
      rows.sort((a,b)=>a.level-b.level || a.move.localeCompare(b.move));
      out[name]=rows;
      console.log(`[ok] ${name}: ${rows.length}`);
      await new Promise(r=>setTimeout(r,80));
    }catch(err){ console.warn(`[skip] ${name}: ${err.message}`); }
  }
  fs.writeFileSync(OUT, JSON.stringify(out,null,2)+'\n', 'utf8');
  console.log(`saved ${OUT}`);
}
main().catch(err=>{ console.error(err); process.exit(1); });
