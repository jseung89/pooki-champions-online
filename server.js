const os = require("os");
const crypto = require("crypto");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const { loadPokemonData } = require("./src/dataLoader");
const { createDraft } = require("./src/randomDraft");
const { moveDescription } = require("./src/moveLibrary");
const { battleEffectiveness, effectivenessLabel, TYPE_KO } = require("./src/typeChart");
const {
  createBattlePokemon,
  hasActionLock,
  getDefaultAction,
  getActionLockReason,
  sortMoveUsers,
  isMoveHit,
  calculateDamage,
  applyStatChange,
  canApplyStatus,
  applyStatus,
  endTurnStatusDamage,
  hpWarning,
  statDangerWarning,
  STATUS_KO,
} = require("./src/battleEngine");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    version: "6.1.3",
    name: "정승의 푸끼몬 챔피언스 ONLINE v6.2.1",
    rooms: Array.from(rooms.values()).map((room) => ({
      id: room.id,
      name: room.name,
      phase: room.battle?.phase || "UNKNOWN",
      p1Connected: Boolean(room.battle?.players?.p1?.socketId),
      p2Connected: Boolean(room.battle?.players?.p2?.socketId),
      spectators: io.sockets.adapter.rooms.get(`spectators:${room.id}`)?.size || 0,
    })),
    uptime: Math.round(process.uptime()),
  });
});


const PHASE = {
  LOADING: "LOADING",
  WAITING: "WAITING",
  TEAM_SELECT: "TEAM_SELECT",
  ACTION_SELECT: "ACTION_SELECT",
  FORCE_SWITCH: "FORCE_SWITCH",
  TURN_RESOLVE: "TURN_RESOLVE",
  GAME_OVER: "GAME_OVER",
};

let pokemonPool = [];
let dataReady = false;
let battle = null;
let currentRoom = null;

const ROOM_DEFS = [
  { id: "pallet", name: "태초마을", icon: "🌱" },
  { id: "pewter", name: "회색시티", icon: "🪨" },
  { id: "cerulean", name: "블루시티", icon: "💧" },
  { id: "celadon", name: "무지개시티", icon: "🌈" },
];

const rooms = new Map();
const onlineUsers = new Map();
const rankings = new Map();
const lobbyChatMessages = [];


function cleanUserId(value) {
  return String(value || "").trim().replace(/[^0-9A-Za-z가-힣_\-]/g, "").slice(0, 12);
}

function displayName(socket) {
  return cleanUserId(socket?.data?.userId) || "손님";
}

function publicOnlineUsers() {
  return Array.from(onlineUsers.values())
    .sort((a, b) => a.connectedAt - b.connectedAt)
    .map((u) => ({
      userId: u.userId,
      roomId: u.roomId || null,
      roomName: u.roomId && rooms.has(u.roomId) ? rooms.get(u.roomId).name : "로비",
      role: u.role || "lobby",
      connectedAt: u.connectedAt,
    }));
}


function rankingName(value) {
  return cleanUserId(value) || "손님";
}

function getRankingRecord(userId) {
  const name = rankingName(userId);
  if (!rankings.has(name)) {
    rankings.set(name, {
      userId: name,
      score: 1000,
      wins: 0,
      losses: 0,
      streak: 0,
      lastDelta: 0,
      updatedAt: Date.now(),
    });
  }
  return rankings.get(name);
}

function publicRankings() {
  return Array.from(rankings.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    })
    .slice(0, 10)
    .map((r, idx) => ({
      rank: idx + 1,
      userId: r.userId,
      score: r.score,
      wins: r.wins,
      losses: r.losses,
      streak: r.streak,
      lastDelta: r.lastDelta,
    }));
}

function playerDisplayName(role) {
  const player = battle?.players?.[role];
  return rankingName(player?.userId || player?.label || (role === "p1" ? "플레이어 1" : "플레이어 2"));
}

function recordMatchResult(winnerRole, reason = "game_over") {
  if (!battle || battle.rankingRecorded) return null;
  if (winnerRole !== "p1" && winnerRole !== "p2") return null;

  const loserRole = winnerRole === "p1" ? "p2" : "p1";
  const winnerName = playerDisplayName(winnerRole);
  const loserName = playerDisplayName(loserRole);

  if (!winnerName || !loserName || winnerName === loserName) return null;

  const winner = getRankingRecord(winnerName);
  const loser = getRankingRecord(loserName);

  winner.wins += 1;
  winner.score += 30;
  winner.streak += 1;
  winner.lastDelta = 30;
  winner.updatedAt = Date.now();

  loser.losses += 1;
  loser.score = Math.max(0, loser.score - 10);
  loser.streak = 0;
  loser.lastDelta = -10;
  loser.updatedAt = Date.now();

  battle.rankingRecorded = true;
  battle.rankingResult = {
    reason,
    winnerRole,
    loserRole,
    winnerName,
    loserName,
    winnerDelta: 30,
    loserDelta: -10,
    winnerScore: winner.score,
    loserScore: loser.score,
  };

  opLog(`[RANK] ${winnerName} +30 / ${loserName} -10`);
  return battle.rankingResult;
}

function addLobbyChat(socket, text) {
  const clean = String(text || "").trim().slice(0, 140);
  if (!clean) return;
  if (!cleanUserId(socket.data.userId)) {
    socket.emit("loginError", { message: "로그인 후 채팅할 수 있습니다." });
    return;
  }

  const name = displayName(socket);
  lobbyChatMessages.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    text: clean,
    at: Date.now(),
  });

  if (lobbyChatMessages.length > 80) lobbyChatMessages.splice(0, lobbyChatMessages.length - 80);
  emitLobbyState();
}

function updateOnlineUser(socket) {
  if (!socket?.id) return;
  const userId = cleanUserId(socket.data.userId) || `손님${String(socket.id).slice(0, 4)}`;
  onlineUsers.set(socket.id, {
    socketId: socket.id,
    userId,
    roomId: socket.data.roomId || null,
    role: socket.data.role || "lobby",
    connectedAt: socket.data.connectedAt || Date.now(),
  });
}

function emitOnlineState() {
  emitLobbyState();
}

function localIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "YOUR_LOCAL_IP";
}

function opLog(text) {
  console.log(text);
}

function emptyPlayer(role) {
  return {
    socketId: null,
    playerToken: null,
    label: role === "p1" ? "플레이어 1" : "플레이어 2",
    candidatePool: [],
    selectedTeamIds: [],
    team: [],
    teamReady: false,
    activeIndex: 0,
    selectedAction: null,
    timeoutCount: 0,
    userId: null,
  };
}

function newBattleState(preservedSockets = {}) {
  return {
    phase: dataReady ? PHASE.WAITING : PHASE.LOADING,
    turn: 1,
    timerEndAt: null,
    forceSwitchPlayers: [],
    players: {
      p1: {
        ...emptyPlayer("p1"),
        socketId: preservedSockets.p1?.socketId || preservedSockets.p1 || null,
        playerToken: preservedSockets.p1?.playerToken || null,
      },
      p2: {
        ...emptyPlayer("p2"),
        socketId: preservedSockets.p2?.socketId || preservedSockets.p2 || null,
        playerToken: preservedSockets.p2?.playerToken || null,
      },
    },
    logs: [],
    events: [],
    chatMessages: [],
    winner: null,
    winnerRole: null,
    rankingRecorded: false,
    rankingResult: null,
    pausedFromBattle: false,
  };
}

function initRooms() {
  rooms.clear();
  for (const def of ROOM_DEFS) {
    rooms.set(def.id, {
      ...def,
      battle: newBattleState(),
      timer: null,
      resolveInProgress: false,
    });
  }
}

function withRoom(roomId, fn) {
  const room = typeof roomId === "object" ? roomId : rooms.get(roomId);
  if (!room) return null;
  currentRoom = room;
  battle = room.battle;
  return fn(room);
}

function scheduleRoom(fn, delay) {
  const roomId = currentRoom?.id;
  return setTimeout(() => withRoom(roomId, () => fn()), delay);
}

function clearBattleTimer() {
  if (currentRoom?.timer) clearTimeout(currentRoom.timer);
  if (currentRoom) currentRoom.timer = null;
}

function log(text) {
  battle.logs.push(text);
}

function addEvent(event) {
  battle.events.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ...event,
  });
}

function active(pk) {
  const player = battle.players[pk];
  return player.team[player.activeIndex];
}

function opponentOf(pk) {
  return pk === "p1" ? "p2" : "p1";
}

function hasAlivePokemon(pk) {
  return battle.players[pk].team.some((p) => !p.fainted);
}

function hasAliveBench(pk) {
  const player = battle.players[pk];
  return player.team.some((p, idx) => idx !== player.activeIndex && !p.fainted);
}

function bothPlayersConnected() {
  return !!battle?.players?.p1?.socketId && !!battle?.players?.p2?.socketId;
}

function resetPlayerBattleChoices(role, options = {}) {
  const player = battle.players[role];
  if (!player) return;

  const keepTeam = !!options.keepTeam;

  player.selectedTeamIds = [];
  if (!keepTeam) {
    player.team = [];
    player.teamReady = false;
    player.activeIndex = 0;
  }
  player.selectedAction = null;
  player.timeoutCount = 0;
}

function pauseRoomForMissingPlayer(reason = "player_missing") {
  if (!battle || !currentRoom) return false;
  if (battle.phase === PHASE.LOADING || battle.phase === PHASE.WAITING) {
    clearBattleTimer();
    if (currentRoom) currentRoom.resolveInProgress = false;
    return false;
  }

  clearBattleTimer();
  if (currentRoom) currentRoom.resolveInProgress = false;

  battle.phase = dataReady ? PHASE.WAITING : PHASE.LOADING;
  battle.timerEndAt = null;
  battle.events = [];
  battle.forceSwitchPlayers = [];

  const wasBattleInProgress = [PHASE.ACTION_SELECT, PHASE.TURN_RESOLVE, PHASE.FORCE_SWITCH].includes(battle.phase);
  battle.pausedFromBattle = wasBattleInProgress;

  for (const pk of ["p1", "p2"]) {
    battle.players[pk].selectedAction = null;
    if (!battle.players[pk].socketId) {
      resetPlayerBattleChoices(pk, { keepTeam: wasBattleInProgress });
    }
  }

  const msg = "플레이어가 나가서 방이 대기 상태로 돌아갔습니다. 두 명이 다시 모이면 새 팀 선택이 시작됩니다.";
  log(msg);
  addEvent({ type: "warning", text: msg });
  opLog(`[ROOM_PAUSE] ${currentRoom.name} ${reason} → WAITING`);

  emitState();
  emitLobbyState();
  return true;
}

function ensureTwoPlayersOrPause(context = "guard") {
  if (!bothPlayersConnected()) {
    pauseRoomForMissingPlayer(context);
    return false;
  }
  return true;
}

function publicPokemon(p) {
  return {
    id: p.id,
    apiName: p.apiName,
    name: p.name,
    types: p.types,
    stats: p.stats,
    hp: p.hp,
    maxHp: p.maxHp,
    moves: p.moves,
    frontSprite: p.frontSprite,
    backSprite: p.backSprite,
    height: p.height,
    spriteScale: p.spriteScale,
    height: p.height,
    spriteScale: p.spriteScale,
    fainted: p.fainted,
    status: p.status,
    sleepTurns: p.sleepTurns,
    statStages: p.statStages,
    volatile: p.volatile,
  };
}

function publicCandidate(p) {
  return {
    id: p.id,
    name: p.name,
    apiName: p.apiName,
    types: p.types,
    stats: p.stats,
    frontSprite: p.frontSprite,
    backSprite: p.backSprite,
    moves: p.moves,
    draftScore: p.draftScore,
  };
}

function publicPlayer(player) {
  return {
    label: player.label,
    userId: player.userId || player.label,
    displayName: player.userId || player.label,
    activeIndex: player.activeIndex,
    candidatePool: player.candidatePool.map(publicCandidate),
    selectedTeamIds: player.teamReady ? player.selectedTeamIds : [],
    team: player.team.map(publicPokemon),
    teamReady: player.teamReady,
    selectedAction: player.selectedAction ? { type: player.selectedAction.type, auto: !!player.selectedAction.auto } : null,
    timeoutCount: player.timeoutCount,
    connected: !!player.socketId,
  };
}

function spectatorCount(roomId = currentRoom?.id) {
  return io.sockets.adapter.rooms.get(`spectators:${roomId}`)?.size || 0;
}

function publicState() {
  return {
    phase: battle.phase,
    turn: battle.turn,
    timerEndAt: battle.timerEndAt,
    forceSwitchPlayers: battle.forceSwitchPlayers,
    players: {
      p1: publicPlayer(battle.players.p1),
      p2: publicPlayer(battle.players.p2),
    },
    roomInfo: {
      roomId: currentRoom?.id,
      roomName: currentRoom?.name,
      roomIcon: currentRoom?.icon,
      spectatorCount: spectatorCount(),
      p1Connected: !!battle.players.p1.socketId,
      p2Connected: !!battle.players.p2.socketId,
      p1Name: battle.players.p1.userId || battle.players.p1.label,
      p2Name: battle.players.p2.userId || battle.players.p2.label,
    },
    logs: battle.logs.slice(-120),
    events: battle.events,
    chatMessages: battle.chatMessages.slice(-80),
    winner: battle.winner,
    winnerRole: battle.winnerRole,
    rankingResult: battle.rankingResult,
    rankings: publicRankings(),
    typeKo: TYPE_KO,
  };
}

function emitState() {
  if (!currentRoom) return;
  const state = publicState();
  for (const role of ["p1", "p2"]) {
    const socketId = battle.players[role].socketId;
    if (socketId) io.to(socketId).emit("state", { role, state });
  }
  io.to(`spectators:${currentRoom.id}`).emit("state", { role: "spectator", state });
  emitLobbyState();
}

function roomStatusLabel(room) {
  const phase = room.battle.phase;
  if (phase === PHASE.LOADING) return "로딩중";
  if (phase === PHASE.WAITING) return "대기중";
  if (phase === PHASE.TEAM_SELECT) return "팀 선택중";
  if (phase === PHASE.ACTION_SELECT || phase === PHASE.TURN_RESOLVE || phase === PHASE.FORCE_SWITCH) return "배틀중";
  if (phase === PHASE.GAME_OVER) return "게임 종료";
  return "대기중";
}

function publicRoomSummary(room) {
  return {
    id: room.id,
    name: room.name,
    icon: room.icon,
    phase: room.battle.phase,
    status: roomStatusLabel(room),
    p1Connected: !!room.battle.players.p1.socketId,
    p2Connected: !!room.battle.players.p2.socketId,
    p1Name: room.battle.players.p1.userId || room.battle.players.p1.label,
    p2Name: room.battle.players.p2.userId || room.battle.players.p2.label,
    p1Ready: !!room.battle.players.p1.teamReady,
    p2Ready: !!room.battle.players.p2.teamReady,
    spectatorCount: spectatorCount(room.id),
    winner: room.battle.winner,
  };
}

function publicLobbyState() {
  return {
    dataReady,
    rooms: [...rooms.values()].map(publicRoomSummary),
    onlineUsers: publicOnlineUsers(),
    rankings: publicRankings(),
    lobbyChatMessages: lobbyChatMessages.slice(-80),
  };
}

function emitLobbyState() {
  io.to("lobby").emit("lobbyState", publicLobbyState());
}

function assignDrafts(force = false) {
  for (const pk of ["p1", "p2"]) {
    const player = battle.players[pk];
    if (force || !Array.isArray(player.candidatePool) || player.candidatePool.length === 0) {
      player.candidatePool = createDraft(pokemonPool, 12);
      opLog(`[DRAFT] ${player.label} 후보 12마리 생성 완료`);
    } else {
      opLog(`[DRAFT] ${player.label} 기존 후보 유지`);
    }
  }
}

function startTeamSelect() {
  clearBattleTimer();
  if (currentRoom) currentRoom.resolveInProgress = false;

  if (!ensureTwoPlayersOrPause("start_team_select")) {
    return;
  }

  battle.phase = PHASE.TEAM_SELECT;
  battle.turn = 1;
  battle.winner = null;
  battle.winnerRole = null;
  battle.rankingRecorded = false;
  battle.rankingResult = null;
  battle.events = [];
  battle.forceSwitchPlayers = [];
  assignDrafts(false);

  for (const pk of ["p1", "p2"]) {
    const player = battle.players[pk];
    player.selectedTeamIds = [];
    player.team = [];
    player.teamReady = false;
    player.activeIndex = 0;
    player.selectedAction = null;
    player.timeoutCount = 0;
  }

  log("랜덤 후보 12마리가 지급되었습니다. 각자 출전할 포켓몬 2마리를 선택하세요.");
  opLog("[GAME] 팀 선택 시작");
  emitState();
}

function maybeStartBattle() {
  if (!ensureTwoPlayersOrPause("maybe_start_battle")) {
    return;
  }

  if (!battle.players.p1.teamReady || !battle.players.p2.teamReady) {
    emitState();
    return;
  }

  battle.phase = PHASE.TURN_RESOLVE;
  battle.events = [];
  log("배틀 시작!");
  addEvent({ type: "message", text: "배틀 시작!" });
  opLog("[GAME] 배틀 시작");
  emitState();
  scheduleRoom(() => startActionSelect(), 1200);
}

function autoRechargeActions() {
  for (const pk of ["p1", "p2"]) {
    const mon = active(pk);
    if (mon && hasActionLock(mon)) battle.players[pk].selectedAction = { type: "recharge", auto: true };
  }
}

function startActionSelect() {
  if (battle.phase === PHASE.GAME_OVER) return;
  if (!ensureTwoPlayersOrPause("start_action_select")) return;

  clearBattleTimer();
  if (currentRoom) currentRoom.resolveInProgress = false;
  battle.phase = PHASE.ACTION_SELECT;
  battle.events = [];
  battle.players.p1.selectedAction = null;
  battle.players.p2.selectedAction = null;

  autoRechargeActions();

  opLog(`[TURN ${battle.turn}] 행동 선택 시작`);

  if (battle.players.p1.selectedAction && battle.players.p2.selectedAction) {
    scheduleRoom(() => resolveTurn(), 700);
    emitState();
    return;
  }

  battle.timerEndAt = Date.now() + 20000;
  const roomId = currentRoom.id;
  currentRoom.timer = setTimeout(() => withRoom(roomId, () => {
    if (battle.phase === PHASE.ACTION_SELECT) resolveTurn();
  }), 20000);

  emitState();
}

function startForceSwitch(players) {
  if (battle.phase === PHASE.GAME_OVER) return;
  if (!ensureTwoPlayersOrPause("start_force_switch")) return;
  clearBattleTimer();

  battle.phase = PHASE.FORCE_SWITCH;
  battle.events = [];
  battle.forceSwitchPlayers = players;
  battle.timerEndAt = Date.now() + 15000;

  for (const pk of players) battle.players[pk].selectedAction = null;

  log("교체가 필요합니다!");
  addEvent({ type: "message", text: "교체가 필요합니다!" });
  opLog(`[FORCE_SWITCH] ${players.map((p) => battle.players[p].label).join(", ")} 강제 교체 필요`);

  const roomId = currentRoom.id;
  currentRoom.timer = setTimeout(() => withRoom(roomId, () => {
    if (battle.phase !== PHASE.FORCE_SWITCH) return;

    for (const pk of battle.forceSwitchPlayers) {
      if (!battle.players[pk].selectedAction) {
        const player = battle.players[pk];
        const idx = player.team.findIndex((p, i) => i !== player.activeIndex && !p.fainted);
        if (idx >= 0) player.selectedAction = { type: "switch", targetIndex: idx, auto: true };
      }
    }
    resolveForceSwitch();
  }), 15000);

  emitState();
}

function doSwitch(pk, targetIndex, auto = false) {
  const player = battle.players[pk];
  const prev = active(pk);
  const target = player.team[targetIndex];

  if (!target || target.fainted || targetIndex === player.activeIndex) return false;

  player.activeIndex = targetIndex;
  const next = active(pk);

  log(`${player.label}${auto ? "이 시간 초과로" : "이"} ${prev.name}을/를 불러들이고 ${next.name}을/를 내보냈다!`);
  addEvent({ type: "switch", player: pk, from: prev.name, to: next.name, auto });
  return true;
}

function processSwitches(actions) {
  for (const pk of ["p1", "p2"]) {
    const action = actions[pk];
    if (!action || action.type !== "switch") continue;
    doSwitch(pk, action.targetIndex, action.auto);
  }
}

function buildMoveUsers(actions) {
  const result = [];
  for (const pk of ["p1", "p2"]) {
    const action = actions[pk];
    const mon = active(pk);
    if (!action || action.type !== "move") continue;
    if (!mon || mon.fainted || mon.hp <= 0) continue;
    const move = mon.moves[action.moveIndex];
    if (!move) continue;
    result.push({ playerKey: pk, moveIndex: action.moveIndex, move });
  }
  return result;
}

function faintPokemon(pk) {
  const mon = active(pk);
  if (!mon || mon.fainted) return;

  mon.hp = 0;
  mon.fainted = true;
  log(`${mon.name}은/는 쓰러졌다!`);
  opLog(`[FAINT] ${mon.name} 기절`);
  addEvent({ type: "faint", target: pk, name: mon.name });
}

function applyDamage(attackerKey, defenderKey, move) {
  const attacker = active(attackerKey);
  const defender = active(defenderKey);
  const result = calculateDamage(attacker, defender, move);

  defender.hp = Math.max(0, defender.hp - result.damage);

  if (result.typeMul === 0) log(`${defender.name}에게 효과가 없다!`);
  else log(`${defender.name}에게 ${result.damage} 피해!`);

  addEvent({
    type: "damage",
    attacker: attackerKey,
    defender: defenderKey,
    amount: result.damage,
    moveType: move.type,
    effectiveness: result.typeMul,
    hp: defender.hp,
    maxHp: defender.maxHp,
    defenderName: defender.name,
  });

  if (result.typeMul === 0) addEvent({ type: "message", text: "효과가 없다!" });
  else if (result.typeMul >= 2) addEvent({ type: "message", text: "효과가 굉장했다!" });
  else if (result.typeMul < 1) addEvent({ type: "message", text: "효과가 별로인 듯하다..." });

  const warn = hpWarning(defender);
  if (warn) addEvent({ type: "warning", text: warn });

  if (defender.hp <= 0) faintPokemon(defenderKey);
}

function useMove(attackerKey, defenderKey, moveIndex) {
  const attacker = active(attackerKey);
  const defender = active(defenderKey);

  if (!attacker || !defender) return;
  if (attacker.fainted || attacker.hp <= 0) return;
  if (defender.fainted || defender.hp <= 0) return;

  const move = attacker.moves[moveIndex];
  if (!move) return;

  if (attacker.status === "sleep") {
    attacker.sleepTurns -= 1;
    if (attacker.sleepTurns <= 0) {
      attacker.status = null;
      log(`${attacker.name}이/가 잠에서 깨어났다!`);
      addEvent({ type: "message", text: `${attacker.name}이/가 잠에서 깨어났다!` });
    } else {
      log(`${attacker.name}은/는 잠들어 있다...`);
      addEvent({ type: "skip", player: attackerKey, reason: "sleep" });
      return;
    }
  }

  if (attacker.status === "paralyze" && Math.random() < 0.25) {
    log(`${attacker.name}은/는 몸이 저려서 움직일 수 없었다!`);
    addEvent({ type: "skip", player: attackerKey, reason: "paralyze" });
    return;
  }

  const didHit = isMoveHit(move);
  log(`${battle.players[attackerKey].label}의 ${attacker.name}, ${move.name}!`);

  addEvent({
    type: "move",
    attacker: attackerKey,
    defender: defenderKey,
    moveType: move.type,
    moveName: move.name,
    attackerName: attacker.name,
    defenderName: defender.name,
    outcome: didHit ? (move.power > 0 ? "hit" : "status") : "miss",
    isStatusMove: move.power === 0,
    description: moveDescription(move),
  });

  if (move.recharge) {
    attacker.volatile.rechargeTurns = move.recharge;
    addEvent({ type: "warning", text: `${attacker.name}은/는 다음 턴 반동으로 움직일 수 없습니다!` });
  }

  if (!didHit) {
    log("하지만 빗나갔다!");
    addEvent({ type: "miss", attacker: attackerKey, defender: defenderKey });
    return;
  }

  if (move.rest) {
    const before = attacker.hp;
    attacker.hp = attacker.maxHp;
    attacker.status = "sleep";
    attacker.sleepTurns = move.rest.turns || 2;
    log(`${attacker.name}은/는 잠자기로 HP를 모두 회복하고 잠들었다!`);
    addEvent({ type: "heal", target: attackerKey, amount: attacker.hp - before, hp: attacker.hp, maxHp: attacker.maxHp, name: attacker.name });
    addEvent({ type: "status", target: attackerKey, status: "sleep", name: attacker.name });
    return;
  }

  if (move.fixedDamageRatio) {
    const amount = Math.max(1, Math.floor(defender.maxHp * move.fixedDamageRatio));
    defender.hp = Math.max(0, defender.hp - amount);
    log(`${defender.name}에게 ${move.name}의 멸망 피해!`);
    addEvent({
      type: "damage",
      attacker: attackerKey,
      defender: defenderKey,
      amount,
      moveType: move.type,
      effectiveness: 1,
      hp: defender.hp,
      maxHp: defender.maxHp,
      defenderName: defender.name,
    });

    if (move.statChangeAfterDamage && defender.hp > 0 && !defender.fainted) {
      const change = move.statChangeAfterDamage;
      const targetKey = change.target === "self" ? attackerKey : defenderKey;
      const target = active(targetKey);
      if (target && !target.fainted) {
        applyStatChange(target, change.stat, change.amount);
        addEvent({ type: "stat", target: targetKey, stat: change.stat, amount: change.amount, name: target.name });
      }
    }

    if (defender.hp <= 0) faintPokemon(defenderKey);
    return;
  }

  if (move.heal) {
    const before = attacker.hp;
    const amount = Math.max(1, Math.floor(attacker.maxHp * move.heal.ratio));
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + amount);
    log(`${attacker.name}의 HP가 회복되었다!`);
    addEvent({ type: "heal", target: attackerKey, amount: attacker.hp - before, hp: attacker.hp, maxHp: attacker.maxHp, name: attacker.name });
    return;
  }

  if (move.statChange) {
    const targetKey = move.statChange.target === "self" ? attackerKey : defenderKey;
    const target = active(targetKey);

    if (target && !target.fainted) {
      applyStatChange(target, move.statChange.stat, move.statChange.amount);
      const statKo = { attack: "공격", defense: "방어", speed: "스피드" }[move.statChange.stat] || move.statChange.stat;
      log(`${target.name}의 ${statKo}이/가 ${move.statChange.amount > 0 ? "올라갔다" : "떨어졌다"}!`);
      addEvent({ type: "stat", target: targetKey, stat: move.statChange.stat, amount: move.statChange.amount, name: target.name });

      const warn = statDangerWarning(target);
      if (warn) addEvent({ type: "warning", text: warn });
    }
    return;
  }

  if (move.statusMove) {
    const targetKey = move.statusMove.target === "self" ? attackerKey : defenderKey;
    const target = active(targetKey);
    if (canApplyStatus(target, move.statusMove.status)) {
      applyStatus(target, move.statusMove.status);
      log(`${target.name}은/는 ${STATUS_KO[move.statusMove.status]} 상태가 되었다!`);
      addEvent({ type: "status", target: targetKey, status: move.statusMove.status, name: target.name });
    } else {
      addEvent({ type: "message", text: "하지만 상태이상은 통하지 않았다!" });
    }
    return;
  }

  if (move.power > 0) {
    applyDamage(attackerKey, defenderKey, move);

    const defenderAfter = active(defenderKey);
    if (move.effect && defenderAfter && defenderAfter.hp > 0 && !defenderAfter.fainted) {
      if (canApplyStatus(defenderAfter, move.effect.status) && Math.random() * 100 < move.effect.chance) {
        applyStatus(defenderAfter, move.effect.status);
        log(`${defenderAfter.name}은/는 ${STATUS_KO[move.effect.status]} 상태가 되었다!`);
        addEvent({ type: "status", target: defenderKey, status: move.effect.status, name: defenderAfter.name });
      }
    }
  }
}

function processRechargeActions(actions) {
  for (const pk of ["p1", "p2"]) {
    const action = actions[pk];
    if (!action || action.type !== "recharge") continue;

    const mon = active(pk);
    if (!mon || mon.fainted) continue;

    const reason = getActionLockReason(mon) || "반동으로 움직일 수 없다!";
    mon.volatile.rechargeTurns = Math.max(0, mon.volatile.rechargeTurns - 1);
    log(`${mon.name}은/는 ${reason}`);
    addEvent({ type: "skip", player: pk, reason: "recharge", text: `${mon.name}은/는 ${reason}` });
  }
}

function processEndTurnStatus() {
  for (const pk of ["p1", "p2"]) {
    const mon = active(pk);
    const result = endTurnStatusDamage(mon);
    if (!result) continue;

    log(`${mon.name}은/는 ${STATUS_KO[result.status]} 피해를 입었다!`);
    addEvent({ type: "statusDamage", target: pk, status: result.status, amount: result.amount, hp: mon.hp, maxHp: mon.maxHp, name: mon.name });
    if (mon.hp <= 0) faintPokemon(pk);
  }
}

function checkWinner() {
  const p1Alive = hasAlivePokemon("p1");
  const p2Alive = hasAlivePokemon("p2");

  let winnerRole = null;

  if (!p1Alive && !p2Alive) {
    battle.winner = "무승부";
    battle.winnerRole = null;
  } else if (!p1Alive) {
    winnerRole = "p2";
    battle.winner = playerDisplayName("p2");
    battle.winnerRole = "p2";
  } else if (!p2Alive) {
    winnerRole = "p1";
    battle.winner = playerDisplayName("p1");
    battle.winnerRole = "p1";
  }

  if (battle.players.p1.timeoutCount >= 3) {
    winnerRole = "p2";
    battle.winner = playerDisplayName("p2");
    battle.winnerRole = "p2";
    addEvent({ type: "warning", text: `${playerDisplayName("p1")}이 3회 연속 시간 초과로 패배했습니다!` });
  }
  if (battle.players.p2.timeoutCount >= 3) {
    winnerRole = "p1";
    battle.winner = playerDisplayName("p1");
    battle.winnerRole = "p1";
    addEvent({ type: "warning", text: `${playerDisplayName("p2")}이 3회 연속 시간 초과로 패배했습니다!` });
  }

  if (battle.winner) {
    battle.phase = PHASE.GAME_OVER;
    clearBattleTimer();

    const rankResult = winnerRole ? recordMatchResult(winnerRole, "game_over") : null;

    log(`${battle.winner} 승리!`);
    if (rankResult) {
      log(`랭킹 반영: ${rankResult.winnerName} +30점 / ${rankResult.loserName} -10점`);
    }

    opLog(`[GAME_OVER] ${battle.winner} 승리`);
    addEvent({ type: "gameOver", winner: battle.winner, winnerRole, rankingResult: rankResult });
    emitLobbyState();
    return true;
  }

  return false;
}

function getForceSwitchTargets() {
  return ["p1", "p2"].filter((pk) => {
    const mon = active(pk);
    return mon && mon.fainted && hasAliveBench(pk);
  });
}

function resolveForceSwitch() {
  if (battle.phase !== PHASE.FORCE_SWITCH) return;
  if (!ensureTwoPlayersOrPause("resolve_force_switch")) return;
  clearBattleTimer();
  battle.phase = PHASE.TURN_RESOLVE;
  battle.events = [];

  for (const pk of battle.forceSwitchPlayers) {
    const action = battle.players[pk].selectedAction;
    if (!action || action.type !== "switch") continue;
    doSwitch(pk, action.targetIndex, action.auto);
    battle.players[pk].selectedAction = null;
  }

  battle.forceSwitchPlayers = [];

  if (checkWinner()) {
    emitState();
    return;
  }

  battle.turn += 1;
  emitState();
  scheduleRoom(() => startActionSelect(), 1500);
}

function actionName(pk, action) {
  if (!action) return "미선택";
  if (action.type === "recharge") return "반동 대기";
  if (action.type === "switch") {
    const target = battle.players[pk].team[action.targetIndex];
    return `교체 → ${target?.name || "알 수 없음"}`;
  }
  if (action.type === "move") {
    const mon = active(pk);
    return mon?.moves?.[action.moveIndex]?.name || "기술";
  }
  return action.type;
}

function resolveTurn() {
  if (battle.phase !== PHASE.ACTION_SELECT) return;
  if (!ensureTwoPlayersOrPause("resolve_turn")) return;
  if (currentRoom?.resolveInProgress) return;

  if (currentRoom) currentRoom.resolveInProgress = true;
  clearBattleTimer();

  battle.phase = PHASE.TURN_RESOLVE;
  battle.events = [];

  const actions = {
    p1: battle.players.p1.selectedAction || getDefaultAction(active("p1")),
    p2: battle.players.p2.selectedAction || getDefaultAction(active("p2")),
  };

  for (const pk of ["p1", "p2"]) {
    if (!battle.players[pk].selectedAction) {
      battle.players[pk].timeoutCount += 1;
      addEvent({ type: "message", text: `${battle.players[pk].label}이 시간 초과로 기본 행동을 선택했다!` });
    } else {
      battle.players[pk].timeoutCount = 0;
    }
  }

  opLog(`[TURN ${battle.turn}] 플레이어 1 선택: ${actionName("p1", actions.p1)}`);
  opLog(`[TURN ${battle.turn}] 플레이어 2 선택: ${actionName("p2", actions.p2)}`);
  opLog(`[TURN ${battle.turn}] 처리 시작`);

  log(`--- ${battle.turn}턴 ---`);
  addEvent({ type: "turnStart", turn: battle.turn, text: `${battle.turn}턴` });

  processSwitches(actions);
  processRechargeActions(actions);

  const moveUsers = sortMoveUsers(buildMoveUsers(actions), active);

  for (const user of moveUsers) {
    const attackerKey = user.playerKey;
    const defenderKey = opponentOf(attackerKey);
    const attacker = active(attackerKey);
    const defender = active(defenderKey);

    if (!attacker || attacker.fainted || attacker.hp <= 0) continue;
    if (!defender || defender.fainted || defender.hp <= 0) continue;

    useMove(attackerKey, defenderKey, user.moveIndex);
  }

  processEndTurnStatus();

  opLog(`[TURN ${battle.turn}] 처리 완료`);

  if (checkWinner()) {
    emitState();
    return;
  }

  const forceTargets = getForceSwitchTargets();
  emitState();

  if (forceTargets.length > 0) {
    scheduleRoom(() => startForceSwitch(forceTargets), 1700);
    return;
  }

  battle.turn += 1;
  scheduleRoom(() => startActionSelect(), 1700);
}

function validateAction(role, action) {
  const player = battle.players[role];
  if (!player || !action) return false;

  if (battle.phase === PHASE.ACTION_SELECT) {
    const mon = active(role);
    if (!mon || mon.fainted) return false;

    if (hasActionLock(mon)) return action.type === "recharge";

    if (action.type === "move") return Number.isInteger(action.moveIndex) && !!mon.moves[action.moveIndex];
    if (action.type === "switch") {
      const target = player.team[action.targetIndex];
      return !!target && !target.fainted && action.targetIndex !== player.activeIndex;
    }
  }

  if (battle.phase === PHASE.FORCE_SWITCH) {
    if (!battle.forceSwitchPlayers.includes(role)) return false;
    if (action.type !== "switch") return false;
    const target = player.team[action.targetIndex];
    return !!target && !target.fainted && action.targetIndex !== player.activeIndex;
  }

  return false;
}


function winnerRoleForLoser(loserRole) {
  if (loserRole === "p1") return "p2";
  if (loserRole === "p2") return "p1";
  return null;
}

function setGameOverBySurrender(loserRole) {
  const winnerRole = winnerRoleForLoser(loserRole);
  if (!winnerRole) return false;

  const loserName = playerDisplayName(loserRole);
  const winnerName = playerDisplayName(winnerRole);

  clearBattleTimer();
  battle.phase = PHASE.GAME_OVER;
  battle.winner = winnerName;
  battle.winnerRole = winnerRole;
  battle.events = [];

  const rankResult = recordMatchResult(winnerRole, "surrender");
  const message = `${loserName}이 항복했습니다. ${winnerName} 승리!`;

  log(message);
  if (rankResult) {
    log(`랭킹 반영: ${rankResult.winnerName} +30점 / ${rankResult.loserName} -10점`);
  }

  opLog(`[SURRENDER] ${loserName} 항복`);
  opLog(`[GAME_OVER] ${winnerName} 승리`);

  addEvent({ type: "warning", text: `${loserName}이 항복했습니다.` });
  addEvent({ type: "gameOver", winner: winnerName, winnerRole, rankingResult: rankResult });

  emitState();
  emitLobbyState();
  return true;
}

function handleSurrender(role) {
  if (role !== "p1" && role !== "p2") return;
  if (battle.phase === PHASE.LOADING || battle.phase === PHASE.WAITING || battle.phase === PHASE.GAME_OVER) return;

  setGameOverBySurrender(role);
}



function resetBattleForNewGame() {
  const sockets = {
    p1: {
      socketId: battle.players.p1.socketId,
      playerToken: battle.players.p1.playerToken,
    },
    p2: {
      socketId: battle.players.p2.socketId,
      playerToken: battle.players.p2.playerToken,
    },
  };

  currentRoom.battle = newBattleState(sockets);
  battle = currentRoom.battle;
  currentRoom.resolveInProgress = false;
  clearBattleTimer();

  if (dataReady && sockets.p1?.socketId && sockets.p2?.socketId) {
    opLog("[REMATCH] 새 게임 시작");
    startTeamSelect();
    return;
  }

  battle.phase = dataReady ? PHASE.WAITING : PHASE.LOADING;
  emitState();
}

function handleRematch(role) {
  if (role !== "p1" && role !== "p2") return;
  if (battle.phase !== PHASE.GAME_OVER) return;

  resetBattleForNewGame();
}


function resetGameKeepSockets() {
  const sockets = {
    p1: {
      socketId: battle.players.p1.socketId,
      playerToken: battle.players.p1.playerToken,
    },
    p2: {
      socketId: battle.players.p2.socketId,
      playerToken: battle.players.p2.playerToken,
    },
  };

  currentRoom.battle = newBattleState(sockets);
  battle = currentRoom.battle;
  currentRoom.resolveInProgress = false;
  clearBattleTimer();

  if (dataReady && sockets.p1 && sockets.p2) {
    startTeamSelect();
    return;
  }

  emitState();
}


function createPlayerToken() {
  return crypto.randomBytes(16).toString("hex");
}

function normalizeToken(token) {
  const clean = String(token || "").trim();
  return clean.length >= 16 && clean.length <= 128 ? clean : null;
}

function findRoleByToken(token) {
  if (!token) return null;
  if (battle.players.p1.playerToken === token) return "p1";
  if (battle.players.p2.playerToken === token) return "p2";
  return null;
}

function assignRoleForConnection(token) {
  const existingRole = findRoleByToken(token);

  // 같은 토큰으로 돌아온 플레이어는 원래 자리로 복귀합니다.
  if (existingRole && !battle.players[existingRole].socketId) return existingRole;

  // 기존 토큰이 남아 있어도 실제 접속자가 없으면 빈자리로 간주합니다.
  if (!battle.players.p1.socketId) return "p1";
  if (!battle.players.p2.socketId) return "p2";

  return "spectator";
}

function bindSocketToRole(socket, role, token) {
  const player = battle.players[role];
  player.socketId = socket.id;
  player.userId = cleanUserId(socket.data.userId) || player.userId || player.label;
  player.label = player.userId || (role === "p1" ? "플레이어 1" : "플레이어 2");

  // 빈자리를 새 사람이 차지하는 경우 예전 토큰을 물려받지 않도록 새 토큰을 부여합니다.
  player.playerToken = token || createPlayerToken();

  return player.playerToken;
}

function leaveCurrentRoom(socket, reason = "leave") {
  const roomId = socket.data.roomId;
  const role = socket.data.role;
  if (!roomId || !rooms.has(roomId)) return;

  withRoom(roomId, () => {
    if (role === "p1" || role === "p2") {
      if (battle.players[role].socketId === socket.id) {
        battle.players[role].socketId = null;
      }
      opLog(`[${reason.toUpperCase()}] ${currentRoom.name} ${battle.players[role].label} 이탈`);
      log(`${battle.players[role].label}이 방을 나갔습니다. 관전자가 빈자리에 참가할 수 있습니다.`);
      resetPlayerBattleChoices(role, { keepTeam: [PHASE.ACTION_SELECT, PHASE.TURN_RESOLVE, PHASE.FORCE_SWITCH].includes(battle.phase) });
      pauseRoomForMissingPlayer(`${reason}_${role}`);
    } else if (role === "spectator") {
      socket.leave(`spectators:${roomId}`);
      emitState();
    }
  });

  socket.data.roomId = null;
  socket.data.role = null;
  updateOnlineUser(socket);
  emitOnlineState();
}

function claimPlayerSlot(socket) {
  if (!cleanUserId(socket.data.userId)) {
    socket.emit("roomError", { message: "로그인 후 플레이어로 참가할 수 있습니다." });
    return;
  }

  const roomId = socket.data.roomId;
  const role = socket.data.role;

  if (!roomId || !rooms.has(roomId)) {
    socket.emit("roomError", { message: "먼저 방에 입장해야 합니다." });
    return;
  }

  if (role !== "spectator") {
    socket.emit("roomError", { message: "이미 플레이어입니다." });
    return;
  }

  withRoom(roomId, () => {
    const targetRole = !battle.players.p1.socketId ? "p1" : (!battle.players.p2.socketId ? "p2" : null);

    if (!targetRole) {
      socket.emit("roomError", { message: "빈 플레이어 자리가 없습니다." });
      return;
    }

    socket.leave(`spectators:${roomId}`);
    const token = bindSocketToRole(socket, targetRole, null);
    socket.data.role = targetRole;
    updateOnlineUser(socket);
    emitOnlineState();

    resetPlayerBattleChoices(targetRole);
    const player = battle.players[targetRole];
    log(`${player.label} 자리에 관전자가 참가했습니다!`);
    opLog(`[CLAIM] ${currentRoom.name} 관전자 → ${player.label}`);

    socket.emit("joinedRoom", {
      role: targetRole,
      playerToken: token,
      roomId,
      roomName: currentRoom.name,
      roomIcon: currentRoom.icon,
    });

    if (dataReady && battle.players.p1.socketId && battle.players.p2.socketId && battle.phase === PHASE.WAITING) {
      if (battle.pausedFromBattle && battle.players.p1.team.length && battle.players.p2.team.length) {
        battle.pausedFromBattle = false;
        log("두 플레이어가 다시 모였습니다. 기존 팀으로 배틀을 재개합니다.");
        startActionSelect();
      } else {
        startTeamSelect();
      }
    } else {
      emitState();
    }
  });
}

function joinRoom(socket, roomId, token) {
  if (!cleanUserId(socket.data.userId)) {
    socket.emit("roomError", { message: "로그인 후 방에 입장할 수 있습니다." });
    socket.emit("loginError", { message: "로그인 후 방에 입장할 수 있습니다." });
    return;
  }

  if (!rooms.has(roomId)) {
    socket.emit("roomError", { message: "존재하지 않는 방입니다." });
    return;
  }

  leaveCurrentRoom(socket, "switch_room");
  socket.leave("lobby");

  withRoom(roomId, () => {
    const cleanToken = normalizeToken(token);
    const role = assignRoleForConnection(cleanToken);
    let playerToken = null;

    if (role === "p1" || role === "p2") {
      const wasReconnect = battle.players[role].playerToken && battle.players[role].playerToken === cleanToken;
      playerToken = bindSocketToRole(socket, role, cleanToken);
      if (!wasReconnect && battle.phase !== PHASE.GAME_OVER) resetPlayerBattleChoices(role);
      if (wasReconnect) {
        opLog(`[RECONNECT] ${currentRoom.name} ${battle.players[role].label} 재접속`);
        log(`${battle.players[role].label} 재접속!`);
      } else {
        opLog(`[CONNECT] ${currentRoom.name} ${battle.players[role].label} 접속`);
        log(`${battle.players[role].label} 접속!`);
      }
    } else {
      socket.join(`spectators:${roomId}`);
      opLog(`[SPECTATOR] ${currentRoom.name} 관전자 입장`);
    }

    socket.data.roomId = roomId;
    socket.data.role = role;
    updateOnlineUser(socket);
    emitOnlineState();
    socket.emit("joinedRoom", { role, playerToken, roomId, roomName: currentRoom.name, roomIcon: currentRoom.icon });

    if (dataReady && battle.players.p1.socketId && battle.players.p2.socketId && battle.phase === PHASE.WAITING) {
      if (battle.pausedFromBattle && battle.players.p1.team.length && battle.players.p2.team.length) {
        battle.pausedFromBattle = false;
        log("두 플레이어가 다시 모였습니다. 기존 팀으로 배틀을 재개합니다.");
        startActionSelect();
      } else {
        startTeamSelect();
      }
    } else {
      emitState();
    }
  });
}

io.on("connection", (socket) => {
  socket.join("lobby");
  socket.data.roomId = null;
  socket.data.role = null;
  socket.data.connectedAt = Date.now();
  socket.data.userId = null;
  const authUserId = cleanUserId(socket.handshake?.auth?.userId);
  if (authUserId && !isUserIdActive(authUserId, socket.id)) {
    reserveUserId(socket, authUserId);
  }
  updateOnlineUser(socket);
  socket.emit("lobbyState", publicLobbyState());
  emitOnlineState();

  socket.on("requestLobby", () => {
    updateOnlineUser(socket);
    socket.emit("lobbyState", publicLobbyState());
  });

  socket.on("loginUser", ({ userId } = {}) => {
    const clean = cleanUserId(userId);
    if (!clean || clean.length < 2) {
      socket.emit("loginError", { message: "아이디는 2~12자로 입력해주세요." });
      return;
    }

    const reserved = reserveUserId(socket, clean);
    if (!reserved.ok) {
      socket.emit("loginError", { message: reserved.message });
      return;
    }

    updateOnlineUser(socket);

    const roomId = socket.data.roomId;
    const role = socket.data.role;
    if (roomId && rooms.has(roomId) && (role === "p1" || role === "p2")) {
      withRoom(roomId, () => {
        battle.players[role].userId = reserved.userId;
        battle.players[role].label = reserved.userId;
        emitState();
      });
    }

    socket.emit("loginOk", { userId: reserved.userId });
    emitOnlineState();
  });

  socket.on("logoutUser", () => {
    releaseUserId(socket);
    socket.data.userId = null;

    const roomId = socket.data.roomId;
    const role = socket.data.role;
    if (roomId && rooms.has(roomId) && (role === "p1" || role === "p2")) {
      withRoom(roomId, () => {
        // 게임 중 로그아웃은 방 이탈로 처리해서 랭킹/표시 꼬임을 막는다.
        leaveCurrentRoom(socket, "logout");
      });
    } else {
      updateOnlineUser(socket);
      emitOnlineState();
    }

    socket.emit("logoutOk");
  });

  socket.on("joinRoom", ({ roomId, playerToken } = {}) => {
    joinRoom(socket, roomId, playerToken);
  });

  socket.on("leaveRoom", () => {
    leaveCurrentRoom(socket, "leave");
    socket.join("lobby");
    socket.emit("lobbyState", publicLobbyState());
  });

  socket.on("claimPlayerSlot", () => {
    claimPlayerSlot(socket);
  });


  socket.on("selectTeam", ({ ids }) => {
    const roomId = socket.data.roomId;
    const role = socket.data.role;
    if (!roomId) return;
    withRoom(roomId, () => {
      if (role !== "p1" && role !== "p2") return;
      if (battle.phase !== PHASE.TEAM_SELECT) return;
      if (!Array.isArray(ids) || ids.length !== 2) return;

      const unique = [...new Set(ids.map(Number))];
      if (unique.length !== 2) return;

      const player = battle.players[role];
      const templates = unique.map((id) => player.candidatePool.find((p) => p.id === id));
      if (templates.some((p) => !p)) return;

      player.selectedTeamIds = unique;
      player.team = templates.map(createBattlePokemon);
      player.activeIndex = 0;
      player.teamReady = true;

      log(`${player.label} 팀 선택 완료!`);
      opLog(`[SELECT][${currentRoom.name}] ${player.label} 후보 선택: ${player.team.map((p) => p.name).join(", ")}`);
      emitState();
      maybeStartBattle();
    });
  });

  socket.on("selectAction", (action) => {
    const roomId = socket.data.roomId;
    const role = socket.data.role;
    if (!roomId) return;
    withRoom(roomId, () => {
      if (role !== "p1" && role !== "p2") return;
      if (battle.phase !== PHASE.ACTION_SELECT && battle.phase !== PHASE.FORCE_SWITCH) return;
      if (!validateAction(role, action)) return;

      battle.players[role].selectedAction = action;
      emitState();

      if (battle.phase === PHASE.ACTION_SELECT) {
        if (battle.players.p1.selectedAction && battle.players.p2.selectedAction) resolveTurn();
      }

      if (battle.phase === PHASE.FORCE_SWITCH) {
        const done = battle.forceSwitchPlayers.every((pk) => battle.players[pk].selectedAction);
        if (done) resolveForceSwitch();
      }
    });
  });

  socket.on("lobbyChatMessage", ({ text }) => {
    addLobbyChat(socket, text);
  });

  socket.on("chatMessage", ({ text }) => {
    const roomId = socket.data.roomId;
    const role = socket.data.role;
    if (!roomId) return;
    withRoom(roomId, () => {
      const clean = String(text || "").trim().slice(0, 120);
      if (!clean) return;
      if (!cleanUserId(socket.data.userId)) {
        socket.emit("loginError", { message: "로그인 후 채팅할 수 있습니다." });
        return;
      }
      const name = role === "p1" || role === "p2" ? (battle.players[role].userId || battle.players[role].label) : displayName(socket);

      battle.chatMessages.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        name,
        text: clean,
        at: Date.now(),
      });

      if (battle.chatMessages.length > 80) battle.chatMessages = battle.chatMessages.slice(-80);
      emitState();
    });
  });

  socket.on("surrender", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    withRoom(roomId, () => handleSurrender(socket.data.role));
  });

  socket.on("rematch", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    withRoom(roomId, () => handleRematch(socket.data.role));
  });

  socket.on("disconnect", () => {
    releaseUserId(socket);
    onlineUsers.delete(socket.id);
    emitOnlineState();
    const roomId = socket.data.roomId;
    const role = socket.data.role;
    if (!roomId || !rooms.has(roomId)) return;
    withRoom(roomId, () => {
      if (role === "p1" || role === "p2") {
        if (battle.players[role].socketId === socket.id) battle.players[role].socketId = null;
        opLog(`[DISCONNECT] ${currentRoom.name} ${battle.players[role].label} 연결 끊김 - 재접속 대기`);
        log(`${battle.players[role].label} 연결 끊김. 재접속 또는 관전자 참가를 기다립니다.`);
        resetPlayerBattleChoices(role, { keepTeam: [PHASE.ACTION_SELECT, PHASE.TURN_RESOLVE, PHASE.FORCE_SWITCH].includes(battle.phase) });
        pauseRoomForMissingPlayer(`disconnect_${role}`);
        return;
      }
      emitState();
    });
  });
});

async function start() {
  console.log("========================================");
  console.log(" 정승의 푸끼몬 챔피언스 ONLINE v6.2.1");
  console.log("========================================");
  console.log("[BOOT] 서버 시작 중...");
  console.log("[ROOM] 4룸 모드: 태초마을 / 회색시티 / 블루시티 / 무지개시티");
  console.log("[DATA] 데이터 모드: 1~2세대 최종진화체 + 피카츄 + 전설");
  console.log("[MOVE] 기술 세팅 준비 완료");
  console.log("[TYPE] 타입 상성표 준비 완료");

  initRooms();
  for (const room of rooms.values()) withRoom(room, () => { battle.phase = PHASE.LOADING; });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] 포트 ${PORT} 대기 중`);
  });

  try {
    emitLobbyState();
    pokemonPool = await loadPokemonData();
    dataReady = true;
    console.log("[MOVE] 기술 세팅 완료");
    console.log("========================================");
    console.log("게임 실행 가능");
    console.log(`서버 주소: http://localhost:${PORT}`);
    console.log(`친구 접속: http://${localIp()}:${PORT}`);
    console.log("========================================");

    for (const room of rooms.values()) {
      withRoom(room, () => {
        battle.phase = battle.players.p1.socketId && battle.players.p2.socketId ? PHASE.WAITING : PHASE.WAITING;
        if (battle.players.p1.socketId && battle.players.p2.socketId) startTeamSelect();
        else emitState();
      });
    }
    emitLobbyState();
  } catch (err) {
    console.error("[BOOT][ERROR] 서버 준비 실패:", err);
    dataReady = true;
    for (const room of rooms.values()) withRoom(room, () => { battle.phase = PHASE.WAITING; emitState(); });
    emitLobbyState();
  }
}

start();
