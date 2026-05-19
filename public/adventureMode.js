// v6.18 Adventure Mode Real Clone Rebuild Patch
// 기존 일반 선택창/배틀창 DOM과 CSS를 최대한 재사용하는 모험모드 전용 어댑터.
(function(){
  "use strict";

  const ADVENTURE_KEY = "pookiAdventureStateV618RealClone";
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
    { maxStage:10, url:"/assets/lobby/evergreen-city-card.png" },
    { maxStage:20, url:"/assets/lobby/city-gray-banner.png" },
    { maxStage:30, url:"/assets/lobby/city-blue-banner.png" },
    { maxStage:40, url:"/assets/lobby/fuchsia-city-card.png" },
    { maxStage:50, url:"/assets/lobby/lavender-town-card.png" },
    { maxStage:999, url:"/assets/lobby/adventure-card.png" }
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
    switchMode:null,
    expShareLevel:0,
    log:[],
    renderToken:0
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
      .sprite.adventure-capture-out{animation:adventureCaptureOut 720ms ease-in forwards!important;transform-origin:50% 70%;}
      @keyframes adventureCaptureOut{0%{transform:translate(0,0) scale(1);opacity:1;filter:brightness(1) drop-shadow(0 18px 14px rgba(15,23,42,.28));}35%{transform:translate(-8px,-8px) scale(1.08);opacity:1;filter:brightness(1.5) drop-shadow(0 0 18px rgba(96,165,250,.75));}70%{transform:translate(-25px,18px) scale(.45);opacity:.65;filter:brightness(1.8) drop-shadow(0 0 22px rgba(191,219,254,.8));}100%{transform:translate(-45px,35px) scale(.05);opacity:0;filter:brightness(2);}}
      body.adventure-mode .adventure-fail-box{display:grid;gap:12px;}
      body.adventure-mode .adventure-fail-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
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
      @media(max-width:720px){body.adventure-mode .adventure-reward-grid{grid-template-columns:1fr;}}
    `;
    document.head.appendChild(style);
  }

  async function loadAdventureData(){
    if(adventure.dataReady) return;
    const [arena, config, items, rewards, capture, captureRates, learnsets, adventureMoves, expTable, baseStats, evolutions, equipmentConfig, effectMap, blockedMoves, moveTiers, basicConfig, starterPool] = await Promise.all([
      fetch("/api/test-arena/data").then(r=>r.json()),
      fetch("/data/adventure_config.json").then(r=>r.json()).catch(()=>({})),
      fetch(`/data/adventure_items.json?v=6189-${Date.now()}`).then(r=>r.json()).catch(()=>({})),
      fetch(`/data/adventure_rewards.json?v=6189-${Date.now()}`).then(r=>r.json()).catch(()=>({rewards:[]})),
      fetch("/data/adventure_capture.json").then(r=>r.json()).catch(()=>({})),
      fetch("/data/adventure_capture_rates.json").then(r=>r.json()).catch(()=>({})),
      fetch("/data/adventure_learnsets.json").then(r=>r.json()).catch(()=>({})),
      fetch(`/data/adventure_moves.json?v=6189-${Date.now()}`).then(r=>r.json()).catch(()=>({moves:[]})),
      fetch("/data/adventure_exp_table.json").then(r=>r.json()).catch(()=>({})),
      fetch("/data/adventure_base_stats.json").then(r=>r.json()).catch(()=>({})),
      fetch("/data/adventure_evolutions.json").then(r=>r.json()).catch(()=>({})),
      fetch(`/data/adventure_equipment.json?v=6189-${Date.now()}`).then(r=>r.json()).catch(()=>({equipment:[]})),
      fetch("/data/adventure_move_effect_map.json").then(r=>r.json()).catch(()=>({})),
      fetch("/data/adventure_blocked_moves.json").then(r=>r.json()).catch(()=>({blocked:[]})),
      fetch(`/data/adventure_move_tiers.json?v=6189-${Date.now()}`).then(r=>r.json()).catch(()=>({})),
      fetch("/data/adventure_basic_pokemon.json").then(r=>r.json()).catch(()=>({basicIds:[]})),
      fetch(`/data/adventure_starter_pool.json?v=6188e-${Date.now()}`).then(r=>r.json()).catch((err)=>{ console.warn("[Adventure Starter] starter pool json load failed", err); return {starters:[], __loadFailed:true}; })
    ]);
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
    adventure.capture = capture || {};
    adventure.captureRates = captureRates || {};
    adventure.learnsets = learnsets || {};
    adventure.expTable = expTable || {};
    adventure.baseStats = baseStats || {};
    adventure.evolutions = evolutions || {};
    adventure.equipmentConfig = equipmentConfig || { equipment:[] };
    adventure.basicConfig = basicConfig || { basicIds:[] };
    adventure.starterPool = starterPool || { starters:[] };
    adventure.maxStage = Number(config?.maxStage || 100);
    adventure.bossEvery = Number(config?.bossEvery || 10);
    adventure.dataReady = true;
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
    const id=Number(p?.id);
    if(!p || !Number.isFinite(id)) return true;
    if(LEGENDARY_MYTHICAL_IDS.has(id)) return true;
    if(STARTER_BLOCKED_IDS.has(id)) return true;
    if(isEarlyBannedStrongPokemon(p)) return true;
    return false;
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
      if(Number(p.evolutionStage||0)!==0) continue;
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
    const legacyThree = legacy.filter(p=>Number(p.evolutionStage||0)===0 && Number(p.evolutionLineLength||0)>=3);
    const legacyTwo = legacy.filter(p=>Number(p.evolutionStage||0)===0 && Number(p.evolutionLineLength||0)===2);
    const evThree = starterIdsFromEvolutions(3);
    const evTwo = starterIdsFromEvolutions(2);

    const threeStageFirst = uniqueStarterList([...legacyThree, ...evThree, ...threeIds.map(createStarterCandidateFromId)]);
    const twoStageFirst = uniqueStarterList([...legacyTwo, ...evTwo, ...twoIds.map(createStarterCandidateFromId)]).filter(p=>!threeStageFirst.some(x=>Number(x.id)===Number(p.id)));
    const evolvableBasic = uniqueStarterList([...evolvableIds.map(createStarterCandidateFromId), ...adventure.pokemon.filter(p=>Number(p.evolutionStage||0)===0 && (p.evolvesTo || p.finalEvolutionAvailable || Number(p.evolutionLineLength||0)>=2))])
      .filter(p=>!threeStageFirst.some(x=>Number(x.id)===Number(p.id)) && !twoStageFirst.some(x=>Number(x.id)===Number(p.id)));
    const safeFallback = uniqueStarterList([...fallbackIds.map(createStarterCandidateFromId), ...basicPokemonPool().filter(p=>statTotal(p)<=340)])
      .filter(p=>!threeStageFirst.some(x=>Number(x.id)===Number(p.id)) && !twoStageFirst.some(x=>Number(x.id)===Number(p.id)) && !evolvableBasic.some(x=>Number(x.id)===Number(p.id)));

    const final = uniqueStarterList([...threeStageFirst, ...twoStageFirst, ...evolvableBasic, ...safeFallback]);
    STARTER_BLOCKED_IDS.clear();
    [83,95,106,107,108,113,115,122,124,125,126,127,128,131,132,137,142,143,185,200,203,206,213,214,225,226,227,234,235,241].forEach(id=>STARTER_BLOCKED_IDS.add(id));
    for(const id of blockedIds) STARTER_BLOCKED_IDS.add(id);

    console.info('[Adventure Starter] pool json loaded:', poolJsonLoaded);
    console.info('[Adventure Starter] pokemon count:', adventure.pokemon.length);
    console.info('[Adventure Starter] threeStageFirst count:', threeStageFirst.length);
    console.info('[Adventure Starter] twoStageFirst count:', twoStageFirst.length);
    console.info('[Adventure Starter] evolvableBasic count:', evolvableBasic.length);
    console.info('[Adventure Starter] safeFallback count:', safeFallback.length);
    console.info('[Adventure Starter] blocked count:', blockedIds.size || oldBlockedSize);
    if(!poolJsonLoaded) console.warn('[Adventure Starter] adventure_starter_pool.json load failed. Built-in fallback is active.');
    if((threeStageFirst.length + twoStageFirst.length) < 6) console.warn('[Adventure Starter] 3-stage + 2-stage starter pool is small.', {three:threeStageFirst.length,two:twoStageFirst.length});
    console.info('[Adventure Starter] final pool:', final.length, final.slice(0,36).map(p=>`${p.id}:${p.name}`));
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
    picked=shuffle(picked).slice(0,12).map(normalizeAdventureBasePokemon);
    const fallbackCount=picked.filter(p=>groups.safeFallback.some(f=>Number(f.id)===Number(p.id))).length;
    if(fallbackCount>=4) console.warn('[Adventure Starter] fallback ratio is high.', fallbackCount, picked.map(p=>`${p.id}:${p.name}`));
    console.info('[Adventure Starter] recent excluded count:', [...recentSet].length);
    console.info('[Adventure Starter] final count:', picked.length);
    console.info('[Adventure Starter] final names:', picked.map(p=>p.name).join(', '));
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
  function getAdventureWildPool(stage=1){
    const bounds=adventureStageBounds(stage);
    const s=Number(stage||1);
    const all=adventure.pokemon
      .map(normalizeAdventureBasePokemon)
      .filter(p=>p?.frontSprite&&p?.backSprite&&!LEGENDARY_MYTHICAL_IDS.has(Number(p.id)))
      .filter(p=>!(s<=20 && isEarlyBannedStrongPokemon(p)));
    const starterGroups=getAdventureStarterPool();
    const starterLike=uniquePokemonById([...(starterGroups.threeStageFirst||[]),...(starterGroups.twoStageFirst||[]),...(starterGroups.evolvableBasic||[]),...(starterGroups.safeFallback||[])]);
    let pool=all.filter(p=>{ const bst=statTotal(p); return bst>=bounds.min && bst<=bounds.max; });
    if(s<=20){
      pool=uniquePokemonById([...pool, ...starterLike.filter(p=>!isEarlyBannedStrongPokemon(p) && statTotal(p)<=Math.max(bounds.max,330))]);
    }
    let relaxMax=bounds.max;
    const minNeeded=s<=10?30:(s<=20?40:24);
    while(pool.length<minNeeded && relaxMax<bounds.max+180){
      relaxMax+=30;
      pool=uniquePokemonById([...pool, ...all.filter(p=>{ const bst=statTotal(p); return bst>=Math.max(100,bounds.min-40) && bst<=relaxMax; })]);
      if(s<=20) pool=pool.filter(p=>!isEarlyBannedStrongPokemon(p));
    }
    if(!pool.length) pool=all.filter(p=>statTotal(p)<=bounds.max+100);
    pool=shuffle(uniquePokemonById(pool));
    console.debug?.('[Adventure Wild]', {stage:s, playerLevel:getAdventurePlayerReferenceLevel(), levelRange:getAdventureEnemyLevelRange(s,getAdventurePlayerReferenceLevel(),s%adventure.bossEvery===0), bstRange:`${bounds.min}-${bounds.max}`, poolSize:pool.length, recentExcluded:[...(adventure.recentWildIds||[])]});
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
      .filter(p=>p && !ADVENTURE_EARLY_EXCLUDED_IDS.has(Number(p.id)) && !LEGENDARY_MYTHICAL_IDS.has(Number(p.id)));
    const fallback=adventure.pokemon
      .map(normalizeAdventureBasePokemon)
      .filter(p=>p?.frontSprite && !LEGENDARY_MYTHICAL_IDS.has(Number(p.id)) && !ADVENTURE_EARLY_EXCLUDED_IDS.has(Number(p.id)) && !isEarlyBannedStrongPokemon(p) && statTotal(p)<=300);
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
  function pickAdventureWildPokemon(stage=1){
    if(Number(stage||1)<=10){
      return pickAdventureEarlyWildPokemon(stage, getAdventurePlayerReferenceLevel());
    }
    const isBoss=Number(stage)%adventure.bossEvery===0;
    const pool=(isBoss ? getAdventureBossPool(stage) : getAdventureWildPool(stage));
    let candidates=pool.filter(p=>!adventure.team.some(t=>Number(t.id)===Number(p.id)));
    const recentSet=new Set(adventure.recentWildIds||[]);
    const nonRecent=candidates.filter(p=>!recentSet.has(Number(p.id)));
    if(nonRecent.length>=8 || (nonRecent.length>=3 && candidates.length<12)) candidates=nonRecent;
    if(!candidates.length) candidates=pool;
    const picked=shuffle(candidates)[0];
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
  function candidateWeakMoves(base, level=5){
    const banned = new Set([...(adventure.learnsets?.bannedStarterMoves || []), "rest", "sleep", "잠자기"]);
    const existingSource = [
      ...(base.baseMoves || []),
      ...(base.currentMoves || []),
      ...(base.learnableMoves || []),
      ...((base.moves||[]).map(m=>adventure.moveMap[m.id] || m).filter(Boolean))
    ];
    const fromExisting = existingSource.map(m=>adventure.moveMap[m.id] || m).filter(Boolean)
      .filter(m=>!banned.has(m.id) && !banned.has(m.name) && !isBlockedAdventureMove(m) && (m.power||0) <= (Number(adventure.stage||1)<=10?45:65) && !m.selfDestruct && !m.recharge && !isEarlyExcludedAdventureMove(m));
    const byType = [];
    for(const t of (base.types||[])) byType.push(...(adventure.learnsets?.starterFallbackByType?.[t] || []));
    byType.push(...(adventure.learnsets?.starterFallbackByType?.default || []));
    const fallback = byType.map(id=>adventure.moveMap[id]).filter(Boolean).filter(m=>!banned.has(m.id) && !banned.has(m.name) && !isBlockedAdventureMove(m) && !isEarlyExcludedAdventureMove(m));
    const merged = [];
    for(const m of [...fromExisting, ...fallback]){
      if(!m || merged.some(x=>x.id===m.id)) continue;
      merged.push(normalizeMove(m));
      if(merged.length>=4) break;
    }
    while(merged.length<4){
      const m=adventure.moveMap[["tackle","quickAttack","growl","scaryFace"][merged.length]];
      if(m && !merged.some(x=>x.id===m.id)) merged.push(normalizeMove(m)); else break;
    }
    return merged.map(m=>({...m, pp:m.maxPp, maxPp:m.maxPp}));
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
  function getAdventureExpToNext(level){ return Math.max(20, Math.floor(Number(level||5) * Number(level||5) * 6)); }

  function createAdventurePokemon(base, level=5, side="player"){
    const stats = calculateAdventureStatsFromBase(baseStatsForPokemon(base), level);
    const moves = side==="starter" ? candidateWeakMoves(base, level) : enemyMovesFor(base, level);
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
  function moveFitsPokemon(move, mon){
    if(!move || !mon) return false;
    const types=(mon.types||[]).map(t=>String(t).toLowerCase());
    if(types.includes(String(move.type||"").toLowerCase())) return true;
    if(["normal","status"].includes(String(move.type||"").toLowerCase())) return true;
    if(move.power===0 && ["growl","tailWhip","scaryFace","smokescreen","agility","screech"].includes(move.id)) return true;
    return false;
  }
  function enemyMovesFor(base, level){ return enemyMovesForStage(base, level, adventure.stage||1); }
  function enemyMovesForStage(base, level, stage){
    const tiers=moveTierIdsForStage(stage);
    const existing=(base.moves||[]).map(m=>adventure.moveMap[m.id]||m).filter(Boolean).filter(m=>!m.selfDestruct && !m.recharge && !isBlockedAdventureMove(m));
    const byType=Object.values(adventure.moveMap||{}).filter(m=>moveFitsPokemon(m,base) && !isBlockedAdventureMove(m));
    const early=movesFromIds(tiers.early).filter(m=>moveFitsPokemon(m,base));
    const mid=movesFromIds(tiers.mid).filter(m=>moveFitsPokemon(m,base));
    const high=movesFromIds(tiers.high).filter(m=>moveFitsPokemon(m,base));
    const rare=movesFromIds(tiers.rare).filter(m=>moveFitsPokemon(m,base));
    let desired=[];
    const pick=(arr,n)=>{ for(const m of shuffle(arr)){ if(!m || desired.some(x=>x.id===m.id)) continue; desired.push(normalizeMove(m)); if(desired.length>=n) break; } };
    const s=Number(stage||1);
    if(s<=10){ pick(early,4); }
    else if(s<=20){ pick(mid,2); pick(early,4); }
    else if(s<=40){ pick(high,1); pick(mid,3); pick(early,4); }
    else { pick(rare,1); pick(high,3); pick(mid,4); }
    const stab=[...existing,...byType].filter(m=>(base.types||[]).includes(m.type) && Number(m.power||0)>0);
    if(!desired.some(m=>(base.types||[]).includes(m.type) && Number(m.power||0)>0)) pick(stab, Math.min(4, desired.length+1));
    pick(existing.filter(m=>moveFitsPokemon(m,base)),4);
    pick(byType,4);
    pick(candidateWeakMoves(base, level),4);
    return desired.slice(0,4).map(m=>({...normalizeMove(m), pp:m.maxPp, maxPp:m.maxPp}));
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
    try{
      installOverrides();
      injectAdventureStyle();
      await loadAdventureData();
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
      adventure.phase = "starterSelect";
      adventure.log = ["모험이 시작되었습니다."];
      const overlay=document.getElementById("overlay"); if(overlay) overlay.classList.remove("show");
      adventure.selectedStarterId = null;
      adventure.starterCandidates = pickStarterCandidates();
      document.body.classList.add("adventure-mode");
      document.getElementById("lobbyScreen").style.display = "none";
      document.getElementById("gameScreen").classList.remove("hidden");
      myRole = "p1";
      window.currentRoomId = "adventure";
      renderAdventureHeader("스타터 선택", "시작 포켓몬을 선택하세요.");
      renderAdventureSelect();
    }catch(err){
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
    console.debug?.("[Adventure Field] background", {stage, url});
  }

  function startAdventureFloor(){
    try{
      adventure.pendingReward = false;
      adventure.rewardApplying = false;
      adventure.pendingCaptured = null;
      adventure.phase = "loadingNext";
      adventure.enemy = null;
      const aliveIndex = firstAliveAdventureIndex();
      if(aliveIndex < 0){
        adventure.phase = "battle";
        handleAdventureDefeat();
        return;
      }
      adventure.activeIndex = aliveIndex;
      const level = adventureEnemyLevel(adventure.stage);
      const enemyBase = pickAdventureWildPokemon(adventure.stage) || shuffle(adventure.pokemon.filter(p=>p.frontSprite&&p.backSprite&&!LEGENDARY_MYTHICAL_IDS.has(Number(p.id))))[0];
      if(!enemyBase){
        throw new Error("adventure wild enemy pool is empty");
      }
      adventure.recentWildIds = [...(adventure.recentWildIds||[]), Number(enemyBase.id)].slice(-5);
      adventure.enemy = createAdventurePokemon(enemyBase, level, "enemy");
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
      renderAdventureButtons();
      renderAdventureLogs();
      renderAdventureBag();
      setMessage(`${adventure.stage}층 야생 ${adventure.enemy.name}이 나타났다!`, false);
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
    if(adventure.phase === "switch"){ renderAdventureSwitchPrompt(); return; }
    if(adventure.phase === "teamReplace"){ renderAdventureTeamReplacePrompt(); return; }
    if(adventure.phase === "tmSelect"){ renderAdventureTmTargetSelect(); return; }
    if(adventure.phase === "tmForget"){ renderAdventureTmForgetSelect(); return; }
    if(adventure.pendingReward){ renderAdventureRewards(); return; }
    if(adventure.rewardApplying || adventure.phase === "loadingNext" || adventure.phase === "applyingReward"){ buttons.innerHTML=`<div class="control-title">다음 층을 준비하는 중입니다.</div>`; return; }
    if(!mine || !enemy){ buttons.innerHTML=`<div class="control-title">모험 배틀 데이터를 준비하는 중입니다.</div>`; return; }
    if(animationBusy){ buttons.innerHTML=`<div class="control-title">배틀 연출 중입니다.</div>`; return; }
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
    const rows = Object.entries(adventure.items||{}).map(([key,item])=>{
      const count = Number(adventure.bag[key] || 0);
      const disabled = count<=0 || animationBusy || adventure.pendingReward || currentState?.phase==="GAME_OVER";
      return `<div class="adventure-bag-row"><span>${escapeHtml(item.name)} x${count}</span><button ${disabled?"disabled":""} onclick="adventureUseItem('${key}')">사용</button></div>`;
    }).join("");
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
  function createCoreRewardPool(){
    const s=Number(adventure.stage||1);
    const pool=[];
    const add=(r,weight=1)=>pool.push({...r, weight});
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
    add({id:"rareCandy1", title:"이상한사탕 x1", kind:"growth", item:"rareCandy", amount:1, desc:"포켓몬 1마리 1레벨업"}, 7);
    if(Number(adventure.expShareLevel||0)<5) add({id:"expShare1", title:"학습장치 x1", kind:"growth", item:"expShare", amount:1, desc:"대기 포켓몬 경험치 분배 +10%"}, 6);
    add({id:"reviveSeed1", title:"작은부활씨앗 x1", kind:"revive", item:"reviveSeed", amount:1, desc:"기절 포켓몬 HP 25% 부활"}, s<=10?5:3);
    if(s>=10) add({id:"revive1", title:"기력의조각 x1", kind:"revive", item:"revive", amount:1, desc:"기절 포켓몬 HP 50% 부활"}, 6);
    if(s>=30) add({id:"maxRevive1", title:"기력의덩어리 x1", kind:"revive", item:"maxRevive", amount:1, desc:"기절 포켓몬 완전 부활"}, 3);
    if(s%10===0 || s>=25) add({id:"massRevive1", title:"대규모 부활 x1", kind:"revive", item:"massRevive", amount:1, desc:"팀 전체 복구"}, s%10===0?5:1);
    if(s%10===0 || s>=40) add({id:"pokeCenterPass1", title:"포켓몬센터 이용권 x1", kind:"revive", item:"pokeCenterPass", amount:1, desc:"팀 전체 HP/상태/PP 복구"}, s%10===0?3:1);
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
    buttons.innerHTML=`<div class="control-title">${escapeHtml(captured?.name||"포획 포켓몬")}을 팀에 넣으려면 한 마리를 선택해 교체하세요</div><div class="adventure-choice-grid">${team.map((p,idx)=>`<button class="move-btn eff-neutral" onclick="adventureReplaceCaptured(${idx})"><b>${escapeHtml(p?.name||"빈 슬롯")}</b><span class="meta">Lv.${p?.level||"-"} / HP ${p?`${p.hp}/${p.maxHp}`:"-"}<br/>이 포켓몬과 교체</span></button>`).join("")}</div>`;
    renderAdventureBag();
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
    if(animationBusy || adventure.pendingReward) return;
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
    const oldState=clone(currentState);
    const working=clone(currentState);
    const mine=working.players.p1.team[working.players.p1.activeIndex];
    const enemy=working.players.p2.team[0];
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
    for(const act of order){
      if(mine.fainted || enemy.fainted) break;
      if(act.mon.fainted || act.target.fainted) continue;
      applyAdventureMove(act, events, logs);
    }
    applyAdventureEndTurnStatus(working, events, logs);
    applyAdventureEndTurnEquipment(working, events, logs);
    working.turn += 1;
    working.logs = logs;
    working.phase = (mine.fainted || enemy.fainted) ? "TURN_RESOLVE" : "ACTION_SELECT";
    prepareVisualState(oldState);
    currentState = working;
    adventure.log = logs;
    enqueueEvents(events);
    eventQueue.then(()=>{
      commitFromCurrentState();
      if(enemyMon()?.fainted || (enemyMon()?.hp||0)<=0) handleAdventureVictory();
      else if(playerMon()?.fainted || (playerMon()?.hp||0)<=0) handleAdventurePlayerFainted();
      else { currentState.phase="ACTION_SELECT"; renderAdventureHeader(`${adventure.stage}층 전투`, "행동을 선택하세요."); renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); }
    });
  }
  function compareMoveOrder(a,aMove,b,bMove){
    const ap=Number(aMove?.priority||0), bp=Number(bMove?.priority||0);
    if(ap!==bp) return ap-bp;
    return effectiveSpeed(a)-effectiveSpeed(b);
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
    const raw=((((move.power||40)*priorityMul*attack)/defense)/3.35 + 10) * burnPenalty * stab * typeMul * randomMul * criticalMul * equipMul * reduceMul;
    return {amount:Math.max(1,Math.floor(raw)), typeMul, critical, equipMul};
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
    events.push({id:advEventId(), type:"move", attacker:attackerKey, defender:defenderKey, attackerName:attacker.name, defenderName:defender.name, moveName:move.name, moveType:move.type, isStatusMove:move.power===0, isMultiHit:plannedHitTotal>1, hitTotal:plannedHitTotal, outcome:"hit"});
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
    const statusOnly = move.statusMove || (move.power===0 && move.id==="poisonPowder");
    const statChanges = collectAdventureStatChanges(move);
    if(move.power===0 && statChanges.length){
      applyAdventureStatChanges(attacker, defender, attackerKey, defenderKey, statChanges, events, logs);
      return;
    }
    if(statusOnly && move.power===0){
      const status = normalizeAdventureStatus(move.statusMove?.status || "poison");
      setAdventureStatus(defender, status, logs, events, defenderKey);
      return;
    }
    const mult = move.power>0 ? battleEffectiveness(move.type,defender.types||[]) : 1;
    if(mult===0){ logs.push(`${defender.name}에게는 효과가 없다...`); events.push({id:advEventId(), type:"message", text:"효과가 없다..."}); return; }
    const hitTotal=plannedHitTotal;
    let totalDamage=0;
    let lastCritical=false;
    for(let hit=1; hit<=hitTotal; hit++){
      if(defender.hp<=0) break;
      const roll=adventureDamageRoll(attacker, defender, move, attackerKey);
      const amount=roll.amount;
      totalDamage += amount;
      lastCritical = lastCritical || roll.critical;
      defender.hp=Math.max(0,defender.hp-amount);
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
    if(defender.hp<=0){ defender.fainted=true; logs.push(`${defender.name}이 쓰러졌다!`); events.push({id:advEventId(), type:"faint", target:defenderKey, name:defender.name}); }
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

  function advEventId(){ return `adv_${Date.now()}_${Math.random().toString(36).slice(2,9)}`; }
  function resetAdventureBattleSprites(){
    for(const id of ["mySprite","opponentSprite"]){
      const sprite=document.getElementById(id);
      if(!sprite) continue;
      sprite.classList.remove("adventure-capture-out","fainted","faint-dead","enemy-dead","mine-dead","switching-out","hit","shake","attack","faint","fainting","switch-out","switch-in");
      sprite.style.visibility=""; sprite.style.opacity=""; sprite.style.pointerEvents=""; sprite.style.filter=""; sprite.style.transform="";
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
    const bossMultiplier = stage % adventure.bossEvery === 0 ? 1.5 : 1;
    const raw = Math.floor((base * level / 7) * stageMultiplier * bossMultiplier);
    const adjusted = resultType === "capture" ? Math.floor(raw * 0.75) : raw;
    return Math.max(20, adjusted) * 3;
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
      const levelHeal=Math.max(1, Math.floor(Number(mon.maxHp||1)*0.25));
      if(wasFainted || mon.fainted || Number(mon.hp||0)<=0){ mon.hp=levelHeal; mon.fainted=false; logs.push(`${mon.name}이/가 힘을 내어 다시 일어났다!`); }
      else mon.hp=Math.min(mon.maxHp, Number(mon.hp||0)+levelHeal);
      logs.push(`${mon.name}이/가 Lv.${mon.level}이 되었다! HP +${gain.hpGain} / 공격 ${gain.attackGain>=0?"+":""}${gain.attackGain} / 방어 ${gain.defenseGain>=0?"+":""}${gain.defenseGain} / 스피드 ${gain.speedGain>=0?"+":""}${gain.speedGain}`);
      logs.push(`${mon.name}이/가 레벨업하며 HP를 ${levelHeal} 회복했다!`);
      checkAdventureEvolution(mon, logs);
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
    const levelHeal=Math.max(1, Math.floor(Number(mon.maxHp||1)*0.25));
    if(wasFainted){ mon.hp=levelHeal; mon.fainted=false; logs.push(`${mon.name}이/가 힘을 내어 다시 일어났다!`); }
    else mon.hp=Math.min(mon.maxHp, Number(mon.hp||0)+levelHeal);
    logs.push(`${mon.name}이/가 이상한사탕을 먹고 Lv.${mon.level}이 되었다! HP +${gain.hpGain} / 공격 ${gain.attackGain>=0?"+":""}${gain.attackGain} / 방어 ${gain.defenseGain>=0?"+":""}${gain.defenseGain} / 스피드 ${gain.speedGain>=0?"+":""}${gain.speedGain}`);
    logs.push(`${mon.name}이/가 레벨업하며 HP를 ${levelHeal} 회복했다!`);
    checkAdventureEvolution(mon, logs);
  }
  function getAdventureExpShareRate(){ return Math.min(0.8, 0.3 + Number(adventure.expShareLevel||0)*0.1); }
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
    mon.spriteScale=target.spriteScale || mon.spriteScale || 1;
    mon.baseStats=baseStatsForPokemon(target);
    mon.adventureBonusStats=bonus;
    const oldStats={...(mon.stats||{}), hp:oldMax};
    applyAdventureLevelStats(mon, oldStats);
    mon.hp=Math.max(1, Math.min(mon.maxHp, Math.round(mon.maxHp * hpRatio) + Math.max(1, mon.maxHp-oldMax)));
    mon.status=status; mon.volatile=volatile; mon.fainted=false;
    mon.moves=keptMoves.length ? keptMoves : enemyMovesFor(target, mon.level||5).map(normalizeMove);
    logs?.push(`${beforeName}의 모습이...?`);
    logs?.push(`${beforeName}은/는 ${mon.name}(으)로 진화했다!`);
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
  function handleAdventureVictory(){
    if(!adventure.pendingReward){
      awardAdventureExp("defeat", adventure.enemy || enemyMon());
    }
    enterAdventureReward(`${adventure.stage}층 클리어! 보상을 선택하세요.`);
  }
  function checkAdventureDefeat(){
    if(!adventure.active || adventure.phase !== "battle") return false;
    const team = Array.isArray(adventure.team) ? adventure.team : [];
    if(!team.length) return false;
    return team.every(p=>!p || p.fainted || getAdventurePokemonHp(p)<=0);
  }
  function handleAdventurePlayerFainted(){
    commitFromCurrentState();
    if(checkAdventureDefeat()){
      handleAdventureDefeat();
      return;
    }
    adventure.phase="switch";
    adventure.switchMode="forced";
    adventure.pendingReward=false;
    if(currentState) currentState.phase="ACTION_SELECT";
    adventure.log.push("현재 포켓몬이 쓰러졌습니다. 교체할 포켓몬을 선택하세요.");
    if(currentState) currentState.logs=[...adventure.log];
    setMessage("교체할 포켓몬을 선택하세요.", true);
    renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
  }
  function handleAdventureDefeat(){
    if(adventure.phase !== "battle") return;
    if(!checkAdventureDefeat()) return handleAdventurePlayerFainted();
    currentState.phase="GAME_OVER";
    adventure.phase="defeat";
    adventure.log.push(`모험 실패 · 도달 층 ${adventure.stage}층`);
    currentState.logs=[...adventure.log];
    renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); showAdventureFailOverlay();
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
    adventure.stage += 1;
    adventure.pendingReward=false;
    adventure.rewardApplying=false;
    adventure._rewardChoices=null;
    adventure.pendingCaptured=null;
    adventure.pendingTmReward=null;
    adventure.pendingTmTargetIndex=null;
    adventure.enemy=null;
    adventure.phase="loadingNext";
    if(adventure.stage>adventure.maxStage){ showAdventureFailOverlay("모험 성공", "100층을 돌파했습니다!"); return; }
    setMessage(`${adventure.stage}층으로 이동합니다.`, false);
    await sleep(120);
    startAdventureFloor();
  }

  function finishAdventureItemTurn(oldState, events=[]){
    if(currentState) currentState.logs=[...adventure.log];
    if(events.length){
      prepareVisualState(oldState);
      enqueueEvents(events);
      eventQueue.then(()=>{
        commitFromCurrentState();
        if(adventure.active && adventure.phase==="battle" && enemyMon() && !enemyMon().fainted && playerMon() && !playerMon().fainted){
          resolveAdventureEnemyOnlyTurn(clone(currentState));
        }else{
          renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
        }
      });
    }else{
      commitFromCurrentState();
      if(adventure.active && adventure.phase==="battle" && enemyMon() && !enemyMon().fainted && playerMon() && !playerMon().fainted){
        resolveAdventureEnemyOnlyTurn(clone(currentState));
      }else{
        renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
      }
    }
  }
  function allAdventureTmIdsForStage(stage=adventure.stage){
    const s=Number(stage||1);
    const early=["tackle","scratch","quickAttack","waterGun","bubble","ember","smallFlame","vineWhip","absorb","thunderShock","poisonSting","peck","gust","rockThrow","mudSlap","confusion","lick","leechLife","stringShot","growl","tailWhip","smokescreen"];
    const mid=["doubleKick","bulletSeed","pinMissile","icicleSpear","rockBlast","metalClaw","bite","flameCharge","shockWave","megaDrain","swift","rockTomb","mudBomb","hypnosis","poisonPowder","thunderWave","scaryFace","screech","agility"];
    const high=["swordsDance","ironDefense","bulkUp","powerUpPunch","crunch","flameWheel","waterPulse","aerialAce","shadowPunch","drainPunch","rockSlide"];
    const rare=["flamethrower","thunderbolt","iceBeam","surf","earthquake","stoneEdge","shadowBall","psychic","dragonPulse"];
    if(s<=10) return early;
    if(s<=30) return [...early,...mid];
    if(s<=60) return [...mid,...high];
    return [...mid,...high,...rare];
  }
  function canPokemonLearnAdventureTm(mon, move){
    if(!mon || !move) return false;
    const types=(mon.types||[]).map(t=>String(t).toLowerCase());
    const mt=String(move.type||"").toLowerCase();
    if(types.includes(mt)) return true;
    if(mt==="normal" && Number(move.power||0)<=60) return true;
    if(Number(move.power||0)===0 && ["normal","bug","poison","electric","psychic"].includes(mt)) return true;
    const common=new Set(["quickAttack","tackle","scratch","growl","tailWhip","scaryFace","smokescreen","swift"]);
    if(common.has(move.id)) return true;
    if(move.id==="bulletSeed" && (types.includes("grass")||types.includes("bug"))) return true;
    return false;
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
    if(item.kind==="revive" || item.kind==="teamRecovery"){
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
    const statusFactor=status==="sleep" ? 1.8 : (status ? 1.3 : 1.0);
    const ballFactor=Number(item.captureBonus||1);
    const stagePenalty=Math.max(0.6, 1 - Number(adventure.stage||1) * 0.003);
    const maxRate=(status==="sleep" && hpRatio<=0.25 && ballKey==="hyperPookiBall") ? 0.85 : 0.75;
    const finalChance=clampNumber(baseChance * hpFactor * statusFactor * ballFactor * stagePenalty, 0.05, maxRate);
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
    adventure.bag[ballKey]-=1;
    const captureInfo = calculateAdventureCaptureInfo(enemy, ballKey);
    const rate = captureInfo.finalChance;
    const roll = Math.random();
    console.debug?.('[Adventure Capture]', {...captureInfo, ballKey, roll, success:roll <= rate});
    adventure.log.push(`${item.name}을/를 던졌다! 포획 확률 ${Math.round(rate*100)}%`);
    if(roll <= rate){
      const captured=clone(enemy);
      captured.hp=Math.max(1,captured.hp); captured.fainted=false;
      adventure.log.push(`${item.name} 성공! ${enemy.name}을/를 포획했다.`);
      awardAdventureExp("capture", enemy);
      currentState.logs=[...adventure.log];
      setMessage(`${enemy.name}이/가 볼 안으로 빨려 들어간다!`, true);
      const sprite=document.getElementById("opponentSprite");
      if(sprite){
        sprite.classList.remove("fainted","faint-dead","enemy-dead","hit","attack-up","attack-down");
        void sprite.offsetWidth;
        sprite.classList.add("adventure-capture-out");
      }
      playGameSfx?.("select");
      await sleep(760);
      adventure.enemy=null;
      const removedEnemy={...clone(enemy), name:"", hp:0, maxHp:1, fainted:true, frontSprite:"", backSprite:"", types:[], statStages:{attack:0,defense:0,speed:0}, moves:[]};
      if(adventure.team.length<3){
        adventure.team.push(captured);
        currentState.players.p1.team=clone(adventure.team);
        currentState.players.p1.activeIndex=adventure.activeIndex||0;
        currentState.players.p2.team=[removedEnemy];
        currentState.logs=[...adventure.log];
        visualState=null;
        faintPending={p1:false,p2:true};
        enterAdventureReward(`${enemy.name} 포획 성공! 보상을 선택하세요.`);
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
        setMessage(`${enemy.name} 포획 성공! 팀에 넣을 포켓몬을 선택하세요.`, false);
        renderBattleView(); renderAdventureButtons(); renderAdventureLogs(); renderAdventureBag();
      }
    }else{
      adventure.log.push(`${item.name} 실패! ${enemy.name}이/가 볼에서 나왔다.`);
      currentState.logs=[...adventure.log];
      setMessage("포획 실패! 상대 턴이 진행됩니다.", true);
      renderAdventureBag();
      const eMove=chooseEnemyMove(enemy, playerMon());
      const old=clone(currentState);
      const working=clone(currentState);
      const e=working.players.p2.team[0], mine=working.players.p1.team[working.players.p1.activeIndex];
      const events=[]; const logs=[...adventure.log];
      applyAdventureMove({key:"p2", mon:e, target:mine, move:eMove, idx:0}, events, logs);
      applyAdventureEndTurnStatus(working, events, logs);
      applyAdventureEndTurnEquipment(working, events, logs);
      working.logs=logs; working.turn+=1; working.phase=mine.fainted?"TURN_RESOLVE":"ACTION_SELECT";
      prepareVisualState(old); currentState=working; adventure.log=logs; enqueueEvents(events);
      eventQueue.then(()=>{commitFromCurrentState(); if(playerMon()?.fainted) handleAdventurePlayerFainted(); else {renderBattleView(); renderAdventureButtons(); renderAdventureLogs();}});
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
    enqueueEvents(events);
    eventQueue.then(()=>{
      if(renderToken && renderToken !== adventure.renderToken) return;
      commitFromCurrentState();
      clearAdventurePlayerVisualState("enemy-turn-after");
      if(playerMon()?.fainted || getAdventurePokemonHp(playerMon())<=0) handleAdventurePlayerFainted();
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
    const overlay=document.getElementById("overlay"); if(overlay) overlay.classList.remove("show");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("lobbyScreen").style.display="grid";
    const panel=document.getElementById("battleChatPanel");
    if(panel){ panel.classList.remove("adventure-bag-panel"); panel.innerHTML=`<div class="chat-title">채팅</div><button type="button" class="mobile-collapse-toggle" onclick="toggleMobilePanel('chat')">채팅 보기</button><div class="chat-messages" id="chatMessages"></div><form class="chat-form" onsubmit="sendChat(event)"><input id="chatInput" maxlength="120" autocomplete="off" placeholder="메시지 입력..." /><button type="submit">전송</button></form>`; }
    myRole=null; window.currentRoomId=null; currentState=null; visualState=null; faintPending={p1:false,p2:false};
    adventure.activeIndex=0; adventure.pendingCaptured=null; adventure.rewardApplying=false; adventure.pendingReward=false; adventure.switchMode=null;
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
  window.adventureUseItem=adventureUseItem;
  window.adventureQuickCapture=adventureQuickCapture;
  window.adventureOpenSwitch=adventureOpenSwitch;
  window.adventureSwitch=adventureSwitch;
  window.performAdventureSwitch=performAdventureSwitch;
  window.adventureReplaceCaptured=adventureReplaceCaptured;
  window.adventureReturnLobby=adventureReturnLobby;
  window.adventureConfirmReturnLobby=adventureConfirmReturnLobby;

  document.addEventListener("DOMContentLoaded",()=>{ injectAdventureStyle(); installOverrides(); patchLobbyRenderer(); });
})();
