const fs = require("fs");
const path = require("path");
const { MOVES, MOVE_LIST, isAttackMove, isStatusMove, isPremiumMove } = require("./moveLibrary");
const { battleEffectiveness } = require("./typeChart");

const EXCLUDED_POKEMON_IDS = new Set([132, 202, 235]); // 메타몽 / 마자용 / 루브도
const LEGENDARY_IDS = new Set([144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251]);

const BAD_EARLY_MOVE_IDS = new Set([
  "tackle",
  "growl",
  "ember",
  "waterGun",
  "thunderShock",
  "rockThrow",
  "vineWhip",
]);

const PREMIUM_LIMIT_FOR_LEGENDARY = 2;

const SIGNATURE_MOVESETS = {
  3: ["woodHammer", "sludgeBomb", "sleepPowder", "synthesis"],
  6: ["flareBlitz", "airSlash", "dragonClaw", "flamethrower"],
  9: ["surf", "waterfall", "iceBeam", "ironDefense"],
  12: ["bugBite", "airSlash", "sleepPowder", "quiverDance"],
  15: ["poisonJab", "xScissor", "swordDance", "furyCutter"],
  18: ["braveBird", "airSlash", "quickAttack", "agility"],
  20: ["bodySlam", "crunch", "suckerPunch", "quickAttack"],
  22: ["braveBird", "airSlash", "quickAttack", "scaryFace"],
  24: ["poisonJab", "crunch", "earthquake", "scaryFace"],
  25: ["thunderbolt", "quickAttack", "ironTail", "thunderWave"],
  26: ["thunderbolt", "quickAttack", "ironTail", "thunderWave"],
  28: ["earthquake", "slash", "rockSlide", "swordDance"],
  31: ["sludgeBomb", "earthquake", "bodySlam", "charm"],
  34: ["sludgeBomb", "earthquake", "thunderbolt", "crunch"],
  36: ["bodySlam", "psychic", "charm", "sing"],
  38: ["flamethrower", "energyBall", "willOWisp", "quickAttack"],
  40: ["bodySlam", "sing", "perishSong", "charm"],
  42: ["airSlash", "poisonJab", "crunch", "bite"],
  45: ["energyBall", "sludgeBomb", "sleepPowder", "synthesis"],
  47: ["bulletSeed", "bugBite", "sleepPowder", "poisonPowder"],
  49: ["bugBite", "psychic", "sleepPowder", "quiverDance"],
  51: ["earthquake", "rockSlide", "suckerPunch", "scaryFace"],
  53: ["slash", "suckerPunch", "quickAttack", "nastyPlot"],
  55: ["surf", "aquaTail", "iceBeam", "psychic"],
  57: ["brickBreak", "machPunch", "bulkUp", "screech"],
  59: ["flareBlitz", "crunch", "extremeSpeed", "willOWisp"],
  62: ["surf", "brickBreak", "bulkUp", "hypnosis"],
  65: ["psychic", "shadowBall", "nastyPlot", "recover"],
  68: ["closeCombat", "powerUpPunch", "drainPunch", "bulkUp"],
  71: ["energyBall", "bulletSeed", "sleepPowder", "sludgeBomb"],
  73: ["surf", "sludgeBomb", "iceBeam", "sleepPowder"],
  76: ["earthquake", "stoneEdge", "explosion", "ironDefense"],
  78: ["flamethrower", "quickAttack", "ironTail", "willOWisp"],
  80: ["surf", "psychic", "iceBeam", "recover"],
  82: ["thunderbolt", "ironTail", "thunderWave", "metalSound"],
  83: ["airSlash", "slash", "swordDance", "featherDance"],
  85: ["airSlash", "quickAttack", "featherDance", "scaryFace"],
  87: ["surf", "iceBeam", "rest", "bodySlam"],
  89: ["sludgeBomb", "crunch", "poisonPowder", "willOWisp"],
  91: ["iceBeam", "surf", "rockSlide", "ironDefense"],
  94: ["shadowBall", "shadowClaw", "hypnosis", "nastyPlot"],
  95: ["rockBlast", "earthquake", "ironDefense", "screech"],
  97: ["psychic", "shadowBall", "hypnosis", "nastyPlot"],
  99: ["surf", "brickBreak", "slash", "aquaJet"],
  101: ["thunderbolt", "thunderWave", "explosion", "agility"],
  103: ["psychic", "energyBall", "sleepPowder", "synthesis"],
  105: ["boneRush", "earthquake", "rockSlide", "swordDance"],
  106: ["brickBreak", "machPunch", "bulkUp", "screech"],
  107: ["brickBreak", "machPunch", "bulkUp", "bulletPunch"],
  108: ["bodySlam", "crunch", "earthquake", "rest"],
  110: ["sludgeBomb", "flamethrower", "willOWisp", "explosion"],
  112: ["earthquake", "rockSlide", "ironTail", "scaryFace"],
  113: ["bodySlam", "recover", "thunderWave", "charm"],
  114: ["energyBall", "sleepPowder", "synthesis", "crunch"],
  115: ["bodySlam", "suckerPunch", "earthquake", "quickAttack"],
  117: ["surf", "iceBeam", "dragonBreath", "agility"],
  119: ["surf", "poisonJab", "aquaJet", "scaryFace"],
  121: ["surf", "psychic", "thunderbolt", "recover"],
  122: ["psychic", "thunderbolt", "thunderWave", "recover"],
  123: ["xScissor", "slash", "swordDance", "furyCutter"],
  124: ["iceBeam", "psychic", "sing", "recover"],
  125: ["thunderbolt", "brickBreak", "quickAttack", "thunderWave"],
  126: ["flamethrower", "brickBreak", "willOWisp", "quickAttack"],
  127: ["bugBite", "brickBreak", "swordDance", "bulkUp"],
  128: ["bodySlam", "earthquake", "rockSlide", "quickAttack"],
  130: ["waterfall", "crunch", "aquaTail", "dragonDance"],
  131: ["surf", "iceBeam", "rest", "sing"],
  134: ["surf", "iceBeam", "recover", "aquaJet"],
  135: ["thunderbolt", "shadowBall", "quickAttack", "thunderWave"],
  136: ["flamethrower", "crunch", "quickAttack", "willOWisp"],
  137: ["psychic", "thunderbolt", "iceBeam", "recover"],
  139: ["surf", "rockSlide", "iceBeam", "scaryFace"],
  141: ["surf", "rockSlide", "slash", "aquaJet"],
  142: ["headSmash", "stoneEdge", "airSlash", "dragonClaw"],
  143: ["doubleEdge", "earthquake", "crunch", "rest"],
  144: ["iceBeam", "airSlash", "agility", "rest"],
  145: ["thunderbolt", "airSlash", "thunderWave", "agility"],
  146: ["braveBird", "flamethrower", "airSlash", "willOWisp"],
  149: ["outrage", "dragonClaw", "dragonDance", "extremeSpeed"],
  150: ["psychic", "shadowBall", "recover", "darkPulse"],
  151: ["psychic", "energyBall", "thunderWave", "recover"],

  154: ["woodHammer", "energyBall", "synthesis", "sleepPowder"],
  157: ["flareBlitz", "overheat", "quickAttack", "willOWisp"],
  160: ["waterfall", "crunch", "iceBeam", "aquaJet"],
  162: ["bodySlam", "quickAttack", "crunch", "scaryFace"],
  164: ["airSlash", "psychic", "hypnosis", "recover"],
  166: ["bugBite", "machPunch", "agility", "featherDance"],
  168: ["bugBite", "poisonJab", "stringShot", "poisonPowder"],
  169: ["braveBird", "poisonJab", "crunch", "hypnosis"],
  171: ["surf", "thunderbolt", "thunderWave", "recover"],
  176: ["airSlash", "psychic", "sing", "charm"],
  178: ["psychic", "airSlash", "hypnosis", "featherDance"],
  181: ["wildCharge", "thunderbolt", "dragonPulse", "thunderWave"],
  182: ["woodHammer", "sludgeBomb", "sleepPowder", "synthesis"],
  184: ["surf", "bodySlam", "aquaJet", "rest"],
  185: ["rockSlide", "earthquake", "screech", "ironDefense"],
  186: ["surf", "iceBeam", "sing", "scaryFace"],
  189: ["energyBall", "sleepPowder", "synthesis", "charm"],
  192: ["woodHammer", "sludgeBomb", "synthesis", "sleepPowder"],
  195: ["surf", "earthquake", "rest", "bulkUp"],
  196: ["psychic", "shadowBall", "nastyPlot", "quickAttack"],
  197: ["crunch", "charm", "nastyPlot", "recover"],
  198: ["crunch", "airSlash", "suckerPunch", "quickAttack"],
  199: ["surf", "psychic", "iceBeam", "recover"],
  200: ["shadowBall", "hypnosis", "perishSong", "nastyPlot"],
  203: ["psychic", "bodySlam", "crunch", "agility"],
  205: ["bugBite", "ironTail", "explosion", "ironDefense"],
  206: ["bodySlam", "rockSlide", "quickAttack", "sing"],
  207: ["earthquake", "airSlash", "suckerPunch", "scaryFace"],
  208: ["headSmash", "ironHead", "earthquake", "ironDefense"],
  210: ["bodySlam", "crunch", "brickBreak", "scaryFace"],
  211: ["surf", "poisonJab", "aquaJet", "scaryFace"],
  212: ["xScissor", "ironHead", "bulletPunch", "swordDance"],
  213: ["rockBlast", "bugBite", "rest", "ironDefense"],
  214: ["xScissor", "closeCombat", "bulkUp", "stoneEdge"],
  215: ["crunch", "iceBeam", "suckerPunch", "quickAttack"],
  217: ["doubleEdge", "crunch", "earthquake", "rest"],
  219: ["flamethrower", "rockSlide", "earthquake", "willOWisp"],
  221: ["earthquake", "icicleSpear", "rockSlide", "scaryFace"],
  222: ["surf", "rockSlide", "recover", "thunderWave"],
  224: ["surf", "iceBeam", "sludgeBomb", "scaryFace"],
  225: ["braveBird", "iceBeam", "quickAttack", "agility"],
  226: ["surf", "airSlash", "iceBeam", "agility"],
  227: ["braveBird", "ironHead", "airSlash", "ironDefense"],
  229: ["crunch", "flamethrower", "suckerPunch", "willOWisp"],
  230: ["surf", "dragonPulse", "scaleShot", "aquaTail"],
  232: ["earthquake", "rockSlide", "ironTail", "scaryFace"],
  233: ["psychic", "thunderbolt", "iceBeam", "recover"],
  234: ["bodySlam", "psychic", "hypnosis", "quickAttack"],
  237: ["closeCombat", "machPunch", "powerUpPunch", "bulkUp"],
  241: ["doubleEdge", "earthquake", "milkDrink", "charm"],
  242: ["bodySlam", "recover", "thunderWave", "charm"],
  243: ["wildCharge", "thunderbolt", "shadowBall", "agility"],
  244: ["flareBlitz", "flamethrower", "bite", "willOWisp"],
  245: ["surf", "iceBeam", "rest", "scaryFace"],
  248: ["crunch", "headSmash", "stoneEdge", "dragonDance"],
  249: ["braveBird", "psychic", "dragonPulse", "recover"],
  250: ["braveBird", "overheat", "recover", "flamethrower"],
  251: ["energyBall", "psychic", "synthesis", "thunderWave"],
};


const CUSTOM_MOVES_PATH = path.join(__dirname, "..", "data", "pokemon_moves_custom.json");
let customMoveCache = { mtimeMs: -1, data: {} };

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
}

function readCustomMoveMap() {
  try {
    if (!fs.existsSync(CUSTOM_MOVES_PATH)) return {};
    const stat = fs.statSync(CUSTOM_MOVES_PATH);
    if (customMoveCache.mtimeMs === stat.mtimeMs) return customMoveCache.data;
    const parsed = JSON.parse(fs.readFileSync(CUSTOM_MOVES_PATH, "utf8") || "{}");
    customMoveCache = {
      mtimeMs: stat.mtimeMs,
      data: parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {},
    };
    return customMoveCache.data;
  } catch (err) {
    console.warn("[MOVE_ADMIN] custom move map read failed", err.message);
    return {};
  }
}

function moveIdsToMoves(ids) {
  if (!Array.isArray(ids) || ids.length !== 4) return null;
  const moves = ids.map((id) => MOVES[String(id || "").trim()]).filter(Boolean);
  if (moves.length !== 4) return null;
  return uniqueMoves(moves).length === 4 ? moves : moves;
}

function customMoveSetForPokemon(pokemon) {
  const map = readCustomMoveMap();
  const candidates = [pokemon?.apiName, pokemon?.name, pokemon?.id].map(normalizeKey).filter(Boolean);
  for (const key of candidates) {
    const moves = moveIdsToMoves(map[key]);
    if (moves) return moves;
  }
  return null;
}

function uniqueMoves(moves) {
  const seen = new Set();
  const result = [];
  for (const move of moves) {
    if (!move || seen.has(move.id)) continue;
    seen.add(move.id);
    result.push(move);
  }
  return result;
}

function byScoreDesc(a, b) {
  const score = (m) => (m.power || 0) * ((m.accuracy || 100) / 100) + (m.priority || 0) * 18;
  return score(b) - score(a);
}

function isLegendary(pokemon) {
  return LEGENDARY_IDS.has(Number(pokemon.id));
}

function isExcludedPokemon(pokemon) {
  return EXCLUDED_POKEMON_IDS.has(Number(pokemon.id));
}

function countPremium(moves) {
  return moves.filter(isPremiumMove).length;
}

function trimLegendaryPremium(moves) {
  const result = [];
  let premiumCount = 0;
  for (const move of moves) {
    if (isPremiumMove(move)) {
      if (premiumCount >= PREMIUM_LIMIT_FOR_LEGENDARY) continue;
      premiumCount += 1;
    }
    result.push(move);
  }
  return result;
}

function moveFromId(id) {
  return MOVES[id] || null;
}

function signatureMoves(pokemon) {
  const ids = SIGNATURE_MOVESETS[pokemon.id];
  if (!ids) return null;
  let moves = uniqueMoves(ids.map(moveFromId));
  if (isLegendary(pokemon)) moves = trimLegendaryPremium(moves);
  return fillToFour(pokemon, moves);
}

function availableMoves(pokemon) {
  const apiMoveNames = new Set(pokemon.availableMoveNames || []);
  // 대표 기술표가 없는 포켓몬도 커스텀 기술을 어느 정도 쓸 수 있게 전체 라이브러리 기반으로 보정한다.
  const learned = MOVE_LIST.filter((move) => apiMoveNames.has(move.apiName));
  const customUseful = MOVE_LIST.filter((move) => !BAD_EARLY_MOVE_IDS.has(move.id));
  return uniqueMoves([...learned, ...customUseful]);
}

function stabMoves(pokemon, moves, selected) {
  return moves
    .filter(isAttackMove)
    .filter((move) => pokemon.types.includes(move.type))
    .filter((move) => !selected.some((s) => s.id === move.id))
    .filter((move) => !BAD_EARLY_MOVE_IDS.has(move.id))
    .sort(byScoreDesc);
}

function coverageScore(move, pokemon) {
  if (!isAttackMove(move)) return -999;
  if (pokemon.types.includes(move.type)) return -30;
  let score = (move.power || 0) * ((move.accuracy || 100) / 100);

  // 내 약점 타입을 찌를 수 있는 공격 타입이면 크게 가산한다.
  for (const defensiveType of Object.keys(require("./typeChart").TYPE_KO)) {
    const incoming = battleEffectiveness(defensiveType, pokemon.types);
    if (incoming > 1) {
      const counter = battleEffectiveness(move.type, [defensiveType]);
      if (counter > 1) score += 90;
      if (counter === 0) score -= 30;
    }
  }

  // 지진/냉동빔 같은 프리미엄 도배 방지
  if (isPremiumMove(move)) score -= 18;
  if (move.id === "earthquake" && !["fire", "flying", "rock", "electric", "poison", "steel"].some((t) => pokemon.types.includes(t))) score -= 35;
  return score;
}

function pickCoverage(pokemon, moves, selected) {
  return moves
    .filter(isAttackMove)
    .filter((move) => !selected.some((s) => s.id === move.id))
    .filter((move) => !pokemon.types.includes(move.type))
    .filter((move) => !BAD_EARLY_MOVE_IDS.has(move.id))
    .sort((a, b) => coverageScore(b, pokemon) - coverageScore(a, pokemon))[0] || null;
}

function tacticalMoves(pokemon, moves, selected) {
  const preferred = moves
    .filter((move) => !selected.some((s) => s.id === move.id))
    .filter((move) => isStatusMove(move) || move.priority > 0)
    .filter((move) => !BAD_EARLY_MOVE_IDS.has(move.id))
    .sort((a, b) => {
      const weight = (m) => {
        let score = 0;
        if (m.rest || m.heal) score += 80;
        if (m.priority > 0) score += 70 + m.priority * 15;
        if (m.statusMove) score += 58;
        if (m.statChange) score += 42;
        if (m.fixedDamageRatio) score += 75;
        return score;
      };
      return weight(b) - weight(a);
    });
  return preferred[0] || null;
}

function fillToFour(pokemon, selected) {
  selected = uniqueMoves(selected);

  const moves = availableMoves(pokemon);

  if (isLegendary(pokemon)) selected = trimLegendaryPremium(selected);

  while (selected.length < 4) {
    const tactical = tacticalMoves(pokemon, moves, selected);
    if (tactical) {
      selected.push(tactical);
      continue;
    }

    const coverage = pickCoverage(pokemon, moves, selected);
    if (coverage) {
      selected.push(coverage);
      continue;
    }

    const attack = moves
      .filter(isAttackMove)
      .filter((move) => !selected.some((s) => s.id === move.id))
      .filter((move) => !BAD_EARLY_MOVE_IDS.has(move.id))
      .sort(byScoreDesc)[0];

    if (attack) {
      selected.push(attack);
      continue;
    }

    const any = MOVE_LIST.find((move) => !selected.some((s) => s.id === move.id));
    if (!any) break;
    selected.push(any);
  }

  selected = uniqueMoves(selected);
  if (isLegendary(pokemon)) selected = trimLegendaryPremium(selected);

  return selected.slice(0, 4);
}

function buildAlgorithmicMoveSet(pokemon) {
  const moves = availableMoves(pokemon);
  const selected = [];

  const primaryType = pokemon.types[0];
  const secondaryType = pokemon.types[1];

  const primary = stabMoves(pokemon, moves, selected).filter((m) => m.type === primaryType)[0];
  if (primary) selected.push(primary);

  if (secondaryType) {
    const secondary = stabMoves(pokemon, moves, selected).filter((m) => m.type === secondaryType)[0];
    if (secondary) selected.push(secondary);
  } else {
    const risky = stabMoves(pokemon, moves, selected).filter((m) => m.power >= 90 || m.priority > 0)[0];
    if (risky) selected.push(risky);
  }

  const coverage = pickCoverage(pokemon, moves, selected);
  if (coverage) selected.push(coverage);

  const tactical = tacticalMoves(pokemon, moves, selected);
  if (tactical) selected.push(tactical);

  return fillToFour(pokemon, selected);
}

function buildBaseMovesForPokemon(pokemon) {
  if (!pokemon || isExcludedPokemon(pokemon)) return [];
  return signatureMoves(pokemon) || buildAlgorithmicMoveSet(pokemon);
}

function buildMovesForPokemon(pokemon) {
  if (!pokemon || isExcludedPokemon(pokemon)) return [];
  const custom = customMoveSetForPokemon(pokemon);
  if (custom) return custom;
  return buildBaseMovesForPokemon(pokemon);
}

function hasEnoughUsableMoves(pokemon) {
  if (!pokemon || isExcludedPokemon(pokemon)) return false;
  const moves = buildMovesForPokemon(pokemon);
  return moves.length >= 4 && moves.some(isAttackMove);
}

module.exports = {
  buildMovesForPokemon,
  buildBaseMovesForPokemon,
  hasEnoughUsableMoves,
  buildDualTypeMoveSet: buildAlgorithmicMoveSet,
  buildSingleTypeMoveSet: buildAlgorithmicMoveSet,
  isExcludedPokemon,
  isLegendary,
};
