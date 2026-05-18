const { TYPE_KO } = require("./typeChart");
const { getBattleBalance, getMoveBalanceOverrides, reloadMoveBalanceOverrides } = require("./balanceConfig");

const BASE_MOVES = {
  bodySlam: { id: "bodySlam", apiName: "body-slam", name: "누르기", type: "normal", power: 85, accuracy: 100, effect: { chance: 20, status: "paralyze" }, tags: ["reliable"] },
  quickAttack: { id: "quickAttack", apiName: "quick-attack", name: "전광석화", type: "normal", power: 40, accuracy: 100, priority: 1, tags: ["priority"] },
  extremeSpeed: { id: "extremeSpeed", apiName: "extreme-speed", name: "신속", type: "normal", power: 80, accuracy: 100, priority: 2, tags: ["priority", "premium"] },
  slash: { id: "slash", apiName: "slash", name: "베어가르기", type: "normal", power: 70, accuracy: 100, highCrit: true },
  hyperBeam: { id: "hyperBeam", apiName: "hyper-beam", name: "파괴광선", type: "normal", power: 150, accuracy: 90, recharge: 1, danger: "사용 후 다음 턴 반동으로 행동할 수 없습니다.", tags: ["premium"] },
  explosion: { id: "explosion", apiName: "explosion", name: "대폭발", type: "normal", power: 500, accuracy: 100, selfDestruct: true, danger: "사용 후 자신도 쓰러지는 초고위력 조커 기술입니다.", tags: ["signature", "premium"] },

  doubleEdge: { id: "doubleEdge", apiName: "double-edge", name: "이판사판태클", type: "normal", power: 120, accuracy: 100, recoil: { ratio: 1 / 3 }, danger: "준 피해의 1/3만큼 반동 피해를 입습니다.", tags: ["premium", "risk", "recoil"] },

  sing: { id: "sing", apiName: "sing", name: "노래하기", type: "normal", power: 0, accuracy: 50, statusMove: { target: "enemy", status: "sleep" }, tags: ["status"] },
  perishSong: { id: "perishSong", apiName: "perish-song", name: "멸망의노래", type: "normal", power: 0, accuracy: 100, fixedDamageRatio: 0.5, statChangeAfterDamage: { target: "enemy", stat: "speed", amount: -1 }, tags: ["signature"] },
  rest: { id: "rest", apiName: "rest", name: "잠자기", type: "psychic", power: 0, accuracy: 100, rest: { turns: 2 }, tags: ["recovery"] },
  recover: { id: "recover", apiName: "recover", name: "HP회복", type: "normal", power: 0, accuracy: 100, heal: { target: "self", ratio: 0.33 }, tags: ["recovery"] },
  milkDrink: { id: "milkDrink", apiName: "milk-drink", name: "우유마시기", type: "normal", power: 0, accuracy: 100, heal: { target: "self", ratio: 0.33 }, tags: ["recovery"] },
  synthesis: { id: "synthesis", apiName: "synthesis", name: "광합성", type: "grass", power: 0, accuracy: 100, heal: { target: "self", ratio: 0.33 }, tags: ["recovery"] },

  flamethrower: { id: "flamethrower", apiName: "flamethrower", name: "화염방사", type: "fire", power: 90, accuracy: 100, effect: { chance: 10, status: "burn" }, tags: ["premium"] },
  fireBlast: { id: "fireBlast", apiName: "fire-blast", name: "불대문자", type: "fire", power: 110, accuracy: 85, effect: { chance: 10, status: "burn" }, tags: ["premium"] },
  flareBlitz: { id: "flareBlitz", apiName: "flare-blitz", name: "플레어드라이브", type: "fire", power: 120, accuracy: 100, recoil: { ratio: 1 / 3 }, effect: { chance: 10, status: "burn" }, danger: "준 피해의 1/3만큼 반동 피해를 입고, 10% 확률로 화상을 입힙니다.", tags: ["premium", "risk", "recoil"] },
  willOWisp: { id: "willOWisp", apiName: "will-o-wisp", name: "도깨비불", type: "fire", power: 0, accuracy: 85, statusMove: { target: "enemy", status: "burn" }, tags: ["status"] },

  surf: { id: "surf", apiName: "surf", name: "파도타기", type: "water", power: 90, accuracy: 100, tags: ["premium"] },
  hydroPump: { id: "hydroPump", apiName: "hydro-pump", name: "하이드로펌프", type: "water", power: 120, accuracy: 80, tags: ["premium"] },
  aquaJet: { id: "aquaJet", apiName: "aqua-jet", name: "아쿠아제트", type: "water", power: 40, accuracy: 100, priority: 1, tags: ["priority"] },

  iceBeam: { id: "iceBeam", apiName: "ice-beam", name: "냉동빔", type: "ice", power: 90, accuracy: 100, tags: ["premium"] },

  razorLeaf: { id: "razorLeaf", apiName: "razor-leaf", name: "잎날가르기", type: "grass", power: 65, accuracy: 95, highCrit: true },
  energyBall: { id: "energyBall", apiName: "energy-ball", name: "에너지볼", type: "grass", power: 90, accuracy: 100, statChance: { chance: 10, target: "enemy", stat: "defense", amount: -1 }, tags: ["premium"] },
  woodHammer: { id: "woodHammer", apiName: "wood-hammer", name: "우드해머", type: "grass", power: 120, accuracy: 100, recoil: { ratio: 1 / 3 }, danger: "준 피해의 1/3만큼 반동 피해를 입습니다.", tags: ["premium", "risk", "recoil"] },
  sleepPowder: { id: "sleepPowder", apiName: "sleep-powder", name: "수면가루", type: "grass", power: 0, accuracy: 55, statusMove: { target: "enemy", status: "sleep" }, tags: ["status"] },
  poisonPowder: { id: "poisonPowder", apiName: "poison-powder", name: "독가루", type: "poison", power: 0, accuracy: 75, statusMove: { target: "enemy", status: "poison" }, tags: ["status"] },

  thunderbolt: { id: "thunderbolt", apiName: "thunderbolt", name: "10만볼트", type: "electric", power: 90, accuracy: 100, effect: { chance: 10, status: "paralyze" }, tags: ["premium"] },
  thunder: { id: "thunder", apiName: "thunder", name: "번개", type: "electric", power: 120, accuracy: 75, effect: { chance: 30, status: "paralyze" }, tags: ["premium"] },
  wildCharge: { id: "wildCharge", apiName: "wild-charge", name: "와일드볼트", type: "electric", power: 90, accuracy: 100, recoil: { ratio: 1 / 4 }, danger: "준 피해의 1/4만큼 반동 피해를 입습니다.", tags: ["premium", "risk", "recoil"] },
  thunderWave: { id: "thunderWave", apiName: "thunder-wave", name: "전기자석파", type: "electric", power: 0, accuracy: 90, statusMove: { target: "enemy", status: "paralyze" }, tags: ["status"] },

  karateChop: { id: "karateChop", apiName: "karate-chop", name: "태권당수", type: "fighting", power: 70, accuracy: 100, highCrit: true },
  brickBreak: { id: "brickBreak", apiName: "brick-break", name: "깨트리기", type: "fighting", power: 75, accuracy: 100 },
  machPunch: { id: "machPunch", apiName: "mach-punch", name: "마하펀치", type: "fighting", power: 40, accuracy: 100, priority: 1, tags: ["priority"] },

  sludgeBomb: { id: "sludgeBomb", apiName: "sludge-bomb", name: "오물폭탄", type: "poison", power: 90, accuracy: 100, effect: { chance: 30, status: "poison" }, tags: ["premium"] },
  poisonJab: { id: "poisonJab", apiName: "poison-jab", name: "독찌르기", type: "poison", power: 80, accuracy: 100, effect: { chance: 30, status: "poison" } },

  earthquake: { id: "earthquake", apiName: "earthquake", name: "지진", type: "ground", power: 100, accuracy: 100, tags: ["premium"] },
  dig: { id: "dig", apiName: "dig", name: "구멍파기", type: "ground", power: 80, accuracy: 100 },

  wingAttack: { id: "wingAttack", apiName: "wing-attack", name: "날개치기", type: "flying", power: 60, accuracy: 100 },
  aerialAce: { id: "aerialAce", apiName: "aerial-ace", name: "제비반환", type: "flying", power: 60, accuracy: 100 },
  airSlash: { id: "airSlash", apiName: "air-slash", name: "에어슬래시", type: "flying", power: 75, accuracy: 95, flinchChance: 30 },
  braveBird: { id: "braveBird", apiName: "brave-bird", name: "브레이브버드", type: "flying", power: 120, accuracy: 100, recoil: { ratio: 1 / 3 }, danger: "준 피해의 1/3만큼 반동 피해를 입습니다.", tags: ["premium", "risk", "recoil"] },
  steelWing: { id: "steelWing", apiName: "steel-wing", name: "강철날개", type: "steel", power: 70, accuracy: 90 },

  confusion: { id: "confusion", apiName: "confusion", name: "염동력", type: "psychic", power: 50, accuracy: 100 },
  psychic: { id: "psychic", apiName: "psychic", name: "사이코키네시스", type: "psychic", power: 90, accuracy: 100, tags: ["premium"] },
  hypnosis: { id: "hypnosis", apiName: "hypnosis", name: "최면술", type: "psychic", power: 0, accuracy: 50, statusMove: { target: "enemy", status: "sleep" }, tags: ["status"] },
  agility: { id: "agility", apiName: "agility", name: "고속이동", type: "psychic", power: 0, accuracy: 100, statChange: { target: "self", stat: "speed", amount: 2 }, tags: ["setup"] },

  bugBite: { id: "bugBite", apiName: "bug-bite", name: "벌레먹기", type: "bug", power: 60, accuracy: 100 },
  rockSlide: { id: "rockSlide", apiName: "rock-slide", name: "스톤샤워", type: "rock", power: 75, accuracy: 90, flinchChance: 30, tags: ["premium"] },
  headSmash: { id: "headSmash", apiName: "head-smash", name: "양날박치기", type: "rock", power: 120, accuracy: 90, recoil: { ratio: 1 / 3 }, danger: "준 피해의 1/3만큼 반동 피해를 입습니다.", tags: ["premium", "risk", "recoil"] },

  shadowBall: { id: "shadowBall", apiName: "shadow-ball", name: "섀도볼", type: "ghost", power: 80, accuracy: 100, statChance: { chance: 20, target: "enemy", stat: "defense", amount: -1 }, tags: ["premium"] },
  dragonBreath: { id: "dragonBreath", apiName: "dragon-breath", name: "용의숨결", type: "dragon", power: 60, accuracy: 100, effect: { chance: 30, status: "paralyze" } },
  bite: { id: "bite", apiName: "bite", name: "물기", type: "dark", power: 60, accuracy: 100, flinchChance: 30 },
  crunch: { id: "crunch", apiName: "crunch", name: "깨물어부수기", type: "dark", power: 80, accuracy: 100, statChance: { chance: 20, target: "enemy", stat: "defense", amount: -1 }, tags: ["premium"] },
  suckerPunch: { id: "suckerPunch", apiName: "sucker-punch", name: "기습", type: "dark", power: 70, accuracy: 100, priority: 1, tags: ["priority"] },

  ironTail: { id: "ironTail", apiName: "iron-tail", name: "아이언테일", type: "steel", power: 100, accuracy: 75, tags: ["premium"] },
  bulletPunch: { id: "bulletPunch", apiName: "bullet-punch", name: "불릿펀치", type: "steel", power: 40, accuracy: 100, priority: 1, tags: ["priority"] },


  dragonClaw: { id: "dragonClaw", apiName: "dragon-claw", name: "드래곤클로", type: "dragon", power: 80, accuracy: 100 },
  dragonPulse: { id: "dragonPulse", apiName: "dragon-pulse", name: "용의파동", type: "dragon", power: 85, accuracy: 100, tags: ["premium"] },
  outrage: { id: "outrage", apiName: "outrage", name: "역린", type: "dragon", power: 120, accuracy: 100, lockedMove: { turns: 3 }, selfDamageRatio: 0.12, danger: "3턴 동안 역린만 사용하며 교체할 수 없습니다. 매 사용 후 최대 HP의 12%를 잃습니다.", tags: ["premium", "risk"] },
  dracoMeteor: { id: "dracoMeteor", apiName: "draco-meteor", name: "용성군", type: "dragon", power: 130, accuracy: 90, selfStatAfterUse: { stat: "attack", amount: -2 }, danger: "사용 후 내 공격이 크게 떨어집니다.", tags: ["premium", "risk"] },

  ironHead: { id: "ironHead", apiName: "iron-head", name: "아이언헤드", type: "steel", power: 80, accuracy: 100, flinchChance: 30 },
  flashCannon: { id: "flashCannon", apiName: "flash-cannon", name: "플래시캐논", type: "steel", power: 80, accuracy: 100, statChance: { chance: 10, target: "enemy", stat: "defense", amount: -1 } },
  waterfall: { id: "waterfall", apiName: "waterfall", name: "폭포오르기", type: "water", power: 80, accuracy: 100, flinchChance: 20 },
  aquaTail: { id: "aquaTail", apiName: "aqua-tail", name: "아쿠아테일", type: "water", power: 90, accuracy: 90 },

  darkPulse: { id: "darkPulse", apiName: "dark-pulse", name: "악의파동", type: "dark", power: 80, accuracy: 100, flinchChance: 20 },
  nightSlash: { id: "nightSlash", apiName: "night-slash", name: "깜짝베기", type: "dark", power: 70, accuracy: 100, highCrit: true },
  shadowClaw: { id: "shadowClaw", apiName: "shadow-claw", name: "섀도크루", type: "ghost", power: 70, accuracy: 100, highCrit: true },
  xScissor: { id: "xScissor", apiName: "x-scissor", name: "시저크로스", type: "bug", power: 80, accuracy: 100 },
  furyCutter: { id: "furyCutter", apiName: "fury-cutter", name: "연속자르기", type: "bug", power: 40, accuracy: 95, furyCutter: { powers: [40, 80, 120, 160] }, tags: ["combo", "bug-support"] },
  doubleChop: { id: "doubleChop", apiName: "dual-chop", name: "더블촙", type: "dragon", power: 40, accuracy: 90, multiHit: { fixed: 2 }, tags: ["multi-hit"] },
  doubleKick: { id: "doubleKick", apiName: "double-kick", name: "두번치기", type: "fighting", power: 30, accuracy: 100, multiHit: { fixed: 2 }, tags: ["multi-hit"] },
  rockBlast: { id: "rockBlast", apiName: "rock-blast", name: "락블레스트", type: "rock", power: 25, accuracy: 90, multiHit: { min: 2, max: 5 }, tags: ["multi-hit"] },
  bulletSeed: { id: "bulletSeed", apiName: "bullet-seed", name: "기관총", type: "grass", power: 25, accuracy: 100, multiHit: { min: 2, max: 5 }, tags: ["multi-hit"] },
  icicleSpear: { id: "icicleSpear", apiName: "icicle-spear", name: "고드름침", type: "ice", power: 25, accuracy: 100, multiHit: { min: 2, max: 5 }, tags: ["multi-hit"] },
  boneRush: { id: "boneRush", apiName: "bone-rush", name: "본러시", type: "ground", power: 25, accuracy: 90, multiHit: { min: 2, max: 5 }, tags: ["multi-hit"] },
  scaleShot: { id: "scaleShot", apiName: "scale-shot", name: "스케일샷", type: "dragon", power: 25, accuracy: 90, multiHit: { min: 2, max: 5 }, selfStatAfterUse: [
    { stat: "speed", amount: 1 },
    { stat: "defense", amount: -1 },
  ], danger: "2~5회 타격 후 내 스피드가 오르고 방어가 떨어집니다.", tags: ["multi-hit", "risk"] },
  leechLife: { id: "leechLife", apiName: "leech-life", name: "흡혈", type: "bug", power: 80, accuracy: 100, drain: { ratio: 0.5 }, tags: ["recovery"] },
  stoneEdge: { id: "stoneEdge", apiName: "stone-edge", name: "스톤에지", type: "rock", power: 100, accuracy: 80, highCrit: true, tags: ["premium"] },
  powerUpPunch: { id: "powerUpPunch", apiName: "power-up-punch", name: "그로우펀치", type: "fighting", power: 40, accuracy: 100, selfStatAfterHit: { stat: "attack", amount: 1 }, tags: ["setup"] },
  drainPunch: { id: "drainPunch", apiName: "drain-punch", name: "드레인펀치", type: "fighting", power: 75, accuracy: 100, drain: { ratio: 0.5 }, tags: ["recovery"] },
  closeCombat: { id: "closeCombat", apiName: "close-combat", name: "인파이트", type: "fighting", power: 120, accuracy: 100, selfStatAfterUse: { stat: "defense", amount: -1 }, danger: "사용 후 내 방어가 떨어집니다.", tags: ["premium", "risk"] },
  gigaDrain: { id: "gigaDrain", apiName: "giga-drain", name: "기가드레인", type: "grass", power: 75, accuracy: 100, drain: { ratio: 0.5 }, tags: ["recovery"] },
  overheat: { id: "overheat", apiName: "overheat", name: "오버히트", type: "fire", power: 130, accuracy: 90, selfStatAfterUse: { stat: "attack", amount: -2 }, danger: "사용 후 내 공격이 크게 떨어집니다.", tags: ["premium", "risk"] },
  swordDance: { id: "swordDance", apiName: "swords-dance", name: "칼춤", type: "normal", power: 0, accuracy: 100, statChange: { target: "self", stat: "attack", amount: 2 }, tags: ["setup"] },
  nastyPlot: { id: "nastyPlot", apiName: "nasty-plot", name: "나쁜음모", type: "dark", power: 0, accuracy: 100, statChange: { target: "self", stat: "attack", amount: 2 }, tags: ["setup"] },
  dragonDance: { id: "dragonDance", apiName: "dragon-dance", name: "용의춤", type: "dragon", power: 0, accuracy: 100, statChanges: [
    { target: "self", stat: "attack", amount: 1 },
    { target: "self", stat: "speed", amount: 1 },
  ], tags: ["setup"] },
  bulkUp: { id: "bulkUp", apiName: "bulk-up", name: "벌크업", type: "fighting", power: 0, accuracy: 100, statChanges: [
    { target: "self", stat: "attack", amount: 1 },
    { target: "self", stat: "defense", amount: 1 },
  ], tags: ["setup"] },
  ironDefense: { id: "ironDefense", apiName: "iron-defense", name: "철벽", type: "steel", power: 0, accuracy: 100, statChange: { target: "self", stat: "defense", amount: 2 }, tags: ["setup"] },
  quiverDance: { id: "quiverDance", apiName: "quiver-dance", name: "나비춤", type: "bug", power: 0, accuracy: 100, statChanges: [
    { target: "self", stat: "attack", amount: 1 },
    { target: "self", stat: "defense", amount: 1 },
    { target: "self", stat: "speed", amount: 1 },
  ], tags: ["setup", "bug-support"] },
  scaryFace: { id: "scaryFace", apiName: "scary-face", name: "겁나는얼굴", type: "normal", power: 0, accuracy: 100, statChange: { target: "enemy", stat: "speed", amount: -2 }, tags: ["utility"] },
  charm: { id: "charm", apiName: "charm", name: "애교부리기", type: "fairy", power: 0, accuracy: 100, statChange: { target: "enemy", stat: "attack", amount: -2 }, tags: ["utility"] },
  featherDance: { id: "featherDance", apiName: "feather-dance", name: "깃털댄스", type: "flying", power: 0, accuracy: 100, statChange: { target: "enemy", stat: "attack", amount: -2 }, tags: ["utility"] },
  screech: { id: "screech", apiName: "screech", name: "싫은소리", type: "normal", power: 0, accuracy: 85, statChange: { target: "enemy", stat: "defense", amount: -2 }, tags: ["utility"] },
  metalSound: { id: "metalSound", apiName: "metal-sound", name: "금속음", type: "steel", power: 0, accuracy: 85, statChange: { target: "enemy", stat: "defense", amount: -2 }, tags: ["utility"] },
  stringShot: { id: "stringShot", apiName: "string-shot", name: "실뿜기", type: "bug", power: 0, accuracy: 95, statChange: { target: "enemy", stat: "speed", amount: -2 }, tags: ["utility", "bug-support"] },
  tickle: { id: "tickle", apiName: "tickle", name: "간지르기", type: "normal", power: 0, accuracy: 100, statChanges: [
    { target: "enemy", stat: "attack", amount: -1 },
    { target: "enemy", stat: "defense", amount: -1 },
  ], tags: ["utility"] },
  harden: { id: "harden", apiName: "harden", name: "방어태세", type: "normal", power: 0, accuracy: 100, statChange: { target: "self", stat: "defense", amount: 1 }, tags: ["utility"] },
};

function cloneMove(move) {
  return JSON.parse(JSON.stringify(move));
}

const MOVES = Object.fromEntries(Object.entries(BASE_MOVES).map(([id, move]) => [id, cloneMove(move)]));

function resetMovesToBase() {
  for (const id of Object.keys(MOVES)) {
    if (!BASE_MOVES[id]) delete MOVES[id];
  }
  for (const [id, move] of Object.entries(BASE_MOVES)) {
    const fresh = cloneMove(move);
    if (MOVES[id]) {
      for (const key of Object.keys(MOVES[id])) delete MOVES[id][key];
      Object.assign(MOVES[id], fresh);
    } else {
      MOVES[id] = fresh;
    }
  }
}

function applyMoveBalanceOverrides(overrides = getMoveBalanceOverrides()) {
  resetMovesToBase();
  for (const [id, override] of Object.entries(overrides || {})) {
    const move = MOVES[id];
    if (!move || !override || typeof override !== "object") continue;
    if (Number.isFinite(Number(override.power))) move.power = Math.max(0, Math.min(999, Math.round(Number(override.power))));
    if (Number.isFinite(Number(override.accuracy))) move.accuracy = Math.max(1, Math.min(100, Math.round(Number(override.accuracy))));
    if (Number.isFinite(Number(override.maxPp ?? override.pp))) {
      const pp = Math.max(0, Math.min(99, Math.round(Number(override.maxPp ?? override.pp))));
      move.maxPp = pp;
      move.pp = pp;
    }
    if (Number.isFinite(Number(override.healRatio))) {
      const ratio = Math.max(0, Math.min(1, Number(override.healRatio)));
      if (move.heal) move.heal.ratio = ratio;
      else move.heal = { target: "self", ratio };
    }
    if (Number.isFinite(Number(override.recoilRatio))) {
      const ratio = Math.max(0, Math.min(1, Number(override.recoilRatio)));
      if (move.recoil) move.recoil.ratio = ratio;
      else if (ratio > 0) move.recoil = { ratio };
    }
    if (typeof override.danger === "string") move.danger = override.danger.slice(0, 300);
    if (typeof override.description === "string") move.danger = override.description.slice(0, 300);
  }
  return MOVES;
}

function reloadMoveBalanceData() {
  const overrides = reloadMoveBalanceOverrides();
  applyMoveBalanceOverrides(overrides);
  return MOVES;
}

applyMoveBalanceOverrides(getMoveBalanceOverrides());

const HIGH_RISK_MOVE_IDS = new Set(["hyperBeam", "dracoMeteor", "outrage", "flareBlitz", "braveBird", "headSmash", "doubleEdge", "woodHammer"]);

function defaultPpForMove(move) {
  if (!move) return 0;
  const pp = getBattleBalance().defaultPp || {};
  if (move.id === "explosion" || move.selfDestruct) return pp.explosion ?? 1;
  if (move.rest || move.heal) return pp.heal ?? 3;
  if (move.statusMove || move.fixedDamageRatio) return pp.status ?? 5;
  if (move.statChange || move.statChanges) return pp.buff ?? 5;
  if (move.multiHit) return pp.multiHit ?? 8;
  if (move.priority) return pp.priority ?? 8;
  if ((move.power || 0) >= 130 || move.recharge || HIGH_RISK_MOVE_IDS.has(move.id)) return pp.dangerAttack ?? 3;
  if ((move.power || 0) >= 110) return pp.strongAttack ?? 5;
  return pp.normalAttack ?? 10;
}

function withDefaultPp(move) {
  if (!move) return move;
  const maxPp = Number.isFinite(move.maxPp) ? move.maxPp : defaultPpForMove(move);
  const pp = Number.isFinite(move.pp) ? move.pp : maxPp;
  return { ...move, maxPp, pp };
}

const MOVE_LIST = Object.values(MOVES);
const PREMIUM_MOVE_IDS = new Set(MOVE_LIST.filter((m) => m.tags?.includes("premium")).map((m) => m.id));

function isAttackMove(move) {
  return move && move.power > 0 && !move.statChange && !move.statChanges && !move.statusMove && !move.heal && !move.rest && !move.fixedDamageRatio;
}

function isStatusMove(move) {
  return move && (move.statChange || move.statChanges || move.statusMove || move.heal || move.rest || move.fixedDamageRatio);
}

function isPremiumMove(move) {
  return PREMIUM_MOVE_IDS.has(move?.id);
}

function moveDescription(move) {
  if (!move) return "";
  if (move.selfDestruct) return "초고위력 기술입니다. 사용 후 자신도 쓰러집니다.";
  if (move.recoil) return `강하게 공격하지만 준 피해의 ${move.recoil.ratio >= 0.333 ? "1/3" : "1/4"}만큼 반동 피해를 입습니다.`;
  if (move.recharge) return "초고위력 기술입니다. 사용 후 다음 턴 반동으로 행동할 수 없습니다.";
  if (move.rest) return `HP를 모두 회복하고 ${move.rest.turns}턴 동안 수면 상태가 됩니다.`;
  if (move.heal) return `자신의 HP를 최대 HP의 ${Math.round(move.heal.ratio * 100)}%만큼 회복합니다.`;
  if (move.fixedDamageRatio) return `상대에게 큰 고정 피해를 주고 추가 효과를 남기는 특수 전술기입니다.`;
  if (move.statChanges) {
    return move.statChanges.map((change) => {
      const statKo = { attack: "공격", defense: "방어", speed: "스피드" }[change.stat] || change.stat;
      const targetKo = change.target === "self" ? "내 포켓몬" : "상대 포켓몬";
      const direction = change.amount > 0 ? "올립니다" : "내립니다";
      return `${targetKo}의 ${statKo}을/를 ${Math.abs(change.amount)}랭크 ${direction}`;
    }).join(" / ") + ".";
  }
  if (move.statChange) {
    const statKo = { attack: "공격", defense: "방어", speed: "스피드" }[move.statChange.stat] || move.statChange.stat;
    const targetKo = move.statChange.target === "self" ? "내 포켓몬" : "상대 포켓몬";
    const direction = move.statChange.amount > 0 ? "올립니다" : "내립니다";
    return `${targetKo}의 ${statKo}을/를 ${Math.abs(move.statChange.amount)}랭크 ${direction}.`;
  }
  if (move.statusMove) {
    const statusKo = { burn: "화상", poison: "독", paralyze: "마비", sleep: "수면" }[move.statusMove.status] || move.statusMove.status;
    return `상대를 ${statusKo} 상태로 만듭니다.`;
  }
  if (move.effect?.status) {
    const statusKo = { burn: "화상", poison: "독", paralyze: "마비", sleep: "수면" }[move.effect.status] || move.effect.status;
    return `공격 후 ${move.effect.chance}% 확률로 ${statusKo} 상태를 부여합니다.`;
  }

  if (move.lockedMove) return `${move.lockedMove.turns || 3}턴 동안 같은 기술만 사용하며 교체할 수 없습니다. 매 사용 후 HP를 잃습니다.`;
  if (move.furyCutter) return `연속으로 사용할수록 위력이 증가합니다. (${move.furyCutter.powers.join(" → ")})`;
  if (move.multiHit) {
    if (move.multiHit.fixed) return `${move.multiHit.fixed}회 연속 타격합니다.`;
    return `${move.multiHit.min || 2}~${move.multiHit.max || 5}회 연속 타격합니다.`;
  }
  if (move.drain) return `준 피해의 ${Math.round(move.drain.ratio * 100)}%만큼 HP를 회복합니다.`;
  if (Array.isArray(move.selfStatAfterUse)) {
    return `사용 후 ${move.selfStatAfterUse.map((e) => `${{ attack: "공격", defense: "방어", speed: "스피드" }[e.stat] || e.stat} ${e.amount > 0 ? "+" : ""}${e.amount}`).join(" / ")} 변화가 발생합니다.`;
  }
  if (move.selfStatAfterHit) {
    const statKo = { attack: "공격", defense: "방어", speed: "스피드" }[move.selfStatAfterHit.stat] || move.selfStatAfterHit.stat;
    return `명중 후 내 포켓몬의 ${statKo}이/가 ${Math.abs(move.selfStatAfterHit.amount)}랭크 ${move.selfStatAfterHit.amount > 0 ? "올라갑니다" : "떨어집니다"}.`;
  }
  if (move.selfStatAfterUse) {
    const statKo = { attack: "공격", defense: "방어", speed: "스피드" }[move.selfStatAfterUse.stat] || move.selfStatAfterUse.stat;
    return `사용 후 내 포켓몬의 ${statKo}이/가 ${Math.abs(move.selfStatAfterUse.amount)}랭크 ${move.selfStatAfterUse.amount > 0 ? "올라갑니다" : "떨어집니다"}.`;
  }
  if (move.statChance) {
    const statKo = { attack: "공격", defense: "방어", speed: "스피드" }[move.statChance.stat] || move.statChance.stat;
    const targetKo = move.statChance.target === "self" ? "내 포켓몬" : "상대 포켓몬";
    return `공격 후 ${move.statChance.chance}% 확률로 ${targetKo}의 ${statKo}을/를 ${Math.abs(move.statChance.amount)}랭크 ${move.statChance.amount > 0 ? "올립니다" : "내립니다"}.`;
  }
  if (move.flinchChance) return `공격 후 ${move.flinchChance}% 확률로 상대를 풀죽게 합니다.`;
  if (move.highCrit) return "급소에 맞을 확률이 높은 공격 기술입니다.";
  if (move.priority > 0) return `우선도 +${move.priority}로 먼저 공격하기 쉬운 기술입니다.`;
  return "직접 피해를 주는 공격 기술입니다.";
}

module.exports = {
  MOVES,
  MOVE_LIST,
  PREMIUM_MOVE_IDS,
  isPremiumMove,
  isAttackMove,
  isStatusMove,
  moveDescription,
  defaultPpForMove,
  withDefaultPp,
  applyMoveBalanceOverrides,
  reloadMoveBalanceData,
  TYPE_KO,
};
