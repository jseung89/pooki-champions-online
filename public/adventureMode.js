// v6.18 Adventure Mode Real Clone Rebuild Patch
// 기존 일반 선택창/배틀창 DOM과 CSS를 최대한 재사용하는 모험모드 전용 어댑터.
(function(){
  "use strict";

  const ADVENTURE_KEY = "pookiAdventureStateV618RealClone";
  const ADVENTURE_EFFECT_SHEET = "/assets/effects/capture-and-levelup-effects-sheet.png";
  const ADVENTURE_DATA_VERSION = "61826";
  const adventureLevelGateCache = new Map();
  window.__POOKI_ADVENTURE_DATA_CACHE__ = window.__POOKI_ADVENTURE_DATA_CACHE__ || { loaded:false, loadingPromise:null, loadedAt:null, lastTimings:null };
  function adventureStaticUrl(path, version=ADVENTURE_DATA_VERSION){
    return `${path}?v=${version}`;
  }
  function nowMs(){ return Math.round(performance.now()); }
  function scheduleAdventureDeferredTask(task, timeout=3000){
    try{
      if(typeof window.requestIdleCallback === "function") return window.requestIdleCallback(task, { timeout });
    }catch(_){ /* ignore */ }
    return window.setTimeout(task, Math.min(timeout, 1200));
  }
  function preloadImageQuietly(url){
    if(!url) return Promise.resolve(false);
    return new Promise(resolve=>{
      try{
        const img=new Image();
        img.onload=()=>resolve(true);
        img.onerror=()=>resolve(false);
        img.src=url;
      }catch(_){ resolve(false); }
    });
  }
  function scheduleAdventureNearbyBackgroundPreload(stage=1){
    scheduleAdventureDeferredTask(()=>{
      try{
        const current=adventureBattleBackgroundForStage(stage);
        const next=adventureBattleBackgroundForStage(Number(stage||1)+10);
        [...new Set([current,next].filter(Boolean))].forEach(url=>{ preloadImageQuietly(url); });
      }catch(_){ /* non-critical */ }
    }, 2500);
  }
  function isAdventureDebugEnabled(scope){
    try{
      if(window.ADVENTURE_DEBUG === true) return true;
      if(scope === "moves" && window.ADVENTURE_DEBUG_MOVES === true) return true;
      if(scope === "starter" && window.ADVENTURE_DEBUG_STARTER === true) return true;
      if(scope === "startup" && window.ADVENTURE_DEBUG_STARTUP === true) return true;
    }catch(_){ /* ignore */ }
    return false;
  }
  function adventureDebugLog(scope, ...args){
    if(!isAdventureDebugEnabled(scope)) return;
    console.log(...args);
  }
  function adventureDebugWarn(scope, ...args){
    if(!isAdventureDebugEnabled(scope)) return;
    console.warn(...args);
  }
  function cloneAdventureMoveCandidate(move){
    return move ? {...move, pp:move.pp, maxPp:move.maxPp} : move;
  }
  const DEFAULT_ADVENTURE_EFFECT_SETTINGS = {
    capture:{
      ballDisplaySize:140,
      ballScale:0.75,
      throwDurationMs:1400,
      arcHeight:80,
      impactDelayMs:150,
      shakeFrameMs:90,
      successFrameMs:85,
      breakoutFrameMs:90,
      enableThrowArc:true,
      enableBallSpin:true,
      spinDegree:320
    },
    levelUp:{
      displaySize:128,
      frameMs:85,
      pulseScale:1.08,
      glowDurationMs:900
    }
  };
  const BASIC_LIKE_IDS = new Set([
    25,83,95,106,107,108,113,114,115,122,123,127,128,131,137,142,143,
    185,198,200,203,206,207,211,213,214,215,225,226,227,234,241
  ]);
  const ADVENTURE_BASIC_IDS = new Set([
    1,4,7,10,13,16,19,21,23,27,29,32,37,41,43,46,48,50,52,54,56,58,60,63,66,69,72,74,77,79,81,84,86,88,90,92,96,98,100,102,104,109,111,116,118,120,129,133,138,140,147,
    152,155,158,161,163,165,167,170,172,173,174,175,177,179,187,190,191,193,194,198,200,204,207,209,216,218,220,223,228,231,236,238,239,240,246
  ]);
  const LEGENDARY_MYTHICAL_IDS = new Set([144,145,146,150,151,243,244,245,249,250,251]);
  const KOREAN_NAME_BY_ID = {
    1:"이상해씨",4:"파이리",7:"꼬부기",10:"캐터피",13:"뿔충이",16:"구구",19:"꼬렛",21:"깨비참",23:"아보",27:"모래두지",29:"니드런♀",32:"니드런♂",
    37:"식스테일",41:"주뱃",43:"뚜벅쵸",46:"파라스",48:"콘팡",50:"디그다",52:"나옹",54:"고라파덕",56:"망키",58:"가디",60:"발챙이",
    63:"캐이시",66:"알통몬",69:"모다피",72:"왕눈해",74:"꼬마돌",77:"포니타",79:"야돈",81:"코일",84:"두두",86:"쥬쥬",88:"질퍽이",90:"셀러",
    92:"고오스",96:"슬리프",98:"크랩",100:"찌리리공",102:"아라리",104:"탕구리",109:"또가스",111:"뿔카노",116:"쏘드라",118:"콘치",120:"별가사리",
    129:"잉어킹",133:"이브이",138:"암나이트",140:"투구",147:"미뇽",152:"치코리타",155:"브케인",158:"리아코",161:"꼬리선",163:"부우부",
    165:"레디바",167:"페이검",170:"초라기",172:"피츄",173:"삐",174:"푸푸린",175:"토게피",177:"네이티",179:"메리프",187:"통통코",
    190:"에이팜",191:"해너츠",193:"왕자리",194:"우파",198:"니로우",200:"무우마",204:"피콘",207:"글라이거",209:"블루",216:"깜지곰",
    218:"마그마그",220:"꾸꾸리",223:"총어",228:"델빌",231:"코코리",236:"배루키",238:"뽀뽀라",239:"에레키드",240:"마그비",246:"애버라스"
  };
  const KOREAN_NAME_BY_API = {
    bulbasaur:"이상해씨",charmander:"파이리",squirtle:"꼬부기",caterpie:"캐터피",weedle:"뿔충이",pidgey:"구구",rattata:"꼬렛",spearow:"깨비참",ekans:"아보",sandshrew:"모래두지",
    nidoran_f:"니드런♀",nidoran_m:"니드런♂",vulpix:"식스테일",zubat:"주뱃",oddish:"뚜벅쵸",paras:"파라스",venonat:"콘팡",diglett:"디그다",meowth:"나옹",psyduck:"고라파덕",mankey:"망키",growlithe:"가디",poliwag:"발챙이",abra:"캐이시",machop:"알통몬",bellsprout:"모다피",tentacool:"왕눈해",geodude:"꼬마돌",ponyta:"포니타",slowpoke:"야돈",magnemite:"코일",doduo:"두두",seel:"쥬쥬",grimer:"질퍽이",shellder:"셀러",gastly:"고오스",drowzee:"슬리프",krabby:"크랩",voltorb:"찌리리공",exeggcute:"아라리",cubone:"탕구리",koffing:"또가스",rhyhorn:"뿔카노",horsea:"쏘드라",goldeen:"콘치",staryu:"별가사리",magikarp:"잉어킹",eevee:"이브이",omanyte:"암나이트",kabuto:"투구",dratini:"미뇽",chikorita:"치코리타",cyndaquil:"브케인",totodile:"리아코",sentret:"꼬리선",hoothoot:"부우부",ledyba:"레디바",spinarak:"페이검",chinchou:"초라기",pichu:"피츄",cleffa:"삐",igglybuff:"푸푸린",togepi:"토게피",natu:"네이티",mareep:"메리프",hoppip:"통통코",aipom:"에이팜",sunkern:"해너츠",yanma:"왕자리",wooper:"우파",murkrow:"니로우",misdreavus:"무우마",pineco:"피콘",gligar:"글라이거",snubbull:"블루",teddiursa:"깜지곰",slugma:"마그마그",swinub:"꾸꾸리",remoraid:"총어",houndour:"델빌",phanpy:"코코리",tyrogue:"배루키",smoochum:"뽀뽀라",elekid:"에레키드",magby:"마그비",larvitar:"애버라스"
  };
  const STARTER_RECENT_KEY = "pookiAdventureRecentStarterIdsV6188d";
  const STARTER_BLOCKED_IDS = new Set([
    83,95,106,107,108,113,115,122,124,125,126,127,128,131,132,137,142,143,
    185,200,203,206,213,214,225,226,227,234,235,241
  ]);
  const STARTER_THREE_STAGE_IDS = [
    1,4,7,10,13,16,29,32,43,63,66,69,74,92,147,
    152,155,158,179,187,246
  ];
  const STARTER_TWO_STAGE_IDS = [
    19,21,23,27,37,41,46,48,50,52,54,56,58,60,72,77,79,81,84,86,88,90,96,
    98,100,102,104,109,111,116,118,120,129,133,138,140,161,163,165,167,170,
    177,190,191,194,198,204,209,216,218,220,223,228,231
  ];
  const STARTER_SAFE_FALLBACK_IDS = [46,48,72,77,84,86,88,102,109,111,116,118,120,129,133,138,140,172,173,174,175,177,193,204,209,216,218,220,223,228,231,236,238,239,240];
  const ADVENTURE_EARLY_BABY_IDS = [172,173,174,175,236,238,239,240];
  const ADVENTURE_EARLY_BUG_BASIC_IDS = [10,13,46,48,165,167,193,204];
  const ADVENTURE_EARLY_STAGE_1_TO_10_POOL = [...ADVENTURE_EARLY_BABY_IDS, ...ADVENTURE_EARLY_BUG_BASIC_IDS];
  const ADVENTURE_EARLY_EXCLUDED_IDS = new Set([
    213,123,127,214,15,12,49,47,166,168,205,212
  ]);
  const EVOLUTION_FALLBACK_SPECIES = {
    11:{id:11, apiName:"metapod", name:"단데기", types:["bug"], stats:{hp:50,attack:20,defense:55,speed:30}},
    12:{id:12, apiName:"butterfree", name:"버터플", types:["bug","flying"], stats:{hp:60,attack:45,defense:50,speed:70}},
    14:{id:14, apiName:"kakuna", name:"딱충이", types:["bug","poison"], stats:{hp:45,attack:25,defense:50,speed:35}},
    15:{id:15, apiName:"beedrill", name:"독침붕", types:["bug","poison"], stats:{hp:65,attack:90,defense:40,speed:75}},
    2:{id:2, apiName:"ivysaur", name:"이상해풀", types:["grass","poison"], stats:{hp:60,attack:62,defense:63,speed:60}},
    5:{id:5, apiName:"charmeleon", name:"리자드", types:["fire"], stats:{hp:58,attack:64,defense:58,speed:80}},
    8:{id:8, apiName:"wartortle", name:"어니부기", types:["water"], stats:{hp:59,attack:63,defense:80,speed:58}},
    17:{id:17, apiName:"pidgeotto", name:"피죤", types:["normal","flying"], stats:{hp:63,attack:60,defense:55,speed:71}},
    30:{id:30, apiName:"nidorina", name:"니드리나", types:["poison"], stats:{hp:70,attack:62,defense:67,speed:56}},
    33:{id:33, apiName:"nidorino", name:"니드리노", types:["poison"], stats:{hp:61,attack:72,defense:57,speed:65}},
    44:{id:44, apiName:"gloom", name:"냄새꼬", types:["grass","poison"], stats:{hp:60,attack:65,defense:70,speed:40}},
    64:{id:64, apiName:"kadabra", name:"윤겔라", types:["psychic"], stats:{hp:40,attack:35,defense:30,speed:105}},
    67:{id:67, apiName:"machoke", name:"근육몬", types:["fighting"], stats:{hp:80,attack:100,defense:70,speed:45}},
    70:{id:70, apiName:"weepinbell", name:"우츠동", types:["grass","poison"], stats:{hp:65,attack:90,defense:50,speed:55}},
    75:{id:75, apiName:"graveler", name:"데구리", types:["rock","ground"], stats:{hp:55,attack:95,defense:115,speed:35}},
    93:{id:93, apiName:"haunter", name:"고우스트", types:["ghost","poison"], stats:{hp:45,attack:50,defense:45,speed:95}},
    148:{id:148, apiName:"dragonair", name:"신뇽", types:["dragon"], stats:{hp:61,attack:84,defense:65,speed:70}},
    153:{id:153, apiName:"bayleef", name:"베이리프", types:["grass"], stats:{hp:60,attack:62,defense:80,speed:60}},
    156:{id:156, apiName:"quilava", name:"마그케인", types:["fire"], stats:{hp:58,attack:64,defense:58,speed:80}},
    159:{id:159, apiName:"croconaw", name:"엘리게이", types:["water"], stats:{hp:65,attack:80,defense:80,speed:58}},
    180:{id:180, apiName:"flaaffy", name:"보송송", types:["electric"], stats:{hp:70,attack:55,defense:55,speed:45}},
    188:{id:188, apiName:"skiploom", name:"두코", types:["grass","flying"], stats:{hp:55,attack:45,defense:50,speed:80}},
    247:{id:247, apiName:"pupitar", name:"데기라스", types:["rock","ground"], stats:{hp:70,attack:84,defense:70,speed:51}}
  };
  const ADVENTURE_BATTLE_BACKGROUNDS = [
    { maxStage:10, url:"/assets/adventure/backgrounds/adventure-battle-bg-floor-001-010.png" },
    { maxStage:20, url:"/assets/adventure/backgrounds/adventure-battle-bg-floor-011-020.png" },
    { maxStage:30, url:"/assets/adventure/backgrounds/adventure-battle-bg-floor-021-030.png" },
    { maxStage:40, url:"/assets/adventure/backgrounds/adventure-battle-bg-floor-031-040.png" },
    { maxStage:50, url:"/assets/adventure/backgrounds/adventure-battle-bg-floor-041-050.png" },
    { maxStage:60, url:"/assets/adventure/backgrounds/adventure-battle-bg-floor-051-060.png" },
    { maxStage:70, url:"/assets/adventure/backgrounds/adventure-battle-bg-floor-061-070.png" },
    { maxStage:80, url:"/assets/adventure/backgrounds/adventure-battle-bg-floor-071-080.png" },
    { maxStage:90, url:"/assets/adventure/backgrounds/adventure-battle-bg-floor-081-090.png" },
    { maxStage:999, url:"/assets/adventure/backgrounds/adventure-battle-bg-floor-091-100.png" }
  ];
  const TYPE_BY_ID = {
    1:["grass","poison"],4:["fire"],7:["water"],10:["bug"],13:["bug","poison"],16:["normal","flying"],19:["normal"],21:["normal","flying"],23:["poison"],27:["ground"],29:["poison"],32:["poison"],37:["fire"],41:["poison","flying"],43:["grass","poison"],46:["bug","grass"],48:["bug","poison"],50:["ground"],52:["normal"],54:["water"],56:["fighting"],58:["fire"],60:["water"],63:["psychic"],66:["fighting"],69:["grass","poison"],72:["water","poison"],74:["rock","ground"],77:["fire"],79:["water","psychic"],81:["electric","steel"],84:["normal","flying"],86:["water"],88:["poison"],90:["water"],92:["ghost","poison"],96:["psychic"],98:["water"],100:["electric"],102:["grass","psychic"],104:["ground"],109:["poison"],111:["ground","rock"],116:["water"],118:["water"],120:["water"],129:["water"],133:["normal"],138:["rock","water"],140:["rock","water"],147:["dragon"],152:["grass"],155:["fire"],158:["water"],161:["normal"],163:["normal","flying"],165:["bug","flying"],167:["bug","poison"],170:["water","electric"],172:["electric"],173:["fairy"],174:["normal","fairy"],175:["fairy"],177:["psychic","flying"],179:["electric"],187:["grass","flying"],190:["normal"],191:["grass"],193:["bug","flying"],194:["water","ground"],198:["dark","flying"],204:["bug"],207:["ground","flying"],209:["fairy"],216:["normal"],218:["fire"],220:["ice","ground"],223:["water"],228:["dark","fire"],231:["ground"],236:["fighting"],238:["ice","psychic"],239:["electric"],240:["fire"],246:["rock","ground"]
  };
  const STARTER_DEFAULT_STATS_BY_ID = {
    1:{hp:45,attack:49,defense:49,speed:45},4:{hp:39,attack:52,defense:43,speed:65},7:{hp:44,attack:48,defense:65,speed:43},10:{hp:45,attack:30,defense:35,speed:45},13:{hp:40,attack:35,defense:30,speed:50},16:{hp:40,attack:45,defense:40,speed:56},19:{hp:30,attack:56,defense:35,speed:72},21:{hp:40,attack:60,defense:30,speed:70},23:{hp:35,attack:60,defense:44,speed:55},27:{hp:50,attack:75,defense:85,speed:40},29:{hp:55,attack:47,defense:52,speed:41},32:{hp:46,attack:57,defense:40,speed:50},37:{hp:38,attack:41,defense:40,speed:65},41:{hp:40,attack:45,defense:35,speed:55},43:{hp:45,attack:50,defense:55,speed:30},46:{hp:35,attack:70,defense:55,speed:25},48:{hp:60,attack:55,defense:50,speed:45},50:{hp:10,attack:55,defense:25,speed:95},52:{hp:40,attack:45,defense:35,speed:90},54:{hp:50,attack:52,defense:48,speed:55},56:{hp:40,attack:80,defense:35,speed:70},58:{hp:55,attack:70,defense:45,speed:60},60:{hp:40,attack:50,defense:40,speed:90},63:{hp:25,attack:20,defense:15,speed:90},66:{hp:70,attack:80,defense:50,speed:35},69:{hp:50,attack:75,defense:35,speed:40},72:{hp:40,attack:40,defense:35,speed:70},74:{hp:40,attack:80,defense:100,speed:20},77:{hp:50,attack:85,defense:55,speed:90},79:{hp:90,attack:65,defense:65,speed:15},81:{hp:25,attack:35,defense:70,speed:45},84:{hp:35,attack:85,defense:45,speed:75},86:{hp:65,attack:45,defense:55,speed:45},88:{hp:80,attack:80,defense:50,speed:25},90:{hp:30,attack:65,defense:100,speed:40},92:{hp:30,attack:35,defense:30,speed:80},96:{hp:60,attack:48,defense:45,speed:42},98:{hp:30,attack:105,defense:90,speed:50},100:{hp:40,attack:30,defense:50,speed:100},102:{hp:60,attack:40,defense:80,speed:40},104:{hp:50,attack:50,defense:95,speed:35},109:{hp:40,attack:65,defense:95,speed:35},111:{hp:80,attack:85,defense:95,speed:25},116:{hp:30,attack:40,defense:70,speed:60},118:{hp:45,attack:67,defense:60,speed:63},120:{hp:30,attack:45,defense:55,speed:85},129:{hp:20,attack:10,defense:55,speed:80},133:{hp:55,attack:55,defense:50,speed:55},138:{hp:35,attack:40,defense:100,speed:35},140:{hp:30,attack:80,defense:90,speed:55},147:{hp:41,attack:64,defense:45,speed:50},152:{hp:45,attack:49,defense:65,speed:45},155:{hp:39,attack:52,defense:43,speed:65},158:{hp:50,attack:65,defense:64,speed:43},161:{hp:35,attack:46,defense:34,speed:20},163:{hp:60,attack:30,defense:30,speed:50},165:{hp:40,attack:20,defense:30,speed:55},167:{hp:40,attack:60,defense:40,speed:30},170:{hp:75,attack:38,defense:38,speed:67},172:{hp:20,attack:40,defense:15,speed:60},173:{hp:50,attack:25,defense:28,speed:15},174:{hp:90,attack:30,defense:15,speed:15},175:{hp:35,attack:20,defense:65,speed:20},177:{hp:40,attack:50,defense:45,speed:70},179:{hp:55,attack:40,defense:40,speed:35},187:{hp:35,attack:35,defense:40,speed:50},190:{hp:55,attack:70,defense:55,speed:85},191:{hp:30,attack:30,defense:30,speed:30},193:{hp:65,attack:65,defense:45,speed:95},194:{hp:55,attack:45,defense:45,speed:15},198:{hp:60,attack:85,defense:42,speed:91},204:{hp:50,attack:65,defense:90,speed:15},207:{hp:65,attack:75,defense:105,speed:85},209:{hp:60,attack:80,defense:50,speed:30},216:{hp:60,attack:80,defense:50,speed:40},218:{hp:40,attack:40,defense:40,speed:20},220:{hp:50,attack:50,defense:40,speed:50},223:{hp:35,attack:65,defense:35,speed:65},228:{hp:45,attack:60,defense:30,speed:65},231:{hp:90,attack:60,defense:60,speed:40},236:{hp:35,attack:35,defense:35,speed:35},238:{hp:45,attack:30,defense:15,speed:65},239:{hp:45,attack:63,defense:37,speed:95},240:{hp:45,attack:75,defense:37,speed:83},246:{hp:50,attack:64,defense:50,speed:41}
  };

  const WEAK_MOVE_DEFS = {
    tackle: { id:"tackle", apiName:"tackle", name:"몸통박치기", type:"normal", power:40, accuracy:100, pp:35, maxPp:35, priority:0 },
    scratch: { id:"scratch", apiName:"scratch", name:"할퀴기", type:"normal", power:40, accuracy:100, pp:35, maxPp:35, priority:0 },
    ember: { id:"ember", apiName:"ember", name:"불꽃세례", type:"fire", power:40, accuracy:100, pp:25, maxPp:25, priority:0, effect:{status:"burn", chance:10} },
    waterGun: { id:"waterGun", apiName:"water-gun", name:"물대포", type:"water", power:40, accuracy:100, pp:25, maxPp:25, priority:0 },
    vineWhip: { id:"vineWhip", apiName:"vine-whip", name:"덩굴채찍", type:"grass", power:45, accuracy:100, pp:25, maxPp:25, priority:0 },
    thunderShock: { id:"thunderShock", apiName:"thunder-shock", name:"전기쇼크", type:"electric", power:40, accuracy:100, pp:30, maxPp:30, priority:0, effect:{status:"paralyze", chance:10} },
    rockThrow: { id:"rockThrow", apiName:"rock-throw", name:"돌떨구기", type:"rock", power:50, accuracy:90, pp:15, maxPp:15, priority:0 },
    growl: { id:"growl", apiName:"growl", name:"울음소리", type:"normal", power:0, accuracy:100, pp:40, maxPp:40, priority:0, statChange:{target:"opponent", stat:"attack", amount:-1} }
  };

  const adventure = {
    active:false,
    dataReady:false,
    pokemon:[],
    moves:[],
    moveMap:{},
    config:null,
    items:null,
    rewards:null,
    rewardEffects:null,
    rewardBalance:null,
    expBalance:null,
    captureBalance:null,
    pokemonMovesets:null,
    levelupLearnsets:null,
    tmRewards:null,
    sizeOverrides:null,
    capture:null,
    captureRates:null,
    learnsets:null,
    adventureMoves:null,
    expTable:null,
    baseStats:null,
    evolutions:null,
    equipmentConfig:null,
    effectMap:null,
    blockedMoves:null,
    moveTiers:null,
    encounterRules:null,
    enemyMovesetRules:null,
    pokemonAllowedMoves:null,
    fullLearnsets:null,
    specialEvolutions:null,
    bosses:null,
    masterPokemon:null,
    adventureEquipment:{},
    basicConfig:null,
    starterPool:null,
    starterCandidates:[],
    recentWildIds:[],
    phase:"idle",
    selectedStarterId:null,
    stage:1,
    maxStage:100,
    bossEvery:10,
    bag:{},
    team:[],
    enemy:null,
    activeIndex:0,
    pendingReward:false,
    rewardApplying:false,
    pendingCaptured:null,
    pendingTmReward:null,
    pendingTmTargetIndex:null,
    pendingLevelMove:null,
    growthQueue:[],
    growthProcessing:false,
    afterGrowthCallback:null,
    switchMode:null,
    expShareLevel:0,
    log:[],
    renderToken:0,
    captureAnimationToken:0,
    captureAnimationTimers:[],
    effectSettings:clone(DEFAULT_ADVENTURE_EFFECT_SETTINGS)
  };

  const original = {};
  function installOverrides(){
    if(installOverrides.done) return;
    installOverrides.done = true;
    original.selectMove = window.selectMove || selectMove;
    original.selectSwitch = window.selectSwitch || selectSwitch;
    original.updateMoveHelp = window.updateMoveHelp || updateMoveHelp;
    original.renderButtons = window.renderButtons || renderButtons;
    original.renderLogs = window.renderLogs || renderLogs;
    original.renderPokemonInfo = window.renderPokemonInfo || renderPokemonInfo;
    original.renderBattleSummary = window.renderBattleSummary || renderBattleSummary;
    original.benchCardMarkup = window.benchCardMarkup || benchCardMarkup;
    original.leaveRoom = window.leaveRoom || leaveRoom;
    window.selectMove = function(moveIndex){ return adventure.active ? adventureSelectMove(moveIndex) : original.selectMove(moveIndex); };
    window.selectSwitch = function(targetIndex){ return adventure.active ? adventureSwitch(targetIndex) : original.selectSwitch(targetIndex); };
    window.updateMoveHelp = function(idx){ return adventure.active ? adventureUpdateMoveHelp(idx) : original.updateMoveHelp(idx); };
    window.renderButtons = function(){ return adventure.active ? renderAdventureButtons() : original.renderButtons(); };
    window.renderLogs = function(){ return adventure.active ? renderAdventureLogs() : original.renderLogs(); };
    window.renderPokemonInfo = function(id,p,label,playerKey){ return adventure.active ? renderAdventurePokemonInfo(id,p,label,playerKey) : original.renderPokemonInfo(id,p,label,playerKey); };
    window.renderBattleSummary = function(){ return adventure.active ? renderAdventureSummary() : original.renderBattleSummary(); };
    window.benchCardMarkup = function(p,idx,label){ return adventure.active ? adventureBenchCardMarkup(p,idx,label) : original.benchCardMarkup(p,idx,label); };
    window.leaveRoom = function(){ return adventure.active ? adventureReturnLobby() : original.leaveRoom(); };
  }

  function injectAdventureStyle(){
    if(document.getElementById("adventureRealCloneStyle")) return;
    const style = document.createElement("style");
    style.id = "adventureRealCloneStyle";
    style.textContent = `
      body.adventure-mode .adventure-single-row{grid-template-columns:minmax(220px,360px)!important;justify-content:center!important;}
      body.adventure-mode .adventure-single-row .selected-slot{min-height:230px!important;}
      body.adventure-mode .adventure-bag-panel .chat-title{margin-bottom:10px;}
      body.adventure-mode .adventure-bag-list{display:grid;gap:8px;max-height:220px;overflow:auto;}
      body.adventure-mode .adventure-bag-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:8px 10px;border:1px solid rgba(147,197,253,.22);border-radius:12px;background:rgba(15,23,42,.35);font-weight:850;color:#eaf2ff;}
      body.adventure-mode .adventure-bag-row button{padding:7px 10px;border-radius:10px;font-size:12px;box-shadow:0 3px 0 #1e3a8a;}
      body.adventure-mode .buttons.adventure-reward-mode{grid-template-columns:repeat(2,minmax(0,1fr))!important;align-content:stretch!important;max-height:none!important;overflow:visible!important;min-height:260px!important;}
      body.adventure-mode .adventure-reward-grid{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:0;min-height:210px;align-content:stretch;}
      body.adventure-mode .adventure-reward-card{width:100%;min-height:96px;text-align:left;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:16px 18px!important;border-radius:18px!important;}
      body.adventure-mode .adventure-reward-card .reward-title{font-size:17px;font-weight:950;margin-bottom:8px;}
      body.adventure-mode .adventure-reward-card .meta{line-height:1.45;font-size:12px;}
      body.adventure-mode .adventure-choice-grid{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
      body.adventure-mode .adventure-choice-grid .move-btn{min-height:86px;}
      body.adventure-mode .adventure-choice-grid .move-btn[disabled]{opacity:.45;filter:grayscale(.5);cursor:not-allowed;}
      body.adventure-mode .adventure-learn-panel{grid-column:1/-1;display:grid;gap:12px;align-content:start;}
      body.adventure-mode .adventure-learn-title{font-size:16px;font-weight:950;color:#fef3c7;text-shadow:0 1px 0 rgba(0,0,0,.25);}
      body.adventure-mode .adventure-learn-move{border:1px solid rgba(250,204,21,.35);border-radius:16px;background:rgba(30,41,59,.52);padding:12px 14px;color:#eaf2ff;font-weight:850;}
      body.adventure-mode .adventure-evolution-overlay{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:radial-gradient(circle at center,rgba(59,130,246,.18),rgba(2,6,23,.86));pointer-events:none;animation:adventureEvolutionDim 3.2s ease both;}
      body.adventure-mode .adventure-evolution-card{display:grid;place-items:center;gap:18px;color:#fff;font-weight:1000;text-align:center;text-shadow:0 3px 14px rgba(0,0,0,.55);}
      body.adventure-mode .adventure-evolution-sprite{max-width:260px;max-height:260px;image-rendering:auto;filter:brightness(2.4) contrast(0) drop-shadow(0 0 36px rgba(191,219,254,.95));animation:adventureEvolutionPulse 2.35s ease-in-out infinite;}
      body.adventure-mode .adventure-evolution-flash{position:absolute;inset:0;background:radial-gradient(circle,rgba(255,255,255,.95),rgba(147,197,253,.32),rgba(2,6,23,0));animation:adventureEvolutionFlash 3.2s ease both;}
      @keyframes adventureEvolutionDim{0%{opacity:0;}12%{opacity:1;}88%{opacity:1;}100%{opacity:0;}}
      @keyframes adventureEvolutionPulse{0%,100%{transform:scale(1);filter:brightness(2.1) contrast(0) drop-shadow(0 0 24px rgba(191,219,254,.8));}45%{transform:scale(1.23);filter:brightness(3.2) contrast(0) drop-shadow(0 0 54px rgba(255,255,255,1));}70%{transform:scale(1.08);filter:brightness(2.6) contrast(0) drop-shadow(0 0 44px rgba(96,165,250,.95));}}
      @keyframes adventureEvolutionFlash{0%,58%{opacity:0;}70%{opacity:1;}82%{opacity:.25;}100%{opacity:0;}}
      .sprite.adventure-capture-out{animation:adventureCaptureOut 720ms ease-in forwards!important;transform-origin:50% 70%;}
      @keyframes adventureCaptureOut{0%{transform:translate(0,0) scale(1);opacity:1;filter:brightness(1) drop-shadow(0 18px 14px rgba(15,23,42,.28));}35%{transform:translate(-8px,-8px) scale(1.04);opacity:1;filter:brightness(1.25) drop-shadow(0 0 12px rgba(96,165,250,.55));}70%{transform:translate(-18px,12px) scale(.55);opacity:.65;filter:brightness(1.45) drop-shadow(0 0 16px rgba(191,219,254,.65));}100%{transform:translate(-32px,26px) scale(.08);opacity:0;filter:brightness(1.6);}}
      .adventure-capture-fx{position:fixed;z-index:9999;pointer-events:none;width:56px;height:56px;background-image:url("/assets/effects/capture-and-levelup-effects-sheet.png");background-repeat:no-repeat;background-size:600% 500%;will-change:left,top,transform,background-position,opacity;filter:drop-shadow(0 8px 10px rgba(15,23,42,.35));}
      .adventure-capture-fx.soft-impact{filter:drop-shadow(0 4px 8px rgba(15,23,42,.26));}
      .sprite.adventure-level-up-pulse{animation:adventureLevelUpPulse 900ms ease-out 1;}
      @keyframes adventureLevelUpPulse{0%{filter:brightness(1);transform:scale(1);}35%{filter:brightness(1.45) drop-shadow(0 0 18px rgba(250,204,21,.75));transform:scale(1.08);}100%{filter:brightness(1);transform:scale(1);}}
      body.adventure-mode .adventure-fail-box{display:grid;gap:12px;}
      body.adventure-mode .adventure-fail-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
      body.adventure-mode #mySprite.mine-dead{animation: adventurePlayerFaintOut .55s ease-in forwards;}
      @keyframes adventurePlayerFaintOut{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:.25;transform:translateY(18px) scale(.92);filter:grayscale(1);}}
      body.adventure-mode .adventure-exp-row{margin-top:8px;display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;font-size:12px;color:#dbeafe;font-weight:800;}
      body.adventure-mode .adventure-expbar{height:8px;border-radius:999px;background:rgba(15,23,42,.75);border:1px solid rgba(147,197,253,.25);overflow:hidden;}
      body.adventure-mode .adventure-expfill{height:100%;background:linear-gradient(90deg,#facc15,#f59e0b);transition:width .35s ease;}
      body.adventure-mode .adventure-equipment-box{margin-top:10px;border:1px solid rgba(147,197,253,.18);border-radius:12px;background:rgba(15,23,42,.22);padding:8px;}
      body.adventure-mode .adventure-equip-title{font-size:12px;font-weight:950;color:#bfdbfe;margin-bottom:6px;}
      body.adventure-mode .adventure-equip-list{display:flex;gap:6px;flex-wrap:wrap;max-height:64px;overflow:auto;}
      body.adventure-mode .adventure-equip-chip{font-size:11px;font-weight:900;color:#eaf2ff;border:1px solid rgba(96,165,250,.35);background:rgba(37,99,235,.22);border-radius:999px;padding:4px 7px;}
      body.adventure-mode .arena-stage{background-image:linear-gradient(180deg,rgba(15,23,42,.02),rgba(15,23,42,.18)),var(--adventure-battle-bg,url("/assets/battle-field.png"))!important;background-size:cover!important;background-position:center center!important;}
      body.adventure-mode .arena-stage::before,body.adventure-mode .arena-stage::after{display:none!important;}
      body.adventure-mode .adventure-return-btn{border:1px solid rgba(148,163,184,.55);background:#334155;color:#fff;border-radius:12px;padding:8px 12px;font-weight:900;cursor:pointer;box-shadow:0 4px 0 #1e293b;}
      body.adventure-mode .adventure-stat-detail{margin-top:6px;display:grid;gap:4px;font-size:11px;color:#cbd5e1;font-weight:800;}
      .adventure-room-card{outline:2px solid rgba(250,204,21,.48)!important;}
      .adventure-room-card .room-icon{filter:drop-shadow(0 0 12px rgba(250,204,21,.35));}
      .adventure-room-card .room-actions{justify-content:center!important;}
      .adventure-room-card .room-actions .room-enter{min-width:148px;}
      body.adventure-mode .adventure-hof-box{max-width:min(920px,94vw);background:linear-gradient(180deg,#0f2144,#07172f);border:1px solid rgba(96,165,250,.45);box-shadow:0 24px 80px rgba(0,0,0,.55);}
      body.adventure-mode .adventure-hof-box h2{font-size:38px;margin:0;color:#fef3c7;text-shadow:0 0 18px rgba(250,204,21,.55);}
      body.adventure-mode .adventure-hof-box h3{font-size:24px;margin:6px 0 10px;color:#bfdbfe;}
      body.adventure-mode .hof-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:18px 0;max-height:52vh;overflow:auto;}
      body.adventure-mode .hof-card{border:1px solid rgba(147,197,253,.35);background:rgba(15,23,42,.66);border-radius:18px;padding:10px;text-align:center;animation:hofPop .55s ease both;}
      body.adventure-mode .hof-sprite-wrap{height:84px;display:flex;align-items:center;justify-content:center;}
      body.adventure-mode .hof-card img{max-width:92px;max-height:84px;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 10px 10px rgba(0,0,0,.35));}
      body.adventure-mode .hof-card b{display:block;color:#eaf3ff;} body.adventure-mode .hof-card span{font-size:12px;color:#bfdbfe;}
      body.adventure-mode .hof-types{display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-top:6px;} body.adventure-mode .hof-types em{font-style:normal;font-size:10px;border-radius:999px;padding:3px 6px;background:#1d4ed8;color:#dbeafe;} body.adventure-mode .hof-types em.fainted{background:#64748b;color:#f1f5f9;}
      @keyframes hofPop{from{opacity:0;transform:translateY(12px) scale(.92);}to{opacity:1;transform:translateY(0) scale(1);}}
      @media(max-width:720px){body.adventure-mode .adventure-reward-grid{grid-template-columns:1fr;}}
    `;
    document.head.appendChild(style);
  }

  async function fetchJsonSafely(url, options={}){
    const response = await fetch(url, options);
    const contentType = response.headers?.get?.("content-type") || "";
    if(!response.ok){
      const preview = await response.text().catch(()=>"");
      const err = new Error(`[Adventure/Fetch] ${url} failed ${response.status}`);
      err.preview = preview.slice(0,120);
      err.status = response.status;
      err.contentType = contentType;
      throw err;
    }
    if(contentType && !contentType.includes("application/json")){
      const preview = await response.text().catch(()=>"");
      const err = new Error(`[Adventure/Fetch] ${url} returned non-json`);
      err.preview = preview.slice(0,120);
      err.status = response.status;
      err.contentType = contentType;
      throw err;
    }
    return response.json();
  }

  async function loadAdventureData(){
    const cache = window.__POOKI_ADVENTURE_DATA_CACHE__ || (window.__POOKI_ADVENTURE_DATA_CACHE__ = { loaded:false, loadingPromise:null, loadedAt:null, lastTimings:null });
    if(adventure.dataReady){
      adventure.__lastDataCacheHit = true;
      adventure.__lastRequiredJsonLoadMs = 0;
      adventure.__lastDataLoadMs = 0;
      adventure.__lastOptionalAssetPreloadMs = 0;
      adventure.__lastDeferredAssetCount = 0;
      return;
    }
    if(cache.loadingPromise){
      adventure.__lastDataCacheHit = true;
      await cache.loadingPromise;
      return;
    }
    adventure.__lastDataCacheHit = false;
    cache.loadingPromise = (async()=>{
    const loadStartedAt = performance.now();
    const requiredJsonStartedAt = performance.now();
    adventureLevelGateCache.clear();
    const jsonFetch = (url, fallback, opts={}) => fetchJsonSafely(url).catch((err)=>{
      if(opts.warn) console.warn(opts.warn, err);
      adventureDebugWarn("startup", "[Adventure/Startup] optional json failed", { url, message:err?.message, status:err?.status, preview:err?.preview });
      return fallback;
    });
    const [arena, config, items, rewards, rewardEffects, rewardBalance, expBalance, captureBalance, effectSettings, pokemonMovesets, levelupLearnsets, tmRewards, sizeOverrides, capture, captureRates, learnsets, adventureMoves, expTable, baseStats, evolutions, equipmentConfig, effectMap, blockedMoves, moveTiers, basicConfig, starterPool, encounterRules, enemyMovesetRules, pokemonAllowedMoves, fullLearnsets, specialEvolutions, bosses] = await Promise.all([
      jsonFetch("/api/test-arena/data", {pokemon:[], moves:[]}),
      jsonFetch(adventureStaticUrl("/data/adventure_config.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_items.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_rewards.json"), {rewards:[]}),
      jsonFetch(adventureStaticUrl("/data/adventure_reward_effects.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_reward_balance.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_exp_balance.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_capture_balance.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_effect_settings.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_pokemon_movesets.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_levelup_learnsets.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_tm_rewards.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_pokemon_size_overrides.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_capture.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_capture_rates.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_learnsets.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_moves.json"), {moves:[]}),
      jsonFetch(adventureStaticUrl("/data/adventure_exp_table.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_base_stats.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_evolutions.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_equipment.json"), {equipment:[]}),
      jsonFetch(adventureStaticUrl("/data/adventure_move_effect_map.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_blocked_moves.json"), {blocked:[]}),
      jsonFetch(adventureStaticUrl("/data/adventure_move_tiers.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_basic_pokemon.json"), {basicIds:[]}),
      jsonFetch(adventureStaticUrl("/data/adventure_starter_pool.json"), {starters:[], __loadFailed:true}, {warn:"[Adventure Starter] starter pool json load failed"}),
      jsonFetch(adventureStaticUrl("/data/adventure_encounter_rules.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_enemy_moveset_rules.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_pokemon_allowed_moves.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_pokemon_full_learnsets.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_special_evolutions.json"), {}),
      jsonFetch(adventureStaticUrl("/data/adventure_bosses.json"), {})
    ]);
    adventure.__lastRequiredJsonLoadMs = Math.round(performance.now() - requiredJsonStartedAt);
    adventure.pokemon = Array.isArray(arena?.pokemon) ? arena.pokemon : [];
    adventure.moves = Array.isArray(arena?.moves) ? arena.moves : [];
    adventure.effectMap = effectMap || {};
    adventure.blockedMoves = blockedMoves || { blocked:[] };
    adventure.moveTiers = moveTiers || {};
    adventure.moveMap = {};
    for(const m of adventure.moves) adventure.moveMap[m.id] = normalizeMove(m);
    adventure.adventureMoves = adventureMoves || { moves:[] };
    const extraMoves = Array.isArray(adventureMoves?.moves) ? adventureMoves.moves : (Array.isArray(adventureMoves) ? adventureMoves : []);
    for(const m of extraMoves) if(m?.id) adventure.moveMap[m.id] = normalizeMove(m);
    for(const m of Object.values(WEAK_MOVE_DEFS)) adventure.moveMap[m.id] = normalizeMove(m);
    adventure.config = config || {};
    adventure.items = items || {};
    adventure.rewards = rewards || { rewards:[] };
    adventure.rewardEffects = rewardEffects || {};
    adventure.rewardBalance = rewardBalance || {};
    adventure.expBalance = normalizeAdventureExpBalance(expBalance);
    adventure.captureBalance = captureBalance || {};
    adventure.effectSettings = normalizeAdventureEffectSettings(effectSettings);
    adventure.pokemonMovesets = pokemonMovesets || {};
    adventure.levelupLearnsets = levelupLearnsets || {};
    adventure.tmRewards = tmRewards || {};
    adventure.sizeOverrides = sizeOverrides || {};
    adventure.capture = capture || {};
    adventure.captureRates = captureRates || {};
    adventure.learnsets = learnsets || {};
    adventure.expTable = expTable || {};
    adventure.baseStats = baseStats || {};
    adventure.evolutions = evolutions || {};
    adventure.equipmentConfig = equipmentConfig || { equipment:[] };
    adventure.basicConfig = basicConfig || { basicIds:[] };
    adventure.starterPool = starterPool || { starters:[] };
    adventure.encounterRules = encounterRules || {};
    adventure.enemyMovesetRules = enemyMovesetRules || {};
    adventure.pokemonAllowedMoves = pokemonAllowedMoves || {};
    adventure.fullLearnsets = fullLearnsets || {};
    adventure.specialEvolutions = specialEvolutions || {};
    adventure.bosses = bosses || {};
    const rosterLoadStartedAt = performance.now();
    try{
      const master = await fetchJsonSafely(adventureStaticUrl("/data/pokemon_master_gen1_2.json"));
      adventure.masterPokemon = Array.isArray(master) ? master : [];
      adventure.pokemon = mergeAdventureMasterPokemon(adventure.pokemon, adventure.masterPokemon);
    }catch(err){
      adventureDebugWarn("startup", '[Adventure Master Roster] load failed; using arena pokemon only', { message:err?.message, status:err?.status, contentType:err?.contentType, preview:err?.preview });
      adventure.masterPokemon = [];
    }
    adventure.__lastRosterLoadMs = Math.round(performance.now() - rosterLoadStartedAt);
    adventure.__lastDataLoadMs = Math.round(performance.now() - loadStartedAt);
    adventure.__lastOptionalAssetPreloadMs = 0;
    adventure.__lastDeferredAssetCount = 0;
    adventure.maxStage = Number(config?.maxStage || 100);
    adventure.bossEvery = Number(config?.bossEvery || 10);
    adventure.dataReady = true;
    cache.loaded = true;
    cache.loadedAt = Date.now();
    cache.lastTimings = { requiredJsonLoadMs: adventure.__lastRequiredJsonLoadMs, rosterLoadMs: adventure.__lastRosterLoadMs, totalMs: adventure.__lastDataLoadMs };
    })();
    try{
      await cache.loadingPromise;
    }finally{
      cache.loadingPromise = null;
    }
  }

  function normalizeMove(move){
    const pp = Number(move.pp ?? move.maxPp ?? defaultPp(move));
    const mapped = findAdventureMoveEffect(move);
    return {
      ...move,
      ...(mapped || {}),
      power:Number(move.power || 0),
      accuracy:Number(move.accuracy ?? 100),
      priority:Number(move.priority || 0),
      pp,
      maxPp:Number(move.maxPp ?? move.pp ?? pp)
    };
  }
  function findAdventureMoveEffect(move){
    const map = adventure.effectMap || {};
    if(!move) return null;
    const keys=[move.id, move.name, move.apiName].filter(Boolean);
    for(const key of keys){ if(map[key]) return map[key]; }
    return null;
  }
  function defaultPp(move){
    if(!move) return 20;
    if(move.power === 0) return 20;
    if((move.power||0) >= 100) return 5;
    if((move.power||0) >= 80) return 10;
    return 25;
  }
  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function clampAdventureSetting(value, min, max, fallback){
    const n=Number(value);
    if(!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }
  function normalizeAdventureEffectSettings(input){
    const src=input && typeof input === "object" ? input : {};
    const merged=clone(DEFAULT_ADVENTURE_EFFECT_SETTINGS);
    merged.capture={...merged.capture, ...(src.capture||{})};
    merged.levelUp={...merged.levelUp, ...(src.levelUp||{})};
    merged.capture.ballDisplaySize=clampAdventureSetting(merged.capture.ballDisplaySize,32,192,140);
    merged.capture.ballScale=clampAdventureSetting(merged.capture.ballScale,0.25,1.0,0.75);
    merged.capture.throwDurationMs=clampAdventureSetting(merged.capture.throwDurationMs,600,2500,1400);
    merged.capture.arcHeight=clampAdventureSetting(merged.capture.arcHeight,20,180,80);
    merged.capture.impactDelayMs=clampAdventureSetting(merged.capture.impactDelayMs,0,600,150);
    merged.capture.shakeFrameMs=clampAdventureSetting(merged.capture.shakeFrameMs,40,160,90);
    merged.capture.successFrameMs=clampAdventureSetting(merged.capture.successFrameMs,40,160,85);
    merged.capture.breakoutFrameMs=clampAdventureSetting(merged.capture.breakoutFrameMs,40,160,90);
    merged.capture.spinDegree=clampAdventureSetting(merged.capture.spinDegree,0,720,320);
    merged.levelUp.displaySize=clampAdventureSetting(merged.levelUp.displaySize,64,220,128);
    merged.levelUp.frameMs=clampAdventureSetting(merged.levelUp.frameMs,40,160,85);
    merged.levelUp.pulseScale=clampAdventureSetting(merged.levelUp.pulseScale,1,1.35,1.08);
    merged.levelUp.glowDurationMs=clampAdventureSetting(merged.levelUp.glowDurationMs,300,2000,900);
    return merged;
  }
  function shuffle(arr){
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  function statTotal(p){ return Object.values(p?.stats||{}).reduce((a,b)=>a+Number(b||0),0); }
  function pokemonNames(p){
    return [p?.name,p?.koreanName,p?.speciesName,p?.apiName].filter(Boolean).map(v=>String(v).trim().toLowerCase());
  }
  function adventureDisplayName(p){
    const raw = [p?.name, p?.koreanName, p?.speciesName].find(v=>v && String(v).trim() && String(v).trim() !== "undefined");
    if(raw) return String(raw).trim();
    const id = Number(p?.id);
    if(KOREAN_NAME_BY_ID[id]) return KOREAN_NAME_BY_ID[id];
    const api = String(p?.apiName || p?.species || "").replace(/-/g,"_").trim();
    if(KOREAN_NAME_BY_API[api]) return KOREAN_NAME_BY_API[api];
    return api ? api.replace(/_/g,"-") : `포켓몬#${Number.isFinite(id)?id:"?"}`;
  }
  function normalizeAdventureBasePokemon(p){
    if(!p) return p;
    const out = {...p};
    const id = Number(out.id);
    out.name = adventureDisplayName(out);
    if(!out.apiName){
      const foundApi = Object.entries(KOREAN_NAME_BY_API).find(([,ko])=>ko===out.name);
      if(foundApi) out.apiName = foundApi[0].replace(/_/g,"-");
    }
    if(!out.types || !out.types.length) out.types = TYPE_BY_ID[id] || ["normal"];
    if(!out.stats || !Object.keys(out.stats||{}).length) out.stats = out.baseStats || STARTER_DEFAULT_STATS_BY_ID[id] || {hp:45, attack:45, defense:45, speed:45};
    if(!out.baseStats || !Object.keys(out.baseStats||{}).length) out.baseStats = out.stats;
    if(!out.frontSprite && Number.isFinite(id)) out.frontSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
    if(!out.backSprite && Number.isFinite(id)) out.backSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${id}.gif`;
    return out;
  }

  function normalizeMasterPokemonForAdventure(p){
    if(!p) return null;
    return normalizeAdventureBasePokemon({
      id:p.id,
      apiName:p.apiName || p.nameEn,
      name:p.nameKo || p.name,
      types:p.types || [],
      stats:p.stats || p.baseStats || {},
      baseStats:p.baseStats || p.stats || {},
      frontSprite:p.frontSprite || p.spriteFront,
      backSprite:p.backSprite || p.spriteBack,
      evolutionStage:p.evolutionStage,
      evolvesFrom:p.evolvesFrom,
      evolvesTo:p.evolvesTo,
      dataIncomplete:!!p.dataIncomplete,
      implemented:p.implemented !== false,
      availableInAdventure:p.availableInAdventure !== false,
      availableInBattle:p.availableInBattle !== false
    });
  }
  function mergeAdventureMasterPokemon(current, master){
    const byId=new Map();
    for(const raw of (current||[])){
      const p=normalizeAdventureBasePokemon(raw);
      if(p && Number.isFinite(Number(p.id))) byId.set(Number(p.id), p);
    }
    for(const raw of (master||[])){
      const p=normalizeMasterPokemonForAdventure(raw);
      if(!p || !Number.isFinite(Number(p.id))) continue;
      const old=byId.get(Number(p.id)) || {};
      byId.set(Number(p.id), normalizeAdventureBasePokemon({
        ...p,
        ...old,
        name:p.name || old.name,
        apiName:p.apiName || old.apiName,
        types:(p.types&&p.types.length)?p.types:(old.types||[]),
        stats:(p.stats&&Object.keys(p.stats).length)?p.stats:(old.stats||old.baseStats||{}),
        baseStats:(p.baseStats&&Object.keys(p.baseStats).length)?p.baseStats:(old.baseStats||old.stats||{}),
        frontSprite:old.frontSprite || p.frontSprite,
        backSprite:old.backSprite || p.backSprite,
        evolutionStage:p.evolutionStage ?? old.evolutionStage,
        dataIncomplete:!!(p.dataIncomplete || old.dataIncomplete)
      }));
    }
    return [...byId.values()].sort((a,b)=>Number(a.id||0)-Number(b.id||0));
  }
  function configuredBasicEntries(){
    const cfg=adventure.basicConfig||{};
    const entries=[];
    for(const id of (cfg.basicIds||[])) entries.push({id:Number(id)});
    for(const e of (cfg.basicPokemon||cfg.entries||[])){
      if(e && typeof e === "object") entries.push({id:Number(e.id), name:e.name, apiName:e.apiName});
    }
    for(const id of BASIC_LIKE_IDS) entries.push({id:Number(id)});
    for(const id of ADVENTURE_BASIC_IDS) entries.push({id:Number(id)});
    return entries;
  }
  function matchesConfiguredBasic(p){
    const id=Number(p?.id);
    const names=new Set(pokemonNames(p));
    return configuredBasicEntries().some(e=>{
      if(Number.isFinite(e.id) && Number(e.id)===id) return true;
      if(e.name && names.has(String(e.name).trim().toLowerCase())) return true;
      if(e.apiName && names.has(String(e.apiName).trim().toLowerCase())) return true;
      return false;
    });
  }
  function isSafeAdventureBasic(p){
    const id=Number(p?.id);
    if(!p?.frontSprite || !p?.backSprite) return false;
    if(LEGENDARY_MYTHICAL_IDS.has(id)) return false;
    return matchesConfiguredBasic(p);
  }
  function basicPokemonPool(){
    const preferred=adventure.pokemon.filter(isSafeAdventureBasic).sort((a,b)=>statTotal(a)-statTotal(b));
    if(preferred.length<12){
      console.warn(`[Adventure] basic pool matched only ${preferred.length} Pokemon. Check adventure_basic_pokemon.json and current Pokemon data.`, preferred.map(p=>`${p.id}:${p.name}`));
    }
    return preferred;
  }
  function starterPoolArray(key){
    const src = adventure.starterPool || {};
    const list = Array.isArray(src[key]) ? src[key] : [];
    return list.map(v=> typeof v === "object" ? Number(v.id) : Number(v)).filter(Number.isFinite);
  }
  function starterPoolLegacyEntries(){
    const src = adventure.starterPool || {};
    const list = Array.isArray(src.starters) ? src.starters : [];
    return list;
  }
  function createStarterCandidateFromId(id){
    const byId = new Map(adventure.pokemon.map(p=>[Number(p.id), normalizeAdventureBasePokemon(p)]));
    const existing = byId.get(Number(id));
    const fromJson = starterPoolLegacyEntries().find(e=>Number(e?.id)===Number(id));
    const base = normalizeAdventureBasePokemon({
      ...(existing || {}),
      ...(fromJson || {}),
      id:Number(id),
      name:(fromJson?.name || existing?.name || KOREAN_NAME_BY_ID[Number(id)] || `포켓몬#${id}`),
      types:(fromJson?.types || existing?.types || TYPE_BY_ID[Number(id)] || ["normal"]),
      stats:(fromJson?.stats || fromJson?.baseStats || existing?.stats || existing?.baseStats || STARTER_DEFAULT_STATS_BY_ID[Number(id)] || {hp:45,attack:45,defense:45,speed:45}),
      baseStats:(fromJson?.baseStats || fromJson?.stats || existing?.baseStats || existing?.stats || STARTER_DEFAULT_STATS_BY_ID[Number(id)] || {hp:45,attack:45,defense:45,speed:45}),
      frontSprite:(fromJson?.frontSprite || existing?.frontSprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`),
      backSprite:(fromJson?.backSprite || existing?.backSprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${id}.gif`)
    });
    return base;
  }
  function findAdventureBasePokemonByIdOrName(value){
    if(value==null) return null;
    const raw=String(value).trim().toLowerCase();
    const num=Number(value);
    let found=null;
    if(Number.isFinite(num)) found=adventure.pokemon.find(p=>Number(p.id)===num);
    if(!found){
      found=adventure.pokemon.find(p=>pokemonNames(p).includes(raw) || String(p.name||"").trim().toLowerCase()===raw || String(p.apiName||"").trim().toLowerCase()===raw);
    }
    if(found) return normalizeAdventureBasePokemon(found);
    if(Number.isFinite(num) && EVOLUTION_FALLBACK_SPECIES[num]) return normalizeAdventureBasePokemon({
      ...EVOLUTION_FALLBACK_SPECIES[num],
      frontSprite:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${num}.gif`,
      backSprite:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${num}.gif`
    });
    const fallback=Object.values(EVOLUTION_FALLBACK_SPECIES).find(p=>String(p.name||"").toLowerCase()===raw || String(p.apiName||"").toLowerCase()===raw);
    if(fallback) return normalizeAdventureBasePokemon({
      ...fallback,
      frontSprite:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${fallback.id}.gif`,
      backSprite:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${fallback.id}.gif`
    });
    return null;
  }
  function isBlockedStarterPokemon(p){
    return !isAllowedStarterPokemon(p);
  }
  function uniqueStarterList(list){
    const seen=new Set();
    const out=[];
    for(const raw of list){
      const p=normalizeAdventureBasePokemon(raw);
      const id=Number(p?.id);
      if(!p || !Number.isFinite(id) || seen.has(id)) continue;
      if(isBlockedStarterPokemon(p)) continue;
      seen.add(id);
      out.push(p);
    }
    return out;
  }
  function starterIdsFromEvolutions(lineLength){
    const byName = new Map(adventure.pokemon.map(p=>[adventureDisplayName(p), normalizeAdventureBasePokemon(p)]));
    const out=[];
    const ev=adventure.evolutions || {};
    for(const [name, info] of Object.entries(ev)){
      const base = byName.get(name) || adventure.pokemon.find(p=>pokemonNames(p).includes(String(name).trim().toLowerCase()));
      if(!base) continue;
      const p=normalizeAdventureBasePokemon(base);
      if(!isAllowedStarterPokemon(p)) continue;
      const len=Number(info.evolutionLineLength || p.evolutionLineLength || (info.finalEvolution || p.finalEvolution ? 3 : 2));
      if(lineLength===3 && len>=3) out.push(p);
      if(lineLength===2 && len===2) out.push(p);
    }
    return out;
  }
  function readRecentStarterIds(){
    try{
      const arr=JSON.parse(localStorage.getItem(STARTER_RECENT_KEY)||"[]");
      return Array.isArray(arr) ? arr.map(Number).filter(Number.isFinite) : [];
    }catch(_){ return []; }
  }
  function writeRecentStarterIds(ids){
    try{ localStorage.setItem(STARTER_RECENT_KEY, JSON.stringify(ids.map(Number).filter(Number.isFinite).slice(-24))); }catch(_){ /* ignore */ }
  }
  function getAdventureStarterPool(){
    const poolJsonLoaded = Boolean(adventure.starterPool && !adventure.starterPool.__loadFailed);
    const threeIds = [...starterPoolArray("threeStageFirst"), ...STARTER_THREE_STAGE_IDS];
    const twoIds = [...starterPoolArray("twoStageFirst"), ...STARTER_TWO_STAGE_IDS];
    const evolvableIds = [...starterPoolArray("evolvableBasic")];
    const fallbackIds = [...starterPoolArray("safeFallback"), ...STARTER_SAFE_FALLBACK_IDS];
    const blockedIds = new Set([...(starterPoolArray("blockedStarterIds")), ...STARTER_BLOCKED_IDS]);
    const oldBlockedSize = STARTER_BLOCKED_IDS.size;
    starterPoolArray("blockedStarterIds").forEach(id=>STARTER_BLOCKED_IDS.add(id));

    const legacy = starterPoolLegacyEntries().map(e=>normalizeAdventureBasePokemon(e)).filter(Boolean);
    const legacyThree = legacy.filter(p=>isAllowedStarterPokemon(p) && Number(p.evolutionLineLength||0)>=3);
    const legacyTwo = legacy.filter(p=>isAllowedStarterPokemon(p) && Number(p.evolutionLineLength||0)===2);
    const evThree = starterIdsFromEvolutions(3);
    const evTwo = starterIdsFromEvolutions(2);

    const threeStageFirst = uniqueStarterList([...legacyThree, ...evThree, ...threeIds.map(createStarterCandidateFromId)]);
    const twoStageFirst = uniqueStarterList([...legacyTwo, ...evTwo, ...twoIds.map(createStarterCandidateFromId)]).filter(p=>!threeStageFirst.some(x=>Number(x.id)===Number(p.id)));
    const evolvableBasic = uniqueStarterList([...evolvableIds.map(createStarterCandidateFromId), ...adventure.pokemon.filter(p=>isAllowedStarterPokemon(p) && (p.evolvesTo || p.finalEvolutionAvailable || Number(p.evolutionLineLength||0)>=2))])
      .filter(p=>!threeStageFirst.some(x=>Number(x.id)===Number(p.id)) && !twoStageFirst.some(x=>Number(x.id)===Number(p.id)));
    const safeFallback = uniqueStarterList([...fallbackIds.map(createStarterCandidateFromId), ...basicPokemonPool().filter(p=>statTotal(p)<=340)])
      .filter(p=>!threeStageFirst.some(x=>Number(x.id)===Number(p.id)) && !twoStageFirst.some(x=>Number(x.id)===Number(p.id)) && !evolvableBasic.some(x=>Number(x.id)===Number(p.id)));

    const final = uniqueStarterList([...threeStageFirst, ...twoStageFirst, ...evolvableBasic, ...safeFallback]).filter(isAllowedStarterPokemon);
    STARTER_BLOCKED_IDS.clear();
    [83,95,106,107,108,113,115,122,124,125,126,127,128,131,132,137,142,143,185,200,203,206,213,214,225,226,227,234,235,241].forEach(id=>STARTER_BLOCKED_IDS.add(id));
    for(const id of blockedIds) STARTER_BLOCKED_IDS.add(id);

    adventureDebugLog('starter', '[Adventure Starter] pool json loaded:', poolJsonLoaded);
    adventureDebugLog('starter', '[Adventure Starter] pokemon count:', adventure.pokemon.length);
    adventureDebugLog('starter', '[Adventure Starter] threeStageFirst count:', threeStageFirst.length);
    adventureDebugLog('starter', '[Adventure Starter] twoStageFirst count:', twoStageFirst.length);
    adventureDebugLog('starter', '[Adventure Starter] evolvableBasic count:', evolvableBasic.length);
    adventureDebugLog('starter', '[Adventure Starter] safeFallback count:', safeFallback.length);
    adventureDebugLog('starter', '[Adventure Starter] blocked count:', blockedIds.size || oldBlockedSize);
    if(!poolJsonLoaded) console.warn('[Adventure Starter] adventure_starter_pool.json load failed. Built-in fallback is active.');
    if((threeStageFirst.length + twoStageFirst.length) < 6) console.warn('[Adventure Starter] 3-stage + 2-stage starter pool is small.', {three:threeStageFirst.length,two:twoStageFirst.length});
    adventureDebugLog('starter', '[Adventure Starter] final pool:', final.length, final.slice(0,36).map(p=>`${p.id}:${p.name}`));
    if(final.length<12) console.warn('[Adventure Starter] final pool is under 12. Rendering available candidates instead of blank screen.', final.map(p=>`${p.id}:${p.name}`));
    return { threeStageFirst, twoStageFirst, evolvableBasic, safeFallback, final };
  }
  function takeRandomByQuota(list, count, used, recentSet){
    const nonRecent=shuffle(list.filter(p=>!used.has(Number(p.id)) && !recentSet.has(Number(p.id))));
    const withRecent=shuffle(list.filter(p=>!used.has(Number(p.id)) && recentSet.has(Number(p.id))));
    const picked=[];
    for(const p of [...nonRecent, ...withRecent]){
      if(picked.length>=count) break;
      picked.push(p); used.add(Number(p.id));
    }
    return picked;
  }
  function buildAdventureStarterCandidates(){
    const groups=getAdventureStarterPool();
    const recentSet=new Set(readRecentStarterIds());
    const used=new Set();
    let picked=[];
    picked.push(...takeRandomByQuota(groups.threeStageFirst, 6, used, recentSet));
    picked.push(...takeRandomByQuota(groups.twoStageFirst, 4, used, recentSet));
    picked.push(...takeRandomByQuota(groups.evolvableBasic, 2, used, recentSet));
    if(picked.length<12) picked.push(...takeRandomByQuota(groups.threeStageFirst, 12-picked.length, used, recentSet));
    if(picked.length<12) picked.push(...takeRandomByQuota(groups.twoStageFirst, 12-picked.length, used, recentSet));
    if(picked.length<12) picked.push(...takeRandomByQuota(groups.evolvableBasic, 12-picked.length, used, recentSet));
    const fallbackBefore=picked.length;
    if(picked.length<12) picked.push(...takeRandomByQuota(groups.safeFallback, Math.min(2,12-picked.length), used, recentSet));
    if(picked.length<12) picked.push(...takeRandomByQuota(groups.final, 12-picked.length, used, new Set()));
    picked=shuffle(picked).map(normalizeAdventureBasePokemon).filter(isAllowedStarterPokemon).slice(0,12);
    const fallbackCount=picked.filter(p=>groups.safeFallback.some(f=>Number(f.id)===Number(p.id))).length;
    if(fallbackCount>=4) console.warn('[Adventure Starter] fallback ratio is high.', fallbackCount, picked.map(p=>`${p.id}:${p.name}`));
    adventureDebugLog('starter', '[Adventure Starter] recent excluded count:', [...recentSet].length);
    adventureDebugLog('starter', '[Adventure Starter] final count:', picked.length);
    adventureDebugLog('starter', '[Adventure Starter] final names:', picked.map(p=>p.name).join(', '));
    writeRecentStarterIds([...readRecentStarterIds(), ...picked.map(p=>Number(p.id))]);
    return picked;
  }
  function adventureStageBounds(stage=1){
    const s=Number(stage||1);
    const boss=s%adventure.bossEvery===0;
    if(s<=10) return {min:180,max:330,boss};
    if(s<=20) return {min:220,max:380,boss};
    if(s<=39) return {min:260,max:430,boss};
    if(s<=49) return {min:320,max:470,boss};
    if(s<=50) return {min:400,max:520,boss};
    if(s<=79) return {min:380,max:560,boss};
    if(s<=89) return {min:450,max:600,boss};
    return {min:500,max:650,boss};
  }
  function isEarlyBannedStrongPokemon(p){
    return new Set([143,131,128,115,127,123,214,227,241,142]).has(Number(p?.id));
  }
  function uniquePokemonById(list){
    const seen=new Set();
    const out=[];
    for(const p of list||[]){
      const id=Number(p?.id);
      if(!id || seen.has(id)) continue;
      seen.add(id); out.push(p);
    }
    return out;
  }

  function adventureMoveKey(value){
    return String(value||"").trim().toLowerCase().replace(/[_\s-]+/g,"");
  }
  function adventurePokemonNameKeys(p){
    return new Set([String(p?.id||""), String(p?.name||""), String(p?.apiName||"")].map(x=>x.trim()).filter(Boolean));
  }
  function adventureEvolutionEntries(){
    return adventure.evolutions && typeof adventure.evolutions === "object" ? adventure.evolutions : {};
  }
  function adventureEvolutionStageOfFallbackId(id){
    if([12,15,18,31,34,45,65,68,71,76,94,149,154,157,160,181,189,248].includes(Number(id))) return 2;
    if([2,5,8,11,14,17,30,33,44,64,67,70,75,93,148,153,156,159,180,188,247].includes(Number(id))) return 1;
    if(EVOLUTION_FALLBACK_SPECIES[Number(id)]) return 1;
    return null;
  }
  function getEvolutionStageFromEvolutionData(p){
    if(!p) return null;
    const id=Number(p.id||0);
    if(Number.isFinite(Number(p.evolutionStage)) && p.evolutionStage!==null && p.evolutionStage!==undefined) return Number(p.evolutionStage);
    const explicit=adventureEvolutionStageOfFallbackId(id);
    if(explicit!==null) return explicit;
    const keys=adventurePokemonNameKeys(p);
    const ev=adventureEvolutionEntries();
    const resultIds=new Set();
    const resultNames=new Set();
    const sourceIds=new Set();
    const sourceNames=new Set();
    for(const [from, info] of Object.entries(ev)){
      if(info && typeof info === "object"){
        if(/^\d+$/.test(String(from))) sourceIds.add(Number(from));
        sourceNames.add(String(from));
        if(info.toId!=null) resultIds.add(Number(info.toId));
        [info.to, info.toName, info.toApiName].filter(Boolean).forEach(v=>resultNames.add(String(v)));
      }
    }
    if(resultIds.has(id) || [...keys].some(k=>resultNames.has(k))) return 1;
    if(sourceIds.has(id) || [...keys].some(k=>sourceNames.has(k))) return 0;
    if(ADVENTURE_BASIC_IDS.has(id) || STARTER_THREE_STAGE_IDS.includes(id) || STARTER_TWO_STAGE_IDS.includes(id)) return 0;
    return null;
  }
  function isEvolvedSpecies(p){ return Number(getEvolutionStageFromEvolutionData(p)||0) >= 1; }
  function isBasicSpecies(p){ return Number(getEvolutionStageFromEvolutionData(p)) === 0; }
  function hasReliableAdventureTypes(p){
    const id=Number(p?.id||0);
    const raw=Array.isArray(p?.types) ? p.types.filter(Boolean) : [];
    if(raw.length && !(raw.length===1 && String(raw[0]).toLowerCase()==="normal" && !TYPE_BY_ID[id] && !EVOLUTION_FALLBACK_SPECIES[id]?.types)) return true;
    if(TYPE_BY_ID[id]?.length) return true;
    if(EVOLUTION_FALLBACK_SPECIES[id]?.types?.length) return true;
    return false;
  }
  function hasReliableAdventureStats(p){
    const id=Number(p?.id||0);
    const raw=p?.baseStats || p?.stats || {};
    if(raw && Number(raw.hp||raw.baseHp)>0 && Number(raw.attack||raw.baseAttack)>0 && Number(raw.defense||raw.baseDefense)>0) return true;
    if(STARTER_DEFAULT_STATS_BY_ID[id]) return true;
    if(EVOLUTION_FALLBACK_SPECIES[id]?.stats) return true;
    return false;
  }
  function hasAdventureSpriteData(p){ return !!(p?.frontSprite || Number.isFinite(Number(p?.id))); }
  function starterBlockReason(p){
    const id=Number(p?.id||0);
    if(!p || !Number.isFinite(id)) return "invalid-id";
    if(LEGENDARY_MYTHICAL_IDS.has(id)) return "legendary-or-mythical";
    if(STARTER_BLOCKED_IDS.has(id)) return "blocked-starter-id";
    if(isEarlyBannedStrongPokemon(p)) return "early-strong-single";
    const stage=getEvolutionStageFromEvolutionData(p);
    if(stage === null || stage === undefined) return "unknown-evolution-stage";
    if(Number(stage)!==0) return "evolved-species";
    if(!hasReliableAdventureTypes(p)) return "missing-types";
    if(!hasReliableAdventureStats(p)) return "missing-stats";
    if(!hasAdventureSpriteData(p)) return "missing-sprite";
    return "allowed";
  }
  function isAllowedStarterPokemon(p){ return starterBlockReason(p) === "allowed"; }
  function isAllowedEarlyWildPokemon(p){
    const id=Number(p?.id||0);
    if(!p || !Number.isFinite(id)) return false;
    if(LEGENDARY_MYTHICAL_IDS.has(id) || ADVENTURE_EARLY_EXCLUDED_IDS.has(id) || isEarlyBannedStrongPokemon(p)) return false;
    if(!isBasicSpecies(p)) return false;
    if(!hasReliableAdventureTypes(p) || !hasReliableAdventureStats(p)) return false;
    return true;
  }
  function isSafeFallbackMoveForPokemon(move, mon){
    if(!move || !mon) return false;
    const id=adventureMoveKey(move.id || move.apiName || move.name);
    if(["aquajet","quickattack"].includes(id)) return false;
    if(isBlockedAdventureMove(move) || isEarlyExcludedAdventureMove(move)) return false;
    const type=String(move.type||"").toLowerCase();
    const types=(mon.types||[]).map(t=>String(t).toLowerCase());
    const power=Number(move.power||0);
    if(type && types.includes(type) && power<=60) return true;
    if(type==="normal" && power<=45) return true;
    if(power===0 && ["growl","tailwhip","scaryface","smokescreen","screech","withdraw","harden","defensecurl"].includes(id)) return true;
    return false;
  }
  function safeFallbackMoveIdsForPokemon(mon){
    const types=(mon?.types||[]).map(t=>String(t).toLowerCase());
    const ids=[];
    const add=(arr)=>arr.forEach(x=>{ if(!ids.includes(x)) ids.push(x); });
    if(types.includes("fire")) add(["ember","smokescreen","scratch","growl"]);
    if(types.includes("water")) add(["waterGun","bubble","withdraw","tackle"]);
    if(types.includes("grass")) add(["vineWhip","absorb","growl","tackle"]);
    if(types.includes("electric")) add(["thunderShock","thunderWave","tackle","growl"]);
    if(types.includes("bug")) add(["tackle","stringShot","poisonSting","absorb"]);
    if(types.includes("poison")) add(["poisonSting","poisonPowder","tackle","screech"]);
    if(types.includes("flying")) add(["gust","peck","tackle","growl"]);
    if(types.includes("rock") || types.includes("ground")) add(["mudSlap","rockThrow","tackle","defenseCurl"]);
    if(types.includes("psychic")) add(["confusion","teleport","disable","tackle"]);
    if(types.includes("fighting")) add(["karateChop","lowKick","tackle","leer"]);
    if(types.includes("ice")) add(["powderSnow","icyWind","tackle","mist"]);
    add(["tackle","growl","tailWhip"]);
    return ids;
  }

  function adventureStageRangeKey(stage=1){
    const s=Number(stage||1);
    if(s<=10) return "1-10";
    if(s<=30) return "11-30";
    if(s<=60) return "31-60";
    if(s<=80) return "61-80";
    if(s<=90) return "81-90";
    if(s<=99) return "91-99";
    return "100";
  }
  function adventureEncounterBand(stage=1){
    const s=Number(stage||1), bands=adventure.encounterRules?.stageBands||{};
    for(const [key,band] of Object.entries(bands)){
      const [min,max]=band.stageRange||[];
      if(s>=Number(min||1) && s<=Number(max||min||999)) return {key, band};
    }
    return {key:adventureExpStageBand(s), band:{}};
  }
  function adventurePokemonMatchesName(p, names=[]){
    const keys=new Set([String(p?.id||""), String(p?.name||""), String(p?.apiName||"")].map(x=>x.trim()).filter(Boolean));
    return (names||[]).some(n=>keys.has(String(n||"").trim()));
  }
  function adventureEvolutionStageOf(p){
    const stage=getEvolutionStageFromEvolutionData(p);
    return Number.isFinite(Number(stage)) ? Number(stage) : 0;
  }
  function adventureManualPoolRule(stage=1){
    return adventure.encounterRules?.manualPools?.[adventureStageRangeKey(stage)] || null;
  }
  function adventureWeightedPick(pool, stage=1){
    const manual=adventureManualPoolRule(stage)||{};
    const weights=manual.weights||{};
    const recent=adventure.recentWildIds||[];
    const recentCfg=adventure.encounterRules?.recentPenalty||{};
    const list=(pool||[]).filter(Boolean).map(p=>{
      let w=Number(weights[p.name] ?? weights[p.apiName] ?? weights[String(p.id)] ?? 5);
      if(recentCfg.recentPenaltyEnabled!==false && recent.length){
        const idx=recent.lastIndexOf(Number(p.id));
        if(idx>=0){
          const fromEnd=recent.length-1-idx;
          if(fromEnd===0) w*=Number(recentCfg.penalty?.last||0.1);
          else if(fromEnd<3) w*=Number(recentCfg.penalty?.recent3||0.35);
          else if(fromEnd<5) w*=Number(recentCfg.penalty?.recent5||0.6);
        }
      }
      return {p, w:Math.max(0.01,w)};
    });
    let total=list.reduce((sum,x)=>sum+x.w,0), roll=Math.random()*total;
    for(const x of list){ roll-=x.w; if(roll<=0) return x.p; }
    return list[0]?.p || null;
  }
  function applyAdventureEncounterRulesToPool(pool, stage=1){
    const {band}=adventureEncounterBand(stage);
    const manual=adventureManualPoolRule(stage)||{};
    let out=uniquePokemonById(pool||[]);
    if(Number(stage||1)<=10) out=out.filter(isAllowedEarlyWildPokemon);
    if(Array.isArray(manual.include) && manual.include.length){
      const included=adventure.pokemon.map(normalizeAdventureBasePokemon).filter(p=>adventurePokemonMatchesName(p, manual.include));
      if(included.length>=3) out=uniquePokemonById([...included, ...out]);
    }
    if(Array.isArray(manual.exclude) && manual.exclude.length) out=out.filter(p=>!adventurePokemonMatchesName(p, manual.exclude));
    if(Number(stage||1)<=10) out=out.filter(isAllowedEarlyWildPokemon);
    const min=Number(band.minBST||0), max=Number(band.maxBST||9999);
    if(min || max<9999) out=out.filter(p=>{ const bst=statTotal(p); return bst>=min && bst<=max; });
    const stages=Array.isArray(band.allowedEvolutionStages) ? band.allowedEvolutionStages.map(Number) : null;
    if(stages && stages.length && Number(stage||1)<61) out=out.filter(p=>stages.includes(adventureEvolutionStageOf(p)));
    const minNeed=Number(band.minCandidateCount || (Number(stage||1)>=81?30:20));
    const fallback=adventure.encounterRules?.fallback||{};
    let relax=0;
    while(out.length<Math.min(minNeed,30) && relax<Number(fallback.maxRelaxAttempts||4)){
      relax+=1;
      const step=Number(fallback.bstRelaxStep||50)*relax;
      const relaxed=adventure.pokemon.map(normalizeAdventureBasePokemon).filter(p=>p?.frontSprite&&p?.backSprite&&!LEGENDARY_MYTHICAL_IDS.has(Number(p.id))).filter(p=>{
        const bst=statTotal(p); return bst>=Math.max(1,min-step) && bst<=max+step;
      });
      out=uniquePokemonById([...out, ...relaxed]);
    }
    if(out.length<5){
      const fallbackAll=adventure.pokemon.map(normalizeAdventureBasePokemon).filter(p=>p?.frontSprite&&p?.backSprite&&!LEGENDARY_MYTHICAL_IDS.has(Number(p.id))).filter(p=>Number(stage||1)>60 ? statTotal(p)>=350 : true);
      out=uniquePokemonById([...out, ...fallbackAll]);
    }
    return out;
  }
  function getAdventureWildPool(stage=1){
    const bounds=adventureStageBounds(stage);
    const s=Number(stage||1);
    const all=adventure.pokemon
      .map(normalizeAdventureBasePokemon)
      .filter(p=>p?.frontSprite&&p?.backSprite&&!LEGENDARY_MYTHICAL_IDS.has(Number(p.id)))
      .filter(p=>!(s<=20 && isEarlyBannedStrongPokemon(p)))
      .filter(p=>s>10 || isAllowedEarlyWildPokemon(p));
    const starterGroups=getAdventureStarterPool();
    const starterLike=uniquePokemonById([...(starterGroups.threeStageFirst||[]),...(starterGroups.twoStageFirst||[]),...(starterGroups.evolvableBasic||[]),...(starterGroups.safeFallback||[])]);
    let pool=all.filter(p=>{ const bst=statTotal(p); return bst>=bounds.min && bst<=bounds.max; });
    if(s<=20){
      pool=uniquePokemonById([...pool, ...starterLike.filter(p=>!isEarlyBannedStrongPokemon(p) && statTotal(p)<=Math.max(bounds.max,330))]);
    }
    pool=applyAdventureEncounterRulesToPool(pool, s);
    const minNeeded=s<=10?30:(s<=20?40:(s>=81?30:24));
    pool=shuffle(uniquePokemonById(pool));
    console.debug?.('[Adventure Wild]', {stage:s, band:adventureEncounterBand(s).key, poolSize:pool.length, recentExcluded:[...(adventure.recentWildIds||[])]});
    if(pool.length<minNeeded) console.warn(`[Adventure Wild] wild pool has only ${pool.length}/${minNeeded} Pokemon for stage ${s}.`, pool.map(p=>`${p.id}:${p.name}:${statTotal(p)}`));
    return pool;
  }
  function getAdventureBossPool(stage=10){
    const bounds=adventureStageBounds(stage);
    return adventure.pokemon
      .filter(p=>p?.frontSprite&&p?.backSprite&&!LEGENDARY_MYTHICAL_IDS.has(Number(p.id)))
      .filter(p=>statTotal(p)>=bounds.min && statTotal(p)<=bounds.max+40)
      .sort((a,b)=>statTotal(a)-statTotal(b));
  }
  function buildAdventureEarlyWildPool(){
    const explicit=ADVENTURE_EARLY_STAGE_1_TO_10_POOL.map(createStarterCandidateFromId)
      .filter(isAllowedEarlyWildPokemon);
    const fallback=adventure.pokemon
      .map(normalizeAdventureBasePokemon)
      .filter(p=>p?.frontSprite && isAllowedEarlyWildPokemon(p) && statTotal(p)<=300);
    return uniquePokemonById([...explicit, ...fallback]);
  }
  function pickAdventureEarlyWildPokemon(stage=1, playerLevel=getAdventurePlayerReferenceLevel()){
    const pool=buildAdventureEarlyWildPool();
    let candidates=pool.filter(p=>!adventure.team.some(t=>Number(t.id)===Number(p.id)));
    const recentSet=new Set(adventure.recentWildIds||[]);
    const nonRecent=candidates.filter(p=>!recentSet.has(Number(p.id)));
    if(nonRecent.length>=4) candidates=nonRecent;
    if(!candidates.length) candidates=pool;
    const picked=shuffle(candidates)[0];
    console.debug?.('[Adventure Wild] early baby/bug mode:', true);
    console.debug?.('[Adventure Wild] stage:', Number(stage||1));
    console.debug?.('[Adventure Wild] player level:', playerLevel);
    const range=getAdventureEnemyLevelRange(stage, playerLevel, false);
    console.debug?.('[Adventure Wild] enemy level range:', `${range.min}~${range.max}`);
    console.debug?.('[Adventure Wild] baby pool count:', ADVENTURE_EARLY_BABY_IDS.map(createStarterCandidateFromId).filter(Boolean).length);
    console.debug?.('[Adventure Wild] bug basic pool count:', ADVENTURE_EARLY_BUG_BASIC_IDS.map(createStarterCandidateFromId).filter(Boolean).length);
    console.debug?.('[Adventure Wild] selected:', `${picked?.name || "-"} Lv${pickAdventureEnemyLevel(stage, playerLevel, false)}`);
    return picked;
  }
  function pickAdventureFinalBossPokemon(stage=100){
    const boss=adventure.bosses?.finalBoss;
    if(!boss || Number(stage||1)!==Number(boss.stage||100)) return null;
    const found=findAdventureBasePokemonByIdOrName(boss.name) || findAdventureBasePokemonByIdOrName(boss.id) || findAdventureBasePokemonByIdOrName(boss.apiName);
    if(found){
      const cloneBase=normalizeAdventureBasePokemon(found);
      cloneBase.bossMoves=boss.moves||[];
      cloneBase.bossIntroMessage=boss.introMessage;
      return cloneBase;
    }
    return null;
  }
  function pickAdventureWildPokemon(stage=1){
    if(Number(stage||1)<=10){
      return pickAdventureEarlyWildPokemon(stage, getAdventurePlayerReferenceLevel());
    }
    const finalBoss=pickAdventureFinalBossPokemon(stage);
    if(finalBoss) return finalBoss;
    const isBoss=Number(stage)%adventure.bossEvery===0;
    const pool=(isBoss ? getAdventureBossPool(stage) : getAdventureWildPool(stage));
    let candidates=pool.filter(p=>!adventure.team.some(t=>Number(t.id)===Number(p.id)));
    const recentSet=new Set(adventure.recentWildIds||[]);
    const nonRecent=candidates.filter(p=>!recentSet.has(Number(p.id)));
    if(nonRecent.length>=8 || (nonRecent.length>=3 && candidates.length<12)) candidates=nonRecent;
    if(!candidates.length) candidates=pool;
    const picked=adventureWeightedPick(candidates, stage) || shuffle(candidates)[0];
    console.debug?.('[Adventure Wild] pickedName', picked?.name, {stage:Number(stage||1), poolSize:pool.length, candidates:candidates.length, recentExcluded:[...(recentSet||[])]});
    return picked;
  }
  function clampAdventureLevel(v){ return Math.max(2, Math.min(100, Math.round(Number(v||5)))); }
  function getAdventurePlayerReferenceLevel(){
    const active=adventure.team?.[adventure.activeIndex||0];
    if(active && !active.fainted && getAdventurePokemonHp(active)>0) return Number(active.level||5);
    const alive=getAliveAdventureTeam().map(x=>Number(x.p.level||5));
    if(alive.length) return Math.round(alive.reduce((a,b)=>a+b,0)/alive.length);
    return 5;
  }
  function getAdventureEnemyLevelRange(stage=1, playerLevel=getAdventurePlayerReferenceLevel(), isBoss=false){
    const s=Number(stage||1), lv=Number(playerLevel||5);
    if(s<=10) return {min:lv-2, max:lv-1};
    if(isBoss){
      if(s<40) return {min:lv+1, max:lv+2};
      return {min:lv+2, max:lv+4};
    }
    if(s<40) return {min:lv-2, max:lv+1};
    return {min:lv-1, max:lv+3};
  }
  function pickAdventureEnemyLevel(stage=1, playerLevel=getAdventurePlayerReferenceLevel(), isBoss=false){
    const r=getAdventureEnemyLevelRange(stage, playerLevel, isBoss);
    const min=clampAdventureLevel(r.min), max=clampAdventureLevel(Math.max(r.max, r.min));
    return clampAdventureLevel(min + Math.floor(Math.random()*(max-min+1)));
  }
  function adventureEnemyLevel(stage=1){
    const isBoss=Number(stage||1)%adventure.bossEvery===0;
    return pickAdventureEnemyLevel(stage, getAdventurePlayerReferenceLevel(), isBoss);
  }
  function pickStarterCandidates(){
    const picked=buildAdventureStarterCandidates();
    if(picked.length<12) console.warn(`[Adventure] starter candidates are ${picked.length}/12.`, picked.map(p=>`${p.id}:${p.name}`));
    return picked;
  }
  function isBlockedAdventureMove(move){
    if(!move) return true;
    const blocked = new Set([...(adventure.blockedMoves?.blocked || []), "rest", "잠자기"]);
    return [move.id, move.name, move.apiName].filter(Boolean).some(k=>blocked.has(k));
  }
  function isEarlyExcludedAdventureMove(move){
    if(Number(adventure.stage||1)>10) return false;
    const ids=new Set(["swordsDance","bulkUp","ironDefense","rest","recover","softBoiled","milkDrink","sleep","잠자기","칼춤","벌크업","철벽"]);
    if([move.id, move.name, move.apiName].filter(Boolean).some(k=>ids.has(k))) return true;
    if(move.heal || move.rest) return true;
    return Number(move.power||0)>50;
  }

  function adventureMoveConfigFor(base){
    if(!base) return null;
    const keys=[base.name, base.apiName, String(base.id||"")].filter(Boolean);
    for(const key of keys){ if(adventure.pokemonMovesets?.[key]) return adventure.pokemonMovesets[key]; }
    return null;
  }
  function uniqueAdventureMoves(moves){
    const out=[]; const seen=new Set();
    for(const m of moves||[]){
      const mv=typeof m==="string" ? resolveMoveByName(m) : (adventure.moveMap?.[m?.id] || m);
      if(!mv || isBlockedAdventureMove(mv)) continue;
      const key=mv.id || mv.name || mv.apiName;
      if(!key || seen.has(key)) continue;
      seen.add(key); out.push(normalizeMove(mv));
      if(out.length>=4) break;
    }
    return out;
  }


  const ADVENTURE_EARLY_BLOCKED_MOVE_KEYS = new Set([
    "earthquake","thunder","flamethrower","icebeam","ice-beam","psychic","thunderbolt","rockslide","rock-slide",
    "hydropump","hydro-pump","blizzard","fireblast","fire-blast","hyperbeam","hyper-beam","solarbeam","solar-beam",
    "지진","번개","화염방사","냉동빔","사이코키네시스","10만볼트","스톤샤워","하이드로펌프","눈보라","불대문자","파괴광선","솔라빔"
  ]);
  function adventureLearnLevelFromRow(row){
    const raw = row?.level_learned_at ?? row?.level ?? row?.learnLevel ?? row?.learn_level;
    const n=Number(raw);
    return Number.isFinite(n) ? n : NaN;
  }
  function adventureLearnMethodFromRow(row){
    return String(row?.method || row?.move_learn_method || row?.learnMethod || "level-up").trim().toLowerCase();
  }
  function adventureMoveNameFromRow(row){
    return row?.move || row?.id || row?.name || row?.moveName || row?.apiName || null;
  }
  function adventureLevelupRowsFor(base){
    if(!base) return [];
    const keys=[base.name, base.apiName, String(base.id||"")].filter(Boolean);
    for(const key of keys){
      const rows=adventure.levelupLearnsets?.[key];
      if(Array.isArray(rows) && rows.length){
        return rows.map(row=>{
          if(typeof row === "string") return { move:row, method:"level-up", level:NaN };
          return { ...row, method: adventureLearnMethodFromRow(row) || "level-up" };
        });
      }
    }
    const full=adventureLearnsetRecordForPokemon(base) || {};
    const rows=Array.isArray(full.levelUp) ? full.levelUp : [];
    return rows.map(row=>{
      if(typeof row === "string") return { move:row, method:"level-up", level:NaN };
      return { ...row, method: adventureLearnMethodFromRow(row) || "level-up" };
    }).filter(row=>Number.isFinite(adventureLearnLevelFromRow(row)) && adventureLearnLevelFromRow(row)>0);
  }
  function isAdventureEarlyFloorMoveBlocked(move, floor=adventure.stage){
    if(Number(floor||1)>10) return false;
    if(!move) return true;
    const keys=[move.id, move.apiName, move.name, move.koreanName].filter(Boolean).map(adventureMoveKey).filter(Boolean);
    if(keys.some(k=>ADVENTURE_EARLY_BLOCKED_MOVE_KEYS.has(k))) return true;
    const power=Number(move.power||0);
    if(Number.isFinite(power) && power>=60) return true;
    return false;
  }
  function isAdventureMoveAllowedByLevelGate(row, pokemonLevel, options={}){
    if(!row) return false;
    const method=adventureLearnMethodFromRow(row);
    const learnedAt=adventureLearnLevelFromRow(row);
    const level=Number(pokemonLevel||1);
    if(method !== "level-up") return false;
    if(!Number.isFinite(learnedAt) || learnedAt<=0) return false;
    if(learnedAt>level) return false;
    const move=resolveMoveByName(adventureMoveNameFromRow(row));
    if(!move || isBlockedAdventureMove(move)) return false;
    if(options.earlyFloor && isAdventureEarlyFloorMoveBlocked(move, options.floor ?? adventure.stage)) return false;
    return true;
  }
  function getAdventureLevelUpMovesForLevel(base, level=5, options={}){
    const pokemonKey = base?.id || base?.apiName || base?.name || "unknown";
    const floorKey = Number(options.floor ?? adventure.stage ?? 1);
    const levelKey = Number(level || 1);
    const earlyKey = options.earlyFloor ? 1 : 0;
    const cacheKey = `${pokemonKey}:${levelKey}:${floorKey}:${earlyKey}`;
    const cached = adventureLevelGateCache.get(cacheKey);
    if(cached) return cached.map(cloneAdventureMoveCandidate);
    const rows=adventureLevelupRowsFor(base);
    const seen=new Set();
    const accepted=[];
    const rejected=[];
    for(const row of rows){
      const move=resolveMoveByName(adventureMoveNameFromRow(row));
      const lv=adventureLearnLevelFromRow(row);
      const method=adventureLearnMethodFromRow(row);
      const ok=isAdventureMoveAllowedByLevelGate(row, level, options) && move && validateMoveForPokemon(base, move, level, {allowFallback:false});
      const key=move ? (move.id || move.name || move.apiName) : adventureMoveNameFromRow(row);
      if(!ok){ rejected.push({move:key, method, level_learned_at:lv}); continue; }
      if(!move || seen.has(move.id||move.name)) continue;
      seen.add(move.id||move.name);
      accepted.push({...normalizeMove(move), pp:move.maxPp, maxPp:move.maxPp, learnLevel:lv, method:"level-up"});
    }
    accepted.sort((a,b)=>Number(a.learnLevel||0)-Number(b.learnLevel||0));
    adventureLevelGateCache.set(cacheKey, accepted.map(cloneAdventureMoveCandidate));
    adventureDebugLog("moves", "[Adventure/Moves] level gate result", { pokemon:base?.name||base?.apiName||base?.id, pokemonLevel:levelKey, floor:floorKey, accepted:accepted.map(m=>({move:m.name||m.id, power:m.power, level_learned_at:m.learnLevel})), rejected:rejected.slice(0,12) });
    return accepted.map(cloneAdventureMoveCandidate);
  }
  function buildAdventureWeakFallbackMovesForPokemon(base, level=5, options={}){
    const out=[]; const seen=new Set();
    for(const id of safeFallbackMoveIdsForPokemon(base)){
      const move=resolveMoveByName(id);
      if(!move || seen.has(move.id||move.name)) continue;
      if(!isSafeFallbackMoveForPokemon(move, base)) continue;
      if(options.earlyFloor && isAdventureEarlyFloorMoveBlocked(move, options.floor ?? adventure.stage)) continue;
      if(Number(move.power||0)>=60) continue;
      seen.add(move.id||move.name);
      out.push({...normalizeMove(move), pp:move.maxPp, maxPp:move.maxPp, fallback:true});
      adventureDebugLog("moves", "[Adventure/Moves] fallback move used", { pokemon:base?.name||base?.apiName||base?.id, level, move:move.name||move.id, power:move.power });
      if(out.length>=1) break;
    }
    return out;
  }
  function buildAdventureInitialMovesForPokemon(base, options={}){
    const level=Number(options.level ?? 5);
    const floor=Number(options.floor ?? adventure.stage ?? 1);
    const moves=getAdventureLevelUpMovesForLevel(base, level, {floor, earlyFloor:floor<=10});
    const final=moves.slice(-4);
    if(!final.length) final.push(...buildAdventureWeakFallbackMovesForPokemon(base, level, {floor, earlyFloor:floor<=10}));
    adventureDebugLog("moves", "[Adventure/Moves] build initial moves", { pokemon:base?.name||base?.apiName||base?.id, level, final:final.map(m=>m.name||m.id) });
    return final.map(m=>({...normalizeMove(m), pp:m.maxPp, maxPp:m.maxPp}));
  }
  function buildAdventureWildMovesForLevel(base, floor=adventure.stage, level=5){
    const early=Number(floor||1)<=10;
    let moves=getAdventureLevelUpMovesForLevel(base, level, {floor, earlyFloor:early});
    const cap=early ? 3 : 4;
    moves=moves.slice(-cap);
    if(!moves.length) moves=buildAdventureWeakFallbackMovesForPokemon(base, level, {floor, earlyFloor:early});
    adventureDebugLog("moves", "[Adventure/Moves] final move set", { pokemon:base?.name||base?.apiName||base?.id, level, floor, moves:moves.map(m=>({name:m.name||m.id, power:m.power, learnLevel:m.learnLevel, fallback:!!m.fallback})) });
    return moves.map(m=>({...normalizeMove(m), pp:m.maxPp, maxPp:m.maxPp}));
  }
  function levelupMovesFor(base, level){
    return getAdventureLevelUpMovesForLevel(base, level, {floor:adventure.stage, earlyFloor:Number(adventure.stage||1)<=10});
  }
  function stageMoveKey(stage){ const s=Number(stage||1); if(s<=10) return "early"; if(s<=30) return "mid"; if(s<=60) return "high"; return "late"; }
  function configuredMovesFor(base, level, stage, mode){
    const cfg=adventureMoveConfigFor(base);
    if(!cfg) return [];
    if(mode==="starter") return uniqueAdventureMoves(cfg.starterMoves || []);
    const key=stageMoveKey(stage);
    const byStage=cfg.wildMovesByStage?.[key] || cfg.wildMovesByStage?.mid || [];
    return uniqueAdventureMoves(byStage);
  }

  function candidateWeakMoves(base, level=5){
    const merged=[]; const seen=new Set();
    const early=Number(adventure.stage||1)<=10;
    const pushMove=(move, source="level-up")=>{
      const m=resolveMoveByName(move?.id||move?.name||move?.apiName||move) || move;
      if(!m || seen.has(m.id||m.name)) return;
      if(isBlockedAdventureMove(m) || isEarlyExcludedAdventureMove(m)) return;
      if(early && isAdventureEarlyFloorMoveBlocked(m, adventure.stage||1)) return;
      if(source==="level-up" && !validateMoveForPokemon(base, m, level, {allowFallback:false})) return;
      if(source==="fallback" && !isSafeFallbackMoveForPokemon(m, base)) return;
      seen.add(m.id||m.name); merged.push(normalizeMove(m));
    };
    getAdventureLevelUpMovesForLevel(base, level, {floor:adventure.stage||1, earlyFloor:early}).forEach(m=>pushMove(m, "level-up"));
    if(!merged.length) safeFallbackMoveIdsForPokemon(base).map(id=>adventure.moveMap[id]).filter(Boolean).forEach(m=>pushMove(m, "fallback"));
    return merged.slice(0, early ? 3 : 4).map(m=>({...m, pp:m.maxPp, maxPp:m.maxPp}));
  }
  function baseStatsForPokemon(baseOrMon){
    const keys=[baseOrMon?.apiName, baseOrMon?.name, String(baseOrMon?.id||"")].filter(Boolean);
    for(const key of keys){
      const found=adventure.baseStats?.[key];
      if(found) return found;
    }
    const s=baseOrMon?.baseStats || baseOrMon?.stats || {};
    return { hp:Number(s.hp || s.baseHp || 60), attack:Number(s.attack || s.baseAttack || 60), defense:Number(s.defense || s.baseDefense || 60), speed:Number(s.speed || s.baseSpeed || 60) };
  }
  function calculateAdventureStatsFromBase(baseStats, level){
    const iv=15, ev=0;
    const hp=Math.floor(((Number(baseStats.hp||60)*2 + iv + Math.floor(ev/4))*level)/100) + level + 10;
    const attack=Math.floor(((Number(baseStats.attack||60)*2 + iv + Math.floor(ev/4))*level)/100) + 5;
    const defense=Math.floor(((Number(baseStats.defense||60)*2 + iv + Math.floor(ev/4))*level)/100) + 5;
    const speed=Math.floor(((Number(baseStats.speed||60)*2 + iv + Math.floor(ev/4))*level)/100) + 5;
    return { hp:Math.max(12,hp), maxHp:Math.max(12,hp), attack:Math.max(5,attack), defense:Math.max(5,defense), speed:Math.max(5,speed) };
  }
  function getAdventureEarlyHpBonus(stage){ const s=Number(stage||1); if(s<=10) return 15; if(s<=20) return 10; if(s<=30) return 5; return 0; }
  function applyAdventureEarlyHpToStats(stats, stage, side){
    const out={...stats};
    const bonus=getAdventureEarlyHpBonus(stage);
    out.maxHp=Number(out.maxHp||out.hp||1)+bonus;
    out.hp=out.maxHp;
    out.adventureEarlyHpBonus=bonus;
    if(side==="starter" && out.maxHp<25){ out.adventureEarlyHpBonus += (25-out.maxHp); out.maxHp=25; out.hp=25; }
    if(side==="enemy" && Number(stage||1)<=10 && out.maxHp<20){ out.adventureEarlyHpBonus += (20-out.maxHp); out.maxHp=20; out.hp=20; }
    return out;
  }
  function normalizeAdventureExpBalance(input){
    const src = input && typeof input === "object" ? input : {};
    const clamp=(v,min,max,fallback)=>{ const n=Number(v); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; };
    const normalizeMap=(map, fallback)=>{
      const out={}; const srcMap = map && typeof map === "object" ? map : {};
      for(const key of ["early","mid","high","late"]){ out[key]=clamp(srcMap[key],0.5,5, fallback[key]); }
      return out;
    };
    return {
      nextLevelExpFactor: clamp(src.nextLevelExpFactor, 2.5, 8, 4.0),
      battleExpMultiplierByStage: normalizeMap(src.battleExpMultiplierByStage, {early:2.2, mid:1.9, high:1.5, late:1.25}),
      captureExpMultiplierByStage: normalizeMap(src.captureExpMultiplierByStage, {early:2.0, mid:1.7, high:1.35, late:1.15}),
      bossExpMultiplier: clamp(src.bossExpMultiplier, 1.0, 3.0, 1.35),
      minBattleExp: Math.round(clamp(src.minBattleExp, 1, 200, 35)),
      minCaptureExp: Math.round(clamp(src.minCaptureExp, 1, 200, 30)),
      expShareBaseBenchRate: clamp(src.expShareBaseBenchRate, 0.1, 0.95, 0.45)
    };
  }
  function adventureExpStageBand(stage=adventure.stage){ const s=Number(stage||1); if(s<=10) return "early"; if(s<=30) return "mid"; if(s<=60) return "high"; return "late"; }
  function getAdventureExpToNext(level){
    const lv=Number(level||5);
    const factor=Number(adventure.expBalance?.nextLevelExpFactor ?? 4.0);
    return Math.max(15, Math.floor(lv * lv * factor));
  }

  function createAdventurePokemon(base, level=5, side="player"){
    const stats = calculateAdventureStatsFromBase(baseStatsForPokemon(base), level);
    const floor=Number(adventure.stage||1);
    let moves = side==="enemy" ? buildAdventureWildMovesForLevel(base, floor, level) : buildAdventureInitialMovesForPokemon(base, {level, floor});
    moves = sanitizeIllegalMovesForPokemon(base, moves, level);
    if(!moves.length) moves = buildAdventureWeakFallbackMovesForPokemon(base, level, {floor, earlyFloor:floor<=10});
    const normalizedStats = applyAdventureEarlyHpToStats(stats, adventure.stage || 1, side);
    return {
      id:base.id, apiName:base.apiName, name:base.name, level,
      types:[...(base.types||["normal"])], baseStats:baseStatsForPokemon(base), baseExperience: adventure.expTable?.[base.apiName]?.baseExperience || adventure.expTable?.[base.name]?.baseExperience || adventure.expTable?.[base.id]?.baseExperience || Math.max(35, Math.round(statTotal(base)/3)),
      exp:0, expToNext:getAdventureExpToNext(level), stats:normalizedStats, hp:normalizedStats.maxHp, maxHp:normalizedStats.maxHp, adventureEarlyHpBonus:Number(normalizedStats.adventureEarlyHpBonus||0),
      statStages:{attack:0, defense:0, speed:0}, status:null, volatile:{}, fainted:false,
      frontSprite:base.frontSprite, backSprite:base.backSprite || base.frontSprite, spriteScale:base.spriteScale || 1,
      moves:moves.map(normalizeMove)
    };
  }
  function adventurePokemonInstanceId(mon){
    if(!mon) return null;
    if(!mon.instanceId) mon.instanceId = `${mon.id||mon.name}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    return mon.instanceId;
  }
  function recordAdventureHallOfFamePokemon(mon, extra={}){
    if(!mon) return;
    const id=adventurePokemonInstanceId(mon);
    adventure.hallOfFameRoster=adventure.hallOfFameRoster||[];
    const entry={
      instanceId:id,
      species:mon.name,
      nickname:mon.nickname||mon.name,
      level:Number(mon.level||1),
      spriteFront:mon.frontSprite||mon.backSprite||"",
      types:[...(mon.types||[])],
      status:mon.status || (mon.fainted?"fainted":"normal"),
      fainted:!!mon.fainted || getAdventurePokemonHp(mon)<=0,
      caughtAtStage:Number(extra.caughtAtStage || mon.caughtAtStage || adventure.stage || 1),
      lastKnownLevel:Number(mon.level||1),
      wasActive:!!extra.wasActive || adventure.team?.[adventure.activeIndex||0]===mon,
      starter:!!extra.starter || !!mon.starter
    };
    const idx=adventure.hallOfFameRoster.findIndex(x=>x.instanceId===id);
    if(idx>=0) adventure.hallOfFameRoster[idx]={...adventure.hallOfFameRoster[idx], ...entry};
    else adventure.hallOfFameRoster.push(entry);
  }
  function syncAdventureHallOfFameRoster(){
    (adventure.team||[]).forEach((p,idx)=>recordAdventureHallOfFamePokemon(p,{wasActive:idx===Number(adventure.activeIndex||0)}));
  }
  function showAdventureHallOfFameOverlay(){
    syncAdventureHallOfFameRoster();
    const overlay=document.getElementById("overlay");
    if(!overlay) return showAdventureFailOverlay("모험 성공", "100층을 돌파했습니다!");
    const roster=(adventure.hallOfFameRoster&&adventure.hallOfFameRoster.length?adventure.hallOfFameRoster:(adventure.team||[]).map(p=>({species:p.name,nickname:p.name,level:p.level,spriteFront:p.frontSprite,types:p.types||[],fainted:p.fainted})))
      .slice().sort((a,b)=>(b.starter?1:0)-(a.starter?1:0) || Number(a.caughtAtStage||1)-Number(b.caughtAtStage||1));
    const cards=roster.map((p,i)=>`<div class="hof-card" style="animation-delay:${Math.min(i*90,700)}ms"><div class="hof-sprite-wrap"><img src="${escapeHtml(p.spriteFront||"")}" onerror="this.style.display='none'" /></div><b>${escapeHtml(p.nickname||p.species||"포켓몬")}</b><span>Lv.${Number(p.level||p.lastKnownLevel||1)}</span><div class="hof-types">${(p.types||[]).map(t=>`<em>${escapeHtml(typeKo(t))}</em>`).join("")}${p.fainted?`<em class="fainted">기절</em>`:""}</div></div>`).join("");
    overlay.innerHTML=`<div class="modal adventure-hof-box"><h2>모험 성공</h2><h3>명예의 전당</h3><p>100층을 돌파했습니다! 이번 모험을 함께한 포켓몬들입니다.</p><div class="hof-grid">${cards}</div><div class="adventure-fail-actions"><button onclick="startAdventureMode()">다시하기</button><button onclick="startAdventureMode()">새 모험 시작</button><button onclick="adventureReturnLobby()">로비로 돌아가기</button></div></div>`;
    overlay.classList.add("show");
  }
  function moveTierIdsForStage(stage){
    const s=Number(stage||1);
    const early=[...(adventure.moveTiers?.early||[])];
    const mid=[...(adventure.moveTiers?.mid||[])];
    const high=["wingAttack","waterPulse","flameWheel","aerialAce","shadowPunch","drainPunch","rockSlide","crunch","swift","megaDrain","shockWave","mudBomb","bulletSeed","doubleKick","metalClaw","bite","thunderWave","hypnosis","poisonPowder","screech","agility"];
    const rare=["flamethrower","thunderbolt","iceBeam","surf","earthquake","shadowBall","psychic","dragonPulse"];
    if(s<=10) return {early, mid:[], high:[], rare:[]};
    if(s<=20) return {early, mid, high:[], rare:[]};
    if(s<=40) return {early, mid, high, rare:[]};
    return {early, mid, high, rare:s>=61?rare:[]};
  }
  function resolveMoveByName(idOrName){
    if(!idOrName) return null;
    if(adventure.moveMap?.[idOrName]) return adventure.moveMap[idOrName];
    const raw=String(idOrName).toLowerCase();
    return Object.values(adventure.moveMap||{}).find(m=>String(m.id||"").toLowerCase()===raw || String(m.name||"").toLowerCase()===raw || String(m.apiName||"").toLowerCase()===raw) || null;
  }
  function movesFromIds(ids){ return (ids||[]).map(resolveMoveByName).filter(Boolean).filter(m=>!isBlockedAdventureMove(m)); }
  function adventureLearnsetRecordForPokemon(mon){
    const keys=[mon?.name, mon?.apiName, String(mon?.id||"")].filter(Boolean);
    for(const k of keys){
      if(adventure.fullLearnsets?.[k]) return adventure.fullLearnsets[k];
    }
    return null;
  }
  function adventureAllowedRuleForPokemon(mon){
    const keys=[mon?.name, mon?.apiName, String(mon?.id||"")].filter(Boolean);
    for(const k of keys){
      if(adventure.pokemonAllowedMoves?.[k]) return adventure.pokemonAllowedMoves[k];
    }
    return {};
  }
  function adventureAllowedMoveNamesForPokemon(mon, level=100){
    const rule=adventureAllowedRuleForPokemon(mon);
    const full=adventureLearnsetRecordForPokemon(mon) || {};
    const learn=(adventure.levelupLearnsets?.[mon?.name] || adventure.levelupLearnsets?.[mon?.apiName] || adventure.levelupLearnsets?.[String(mon?.id||"")] || [])
      .filter(x=>Number(x.level||0)<=Number(level||100)).map(x=>x.move);
    const fullLevel=(full.levelUp||[]).map(x=>typeof x==="string"?x:x.move).filter(Boolean).filter((_,i)=>true);
    const fullMachine=(full.machine||[]).map(x=>typeof x==="string"?x:x.move).filter(Boolean);
    const fullTutor=(full.tutor||[]).map(x=>typeof x==="string"?x:x.move).filter(Boolean);
    const fullAllowed=(full.allowedAll||[]).map(x=>typeof x==="string"?x:x.move).filter(Boolean);
    const apiLearn=(mon?.availableMoveNames||[]);
    const current=(mon?.moves||[]).map(m=>m.name||m.id||m.apiName);
    return [...new Set([...(rule.levelUp||[]), ...(rule.tm||[]), ...(rule.coverage||[]), ...learn, ...fullLevel, ...fullMachine, ...fullTutor, ...fullAllowed, ...apiLearn, ...current].filter(Boolean))];
  }
  function adventureAllowedMovesForPokemon(mon, level=100){
    return movesFromIds(adventureAllowedMoveNamesForPokemon(mon, level));
  }
  function validateMoveForPokemon(mon, move, level=100, {allowFallback=false}={}){
    if(!move || !mon) return false;
    const allowedRaw=adventureAllowedMoveNamesForPokemon(mon, level);
    const names=allowedRaw.map(adventureMoveKey).filter(Boolean);
    const keys=[move.name, move.id, move.apiName].filter(Boolean).map(adventureMoveKey).filter(Boolean);
    if(keys.some(k=>names.includes(k))) return true;
    const full=adventureLearnsetRecordForPokemon(mon);
    const rule=adventureAllowedRuleForPokemon(mon);
    if(full || Object.keys(rule||{}).length) return false;
    return allowFallback ? isSafeFallbackMoveForPokemon(move, mon) : false;
  }
  function sanitizeIllegalMovesForPokemon(mon, moves, level=100){
    const valid=[]; const seen=new Set();
    const floor=Number(adventure.stage||1);
    const allowedLevelMoves=getAdventureLevelUpMovesForLevel(mon, level, {floor, earlyFloor:floor<=10});
    const allowedKeys=new Set(allowedLevelMoves.flatMap(m=>[m.id,m.name,m.apiName].filter(Boolean).map(adventureMoveKey)));
    for(const m of (moves||[])){
      const move=resolveMoveByName(m?.id||m?.name||m?.apiName) || m;
      if(!move) continue;
      const keys=[move.id,move.name,move.apiName].filter(Boolean).map(adventureMoveKey);
      const key=keys[0];
      if(!key || seen.has(key)) continue;
      if(!keys.some(k=>allowedKeys.has(k))) continue;
      if(isBlockedAdventureMove(move)) continue;
      if(floor<=10 && isAdventureEarlyFloorMoveBlocked(move, floor)) continue;
      seen.add(key);
      valid.push(normalizeMove(move));
      if(valid.length>=4) break;
    }
    if(valid.length) return valid.slice(0,4);
    return buildAdventureWeakFallbackMovesForPokemon(mon, level, {floor, earlyFloor:floor<=10}).slice(0,1).map(normalizeMove);
  }
  function moveFitsPokemon(move, mon){
    if(!move || !mon) return false;
    const types=(mon.types||[]).map(t=>String(t).toLowerCase());
    if(types.includes(String(move.type||"").toLowerCase())) return true;
    if(["normal","status"].includes(String(move.type||"").toLowerCase())) return true;
    if(move.power===0 && ["growl","tailWhip","scaryFace","smokescreen","agility","screech","ironDefense","swordsDance","bulkUp"].includes(move.id)) return true;
    return false;
  }
  function enemyMovesFor(base, level){ return enemyMovesForStage(base, level, adventure.stage||1); }
  function enemyMovesForStage(base, level, stage){
    return buildAdventureWildMovesForLevel(base, stage, level);
  }
  function stageMod(stage){ const s=Math.max(-6,Math.min(6,Number(stage||0))); return s>=0 ? (2+s)/2 : 2/(2+Math.abs(s)); }
  function effectiveSpeed(mon){ return (mon.stats?.speed||1) * stageMod(mon.statStages?.speed||0); }
  function currentPlayer(){ return currentState?.players?.p1; }
  function currentEnemyPlayer(){ return currentState?.players?.p2; }
  function playerMon(){ return currentPlayer()?.team?.[currentPlayer()?.activeIndex||0]; }
  function enemyMon(){ return currentEnemyPlayer()?.team?.[0]; }

  function renderAdventureEntryCard(){
    return `<article class="room-card adventure-room-card" data-theme="adventure">
      <div class="room-art"><div class="arena-tag">ADVENTURE</div><div class="room-icon">🧭</div></div>
      <div class="room-body">
        <div class="room-name">푸끼몬 모험 모드</div>
        <div><span class="room-status select">1인 도전</span></div>
        <div class="room-meta">
          <div>1층부터 100층까지 이어지는 생존 배틀</div>
          <div>스타터 1마리 선택 · 포획으로 팀 확장</div>
          <div>HP/PP 유지 · 패배 시 모험 종료</div>
          <div>기존 배틀 UI/이펙트 기반</div>
        </div>
      </div>
      <div class="room-actions">
        <button class="room-enter" onclick="startAdventureMode()">모험 모드</button>
      </div>
    </article>`;
  }

  function patchLobbyRenderer(){
    if(patchLobbyRenderer.done) return;
    patchLobbyRenderer.done = true;
    const prevRenderLobby = window.renderLobby || renderLobby;
    window.renderLobby = function(lobby){
      prevRenderLobby(lobby);
      const grid=document.getElementById("roomGrid");
      if(grid && !grid.querySelector(".adventure-room-card")) grid.insertAdjacentHTML("afterbegin", renderAdventureEntryCard());
    };
  }

  async function startAdventureMode(){
    const startupStartedAt = performance.now();
    let afterLoadAt = startupStartedAt;
    let afterStarterAt = startupStartedAt;
    try{
      installOverrides();
      injectAdventureStyle();
      document.body.classList.add("adventure-starting");
      const roleTextLoading=document.getElementById("roleText");
      if(roleTextLoading) roleTextLoading.textContent="모험 준비 중...";
      await loadAdventureData();
      const bgStartedAt = performance.now();
      await preloadImageQuietly(adventureBattleBackgroundForStage(1));
      adventure.__lastCurrentBattleBackgroundLoadMs = Math.round(performance.now() - bgStartedAt);
      afterLoadAt = performance.now();
      adventure.active = true;
      adventure.stage = 1;
      adventure.bag = {...(adventure.config?.startingBag||{pookiBall:5,potion:2,ether:1})};
      adventure.adventureEquipment = {};
      adventure.expShareLevel = 0;
      adventure.team = [];
      adventure.enemy = null;
      adventure.activeIndex = 0;
      adventure.pendingReward = false;
      adventure.rewardApplying = false;
      adventure.pendingCaptured = null;
      adventure.switchMode = null;
      adventure.recentWildIds = [];
      adventure.hallOfFameRoster = [];
      adventure.phase = "starterSelect";
      adventure.log = ["모험이 시작되었습니다."];
      const overlay=document.getElementById("overlay"); if(overlay) overlay.classList.remove("show");
      adventure.selectedStarterId = null;
      adventure.starterCandidates = pickStarterCandidates();
      afterStarterAt = performance.now();
      document.body.classList.add("adventure-mode");
      document.body.classList.remove("adventure-starting");
      scheduleAdventureNearbyBackgroundPreload(1);
      document.getElementById("lobbyScreen").style.display = "none";
      document.getElementById("gameScreen").classList.remove("hidden");
      myRole = "p1";
      window.currentRoomId = "adventure";
      renderAdventureHeader("스타터 선택", "시작 포켓몬을 선택하세요.");
      renderAdventureSelect();
      const doneAt = performance.now();
      console.info?.("[Adventure/Startup] timing", {
        rosterLoadMs: adventure.__lastRosterLoadMs || 0,
        requiredJsonLoadMs: adventure.__lastRequiredJsonLoadMs ?? Math.round(afterLoadAt - startupStartedAt),
        currentBattleBackgroundLoadMs: adventure.__lastCurrentBattleBackgroundLoadMs || 0,
        optionalAssetPreloadMs: adventure.__lastOptionalAssetPreloadMs || 0,
        dataLoadMs: Math.round(afterLoadAt - startupStartedAt),
        starterBuildMs: Math.round(afterStarterAt - afterLoadAt),
        renderMs: Math.round(doneAt - afterStarterAt),
        totalMs: Math.round(doneAt - startupStartedAt),
        cacheHit: !!adventure.__lastDataCacheHit,
        requiredJsonFiles: 33,
        deferredAssetCount: adventure.__lastDeferredAssetCount || 2,
        rosterCount: adventure.pokemon?.length || 0,
        finalStarterCount: adventure.starterCandidates?.length || 0
      });
    }catch(err){
      document.body.classList.remove("adventure-starting");
      console.error("adventure start failed", err);
      alert("모험모드 시작 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
    }
  }

  function renderAdventureHeader(phase, role){
    const title=document.querySelector(".title"); if(title) title.textContent="푸끼몬 챔피언스 온라인";
    const roleText=document.getElementById("roleText"); if(roleText) roleText.textContent="모험 모드 · 기존 UI 클론";
    const roleChip=document.getElementById("roleChip"); if(roleChip) roleChip.textContent="모험가";
    const phaseTextEl=document.getElementById("phaseText"); if(phaseTextEl) phaseTextEl.textContent=phase;
    const timer=document.getElementById("timer"); if(timer) timer.textContent="-";
    const p1=document.getElementById("roomP1Text"); if(p1) p1.textContent="모험가";
    const p2=document.getElementById("roomP2Text"); if(p2) p2.textContent=`${adventure.stage}층 야생`;
    const sp=document.getElementById("roomSpectators"); if(sp) sp.textContent=`다음 보스 ${nextBossFloor()}층`;
    const p1Dot=document.getElementById("roomP1Dot"); if(p1Dot) p1Dot.className="conn-dot on";
    const p2Dot=document.getElementById("roomP2Dot"); if(p2Dot) p2Dot.className="conn-dot on";
    const lobbyBtn=document.querySelector(".top-actions .adventure-return-btn");
    const topActions=document.querySelector(".top-actions");
    if(topActions && !lobbyBtn){ topActions.insertAdjacentHTML("afterbegin", `<button type="button" class="adventure-return-btn" onclick="adventureConfirmReturnLobby()">로비</button>`); }
  }
  function nextBossFloor(){ return Math.min(adventure.maxStage, Math.ceil(adventure.stage / adventure.bossEvery) * adventure.bossEvery); }

  function selectedSlotMarkup(p){
    if(p){
      return `<div class="selected-slot">
        <div class="slot-role">시작 포켓몬</div>
        <img src="${p.frontSprite}" alt="${p.name}" />
        <div>
          <div class="selected-mon-name">${escapeHtml(p.name)}</div>
          <div class="selected-mon-types">${(p.types||[]).map(t=>`<span class="type-pill">${typeKo(t)}</span>`).join("")}</div>
          <div class="selected-mon-meta">Lv.5 · HP ${Math.round((p.stats?.hp||100)*0.42)}</div>
        </div>
      </div>`;
    }
    return `<div class="selected-slot empty">
      <div class="slot-role">시작 포켓몬</div>
      <div class="selected-empty-note">선택된 포켓몬이 없습니다.</div>
    </div>`;
  }
  function candidateCard(p,idx){
    const selected = adventure.selectedStarterId === p.id;
    const moves = candidateWeakMoves(p, 5);
    return `<button class="team-btn ${selected?"selected":""}" onclick="selectAdventureStarter(${p.id})">
      <span class="card-num">${idx+1}</span>
      <img src="${p.frontSprite}" alt="${p.name}" />
      <div class="candidate-name">${escapeHtml(p.name)}</div>
      <div style="text-align:center;">${(p.types||[]).map(t=>`<span class="type-pill">${typeKo(t)}</span>`).join("")}</div>
      <div class="move-list">
        <div>Lv.5</div>
        ${moves.slice(0,4).map(m=>`<div>• ${escapeHtml(m.name)}</div>`).join("")}
      </div>
    </button>`;
  }
  function renderAdventureSelect(){
    const screen=document.getElementById("teamScreen");
    document.getElementById("battleScreen").style.display="none";
    const controls=document.querySelector(".controls"); if(controls) controls.style.display="none";
    screen.classList.add("show");
    const selected = adventure.starterCandidates.find(p=>p.id===adventure.selectedStarterId) || null;
    screen.innerHTML = `<div class="team-layout">
      <div class="team-main">
        <div class="team-head">
          <div>
            <div class="team-title">푸끼몬 모험 모드</div>
            <div class="team-sub">1층 · 다음 보스 ${nextBossFloor()}층 · 스타터 1마리만 선택하세요.</div>
          </div>
          <div class="team-timer">현재 층 <b>1</b>/100</div>
        </div>
        <div class="selected-row adventure-single-row">${selectedSlotMarkup(selected)}</div>
        <div class="candidate-title">랜덤 후보 포켓몬 (${adventure.starterCandidates.length})</div>
        <div class="candidate-grid">${adventure.starterCandidates.length ? adventure.starterCandidates.map(candidateCard).join("") : `<div style="grid-column:1/-1;padding:22px;border:1px solid rgba(248,113,113,.45);border-radius:16px;background:rgba(127,29,29,.18);font-weight:900;color:#fecaca;">스타터 후보를 불러오지 못했습니다. 콘솔 로그와 adventure_starter_pool.json 경로를 확인해주세요.</div>`}</div>
      </div>
      <aside class="side-box">
        <div>
          <div class="side-title">모험 정보</div>
          <div class="side-info">
            현재 층: 1/${adventure.maxStage}층<br/>
            다음 보스: ${nextBossFloor()}층<br/>
            시작 아이템: 푸끼볼 x5 / 상처약 x2 / 에테르 x1
          </div>
        </div>
        <div>
          <div class="side-title">규칙</div>
          <div class="participants">
            <div class="participant-line"><span>시작</span><span class="participant-badge">1마리</span></div>
            <div class="participant-line"><span>성장</span><span class="participant-badge" style="background:#16a34a;">포획으로 팀 확장</span></div>
            <div class="participant-line"><span>자원</span><span class="participant-badge" style="background:#475569;">HP/PP 유지</span></div>
            <div class="participant-line"><span>실패</span><span class="participant-badge" style="background:#dc2626;">패배 시 종료</span></div>
          </div>
        </div>
        <button class="team-submit" ${selected?"":"disabled"} onclick="beginAdventureBattle()">이 포켓몬으로 모험 시작</button>
        <button class="team-submit" style="background:#475569;box-shadow:0 7px 0 #334155;" onclick="adventureReturnLobby()">로비로 돌아가기</button>
        <div class="team-caption">기존 선택창 골격을 사용하는 모험 전용 스타터 선택창입니다.</div>
      </aside>
    </div>`;
  }
  function selectAdventureStarter(id){ adventure.selectedStarterId = id; playGameSfx?.("select"); renderAdventureSelect(); }
  function beginAdventureBattle(){
    const base = adventure.starterCandidates.find(p=>p.id===adventure.selectedStarterId);
    if(!base) return;
    playGameSfx?.("select");
    adventure.team = [createAdventurePokemon(base, 5, "starter")];
    adventure.team[0].starter=true;
    recordAdventureHallOfFamePokemon(adventure.team[0], {starter:true, wasActive:true, caughtAtStage:1});
    adventure.activeIndex = 0;
    localStorage.setItem(ADVENTURE_KEY, JSON.stringify({startedAt:Date.now(), starter:base.id}));
    startAdventureFloor();
  }

  function adventureBattleBackgroundForStage(stage=1){
    const found=ADVENTURE_BATTLE_BACKGROUNDS.find(x=>Number(stage||1)<=Number(x.maxStage||999));
    return found?.url || "/assets/battle-field.png";
  }
  function setAdventureBattleBackground(stage=1){
    const arena=document.querySelector(".arena-stage");
    if(!arena) return;
    const url=adventureBattleBackgroundForStage(stage);
    arena.style.setProperty("--adventure-battle-bg", `url("${url}")`);
    adventureDebugLog("startup", "[Adventure Field] background", {stage, url});
    scheduleAdventureNearbyBackgroundPreload(Number(stage||1));
  }

  function startAdventureFloor(){
    try{
      nextAdventureCaptureToken("start-floor");
      clearAdventureCaptureEffects();
      resetAdventureEnemyVisualState("start-floor-before");
      adventure.pendingReward = false;
      adventure.rewardApplying = false;
      adventure.pendingCaptured = null;
      adventure.playerFaintStarted=false;
      adventure.playerFaintAnimationDone=false;
      adventure.playerFaintResolved=false;
      adventure.failResolved=false;
      adventure.battleResolutionToken=Number(adventure.battleResolutionToken||0)+1;
      adventure.phase = "loadingNext";
      adventure.enemy = null;
      const aliveIndex = firstAliveAdventureIndex();
      if(aliveIndex < 0){
        adventure.phase = "battle";
        handleAdventureDefeat();
        return;
      }
      adventure.activeIndex = aliveIndex;
      let level = adventureEnemyLevel(adventure.stage);
      const enemyBase = pickAdventureWildPokemon(adventure.stage) || shuffle(adventure.pokemon.filter(p=>p.frontSprite&&p.backSprite&&!LEGENDARY_MYTHICAL_IDS.has(Number(p.id))))[0];
      if(!enemyBase){
        throw new Error("adventure wild enemy pool is empty");
      }
      adventure.recentWildIds = [...(adventure.recentWildIds||[]), Number(enemyBase.id)].slice(-5);
      if(enemyBase?.bossMoves?.length){ level = Math.max(level, getAdventurePlayerReferenceLevel() + Number(adventure.bosses?.finalBoss?.levelBonus || 5)); }
      adventure.enemy = createAdventurePokemon(enemyBase, level, "enemy");
      if(enemyBase?.bossMoves?.length){ const bossMoves=movesFromIds(enemyBase.bossMoves); if(bossMoves.length) adventure.enemy.moves=bossMoves.slice(0,4).map(m=>({...normalizeMove(m), pp:m.maxPp, maxPp:m.maxPp})); }
      adventure.phase = "battle";
      currentState = buildAdventureState("ACTION_SELECT");
      visualState = null;
      faintPending = { p1:false, p2:false };
      myRole = "p1";
      window.currentRoomId = "adventure";
      renderAdventureHeader(`${adventure.stage}층 전투`, "행동을 선택하세요.");
      document.getElementById("teamScreen").classList.remove("show");
      document.getElementById("battleScreen").style.display="grid";
      const controls=document.querySelector(".controls"); if(controls) controls.style.display="grid";
      setAdventureBattleBackground(adventure.stage);
      renderBattleView();
      resetAdventureBattleSprites();
      resetAdventureEnemyVisualState("start-floor-after-render");
      clearAdventureCaptureEffects();
      renderAdventureButtons();
      renderAdventureLogs();
      renderAdventureBag();
      setMessage(enemyBase?.bossIntroMessage || `${adventure.stage}층 야생 ${adventure.enemy.name}이 나타났다!`, false);
      syncAdventureHallOfFameRoster();
      playGameSfx?.("start");
    }catch(err){
      console.error("startAdventureFloor failed", err);
      adventure.phase = "reward";
      adventure.pendingReward = true;
      adventure.log.push(`다음 야생 포켓몬 생성 실패: ${err.message || err}`);
      if(currentState) currentState.logs=[...adventure.log];
      setMessage("다음 층 생성 중 오류가 발생했습니다. 보상 상태로 복구합니다.", true);
      renderBattleView(); renderAdventureButtons(); renderAdventureLogs();
    }
  }

  function buildAdventureState(phase){
    return {
      phase, turn: adventure.log.filter(x=>String(x).includes("턴")).length + 1,
      typeKo: {}, logs: [...adventure.log], chatMessages: [], timerEndAt:null,
      roomInfo:{roomName:"모험 모드", p1Connected:true, p2Connected:true, p1Name:"모험가", p2Name:`${adventure.stage}층 야생`, spectatorCount:0},
      players:{
        p1:{connected:true, displayName:"모험가", userId:"모험가", activeIndex:adventure.activeIndex||0, selectedAction:null, team:clone(adventure.team)},
        p2:{connected:true, displayName:`${adventure.stage}층 야생`, userId:"야생", activeIndex:0, selectedAction:null, team:adventure.enemy ? [clone(adventure.enemy)] : []}
      }
    };
  }
  function commitFromCurrentState(){
    const p1=currentState?.players?.p1?.team || [];
    const p2=currentState?.players?.p2?.team?.[0];
    adventure.team = clone(p1);
    adventure.activeIndex = Number(currentState?.players?.p1?.activeIndex || 0);
    adventure.enemy = p2 ? clone(p2) : null;
  }
  function getAdventurePokemonHp(p){ return Number(p?.hp ?? p?.currentHp ?? 0); }

  function getAdventureCanonicalEnemy(reason="unknown"){
    const stateEnemy=currentState?.players?.p2?.team?.[0] || null;
    const adventureEnemy=adventure?.enemy || null;
    const enemy=stateEnemy || adventureEnemy || null;
    if(enemy){
      console.debug?.("[Adventure/HP] canonical enemy selected", {
        reason,
        source: stateEnemy ? "currentState.players.p2.team[0]" : "adventure.enemy",
        enemyName: enemy.name || enemy.koreanName || enemy.species,
        hp: enemy.hp ?? enemy.currentHp,
        maxHp: enemy.maxHp
      });
    }
    return enemy;
  }

  function getAdventureRenderedEnemySnapshot(){
    try{
      if(typeof visualActivePokemon === "function") return visualActivePokemon("p2") || null;
    }catch(_){ }
    return currentState?.players?.p2?.team?.[0] || null;
  }

  function syncAdventureCanonicalEnemyToState(enemy, reason="unknown"){
    if(!enemy) return false;
    if(currentState?.players?.p2?.team?.length){
      currentState.players.p2.team[0]=enemy;
    }
    adventure.enemy=clone(enemy);
    console.debug?.("[Adventure/HP] canonical enemy synced", {
      reason,
      enemyName: enemy.name || enemy.koreanName || enemy.species,
      hp: enemy.hp,
      maxHp: enemy.maxHp,
      fainted: enemy.fainted
    });
    return true;
  }

  function sanitizeAdventureCanonicalEnemyHp(reason="unknown"){
    const enemy=getAdventureCanonicalEnemy(reason);
    if(!enemy){ console.warn?.("[Adventure/HP] canonical enemy missing", {reason, phase:adventure.phase}); return false; }
    const maxHp=Number(enemy.maxHp || enemy.stats?.hp || enemy.hp);
    if(!Number.isFinite(maxHp) || maxHp<=0){
      console.warn?.("[Adventure/HP] canonical enemy maxHp invalid", {reason, enemyName:enemy.name, maxHp});
      return false;
    }
    const before=enemy.hp ?? enemy.currentHp;
    const hp=Number(enemy.hp ?? enemy.currentHp);
    if(!Number.isFinite(hp)){
      console.warn?.("[Adventure/HP] canonical enemy currentHp invalid", {reason, enemyName:enemy.name, before, maxHp});
      return false;
    }
    enemy.maxHp=maxHp;
    enemy.hp=Math.max(0, Math.min(maxHp, Math.round(hp)));
    enemy.currentHp=enemy.hp;
    enemy.fainted=enemy.hp<=0;
    syncAdventureCanonicalEnemyToState(enemy, reason);
    if(Number(before)!==Number(enemy.hp)){
      console.info?.("[Adventure/HP] canonical enemy hp clamped", {reason, enemyName:enemy.name, before, after:enemy.hp, maxHp});
    }
    return true;
  }

  function assertAdventureEnemyHpConsistency(reason="unknown"){
    const canonical=getAdventureCanonicalEnemy(reason);
    const rendered=getAdventureRenderedEnemySnapshot();
    const adv=adventure?.enemy || null;
    const stateEnemy=currentState?.players?.p2?.team?.[0] || null;
    if(!canonical) return false;
    const snap={
      reason,
      phase:adventure.phase,
      currentPhase:currentState?.phase,
      floor:adventure.stage,
      canonicalName:canonical.name || canonical.koreanName || canonical.species,
      canonicalHp:canonical.hp ?? canonical.currentHp,
      canonicalMaxHp:canonical.maxHp,
      stateEnemyHp:stateEnemy?.hp ?? stateEnemy?.currentHp,
      adventureEnemyHp:adv?.hp ?? adv?.currentHp,
      renderEnemyHp:rendered?.hp ?? rendered?.currentHp,
      enemyFaintResolved:adventure.enemyFaintResolved,
      enemyFaintAnimationDone:adventure.enemyFaintAnimationDone,
      battleRewardClaimed:adventure.battleRewardClaimed,
      pendingReward:adventure.pendingReward
    };
    const values=[snap.canonicalHp, snap.stateEnemyHp, snap.adventureEnemyHp].filter(v=>v!=null).map(Number).filter(Number.isFinite);
    const mismatch=values.length>1 && values.some(v=>v!==values[0]);
    if(mismatch) console.warn?.("[Adventure/HP] enemy hp source mismatch", snap);
    return !mismatch;
  }

  function isAdventureCanonicalEnemyDefeated(reason="unknown"){
    if(!sanitizeAdventureCanonicalEnemyHp(reason)) return false;
    const enemy=getAdventureCanonicalEnemy(reason);
    const hp=Number(enemy?.hp ?? enemy?.currentHp);
    return Number.isFinite(hp) && hp<=0;
  }

  function canEnterAdventureRewardFromCanonicalHp(reason="unknown"){
    const enemy=getAdventureCanonicalEnemy(reason);
    if(!enemy){ console.warn?.("[Adventure/Reward] blocked: no canonical enemy", {reason, phase:adventure.phase}); return false; }
    if(!sanitizeAdventureCanonicalEnemyHp(reason)){
      console.warn?.("[Adventure/Reward] blocked: enemy hp sanitize failed", {reason, phase:adventure.phase});
      return false;
    }
    const hp=Number(enemy.hp ?? enemy.currentHp);
    const maxHp=Number(enemy.maxHp);
    if(!Number.isFinite(hp) || !Number.isFinite(maxHp)){
      console.warn?.("[Adventure/Reward] blocked: invalid canonical hp", {reason, hp, maxHp});
      return false;
    }
    if(hp>0){
      console.warn?.("[Adventure/Reward] blocked: canonical enemy still alive", {
        reason,
        enemyName:enemy.name || enemy.koreanName || enemy.species,
        hp,
        maxHp,
        phase:adventure.phase,
        currentPhase:currentState?.phase,
        enemyFaintResolved:adventure.enemyFaintResolved,
        enemyFaintAnimationDone:adventure.enemyFaintAnimationDone,
        battleRewardClaimed:adventure.battleRewardClaimed
      });
      enemy.fainted=false;
      adventure.enemyFaintResolved=false;
      adventure.enemyFaintAnimationDone=false;
      adventure.pendingReward=false;
      syncAdventureCanonicalEnemyToState(enemy, `${reason}:alive-block`);
      return false;
    }
    console.info?.("[Adventure/Reward] canonical hp revalidated", {reason, enemyName:enemy.name, hp, maxHp});
    return true;
  }

  function recoverAdventureEnemyAliveFlow(reason="unknown"){
    const enemy=getAdventureCanonicalEnemy(reason);
    if(enemy){ enemy.fainted=false; syncAdventureCanonicalEnemyToState(enemy, `${reason}:recover`); }
    adventure.pendingReward=false;
    adventure.rewardApplying=false;
    if(adventure.phase!=="defeat") adventure.phase="battle";
    if(currentState) currentState.phase="ACTION_SELECT";
    console.warn?.("[Adventure/Recovery] enemy alive, returning to battle flow", {
      reason,
      enemyName:enemy?.name,
      hp:enemy?.hp,
      maxHp:enemy?.maxHp,
      phase:adventure.phase
    });
    renderAdventureHeader?.(`${adventure.stage}층 전투`, "행동을 선택하세요.");
    renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
    return false;
  }
  function normalizeAdventureStatus(status){
    const raw=String(status||"").trim().toLowerCase();
    if(!raw || raw==="normal" || raw==="none" || raw==="null") return null;
    if(["paralysis","paralyzed","para","마비"].includes(raw)) return "paralyze";
    if(["asleep","slp","수면","sleeping"].includes(raw)) return "sleep";
    if(["psn","poisoned","독"].includes(raw)) return "poison";
    if(["brn","burned","화상"].includes(raw)) return "burn";
    return raw;
  }
  function statusKo(status){ const key=normalizeAdventureStatus(status); return key ? (STATUS_KO[key]||key) : "정상"; }
  function setAdventureStatus(mon, status, logs, events, targetKey){
    if(!mon) return false;
    const key=normalizeAdventureStatus(status);
    if(!key) return false;
    if(normalizeAdventureStatus(mon.status)) return false;
    mon.status=key;
    mon.volatile=mon.volatile||{};
    if(key==="sleep") mon.volatile.sleepTurns = Math.max(1, Number(mon.volatile.sleepTurns||0) || (2 + Math.floor(Math.random()*2)));
    if(logs) logs.push(`${mon.name}은/는 ${statusKo(key)} 상태가 되었다!`);
    if(events && targetKey) events.push({id:advEventId(), type:"status", target:targetKey, name:mon.name, status:key});
    return true;
  }
  function clearAdventureStatus(mon){ if(mon){ mon.status=null; if(mon.volatile) delete mon.volatile.sleepTurns; } }
  function canAdventureAct(mon, key, events, logs){
    const status=normalizeAdventureStatus(mon?.status);
    if(!status || !mon || mon.fainted || getAdventurePokemonHp(mon)<=0) return true;
    mon.status=status;
    mon.volatile=mon.volatile||{};
    if(status==="sleep"){
      let turns=Number(mon.volatile.sleepTurns||0);
      if(turns<=0) turns=2;
      logs.push(`${mon.name}은/는 잠들어 있어서 움직일 수 없다!`);
      events.push({id:advEventId(), type:"message", text:`${mon.name}은/는 잠들어 있다!`});
      turns-=1;
      if(turns<=0){ clearAdventureStatus(mon); logs.push(`${mon.name}이/가 잠에서 깨어났다!`); }
      else mon.volatile.sleepTurns=turns;
      return false;
    }
    if(status==="paralyze" && Math.random()<0.25){
      logs.push(`${mon.name}은/는 몸이 저려 움직일 수 없다!`);
      events.push({id:advEventId(), type:"message", text:`${mon.name}은/는 몸이 저려 움직일 수 없다!`});
      return false;
    }
    return true;
  }
  function applyAdventureEndTurnStatus(state, events, logs){
    const pairs=[{key:"p1", mon:state?.players?.p1?.team?.[state?.players?.p1?.activeIndex||0]}, {key:"p2", mon:state?.players?.p2?.team?.[0]}];
    for(const {key,mon} of pairs){
      if(!mon || mon.fainted || getAdventurePokemonHp(mon)<=0) continue;
      const status=normalizeAdventureStatus(mon.status);
      if(status!=="poison" && status!=="burn") continue;
      mon.status=status;
      const ratio=status==="poison" ? 1/8 : 1/16;
      const dmg=Math.max(1, Math.floor(Number(mon.maxHp||1)*ratio));
      mon.hp=Math.max(0, Number(mon.hp||0)-dmg);
      logs.push(`${mon.name}은/는 ${statusKo(status)} 피해로 ${dmg} 피해를 입었다!`);
      events.push({id:advEventId(), type:"damage", attacker:key, defender:key, amount:dmg, moveType:status, moveName:statusKo(status), effectiveness:1, hp:mon.hp, maxHp:mon.maxHp, defenderName:mon.name});
      if(mon.hp<=0){ mon.fainted=true; logs.push(`${mon.name}이 쓰러졌다!`); events.push({id:advEventId(), type:"faint", target:key, name:mon.name}); }
    }
  }
  function getAliveAdventureTeam(){ return (adventure.team||[]).map((p,idx)=>({p,idx})).filter(x=>x.p && !x.p.fainted && getAdventurePokemonHp(x.p)>0); }
  function firstAliveAdventureIndex(){
    const current = adventure.team?.[adventure.activeIndex||0];
    if(current && !current.fainted && getAdventurePokemonHp(current)>0) return adventure.activeIndex||0;
    const alive=getAliveAdventureTeam()[0];
    return alive ? alive.idx : -1;
  }

  function renderAdventureButtons(){
    const buttons=document.getElementById("buttons");
    if(!buttons) return;
    buttons.classList.remove("adventure-reward-mode");
    const mine = playerMon();
    const enemy = enemyMon();
    if(adventure.phase === "defeat" || adventure.failResolved || currentState?.phase==="GAME_OVER"){ buttons.innerHTML=`<div class="control-title">모험 종료</div>`; return; }
    if(adventure.phase === "playerFainting"){ buttons.innerHTML=`<div class="control-title">포켓몬이 쓰러지는 중입니다...</div>`; return; }
    if(adventure.phase === "switch"){ renderAdventureSwitchPrompt(); return; }
    if(adventure.phase === "teamReplace"){ renderAdventureTeamReplacePrompt(); return; }
    if(adventure.phase === "itemTarget"){ renderAdventureItemTargetSelect(); return; }
    if(adventure.phase === "specialEvolutionChoice"){ renderAdventureSpecialEvolutionChoice(); return; }
    if(adventure.phase === "learnMove"){ renderAdventureLevelMovePrompt(); return; }
    if(adventure.phase === "learnForget"){ renderAdventureLevelMoveForgetPrompt(); return; }
    if(adventure.phase === "evolving"){ buttons.innerHTML=`<div class="control-title">진화가 진행 중입니다...</div>`; return; }
    if(adventure.phase === "tmSelect"){ renderAdventureTmTargetSelect(); return; }
    if(adventure.phase === "tmForget"){ renderAdventureTmForgetSelect(); return; }
    if(adventure.pendingReward){ renderAdventureRewards(); return; }
    if(adventure.rewardApplying || adventure.phase === "loadingNext" || adventure.phase === "applyingReward"){ buttons.innerHTML=`<div class="control-title">다음 층을 준비하는 중입니다.</div>`; return; }
    if(!mine || !enemy){ buttons.innerHTML=`<div class="control-title">모험 배틀 데이터를 준비하는 중입니다.</div>`; return; }
    if(animationBusy){ buttons.innerHTML=`<div class="control-title">배틀 연출 중입니다.</div>`; return; }
    if(mine.fainted || getAdventurePokemonHp(mine)<=0){ resolveAdventurePlayerFaintSafely("render-buttons-active-zero"); buttons.innerHTML=`<div class="control-title">포켓몬이 쓰러졌습니다...</div>`; return; }
    if(currentState?.phase==="GAME_OVER"){ buttons.innerHTML=`<div class="control-title">모험 종료</div>`; return; }
    const help=document.getElementById("moveHelp"); if(help) help.innerHTML = buildMoveHelp(mine.moves[hoveredMoveIndex] || mine.moves[0], enemy);
    const moveButtons = (mine.moves||[]).map((m,idx)=>{
      const mult=battleEffectiveness(m.type, enemy?.types||[]);
      const cls=moveButtonClass(m,mult);
      const label=m.power>0 ? effectText(mult) : "변화기";
      const noPp=Number.isFinite(m.pp)&&m.pp<=0;
      return `<button class="move-btn ${cls}" ${noPp?"disabled":""} onclick="selectMove(${idx})" onmouseenter="updateMoveHelp(${idx})" onfocus="updateMoveHelp(${idx})">${escapeHtml(m.name)}<span class="meta">${typeKo(m.type)} / ${m.power>0?"위력 "+m.power:"변화기"} / 명중 ${m.accuracy} / ${label} / ${movePpText(m)}</span></button>`;
    }).join("");
    const canSwitch = getAliveAdventureTeam().some(x=>x.idx !== (currentPlayer()?.activeIndex||0));
    const switchButton = `<button class="move-btn eff-neutral" ${canSwitch?"":"disabled"} onclick="adventureOpenSwitch()">교체<span class="meta">${canSwitch?"살아 있는 포켓몬으로 교체 · 턴 소비":"교체 가능한 포켓몬 없음"}</span></button>`;
    const captureButton = `<button class="move-btn eff-neutral" onclick="adventureQuickCapture()">포획: 푸끼볼<span class="meta">보유 ${adventure.bag.pookiBall||0}개 · 실패 시 상대 턴 진행</span></button>`;
    buttons.innerHTML = `<div class="control-title">${mine.name}의 행동 선택 · ${adventure.stage}층</div>${moveButtons}${switchButton}${captureButton}`;
    renderAdventureBag();
  }
  function adventureUpdateMoveHelp(idx){
    hoveredMoveIndex=idx;
    const help=document.getElementById("moveHelp");
    if(help) help.innerHTML=buildMoveHelp((playerMon()?.moves||[])[idx], enemyMon());
  }
  function renderAdventureLogs(){
    const logs=document.getElementById("logs");
    if(!logs) return;
    const recent=(currentState?.logs || adventure.log || []).slice(-8);
    logs.innerHTML=recent.map(line=>`<div style="margin-bottom:6px;">• ${escapeHtml(line)}</div>`).join("");
    logs.scrollTop=logs.scrollHeight;
    renderAdventureBag();
  }
  function renderAdventureBag(){
    const panel=document.getElementById("battleChatPanel");
    if(!panel || !adventure.active) return;
    panel.classList.add("adventure-bag-panel");
    const entries = Object.entries(adventure.items||{}).sort((a,b)=>Number(adventure.bag[b[0]]||0)-Number(adventure.bag[a[0]]||0));
    const owned = entries.filter(([key])=>Number(adventure.bag[key]||0)>0);
    const empty = entries.filter(([key])=>Number(adventure.bag[key]||0)<=0);
    const makeRow=([key,item],emptyRow=false)=>{ const count=Number(adventure.bag[key]||0); const disabled=emptyRow || animationBusy || adventure.pendingReward || adventure.phase==="defeat" || adventure.phase==="playerFainting" || currentState?.phase==="GAME_OVER"; return `<div class="adventure-bag-row ${emptyRow?"empty":""}"><span>${escapeHtml(item.name)} x${count}</span><button ${disabled?"disabled":""} onclick="adventureUseItem('${key}')">사용</button></div>`; };
    const rows = [...owned.map(e=>makeRow(e,false)), ...(owned.length?[]:[`<div class="muted">보유 아이템이 없습니다.</div>`]), `<div class="muted" style="font-size:11px;margin-top:6px;">보유하지 않음</div>`, ...empty.map(e=>makeRow(e,true))].join("");
    panel.innerHTML = `<div class="chat-title">가방</div><div class="adventure-bag-list">${rows}</div>`;
  }
  function rewardDisplayTitle(r){
    if(!r) return "보상";
    if(r.tm){ const m=adventure.moveMap?.[r.tm] || resolveMoveByName(r.tm); return `기술머신: ${m?.name||r.tm}`; }
    if(r.equipment){ const def=equipmentDef(r.equipment); return `${def.name||r.equipment} x${Number(r.amount||1)}`; }
    if(r.item){ const item=adventure.items?.[r.item]; return `${item?.name||r.item} x${Number(r.amount||1)}`; }
    return r.title || r.id || "보상";
  }
  function isForbiddenDirectReward(r){
    if(!r) return true;
    const text=`${r.id||""} ${r.title||""} ${r.desc||""}`.toLowerCase();
    if(r.exp || r.kind==="exp" || r.type==="exp" || r.flatExpReward || r.bonusExpReward || /exp\s*\+|경험치\s*\+/.test(text)) return true;
    const forbiddenItems=new Set(["protein","iron","saponin","speedUp","speedup","carbos"]);
    if(forbiddenItems.has(r.item)) return true;
    if(["단백질","철분","사포닌","스피드업"].some(k=>String(r.title||"").includes(k)||String(r.desc||"").includes(k))) return true;
    return false;
  }
  function rewardStageBand(){ const s=Number(adventure.stage||1); if(s<=10) return "early"; if(s<=30) return "mid"; if(s<=60) return "late"; return "end"; }
  const DEFAULT_ADVENTURE_REWARD_CATEGORY_WEIGHTS={
    early:{heal:30,capture:25,equipment:20,revive:10,growth:10,tm:5},
    mid:{heal:22,capture:18,equipment:22,revive:13,growth:15,tm:10},
    late:{heal:18,capture:12,equipment:28,revive:17,growth:10,tm:15},
    end:{heal:15,capture:8,equipment:30,revive:22,growth:8,tm:17}
  };
  function adventureRewardBandConfig(){
    const band=rewardStageBand();
    return adventure.rewardBalance?.bands?.[band] || {};
  }
  function adventureRewardCategoryScale(kind){
    const band=rewardStageBand();
    const defaults=DEFAULT_ADVENTURE_REWARD_CATEGORY_WEIGHTS[band] || DEFAULT_ADVENTURE_REWARD_CATEGORY_WEIGHTS.end;
    const weights=adventureRewardBandConfig().weights || {};
    const current=Number(weights[kind]);
    const base=Number(defaults[kind] || 1);
    if(!Number.isFinite(current) || current<=0 || !Number.isFinite(base) || base<=0) return 1;
    return Math.max(0.1, Math.min(4, current/base));
  }
  function adventureGrowthRewardWeight(id, fallback){
    const band=rewardStageBand();
    const map={early:"early",mid:"mid",late:"high",end:"late"};
    const stageKey=map[band] || band;
    const cfg=adventure.rewardBalance?.growthRewards?.[id]?.weightByStage || {};
    let value=Number(cfg[stageKey] ?? cfg[band] ?? fallback);
    if(!Number.isFinite(value) || value<0) value=Number(fallback||1);
    const bossMul=Number(cfg.bossMultiplier || 1);
    if(Number(adventure.stage||1)%10===0 && Number.isFinite(bossMul) && bossMul>0) value*=bossMul;
    return Math.max(1, Math.round(value));
  }
  function createCoreRewardPool(){
    const s=Number(adventure.stage||1);
    const pool=[];
    const add=(r,weight=1)=>{
      const scaled=Math.max(1, Math.round(Number(weight||1)*adventureRewardCategoryScale(r.kind)));
      pool.push({...r, weight:scaled});
    };
    add({id:"potion2", title:"상처약 x2", kind:"heal", item:"potion", amount:2, desc:"상처약 x2"}, s<=10?12:5);
    add({id:"superPotion1", title:"좋은상처약 x1", kind:"heal", item:"superPotion", amount:1, desc:"좋은상처약 x1"}, 8);
    if(s>=25) add({id:"hyperPotion1", title:"고급상처약 x1", kind:"heal", item:"hyperPotion", amount:1, desc:"HP 120 회복"}, 5);
    add({id:"ether1", title:"에테르 x1", kind:"heal", item:"ether", amount:1, desc:"에테르 x1"}, 4);
    for(const [id,title] of [["paralyzeHeal","마비치료제 x2"],["antidote","해독제 x2"],["burnHeal","화상치료제 x2"],["awakening","잠깨는약 x2"]]) add({id:`${id}2`, title, kind:"heal", item:id, amount:2, desc:title}, 3);
    add({id:"fullHeal1", title:"만능치료제 x1", kind:"heal", item:"fullHeal", amount:1, desc:"모든 상태이상 회복"}, 4);
    add({id:"ball3", title:"푸끼볼 x3", kind:"capture", item:"pookiBall", amount:3, desc:"푸끼볼 x3"}, s<=20?10:4);
    add({id:"superBall2", title:"슈퍼푸끼볼 x2", kind:"capture", item:"superPookiBall", amount:2, desc:"슈퍼푸끼볼 x2"}, 7);
    if(s>=15) add({id:"hyperBall1", title:"하이퍼푸끼볼 x1", kind:"capture", item:"hyperPookiBall", amount:1, desc:"하이퍼푸끼볼 x1"}, 5);
    add({id:"captureCharm1", title:"포획부적 x1", kind:"capture", item:"captureCharm", amount:1, desc:"다음 포획률 보너스"}, 3);
    add({id:"rareCandy1", title:"이상한사탕 x1", kind:"growth", item:"rareCandy", amount:1, desc:"포켓몬 1마리 1레벨업"}, adventureGrowthRewardWeight("rareCandy", 8));
    if(Number(adventure.expShareLevel||0)<5) add({id:"expShare1", title:"학습장치 x1", kind:"growth", item:"expShare", amount:1, desc:"대기 포켓몬 경험치 분배 +10%"}, adventureGrowthRewardWeight("expShare", 4));
    add({id:"reviveSeed1", title:"작은부활씨앗 x1", kind:"revive", item:"reviveSeed", amount:1, desc:"기절 포켓몬 HP 25% 부활"}, s<=10?5:3);
    if(s>=10) add({id:"revive1", title:"기력의조각 x1", kind:"revive", item:"revive", amount:1, desc:"기절 포켓몬 HP 50% 부활"}, 6);
    if(s>=30) add({id:"maxRevive1", title:"기력의덩어리 x1", kind:"revive", item:"maxRevive", amount:1, desc:"기절 포켓몬 완전 부활"}, 3);
    if(s%10===0 || s>=25) add({id:"massRevive1", title:"대규모 부활 x1", kind:"revive", item:"massRevive", amount:1, desc:"팀 전체 복구"}, s%10===0?5:1);
    if(s%10===0 || s>=40) add({id:"pokeCenterPass1", title:"포켓몬센터 이용권 x1", kind:"revive", item:"pokeCenterPass", amount:1, desc:"팀 전체 HP/상태/PP 복구"}, s%10===0?3:1);
    const canSpecial=(itemKey)=>(adventure.team||[]).some(p=>getAdventureSpecialEvolutionOptions(p,itemKey).length);
    if(s>=11 && canSpecial("evolutionStone")) add({id:"evolutionStone1", title:"진화의돌 x1", kind:"specialEvolution", item:"evolutionStone", amount:1, desc:"돌 진화 포켓몬을 진화시킵니다"}, s%10===0?6:4);
    if(s>=31 && canSpecial("linkCable")) add({id:"linkCable1", title:"연결의끈 x1", kind:"specialEvolution", item:"linkCable", amount:1, desc:"통신교환 진화 포켓몬을 진화시킵니다"}, s%10===0?5:3);
    if(s>=41 && canSpecial("evolutionLight")) add({id:"evolutionLight1", title:"진화의빛 x1", kind:"specialEvolution", item:"evolutionLight", amount:1, desc:"특수진화 포켓몬을 진화시킵니다"}, s%10===0?4:2);
    const eqWeights=s<=10?3:s<=30?5:s<=60?7:9;
    for(const eq of ["powerBand","wiseGlasses","charcoal","mysticWater","miracleSeed","magnet","silverPowder","sharpBeak","hardStone","blackBelt","leftovers","shellBell","assaultVest","lifeCharm"]){
      const def=equipmentDef(eq); const max=Number(def.maxStacks||6), now=Number(adventure.adventureEquipment?.[eq]||0);
      if(now<max) add({id:eq, title:`${def.name||eq} x1`, kind:"equipment", equipment:eq, amount:1, desc:def.desc||"장비"}, eqWeights);
    }
    const tm=generateAdventureTmReward();
    if(tm) add(tm, s<=10?2:s<=30?5:s<=60?7:8);
    return pool.filter(r=>!isForbiddenDirectReward(r));
  }
  function weightedPick(pool, usedIds=new Set()){
    const candidates=pool.filter(r=>!usedIds.has(r.id));
    const arr=candidates.length?candidates:pool;
    const total=arr.reduce((a,r)=>a+Math.max(1,Number(r.weight||1)),0);
    let roll=Math.random()*total;
    for(const r of arr){ roll-=Math.max(1,Number(r.weight||1)); if(roll<=0) return r; }
    return arr[0];
  }
  function generateAdventureRewardChoices(){
    const pool=createCoreRewardPool();
    const picks=[]; const used=new Set();
    while(picks.length<4 && pool.length){ const r=weightedPick(pool,used); if(!r) break; picks.push(r); used.add(r.id); }
    while(picks.length<4 && pool.length) picks.push(weightedPick(pool,new Set()));
    return picks.slice(0,4).map(r=>{ const {weight, ...clean}=r; return clean; });
  }
  function adventureMoveMetaText(move){
    if(!move) return "";
    return `${typeKo(move.type)} / ${move.power>0?"위력 "+move.power:"변화기"} / 명중 ${move.accuracy ?? 100}`;
  }
  function renderAdventureLevelMovePrompt(){
    const buttons=document.getElementById("buttons"); if(!buttons) return;
    buttons.classList.add("adventure-reward-mode");
    const pending=adventure.pendingLevelMove || {};
    const mon=adventure.team?.[pending.monIndex];
    const move=pending.move;
    buttons.innerHTML=`<div class="adventure-learn-panel"><div class="adventure-learn-title">${escapeHtml(mon?.name||"포켓몬")}은/는 ${escapeHtml(move?.name||"새 기술")}을/를 배우려고 한다!</div><div class="adventure-learn-move">${escapeHtml(move?.name||"")}<br/><span class="meta">${escapeHtml(adventureMoveMetaText(move))}</span></div><div class="adventure-choice-grid"><button type="button" class="move-btn eff-super" onclick="adventureAcceptLevelMove()">배운다<span class="meta">새 기술을 습득합니다</span></button><button type="button" class="move-btn eff-neutral" onclick="adventureSkipLevelMove()">배우지 않는다<span class="meta">다음 성장 이벤트로 진행</span></button></div></div>`;
  }
  function renderAdventureLevelMoveForgetPrompt(){
    const buttons=document.getElementById("buttons"); if(!buttons) return;
    buttons.classList.add("adventure-reward-mode");
    const pending=adventure.pendingLevelMove || {};
    const mon=adventure.team?.[pending.monIndex];
    const move=pending.move;
    const moves=(mon?.moves||[]);
    buttons.innerHTML=`<div class="control-title">${escapeHtml(mon?.name||"포켓몬")}은/는 이미 기술을 4개 알고 있습니다 · 잊을 기술 선택</div><div class="adventure-learn-move">새 기술: <b>${escapeHtml(move?.name||"")}</b><br/><span class="meta">${escapeHtml(adventureMoveMetaText(move))}</span></div><div class="adventure-reward-grid">${moves.map((m,idx)=>`<button type="button" class="move-btn eff-neutral" onclick="adventureForgetLevelMove(${idx})"><span class="reward-title">${escapeHtml(m.name)}</span><span class="meta">${escapeHtml(adventureMoveMetaText(m))}<br/>이 기술을 잊습니다</span></button>`).join("")}</div><button type="button" class="move-btn eff-immune" onclick="adventureSkipLevelMove()">배우지 않는다<span class="meta">기존 기술을 유지합니다</span></button>`;
  }
  function renderAdventureTmTargetSelect(){
    const buttons=document.getElementById("buttons"); if(!buttons) return;
    buttons.classList.add("adventure-reward-mode");
    const reward=adventure.pendingTmReward; const move=adventure.moveMap?.[reward?.tm] || resolveMoveByName(reward?.tm);
    const team=adventure.team||[];
    buttons.innerHTML=`<div class="control-title">${escapeHtml(move?.name||"기술머신")}을 배울 포켓몬을 선택하세요</div><div class="adventure-choice-grid">${team.map((p,idx)=>{
      const can=canPokemonLearnAdventureTm(p, move);
      return `<button class="move-btn ${can?"eff-neutral":"eff-immune"}" ${can?"":"disabled"} onclick="adventureChooseTmTarget(${idx})"><b>${escapeHtml(p?.name||"빈 슬롯")}</b><span class="meta">Lv.${p?.level||"-"} / ${(p?.types||[]).map(typeKo).join("/")}<br/>${can?"배울 수 있음":"배울 수 없음"}</span></button>`;
    }).join("")}</div><button class="move-btn eff-neutral" onclick="adventureCancelTmReward()">취소<span class="meta">보상 선택으로 돌아가기</span></button>`;
  }
  function renderAdventureTmForgetSelect(){
    const buttons=document.getElementById("buttons"); if(!buttons) return;
    buttons.classList.add("adventure-reward-mode");
    const reward=adventure.pendingTmReward; const move=adventure.moveMap?.[reward?.tm] || resolveMoveByName(reward?.tm);
    const mon=adventure.team?.[adventure.pendingTmTargetIndex];
    buttons.innerHTML=`<div class="control-title">${escapeHtml(mon?.name||"포켓몬")}은/는 이미 기술을 4개 알고 있습니다 · 잊을 기술 선택</div><div class="adventure-reward-grid">${(mon?.moves||[]).map((m,idx)=>`<button class="move-btn eff-neutral" onclick="adventureForgetMoveForTm(${idx})"><span class="reward-title">${escapeHtml(m.name)}</span><span class="meta">${typeKo(m.type)} / ${m.power>0?"위력 "+m.power:"변화기"}<br/>새 기술: ${escapeHtml(move?.name||"")}</span></button>`).join("")}</div><button class="move-btn eff-neutral" onclick="adventureCancelTmReward()">취소<span class="meta">보상 선택으로 돌아가기</span></button>`;
  }
  function renderAdventureRewards(){
    const buttons=document.getElementById("buttons");
    if(!buttons) return;
    if(!canEnterAdventureRewardFromCanonicalHp("render-reward-ui")){
      buttons.classList.remove("adventure-reward-mode");
      recoverAdventureEnemyAliveFlow("render-reward-ui-blocked");
      return;
    }
    buttons.classList.add("adventure-reward-mode");
    if(!adventure._rewardChoices || adventure._rewardChoices.length!==4) adventure._rewardChoices=generateAdventureRewardChoices();
    buttons.innerHTML=`<div class="control-title">승리 보상 4개 중 하나를 선택하세요 · 선택 후 다음 층으로 이동</div><div class="adventure-reward-grid">${adventure._rewardChoices.map((r,idx)=>`<button class="move-btn eff-super adventure-reward-card" ${adventure.rewardApplying?"disabled":""} onclick="adventureChooseReward(${idx})"><span class="reward-title">${escapeHtml(rewardDisplayTitle(r))}</span><span class="meta">${escapeHtml(r.desc||r.title||"")}<br/>선택 후 바로 다음 층으로 이동</span></button>`).join("")}</div>`;
  }
  function renderAdventureSwitchPrompt(){
    const buttons=document.getElementById("buttons");
    if(!buttons) return;
    buttons.classList.add("adventure-reward-mode");
    const activeIdx=currentState?.players?.p1?.activeIndex ?? adventure.activeIndex ?? 0;
    const team=currentState?.players?.p1?.team || adventure.team || [];
    buttons.innerHTML=`<div class="control-title">현재 포켓몬이 쓰러졌습니다 · 교체할 포켓몬을 선택하세요</div><div class="adventure-choice-grid">${team.map((p,idx)=>{
      const dead=!p || p.fainted || getAdventurePokemonHp(p)<=0;
      const active=idx===activeIdx;
      return `<button class="move-btn ${dead?"eff-immune":"eff-neutral"}" ${dead||active?"disabled":""} data-adventure-switch-index="${idx}"><b>${escapeHtml(p?.name||"빈 슬롯")}</b><span class="meta">Lv.${p?.level||"-"} / HP ${p?`${p.hp}/${p.maxHp}`:"-"}${dead?" / 기절":""}${active?" / 현재":""}</span></button>`;
    }).join("")}</div>`;
    buttons.querySelectorAll('[data-adventure-switch-index]').forEach(btn=>{
      btn.addEventListener('click',()=>performAdventureSwitch(Number(btn.dataset.adventureSwitchIndex), {forced:adventure.switchMode==='forced', consumeTurn:adventure.switchMode==='manual', reason:adventure.switchMode||'switch'}));
    });
    renderAdventureBag();
  }
  function renderAdventureTeamReplacePrompt(){
    const buttons=document.getElementById("buttons");
    if(!buttons) return;
    buttons.classList.add("adventure-reward-mode");
    const captured=adventure.pendingCaptured;
    const team=adventure.team||[];
    buttons.innerHTML=`<div class="control-title">팀이 가득 찼습니다 · ${escapeHtml(captured?.name||"포획 포켓몬")}을 팀에 넣으려면 한 마리를 선택해 교체하세요</div><div class="adventure-choice-grid">${team.map((p,idx)=>`<button class="move-btn eff-neutral" onclick="adventureReplaceCaptured(${idx})"><b>${escapeHtml(p?.name||"빈 슬롯")}</b><span class="meta">Lv.${p?.level||"-"} / HP ${p?`${p.hp}/${p.maxHp}`:"-"}<br/>이 포켓몬과 교체</span></button>`).join("")}<button class="move-btn eff-immune" onclick="adventureDiscardCaptured()"><b>포획한 포켓몬 포기</b><span class="meta">팀 변경 없이 보상 선택으로 이동</span></button></div>`;
    renderAdventureBag();
  }

  function adventureDiscardCaptured(){
    const captured=adventure.pendingCaptured;
    adventure.log.push(`${captured?.name||"포획 포켓몬"}을/를 팀에 넣지 않았다.`);
    adventure.pendingCaptured=null;
    enterAdventureReward("포획 처리 완료! 보상을 선택하세요.");
  }

  function adventureReplaceCaptured(idx){
    const captured=adventure.pendingCaptured;
    const i=Number(idx);
    if(!captured || !Array.isArray(adventure.team) || !adventure.team[i]){ adventure.log.push("교체할 수 없습니다."); renderAdventureButtons(); renderAdventureLogs(); return; }
    const removed=adventure.team[i];
    adventure.team[i]=captured;
    recordAdventureHallOfFamePokemon(captured, {caughtAtStage:captured.caughtAtStage||adventure.stage});
    if(currentState?.players?.p1){
      currentState.players.p1.team=clone(adventure.team);
      if(Number(adventure.activeIndex||0)===i){ currentState.players.p1.activeIndex=i; }
      currentState.logs=[...adventure.log];
    }
    adventure.log.push(`${removed.name}을/를 보내고 ${captured.name}을/를 팀에 넣었다!`);
    adventure.pendingCaptured=null;
    enterAdventureReward("포획 처리 완료! 보상을 선택하세요.");
  }

  function renderAdventureSummary(){
    const mine=playerMon(); const enemy=enemyMon();
    const best = mine&&enemy ? (mine.moves||[]).map(m=>({m, mult:m.power>0?battleEffectiveness(m.type,enemy.types):0.2, score:(m.power||25)*(m.power>0?battleEffectiveness(m.type,enemy.types):0.2)})).sort((a,b)=>b.score-a.score)[0] : null;
    return `<div class="section-label">모험 요약</div><div class="battle-summary">
      <div class="summary-line"><span>현재 층</span><b>${adventure.stage}/${adventure.maxStage}층</b></div>
      <div class="summary-line"><span>다음 보스</span><b>${nextBossFloor()}층</b></div>
      <div class="summary-line"><span>보유 포켓몬</span><b>${adventure.team.filter(p=>!p.fainted).length}/${adventure.team.length}마리</b></div>
      <div class="summary-line"><span>추천 기술</span><b>${best?.m ? `${best.m.name} (${best.m.power>0?effectText(best.mult):"변화기"})` : "-"}</b></div>
      <div class="summary-line"><span>푸끼볼</span><b>${adventure.bag.pookiBall||0}개</b></div>
    </div>`;
  }
  function renderAdventurePokemonInfo(id,p,label,playerKey){
    const el=document.getElementById(id);
    if(!el) return;
    if(playerKey==="p2" && adventure.pendingReward && !adventure.enemy){
      el.innerHTML=`<div class="name-row"><span class="name-main">상대 포켓몬 없음</span></div><div class="info-extra"><div class="info-line">포획 성공 · 보상을 선택하세요.</div></div>`;
      return;
    }
    if(!p){ el.innerHTML=`<div class="name-row"><span class="name-main">${label} 대기</span></div>`; return; }
    const types=(p.types||[]).map(t=>`<span class="type-pill">${typeKo(t)}</span>`).join("");
    const normalizedStatus=normalizeAdventureStatus(p.status);
    const statusBadge=`<span class="status ${normalizedStatus||""}">${statusKo(normalizedStatus)}</span>`;
    const expNow=Number(p.exp||0), expNeed=Number(p.expToNext||getAdventureExpToNext(p.level||5));
    const expPct=Math.max(0,Math.min(100, expNeed ? Math.floor((expNow/expNeed)*100) : 0));
    const statDetail = renderAdventureStatDetails(p);
    const equipmentBox = playerKey==="p1" ? renderAdventureEquipmentBox() : "";
    el.innerHTML=`<div class="name-row"><div class="name-main">${label} ${escapeHtml(p.name)} <small>Lv.${p.level||5}</small></div><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">${types}${statusBadge}</div></div>
    <div class="hp-row"><span>HP</span><div class="hpbar"><div class="hpfill" style="width:${hpPct(p)}%"></div></div><span>${p.hp}/${p.maxHp}</span></div>
    ${playerKey==="p1"?`<div class="adventure-exp-row"><span>EXP</span><div class="adventure-expbar"><div class="adventure-expfill" style="width:${expPct}%"></div></div><span>${expNow}/${expNeed}</span></div>`:""}
    <div><div class="section-label">능력 변화</div><div class="stage-row"><span class="stage">공격 ${formatStage(p.statStages?.attack||0)}</span><span class="stage">방어 ${formatStage(p.statStages?.defense||0)}</span><span class="stage">스피드 ${formatStage(p.statStages?.speed||0)}</span></div>${statDetail}</div>
    ${equipmentBox}`;
  }
  function renderAdventureStatDetails(p){
    const stats=p?.stats||{}; const stages=p?.statStages||{};
    const lines=["attack","defense","speed"].map(stat=>{
      const base=Number(stats[stat]||0);
      const rank=Number(stages[stat]||0);
      const eff=Math.max(1,Math.floor(base*stageMod(rank)));
      const ko=stat==="attack"?"공격":stat==="defense"?"방어":"스피드";
      return `<div>${ko} ${base}${rank?` (${formatStage(rank)} / 실효 ${eff})`:""}</div>`;
    }).join("");
    return `<div class="adventure-stat-detail">${lines}</div>`;
  }
  function equipmentEntries(){
    return Object.entries(adventure.adventureEquipment||{}).filter(([,v])=>Number(v)>0);
  }
  function equipmentDef(id){
    const list=Array.isArray(adventure.equipmentConfig?.equipment) ? adventure.equipmentConfig.equipment : [];
    return list.find(e=>e.id===id) || {};
  }
  function renderAdventureEquipmentBox(){
    const entries=equipmentEntries();
    const chips=entries.length ? entries.map(([id,count])=>`<span class="adventure-equip-chip">${escapeHtml(equipmentDef(id).name||id)} x${count}</span>`).join("") : `<span class="adventure-equip-chip">장비 없음</span>`;
    return `<div class="adventure-equipment-box"><div class="adventure-equip-title">장비</div><div class="adventure-equip-list">${chips}</div></div>`;
  }

  function adventureBenchCardMarkup(p,idx,label){
    return `<div class="bench-card ${p.fainted?"fainted":""}"><img class="bench-sprite" src="${p.frontSprite || p.backSprite || ""}" alt="${p.name}" /><div class="bench-meta"><div class="bench-head"><span class="bench-name">${escapeHtml(p.name)}</span><span class="bench-slot">${label}</span></div><div class="bench-sub">Lv.${p.level||5} · HP ${p.hp}/${p.maxHp}</div><div class="bench-types">${(p.types||[]).map(t=>`<span class="type-pill">${typeKo(t)}</span>`).join("")}</div></div></div>`;
  }

  async function adventureSelectMove(moveIndex){
    if(animationBusy || adventure.pendingReward || adventure.turnResolving) return;
    const mine=playerMon(), enemy=enemyMon();
    const move=mine?.moves?.[moveIndex];
    if(!mine || !enemy || !move || move.pp<=0) return;
    playGameSfx?.("select");
    await resolveAdventureTurn({type:"move", moveIndex});
  }
  function chooseEnemyMove(enemy, mine){
    const usable=(enemy.moves||[]).filter(m=>!Number.isFinite(m.pp)||m.pp>0);
    if(!usable.length) return enemy.moves?.[0];
    const hpRatio = enemy.maxHp ? enemy.hp / enemy.maxHp : 1;
    const last = enemy.volatile?.lastEnemyMoveId;
    const scored = usable.map((m,idx)=>{
      const isHeal = !!(m.heal || m.rest);
      let score=(m.power||20)*(m.power>0?battleEffectiveness(m.type,mine.types||[]):0.25)*((m.accuracy||100)/100);
      if(isHeal){
        if(hpRatio >= 0.5) score = -999;
        else if(m.rest && (enemy.status || hpRatio > 0.30)) score = -999;
        else score = hpRatio < 0.35 ? 28 : 4;
        if(last && last === m.id) score -= 40;
      }
      if(m.power>0) score += 20;
      return {m,idx,score};
    }).sort((a,b)=>b.score-a.score);
    const pick=scored[0]?.m || usable[0];
    enemy.volatile = enemy.volatile || {};
    enemy.volatile.lastEnemyMoveId = pick.id;
    return pick;
  }
  async function resolveAdventureTurn(playerAction){
    if(adventure.turnResolving) return;
    adventure.turnResolving=true;
    try{
      const oldState=clone(currentState);
      const working=clone(currentState);
      const mine=working.players.p1.team[working.players.p1.activeIndex];
      const enemy=working.players.p2.team[0];
      if(!mine || !enemy || mine.fainted || enemy.fainted){ adventure.turnResolving=false; return; }
      const pMove=mine.moves[playerAction.moveIndex];
      const eMove=chooseEnemyMove(enemy, mine);
      const order = compareMoveOrder(mine,pMove,enemy,eMove) >= 0 ? [
        {key:"p1", mon:mine, target:enemy, move:pMove, idx:playerAction.moveIndex},
        {key:"p2", mon:enemy, target:mine, move:eMove, idx:enemy.moves.findIndex(m=>m.id===eMove.id)}
      ] : [
        {key:"p2", mon:enemy, target:mine, move:eMove, idx:enemy.moves.findIndex(m=>m.id===eMove.id)},
        {key:"p1", mon:mine, target:enemy, move:pMove, idx:playerAction.moveIndex}
      ];
      const events=[{id:advEventId(), type:"turnStart", turn:working.turn, text:`${adventure.stage}층 · ${working.turn}턴`}];
      const logs=[...adventure.log, `${working.turn}턴 시작`];
      let battleEnded=false;
      for(const act of order){
        if(mine.fainted || enemy.fainted || getAdventurePokemonHp(mine)<=0 || getAdventurePokemonHp(enemy)<=0){ battleEnded=true; break; }
        if(act.mon.fainted || act.target.fainted) continue;
        applyAdventureMove(act, events, logs);
        sanitizeAdventureHp(mine); sanitizeAdventureHp(enemy);
        if(enemy.fainted || getAdventurePokemonHp(enemy)<=0 || mine.fainted || getAdventurePokemonHp(mine)<=0){ battleEnded=true; break; }
      }
      if(!battleEnded){
        applyAdventureEndTurnStatus(working, events, logs);
        applyAdventureEndTurnEquipment(working, events, logs);
      }
      working.turn += 1;
      working.logs = logs;
      working.phase = (mine.fainted || enemy.fainted || getAdventurePokemonHp(mine)<=0 || getAdventurePokemonHp(enemy)<=0) ? "TURN_RESOLVE" : "ACTION_SELECT";
      prepareVisualState(oldState);
      currentState = working;
      adventure.log = logs;
      const primaryActor=order[0]?.key || "p1";
      await enqueueAdventureEventsSafely(events, {reason:"turn-events", attackerSide:primaryActor, defenderSide:primaryActor === "p2" ? "p1" : "p2"});
      commitFromCurrentState();
      const e=enemyMon(); const p=playerMon();
      assertAdventureEnemyHpConsistency("turn-complete");
      if(isAdventureCanonicalEnemyDefeated("turn-complete")){
        if(!adventure.moveAnimationDone || !adventure.damageRenderDone){
          console.warn?.("[Adventure/Reward] blocked: animation not completed", {reason:"turn-complete", moveAnimationDone:adventure.moveAnimationDone, damageRenderDone:adventure.damageRenderDone});
          await playAdventureFallbackHitAnimation(primaryActor, primaryActor === "p2" ? "p1" : "p2", "reward-sequence-guard");
          adventure.moveAnimationDone=true;
          adventure.damageRenderDone=true;
        }
        handleAdventureVictory();
      }
      else if(p?.fainted || getAdventurePokemonHp(p)<=0){ handleAdventurePlayerFainted(); }
      else { currentState.phase="ACTION_SELECT"; renderAdventureHeader(`${adventure.stage}층 전투`, "행동을 선택하세요."); renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); }
      adventure.turnResolving=false; animationBusy=false; renderAdventureButtons();
    }catch(err){
      console.warn('[Adventure OneShot] resolve turn failed', err);
      adventure.turnResolving=false; animationBusy=false;
      renderBattleView(); renderAdventureButtons(); renderAdventureLogs();
    }
  }
  function compareMoveOrder(a,aMove,b,bMove){
    const ap=Number(aMove?.priority||0), bp=Number(bMove?.priority||0);
    if(ap!==bp) return ap-bp;
    return effectiveSpeed(a)-effectiveSpeed(b);
  }
  function isAdventureDamagingMove(move){
    if(!move) return false;
    const id=String(move.id || move.apiName || move.name || "").toLowerCase();
    const power=Number(move.power ?? 0);
    const statusClass = String(move.damage_class || move.damageClass || move.category || "").toLowerCase() === "status";
    const explicitStatus = !!move.statusMove || !!move.statChange || !!move.selfStat || !!move.statChanges || !!move.selfStatChanges || !!move.targetStatChanges || !!move.heal || !!move.rest;
    const damagingEffectIds = new Set(["absorb","megaDrain","gigaDrain","powerUpPunch","flameCharge","waterPulse","shockWave","crunch","fireFang","iceFang","thunderFang"]);
    if(damagingEffectIds.has(id) && power>0) return true;
    if(statusClass) return false;
    if(power<=0) return false;
    if(explicitStatus && power<=0) return false;
    return true;
  }
  function sanitizeAdventureHp(mon){
    if(!mon) return;
    const max=Math.max(1, Number(mon.maxHp || mon.stats?.hp || 1));
    let hp=Number(mon.hp ?? mon.currentHp ?? max);
    if(!Number.isFinite(hp)) hp=max;
    mon.maxHp=max;
    mon.hp=Math.max(0, Math.min(max, Math.round(hp)));
    mon.currentHp=mon.hp;
    mon.fainted = mon.hp<=0;
  }
  function applyAdventureNonDamagingMove(attacker, defender, attackerKey, defenderKey, move, events, logs){
    const statChanges = collectAdventureStatChanges(move);
    if(statChanges.length){
      applyAdventureStatChanges(attacker, defender, attackerKey, defenderKey, statChanges, events, logs);
    }
    const statusInfo = move.statusMove || move.effect?.statusOnly || null;
    const status = normalizeAdventureStatus(statusInfo?.status || move.status || move.effect?.status || null);
    const statusChance = Number(statusInfo?.chance ?? move.effect?.chance ?? 100);
    if(status && status!=="normal"){
      if(!defender.status && Math.random()*100 < statusChance) setAdventureStatus(defender, status, logs, events, defenderKey);
      else if(defender.status) logs.push(`${defender.name}은/는 이미 상태이상이다!`);
    }
    if(!statChanges.length && (!status || status==="normal")){
      logs.push(`${move.name}의 효과가 발동했다!`);
    }
    sanitizeAdventureHp(attacker); sanitizeAdventureHp(defender);
  }
  function adventureDamageRoll(attacker, defender, move, attackerKey){
    const attack=(effectiveBattleStat(attacker,"attack")||30)*stageMod(attacker.statStages?.attack||0);
    const defense=Math.max(1,(effectiveBattleStat(defender,"defense")||30)*stageMod(defender.statStages?.defense||0));
    const burnPenalty=normalizeAdventureStatus(attacker.status) === "burn" ? 0.5 : 1;
    const stab=(attacker.types||[]).includes(move.type)?1.5:1;
    const typeMul=battleEffectiveness(move.type, defender.types||[]);
    const randomMul=0.9 + Math.random()*0.15;
    const critical=(move.power||0)>0 && typeMul>0 && Math.random() < (move.highCrit ? 0.125 : 0.0625);
    const criticalMul=critical ? 1.5 : 1;
    const equipMul = attackerKey === "p1" ? adventureEquipmentDamageMultiplier(move) : 1;
    const reduceMul = attackerKey === "p2" ? adventureEquipmentDefenseMultiplier() : 1;
    if(typeMul===0) return {amount:0, typeMul, critical:false, equipMul};
    const priorityMul = getAdventurePriorityMoveMultiplier(move);
    if(!isAdventureDamagingMove(move)) return {amount:0, typeMul, critical:false, equipMul};
    const raw=(((Number(move.power||0)*priorityMul*attack)/defense)/3.35 + 10) * burnPenalty * stab * typeMul * randomMul * criticalMul * equipMul * reduceMul;
    const amount=Math.floor(raw);
    return {amount:Number.isFinite(amount) ? Math.max(1, amount) : 0, typeMul, critical, equipMul};
  }
  function getAdventurePriorityMoveMultiplier(move){
    if(Number(move?.priority||0)<=0) return 1;
    const s=Number(adventure.stage||1);
    if(s<=10) return 0.75;
    if(s<=20) return 0.90;
    return 1;
  }
  function effectiveBattleStat(mon, stat){
    const base=Number(mon?.stats?.[stat] || 0);
    const bonus=Number(mon?.adventureBonusStats?.[stat] || 0);
    return Math.max(1, base + bonus);
  }
  function adventureEquipmentDefenseMultiplier(){
    const count=Math.min(Number(equipmentDef("assaultVest").maxStacks||6), Number(adventure.adventureEquipment?.assaultVest||0));
    return Math.max(0.4, 1 - count*0.05);
  }
  function adventureEquipmentDamageMultiplier(move){
    if(!move || (move.power||0)<=0) return 1;
    let mul=1;
    const eq=adventure.adventureEquipment||{};
    const generic = Math.min(Number(equipmentDef("powerBand").maxStacks||6), Number(eq.powerBand||0)) + Math.min(Number(equipmentDef("wiseGlasses").maxStacks||6), Number(eq.wiseGlasses||0));
    if(generic>0) mul *= (1 + generic*0.10);
    const typeMap={fire:"charcoal",water:"mysticWater",grass:"miracleSeed",electric:"magnet",bug:"silverPowder",rock:"hardStone",fighting:"blackBelt",poison:"poisonBarb",flying:"sharpBeak",ground:"softSand",ghost:"spellTag",dark:"blackGlasses",ice:"neverMeltIce",dragon:"dragonFang",steel:"metalCoat",fairy:"fairyFeather"};
    const id=typeMap[move.type];
    const count=id?Math.min(Number(equipmentDef(id).maxStacks||6),Number(eq[id]||0)):0;
    if(count>0) mul *= (1 + count*Number(equipmentDef(id).value||0.15));
    return mul;
  }
  function rollMultiHit(move){
    const mh=move?.multiHit;
    if(!mh) return 1;
    if(Number.isFinite(mh.fixed)) return Math.max(1,Number(mh.fixed));
    const min=Number(mh.min||2), max=Number(mh.max||5);
    const r=Math.random();
    if(max>=5 && min<=2){
      if(r<0.35) return 2;
      if(r<0.70) return 3;
      if(r<0.85) return 4;
      return 5;
    }
    return Math.max(min, Math.min(max, min + Math.floor(Math.random()*(max-min+1))));
  }

  function applyAdventureMove(act, events, logs){
    const attackerKey=act.key;
    const defenderKey=attackerKey==="p1"?"p2":"p1";
    const attacker=act.mon;
    const defender=act.target;
    const move=normalizeMove(act.move || {});
    if(!attacker || !defender || !move) return;
    attacker.status=normalizeAdventureStatus(attacker.status);
    defender.status=normalizeAdventureStatus(defender.status);
    if(!canAdventureAct(attacker, attackerKey, events, logs)) return;
    if(Number.isFinite(move.pp)) move.pp=Math.max(0,move.pp-1);
    logs.push(`${attacker.name}의 ${move.name}!`);
    const plannedHitTotal = rollMultiHit(move);
    events.push({id:advEventId(), type:"move", attacker:attackerKey, defender:defenderKey, attackerName:attacker.name, defenderName:defender.name, moveName:move.name, moveType:move.type, isStatusMove:!isAdventureDamagingMove(move), isMultiHit:plannedHitTotal>1, hitTotal:plannedHitTotal, outcome:"hit"});
    if(Math.random()*100 > (move.accuracy ?? 100)){
      logs.push("하지만 공격은 빗나갔다!");
      events.push({id:advEventId(), type:"miss", attacker:attackerKey, defender:defenderKey, moveName:move.name});
      return;
    }
    if(move.rest){
      const amount=Math.max(0,Number(attacker.maxHp||0)-Number(attacker.hp||0));
      attacker.hp=attacker.maxHp;
      attacker.status=null;
      attacker.volatile = attacker.volatile || {};
      attacker.volatile.sleepTurns = Number(move.rest.turns||2);
      setAdventureStatus(attacker, "sleep", null, null, attackerKey);
      logs.push(`${attacker.name}은/는 잠들고 HP를 모두 회복했다!`);
      events.push({id:advEventId(), type:"heal", target:attackerKey, name:attacker.name, amount, hp:attacker.hp});
      events.push({id:advEventId(), type:"status", target:attackerKey, name:attacker.name, status:"sleep"});
      return;
    }
    if(move.heal){
      const amount=Math.max(1,Math.floor(attacker.maxHp*(move.heal.ratio||0.3)));
      attacker.hp=Math.min(attacker.maxHp,attacker.hp+amount);
      logs.push(`${attacker.name}의 HP가 회복되었다!`);
      events.push({id:advEventId(), type:"heal", target:attackerKey, name:attacker.name, amount, hp:attacker.hp});
      return;
    }
    if(!isAdventureDamagingMove(move)){
      applyAdventureNonDamagingMove(attacker, defender, attackerKey, defenderKey, move, events, logs);
      return;
    }
    const mult = battleEffectiveness(move.type,defender.types||[]);
    if(mult===0){ logs.push(`${defender.name}에게는 효과가 없다...`); events.push({id:advEventId(), type:"message", text:"효과가 없다..."}); return; }
    const hitTotal=plannedHitTotal;
    let totalDamage=0;
    let lastCritical=false;
    for(let hit=1; hit<=hitTotal; hit++){
      if(defender.hp<=0) break;
      const roll=adventureDamageRoll(attacker, defender, move, attackerKey);
      const amount=Number.isFinite(Number(roll.amount)) ? Math.max(0, Number(roll.amount)) : 0;
      if(amount<=0) continue;
      totalDamage += amount;
      lastCritical = lastCritical || roll.critical;
      sanitizeAdventureHp(defender);
      const hpBeforeDamage=Number(defender.hp||0);
      defender.hp=Math.max(0,Number(defender.hp||0)-amount);
      defender.currentHp=defender.hp;
      if(defenderKey==="p2"){
        console.info?.("[Adventure/HP] enemy damage applied", {
          reason:"applyAdventureMove",
          floor:adventure.stage,
          enemyName:defender.name,
          hpBefore:hpBeforeDamage,
          damage:amount,
          hpAfter:defender.hp,
          maxHp:defender.maxHp,
          phase:adventure.phase,
          enemyFaintResolved:adventure.enemyFaintResolved,
          battleRewardClaimed:adventure.battleRewardClaimed
        });
      }
      if(defenderKey==="p1" && defender.hp<=0){
        const charmCount=Math.min(Number(equipmentDef("lifeCharm").maxStacks||6), Number(adventure.adventureEquipment?.lifeCharm||0));
        defender.volatile=defender.volatile||{};
        if(charmCount>0 && !defender.volatile.lifeCharmUsed){
          defender.hp=1; defender.volatile.lifeCharmUsed=true;
          logs.push(`생명의부적 효과! ${defender.name}이/가 HP 1로 버텼다!`);
          events.push({id:advEventId(), type:"heal", target:defenderKey, name:defender.name, amount:1, hp:defender.hp});
        }
      }
      const eff=effectText(roll.typeMul);
      logs.push(`${defender.name}에게 ${amount} 피해! ${eff}${roll.critical?" · 급소":""}${hitTotal>1?` · ${hit}/${hitTotal}타`:""}`);
      events.push({id:advEventId(), type:"damage", attacker:attackerKey, defender:defenderKey, amount, moveType:move.type, moveName:move.name, effectiveness:roll.typeMul, critical:roll.critical, hp:defender.hp, maxHp:defender.maxHp, defenderName:defender.name, isMultiHit:hitTotal>1, hitIndex:hit, hitTotal});
    }
    if(hitTotal>1) logs.push(`${hitTotal}회 맞았다! 총 ${totalDamage} 피해!`);
    if(attackerKey==="p1" && totalDamage>0) applyAdventureAfterDamageEquipment(attacker, totalDamage, events, logs);
    if(move.drain && totalDamage>0 && attacker.hp>0){
      const heal=Math.max(1,Math.floor(totalDamage*Number(move.drain||0.5)));
      attacker.hp=Math.min(attacker.maxHp, attacker.hp+heal);
      logs.push(`${attacker.name}이/가 ${heal} HP를 흡수했다!`);
      events.push({id:advEventId(), type:"heal", target:attackerKey, name:attacker.name, amount:heal, hp:attacker.hp});
    }
    if(move.effect?.status && defender.hp>0 && !defender.status && Math.random()*100 < Number(move.effect.chance||0)){
      setAdventureStatus(defender, move.effect.status, logs, events, defenderKey);
    }
    const afterHit = collectAfterHitSelfStatChanges(move);
    if(totalDamage>0 && afterHit.length){
      applyAdventureStatChanges(attacker, defender, attackerKey, defenderKey, afterHit, events, logs, true);
    }
    sanitizeAdventureHp(defender);
    if(defenderKey==="p2" && defender.hp>0 && defender.fainted){
      console.warn?.("[Adventure/Faint] blocked: canonical enemy still alive", {reason:"applyAdventureMove-final", enemyName:defender.name, hp:defender.hp, maxHp:defender.maxHp});
      defender.fainted=false;
    }
    if(defender.hp<=0){ defender.fainted=true; defender.currentHp=0; logs.push(`${defender.name}이 쓰러졌다!`); events.push({id:advEventId(), type:"faint", target:defenderKey, name:defender.name}); }
  }
  function collectAdventureStatChanges(move){
    const list=[];
    if(move.statChange) list.push(move.statChange);
    if(move.selfStat) list.push({target:"self", stat:move.selfStat.stat, amount:move.selfStat.amount});
    if(Array.isArray(move.statChanges)) list.push(...move.statChanges);
    if(move.selfStatChanges) for(const [stat,amount] of Object.entries(move.selfStatChanges)) list.push({target:"self", stat, amount});
    if(move.targetStatChanges) for(const [stat,amount] of Object.entries(move.targetStatChanges)) list.push({target:"enemy", stat, amount});
    return list;
  }
  function collectAfterHitSelfStatChanges(move){
    const list=[];
    if(move.selfStatAfterHit) list.push({target:"self", stat:move.selfStatAfterHit.stat, amount:move.selfStatAfterHit.amount});
    if(move.afterHitSelfStatChanges) for(const [stat,amount] of Object.entries(move.afterHitSelfStatChanges)) list.push({target:"self", stat, amount});
    return list;
  }
  function applyAdventureStatChanges(attacker, defender, attackerKey, defenderKey, changes, events, logs, afterHit=false){
    for(const ch of changes){
      if(!ch || !ch.stat) continue;
      const targetKey = ch.target==="self" ? attackerKey : defenderKey;
      const target = targetKey===attackerKey ? attacker : defender;
      const before=Number(target.statStages?.[ch.stat]||0);
      target.statStages = target.statStages || {attack:0,defense:0,speed:0};
      target.statStages[ch.stat]=Math.max(-6,Math.min(6,before+Number(ch.amount||0)));
      const diff=target.statStages[ch.stat]-before;
      if(diff===0){ logs.push(`${target.name}의 ${statKo(ch.stat)}은/는 더 이상 변하지 않는다!`); continue; }
      logs.push(`${target.name}의 ${statKo(ch.stat)}${diff>0?"이 올랐다":"이 떨어졌다"}! (${formatStage(target.statStages[ch.stat])})`);
      events.push({id:advEventId(), type:"stat", target:targetKey, name:target.name, stat:ch.stat, amount:diff});
    }
  }
  function statKo(stat){ return stat==="attack"?"공격":stat==="defense"?"방어":stat==="speed"?"스피드":stat; }
  function applyAdventureAfterDamageEquipment(attacker, totalDamage, events, logs){
    const shell=Math.min(Number(equipmentDef("shellBell").maxStacks||6),Number(adventure.adventureEquipment?.shellBell||0));
    if(shell>0 && attacker.hp>0){
      const heal=Math.max(1,Math.floor(totalDamage*0.05*shell));
      attacker.hp=Math.min(attacker.maxHp, attacker.hp+heal);
      logs.push(`조개껍질방울 효과로 ${attacker.name}의 HP가 ${heal} 회복되었다!`);
      events.push({id:advEventId(), type:"heal", target:"p1", name:attacker.name, amount:heal, hp:attacker.hp});
    }
  }
  function applyAdventureEndTurnEquipment(state, events, logs){
    const mon=state?.players?.p1?.team?.[state?.players?.p1?.activeIndex||0];
    const left=Math.min(Number(equipmentDef("leftovers").maxStacks||6),Number(adventure.adventureEquipment?.leftovers||0));
    if(mon && !mon.fainted && left>0 && mon.hp>0 && mon.hp<mon.maxHp){
      const healRatio=Math.min(0.5, left * 0.125);
      const heal=Math.max(1,Math.floor(mon.maxHp*healRatio));
      mon.hp=Math.min(mon.maxHp, mon.hp+heal);
      logs.push(`먹다남은음식으로 ${mon.name}의 HP가 ${heal} 회복되었다! (${left}중첩 · 1/8씩)`);
      events.push({id:advEventId(), type:"heal", target:"p1", name:mon.name, amount:heal, hp:mon.hp});
    }
  }


  function getAdventureEventQueuePromise(){
    try{
      if(typeof eventQueue !== "undefined" && eventQueue && typeof eventQueue.then === "function") return eventQueue;
    }catch(_){ /* global eventQueue may not exist in some contexts */ }
    return Promise.resolve();
  }
  async function playAdventureFallbackHitAnimation(attackerSide="p1", defenderSide="p2", reason="fallback"){
    const attackerId=attackerSide === "p2" ? "opponentSprite" : "mySprite";
    const defenderId=defenderSide === "p2" ? "opponentSprite" : "mySprite";
    const attacker=document.getElementById(attackerId);
    const defender=document.getElementById(defenderId);
    console.info?.("[Adventure/Animation] fallback hit animation start", {reason, attackerSide, defenderSide});
    try{
      if(attacker){
        attacker.classList.remove("attack","shake","hit");
        void attacker.offsetWidth;
        attacker.classList.add("attack");
        attacker.style.transition="transform 120ms ease, filter 120ms ease";
        attacker.style.transform=attackerSide === "p2" ? "translateX(-14px) scale(1.03)" : "translateX(14px) scale(1.03)";
        attacker.style.filter="brightness(1.08)";
      }
      await sleep(130);
      if(defender){
        defender.classList.remove("hit","shake");
        void defender.offsetWidth;
        defender.classList.add("hit","shake");
        defender.style.transition="transform 90ms ease, filter 90ms ease";
        defender.style.transform="translateX(-8px)";
        defender.style.filter="brightness(1.25) saturate(1.15)";
      }
      if(attacker){
        attacker.style.transform="";
        attacker.style.filter="";
      }
      await sleep(120);
      if(defender){
        defender.style.transform="translateX(6px)";
        await sleep(80);
        defender.style.transform="";
        defender.style.filter="";
      }
      await sleep(120);
      renderBattleView();
      await sleep(100);
    }catch(err){
      console.warn?.("[Adventure/Animation] fallback hit animation failed", {reason, err});
      try{ renderBattleView(); }catch(_){}
    }finally{
      if(attacker){ attacker.classList.remove("attack"); attacker.style.transform=""; attacker.style.filter=""; }
      if(defender){ defender.classList.remove("hit","shake"); defender.style.transform=""; defender.style.filter=""; }
      console.info?.("[Adventure/Animation] fallback hit animation done", {reason, attackerSide, defenderSide});
    }
  }

  async function playAdventureEnemyFaintAnimationSafely(reason="enemy-faint"){
    if(adventure.enemyFaintAnimationDone) return true;
    adventure.enemyFaintStarted=true;
    adventure.enemyFaintResolved=true;
    const enemyEl=document.getElementById("opponentSprite");
    console.info?.("[Adventure/Animation] enemy faint animation start", {reason, enemyName:enemyMon()?.name, phase:adventure.phase});
    try{
      renderBattleView();
      if(enemyEl){
        enemyEl.classList.remove("hit","shake","attack","fainting","faint","enemy-dead","fainted");
        void enemyEl.offsetWidth;
        enemyEl.style.transition="opacity 420ms ease, transform 420ms ease, filter 420ms ease";
        enemyEl.classList.add("fainting","enemy-dead");
        enemyEl.style.transform="translateY(18px) scale(0.92)";
        enemyEl.style.opacity="0.35";
        enemyEl.style.filter="grayscale(0.65) brightness(0.8)";
      }
      await sleep(480);
      renderBattleView();
      await sleep(120);
    }catch(err){
      console.warn?.("[Adventure/Animation] enemy faint animation fallback failed", {reason, err});
    }finally{
      adventure.enemyFaintAnimationDone=true;
      adventure.enemyFaintResolved=true;
      console.info?.("[Adventure/Animation] enemy faint animation done", {reason, enemyName:enemyMon()?.name, phase:adventure.phase});
    }
    return true;
  }

  async function enqueueAdventureEventsSafely(events=[], context={}){
    const list=Array.isArray(events) ? events : [];
    if(!list.length){
      adventure.moveAnimationStarted=false;
      adventure.moveAnimationDone=true;
      adventure.damageRenderDone=true;
      return true;
    }
    adventure.moveAnimationStarted=true;
    adventure.moveAnimationDone=false;
    adventure.damageRenderDone=false;
    const firstMove=list.find(ev=>ev && (ev.type === "move" || ev.type === "damage" || ev.type === "hit")) || {};
    const attackerSide=context.attackerSide || firstMove.actor || firstMove.source || firstMove.side || "p1";
    const defenderSide=context.defenderSide || firstMove.target || (attackerSide === "p2" ? "p1" : "p2");
    try{
      window.__POOKI_ADVENTURE_EVENT_QUEUE_ACTIVE = true;
      if(typeof enqueueEvents === "function") enqueueEvents(list);
      else throw new Error("global enqueueEvents is not available");
      await Promise.resolve(getAdventureEventQueuePromise());
      adventure.moveAnimationDone=true;
      adventure.damageRenderDone=true;
      renderBattleView();
      console.info?.("[Adventure/Animation] damage render done", { reason:context.reason||"events-complete", phase:adventure.phase, floor:adventure.stage, battleResolutionToken:adventure.battleResolutionToken });
      return true;
    }catch(err){
      console.warn("[Adventure/EventQueue] failed, using adventure fallback animation", err);
      await playAdventureFallbackHitAnimation(attackerSide, defenderSide, context.reason || "event-queue-fallback");
      adventure.moveAnimationDone=true;
      adventure.damageRenderDone=true;
      renderBattleView();
      return false;
    }finally{
      window.__POOKI_ADVENTURE_EVENT_QUEUE_ACTIVE = false;
    }
  }

  function advEventId(){ return `adv_${Date.now()}_${Math.random().toString(36).slice(2,9)}`; }
  function captureEffectRowForBall(ballKey){
    if(ballKey === "superPookiBall") return 1;
    if(ballKey === "hyperPookiBall") return 2;
    return 0;
  }
  function nextAdventureCaptureToken(reason="capture"){
    adventure.captureAnimationToken = Number(adventure.captureAnimationToken || 0) + 1;
    clearAdventureCaptureTimers();
    console.debug?.("[Adventure Capture FX] token", {reason, token:adventure.captureAnimationToken});
    return adventure.captureAnimationToken;
  }
  function clearAdventureCaptureTimers(){
    const timers=Array.isArray(adventure.captureAnimationTimers) ? adventure.captureAnimationTimers : [];
    timers.forEach(id=>{ try{ clearTimeout(id); }catch(_){} });
    adventure.captureAnimationTimers=[];
  }
  function adventureDelay(ms, token){
    return new Promise(resolve=>{
      const id=setTimeout(()=>{
        adventure.captureAnimationTimers=(adventure.captureAnimationTimers||[]).filter(x=>x!==id);
        resolve(token == null || token === adventure.captureAnimationToken);
      }, Math.max(0, Number(ms)||0));
      adventure.captureAnimationTimers=(adventure.captureAnimationTimers||[]).concat(id);
    });
  }
  function clearAdventureCaptureEffects(){
    clearAdventureCaptureTimers();
    document.querySelectorAll(".capture-effect-overlay,.capture-ball-effect,.adventure-capture-fx").forEach(el=>el.remove());
  }
  function resetAdventureEnemyVisualState(reason="enemy-reset"){
    const enemyEl=document.getElementById("opponentSprite") || document.querySelector(".adventure-enemy-sprite");
    if(!enemyEl) return;
    enemyEl.classList.remove("adventure-capture-out","captured","capture-out","capture-hidden","fainted","faint-dead","enemy-dead","defeated","hidden","fade-out","shrink-out","switching-out","switch-out","switch-in","hit","shake","attack","faint","fainting","attack-up","attack-down");
    enemyEl.style.opacity="";
    enemyEl.style.visibility="";
    enemyEl.style.transform="";
    enemyEl.style.filter="";
    enemyEl.style.animation="";
    enemyEl.style.display="";
    enemyEl.style.pointerEvents="";
    console.debug?.("[Adventure Enemy Visual] reset", {reason, enemy:enemyMon()?.name});
  }
  function resetAdventureEnemyAfterCaptureFailure(){
    resetAdventureEnemyVisualState("capture-failure");
    const enemyEl=document.getElementById("opponentSprite");
    if(enemyEl){
      enemyEl.style.opacity="1";
      enemyEl.style.visibility="visible";
    }
  }
  function adventureElementCenter(el, fallback){
    if(!el) return fallback;
    const rect=el.getBoundingClientRect();
    if(!rect.width && !rect.height) return fallback;
    return {x:rect.left+rect.width/2, y:rect.top+rect.height/2, rect};
  }
  function setAdventureSheetFrame(el,row,frame){
    const safeRow=Math.max(0, Math.min(4, Number(row)||0));
    const safeFrame=Math.max(0, Math.min(5, Number(frame)||0));
    el.style.backgroundImage=`url("${ADVENTURE_EFFECT_SHEET}")`;
    el.style.backgroundSize="600% 500%";
    el.style.backgroundPosition=`${safeFrame*20}% ${safeRow*25}%`;
  }
  async function animateAdventureSheetAt(row, center, options={}){
    const settings=adventure.effectSettings || DEFAULT_ADVENTURE_EFFECT_SETTINGS;
    const size=Number(options.size || settings.capture?.ballDisplaySize || 56);
    const frameMs=Number(options.frameMs || settings.capture?.successFrameMs || 85);
    const token=options.token ?? adventure.captureAnimationToken;
    const el=document.createElement("div");
    el.className=`adventure-capture-fx ${options.className||"soft-impact"}`;
    el.style.width=`${size}px`;
    el.style.height=`${size}px`;
    el.style.left=`${center.x-size/2}px`;
    el.style.top=`${center.y-size/2}px`;
    el.style.opacity="1";
    setAdventureSheetFrame(el,row,0);
    document.body.appendChild(el);
    for(let i=0;i<6;i++){
      if(token !== adventure.captureAnimationToken){ el.remove(); return false; }
      setAdventureSheetFrame(el,row,i);
      await adventureDelay(frameMs, token);
    }
    el.style.opacity="0";
    await adventureDelay(80, token);
    el.remove();
    return token === adventure.captureAnimationToken;
  }
  async function animateAdventureCaptureThrow(ballKey, token){
    const settings=adventure.effectSettings || DEFAULT_ADVENTURE_EFFECT_SETTINGS;
    const cfg=settings.capture || DEFAULT_ADVENTURE_EFFECT_SETTINGS.capture;
    const size=Number(cfg.ballDisplaySize || 56);
    const row=captureEffectRowForBall(ballKey);
    const player=document.getElementById("mySprite");
    const enemy=document.getElementById("opponentSprite");
    const fallbackStart={x:window.innerWidth*0.36, y:window.innerHeight*0.54};
    const fallbackEnd={x:window.innerWidth*0.66, y:window.innerHeight*0.42};
    const startC=adventureElementCenter(player, fallbackStart);
    const endC=adventureElementCenter(enemy, fallbackEnd);
    const start={x:(startC.rect?startC.rect.right:startC.x)+12, y:(startC.rect?startC.rect.top+startC.rect.height*0.35:startC.y)};
    const end={x:endC.x, y:(endC.rect?endC.rect.top+endC.rect.height*0.52:endC.y)};
    const arc=Number(cfg.enableThrowArc===false ? 0 : cfg.arcHeight || 80);
    const duration=Number(cfg.throwDurationMs || 1400);
    const spin=Number(cfg.enableBallSpin===false ? 0 : cfg.spinDegree || 320);
    const el=document.createElement("div");
    el.className="adventure-capture-fx capture-ball-effect";
    el.style.width=`${size}px`;
    el.style.height=`${size}px`;
    el.style.left=`${start.x-size/2}px`;
    el.style.top=`${start.y-size/2}px`;
    setAdventureSheetFrame(el,row,0);
    document.body.appendChild(el);
    const t0=performance.now();
    await new Promise(resolve=>{
      const step=(now)=>{
        if(token !== adventure.captureAnimationToken){ el.remove(); resolve(false); return; }
        const t=Math.min(1,(now-t0)/duration);
        const ease=t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
        const x=start.x+(end.x-start.x)*ease;
        const y=start.y+(end.y-start.y)*ease - Math.sin(Math.PI*ease)*arc;
        const frame=Math.min(2, Math.floor(t*3));
        setAdventureSheetFrame(el,row,frame);
        el.style.left=`${x-size/2}px`;
        el.style.top=`${y-size/2}px`;
        el.style.transform=`rotate(${spin*ease}deg) scale(${Number(cfg.ballScale||0.45)})`;
        if(t<1) requestAnimationFrame(step);
        else resolve(true);
      };
      requestAnimationFrame(step);
    });
    if(token !== adventure.captureAnimationToken){ el.remove(); return null; }
    await adventureDelay(Number(cfg.impactDelayMs||150), token);
    const finalCenter={x:end.x,y:end.y};
    el.remove();
    return finalCenter;
  }
  async function playAdventureCaptureSequence(ballKey, success, enemyName){
    const token=nextAdventureCaptureToken("capture-sequence");
    try{
      const cfg=adventure.effectSettings?.capture || DEFAULT_ADVENTURE_EFFECT_SETTINGS.capture;
      const enemyEl=document.getElementById("opponentSprite");
      resetAdventureEnemyVisualState("capture-start");
      const impactCenter=await animateAdventureCaptureThrow(ballKey, token);
      if(token !== adventure.captureAnimationToken) return false;
      if(success){
        if(enemyEl){
          enemyEl.classList.remove("fainted","faint-dead","enemy-dead","hit","attack-up","attack-down");
          void enemyEl.offsetWidth;
          enemyEl.classList.add("adventure-capture-out");
        }
        await animateAdventureSheetAt(captureEffectRowForBall(ballKey), impactCenter || adventureElementCenter(enemyEl,{x:window.innerWidth*.66,y:window.innerHeight*.42}), {token, frameMs:cfg.successFrameMs, size:cfg.ballDisplaySize, className:"soft-impact"});
      }else{
        await animateAdventureSheetAt(3, impactCenter || adventureElementCenter(enemyEl,{x:window.innerWidth*.66,y:window.innerHeight*.42}), {token, frameMs:cfg.breakoutFrameMs, size:cfg.ballDisplaySize, className:"soft-impact"});
        resetAdventureEnemyAfterCaptureFailure();
      }
      return token === adventure.captureAnimationToken;
    }catch(err){
      console.warn("[Adventure Capture FX] fallback", err);
      return true;
    }finally{
      if(!success) resetAdventureEnemyAfterCaptureFailure();
      clearAdventureCaptureEffects();
      if(!success) resetAdventureEnemyAfterCaptureFailure();
    }
  }
  async function playAdventureLevelUpEffect(mon){
    try{
      const settings=adventure.effectSettings || DEFAULT_ADVENTURE_EFFECT_SETTINGS;
      const cfg=settings.levelUp || DEFAULT_ADVENTURE_EFFECT_SETTINGS.levelUp;
      const sprite=document.getElementById("mySprite");
      const center=adventureElementCenter(sprite, {x:window.innerWidth*.38, y:window.innerHeight*.48});
      if(sprite){
        sprite.style.setProperty("--adventure-level-pulse-scale", String(cfg.pulseScale || 1.08));
        sprite.classList.remove("adventure-level-up-pulse");
        void sprite.offsetWidth;
        sprite.classList.add("adventure-level-up-pulse");
      }
      const token=adventure.captureAnimationToken;
      await animateAdventureSheetAt(4, center, {token, frameMs:cfg.frameMs, size:cfg.displaySize, className:"level-up-fx"});
      if(sprite) setTimeout(()=>sprite.classList.remove("adventure-level-up-pulse"), Number(cfg.glowDurationMs||900));
    }catch(err){
      console.warn("[Adventure LevelUp FX] skipped", err);
    }
  }
  function resetAdventureBattleSprites(){
    for(const id of ["mySprite","opponentSprite"]){
      const sprite=document.getElementById(id);
      if(!sprite) continue;
      sprite.classList.remove("adventure-capture-out","captured","capture-out","capture-hidden","fainted","faint-dead","enemy-dead","mine-dead","defeated","hidden","fade-out","shrink-out","switching-out","hit","shake","attack","faint","fainting","switch-out","switch-in","attack-up","attack-down");
      sprite.style.visibility=""; sprite.style.opacity=""; sprite.style.pointerEvents=""; sprite.style.filter=""; sprite.style.transform=""; sprite.style.animation=""; sprite.style.display="";
    }
    document.querySelectorAll(".ghost-clone").forEach(el=>el.remove());
  }

  function bumpAdventureRenderToken(reason="render"){
    adventure.renderToken = Number(adventure.renderToken || 0) + 1;
    console.debug?.("[Adventure Switch] render token", {reason, token:adventure.renderToken});
    return adventure.renderToken;
  }

  function clearAdventurePlayerVisualState(reason="switch"){
    visualState = null;
    faintPending = {p1:false,p2:false};
    const sprite=document.getElementById("mySprite");
    if(sprite){
      sprite.classList.remove("adventure-capture-out","fainted","faint-dead","mine-dead","enemy-dead","defeated","hidden","switching-out","switch-out","switch-in","hit","shake","attack","faint","fainting","attack-up","attack-down");
      sprite.style.visibility=""; sprite.style.opacity=""; sprite.style.pointerEvents=""; sprite.style.filter=""; sprite.style.transform="";
    }
    document.querySelectorAll(".ghost-clone").forEach(el=>el.remove());
    console.debug?.("[Adventure Switch] player visual state cleared", {reason, active:playerMon()?.name, activeIndex:currentPlayer()?.activeIndex});
  }

  function calculateAdventureExp(enemy, resultType="defeat"){
    const base = Number(enemy?.baseExperience || enemy?.base_experience || adventure.expTable?.[enemy?.apiName]?.baseExperience || adventure.expTable?.[enemy?.name]?.baseExperience || 50);
    const level = Number(enemy?.level || 5);
    const stage = Number(adventure.stage || 1);
    const stageMultiplier = 1 + stage * 0.015;
    const legacyBoost = 3;
    const band = adventureExpStageBand(stage);
    const cfg = adventure.expBalance || normalizeAdventureExpBalance({});
    const modeMultiplier = resultType === "capture" ? Number(cfg.captureExpMultiplierByStage?.[band] || 1) : Number(cfg.battleExpMultiplierByStage?.[band] || 1);
    const bossMultiplier = stage % adventure.bossEvery === 0 ? Number(cfg.bossExpMultiplier || 1.35) : 1;
    const raw = Math.floor((base * level / 7) * stageMultiplier * legacyBoost * modeMultiplier * bossMultiplier);
    const minExp = resultType === "capture" ? Number(cfg.minCaptureExp || 30) : Number(cfg.minBattleExp || 35);
    return Math.max(minExp, raw);
  }
  function applyAdventureLevelStats(mon, oldStats){
    const beforeMax = Number(mon.maxHp || mon.stats?.hp || 1);
    const stats = calculateAdventureStatsFromBase(baseStatsForPokemon(mon), Number(mon.level || 5));
    mon.baseStats = baseStatsForPokemon(mon);
    mon.stats = { hp:stats.maxHp, attack:stats.attack, defense:stats.defense, speed:stats.speed };
    ensureAdventureBonusStats(mon);
    mon.maxHp = stats.maxHp + Number(mon.adventureEarlyHpBonus||0) + Number(mon.adventureBonusStats.hp||0);
    const hpGain = Math.max(1, mon.maxHp - beforeMax);
    mon.hp = Math.min(mon.maxHp, Number(mon.hp || 0) + hpGain);
    return { hpGain, attackGain: stats.attack - Number(oldStats?.attack || 0), defenseGain: stats.defense - Number(oldStats?.defense || 0), speedGain: stats.speed - Number(oldStats?.speed || 0) };
  }
  function syncAdventureTeamState(){
    if(currentState?.players?.p1){
      currentState.players.p1.team=clone(adventure.team);
      currentState.players.p1.activeIndex=adventure.activeIndex||0;
      currentState.logs=[...adventure.log];
    }
  }
  function adventureTeamIndexOf(mon){
    const idx=(adventure.team||[]).findIndex(p=>p===mon);
    if(idx>=0) return idx;
    return (adventure.team||[]).findIndex(p=>p && mon && Number(p.id)===Number(mon.id) && p.name===mon.name && Number(p.level)===Number(mon.level));
  }
  function adventureLearnsetFor(mon){
    if(!mon) return [];
    const keys=[mon.name, mon.apiName, String(mon.id||"")].filter(Boolean);
    for(const key of keys){
      const rows=adventure.levelupLearnsets?.[key];
      if(Array.isArray(rows) && rows.length) return rows;
    }
    const full=adventureLearnsetRecordForPokemon(mon) || {};
    const levelMoves=(full.levelUp||[]).map(x=>typeof x==="string"?x:(x?.move||x?.name)).filter(Boolean);
    if(levelMoves.length){
      const levels=[1,5,8,12,16,21,26,32,38,45,52,60];
      return levelMoves.map((move,i)=>({level:levels[Math.min(i,levels.length-1)] + Math.max(0,i-levels.length+1)*8, move}));
    }
    return [];
  }
  function adventureLevelUpMoveNamesForPokemon(mon, level=100){
    const keys=[mon?.name, mon?.apiName, String(mon?.id||"")].filter(Boolean);
    const names=[];
    for(const key of keys){
      const rows=adventure.levelupLearnsets?.[key];
      if(Array.isArray(rows)){
        for(const row of rows){
          const lv=Number(row.level || row.level_learned_at || 0);
          if(lv<=Number(level||100)) names.push(row.move || row.id || row.name);
        }
      }
    }
    const full=adventureLearnsetRecordForPokemon(mon) || {};
    for(const row of (full.levelUp||[])){
      if(typeof row === "string") names.push(row);
      else if(Number(row.level || row.level_learned_at || 0)<=Number(level||100)) names.push(row.move || row.name || row.id);
      else if(!Number(row.level || row.level_learned_at || 0)) names.push(row.move || row.name || row.id);
    }
    return [...new Set(names.filter(Boolean))];
  }
  function validateLevelUpMoveForPokemon(mon, move, level=100){
    if(!mon || !move) return false;
    const allowed=adventureLevelUpMoveNamesForPokemon(mon, level).map(adventureMoveKey).filter(Boolean);
    const keys=[move.name, move.id, move.apiName].filter(Boolean).map(adventureMoveKey).filter(Boolean);
    if(!keys.some(k=>allowed.includes(k))) return false;
    return validateMoveForPokemon(mon, move, level, {allowFallback:false});
  }
  function adventureLevelMovesBetween(mon, fromLevel, toLevel){
    const known=new Set((mon.moves||[]).map(m=>String(m.id||m.name).toLowerCase()));
    const seen=new Set();
    const rows=adventureLearnsetFor(mon);
    const out=[];
    for(const row of rows){
      const lv=Number(row.level || row.level_learned_at || 0);
      if(lv<=Number(fromLevel||0) || lv>Number(toLevel||0)) continue;
      const move=resolveMoveByName(row.move || row.id || row.name);
      if(!move || isBlockedAdventureMove(move)) continue;
      if(!validateLevelUpMoveForPokemon(mon, move, lv)) continue;
      const key=String(move.id||move.name).toLowerCase();
      if(known.has(key) || seen.has(key)) continue;
      seen.add(key); out.push({...normalizeMove(move), pp:move.maxPp, maxPp:move.maxPp, learnLevel:lv});
    }
    out.sort((a,b)=>Number(a.learnLevel||0)-Number(b.learnLevel||0));
    return out;
  }
  function adventureMoveTierScore(move){
    if(!move) return 0;
    const id=String(move.id||"");
    const tiers=adventure.moveTiers || {};
    if((tiers.rare||[]).includes(id)) return 5;
    if((tiers.high||[]).includes(id)) return 4;
    if((tiers.mid||[]).includes(id)) return 3;
    if((tiers.early||[]).includes(id)) return 2;
    const power=Number(move.power||0);
    if(power>=85) return 5;
    if(power>=65) return 4;
    if(power>=45) return 3;
    if(power>0) return 2;
    return 1;
  }
  function countDamagingAdventureMoves(moves){ return (moves||[]).filter(m=>isAdventureDamagingMove(m)).length; }
  function chooseAdventureAutoForgetIndex(mon, newMove){
    const moves=mon.moves||[];
    const newTier=adventureMoveTierScore(newMove);
    let candidates=moves.map((m,idx)=>({m,idx,tier:adventureMoveTierScore(m), damaging:isAdventureDamagingMove(m)}));
    const damagingCount=countDamagingAdventureMoves(moves);
    candidates=candidates.filter(c=>!(c.damaging && damagingCount<=2 && !isAdventureDamagingMove(newMove)));
    candidates.sort((a,b)=>a.tier-b.tier || a.idx-b.idx);
    const pick=candidates[0];
    if(!pick) return -1;
    if(newTier < pick.tier && moves.length>=4) return -1;
    return pick.idx;
  }
  function autoLearnAdventureMove(mon, move, logs=adventure.log){
    if(!mon || !move) return false;
    mon.moves=Array.isArray(mon.moves)?mon.moves:[];
    const normalized={...normalizeMove(move), pp:move.maxPp, maxPp:move.maxPp};
    if(!validateMoveForPokemon(mon, normalized, mon.level||100, {allowFallback:false})) return false;
    if(mon.moves.some(m=>m.id===normalized.id || m.name===normalized.name)) return false;
    if(mon.moves.length<4){
      mon.moves.push(normalized);
      logs.push(`${mon.name}은/는 ${normalized.name}을/를 배웠다!`);
      return true;
    }
    const idx=chooseAdventureAutoForgetIndex(mon, normalized);
    if(idx<0 || !mon.moves[idx]) return false;
    const old=mon.moves[idx];
    mon.moves[idx]=normalized;
    logs.push(`${mon.name}은/는 ${old.name}을/를 잊고 ${normalized.name}을/를 배웠다!`);
    return true;
  }
  function autoLearnAdventureLevelMoves(mon, oldLevel, newLevel, logs=adventure.log){
    let learned=0;
    for(const move of adventureLevelMovesBetween(mon, oldLevel, newLevel)){
      if(autoLearnAdventureMove(mon, move, logs)) learned++;
    }
    return learned;
  }
  function enqueueAdventureGrowthEvents(mon, oldLevel, newLevel){
    const idx=adventureTeamIndexOf(mon);
    if(idx<0) return;
    const learnMoves=adventureLevelMovesBetween(mon, oldLevel, newLevel);
    for(const move of learnMoves){
      adventure.growthQueue.push({type:"learnMove", monIndex:idx, move});
    }
    const evo=getAdventureEvolutionInfo(mon);
    const need=Number(evo?.level || evo?.minLevel || 0);
    if(evo && need && Number(newLevel||0)>=need){
      adventure.growthQueue.push({type:"evolution", monIndex:idx});
    }
    syncAdventureTeamState();
  }
  function afterAdventureGrowthDefault(){
    adventure.growthProcessing=false;
    adventure.afterGrowthCallback=null;
    adventure.phase=adventure.pendingReward ? "reward" : "battle";
    syncAdventureTeamState();
    renderBattleView(); resetAdventureBattleSprites(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
  }
  function continueAdventureGrowthQueue(callback, options={}){
    const force=!!options.force;
    if(callback){
      adventure.afterGrowthCallback=callback;
      console.info?.("[Adventure/Capture] post battle continuation stored", { phase:adventure.phase, floor:adventure.stage, growthQueueLength:(adventure.growthQueue||[]).length });
    }
    if(adventure.growthProcessing && !force) return;
    adventure.growthProcessing=true;
    adventure.learnMoveResolving=false;
    const event=(adventure.growthQueue||[]).shift();
    if(!event){
      const done=adventure.afterGrowthCallback;
      adventure.growthProcessing=false;
      adventure.afterGrowthCallback=null;
      adventure.pendingLevelMove=null;
      adventure.learnMoveResolving=false;
      console.info?.("[Adventure/GrowthQueue] empty", { phase:adventure.phase, floor:adventure.stage, hasContinuation:typeof done === "function" });
      if(typeof done === "function"){
        if(adventure.postBattleContinuationRunning){
          console.warn?.("[Adventure/Continuation] skipped duplicate continuation", { phase:adventure.phase, floor:adventure.stage });
          return;
        }
        adventure.postBattleContinuationRunning=true;
        console.info?.("[Adventure/Continuation] running post battle continuation", { phase:adventure.phase, floor:adventure.stage });
        try{ return done(); }
        finally{ adventure.postBattleContinuationRunning=false; }
      }
      return afterAdventureGrowthDefault();
    }
    if(event.type==="learnMove"){
      const mon=adventure.team?.[event.monIndex];
      const move=event.move;
      console.info?.("[Adventure/GrowthQueue] learnMove started", { phase:adventure.phase, floor:adventure.stage, monName:mon?.name, moveName:move?.name, growthQueueLength:(adventure.growthQueue||[]).length });
      if(!mon || !move || (mon.moves||[]).some(m=>m.id===move.id || m.name===move.name)) return continueAdventureGrowthQueue(null,{force:true});
      if(!validateLevelUpMoveForPokemon(mon, move, Number(mon.level||100))) return continueAdventureGrowthQueue(null,{force:true});
      adventure.pendingLevelMove={monIndex:event.monIndex, move};
      adventure.phase="learnMove";
      adventure.learnMoveResolving=false;
      setMessage(`${mon.name}은/는 ${move.name}을/를 배우려고 한다!`, true);
      syncAdventureTeamState();
      renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
      return;
    }
    if(event.type==="evolution"){
      const mon=adventure.team?.[event.monIndex];
      if(!mon) return continueAdventureGrowthQueue(null,{force:true});
      const evo=getAdventureEvolutionInfo(mon);
      const need=Number(evo?.level || evo?.minLevel || 0);
      if(!evo || !need || Number(mon.level||0)<need) return continueAdventureGrowthQueue(null,{force:true});
      adventure.phase="evolving";
      syncAdventureTeamState();
      playAdventureEvolutionSequence(mon, evo).then(()=>continueAdventureGrowthQueue(null,{force:true})).catch(err=>{ console.warn("[Adventure Evolution FX] fallback", err); evolveAdventurePokemon(mon, evo, adventure.log); syncAdventureTeamState(); continueAdventureGrowthQueue(null,{force:true}); });
      renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
      return;
    }
    return continueAdventureGrowthQueue(null,{force:true});
  }
  function finishAdventureLevelMoveChoice(){
    console.info?.("[Adventure/GrowthQueue] learnMove completed", { phase:adventure.phase, floor:adventure.stage, growthQueueLength:(adventure.growthQueue||[]).length, hasContinuation:typeof adventure.afterGrowthCallback === "function" });
    adventure.learnMoveResolving=false;
    syncAdventureTeamState();
    renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
    return continueAdventureGrowthQueue(null,{force:true});
  }
  function adventureAcceptLevelMove(){
    if(adventure.learnMoveResolving) return;
    const pending=adventure.pendingLevelMove; const mon=adventure.team?.[pending?.monIndex]; const move=pending?.move;
    if(!pending || !mon || !move){ adventure.pendingLevelMove=null; return continueAdventureGrowthQueue(null,{force:true}); }
    adventure.learnMoveResolving=true;
    mon.moves=mon.moves||[];
    if(!validateLevelUpMoveForPokemon(mon, move, Number(mon.level||100))){
      adventure.log.push(`${mon.name}은/는 ${move.name}을/를 배울 수 없다.`);
      adventure.pendingLevelMove=null; return finishAdventureLevelMoveChoice();
    }
    if(mon.moves.some(m=>m.id===move.id || m.name===move.name)){
      adventure.log.push(`${mon.name}은/는 이미 ${move.name}을/를 알고 있다.`);
      adventure.pendingLevelMove=null; return finishAdventureLevelMoveChoice();
    }
    if(mon.moves.length<4){
      mon.moves.push({...normalizeMove(move), pp:move.maxPp, maxPp:move.maxPp});
      adventure.log.push(`${mon.name}은/는 ${move.name}을/를 배웠다!`);
      adventure.pendingLevelMove=null; return finishAdventureLevelMoveChoice();
    }
    adventure.learnMoveResolving=false;
    adventure.phase="learnForget";
    syncAdventureTeamState();
    renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
  }
  function adventureSkipLevelMove(){
    if(adventure.learnMoveResolving) return;
    const pending=adventure.pendingLevelMove; const mon=adventure.team?.[pending?.monIndex]; const move=pending?.move;
    adventure.learnMoveResolving=true;
    if(mon && move) adventure.log.push(`${mon.name}은/는 ${move.name}을/를 배우지 않았다.`);
    adventure.pendingLevelMove=null; return finishAdventureLevelMoveChoice();
  }
  function adventureForgetLevelMove(idx){
    if(adventure.learnMoveResolving) return;
    const pending=adventure.pendingLevelMove; const mon=adventure.team?.[pending?.monIndex]; const move=pending?.move; const forgetIndex=Number(idx);
    if(!pending || !mon || !move || !mon.moves?.[forgetIndex]) return adventureSkipLevelMove();
    adventure.learnMoveResolving=true;
    if(!validateLevelUpMoveForPokemon(mon, move, Number(mon.level||100))){
      adventure.log.push(`${mon.name}은/는 ${move.name}을/를 배울 수 없다.`);
      adventure.pendingLevelMove=null; return finishAdventureLevelMoveChoice();
    }
    const old=mon.moves[forgetIndex];
    mon.moves[forgetIndex]={...normalizeMove(move), pp:move.maxPp, maxPp:move.maxPp};
    adventure.log.push(`${mon.name}은/는 ${old.name}을/를 잊었다!`);
    adventure.log.push(`${mon.name}은/는 ${move.name}을/를 배웠다!`);
    adventure.pendingLevelMove=null; return finishAdventureLevelMoveChoice();
  }
  async function playAdventureEvolutionSequence(mon, evo){
    const beforeName=mon?.name || "포켓몬";
    const beforeSprite=mon?.frontSprite || mon?.backSprite || "";
    adventure.log.push(`어라...? ${beforeName}의 상태가...`);
    syncAdventureTeamState(); renderAdventureLogs();
    const overlay=document.createElement("div");
    overlay.className="adventure-evolution-overlay";
    overlay.innerHTML=`<div class="adventure-evolution-flash"></div><div class="adventure-evolution-card"><div style="font-size:22px;">어라...? ${escapeHtml(beforeName)}의 상태가...</div>${beforeSprite?`<img class="adventure-evolution-sprite" src="${escapeHtml(beforeSprite)}" alt="">`:""}<div style="font-size:15px;color:#bfdbfe;">진화의 빛이 포켓몬을 감쌉니다!</div></div>`;
    document.body.appendChild(overlay);
    setMessage(`어라...? ${beforeName}의 상태가...`, true);
    await sleep(2600);
    const evolved=evolveAdventurePokemon(mon, evo, adventure.log);
    syncAdventureTeamState();
    renderBattleView(); resetAdventureBattleSprites(); renderAdventureLogs();
    const card=overlay.querySelector(".adventure-evolution-card");
    if(card) card.innerHTML=`<div style="font-size:24px;">축하합니다!</div>${mon?.frontSprite?`<img class="adventure-evolution-sprite" style="filter:brightness(1.25) drop-shadow(0 0 28px rgba(250,204,21,.9));" src="${escapeHtml(mon.frontSprite)}" alt="">`:""}<div style="font-size:20px;">${escapeHtml(beforeName)}은/는 ${escapeHtml(mon?.name||"새 포켓몬")}(으)로 진화했다!</div>`;
    await sleep(900);
    overlay.remove();
    if(!evolved) throw new Error("evolution failed");
  }
  function gainAdventureExp(mon, amount, logs, options={}){
    if(!mon || !amount) return;
    const wasFainted=options.faintedBefore ?? (mon.fainted || getAdventurePokemonHp(mon)<=0);
    mon.exp = Number(mon.exp || 0) + Number(amount || 0);
    mon.expToNext = Number(mon.expToNext || getAdventureExpToNext(mon.level || 5));
    logs.push(`${mon.name}이/가 ${options.shared?"학습장치로 ":""}${amount} EXP를 얻었다!`);
    let guard=0;
    while(mon.exp >= mon.expToNext && guard++ < 20){
      mon.exp -= mon.expToNext;
      const oldLevel = Number(mon.level || 5);
      const oldStats = {...(mon.stats||{}), hp:mon.maxHp};
      mon.level = oldLevel + 1;
      mon.expToNext = getAdventureExpToNext(mon.level);
      const gain = applyAdventureLevelStats(mon, oldStats);
      const levelHeal=Math.max(1, Math.floor(Number(mon.maxHp||1)*Number(adventureExpShareConfig().reviveOnLevelUpHpRate ?? 0.25)));
      if(wasFainted || mon.fainted || Number(mon.hp||0)<=0){ mon.hp=levelHeal; mon.fainted=false; logs.push(`${mon.name}이/가 힘을 내어 다시 일어났다!`); }
      else mon.hp=Math.min(mon.maxHp, Number(mon.hp||0)+levelHeal);
      logs.push(`${mon.name}이/가 Lv.${mon.level}이 되었다! HP +${gain.hpGain} / 공격 ${gain.attackGain>=0?"+":""}${gain.attackGain} / 방어 ${gain.defenseGain>=0?"+":""}${gain.defenseGain} / 스피드 ${gain.speedGain>=0?"+":""}${gain.speedGain}`);
      logs.push(`${mon.name}이/가 레벨업하며 HP를 ${levelHeal} 회복했다!`);
      if(!options.shared) playAdventureLevelUpEffect(mon);
      enqueueAdventureGrowthEvents(mon, oldLevel, mon.level);
    }
  }
  function levelUpAdventurePokemonByCandy(mon, logs){
    if(!mon) return;
    const oldLevel=Number(mon.level||5);
    const oldStats={...(mon.stats||{}), hp:mon.maxHp};
    mon.level=oldLevel+1;
    mon.expToNext=getAdventureExpToNext(mon.level);
    const wasFainted=mon.fainted || getAdventurePokemonHp(mon)<=0;
    const gain=applyAdventureLevelStats(mon, oldStats);
    const levelHeal=Math.max(1, Math.floor(Number(mon.maxHp||1)*Number(adventureExpShareConfig().reviveOnLevelUpHpRate ?? 0.25)));
    if(wasFainted){ mon.hp=levelHeal; mon.fainted=false; logs.push(`${mon.name}이/가 힘을 내어 다시 일어났다!`); }
    else mon.hp=Math.min(mon.maxHp, Number(mon.hp||0)+levelHeal);
    logs.push(`${mon.name}이/가 이상한사탕을 먹고 Lv.${mon.level}이 되었다! HP +${gain.hpGain} / 공격 ${gain.attackGain>=0?"+":""}${gain.attackGain} / 방어 ${gain.defenseGain>=0?"+":""}${gain.defenseGain} / 스피드 ${gain.speedGain>=0?"+":""}${gain.speedGain}`);
    logs.push(`${mon.name}이/가 레벨업하며 HP를 ${levelHeal} 회복했다!`);
    if(mon === adventure.team?.[adventure.activeIndex||0] || currentState?.players?.p1?.activeIndex === adventure.activeIndex) playAdventureLevelUpEffect(mon);
    enqueueAdventureGrowthEvents(mon, oldLevel, mon.level);
  }
  function getAdventureExpShareRate(){ const c=adventureExpShareConfig(); const base=Number(c.baseBenchRate ?? adventure.expBalance?.expShareBaseBenchRate ?? 0.45); const per=Number(c.ratePerStack ?? 0.1); return Math.min(0.95, base + Number(adventure.expShareLevel||0)*per); }
  function awardAdventureExp(resultType, defeatedEnemy){
    const amount=calculateAdventureExp(defeatedEnemy || adventure.enemy, resultType);
    const activeIdx=Number(adventure.activeIndex||0);
    const rate=getAdventureExpShareRate();
    for(let i=0;i<(adventure.team||[]).length;i++){
      const mon=adventure.team[i]; if(!mon) continue;
      let exp=0;
      const fainted=mon.fainted || getAdventurePokemonHp(mon)<=0;
      if(i===activeIdx) exp=amount;
      else exp=Math.floor(amount * (fainted ? rate*0.5 : rate));
      if(exp>0) gainAdventureExp(mon, exp, adventure.log, {shared:i!==activeIdx, faintedBefore:fainted});
    }
    if(currentState?.players?.p1){
      currentState.players.p1.team=clone(adventure.team);
      currentState.players.p1.activeIndex=adventure.activeIndex||0;
      currentState.logs=[...adventure.log];
    }
  }
  function getAdventureEvolutionInfo(mon){
    if(!mon) return null;
    return adventure.evolutions?.[mon.apiName] || adventure.evolutions?.[mon.name] || adventure.evolutions?.[String(mon.id||"")] || null;
  }
  function resolveAdventureEvolutionTarget(evo){
    if(!evo) return null;
    const candidates=[evo.toId, evo.id, evo.toApiName, evo.toName, evo.to].filter(v=>v!=null && String(v).trim()!=="");
    for(const c of candidates){
      const found=findAdventureBasePokemonByIdOrName(c);
      if(found) return found;
    }
    return null;
  }
  function evolveAdventurePokemon(mon, evo, logs){
    const target=resolveAdventureEvolutionTarget(evo);
    if(!mon || !target){
      logs?.push(`${mon?.name || "포켓몬"}은/는 진화할 수 있을 것 같지만 데이터가 부족합니다.`);
      console.warn('[Adventure Evolution] missing target data', {mon, evo});
      return false;
    }
    const beforeName=mon.name;
    const oldMax=Number(mon.maxHp||1);
    const hpRatio=Math.max(0, Math.min(1, Number(mon.hp||0)/Math.max(1, oldMax)));
    const bonus={...(mon.adventureBonusStats||{})};
    const status=mon.status;
    const volatile={...(mon.volatile||{})};
    const keptMoves=(mon.moves||[]).map(normalizeMove);
    mon.id=target.id; mon.apiName=target.apiName; mon.name=target.name;
    mon.types=[...(target.types||["normal"])];
    mon.frontSprite=target.frontSprite; mon.backSprite=target.backSprite || target.frontSprite;
    mon.spriteScale=target.spriteScale || 1;
    mon.renderProfileKey=target.apiName || target.name || String(target.id||"");
    mon.baseStats=baseStatsForPokemon(target);
    mon.adventureBonusStats=bonus;
    const oldStats={...(mon.stats||{}), hp:oldMax};
    applyAdventureLevelStats(mon, oldStats);
    mon.hp=Math.max(1, Math.min(mon.maxHp, Math.round(mon.maxHp * hpRatio) + Math.max(1, mon.maxHp-oldMax)));
    mon.status=status; mon.volatile=volatile; mon.fainted=false;
    mon.moves=keptMoves.length ? keptMoves : enemyMovesFor(target, mon.level||5).map(normalizeMove);
    logs?.push(`${beforeName}의 모습이...?`);
    logs?.push(`${beforeName}은/는 ${mon.name}(으)로 진화했다!`);
    recordAdventureHallOfFamePokemon(mon, {wasActive:true});
    const idx=(adventure.team||[]).findIndex(p=>p===mon || Number(p?.id)===Number(beforeName?.id));
    if(currentState?.players?.p1?.team?.[adventure.activeIndex||0] && (adventure.team?.[adventure.activeIndex||0]===mon || currentState.players.p1.activeIndex===adventure.activeIndex)){
      currentState.players.p1.team[adventure.activeIndex]=clone(mon);
    }
    return true;
  }
  function checkAdventureEvolution(mon, logs){
    const evo = getAdventureEvolutionInfo(mon);
    if(!evo) return false;
    const need = Number(evo.level || evo.minLevel || 0);
    if(need && Number(mon.level||0) >= need){
      return evolveAdventurePokemon(mon, evo, logs);
    }
    return false;
  }

  function enterAdventureReward(reason){
    if(adventure.moveAnimationStarted && (!adventure.moveAnimationDone || !adventure.damageRenderDone)){
      console.warn?.("[Adventure/Reward] blocked: animation not completed", { reason, phase:adventure.phase, moveAnimationDone:adventure.moveAnimationDone, damageRenderDone:adventure.damageRenderDone });
      return false;
    }
    const rewardReason=String(reason || "");
    const requiresEnemyFaintAnimation=!/포획 성공|capture/i.test(rewardReason);
    if(requiresEnemyFaintAnimation && !adventure.enemyFaintAnimationDone){
      console.warn?.("[Adventure/Reward] blocked: enemy faint animation not completed", { reason, phase:adventure.phase, enemyFaintResolved:adventure.enemyFaintResolved, enemyFaintAnimationDone:adventure.enemyFaintAnimationDone });
      return false;
    }
    if(!canEnterAdventureRewardFromCanonicalHp("enterAdventureReward")){
      return recoverAdventureEnemyAliveFlow("enterAdventureReward-blocked");
    }
    visualState=null;
    faintPending={p1:false,p2:true};
    const enemy=getAdventureCanonicalEnemy("enterAdventureReward-sync");
    if(enemy){ enemy.hp=0; enemy.currentHp=0; enemy.fainted=true; syncAdventureCanonicalEnemyToState(enemy, "enterAdventureReward-sync"); }
    adventure.pendingReward=true;
    adventure.rewardApplying=false;
    adventure.phase="reward";
    adventure._rewardChoices=null;
    if(currentState) currentState.phase="ACTION_SELECT";
    adventure.log.push(reason || `${adventure.stage}층 클리어! 보상을 선택하세요.`);
    if(currentState) currentState.logs=[...adventure.log];
    setMessage("보상을 선택하세요.", false);
    renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
  }
  async function handleAdventureVictory(){
    if(adventure.pendingReward || adventure.phase === "reward") return true;
    if(!canEnterAdventureRewardFromCanonicalHp("handleAdventureVictory")){
      console.warn?.("[Adventure/EXP] blocked: canonical enemy still alive", {reason:"handleAdventureVictory", enemyHp:getAdventureCanonicalEnemy("handleAdventureVictory")?.hp});
      return recoverAdventureEnemyAliveFlow("handleAdventureVictory-blocked");
    }
    if(adventure.moveAnimationStarted && (!adventure.moveAnimationDone || !adventure.damageRenderDone)){
      console.warn?.("[Adventure/Reward] blocked: animation not completed", {reason:"handleAdventureVictory", moveAnimationDone:adventure.moveAnimationDone, damageRenderDone:adventure.damageRenderDone});
      await playAdventureFallbackHitAnimation("p1", "p2", "victory-animation-guard");
      adventure.moveAnimationDone=true;
      adventure.damageRenderDone=true;
    }
    await playAdventureEnemyFaintAnimationSafely("handleAdventureVictory");
    visualState=null;
    const defeatedEnemy=getAdventureCanonicalEnemy("handleAdventureVictory-exp");
    if(!adventure.pendingReward){
      awardAdventureExp("defeat", defeatedEnemy || adventure.enemy || enemyMon());
    }
    if((adventure.growthQueue||[]).length){
      continueAdventureGrowthQueue(()=>enterAdventureReward(`${adventure.stage}층 클리어! 보상을 선택하세요.`));
      return true;
    }
    return enterAdventureReward(`${adventure.stage}층 클리어! 보상을 선택하세요.`);
  }
  function isAdventureTeamAllFainted(){
    const team = Array.isArray(adventure.team) ? adventure.team : [];
    if(!team.length) return true;
    return !team.some(p=>{ if(!p) return false; sanitizeAdventureHp(p); return !p.fainted && getAdventurePokemonHp(p)>0; });
  }
  function hasAdventureBenchAlive(){
    const team = Array.isArray(adventure.team) ? adventure.team : [];
    const activeIdx=Number(adventure.activeIndex || currentState?.players?.p1?.activeIndex || 0);
    return team.some((p,idx)=>{ if(!p || idx===activeIdx) return false; sanitizeAdventureHp(p); return !p.fainted && getAdventurePokemonHp(p)>0; });
  }
  function checkAdventureDefeat(){
    if(!adventure.active) return false;
    return isAdventureTeamAllFainted();
  }
  function playAdventurePlayerFaintAnimation(pokemon, token){
    console.info?.("[Adventure/PlayerFaint] animation start", { pokemonName:pokemon?.name, token });
    return new Promise(resolve=>{
      const el=document.getElementById("mySprite");
      let done=false;
      const finish=()=>{ if(done) return; done=true; if(el) el.removeEventListener("animationend", finish); console.info?.("[Adventure/PlayerFaint] animation finished", { pokemonName:pokemon?.name, token }); resolve(); };
      if(el){ el.classList.remove("fainting","faint","mine-dead","fainted"); void el.offsetWidth; el.addEventListener("animationend", finish, {once:true}); el.classList.add("fainting","mine-dead"); }
      setTimeout(finish, 650);
    });
  }
  async function finalizeAdventurePlayerFaint({reason="unknown", token}={}){
    if(Number(token||0)!==Number(adventure.battleResolutionToken||0)){ console.warn?.("[Adventure/PlayerFaint] finalize ignored by stale token", { reason, token, currentToken:adventure.battleResolutionToken }); return false; }
    console.info?.("[Adventure/PlayerFaint] finalized", { reason, phase:adventure.phase, teamAliveCount:getAliveAdventureTeam().length, playerFaintResolved:adventure.playerFaintResolved });
    syncAdventureTeamState();
    renderBattleView(); renderAdventureLogs(); renderAdventureBag();
    if(isAdventureTeamAllFainted()) return enterAdventureFailPhaseSafely("team-all-fainted");
    if(hasAdventureBenchAlive()) return enterAdventureForceSwitchPhaseSafely("active-fainted-bench-alive");
    return enterAdventureFailPhaseSafely("no-bench-alive");
  }
  async function resolveAdventurePlayerFaintSafely(reason="unknown"){
    if(!adventure.active) return false;
    if(["reward","applyingReward","loadingNext","enemyFainting","advancingFloor"].includes(adventure.phase) || adventure.pendingReward){ console.warn?.("[Adventure/PlayerFaint] blocked by terminal enemy/reward phase", { reason, phase:adventure.phase, pendingReward:adventure.pendingReward }); return false; }
    if(adventure.failResolved) return true;
    commitFromCurrentState();
    const active=adventure.team?.[adventure.activeIndex||0];
    if(!active) return enterAdventureFailPhaseSafely("no-active-pokemon");
    sanitizeAdventureHp(active);
    if(getAdventurePokemonHp(active)>0 && !active.fainted) return false;
    const token=Number(adventure.battleResolutionToken||0);
    adventure.phase="playerFainting"; adventure.playerFaintStarted=true; adventure.playerFaintResolved=false; animationBusy=true;
    if(currentState) currentState.phase="TURN_RESOLVE";
    const faintMsg=`${active.name}이 쓰러졌다!`;
    if(!(adventure.log||[]).includes(faintMsg)) adventure.log.push(faintMsg);
    if(currentState) currentState.logs=[...adventure.log];
    setMessage(`${active.name}이 쓰러졌다!`, true);
    console.info?.("[Adventure/PlayerFaint] active faint detected", { reason, activeName:active.name, activeHp:getAdventurePokemonHp(active), activeMaxHp:active.maxHp, phase:adventure.phase, token });
    renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
    await playAdventurePlayerFaintAnimation(active, token);
    if(Number(token)!==Number(adventure.battleResolutionToken||0)){ animationBusy=false; return true; }
    adventure.playerFaintAnimationDone=true; adventure.playerFaintResolved=true; animationBusy=false;
    return finalizeAdventurePlayerFaint({reason, token});
  }
  function enterAdventureForceSwitchPhaseSafely(reason="unknown"){
    if(!hasAdventureBenchAlive()) return enterAdventureFailPhaseSafely("force-switch-no-bench");
    adventure.phase="switch"; adventure.switchMode="forced"; adventure.pendingReward=false; adventure.playerFaintResolved=true;
    if(currentState) currentState.phase="ACTION_SELECT";
    adventure.log.push("현재 포켓몬이 쓰러졌습니다. 교체할 포켓몬을 선택하세요.");
    if(currentState) currentState.logs=[...adventure.log];
    setMessage("교체할 포켓몬을 선택하세요.", true);
    console.info?.("[Adventure/Switch] active fainted, switch required", { reason, activeIndex:adventure.activeIndex, teamAliveCount:getAliveAdventureTeam().length });
    renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
    return true;
  }
  function enterAdventureFailPhaseSafely(reason="unknown"){
    if(adventure.pendingReward || ["reward","applyingReward","loadingNext","advancingFloor"].includes(adventure.phase)){ console.warn?.("[Adventure/Fail] blocked by reward/enemy defeat phase", { reason, phase:adventure.phase, pendingReward:adventure.pendingReward }); return false; }
    commitFromCurrentState();
    if(!isAdventureTeamAllFainted()){ console.warn?.("[Adventure/Fail] blocked because team is not all fainted", { reason, teamAliveCount:getAliveAdventureTeam().length }); return false; }
    if(adventure.failResolved && adventure.phase==="defeat") return true;
    adventure.failResolved=true; adventure.phase="defeat"; animationBusy=false;
    if(currentState) currentState.phase="GAME_OVER";
    const msg=`모험 실패 · 도달 층 ${adventure.stage}층`;
    if(!(adventure.log||[]).includes(msg)) adventure.log.push(msg);
    if(currentState) currentState.logs=[...adventure.log];
    console.info?.("[Adventure/Fail] adventure failed", { reason, floor:adventure.stage, active:adventure.team?.[adventure.activeIndex||0]?.name });
    renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag(); showAdventureFailOverlay();
    return true;
  }
  function handleAdventurePlayerFainted(){
    return resolveAdventurePlayerFaintSafely("legacy-handler");
  }
  function handleAdventureDefeat(){
    return enterAdventureFailPhaseSafely("legacy-defeat-handler");
  }

  function showAdventureFailOverlay(title="모험 실패", desc){
    const overlay=document.getElementById("overlay");
    if(!overlay) return;
    const equips=Object.entries(adventure.adventureEquipment||{}).filter(([,v])=>Number(v)>0).map(([k,v])=>`${equipmentDef(k).name||k} x${v}`).join(", ") || "없음";
    overlay.innerHTML=`<div class="modal adventure-fail-box"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(desc||`도달 층: ${adventure.stage}층`)}</p><div class="result" style="text-align:left;white-space:pre-wrap;">포획/보유 포켓몬: ${(adventure.team||[]).length}마리\n획득 장비: ${escapeHtml(equips)}</div><div class="adventure-fail-actions"><button onclick="startAdventureMode()">다시하기</button><button onclick="startAdventureMode()">새 모험 시작</button><button onclick="adventureReturnLobby()">로비로 돌아가기</button></div></div>`;
    overlay.classList.add("show");
  }

  function applyAdventureRewardEffect(reward){
    if(!reward) return;
    if(reward.equipment){
      addAdventureEquipment(reward.equipment, Number(reward.amount||1));
      return;
    }
    if(reward.tm){ return; }
    if(reward.item==="expShare"){
      adventure.expShareLevel=Math.min(5, Number(adventure.expShareLevel||0)+1);
      adventure.log.push(`학습장치 강화! 대기 포켓몬 EXP 비율 ${Math.round(getAdventureExpShareRate()*100)}%`);
      return;
    }
    if(reward.item==="rareCandy"){
      const mon=adventure.team?.[adventure.activeIndex||0];
      if(mon) levelUpAdventurePokemonByCandy(mon, adventure.log);
      return;
    }
    if(reward.item){
      adventure.bag[reward.item]=(adventure.bag[reward.item]||0)+Number(reward.amount||1);
    }
  }
  function addAdventureEquipment(id, amount=1){
    const def=equipmentDef(id);
    const current=Number(adventure.adventureEquipment?.[id]||0);
    const max=Number(def.maxStacks||99);
    adventure.adventureEquipment[id]=Math.min(max,current+Number(amount||1));
    adventure.log.push(`${def.name||id} 획득! 현재 ${adventure.adventureEquipment[id]}개 보유.`);
  }

  async function chooseAdventureReward(idx){
    const reward=adventure._rewardChoices?.[idx];
    if(!reward || adventure.rewardApplying || !adventure.pendingReward) return;
    adventure.rewardApplying=true;
    adventure.phase="applyingReward";
    renderAdventureButtons();
    try{
      if(reward.tm){
        adventure.pendingTmReward=reward;
        adventure.pendingReward=false;
        adventure.rewardApplying=false;
        adventure.phase="tmSelect";
        adventure.log.push(`${rewardDisplayTitle(reward)}을/를 선택했다.`);
        if(currentState) currentState.logs=[...adventure.log];
        renderAdventureButtons(); renderAdventureLogs();
        return;
      }
      applyAdventureRewardEffect(reward);
      adventure.log.push(`${rewardDisplayTitle(reward)}: ${reward.desc || "보상"} 획득`);
      if((adventure.growthQueue||[]).length){
        continueAdventureGrowthQueue(()=>advanceAdventureStage());
        return;
      }
      await advanceAdventureStage();
    }catch(err){
      console.error("apply adventure reward failed", err);
      adventure.log.push(`보상 처리 오류: ${err.message || err}`);
      adventure.phase="reward";
      adventure.pendingReward=true;
      adventure.rewardApplying=false;
      if(currentState) currentState.logs=[...adventure.log];
      setMessage("보상 처리 중 오류가 발생했습니다. 다시 선택해주세요.", true);
      renderBattleView(); renderAdventureButtons(); renderAdventureLogs();
    }
  }
  async function advanceAdventureStage(){
    if(!canEnterAdventureRewardFromCanonicalHp("advanceAdventureStage")){
      console.warn?.("[Adventure/Floor] blocked: canonical enemy still alive", {reason:"advanceAdventureStage", enemyHp:getAdventureCanonicalEnemy("advanceAdventureStage")?.hp});
      return recoverAdventureEnemyAliveFlow("advanceAdventureStage-blocked");
    }
    adventure.stage += 1;
    adventure.pendingReward=false;
    adventure.rewardApplying=false;
    adventure._rewardChoices=null;
    adventure.pendingCaptured=null;
    adventure.pendingTmReward=null;
    adventure.pendingTmTargetIndex=null;
    nextAdventureCaptureToken("advance-stage");
    clearAdventureCaptureEffects();
    adventure.enemy=null;
    adventure.phase="loadingNext";
    if(adventure.stage>adventure.maxStage){ showAdventureHallOfFameOverlay(); return; }
    setMessage(`${adventure.stage}층으로 이동합니다.`, false);
    await sleep(120);
    startAdventureFloor();
  }

  function finishAdventureItemTurn(oldState, events=[]){
    if(currentState) currentState.logs=[...adventure.log];
    if(events.length){
      prepareVisualState(oldState);
      enqueueAdventureEventsSafely(events, {reason:"item-turn-events", attackerSide:"p2", defenderSide:"p1"}).then(()=>{
        commitFromCurrentState();
        if(adventure.active && adventure.phase==="battle" && enemyMon() && !isAdventureCanonicalEnemyDefeated("item-turn-check") && playerMon() && !playerMon().fainted){
          resolveAdventureEnemyOnlyTurn(clone(currentState));
        }else{
          renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
        }
      });
    }else{
      commitFromCurrentState();
      if(adventure.active && adventure.phase==="battle" && enemyMon() && !isAdventureCanonicalEnemyDefeated("item-turn-check-noevents") && playerMon() && !playerMon().fainted){
        resolveAdventureEnemyOnlyTurn(clone(currentState));
      }else{
        renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
      }
    }
  }
  function allAdventureTmIdsForStage(stage=adventure.stage){
    const s=Number(stage||1);
    const tr=adventure.tmRewards || {};
    const early=tr.early || ["tackle","scratch","quickAttack","waterGun","bubble","ember","smallFlame","vineWhip","absorb","thunderShock","poisonSting","peck","gust","rockThrow","mudSlap","confusion","lick","leechLife","stringShot","growl","tailWhip","smokescreen"];
    const mid=tr.mid || ["doubleKick","bulletSeed","pinMissile","icicleSpear","rockBlast","metalClaw","bite","flameCharge","shockWave","megaDrain","swift","rockTomb","mudBomb","hypnosis","poisonPowder","thunderWave","scaryFace","screech","agility"];
    const high=tr.high || ["swordsDance","ironDefense","bulkUp","powerUpPunch","crunch","flameWheel","waterPulse","aerialAce","shadowPunch","drainPunch","rockSlide"];
    const rare=tr.rare || ["flamethrower","thunderbolt","iceBeam","surf","earthquake","stoneEdge","shadowBall","psychic","dragonPulse"];
    if(s<=10) return early;
    if(s<=30) return [...early,...mid];
    if(s<=60) return [...mid,...high];
    return [...mid,...high,...rare];
  }
  function canPokemonLearnAdventureTm(mon, move){
    if(!mon || !move) return false;
    if((mon.moves||[]).some(m=>m.id===move.id || m.name===move.name)) return false;
    const cfg=adventureMoveConfigFor(mon);
    if(Array.isArray(cfg?.blockedMoves) && cfg.blockedMoves.some(x=>String(x)===move.id || String(x)===move.name)) return false;
    if(Array.isArray(cfg?.tmAllowed) && cfg.tmAllowed.some(x=>String(x)===move.id || String(x)===move.name)) return true;
    return validateMoveForPokemon(mon, move, mon.level || 100, {allowFallback:false});
  }
  function generateAdventureTmReward(){
    const team=adventure.team||[];
    const ids=shuffle(allAdventureTmIdsForStage(adventure.stage));
    for(const id of ids){
      const move=resolveMoveByName(id); if(!move || isBlockedAdventureMove(move)) continue;
      if(team.some(p=>canPokemonLearnAdventureTm(p,move))){ return {id:`tm_${move.id}`, kind:"tm", tm:move.id, title:`기술머신: ${move.name}`, desc:`${typeKo(move.type)} / ${move.power>0?"위력 "+move.power:"변화기"}`}; }
    }
    return null;
  }
  function chooseAdventureTmTarget(idx){
    const reward=adventure.pendingTmReward; const move=adventure.moveMap?.[reward?.tm] || resolveMoveByName(reward?.tm);
    const mon=adventure.team?.[idx];
    if(!reward || !move || !mon || !canPokemonLearnAdventureTm(mon,move)){ adventure.log.push("이 포켓몬은 해당 기술머신을 사용할 수 없습니다."); renderAdventureButtons(); renderAdventureLogs(); return; }
    adventure.pendingTmTargetIndex=Number(idx);
    mon.moves=mon.moves||[];
    if(mon.moves.length<4){ learnAdventureTmMove(idx, -1); return; }
    adventure.phase="tmForget";
    renderAdventureButtons(); renderAdventureLogs();
  }
  function learnAdventureTmMove(idx, forgetIndex){
    const reward=adventure.pendingTmReward; const move=normalizeMove(adventure.moveMap?.[reward?.tm] || resolveMoveByName(reward?.tm));
    const mon=adventure.team?.[idx]; if(!reward || !move || !mon) return;
    mon.moves=mon.moves||[];
    if(mon.moves.some(m=>m.id===move.id)){ adventure.log.push(`${mon.name}은/는 이미 ${move.name}을/를 알고 있다.`); }
    else if(forgetIndex>=0 && mon.moves[forgetIndex]){ const old=mon.moves[forgetIndex]; mon.moves[forgetIndex]={...move, pp:move.maxPp, maxPp:move.maxPp}; adventure.log.push(`${mon.name}은/는 ${old.name}을/를 잊고 ${move.name}을/를 배웠다!`); }
    else { mon.moves.push({...move, pp:move.maxPp, maxPp:move.maxPp}); adventure.log.push(`${mon.name}은/는 ${move.name}을/를 배웠다!`); }
    if(currentState?.players?.p1){ currentState.players.p1.team=clone(adventure.team); currentState.logs=[...adventure.log]; }
    adventure.pendingTmReward=null; adventure.pendingTmTargetIndex=null; adventure.phase="applyingReward"; adventure.rewardApplying=true;
    advanceAdventureStage();
  }
  function forgetMoveForAdventureTm(idx){ learnAdventureTmMove(adventure.pendingTmTargetIndex, Number(idx)); }
  function cancelAdventureTmReward(){
    adventure.pendingTmReward=null; adventure.pendingTmTargetIndex=null; adventure.pendingReward=true; adventure.rewardApplying=false; adventure.phase="reward"; renderAdventureButtons(); renderAdventureLogs();
  }

  function itemTargetModeForAdventureItem(item){
    if(!item) return null;
    if(item.kind==="heal") return "singleAlivePokemon";
    if(item.kind==="revive") return "singleFaintedPokemon";
    if(item.kind==="specialEvolution") return "singleSpecialEvolution";
    return null;
  }
  function itemTargetUsability(mon, itemKey){
    const item=adventure.items?.[itemKey];
    const hp=getAdventurePokemonHp(mon);
    if(!mon) return {can:false, reason:"빈 슬롯"};
    if(item?.kind==="heal"){
      if(mon.fainted || hp<=0) return {can:false, reason:"기절 상태"};
      if(hp>=Number(mon.maxHp||0)) return {can:false, reason:"HP 가득 참"};
      return {can:true, reason:"사용 가능"};
    }
    if(item?.kind==="revive"){
      if(mon.fainted || hp<=0) return {can:true, reason:"사용 가능"};
      return {can:false, reason:"기절하지 않음"};
    }
    if(item?.kind==="specialEvolution"){
      const opts=getAdventureSpecialEvolutionOptions(mon,itemKey);
      return opts.length ? {can:true, reason:`${opts.map(o=>o.to).join(" / ")} 가능`} : {can:false, reason:"특수진화 불가"};
    }
    return {can:false, reason:"대상 선택 불필요"};
  }
  function renderAdventureItemTargetSelect(){
    const buttons=document.getElementById("buttons"); if(!buttons) return;
    buttons.classList.add("adventure-reward-mode");
    const key=adventure.pendingItemTarget?.key; const item=adventure.items?.[key] || {};
    const team=adventure.team||[];
    buttons.innerHTML=`<div class="control-title">${escapeHtml(item.name||key)}을/를 누구에게 사용할까요?</div><div class="adventure-choice-grid">${team.map((p,idx)=>{
      const u=itemTargetUsability(p,key); const hp=p?`${getAdventurePokemonHp(p)}/${p.maxHp}`:"-";
      return `<button type="button" class="move-btn ${u.can?"eff-neutral":"eff-immune"}" ${u.can?"":"disabled"} onclick="adventureUseItemOnTarget(${idx})"><b>${escapeHtml(p?.name||"빈 슬롯")}</b><span class="meta">Lv.${p?.level||"-"} / HP ${hp}${p?.fainted?" / 기절":""}<br/>${escapeHtml(u.reason)}</span></button>`;
    }).join("")}</div><button type="button" class="move-btn eff-neutral" onclick="adventureCancelItemTarget()">취소<span class="meta">아이템을 사용하지 않습니다</span></button>`;
  }
  function adventureCancelItemTarget(){
    adventure.pendingItemTarget=null; adventure.phase="battle"; renderAdventureButtons(); renderAdventureLogs(); renderBattleView();
  }
  function getSpecialEvolutionRule(mon){
    if(!mon) return null;
    const keys=[mon.name, mon.apiName, String(mon.id||"")].filter(Boolean);
    for(const k of keys){ if(adventure.specialEvolutions?.[k]) return adventure.specialEvolutions[k]; }
    return null;
  }
  function specialEvolutionTargetExists(opt){
    return !!resolveAdventureEvolutionTarget({to:opt?.to, toApiName:opt?.toApiName, toId:opt?.toId});
  }
  function getAdventureSpecialEvolutionOptions(mon,itemKey){
    const item=adventure.items?.[itemKey]; const itemName=item?.name || itemKey;
    const rule=getSpecialEvolutionRule(mon);
    if(!rule) return [];
    if(rule.method==="branching"){
      return (rule.options||[]).filter(o=>(o.requiredItems||[]).includes(itemName) || (o.requiredItems||[]).includes(itemKey)).filter(specialEvolutionTargetExists);
    }
    const allowed = rule.item===itemName || rule.item===itemKey || rule.universalItem===itemName || rule.universalItem===itemKey || (itemKey==="evolutionLight" && rule.universalItem==="진화의빛");
    if(!allowed) return [];
    return specialEvolutionTargetExists(rule) ? [rule] : [];
  }
  function renderAdventureSpecialEvolutionChoice(){
    const buttons=document.getElementById("buttons"); if(!buttons) return;
    buttons.classList.add("adventure-reward-mode");
    const pending=adventure.pendingSpecialEvolutionChoice || {}; const mon=adventure.team?.[pending.monIndex];
    const opts=pending.options||[];
    buttons.innerHTML=`<div class="control-title">${escapeHtml(mon?.name||"포켓몬")}은/는 어떤 모습으로 진화할까요?</div><div class="adventure-choice-grid">${opts.map((o,idx)=>`<button type="button" class="move-btn eff-super" onclick="adventureChooseSpecialEvolution(${idx})"><b>${escapeHtml(o.to||o.toName||"진화체")}</b><span class="meta">${escapeHtml(o.typeHint||"")} 타입</span></button>`).join("")}</div><button type="button" class="move-btn eff-neutral" onclick="adventureCancelItemTarget()">취소<span class="meta">아이템을 사용하지 않습니다</span></button>`;
  }
  async function applyAdventureSpecialEvolution(monIndex, option){
    const pending=adventure.pendingItemTarget; const key=pending?.key; const item=adventure.items?.[key];
    const mon=adventure.team?.[monIndex];
    if(!mon || !option || !item || (adventure.bag[key]||0)<=0){ adventureCancelItemTarget(); return; }
    const old=clone(pending.oldState || currentState); const events=[];
    adventure.bag[key]-=1;
    adventure.phase="evolving";
    adventure.log.push(`${item.name}이/가 ${mon.name}을/를 감쌌다!`);
    await playAdventureEvolution(mon, option);
    if(currentState?.players?.p1){ currentState.players.p1.team=clone(adventure.team); currentState.players.p1.activeIndex=adventure.activeIndex||0; }
    adventure.pendingItemTarget=null; adventure.pendingSpecialEvolutionChoice=null;
    events.push({id:advEventId(), type:"message", text:`${mon.name}이/가 진화했다!`});
    finishAdventureItemTurn(old, events);
  }
  function adventureUseItemOnTarget(idx){
    const pending=adventure.pendingItemTarget; const key=pending?.key; const item=adventure.items?.[key];
    const mon=adventure.team?.[Number(idx)]; if(!pending || !item || !mon) return;
    const u=itemTargetUsability(mon,key); if(!u.can) return;
    const old=clone(pending.oldState || currentState); const events=[];
    if(item.kind==="heal"){
      adventure.bag[key]-=1;
      const before=getAdventurePokemonHp(mon); mon.hp=Math.min(Number(mon.maxHp||before), before+Number(item.amount||20)); mon.fainted=false;
      const amount=mon.hp-before; adventure.log.push(`${item.name} 사용 · ${mon.name} HP ${amount} 회복`);
      events.push({id:advEventId(), type:"heal", target:"p1", name:mon.name, amount, hp:mon.hp});
      adventure.pendingItemTarget=null; adventure.phase="battle";
      if(currentState?.players?.p1){ currentState.players.p1.team=clone(adventure.team); currentState.players.p1.activeIndex=adventure.activeIndex||0; }
      return finishAdventureItemTurn(old, events);
    }
    if(item.kind==="revive"){
      adventure.bag[key]-=1; const amount=reviveAdventurePokemon(mon, Number(item.reviveRatio||0.5), adventure.log);
      events.push({id:advEventId(), type:"heal", target:"p1", name:mon.name, amount, hp:mon.hp});
      adventure.pendingItemTarget=null; adventure.phase="battle";
      if(currentState?.players?.p1){ currentState.players.p1.team=clone(adventure.team); currentState.players.p1.activeIndex=adventure.activeIndex||0; }
      return finishAdventureItemTurn(old, events);
    }
    if(item.kind==="specialEvolution"){
      const opts=getAdventureSpecialEvolutionOptions(mon,key);
      if(opts.length>1){ adventure.pendingSpecialEvolutionChoice={monIndex:Number(idx), options:opts}; adventure.phase="specialEvolutionChoice"; renderAdventureButtons(); return; }
      if(opts.length===1) return applyAdventureSpecialEvolution(Number(idx), opts[0]);
    }
  }
  function adventureChooseSpecialEvolution(optionIndex){
    const pending=adventure.pendingSpecialEvolutionChoice || {};
    const option=(pending.options||[])[Number(optionIndex)];
    if(!option) return;
    applyAdventureSpecialEvolution(Number(pending.monIndex), option);
  }
  function adventureItemEffectConfig(key){ return adventure.rewardEffects?.items?.[key] || null; }
  function adventureExpShareConfig(){ return adventure.rewardEffects?.expShare || {}; }

  function reviveAdventurePokemon(mon, ratio, logs){
    if(!mon) return 0;
    const amount=Math.max(1, Math.floor(Number(mon.maxHp||1)*Number(ratio||0.25)));
    mon.hp=Math.max(Number(mon.hp||0), amount);
    mon.fainted=false;
    logs?.push(`${mon.name}이/가 HP ${amount}로 부활했다!`);
    return amount;
  }
  function healAdventurePokemon(mon, ratioOrAmount, logs, label){
    if(!mon || mon.fainted || getAdventurePokemonHp(mon)<=0) return 0;
    const amount=ratioOrAmount<1 ? Math.max(1, Math.floor(Number(mon.maxHp||1)*ratioOrAmount)) : Number(ratioOrAmount||0);
    const before=Number(mon.hp||0);
    mon.hp=Math.min(mon.maxHp, before+amount);
    const diff=mon.hp-before;
    if(diff>0) logs?.push(`${label||mon.name} HP ${diff} 회복!`);
    return diff;
  }
  function applyAdventureTeamRecoveryItem(key, item, events){
    let used=false;
    const team=adventure.team||[];
    const logs=adventure.log;
    if(item.kind==="revive"){
      const target=team.find(p=>p && (p.fainted || getAdventurePokemonHp(p)<=0));
      if(!target){ logs.push(`${item.name} 사용 실패 · 기절한 포켓몬이 없습니다.`); return false; }
      adventure.bag[key]-=1; used=true;
      reviveAdventurePokemon(target, Number(item.reviveRatio||0.5), logs);
      events.push({id:advEventId(), type:"heal", target:"p1", name:target.name, amount:Math.floor(Number(target.maxHp||1)*Number(item.reviveRatio||0.5)), hp:target.hp});
    }else if(item.kind==="teamRecovery"){
      adventure.bag[key]-=1; used=true;
      for(const mon of team){
        if(!mon) continue;
        if(mon.fainted || getAdventurePokemonHp(mon)<=0) reviveAdventurePokemon(mon, Number(item.reviveRatio||0.25), logs);
        if(Number(item.healRatio||0)>0) healAdventurePokemon(mon, Number(item.healRatio||0), logs, mon.name);
        if(item.cureStatus) clearAdventureStatus(mon);
        if(item.ppRatio){ for(const m of (mon.moves||[])){ const max=Number(m.maxPp||m.pp||10); m.pp=Math.min(max, Number(m.pp||0)+Math.ceil(max*Number(item.ppRatio||0))); } }
      }
      logs.push(`${item.name}으로 팀을 정비했다!`);
      events.push({id:advEventId(), type:"heal", target:"p1", name:playerMon()?.name||"팀", amount:0, hp:playerMon()?.hp||0});
    }
    if(used){
      if(currentState?.players?.p1){ currentState.players.p1.team=clone(adventure.team); currentState.players.p1.activeIndex=adventure.activeIndex||0; }
      return true;
    }
    return false;
  }
  function adventureUseItem(key){
    const item=adventure.items?.[key];
    if(!item || (adventure.bag[key]||0)<=0 || animationBusy || adventure.pendingReward || adventure.phase!=="battle") return;
    if(item.kind==="ball") return adventureTryCapture(key);
    const old=clone(currentState);
    const events=[];
    const targetMode=itemTargetModeForAdventureItem(item);
    if(targetMode){
      adventure.pendingItemTarget={key, oldState:old, mode:targetMode};
      adventure.phase="itemTarget";
      renderAdventureButtons(); renderAdventureLogs(); renderBattleView();
      return;
    }
    if(item.kind==="teamRecovery"){
      if(applyAdventureTeamRecoveryItem(key, item, events)) return finishAdventureItemTurn(old, events);
      renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); return;
    }
    const mon=playerMon();
    if(!mon || mon.fainted) return;
    let used=false;
    if(item.kind==="heal"){
      if(mon.hp>=mon.maxHp){ adventure.log.push(`${item.name} 사용 실패 · HP가 이미 가득 찼다.`); renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); return; }
      adventure.bag[key]-=1; used=true;
      const before=Number(mon.hp||0);
      mon.hp=Math.min(mon.maxHp, mon.hp + Number(item.amount||20));
      const amount=mon.hp-before;
      adventure.log.push(`${item.name} 사용 · ${mon.name} HP ${amount} 회복`);
      events.push({id:advEventId(), type:"heal", target:"p1", name:mon.name, amount, hp:mon.hp});
    }else if(item.kind==="pp"){
      adventure.bag[key]-=1; used=true;
      (mon.moves||[]).forEach(m=>{m.pp=Math.min(m.maxPp||m.pp||10,(m.pp||0)+Number(item.amount||10));});
      adventure.log.push(`${item.name} 사용 · PP 회복`);
      events.push({id:advEventId(), type:"message", text:`${item.name}으로 PP를 회복했다!`});
    }else if(item.kind==="status"){
      mon.status=normalizeAdventureStatus(mon.status);
      if(!mon.status){ adventure.log.push(`${item.name} 사용 실패 · 회복할 상태이상이 없다.`); renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); return; }
      const cures=Array.isArray(item.cures)?item.cures.map(normalizeAdventureStatus).filter(Boolean):[];
      if(cures.length && !cures.includes(mon.status)){ adventure.log.push(`${item.name} 사용 실패 · ${statusKo(mon.status)}에는 효과가 없다.`); renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); return; }
      adventure.bag[key]-=1; used=true;
      const before=mon.status;
      clearAdventureStatus(mon);
      adventure.log.push(`${item.name} 사용 · ${statusKo(before)} 상태 회복`);
      events.push({id:advEventId(), type:"heal", target:"p1", name:mon.name, amount:0, hp:mon.hp});
    }else if(item.kind==="rareCandy"){
      adventure.bag[key]-=1; used=true;
      levelUpAdventurePokemonByCandy(mon, adventure.log);
      events.push({id:advEventId(), type:"message", text:`${mon.name}이/가 이상한사탕으로 레벨업했다!`});
    }else if(item.kind==="stat"){
      adventure.bag[key]-=1; used=true;
      applyAdventurePermanentStatItem(mon, item);
      adventure.log.push(`${item.name} 사용 · ${statKo(item.stat||"hp")} 보너스 상승`);
      events.push({id:advEventId(), type:"stat", target:"p1", name:mon.name, stat:item.stat||"hp", amount:Number(item.amount||1)});
    }
    if(!used) return;
    currentState.players.p1.team[currentState.players.p1.activeIndex]=mon;
    adventure.team[adventure.activeIndex||0]=clone(mon);
    finishAdventureItemTurn(old, events);
  }
  function ensureAdventureBonusStats(mon){
    mon.adventureBonusStats = mon.adventureBonusStats || {hp:0,attack:0,defense:0,speed:0};
    for(const k of ["hp","attack","defense","speed"]) mon.adventureBonusStats[k]=Number(mon.adventureBonusStats[k]||0);
    return mon.adventureBonusStats;
  }
  function applyAdventurePermanentStatItem(mon, item){
    ensureAdventureBonusStats(mon);
    const stat=item.stat || "hp";
    const amount=Number(item.amount||1);
    if(stat==="hp"){ mon.adventureBonusStats.hp += amount; mon.maxHp += amount; mon.hp=Math.min(mon.maxHp, Number(mon.hp||0)+amount); }
    else { mon.adventureBonusStats[stat]=(mon.adventureBonusStats[stat]||0)+amount; }
  }

  function getAdventureCaptureRate(mon){
    const keys=[mon?.apiName, mon?.name, String(mon?.id||"")].filter(Boolean);
    for(const key of keys){
      const found=adventure.captureRates?.[key];
      if(found!=null) return Number(found.captureRate ?? found.rate ?? found);
    }
    const bst = statTotal(mon);
    return Math.max(45, Math.min(120, 90 - Math.floor(((bst || 330)-300) * 0.08)));
  }
  function clampNumber(v,min,max){ return Math.max(min, Math.min(max, Number(v))); }
  function calculateAdventureCaptureInfo(enemy, ballKey){
    const item=adventure.items?.[ballKey] || {};
    const captureRate=getAdventureCaptureRate(enemy) || 90;
    const baseChance=captureRate/255;
    const hpRatio=Math.max(0,Math.min(1, Number(enemy?.hp||0)/Math.max(1,Number(enemy?.maxHp||1))));
    const hpFactor=1 + (1 - hpRatio) * 1.2;
    const status=normalizeAdventureStatus(enemy?.status);
    const capCfg=adventure.captureBalance || adventure.rewardEffects?.capture || {};
    const statusFactor=status==="sleep" ? Number(capCfg.status?.sleep ?? capCfg.sleepFactor ?? 1.8) : (status ? Number(capCfg.status?.[status] ?? capCfg.statusFactor ?? 1.3) : 1.0);
    const ballFactor=Number(capCfg.balls?.[ballKey] ?? item.captureBonus ?? 1);
    const stagePenalty=Math.max(0.6, 1 - Number(adventure.stage||1) * Number(capCfg.stagePenaltyPerFloor ?? 0.003));
    const maxRate=Number(capCfg.maxChance ?? ((status==="sleep" && hpRatio<=0.25 && ballKey==="hyperPookiBall") ? 0.85 : 0.75));
    const finalChance=clampNumber(baseChance * hpFactor * statusFactor * ballFactor * stagePenalty, Number(capCfg.minChance ?? 0.05), maxRate);
    return {captureRate, baseChance, hpFactor, status, statusFactor, ballFactor, stagePenalty, finalChance};
  }
  function calculateAdventureCaptureChance(enemy, ballKey){
    return calculateAdventureCaptureInfo(enemy, ballKey).finalChance;
  }
  function adventureQuickCapture(){ adventureTryCapture("pookiBall"); }
  async function adventureTryCapture(ballKey){
    if(animationBusy || adventure.pendingReward) return;
    const item=adventure.items?.[ballKey];
    const enemy=enemyMon();
    if(!item || item.kind!=="ball" || !enemy || (adventure.bag[ballKey]||0)<=0) return;
    animationBusy=true;
    adventure.bag[ballKey]-=1;
    const captureInfo = calculateAdventureCaptureInfo(enemy, ballKey);
    const rate = captureInfo.finalChance;
    const roll = Math.random();
    const success = roll <= rate;
    console.debug?.('[Adventure Capture]', {...captureInfo, ballKey, roll, success});
    adventure.log.push(`${item.name}을/를 던졌다! 포획 확률 ${Math.round(rate*100)}%`);
    currentState.logs=[...adventure.log];
    setMessage(`${item.name}을/를 던졌다!`, true);
    renderAdventureButtons();
    renderAdventureLogs();
    renderAdventureBag();
    try{
      await playAdventureCaptureSequence(ballKey, success, enemy.name);
      if(success){
        console.info?.("[Adventure/Capture] success animation done", { phase:adventure.phase, floor:adventure.stage, capturedPokemonName:enemy?.name });
        const captured=clone(enemy);
        captured.hp=Math.max(1,captured.hp); captured.fainted=false; captured.caughtAtStage=adventure.stage;
        recordAdventureHallOfFamePokemon(captured, {caughtAtStage:adventure.stage});
        adventure.log.push(`${item.name} 성공! ${enemy.name}을/를 포획했다.`);
        awardAdventureExp("capture", enemy);
        currentState.logs=[...adventure.log];
        setMessage(`${enemy.name} 포획 성공!`, true);
        playGameSfx?.("select");
        adventure.enemy=null;
        const removedEnemy={...clone(enemy), name:"", hp:0, maxHp:1, fainted:true, frontSprite:"", backSprite:"", types:[], statStages:{attack:0,defense:0,speed:0}, moves:[]};
        if(adventure.team.length<3){
          adventure.team.push(captured);
          recordAdventureHallOfFamePokemon(captured, {caughtAtStage:adventure.stage});
          currentState.players.p1.team=clone(adventure.team);
          currentState.players.p1.activeIndex=adventure.activeIndex||0;
          currentState.players.p2.team=[removedEnemy];
          currentState.logs=[...adventure.log];
          visualState=null;
          faintPending={p1:false,p2:true};
          animationBusy=false;
          if((adventure.growthQueue||[]).length) continueAdventureGrowthQueue(()=>enterAdventureReward(`${enemy.name} 포획 성공! 보상을 선택하세요.`));
          else enterAdventureReward(`${enemy.name} 포획 성공! 보상을 선택하세요.`);
        }else{
          adventure.pendingCaptured=captured;
          adventure.phase="teamReplace";
          adventure.pendingReward=false;
          currentState.players.p1.team=clone(adventure.team);
          currentState.players.p1.activeIndex=adventure.activeIndex||0;
          currentState.players.p2.team=[removedEnemy];
          currentState.logs=[...adventure.log];
          visualState=null;
          faintPending={p1:false,p2:true};
          animationBusy=false;
          const showReplace=()=>{ setMessage(`${enemy.name} 포획 성공! 팀에 넣을 포켓몬을 선택하세요.`, false); renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag(); };
          if((adventure.growthQueue||[]).length) continueAdventureGrowthQueue(showReplace);
          else showReplace();
        }
      }else{
        adventure.log.push(`${item.name} 실패! ${enemy.name}이/가 볼에서 튀어나왔다.`);
        currentState.logs=[...adventure.log];
        setMessage("포획 실패! 상대 턴이 진행됩니다.", true);
        resetAdventureEnemyAfterCaptureFailure();
        renderBattleView(); resetAdventureEnemyAfterCaptureFailure(); renderAdventureBag(); renderAdventureLogs();
        const eMove=chooseEnemyMove(enemy, playerMon());
        const old=clone(currentState);
        const working=clone(currentState);
        const e=working.players.p2.team[0], mine=working.players.p1.team[working.players.p1.activeIndex];
        const events=[]; const logs=[...adventure.log];
        animationBusy=false;
        applyAdventureMove({key:"p2", mon:e, target:mine, move:eMove, idx:0}, events, logs);
        applyAdventureEndTurnStatus(working, events, logs);
        applyAdventureEndTurnEquipment(working, events, logs);
        working.logs=logs; working.turn+=1; working.phase=mine.fainted?"TURN_RESOLVE":"ACTION_SELECT";
        prepareVisualState(old); currentState=working; adventure.log=logs;
        enqueueAdventureEventsSafely(events, {reason:"capture-fail-enemy-turn", attackerSide:"p2", defenderSide:"p1"}).then(()=>{commitFromCurrentState(); if(playerMon()?.fainted || getAdventurePokemonHp(playerMon())<=0) resolveAdventurePlayerFaintSafely("capture-fail-enemy-turn"); else {resetAdventureEnemyAfterCaptureFailure(); renderBattleView(); resetAdventureEnemyAfterCaptureFailure(); renderAdventureButtons(); renderAdventureLogs();}});
      }
    }catch(err){
      console.error("[Adventure Capture] failed", err);
      adventure.log.push(`포획 처리 오류: ${err.message || err}`);
      currentState.logs=[...adventure.log];
      resetAdventureEnemyAfterCaptureFailure();
      setMessage("포획 처리 중 오류가 발생했습니다. 다시 행동을 선택하세요.", true);
      renderBattleView(); resetAdventureEnemyAfterCaptureFailure(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
    }finally{
      animationBusy=false;
      clearAdventureCaptureEffects();
    }
  }
  function restoreAdventureActionSelect(message){
    adventure.phase="battle";
    adventure.switchMode=null;
    if(currentState) currentState.phase="ACTION_SELECT";
    if(message) adventure.log.push(message);
    if(currentState) currentState.logs=[...adventure.log];
    setMessage(message || "행동을 선택하세요.", true);
    renderBattleView(); resetAdventureBattleSprites(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
  }
  function adventureOpenSwitch(){
    if(animationBusy || adventure.pendingReward || adventure.phase !== "battle") return;
    if(!getAliveAdventureTeam().some(x=>x.idx !== (currentPlayer()?.activeIndex||0))) return;
    adventure.phase="switch";
    adventure.switchMode="manual";
    if(currentState) currentState.phase="ACTION_SELECT";
    setMessage("교체할 포켓몬을 선택하세요.", false);
    renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
  }
  function performAdventureSwitch(idx, options={}){
    const player=currentState?.players?.p1;
    const targetIndex=Number(idx);
    const currentIndex=Number(player?.activeIndex ?? adventure.activeIndex ?? 0);
    const target=player?.team?.[targetIndex] || adventure.team?.[targetIndex];
    if(!player || !Number.isFinite(targetIndex) || !target || targetIndex===currentIndex || target.fainted || getAdventurePokemonHp(target)<=0){
      console.warn('[Adventure Switch] invalid switch target', {idx, currentIndex, target});
      restoreAdventureActionSelect("교체할 수 없습니다. 다시 행동을 선택하세요.");
      return false;
    }
    const consumeTurn = options.consumeTurn ?? (adventure.switchMode === "manual");
    const oldName=player.team[currentIndex]?.name || "현재 포켓몬";

    player.activeIndex=targetIndex;
    adventure.activeIndex=targetIndex;
    adventure.team=clone(player.team);
    adventure.phase="battle";
    adventure.switchMode=null;
    adventure.pendingReward=false;
    adventure.playerFaintStarted=false;
    adventure.playerFaintAnimationDone=false;
    adventure.playerFaintResolved=false;
    adventure.failResolved=false;
    adventure.battleResolutionToken=Number(adventure.battleResolutionToken||0)+1;

    if(currentState){
      currentState.players.p1.activeIndex=targetIndex;
      currentState.players.p1.team=clone(player.team);
      currentState.phase=consumeTurn ? "ACTION_SELECT" : "ACTION_SELECT";
    }

    commitFromCurrentState();
    const newActive=playerMon();
    adventure.log.push(`교체: ${oldName} → ${newActive?.name || target.name}`);
    if(currentState) currentState.logs=[...adventure.log];

    const renderToken=bumpAdventureRenderToken("switch");
    clearAdventurePlayerVisualState("switch-success");
    console.debug?.('[Adventure Switch]', {oldActive:oldName, newActive:newActive?.name || target.name, activeIndex:targetIndex, phaseAfterSwitch:consumeTurn?'enemyTurn':'actionSelect', renderToken});

    renderAdventureHeader(`${adventure.stage}층 전투`, consumeTurn ? "교체한 틈에 상대가 움직입니다." : "행동을 선택하세요.");
    renderBattleView(); resetAdventureBattleSprites(); renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();

    if(consumeTurn){
      setMessage(`${newActive?.name || target.name}이/가 전투에 나왔다! 상대가 움직인다!`, true);
      setTimeout(()=>resolveAdventureEnemyOnlyTurn(renderToken), 120);
    }else{
      setMessage(`${newActive?.name || target.name}이/가 전투에 나왔다!`, true);
    }
    return true;
  }
  function adventureSwitch(idx){
    return performAdventureSwitch(idx, {forced:adventure.switchMode==='forced', consumeTurn:adventure.switchMode==='manual', reason:adventure.switchMode||'switch'});
  }
  async function resolveAdventureEnemyOnlyTurn(renderToken){
    if(renderToken && renderToken !== adventure.renderToken){
      console.debug?.('[Adventure EnemyTurn] skipped stale switch turn', {renderToken, current:adventure.renderToken});
      return;
    }
    if(!adventure.active || adventure.phase !== "battle" || adventure.pendingReward) return;
    clearAdventurePlayerVisualState("enemy-turn-before");
    if(currentState){
      currentState.players.p1.activeIndex=adventure.activeIndex || 0;
      currentState.players.p1.team=clone(adventure.team);
    }
    const old=clone(currentState); // 교체 후 상태를 기준으로 시각 스냅샷 생성
    const working=clone(currentState);
    const enemy=working.players.p2.team[0];
    const mine=working.players.p1.team[working.players.p1.activeIndex];
    console.debug?.('[Adventure EnemyTurn] target active', {target:mine?.name, activeIndex:working.players.p1.activeIndex, renderToken});
    if(!enemy || !mine || enemy.fainted || mine.fainted) return;
    const eMove=chooseEnemyMove(enemy, mine);
    const events=[]; const logs=[...adventure.log, `교체한 틈에 ${enemy.name}이 움직였다!`];
    applyAdventureMove({key:"p2", mon:enemy, target:mine, move:eMove, idx:0}, events, logs);
    applyAdventureEndTurnStatus(working, events, logs);
    applyAdventureEndTurnEquipment(working, events, logs);
    working.logs=logs; working.turn+=1; working.phase=mine.fainted?"TURN_RESOLVE":"ACTION_SELECT";
    prepareVisualState(old); currentState=working; adventure.log=logs;
    enqueueAdventureEventsSafely(events, {reason:"enemy-only-turn", attackerSide:"p2", defenderSide:"p1"}).then(()=>{
      if(renderToken && renderToken !== adventure.renderToken) return;
      commitFromCurrentState();
      clearAdventurePlayerVisualState("enemy-turn-after");
      if(playerMon()?.fainted || getAdventurePokemonHp(playerMon())<=0) resolveAdventurePlayerFaintSafely("enemy-only-turn");
      else {currentState.phase="ACTION_SELECT"; renderBattleView(); resetAdventureBattleSprites(); renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();}
    });
  }
  function adventureConfirmReturnLobby(){
    if(adventure.active && adventure.phase==="battle"){
      if(!confirm("정말 모험을 포기하고 로비로 돌아가시겠습니까?\n현재 모험 진행은 저장되지 않습니다.")) return;
    }
    adventureReturnLobby();
  }
  function adventureReturnLobby(){
    adventure.active=false;
    const advReturn=document.querySelector(".top-actions .adventure-return-btn"); if(advReturn) advReturn.remove();
    document.body.classList.remove("adventure-mode");
    document.body.classList.remove("adventure-starting");
    document.body.classList.add("lobby-assets-ready");
    const overlay=document.getElementById("overlay"); if(overlay) overlay.classList.remove("show");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("lobbyScreen").style.display="grid";
    const panel=document.getElementById("battleChatPanel");
    if(panel){ panel.classList.remove("adventure-bag-panel"); panel.innerHTML=`<div class="chat-title">채팅</div><button type="button" class="mobile-collapse-toggle" onclick="toggleMobilePanel('chat')">채팅 보기</button><div class="chat-messages" id="chatMessages"></div><form class="chat-form" onsubmit="sendChat(event)"><input id="chatInput" maxlength="120" autocomplete="off" placeholder="메시지 입력..." /><button type="submit">전송</button></form>`; }
    myRole=null; window.currentRoomId=null; currentState=null; visualState=null; faintPending={p1:false,p2:false};
    adventure.activeIndex=0; adventure.hallOfFameRoster=[]; adventure.pendingCaptured=null; adventure.rewardApplying=false; adventure.pendingReward=false; adventure.switchMode=null; adventure.pendingLevelMove=null; adventure.pendingItemTarget=null; adventure.pendingSpecialEvolutionChoice=null; adventure.growthQueue=[]; adventure.growthProcessing=false; adventure.learnMoveResolving=false; adventure.afterGrowthCallback=null;
    try{ requestLobby(); }catch(e){}
  }

  window.renderAdventureEntryCard=renderAdventureEntryCard;
  window.startAdventureMode=startAdventureMode;
  window.selectAdventureStarter=selectAdventureStarter;
  window.beginAdventureBattle=beginAdventureBattle;
  window.adventureChooseReward=chooseAdventureReward;
  window.adventureChooseTmTarget=chooseAdventureTmTarget;
  window.adventureForgetMoveForTm=forgetMoveForAdventureTm;
  window.adventureCancelTmReward=cancelAdventureTmReward;
  window.adventureAcceptLevelMove=adventureAcceptLevelMove;
  window.adventureSkipLevelMove=adventureSkipLevelMove;
  window.adventureForgetLevelMove=adventureForgetLevelMove;
  window.adventureUseItem=adventureUseItem;
  window.adventureUseItemOnTarget=adventureUseItemOnTarget;
  window.adventureCancelItemTarget=adventureCancelItemTarget;
  window.adventureChooseSpecialEvolution=adventureChooseSpecialEvolution;
  window.adventureQuickCapture=adventureQuickCapture;
  window.adventureOpenSwitch=adventureOpenSwitch;
  window.adventureSwitch=adventureSwitch;
  window.performAdventureSwitch=performAdventureSwitch;
  window.adventureReplaceCaptured=adventureReplaceCaptured;
  window.adventureDiscardCaptured=adventureDiscardCaptured;
  window.adventureReturnLobby=adventureReturnLobby;
  window.showAdventureHallOfFameOverlay=showAdventureHallOfFameOverlay;
  window.adventureConfirmReturnLobby=adventureConfirmReturnLobby;

  document.addEventListener("DOMContentLoaded",()=>{ injectAdventureStyle(); installOverrides(); patchLobbyRenderer(); });
})();
