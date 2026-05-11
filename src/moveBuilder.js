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
  3: ["energyBall", "sludgeBomb", "sleepPowder", "synthesis"],
  6: ["flamethrower", "airSlash", "earthquake", "willOWisp"],
  9: ["surf", "iceBeam", "crunch", "harden"],
  12: ["bugBite", "airSlash", "sleepPowder", "psychic"],
  15: ["poisonJab", "bugBite", "suckerPunch", "swordDance"],
  18: ["airSlash", "quickAttack", "steelWing", "agility"],
  20: ["bodySlam", "crunch", "suckerPunch", "quickAttack"],
  22: ["airSlash", "quickAttack", "steelWing", "scaryFace"],
  24: ["poisonJab", "crunch", "earthquake", "scaryFace"],
  25: ["thunderbolt", "quickAttack", "ironTail", "thunderWave"],
  26: ["thunderbolt", "quickAttack", "ironTail", "thunderWave"],
  28: ["earthquake", "slash", "rockSlide", "swordDance"],
  31: ["sludgeBomb", "earthquake", "iceBeam", "bodySlam"],
  34: ["sludgeBomb", "earthquake", "thunderbolt", "crunch"],
  36: ["bodySlam", "psychic", "recover", "sing"],
  38: ["flamethrower", "energyBall", "willOWisp", "quickAttack"],
  40: ["bodySlam", "sing", "perishSong", "recover"],
  42: ["airSlash", "poisonJab", "crunch", "scaryFace"],
  45: ["energyBall", "sludgeBomb", "sleepPowder", "synthesis"],
  47: ["bugBite", "energyBall", "sleepPowder", "swordDance"],
  49: ["bugBite", "psychic", "sleepPowder", "suckerPunch"],
  51: ["earthquake", "rockSlide", "suckerPunch", "scaryFace"],
  53: ["slash", "suckerPunch", "quickAttack", "scaryFace"],
  55: ["surf", "psychic", "iceBeam", "recover"],
  57: ["brickBreak", "machPunch", "rockSlide", "scaryFace"],
  59: ["flamethrower", "crunch", "extremeSpeed", "willOWisp"],
  62: ["surf", "brickBreak", "iceBeam", "hypnosis"],
  65: ["psychic", "shadowBall", "recover", "thunderWave"],
  68: ["brickBreak", "machPunch", "rockSlide", "scaryFace"],
  71: ["energyBall", "sludgeBomb", "sleepPowder", "suckerPunch"],
  73: ["surf", "sludgeBomb", "iceBeam", "sleepPowder"],
  76: ["earthquake", "rockSlide", "brickBreak", "scaryFace"],
  78: ["flamethrower", "quickAttack", "ironTail", "willOWisp"],
  80: ["surf", "psychic", "iceBeam", "recover"],
  82: ["thunderbolt", "ironTail", "thunderWave", "harden"],
  83: ["airSlash", "slash", "quickAttack", "swordDance"],
  85: ["airSlash", "quickAttack", "suckerPunch", "scaryFace"],
  87: ["surf", "iceBeam", "rest", "bodySlam"],
  89: ["sludgeBomb", "crunch", "bulletPunch", "scaryFace"],
  91: ["iceBeam", "surf", "rockSlide", "harden"],
  94: ["shadowBall", "sludgeBomb", "hypnosis", "suckerPunch"],
  95: ["rockSlide", "earthquake", "ironTail", "scaryFace"],
  97: ["psychic", "shadowBall", "hypnosis", "recover"],
  99: ["surf", "brickBreak", "slash", "aquaJet"],
  101: ["thunderbolt", "quickAttack", "thunderWave", "agility"],
  103: ["psychic", "energyBall", "sleepPowder", "synthesis"],
  105: ["earthquake", "rockSlide", "crunch", "swordDance"],
  106: ["brickBreak", "machPunch", "rockSlide", "scaryFace"],
  107: ["brickBreak", "machPunch", "bulletPunch", "iceBeam"],
  108: ["bodySlam", "crunch", "earthquake", "rest"],
  110: ["sludgeBomb", "flamethrower", "willOWisp", "scaryFace"],
  112: ["earthquake", "rockSlide", "ironTail", "scaryFace"],
  113: ["bodySlam", "recover", "thunderWave", "sing"],
  114: ["energyBall", "sleepPowder", "synthesis", "crunch"],
  115: ["bodySlam", "suckerPunch", "earthquake", "quickAttack"],
  117: ["surf", "iceBeam", "dragonBreath", "agility"],
  119: ["surf", "poisonJab", "aquaJet", "scaryFace"],
  121: ["surf", "psychic", "thunderbolt", "recover"],
  122: ["psychic", "thunderbolt", "thunderWave", "recover"],
  123: ["airSlash", "slash", "quickAttack", "swordDance"],
  124: ["iceBeam", "psychic", "sing", "recover"],
  125: ["thunderbolt", "brickBreak", "quickAttack", "thunderWave"],
  126: ["flamethrower", "brickBreak", "willOWisp", "quickAttack"],
  127: ["bugBite", "brickBreak", "rockSlide", "swordDance"],
  128: ["bodySlam", "earthquake", "rockSlide", "quickAttack"],
  130: ["surf", "crunch", "dragonBreath", "scaryFace"],
  131: ["surf", "iceBeam", "rest", "sing"],
  134: ["surf", "iceBeam", "recover", "aquaJet"],
  135: ["thunderbolt", "shadowBall", "quickAttack", "thunderWave"],
  136: ["flamethrower", "crunch", "quickAttack", "willOWisp"],
  137: ["psychic", "thunderbolt", "iceBeam", "recover"],
  139: ["surf", "rockSlide", "iceBeam", "scaryFace"],
  141: ["surf", "rockSlide", "slash", "aquaJet"],
  142: ["rockSlide", "airSlash", "earthquake", "quickAttack"],
  143: ["bodySlam", "earthquake", "crunch", "rest"],
  144: ["iceBeam", "airSlash", "agility", "rest"],
  145: ["thunderbolt", "airSlash", "thunderWave", "agility"],
  146: ["flamethrower", "airSlash", "willOWisp", "quickAttack"],
  149: ["dragonBreath", "airSlash", "brickBreak", "extremeSpeed"],
  150: ["psychic", "shadowBall", "recover", "agility"],
  151: ["psychic", "energyBall", "thunderWave", "recover"],

  154: ["energyBall", "bodySlam", "synthesis", "sleepPowder"],
  157: ["flamethrower", "fireBlast", "quickAttack", "willOWisp"],
  160: ["surf", "crunch", "iceBeam", "aquaJet"],
  162: ["bodySlam", "quickAttack", "crunch", "scaryFace"],
  164: ["airSlash", "psychic", "hypnosis", "recover"],
  166: ["bugBite", "machPunch", "airSlash", "harden"],
  168: ["bugBite", "poisonJab", "suckerPunch", "sleepPowder"],
  169: ["airSlash", "poisonJab", "crunch", "scaryFace"],
  171: ["surf", "thunderbolt", "thunderWave", "recover"],
  176: ["airSlash", "psychic", "sing", "recover"],
  178: ["psychic", "airSlash", "suckerPunch", "agility"],
  181: ["thunderbolt", "dragonBreath", "thunderWave", "fireBlast"],
  182: ["energyBall", "sludgeBomb", "sleepPowder", "synthesis"],
  184: ["surf", "bodySlam", "aquaJet", "rest"],
  185: ["rockSlide", "earthquake", "brickBreak", "scaryFace"],
  186: ["surf", "iceBeam", "sing", "scaryFace"],
  189: ["energyBall", "airSlash", "sleepPowder", "synthesis"],
  192: ["energyBall", "sludgeBomb", "synthesis", "sleepPowder"],
  195: ["surf", "earthquake", "rest", "scaryFace"],
  196: ["psychic", "shadowBall", "recover", "quickAttack"],
  197: ["crunch", "suckerPunch", "recover", "scaryFace"],
  198: ["crunch", "airSlash", "suckerPunch", "quickAttack"],
  199: ["surf", "psychic", "iceBeam", "recover"],
  200: ["shadowBall", "psychic", "perishSong", "suckerPunch"],
  203: ["psychic", "bodySlam", "crunch", "agility"],
  205: ["bugBite", "ironTail", "earthquake", "harden"],
  206: ["bodySlam", "rockSlide", "quickAttack", "sing"],
  207: ["earthquake", "airSlash", "suckerPunch", "scaryFace"],
  208: ["ironTail", "earthquake", "rockSlide", "scaryFace"],
  210: ["bodySlam", "crunch", "brickBreak", "scaryFace"],
  211: ["surf", "poisonJab", "aquaJet", "scaryFace"],
  212: ["bugBite", "ironTail", "bulletPunch", "swordDance"],
  213: ["rockSlide", "bugBite", "rest", "harden"],
  214: ["bugBite", "brickBreak", "rockSlide", "machPunch"],
  215: ["crunch", "iceBeam", "suckerPunch", "quickAttack"],
  217: ["bodySlam", "crunch", "earthquake", "rest"],
  219: ["flamethrower", "rockSlide", "earthquake", "willOWisp"],
  221: ["earthquake", "iceBeam", "rockSlide", "scaryFace"],
  222: ["surf", "rockSlide", "recover", "thunderWave"],
  224: ["surf", "iceBeam", "sludgeBomb", "scaryFace"],
  225: ["iceBeam", "airSlash", "quickAttack", "agility"],
  226: ["surf", "airSlash", "iceBeam", "agility"],
  227: ["ironTail", "airSlash", "bulletPunch", "harden"],
  229: ["crunch", "flamethrower", "suckerPunch", "willOWisp"],
  230: ["surf", "dragonBreath", "iceBeam", "agility"],
  232: ["earthquake", "rockSlide", "ironTail", "scaryFace"],
  233: ["psychic", "thunderbolt", "iceBeam", "recover"],
  234: ["bodySlam", "psychic", "hypnosis", "quickAttack"],
  237: ["brickBreak", "machPunch", "rockSlide", "scaryFace"],
  241: ["bodySlam", "earthquake", "milkDrink", "scaryFace"],
  242: ["bodySlam", "recover", "thunderWave", "sing"],
  243: ["thunderbolt", "shadowBall", "thunderWave", "agility"],
  244: ["flamethrower", "crunch", "extremeSpeed", "willOWisp"],
  245: ["surf", "iceBeam", "rest", "scaryFace"],
  248: ["crunch", "rockSlide", "earthquake", "scaryFace"],
  249: ["psychic", "airSlash", "recover", "thunderWave"],
  250: ["flamethrower", "airSlash", "recover", "extremeSpeed"],
  251: ["energyBall", "psychic", "synthesis", "thunderWave"],
};

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

function buildMovesForPokemon(pokemon) {
  if (!pokemon || isExcludedPokemon(pokemon)) return [];
  return signatureMoves(pokemon) || buildAlgorithmicMoveSet(pokemon);
}

function hasEnoughUsableMoves(pokemon) {
  if (!pokemon || isExcludedPokemon(pokemon)) return false;
  const moves = buildMovesForPokemon(pokemon);
  return moves.length >= 4 && moves.some(isAttackMove);
}

module.exports = {
  buildMovesForPokemon,
  hasEnoughUsableMoves,
  buildDualTypeMoveSet: buildAlgorithmicMoveSet,
  buildSingleTypeMoveSet: buildAlgorithmicMoveSet,
  isExcludedPokemon,
  isLegendary,
};
