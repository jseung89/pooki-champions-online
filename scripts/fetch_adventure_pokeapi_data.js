#!/usr/bin/env node
/*
 * Development helper for adventure mode data.
 * It fetches PokeAPI data and writes local JSON files. The browser game must use
 * the generated local JSON files, not live API calls during gameplay.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const POKEMON_CACHE = path.join(ROOT, "data", "pokemon_cache_gen2_v590_move_rework.json");
const OUT_EXP = path.join(ROOT, "data", "adventure_exp_table.json");
const OUT_STATS = path.join(ROOT, "data", "adventure_base_stats.json");
const OUT_MOVES = path.join(ROOT, "data", "adventure_moves.json");
const OUT_LEARNSETS = path.join(ROOT, "data", "adventure_learnsets_pokeapi.generated.json");
const OUT_EVOS = path.join(ROOT, "data", "adventure_evolutions.json");
const OUT_CAPTURE = path.join(ROOT, "data", "adventure_capture_rates.json");
const API = "https://pokeapi.co/api/v2";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}
function byNameOrId(p) { return p.apiName || p.id || p.name; }
function chainIdFromUrl(url) { return String(url || "").split("/").filter(Boolean).pop(); }
function walkEvolutionChain(node, out = {}) {
  if (!node?.species?.name) return out;
  for (const next of node.evolves_to || []) {
    const details = next.evolution_details?.[0] || {};
    out[node.species.name] = { toApiName: next.species.name, level: details.min_level || 0, trigger: details.trigger?.name || "unknown" };
    walkEvolutionChain(next, out);
  }
  return out;
}

async function main() {
  const pokemon = JSON.parse(fs.readFileSync(POKEMON_CACHE, "utf8"));
  const exp = {}, stats = {}, learnsets = {}, evolutions = {}, captureRates = {};
  const moveNames = new Set();
  for (const p of pokemon) {
    const key = byNameOrId(p);
    if (!key) continue;
    try {
      const apiPokemon = await fetchJson(`${API}/pokemon/${key}`);
      const apiSpecies = await fetchJson(apiPokemon.species.url);
      const statMap = Object.fromEntries(apiPokemon.stats.map((s) => [s.stat.name, s.base_stat]));
      const statEntry = { hp: statMap.hp || 60, attack: statMap.attack || 60, defense: statMap.defense || 60, speed: statMap.speed || 60 };
      const expEntry = { baseExperience: apiPokemon.base_experience || Math.max(35, Math.round(Object.values(statEntry).reduce((a,b)=>a+b,0)/3)) };
      const captureEntry = { captureRate: apiSpecies.capture_rate || 120, source: "pokeapi" };
      for (const alias of [String(p.id), p.apiName, p.name, apiPokemon.name].filter(Boolean)) {
        exp[alias] = expEntry;
        stats[alias] = statEntry;
        captureRates[alias] = captureEntry;
      }
      learnsets[p.apiName || p.name] = apiPokemon.moves
        .flatMap((m) => (m.version_group_details || []).map((d) => ({ apiName: m.move.name, level: d.level_learned_at || 0, method: d.move_learn_method?.name || "" })))
        .filter((m) => m.method === "level-up" && m.level <= 20)
        .sort((a,b) => a.level - b.level);
      for (const m of learnsets[p.apiName || p.name]) moveNames.add(m.apiName);
      if (apiSpecies.evolution_chain?.url) {
        const chain = await fetchJson(apiSpecies.evolution_chain.url);
        Object.assign(evolutions, walkEvolutionChain(chain.chain));
      }
      console.log(`[ok] ${p.name} / ${apiPokemon.name}`);
      await sleep(120);
    } catch (err) {
      console.warn(`[skip] ${p.name || key}: ${err.message}`);
    }
  }
  const moves = [];
  for (const name of [...moveNames].slice(0, 250)) {
    try {
      const m = await fetchJson(`${API}/move/${name}`);
      moves.push({
        id: name.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), apiName: name,
        name, type: m.type?.name || "normal", power: m.power || 0, accuracy: m.accuracy ?? 100,
        pp: m.pp || 20, maxPp: m.pp || 20, damageClass: m.damage_class?.name || "status",
        effect: m.effect_entries?.find((e) => e.language?.name === "en")?.short_effect || ""
      });
      await sleep(80);
    } catch (err) { console.warn(`[move skip] ${name}: ${err.message}`); }
  }
  fs.writeFileSync(OUT_EXP, `${JSON.stringify(exp, null, 2)}\n`);
  fs.writeFileSync(OUT_STATS, `${JSON.stringify(stats, null, 2)}\n`);
  fs.writeFileSync(OUT_MOVES, `${JSON.stringify({ moves }, null, 2)}\n`);
  fs.writeFileSync(OUT_LEARNSETS, `${JSON.stringify(learnsets, null, 2)}\n`);
  fs.writeFileSync(OUT_EVOS, `${JSON.stringify(evolutions, null, 2)}\n`);
  fs.writeFileSync(OUT_CAPTURE, `${JSON.stringify(captureRates, null, 2)}\n`);
  console.log("Adventure PokeAPI data written.");
}
main().catch((err) => { console.error(err); process.exitCode = 1; });
