#!/usr/bin/env node
/*
  v6.18.21 PokeAPI Level-Up Learnset Review Export

  Development/review script only.
  - Does NOT overwrite data/adventure_levelup_learnsets.json.
  - Does NOT modify browser/game code.
  - Fetches National Dex 1~251 from PokeAPI and exports only
    heartgold-soulsilver level-up moves with level_learned_at > 0.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const TARGET_VERSION_GROUP = process.env.POKEAPI_VERSION_GROUP || 'heartgold-soulsilver';
const POKEAPI_BASE = process.env.POKEAPI_BASE || 'https://pokeapi.co/api/v2';
const START_ID = 1;
const END_ID = 251;
const REQUEST_DELAY_MS = Number(process.env.POKEAPI_DELAY_MS || 80);
const RETRY_COUNT = Number(process.env.POKEAPI_RETRIES || 2);
const REQUEST_TIMEOUT_MS = Number(process.env.POKEAPI_TIMEOUT_MS || 15000);

const OUT_JSON = path.join(DATA_DIR, 'review_levelup_learnsets_hgss.json');
const OUT_CSV = path.join(DATA_DIR, 'review_levelup_learnsets_hgss.csv');
const OUT_SAMPLE_CSV = path.join(DATA_DIR, 'review_levelup_learnsets_samples_hgss.csv');
const OUT_REPORT = path.join(DATA_DIR, 'review_levelup_unmapped_report_hgss.json');
const OUT_SUMMARY = path.join(DATA_DIR, 'review_levelup_validation_summary_hgss.txt');

const SAMPLE_POKEMON = new Set([
  'pikachu', 'charmander', 'squirtle', 'bulbasaur', 'dratini', 'abra',
  'sandshrew', 'marill', 'corsola', 'larvitar', 'omanyte', 'swinub'
]);

const SUSPICIOUS_CHECKS = [
  { key: 'dratini Lv8 dragon-pulse', pokemon: 'dratini', move: 'dragon-pulse', maxLevel: 8 },
  { key: 'dratini Lv12 tackle', pokemon: 'dratini', move: 'tackle', exactLevel: 12 },
  { key: 'abra low-level psychic', pokemon: 'abra', move: 'psychic', maxLevel: 10 },
  { key: 'pikachu low-level thunder', pokemon: 'pikachu', move: 'thunder', maxLevel: 10 },
  { key: 'sandshrew Lv8 earthquake', pokemon: 'sandshrew', move: 'earthquake', exactLevel: 8 },
  { key: 'pikachu surf level-up', pokemon: 'pikachu', move: 'surf' },
  { key: 'pikachu dig level-up', pokemon: 'pikachu', move: 'dig' },
  { key: 'pikachu brick-break level-up', pokemon: 'pikachu', move: 'brick-break' }
];

function readJson(relativePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(file, rows) {
  const header = ['pokemonId', 'pokemonName', 'koreanName', 'level', 'move', 'koreanMove', 'method', 'versionGroup', 'source'];
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(header.map((key) => csvCell(row[key])).join(','));
  }
  fs.writeFileSync(file, lines.join('\n') + '\n');
}

function buildPokemonNameMap() {
  const master = readJson('data/pokemon_master_gen1_2.json', []);
  const byId = new Map();
  const byApiName = new Map();
  for (const p of Array.isArray(master) ? master : []) {
    const rec = {
      id: Number(p.id),
      apiName: p.apiName || p.nameEn || p.name,
      koreanName: p.nameKo || p.koreanName || p.name || null
    };
    if (Number.isFinite(rec.id)) byId.set(rec.id, rec);
    if (rec.apiName) byApiName.set(String(rec.apiName).toLowerCase(), rec);
  }
  return { byId, byApiName };
}

function buildMoveNameMap() {
  const explicit = readJson('data/adventure_move_name_map.json', {});
  const movesJson = readJson('data/adventure_moves.json', { moves: [] });
  const map = new Map();

  if (explicit && typeof explicit === 'object' && !Array.isArray(explicit)) {
    for (const [apiName, ko] of Object.entries(explicit)) {
      if (apiName && ko) map.set(String(apiName).toLowerCase(), ko);
    }
  }

  const moveList = Array.isArray(movesJson?.moves) ? movesJson.moves : [];
  for (const m of moveList) {
    const ko = m?.name || null;
    for (const key of [m?.apiName, m?.id]) {
      if (key && ko) map.set(String(key).toLowerCase(), ko);
    }
  }

  return map;
}

async function fetchJson(url) {
  let lastError = null;
  for (let attempt = 0; attempt <= RETRY_COUNT; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < RETRY_COUNT) await sleep(500 * (attempt + 1));
    }
  }
  throw lastError;
}

function extractLevelUpRowsFromPokemon(pokemonData, pokemonMeta, moveNameMap, report) {
  const rows = [];
  const seen = new Set();
  const pokemonName = pokemonData?.name || pokemonMeta?.apiName || String(pokemonMeta?.id || 'unknown');
  const koreanName = pokemonMeta?.koreanName || null;

  if (!koreanName) report.unmappedPokemonNames.push({ id: pokemonMeta?.id || null, pokemonName });

  for (const mv of pokemonData?.moves || []) {
    const moveName = mv?.move?.name;
    if (!moveName) continue;
    const details = Array.isArray(mv.version_group_details) ? mv.version_group_details : [];
    for (const detail of details) {
      const versionGroup = detail?.version_group?.name;
      const method = detail?.move_learn_method?.name;
      const level = Number(detail?.level_learned_at);
      if (versionGroup !== TARGET_VERSION_GROUP) continue;
      if (method !== 'level-up') continue;
      if (!Number.isFinite(level) || level <= 0) continue;

      const key = `${pokemonName}:${level}:${moveName}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const koreanMove = moveNameMap.get(String(moveName).toLowerCase()) || null;
      if (!koreanMove) report.unmappedMoveNames.push({ pokemonId: pokemonMeta?.id || null, pokemonName, move: moveName });

      rows.push({
        pokemonId: pokemonMeta?.id || Number(pokemonData?.id) || null,
        pokemonName,
        koreanName,
        level,
        move: moveName,
        koreanMove,
        method: 'level-up',
        versionGroup: TARGET_VERSION_GROUP,
        source: 'pokeapi'
      });
    }
  }

  rows.sort((a, b) => a.level - b.level || a.move.localeCompare(b.move));
  return rows;
}

function summarizeSuspicious(rows) {
  const found = [];
  for (const check of SUSPICIOUS_CHECKS) {
    const hit = rows.find((r) => {
      if (r.pokemonName !== check.pokemon) return false;
      if (r.move !== check.move) return false;
      if (check.exactLevel !== undefined) return Number(r.level) === check.exactLevel;
      if (check.maxLevel !== undefined) return Number(r.level) <= check.maxLevel;
      return true;
    });
    found.push({ key: check.key, status: hit ? 'FOUND' : 'NOT FOUND', row: hit || null });
  }
  return found;
}

function buildJsonOutput(groupedRows, pokemonMetaByName) {
  const out = {};
  for (const [pokemonName, rows] of groupedRows.entries()) {
    const meta = pokemonMetaByName.get(pokemonName) || {};
    out[pokemonName] = {
      id: meta.id || rows[0]?.pokemonId || null,
      name: pokemonName,
      koreanName: meta.koreanName || rows[0]?.koreanName || null,
      versionGroup: TARGET_VERSION_GROUP,
      levelUp: rows.map((r) => ({
        level: r.level,
        move: r.move,
        koreanMove: r.koreanMove,
        method: r.method,
        versionGroup: r.versionGroup,
        source: r.source
      }))
    };
  }
  return out;
}

function writeSummary({ rows, sampleRows, report, suspicious }) {
  const methodMismatch = rows.filter((r) => r.method !== 'level-up').length;
  const levelInvalid = rows.filter((r) => !Number.isFinite(Number(r.level)) || Number(r.level) <= 0).length;
  const versionMismatch = rows.filter((r) => r.versionGroup !== TARGET_VERSION_GROUP).length;
  const sampleCounts = {};
  for (const row of sampleRows) sampleCounts[row.pokemonName] = (sampleCounts[row.pokemonName] || 0) + 1;

  const lines = [];
  lines.push('Validation Summary');
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push(`Target version group: ${TARGET_VERSION_GROUP}`);
  lines.push(`Pokemon processed: ${END_ID - START_ID + 1}`);
  lines.push(`Total level-up rows: ${rows.length}`);
  lines.push(`Method mismatch rows: ${methodMismatch}`);
  lines.push(`Level <= 0 rows: ${levelInvalid}`);
  lines.push(`Version group mismatch rows: ${versionMismatch}`);
  lines.push(`Unmapped Pokemon names: ${report.unmappedPokemonNames.length}`);
  lines.push(`Unmapped move names: ${report.unmappedMoveNames.length}`);
  lines.push(`Pokemon without level-up moves: ${report.pokemonWithoutLevelupMoves.length}`);
  lines.push(`Errors: ${report.errors.length}`);
  lines.push('');
  lines.push('Sample Pokemon move counts:');
  for (const name of [...SAMPLE_POKEMON].sort()) lines.push(`- ${name}: ${sampleCounts[name] || 0}`);
  lines.push('');
  lines.push('Suspicious checks:');
  for (const check of suspicious) lines.push(`- ${check.key}: ${check.status}`);
  fs.writeFileSync(OUT_SUMMARY, lines.join('\n') + '\n');
}

(async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const { byId, byApiName } = buildPokemonNameMap();
  const moveNameMap = buildMoveNameMap();
  const report = {
    versionGroup: TARGET_VERSION_GROUP,
    pokemonCount: END_ID - START_ID + 1,
    unmappedPokemonNames: [],
    unmappedMoveNames: [],
    pokemonWithoutLevelupMoves: [],
    errors: [],
    generatedAt: new Date().toISOString()
  };

  const allRows = [];
  const groupedRows = new Map();

  console.log(`Target version group: ${TARGET_VERSION_GROUP}`);
  console.log(`Fetching Pokemon ${START_ID}~${END_ID} from ${POKEAPI_BASE}`);

  // Fail fast when the current environment cannot resolve/reach PokeAPI.
  // This prevents 251 repeated DNS/timeout failures while still leaving a clear report.
  try {
    await fetchJson(`${POKEAPI_BASE}/pokemon/1`);
  } catch (err) {
    report.errors.push({
      id: null,
      pokemonName: 'preflight',
      error: `PokeAPI preflight failed: ${err?.message || String(err)}`
    });
    report.generatedAt = new Date().toISOString();
    writeJson(OUT_JSON, {});
    writeCsv(OUT_CSV, []);
    writeCsv(OUT_SAMPLE_CSV, []);
    writeJson(OUT_REPORT, report);
    writeSummary({ rows: [], sampleRows: [], report, suspicious: summarizeSuspicious([]) });
    console.error('PokeAPI preflight failed. Network/DNS access is required to generate review learnsets.');
    console.error(err?.message || err);
    process.exit(1);
  }

  for (let id = START_ID; id <= END_ID; id += 1) {
    const meta = byId.get(id) || { id, apiName: String(id), koreanName: null };
    const requestName = meta.apiName || String(id);
    try {
      const pokemonData = await fetchJson(`${POKEAPI_BASE}/pokemon/${encodeURIComponent(requestName)}`);
      const rows = extractLevelUpRowsFromPokemon(pokemonData, { ...meta, id }, moveNameMap, report);
      const pokemonName = pokemonData?.name || meta.apiName || String(id);
      if (!rows.length) report.pokemonWithoutLevelupMoves.push({ id, pokemonName, koreanName: meta.koreanName || null });
      groupedRows.set(pokemonName, rows);
      allRows.push(...rows);
      console.log(`OK ${id} ${pokemonName}: ${rows.length} level-up rows`);
      await sleep(REQUEST_DELAY_MS);
    } catch (err) {
      report.errors.push({ id, pokemonName: requestName, error: err?.message || String(err) });
      console.warn(`FAIL ${id} ${requestName}: ${err?.message || err}`);
    }
  }

  allRows.sort((a, b) => a.pokemonId - b.pokemonId || a.level - b.level || a.move.localeCompare(b.move));
  const sampleRows = allRows.filter((row) => SAMPLE_POKEMON.has(row.pokemonName));
  const pokemonMetaByName = new Map();
  for (const [apiName, meta] of byApiName.entries()) pokemonMetaByName.set(apiName, meta);
  const jsonOut = buildJsonOutput(groupedRows, pokemonMetaByName);
  const suspicious = summarizeSuspicious(allRows);

  report.unmappedPokemonNames = Array.from(new Map(report.unmappedPokemonNames.map((x) => [`${x.id}:${x.pokemonName}`, x])).values());
  report.unmappedMoveNames = Array.from(new Map(report.unmappedMoveNames.map((x) => [`${x.move}`, x])).values());
  report.suspiciousChecks = suspicious;

  writeJson(OUT_JSON, jsonOut);
  writeCsv(OUT_CSV, allRows);
  writeCsv(OUT_SAMPLE_CSV, sampleRows);
  writeJson(OUT_REPORT, report);
  writeSummary({ rows: allRows, sampleRows, report, suspicious });

  const badMethods = allRows.filter((r) => r.method !== 'level-up').length;
  const badLevels = allRows.filter((r) => Number(r.level) <= 0).length;
  const badVersions = allRows.filter((r) => r.versionGroup !== TARGET_VERSION_GROUP).length;
  const suspiciousFound = suspicious.filter((x) => x.status === 'FOUND');

  console.log('');
  console.log(`Pokemon processed: ${END_ID - START_ID + 1 - report.errors.length}/${END_ID - START_ID + 1}`);
  console.log(`Total level-up move rows: ${allRows.length}`);
  console.log(`Pokemon without level-up moves: ${report.pokemonWithoutLevelupMoves.length}`);
  console.log(`Unmapped Pokemon names: ${report.unmappedPokemonNames.length}`);
  console.log(`Unmapped move names: ${report.unmappedMoveNames.length}`);
  console.log(`Errors: ${report.errors.length}`);
  console.log(`Method mismatch rows: ${badMethods}`);
  console.log(`Level <= 0 rows: ${badLevels}`);
  console.log(`Version group mismatch rows: ${badVersions}`);
  console.log(`Suspicious FOUND: ${suspiciousFound.length}`);

  if (report.errors.length) {
    console.error('Fetch completed with errors. See data/review_levelup_unmapped_report_hgss.json');
    process.exitCode = 1;
  }
  if (badMethods || badLevels || badVersions || suspiciousFound.length) {
    console.error('Validation failed. See data/review_levelup_validation_summary_hgss.txt');
    process.exitCode = 1;
  }
})();
