const { battleEffectiveness } = require("./typeChart");
const { withDefaultPp } = require("./moveLibrary");
const { getBattleBalance, reloadBattleBalance } = require("./balanceConfig");

const STATUS_KO = {
  burn: "화상",
  poison: "독",
  paralyze: "마비",
  sleep: "수면",
};

function stageMultiplier(stage) {
  if (stage >= 0) return (2 + stage) / 2;
  return 2 / (2 + Math.abs(stage));
}

function clampStage(value) {
  return Math.max(-6, Math.min(6, value));
}

function resetStatStages(target) {
  if (!target?.statStages) return;
  target.statStages.attack = 0;
  target.statStages.defense = 0;
  target.statStages.speed = 0;
}

function getEffectiveSpeed(pokemon) {
  let speed = pokemon.stats.speed * stageMultiplier(pokemon.statStages.speed);
  if (pokemon.status === "paralyze") speed *= 0.5;
  return speed;
}

function isMoveHit(move) {
  return Math.random() * 100 < (move.accuracy ?? 100);
}

const CRITICAL_HIT_CHANCE = 0.10; // 푸끼몬식 일반 급소율 10%
const HIGH_CRITICAL_HIT_CHANCE = 0.25; // 고급소 기술 25%
const CRITICAL_HIT_MULTIPLIER = 1.5;

const STRUGGLE_MOVE = {
  id: "struggle",
  apiName: "struggle",
  name: "발버둥",
  type: "normal",
  power: 50,
  accuracy: 100,
  selfDamageRatio: 0.25,
  isStruggle: true,
  danger: "사용 후 내 최대 HP의 25%만큼 반동 피해를 입습니다.",
};

function applyBattleBalanceToStruggle() {
  const balance = getBattleBalance();
  const struggle = balance.struggle || {};
  STRUGGLE_MOVE.power = Number.isFinite(Number(struggle.power)) ? Math.max(1, Math.round(Number(struggle.power))) : 50;
  STRUGGLE_MOVE.accuracy = Number.isFinite(Number(struggle.accuracy)) ? Math.max(1, Math.min(100, Math.round(Number(struggle.accuracy)))) : 100;
  STRUGGLE_MOVE.selfDamageRatio = Number.isFinite(Number(struggle.recoilMaxHpRatio)) ? Math.max(0, Math.min(1, Number(struggle.recoilMaxHpRatio))) : 0.25;
  STRUGGLE_MOVE.danger = `사용 후 내 최대 HP의 ${Math.round(STRUGGLE_MOVE.selfDamageRatio * 100)}%만큼 반동 피해를 입습니다.`;
  return STRUGGLE_MOVE;
}

applyBattleBalanceToStruggle();

function moveHasPp(move) {
  if (!move || move.isStruggle) return true;
  return !Number.isFinite(move.pp) || move.pp > 0;
}

function hasAnyPpMove(pokemon) {
  return Array.isArray(pokemon?.moves) && pokemon.moves.some((m) => moveHasPp(m));
}

function consumeMovePp(move) {
  if (!move || move.isStruggle || !Number.isFinite(move.pp)) return false;
  move.pp = Math.max(0, move.pp - 1);
  return true;
}

function calculateDamage(attacker, defender, move) {
  const attack = attacker.stats.attack * stageMultiplier(attacker.statStages.attack);
  const defense = defender.stats.defense * stageMultiplier(defender.statStages.defense);
  const burnPenalty = attacker.status === "burn" ? 0.5 : 1;
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const typeMul = battleEffectiveness(move.type, defender.types);
  const randomMul = 0.9 + Math.random() * 0.15;
  const canCrit = (move.power || 0) > 0 && typeMul > 0;
  const critChance = move.highCrit ? HIGH_CRITICAL_HIT_CHANCE : CRITICAL_HIT_CHANCE;
  const critical = canCrit && Math.random() < critChance;
  const criticalMul = critical ? CRITICAL_HIT_MULTIPLIER : 1;

  if (typeMul === 0) return { damage: 0, typeMul, critical: false, criticalMul: 1 };

  const raw = (((move.power * attack) / Math.max(1, defense)) / 3.35 + 10) * burnPenalty * stab * typeMul * randomMul * criticalMul;
  return { damage: Math.max(1, Math.floor(raw)), typeMul, critical, criticalMul };
}

function createBattlePokemon(template) {
  return {
    id: template.id,
    apiName: template.apiName,
    name: template.name,
    types: [...template.types],
    stats: { ...template.stats },
    hp: template.stats.hp,
    maxHp: template.stats.hp,
    moves: template.moves.map((m) => withDefaultPp(m)),
    frontSprite: template.frontSprite,
    backSprite: template.backSprite,
    fainted: false,
    status: null,
    sleepTurns: 0,
    statStages: { attack: 0, defense: 0, speed: 0 },
    volatile: { rechargeTurns: 0, flinch: false, lockedMove: null, furyCutter: null },
  };
}

function hasActionLock(pokemon) {
  return pokemon?.volatile?.rechargeTurns > 0;
}

function getDefaultAction(pokemon) {
  if (pokemon?.volatile?.rechargeTurns > 0) return { type: "recharge", auto: true };
  if (pokemon?.volatile?.lockedMove && Number.isInteger(pokemon.volatile.lockedMove.moveIndex)) {
    return { type: "move", moveIndex: pokemon.volatile.lockedMove.moveIndex, auto: true, locked: true };
  }
  const idx = pokemon.moves.findIndex((m) => moveHasPp(m) && m.power > 0);
  const anyIdx = pokemon.moves.findIndex((m) => moveHasPp(m));
  return { type: "move", moveIndex: idx >= 0 ? idx : anyIdx >= 0 ? anyIdx : 0, auto: true };
}

function getActionLockReason(pokemon) {
  if (pokemon?.volatile?.rechargeTurns > 0) return "파괴광선의 반동으로 움직일 수 없다!";
  return null;
}

function sortMoveUsers(moveUsers, activeFn) {
  return moveUsers.sort((a, b) => {
    const pa = a.move.priority || 0;
    const pb = b.move.priority || 0;
    if (pa !== pb) return pb - pa;

    const sa = getEffectiveSpeed(activeFn(a.playerKey));
    const sb = getEffectiveSpeed(activeFn(b.playerKey));
    if (sa !== sb) return sb - sa;

    return Math.random() < 0.5 ? -1 : 1;
  });
}

function applyStatChange(target, stat, amount) {
  target.statStages[stat] = clampStage((target.statStages[stat] || 0) + amount);
}

function canApplyStatus(target, status) {
  if (!target || target.fainted || target.status) return false;
  if (status === "burn" && target.types.includes("fire")) return false;
  if (status === "poison" && (target.types.includes("poison") || target.types.includes("steel"))) return false;
  if (status === "paralyze" && target.types.includes("electric")) return false;
  return true;
}

function applyStatus(target, status) {
  target.status = status;
  if (status === "sleep") {
    const sleep = getBattleBalance().sleep || { minTurns: 2, maxTurns: 3 };
    const min = Math.max(0, Math.round(Number(sleep.minTurns ?? 2)));
    const max = Math.max(min, Math.round(Number(sleep.maxTurns ?? 3)));
    target.sleepTurns = min + Math.floor(Math.random() * (max - min + 1));
  }
}

function endTurnStatusDamage(pokemon) {
  if (!pokemon || pokemon.fainted) return null;
  if (pokemon.status === "poison") {
    const amount = Math.max(1, Math.floor(pokemon.maxHp / 8));
    pokemon.hp = Math.max(0, pokemon.hp - amount);
    return { status: "poison", amount };
  }
  if (pokemon.status === "burn") {
    const amount = Math.max(1, Math.floor(pokemon.maxHp / 16));
    pokemon.hp = Math.max(0, pokemon.hp - amount);
    return { status: "burn", amount };
  }
  return null;
}

function hpWarning(pokemon) {
  if (!pokemon || pokemon.fainted) return null;
  return pokemon.hp / pokemon.maxHp <= 0.25 ? `${pokemon.name}의 체력이 위험합니다!` : null;
}

function statDangerWarning(pokemon) {
  if (!pokemon || pokemon.fainted) return null;
  if (pokemon.statStages.attack >= 2) return `위험! ${pokemon.name}의 공격력이 매우 높습니다!`;
  if (pokemon.statStages.attack >= 1) return `${pokemon.name}의 공격력이 올라갔습니다. 다음 공격을 조심하세요!`;
  return null;
}

module.exports = {
  STATUS_KO,
  CRITICAL_HIT_CHANCE,
  HIGH_CRITICAL_HIT_CHANCE,
  CRITICAL_HIT_MULTIPLIER,
  stageMultiplier,
  getEffectiveSpeed,
  isMoveHit,
  calculateDamage,
  createBattlePokemon,
  hasActionLock,
  getDefaultAction,
  getActionLockReason,
  sortMoveUsers,
  applyStatChange,
  resetStatStages,
  canApplyStatus,
  applyStatus,
  endTurnStatusDamage,
  hpWarning,
  statDangerWarning,
  STRUGGLE_MOVE,
  applyBattleBalanceToStruggle,
  reloadBattleBalance,
  moveHasPp,
  hasAnyPpMove,
  consumeMovePp,
};
