#!/usr/bin/env node
/*
  모험모드 레벨업 기술표 수집 스크립트.
  - 게임 실행 중에는 PokeAPI를 호출하지 않는다.
  - 이 스크립트는 개발/관리자용으로만 실행한다.
  - 출력: data/adventure_levelup_learnsets_raw.json, data/adventure_levelup_learnsets.json
*/
const fs = require('fs');
const path = require('path');
const { MOVE_LIST, MOVES } = require('../src/moveLibrary');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const CACHE = path.join(DATA, 'pokemon_cache_gen2_v590_move_rework.json');
const MAP_PATH = path.join(DATA, 'adventure_move_name_map.json');
const OUT_RAW = path.join(DATA, 'adventure_levelup_learnsets_raw.json');
const OUT = path.join(DATA, 'adventure_levelup_learnsets.json');
const POKE_API = 'https://pokeapi.co/api/v2';
const VERSION_PRIORITY = ['heartgold-soulsilver', 'firered-leafgreen', 'red-blue'];

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function readJson(file, fallback){ try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return fallback; } }
function writeJson(file, data){ fs.writeFileSync(file, JSON.stringify(data,null,2)+'\n'); }
function buildMoveMap(){
  const explicit = readJson(MAP_PATH, {});
  const map = {...explicit};
  for(const m of MOVE_LIST) if(m?.apiName || m?.id) map[m.apiName || m.id] = m.name;
  for(const m of Object.values(MOVES)) if(m?.apiName || m?.id) map[m.apiName || m.id] = m.name;
  return map;
}
function pickVersion(details){
  for(const v of VERSION_PRIORITY){ const found = details.find(d=>d?.version_group?.name===v && d?.move_learn_method?.name==='level-up'); if(found) return found; }
  return details.find(d=>d?.move_learn_method?.name==='level-up') || null;
}
async function fetchPokemon(apiName){
  const res = await fetch(`${POKE_API}/pokemon/${apiName}`);
  if(!res.ok) throw new Error(`${apiName}: HTTP ${res.status}`);
  return res.json();
}
(async()=>{
  const pokemon = readJson(CACHE, []);
  const moveMap = buildMoveMap();
  const implementedKo = new Set([...MOVE_LIST, ...Object.values(MOVES)].map(m=>m?.name).filter(Boolean));
  const raw = {};
  const refined = readJson(OUT, {});
  const failures = [];
  for(const p of pokemon){
    try{
      const data = await fetchPokemon(p.apiName || p.id);
      const rows=[];
      for(const m of data.moves || []){
        const chosen = pickVersion(m.version_group_details || []);
        if(!chosen) continue;
        const level = Number(chosen.level_learned_at || 0);
        if(level<=0) continue;
        const ko = moveMap[m.move?.name] || moveMap[String(m.move?.name || '').replace(/-/g,'_')];
        if(!ko || !implementedKo.has(ko)) continue;
        rows.push({ level, move: ko, apiName: m.move.name, versionGroup: chosen.version_group?.name });
      }
      rows.sort((a,b)=>a.level-b.level || a.move.localeCompare(b.move,'ko'));
      raw[p.name] = rows;
      if(rows.length) refined[p.name] = rows.map(({level,move})=>({level,move}));
      else failures.push({pokemon:p.name, apiName:p.apiName, reason:'no implemented mapped level-up moves'});
      await sleep(80);
    }catch(err){
      failures.push({pokemon:p.name, apiName:p.apiName, reason:err.message});
    }
  }
  writeJson(OUT_RAW, { generatedAt:new Date().toISOString(), versionPriority:VERSION_PRIORITY, failures, raw });
  writeJson(OUT, refined);
  console.log(`updated ${Object.keys(refined).length} learnsets, failures ${failures.length}`);
})();
