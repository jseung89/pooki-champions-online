const { TYPE_KO } = require("./typeChart");

const MOVES = {
  bodySlam: { id: "bodySlam", apiName: "body-slam", name: "누르기", type: "normal", power: 85, accuracy: 100, effect: { chance: 20, status: "paralyze" }, tags: ["reliable"] },
  quickAttack: { id: "quickAttack", apiName: "quick-attack", name: "전광석화", type: "normal", power: 40, accuracy: 100, priority: 1, tags: ["priority"] },
  extremeSpeed: { id: "extremeSpeed", apiName: "extreme-speed", name: "신속", type: "normal", power: 80, accuracy: 100, priority: 2, tags: ["priority", "premium"] },
  slash: { id: "slash", apiName: "slash", name: "베어가르기", type: "normal", power: 70, accuracy: 100 },
  hyperBeam: { id: "hyperBeam", apiName: "hyper-beam", name: "파괴광선", type: "normal", power: 150, accuracy: 90, recharge: 1, danger: "사용 후 다음 턴 반동으로 행동할 수 없습니다.", tags: ["premium"] },
  explosion: { id: "explosion", apiName: "explosion", name: "대폭발", type: "normal", power: 400, accuracy: 100, selfDestruct: true, danger: "사용 후 자신도 쓰러지는 초고위력 조커 기술입니다.", tags: ["signature", "premium"] },

  sing: { id: "sing", apiName: "sing", name: "노래하기", type: "normal", power: 0, accuracy: 60, statusMove: { target: "enemy", status: "sleep" }, tags: ["status"] },
  perishSong: { id: "perishSong", apiName: "perish-song", name: "멸망의노래", type: "normal", power: 0, accuracy: 100, fixedDamageRatio: 0.5, statChangeAfterDamage: { target: "enemy", stat: "speed", amount: -1 }, tags: ["signature"] },
  rest: { id: "rest", apiName: "rest", name: "잠자기", type: "psychic", power: 0, accuracy: 100, rest: { turns: 2 }, tags: ["recovery"] },
  recover: { id: "recover", apiName: "recover", name: "HP회복", type: "normal", power: 0, accuracy: 100, heal: { target: "self", ratio: 0.5 }, tags: ["recovery"] },
  milkDrink: { id: "milkDrink", apiName: "milk-drink", name: "우유마시기", type: "normal", power: 0, accuracy: 100, heal: { target: "self", ratio: 0.5 }, tags: ["recovery"] },
  synthesis: { id: "synthesis", apiName: "synthesis", name: "광합성", type: "grass", power: 0, accuracy: 100, heal: { target: "self", ratio: 0.5 }, tags: ["recovery"] },

  flamethrower: { id: "flamethrower", apiName: "flamethrower", name: "화염방사", type: "fire", power: 90, accuracy: 100, effect: { chance: 10, status: "burn" }, tags: ["premium"] },
  fireBlast: { id: "fireBlast", apiName: "fire-blast", name: "불대문자", type: "fire", power: 110, accuracy: 85, effect: { chance: 10, status: "burn" }, tags: ["premium"] },
  willOWisp: { id: "willOWisp", apiName: "will-o-wisp", name: "도깨비불", type: "fire", power: 0, accuracy: 85, statusMove: { target: "enemy", status: "burn" }, tags: ["status"] },

  surf: { id: "surf", apiName: "surf", name: "파도타기", type: "water", power: 90, accuracy: 100, tags: ["premium"] },
  hydroPump: { id: "hydroPump", apiName: "hydro-pump", name: "하이드로펌프", type: "water", power: 120, accuracy: 80, tags: ["premium"] },
  aquaJet: { id: "aquaJet", apiName: "aqua-jet", name: "아쿠아제트", type: "water", power: 40, accuracy: 100, priority: 1, tags: ["priority"] },

  iceBeam: { id: "iceBeam", apiName: "ice-beam", name: "냉동빔", type: "ice", power: 90, accuracy: 100, tags: ["premium"] },

  razorLeaf: { id: "razorLeaf", apiName: "razor-leaf", name: "잎날가르기", type: "grass", power: 65, accuracy: 95 },
  energyBall: { id: "energyBall", apiName: "energy-ball", name: "에너지볼", type: "grass", power: 90, accuracy: 100, tags: ["premium"] },
  sleepPowder: { id: "sleepPowder", apiName: "sleep-powder", name: "수면가루", type: "grass", power: 0, accuracy: 65, statusMove: { target: "enemy", status: "sleep" }, tags: ["status"] },
  poisonPowder: { id: "poisonPowder", apiName: "poison-powder", name: "독가루", type: "poison", power: 0, accuracy: 75, statusMove: { target: "enemy", status: "poison" }, tags: ["status"] },

  thunderbolt: { id: "thunderbolt", apiName: "thunderbolt", name: "10만볼트", type: "electric", power: 90, accuracy: 100, effect: { chance: 10, status: "paralyze" }, tags: ["premium"] },
  thunder: { id: "thunder", apiName: "thunder", name: "번개", type: "electric", power: 120, accuracy: 75, effect: { chance: 20, status: "paralyze" }, tags: ["premium"] },
  thunderWave: { id: "thunderWave", apiName: "thunder-wave", name: "전기자석파", type: "electric", power: 0, accuracy: 90, statusMove: { target: "enemy", status: "paralyze" }, tags: ["status"] },

  karateChop: { id: "karateChop", apiName: "karate-chop", name: "태권당수", type: "fighting", power: 70, accuracy: 100 },
  brickBreak: { id: "brickBreak", apiName: "brick-break", name: "깨트리기", type: "fighting", power: 75, accuracy: 100 },
  machPunch: { id: "machPunch", apiName: "mach-punch", name: "마하펀치", type: "fighting", power: 40, accuracy: 100, priority: 1, tags: ["priority"] },

  sludgeBomb: { id: "sludgeBomb", apiName: "sludge-bomb", name: "오물폭탄", type: "poison", power: 90, accuracy: 100, effect: { chance: 20, status: "poison" }, tags: ["premium"] },
  poisonJab: { id: "poisonJab", apiName: "poison-jab", name: "독찌르기", type: "poison", power: 80, accuracy: 100 },

  earthquake: { id: "earthquake", apiName: "earthquake", name: "지진", type: "ground", power: 100, accuracy: 100, tags: ["premium"] },
  dig: { id: "dig", apiName: "dig", name: "구멍파기", type: "ground", power: 80, accuracy: 100 },

  wingAttack: { id: "wingAttack", apiName: "wing-attack", name: "날개치기", type: "flying", power: 60, accuracy: 100 },
  aerialAce: { id: "aerialAce", apiName: "aerial-ace", name: "제비반환", type: "flying", power: 60, accuracy: 100 },
  airSlash: { id: "airSlash", apiName: "air-slash", name: "에어슬래시", type: "flying", power: 75, accuracy: 95, flinchChance: 30 },
  steelWing: { id: "steelWing", apiName: "steel-wing", name: "강철날개", type: "steel", power: 70, accuracy: 90 },

  confusion: { id: "confusion", apiName: "confusion", name: "염동력", type: "psychic", power: 50, accuracy: 100 },
  psychic: { id: "psychic", apiName: "psychic", name: "사이코키네시스", type: "psychic", power: 90, accuracy: 100, tags: ["premium"] },
  hypnosis: { id: "hypnosis", apiName: "hypnosis", name: "최면술", type: "psychic", power: 0, accuracy: 60, statusMove: { target: "enemy", status: "sleep" }, tags: ["status"] },
  agility: { id: "agility", apiName: "agility", name: "고속이동", type: "psychic", power: 0, accuracy: 100, statChange: { target: "self", stat: "speed", amount: 2 }, tags: ["setup"] },

  bugBite: { id: "bugBite", apiName: "bug-bite", name: "벌레먹기", type: "bug", power: 60, accuracy: 100 },
  rockSlide: { id: "rockSlide", apiName: "rock-slide", name: "스톤샤워", type: "rock", power: 75, accuracy: 90, flinchChance: 30, tags: ["premium"] },

  shadowBall: { id: "shadowBall", apiName: "shadow-ball", name: "섀도볼", type: "ghost", power: 80, accuracy: 100, tags: ["premium"] },
  dragonBreath: { id: "dragonBreath", apiName: "dragon-breath", name: "용의숨결", type: "dragon", power: 60, accuracy: 100, effect: { chance: 20, status: "paralyze" } },
  bite: { id: "bite", apiName: "bite", name: "물기", type: "dark", power: 60, accuracy: 100, flinchChance: 30 },
  crunch: { id: "crunch", apiName: "crunch", name: "깨물어부수기", type: "dark", power: 80, accuracy: 100, tags: ["premium"] },
  suckerPunch: { id: "suckerPunch", apiName: "sucker-punch", name: "기습", type: "dark", power: 70, accuracy: 100, priority: 1, tags: ["priority"] },

  ironTail: { id: "ironTail", apiName: "iron-tail", name: "아이언테일", type: "steel", power: 100, accuracy: 75, tags: ["premium"] },
  bulletPunch: { id: "bulletPunch", apiName: "bullet-punch", name: "불릿펀치", type: "steel", power: 40, accuracy: 100, priority: 1, tags: ["priority"] },

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
  haze: { id: "haze", apiName: "haze", name: "흑안개", type: "ice", power: 0, accuracy: 100, resetStatStages: true, tags: ["utility", "anti-setup"] },
  harden: { id: "harden", apiName: "harden", name: "방어태세", type: "normal", power: 0, accuracy: 100, statChange: { target: "self", stat: "defense", amount: 1 }, tags: ["utility"] },
};

const MOVE_LIST = Object.values(MOVES);
const PREMIUM_MOVE_IDS = new Set(MOVE_LIST.filter((m) => m.tags?.includes("premium")).map((m) => m.id));

function isAttackMove(move) {
  return move && move.power > 0 && !move.statChange && !move.statChanges && !move.statusMove && !move.heal && !move.rest && !move.fixedDamageRatio && !move.resetStatStages;
}

function isStatusMove(move) {
  return move && (move.statChange || move.statChanges || move.statusMove || move.heal || move.rest || move.fixedDamageRatio || move.resetStatStages);
}

function isPremiumMove(move) {
  return PREMIUM_MOVE_IDS.has(move?.id);
}

function moveDescription(move) {
  if (!move) return "";
  if (move.selfDestruct) return "초고위력 기술입니다. 사용 후 자신도 쓰러집니다.";
  if (move.recharge) return "초고위력 기술입니다. 사용 후 다음 턴 반동으로 행동할 수 없습니다.";
  if (move.rest) return `HP를 모두 회복하고 ${move.rest.turns}턴 동안 수면 상태가 됩니다.`;
  if (move.heal) return `자신의 HP를 최대 HP의 ${Math.round(move.heal.ratio * 100)}%만큼 회복합니다.`;
  if (move.fixedDamageRatio) return `상대에게 큰 고정 피해를 주고 추가 효과를 남기는 특수 전술기입니다.`;
  if (move.resetStatStages) {
    return "양쪽 포켓몬의 공격/방어/스피드 랭크 변화를 모두 초기화합니다.";
  }
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
  TYPE_KO,
};
