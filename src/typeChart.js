const TYPE_KO = {
  normal: "노말",
  fire: "불꽃",
  water: "물",
  electric: "전기",
  grass: "풀",
  ice: "얼음",
  fighting: "격투",
  poison: "독",
  ground: "땅",
  flying: "비행",
  psychic: "에스퍼",
  bug: "벌레",
  rock: "바위",
  ghost: "고스트",
  dragon: "드래곤",
  dark: "악",
  steel: "강철",
  fairy: "페어리",
};

const ALL_TYPES = Object.keys(TYPE_KO);

const SUPER = {
  normal: [],
  fire: ["grass", "ice", "bug", "steel"],
  water: ["fire", "ground", "rock"],
  electric: ["water", "flying"],
  grass: ["water", "ground", "rock"],
  ice: ["grass", "ground", "flying", "dragon"],
  fighting: ["normal", "ice", "rock", "dark", "steel"],
  poison: ["grass", "fairy"],
  ground: ["fire", "electric", "poison", "rock", "steel"],
  flying: ["grass", "fighting", "bug"],
  psychic: ["fighting", "poison"],
  bug: ["grass", "psychic", "dark"],
  rock: ["fire", "ice", "flying", "bug"],
  ghost: ["psychic", "ghost"],
  dragon: ["dragon"],
  dark: ["psychic", "ghost"],
  steel: ["ice", "rock", "fairy"],
  fairy: ["fighting", "dragon", "dark"],
};

const RESIST = {
  normal: ["rock", "steel"],
  fire: ["fire", "water", "rock", "dragon"],
  water: ["water", "grass", "dragon"],
  electric: ["electric", "grass", "dragon"],
  grass: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
  ice: ["fire", "water", "ice", "steel"],
  fighting: ["poison", "flying", "psychic", "bug", "fairy"],
  poison: ["poison", "ground", "rock", "ghost"],
  ground: ["grass", "bug"],
  flying: ["electric", "rock", "steel"],
  psychic: ["psychic", "steel"],
  bug: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
  rock: ["fighting", "ground", "steel"],
  ghost: ["dark"],
  dragon: ["steel"],
  dark: ["fighting", "dark", "fairy"],
  steel: ["fire", "water", "electric", "steel"],
  fairy: ["fire", "poison", "steel"],
};

const IMMUNE = {
  normal: ["ghost"],
  fighting: ["ghost"],
  poison: ["steel"],
  ground: ["flying"],
  electric: ["ground"],
  psychic: ["dark"],
  ghost: ["normal"],
  dragon: ["fairy"],
  fire: [],
  water: [],
  grass: [],
  ice: [],
  flying: [],
  bug: [],
  rock: [],
  dark: [],
  steel: [],
  fairy: [],
};

function rawTypeEffectiveness(moveType, defenderTypes = []) {
  if (!moveType || !ALL_TYPES.includes(moveType)) return 1;
  let multiplier = 1;

  for (const type of defenderTypes) {
    if (IMMUNE[moveType]?.includes(type)) multiplier *= 0;
    else if (SUPER[moveType]?.includes(type)) multiplier *= 2;
    else if (RESIST[moveType]?.includes(type)) multiplier *= 0.5;
  }

  return multiplier;
}

function battleEffectiveness(moveType, defenderTypes = []) {
  const raw = rawTypeEffectiveness(moveType, defenderTypes);
  if (!Number.isFinite(raw)) return 1;
  return raw;
}

function effectivenessLabel(multiplier) {
  if (multiplier === 0) return "효과 없음";
  if (multiplier >= 4) return "효과 4배";
  if (multiplier >= 2) return "효과 2배";
  if (multiplier <= 0.25 && multiplier > 0) return "효과 0.25배";
  if (multiplier < 1) return "효과 0.5배";
  return "효과 1배";
}

module.exports = {
  TYPE_KO,
  ALL_TYPES,
  rawTypeEffectiveness,
  battleEffectiveness,
  effectivenessLabel,
};
