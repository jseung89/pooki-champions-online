#!/usr/bin/env node
/* Fetches 1~2세대 Pokémon full learnsets from PokeAPI into local JSON files.
 * This is a development script only; the browser game must use local JSON.
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const DATA = path.join(root, 'data');
const read = (file, fallback) => { try { return JSON.parse(fs.readFileSync(path.join(DATA,file),'utf8')); } catch { return fallback; } };
const master = read('pokemon_master_gen1_2.json', []);
const moveMap = read('adventure_move_name_map.json', {});
const movesJson = read('adventure_moves.json', {moves:[]});
const implemented = new Set((movesJson.moves||[]).flatMap(m => [m.name, m.id, m.apiName].filter(Boolean).map(x=>String(x).toLowerCase())));
const versionPriority = ['scarlet-violet','sword-shield','ultra-sun-ultra-moon','heartgold-soulsilver','firered-leafgreen','red-blue'];
const fetchJson = async (url) => { const res = await fetch(url); if(!res.ok) throw new Error(`${res.status} ${url}`); return res.json(); };
const koName = (apiName) => moveMap[apiName] || moveMap[String(apiName).replace(/-/g,'_')] || null;
function methodBucket(method){ if(method==='level-up') return 'levelUp'; if(method==='machine') return 'machine'; if(method==='tutor') return 'tutor'; if(method==='egg') return 'egg'; return null; }
function bestDetails(details){ return (details||[]).slice().sort((a,b)=>{
  const ai=versionPriority.indexOf(a.version_group?.name); const bi=versionPriority.indexOf(b.version_group?.name);
  return (ai<0?999:ai)-(bi<0?999:bi);
}); }
(async()=>{
  const raw = {}, clean = {}, levelRows = {}, allowed = {}, unmapped = [];
  for (const p of master.filter(x=>x.id>=1 && x.id<=251)) {
    const name = p.nameEn || p.apiName || p.id;
    try {
      const data = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const rec = {levelUp:[], machine:[], tutor:[], egg:[], allowedAll:[], rejected:[]};
      raw[p.nameEn] = data.moves;
      const levelTmp = [];
      for (const mv of data.moves || []) {
        for (const d of bestDetails(mv.version_group_details)) {
          const bucket = methodBucket(d.move_learn_method?.name); if(!bucket) continue;
          const en = mv.move?.name; const ko = koName(en);
          if(!ko){ unmapped.push({pokemon:p.nameKo, move:en, method:bucket}); continue; }
          if(!implemented.has(String(ko).toLowerCase())) { rec.rejected.push({move:ko, reason:'not-implemented'}); continue; }
          if(!rec[bucket].includes(ko)) rec[bucket].push(ko);
          if(!rec.allowedAll.includes(ko)) rec.allowedAll.push(ko);
          if(bucket==='levelUp') levelTmp.push({level:Number(d.level_learned_at||1), move:ko});
          break;
        }
      }
      clean[p.nameKo]=clean[p.nameEn]=clean[String(p.id)]=rec;
      allowed[p.nameKo]=allowed[p.nameEn]=allowed[String(p.id)]={levelUp:rec.levelUp, tm:rec.machine, tutor:rec.tutor, egg:rec.egg, coverage:[...rec.machine,...rec.tutor]};
      const rows = Array.from(new Map(levelTmp.sort((a,b)=>a.level-b.level).map(r=>[`${r.level}:${r.move}`,r])).values());
      levelRows[p.nameKo]=levelRows[p.nameEn]=levelRows[String(p.id)]=rows;
      console.log(`OK ${p.id} ${p.nameKo}: ${rec.allowedAll.length} moves`);
      await new Promise(r=>setTimeout(r,80));
    } catch (err) { console.warn(`FAIL ${p.id} ${p.nameKo}:`, err.message); }
  }
  fs.writeFileSync(path.join(DATA,'adventure_pokemon_full_learnsets_raw.json'), JSON.stringify(raw,null,2));
  fs.writeFileSync(path.join(DATA,'adventure_pokemon_full_learnsets.json'), JSON.stringify(clean,null,2));
  fs.writeFileSync(path.join(DATA,'adventure_levelup_learnsets.json'), JSON.stringify(levelRows,null,2));
  fs.writeFileSync(path.join(DATA,'adventure_pokemon_allowed_moves.json'), JSON.stringify(allowed,null,2));
  fs.writeFileSync(path.join(DATA,'adventure_unmapped_moves_report.json'), JSON.stringify({unmappedMoves:unmapped},null,2));
})();
