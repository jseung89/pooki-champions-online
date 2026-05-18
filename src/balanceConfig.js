const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const MOVE_BALANCE_OVERRIDES_PATH = path.join(DATA_DIR, "move_balance_overrides.json");
const BATTLE_BALANCE_PATH = path.join(DATA_DIR, "battle_balance.json");

const DEFAULT_BATTLE_BALANCE = {
  sleep: { minTurns: 2, maxTurns: 3 },
  struggle: { power: 50, accuracy: 100, recoilMaxHpRatio: 0.25 },
  defaultPp: {
    heal: 3,
    status: 5,
    buff: 5,
    normalAttack: 10,
    strongAttack: 5,
    dangerAttack: 3,
    multiHit: 8,
    priority: 8,
    explosion: 1,
  },
};

let cachedBattleBalance = null;
let cachedMoveBalanceOverrides = null;

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function readJsonFile(filePath, fallback) {
  try {
    ensureDataDir();
    if (!fs.existsSync(filePath)) return fallback;
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8") || "{}");
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch (err) {
    console.warn(`[BALANCE] failed to read ${path.basename(filePath)}:`, err.message);
    return fallback;
  }
}

function writeJsonFile(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, `${JSON.stringify(data || {}, null, 2)}\n`, "utf8");
}

function toFiniteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clampNumber(value, min, max, fallback) {
  const n = toFiniteNumber(value, fallback);
  return Math.max(min, Math.min(max, n));
}

function normalizeBattleBalance(input) {
  const source = isPlainObject(input) ? input : {};
  const sleep = isPlainObject(source.sleep) ? source.sleep : {};
  const struggle = isPlainObject(source.struggle) ? source.struggle : {};
  const defaultPp = isPlainObject(source.defaultPp) ? source.defaultPp : {};

  let minTurns = Math.round(clampNumber(sleep.minTurns, 0, 10, DEFAULT_BATTLE_BALANCE.sleep.minTurns));
  let maxTurns = Math.round(clampNumber(sleep.maxTurns, 0, 10, DEFAULT_BATTLE_BALANCE.sleep.maxTurns));
  if (maxTurns < minTurns) [minTurns, maxTurns] = [maxTurns, minTurns];

  return {
    sleep: { minTurns, maxTurns },
    struggle: {
      power: Math.round(clampNumber(struggle.power, 1, 999, DEFAULT_BATTLE_BALANCE.struggle.power)),
      accuracy: Math.round(clampNumber(struggle.accuracy, 1, 100, DEFAULT_BATTLE_BALANCE.struggle.accuracy)),
      recoilMaxHpRatio: clampNumber(struggle.recoilMaxHpRatio, 0, 1, DEFAULT_BATTLE_BALANCE.struggle.recoilMaxHpRatio),
    },
    defaultPp: {
      heal: Math.round(clampNumber(defaultPp.heal, 0, 99, DEFAULT_BATTLE_BALANCE.defaultPp.heal)),
      status: Math.round(clampNumber(defaultPp.status, 0, 99, DEFAULT_BATTLE_BALANCE.defaultPp.status)),
      buff: Math.round(clampNumber(defaultPp.buff, 0, 99, DEFAULT_BATTLE_BALANCE.defaultPp.buff)),
      normalAttack: Math.round(clampNumber(defaultPp.normalAttack, 0, 99, DEFAULT_BATTLE_BALANCE.defaultPp.normalAttack)),
      strongAttack: Math.round(clampNumber(defaultPp.strongAttack, 0, 99, DEFAULT_BATTLE_BALANCE.defaultPp.strongAttack)),
      dangerAttack: Math.round(clampNumber(defaultPp.dangerAttack, 0, 99, DEFAULT_BATTLE_BALANCE.defaultPp.dangerAttack)),
      multiHit: Math.round(clampNumber(defaultPp.multiHit, 0, 99, DEFAULT_BATTLE_BALANCE.defaultPp.multiHit)),
      priority: Math.round(clampNumber(defaultPp.priority, 0, 99, DEFAULT_BATTLE_BALANCE.defaultPp.priority)),
      explosion: Math.round(clampNumber(defaultPp.explosion, 0, 99, DEFAULT_BATTLE_BALANCE.defaultPp.explosion)),
    },
  };
}

function normalizeMoveBalanceOverrides(input, knownMoveIds = []) {
  const source = isPlainObject(input) ? input : {};
  const known = new Set(knownMoveIds || []);
  const out = {};
  const errors = [];
  const allowed = new Set(["power", "accuracy", "pp", "maxPp", "healRatio", "recoilRatio", "description", "danger"]);

  for (const [rawId, rawConfig] of Object.entries(source)) {
    const id = String(rawId || "").trim();
    if (!id) continue;
    if (known.size && !known.has(id)) {
      errors.push(`${id}: 존재하지 않는 기술 ID입니다.`);
      continue;
    }
    if (!isPlainObject(rawConfig)) {
      errors.push(`${id}: 설정값은 객체여야 합니다.`);
      continue;
    }
    const clean = {};
    for (const [key, value] of Object.entries(rawConfig)) {
      if (!allowed.has(key)) continue;
      if (value === "" || value === null || value === undefined) continue;
      if (key === "power") clean.power = Math.round(clampNumber(value, 0, 999, 0));
      else if (key === "accuracy") clean.accuracy = Math.round(clampNumber(value, 1, 100, 100));
      else if (key === "pp" || key === "maxPp") {
        const pp = Math.round(clampNumber(value, 0, 99, 0));
        clean.maxPp = pp;
        clean.pp = pp;
      } else if (key === "healRatio") clean.healRatio = clampNumber(value, 0, 1, 0);
      else if (key === "recoilRatio") clean.recoilRatio = clampNumber(value, 0, 1, 0);
      else if (key === "description" || key === "danger") clean.danger = String(value).slice(0, 300);
    }
    if (Object.keys(clean).length) out[id] = clean;
  }
  return { overrides: out, errors };
}

function getBattleBalance() {
  if (!cachedBattleBalance) cachedBattleBalance = normalizeBattleBalance(readJsonFile(BATTLE_BALANCE_PATH, DEFAULT_BATTLE_BALANCE));
  return cachedBattleBalance;
}

function reloadBattleBalance() {
  cachedBattleBalance = normalizeBattleBalance(readJsonFile(BATTLE_BALANCE_PATH, DEFAULT_BATTLE_BALANCE));
  return cachedBattleBalance;
}

function writeBattleBalance(data) {
  const clean = normalizeBattleBalance(data);
  writeJsonFile(BATTLE_BALANCE_PATH, clean);
  cachedBattleBalance = clean;
  return clean;
}

function getMoveBalanceOverrides() {
  if (!cachedMoveBalanceOverrides) cachedMoveBalanceOverrides = readJsonFile(MOVE_BALANCE_OVERRIDES_PATH, {});
  return cachedMoveBalanceOverrides;
}

function reloadMoveBalanceOverrides() {
  cachedMoveBalanceOverrides = readJsonFile(MOVE_BALANCE_OVERRIDES_PATH, {});
  return cachedMoveBalanceOverrides;
}

function writeMoveBalanceOverrides(data) {
  writeJsonFile(MOVE_BALANCE_OVERRIDES_PATH, data || {});
  cachedMoveBalanceOverrides = data || {};
  return cachedMoveBalanceOverrides;
}

function ensureBalanceFiles() {
  ensureDataDir();
  if (!fs.existsSync(MOVE_BALANCE_OVERRIDES_PATH)) writeJsonFile(MOVE_BALANCE_OVERRIDES_PATH, {});
  if (!fs.existsSync(BATTLE_BALANCE_PATH)) writeJsonFile(BATTLE_BALANCE_PATH, DEFAULT_BATTLE_BALANCE);
}

module.exports = {
  DEFAULT_BATTLE_BALANCE,
  MOVE_BALANCE_OVERRIDES_PATH,
  BATTLE_BALANCE_PATH,
  ensureBalanceFiles,
  getBattleBalance,
  reloadBattleBalance,
  writeBattleBalance,
  getMoveBalanceOverrides,
  reloadMoveBalanceOverrides,
  writeMoveBalanceOverrides,
  normalizeBattleBalance,
  normalizeMoveBalanceOverrides,
};
