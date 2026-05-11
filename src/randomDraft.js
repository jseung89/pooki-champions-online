const { buildMovesForPokemon, hasEnoughUsableMoves, isExcludedPokemon, isLegendary } = require("./moveBuilder");

function scorePokemon(pokemon) {
  const s = pokemon.stats;
  const base = s.hp + s.attack + s.defense + s.speed;
  const typeBonus = pokemon.types.length > 1 ? 18 : 0;
  const speedBonus = Math.min(30, Math.floor(s.speed / 4));
  const moveBonus = Math.min(35, Math.floor((pokemon.availableMoveNames?.length || 0) / 4));
  return Math.round(base + typeBonus + speedBonus + moveBonus);
}

function bucketize(pool) {
  const legal = pool
    .filter((p) => !p.isBaby)
    .filter((p) => !isExcludedPokemon(p))
    .filter(hasEnoughUsableMoves)
    .map((p) => ({ ...p, draftScore: scorePokemon(p) }));

  const sorted = [...legal].sort((a, b) => b.draftScore - a.draftScore);
  const n = sorted.length || 1;

  return {
    top: sorted.slice(0, Math.max(1, Math.floor(n * 0.25))),
    mid: sorted.slice(Math.floor(n * 0.25), Math.floor(n * 0.75)),
    low: sorted.slice(Math.floor(n * 0.75)),
    all: sorted,
    legendary: sorted.filter(isLegendary),
    normal: sorted.filter((p) => !isLegendary(p)),
  };
}

function pickRandom(arr, count, used = new Set()) {
  const pool = arr.filter((item) => !used.has(item.id));
  const result = [];

  while (result.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const [item] = pool.splice(idx, 1);
    used.add(item.id);
    result.push(item);
  }

  return result;
}

function withMoves(pokemon) {
  return {
    ...pokemon,
    moves: buildMovesForPokemon(pokemon),
  };
}

function createDraft(pool, count = 12) {
  const buckets = bucketize(pool);
  const used = new Set();

  const draft = [];

  // 후보 12마리 중 전설/환상은 최대 1마리만 허용한다.
  const legendaryPick = pickRandom(buckets.legendary, Math.random() < 0.55 ? 1 : 0, used);
  draft.push(...legendaryPick);

  draft.push(...pickRandom(buckets.top.filter((p) => !isLegendary(p)), 3, used));
  draft.push(...pickRandom(buckets.mid.filter((p) => !isLegendary(p)), 6, used));
  draft.push(...pickRandom(buckets.low.filter((p) => !isLegendary(p)), 3, used));

  while (draft.length < count) {
    const extra = pickRandom(buckets.normal, 1, used)[0];
    if (!extra) break;
    draft.push(extra);
  }

  return draft.slice(0, count).map(withMoves);
}

module.exports = {
  scorePokemon,
  createDraft,
};
