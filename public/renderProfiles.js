(function(){
  "use strict";

  const GROUPS = {
    default: { scale: 1.0, offsetX: 0, offsetY: 0, widthRatio: 1.72 },
    small: { scale: 0.82, offsetX: 0, offsetY: 10, widthRatio: 1.55 },
    tiny: { scale: 0.72, offsetX: 0, offsetY: 14, widthRatio: 1.45 },
    floatingTiny: { scale: 0.70, offsetX: 0, offsetY: -8, widthRatio: 1.45 },
    large: { scale: 1.22, offsetX: 0, offsetY: -6, widthRatio: 1.88 },
    huge: { scale: 1.34, offsetX: 0, offsetY: -10, widthRatio: 2.0 },
    tall: { scale: 1.20, offsetX: 0, offsetY: -10, widthRatio: 1.62 },
    wideFlying: { scale: 1.28, offsetX: 0, offsetY: -8, widthRatio: 2.42 },
    legendaryWide: { scale: 1.38, offsetX: 0, offsetY: -12, widthRatio: 2.62 }
  };

  const GROUP_BY_API_NAME = {
    // 소형/환상/귀여운 체형: 과확대 방지
    mew: "tiny",
    celebi: "floatingTiny",
    pikachu: "small",
    eevee: "small",
    jigglypuff: "tiny",
    clefairy: "small",
    clefable: "small",
    togepi: "tiny",
    jumpluff: "small",

    // 날개 / 가로폭 체형
    charizard: "wideFlying",
    aerodactyl: "wideFlying",
    crobat: "wideFlying",
    skarmory: "wideFlying",
    dragonite: "wideFlying",
    moltres: "wideFlying",
    zapdos: "wideFlying",
    articuno: "wideFlying",
    pidgeot: "wideFlying",
    fearow: "wideFlying",
    beedrill: "wideFlying",
    venomoth: "wideFlying",
    noctowl: "wideFlying",
    lugia: "legendaryWide",
    "ho-oh": "legendaryWide",

    // 대형/전설/묵직한 최종진화 체형
    gyarados: "huge",
    snorlax: "large",
    tyranitar: "large",
    lapras: "large",
    mewtwo: "large",
    raikou: "large",
    entei: "large",
    suicune: "large",
    venusaur: "large",
    blastoise: "large",
    nidoqueen: "large",
    nidoking: "large",
    vileplume: "large",
    arcanine: "large",
    poliwrath: "large",
    machamp: "large",
    golem: "large",
    slowbro: "large",
    cloyster: "large",
    tauros: "large",
    meganium: "large",
    feraligatr: "large",
    ampharos: "large",
    quagsire: "large",
    slowking: "large",
    wobbuffet: "large",
    heracross: "large",
    ursaring: "large",
    blissey: "large",
    kingdra: "large",

    // 세로/긴 몸체
    steelix: "tall",
    onix: "tall",
    arbok: "tall",
    victreebel: "tall"
  };

  const OVERRIDES = {
    // 소형 포켓몬 / 환상 포켓몬
    mew: { scale: 0.66, offsetY: 16, widthRatio: 1.42 },
    celebi: { scale: 0.70, offsetY: -14, widthRatio: 1.42 },
    pikachu: { scale: 0.80, offsetY: 10 },
    eevee: { scale: 0.78, offsetY: 10 },
    jigglypuff: { scale: 0.76, offsetY: 12 },
    togepi: { scale: 0.66, offsetY: 16 },

    // 1차 / 전설 / 날개형
    charizard: { scale: 1.18, offsetY: -4, widthRatio: 2.35 },
    aerodactyl: { scale: 1.42, offsetY: -10, widthRatio: 2.62 },
    crobat: { scale: 1.16, offsetY: -4, widthRatio: 2.45 },
    skarmory: { scale: 1.06, offsetY: -4, widthRatio: 2.20 },
    dragonite: { scale: 1.16, offsetY: -5, widthRatio: 2.10 },
    moltres: { scale: 1.36, offsetY: -12, widthRatio: 2.56 },
    zapdos: { scale: 1.36, offsetY: -12, widthRatio: 2.55 },
    articuno: { scale: 1.22, offsetY: -8, widthRatio: 2.42 },
    lugia: { scale: 1.36, offsetY: -12, widthRatio: 2.65 },
    "ho-oh": { scale: 1.38, offsetY: -12, widthRatio: 2.68 },

    gyarados: { scale: 1.32, offsetY: -8, widthRatio: 2.18 },
    snorlax: { scale: 1.24, offsetY: -4, widthRatio: 1.82 },
    tyranitar: { scale: 1.26, offsetY: -6, widthRatio: 1.82 },
    lapras: { scale: 1.20, offsetY: -4, widthRatio: 2.08 },
    mewtwo: {
      scale: 1.24,
      offsetX: -20,
      playerOffsetX: -32,
      opponentOffsetX: -18,
      offsetY: -4,
      widthRatio: 1.92
    },
    raikou: { scale: 1.18, offsetY: -4, widthRatio: 2.02 },
    entei: { scale: 1.20, offsetY: -5, widthRatio: 2.06 },
    suicune: { scale: 1.20, offsetY: -5, widthRatio: 2.06 },
    steelix: { scale: 1.22, offsetY: -10, widthRatio: 1.78 },
    onix: { scale: 1.18, offsetY: -8, widthRatio: 1.78 },

    // 2차 보정 대상: 1~2세대 최종진화 / 전설 / 체형 특수 포켓몬
    venusaur: { scale: 1.16, offsetY: -4, widthRatio: 1.90 },
    blastoise: { scale: 1.18, offsetY: -4, widthRatio: 1.86 },
    beedrill: { scale: 1.12, offsetY: -4, widthRatio: 2.10 },
    pidgeot: { scale: 1.16, offsetY: -5, widthRatio: 2.28 },
    fearow: { scale: 1.14, offsetY: -5, widthRatio: 2.18 },
    arbok: { scale: 1.14, offsetY: -6, widthRatio: 1.82 },
    raichu: { scale: 1.06, offsetY: -2, widthRatio: 1.72 },
    nidoqueen: { scale: 1.18, offsetY: -4, widthRatio: 1.88 },
    nidoking: { scale: 1.18, offsetY: -4, widthRatio: 1.88 },
    clefable: { scale: 1.04, offsetY: -1, widthRatio: 1.72 },
    ninetales: { scale: 1.08, offsetY: -3, widthRatio: 1.92 },
    vileplume: { scale: 1.14, offsetY: -3, widthRatio: 1.82 },
    venomoth: { scale: 1.10, offsetY: -4, widthRatio: 2.12 },
    golduck: { scale: 1.08, offsetY: -2, widthRatio: 1.74 },
    primeape: { scale: 1.06, offsetY: -2, widthRatio: 1.70 },
    arcanine: { scale: 1.18, offsetY: -4, widthRatio: 2.02 },
    poliwrath: { scale: 1.12, offsetY: -2, widthRatio: 1.76 },
    alakazam: { scale: 1.08, offsetY: -2, widthRatio: 1.74 },
    machamp: {
      scale: 1.18,
      offsetX: 0,
      playerOffsetX: 16,
      opponentOffsetX: 0,
      offsetY: -4,
      widthRatio: 1.84
    },
    victreebel: { scale: 1.12, offsetY: -5, widthRatio: 1.78 },
    golem: { scale: 1.14, offsetY: -3, widthRatio: 1.76 },
    rapidash: { scale: 1.10, offsetY: -3, widthRatio: 1.96 },
    slowbro: { scale: 1.14, offsetY: -2, widthRatio: 1.82 },
    magneton: { scale: 1.08, offsetY: -2, widthRatio: 1.90 },
    cloyster: { scale: 1.14, offsetY: -2, widthRatio: 1.80 },
    gengar: { scale: 1.12, offsetY: -3, widthRatio: 1.78 },
    kingdra: { scale: 1.28, offsetY: -8, widthRatio: 1.98 },
    starmie: { scale: 1.12, offsetY: -2, widthRatio: 1.78 },
    pinsir: { scale: 1.12, offsetY: -2, widthRatio: 1.72 },
    tauros: { scale: 1.14, offsetY: -3, widthRatio: 1.92 },

    meganium: { scale: 1.16, offsetY: -4, widthRatio: 1.96 },
    typhlosion: { scale: 1.14, offsetY: -3, widthRatio: 1.80 },
    feraligatr: { scale: 1.18, offsetY: -4, widthRatio: 1.88 },
    noctowl: { scale: 1.10, offsetY: -3, widthRatio: 2.06 },
    ampharos: { scale: 1.12, offsetY: -2, widthRatio: 1.78 },
    politoed: { scale: 1.06, offsetY: -1, widthRatio: 1.70 },
    jumpluff: { scale: 0.88, offsetY: 4, widthRatio: 1.78 },
    quagsire: { scale: 1.12, offsetY: -2, widthRatio: 1.76 },
    espeon: { scale: 1.04, offsetY: -1, widthRatio: 1.74 },
    umbreon: { scale: 1.04, offsetY: -1, widthRatio: 1.74 },
    slowking: { scale: 1.14, offsetY: -2, widthRatio: 1.84 },
    wobbuffet: { scale: 1.12, offsetY: -2, widthRatio: 1.70 },
    forretress: { scale: 1.10, offsetY: -1, widthRatio: 1.72 },
    scizor: { scale: 1.12, offsetY: -2, widthRatio: 1.82 },
    heracross: { scale: 1.14, offsetY: -2, widthRatio: 1.78 },
    ursaring: { scale: 1.18, offsetY: -3, widthRatio: 1.82 },
    houndoom: { scale: 1.10, offsetY: -2, widthRatio: 1.86 },
    blissey: { scale: 1.18, offsetY: -2, widthRatio: 1.84 }
  };

  const SIZE_TUNING_MULTIPLIERS = {
    "aerodactyl": 1.10,
    "alakazam": 1.10,
    "ampharos": 1.10,
    "arbok": 0.80,
    "arcanine": 0.80,
    "ariados": 0.90,
    "articuno": 1.20,
    "azumarill": 0.80,
    "bellossom": 0.80,
    "blastoise": 0.80,
    "blissey": 0.90,
    "chansey": 0.90,
    "charizard": 1.40,
    "clefable": 0.90,
    "cloyster": 1.10,
    "crobat": 1.10,
    "delibird": 0.90,
    "dewgong": 0.70,
    "dodrio": 1.10,
    "donphan": 0.80,
    "dragonite": 1.10,
    "dugtrio": 0.90,
    "dunsparce": 0.70,
    "electabuzz": 0.90,
    "electrode": 0.80,
    "espeon": 0.90,
    "exeggutor": 0.90,
    "farfetchd": 0.70,
    "fearow": 1.20,
    "forretress": 0.90,
    "furret": 0.80,
    "gengar": 0.90,
    "girafarig": 1.10,
    "golbat": 1.20,
    "golduck": 1.10,
    "granbull": 0.90,
    "hitmonchan": 0.90,
    "hitmonlee": 0.90,
    "hitmontop": 0.90,
    "ho-oh": 1.10,
    "houndoom": 0.90,
    "hypno": 0.90,
    "jolteon": 0.90,
    "jynx": 0.80,
    "kabutops": 0.80,
    "kakuna": 0.80,
    "kangaskhan": 0.90,
    "kingdra": 0.90,
    "kingler": 0.90,
    "lanturn": 0.80,
    "ledian": 0.90,
    "lickitung": 0.90,
    "machamp": 1.10,
    "magcargo": 0.80,
    "magmar": 0.90,
    "magneton": 1.10,
    "mantine": 0.70,
    "marowak": 0.90,
    "mew": 0.90,
    "miltank": 0.90,
    "misdreavus": 0.90,
    "moltres": 1.20,
    "mr-mime": 0.90,
    "muk": 1.20,
    "murkrow": 0.90,
    "nidoking": 0.90,
    "nidoqueen": 0.90,
    "ninetales": 0.90,
    "noctowl": 0.90,
    "octillery": 0.80,
    "omastar": 0.80,
    "onix": 1.20,
    "parasect": 0.90,
    "persian": 0.90,
    "pidgeot": 1.20,
    "pikachu": 0.90,
    "pinsir": 0.90,
    "politoed": 0.80,
    "poliwrath": 0.80,
    "porygon": 0.80,
    "porygon2": 0.90,
    "primeape": 0.90,
    "quagsire": 0.80,
    "qwilfish": 0.80,
    "raichu": 1.20,
    "rapidash": 1.10,
    "raticate": 0.70,
    "rhydon": 1.10,
    "scizor": 1.10,
    "scyther": 1.10,
    "seaking": 0.80,
    "shuckle": 0.80,
    "skarmory": 0.70,
    "slowbro": 0.80,
    "slowking": 0.90,
    "sneasel": 0.80,
    "snorlax": 1.10,
    "starmie": 0.80,
    "sudowoodo": 0.90,
    "sunflora": 0.80,
    "tangela": 0.70,
    "tauros": 1.10,
    "tentacruel": 1.20,
    "typhlosion": 1.20,
    "tyranitar": 0.90,
    "umbreon": 0.90,
    "vaporeon": 0.80,
    "venomoth": 0.90,
    "venusaur": 0.80,
    "victreebel": 1.10,
    "vileplume": 0.80,
    "weezing": 1.20,
    "wigglytuff": 0.90,
    "xatu": 0.70,
  };

  const KOREAN_TO_API = {
    "뮤": "mew",
    "세레비": "celebi",
    "피카츄": "pikachu",
    "이브이": "eevee",
    "푸린": "jigglypuff",
    "삐삐": "clefairy",
    "픽시": "clefable",
    "토게피": "togepi",
    "리자몽": "charizard",
    "프테라": "aerodactyl",
    "크로뱃": "crobat",
    "무장조": "skarmory",
    "망나뇽": "dragonite",
    "망나묭": "dragonite",
    "파이어": "moltres",
    "썬더": "zapdos",
    "프리져": "articuno",
    "프리저": "articuno",
    "루기아": "lugia",
    "칠색조": "ho-oh",
    "갸라도스": "gyarados",
    "잠만보": "snorlax",
    "마기라스": "tyranitar",
    "라프라스": "lapras",
    "뮤츠": "mewtwo",
    "라이코": "raikou",
    "엔테이": "entei",
    "앤테이": "entei",
    "스이쿤": "suicune",
    "강철톤": "steelix",
    "롱스톤": "onix",
    "이상해꽃": "venusaur",
    "거북왕": "blastoise",
    "버터플": "butterfree",
    "버터풀": "butterfree",
    "독침붕": "beedrill",
    "피죤투": "pidgeot",
    "레트라": "raticate",
    "깨비드릴조": "fearow",
    "꺠비드릴조": "fearow",
    "아보크": "arbok",
    "라이츄": "raichu",
    "고치": "kakuna",
    "니드퀸": "nidoqueen",
    "니드킹": "nidoking",
    "나인테일": "ninetales",
    "푸크린": "wigglytuff",
    "골뱃": "golbat",
    "골벳": "golbat",
    "라플레시아": "vileplume",
    "라플레이사": "vileplume",
    "파라섹트": "parasect",
    "도나리": "venomoth",
    "닥트리오": "dugtrio",
    "페르시온": "persian",
    "골덕": "golduck",
    "성원숭": "primeape",
    "윈디": "arcanine",
    "강챙이": "poliwrath",
    "후딘": "alakazam",
    "괴력몬": "machamp",
    "우츠보트": "victreebel",
    "독파리": "tentacruel",
    "딱구리": "golem",
    "날쌩마": "rapidash",
    "야도란": "slowbro",
    "레어코일": "magneton",
    "파오리": "farfetchd",
    "두트리오": "dodrio",
    "쥬레곤": "dewgong",
    "질뻐기": "muk",
    "질뻐지": "muk",
    "파르셀": "cloyster",
    "팬텀": "gengar",
    "슬리퍼": "hypno",
    "킹크랩": "kingler",
    "붐볼": "electrode",
    "나시": "exeggutor",
    "텅구리": "marowak",
    "시라소몬": "hitmonlee",
    "홍수몬": "hitmonchan",
    "내루미": "lickitung",
    "또도가스": "weezing",
    "코뿌리": "rhydon",
    "럭키": "chansey",
    "덩쿠리": "tangela",
    "캥카": "kangaskhan",
    "시드라": "seadra",
    "왕콘치": "seaking",
    "아쿠스타": "starmie",
    "마임맨": "mr-mime",
    "스라크": "scyther",
    "루즈라": "jynx",
    "에레브": "electabuzz",
    "마그마": "magmar",
    "쁘사이저": "pinsir",
    "켄타로스": "tauros",
    "샤미드": "vaporeon",
    "쥬피썬더": "jolteon",
    "쥬피써더": "jolteon",
    "부스터": "flareon",
    "폴리곤": "porygon",
    "암스타": "omastar",
    "투구푸스": "kabutops",
    "메가니움": "meganium",
    "블레이범": "typhlosion",
    "장크로다일": "feraligatr",
    "다꼬리": "furret",
    "야부엉": "noctowl",
    "레디안": "ledian",
    "아리아도스": "ariados",
    "아리아 도스": "ariados",
    "랜턴": "lanturn",
    "네오티오": "xatu",
    "전룡": "ampharos",
    "아르코": "bellossom",
    "마릴리": "azumarill",
    "꼬지모": "sudowoodo",
    "왕구리": "politoed",
    "솜솜코": "jumpluff",
    "해루미": "sunflora",
    "헤루미": "sunflora",
    "누오": "quagsire",
    "에브이": "espeon",
    "블래키": "umbreon",
    "니로우": "murkrow",
    "야도킹": "slowking",
    "무우마": "misdreavus",
    "키링키": "girafarig",
    "쏘콘": "forretress",
    "노고치": "dunsparce",
    "글라이거": "gligar",
    "그랑블루": "granbull",
    "침바루": "qwilfish",
    "핫삼": "scizor",
    "단단지": "shuckle",
    "헤라크로스": "heracross",
    "포푸니": "sneasel",
    "링곰": "ursaring",
    "마그카르고": "magcargo",
    "메꾸리": "piloswine",
    "대포무노": "octillery",
    "딜리버드": "delibird",
    "만타인": "mantine",
    "만다인": "mantine",
    "헬가": "houndoom",
    "킹드라": "kingdra",
    "코리갑": "donphan",
    "폴리곤2": "porygon2",
    "노라키": "stantler",
    "카포에라": "hitmontop",
    "밀탱크": "miltank",
    "해피너스": "blissey",
  };

  function normalizeApiName(pokemon){
    const raw = String(pokemon?.apiName || pokemon?.name || "").trim();
    if(!raw) return "";
    const mapped = KOREAN_TO_API[raw] || raw;
    return String(mapped).toLowerCase().replace(/_/g,"-").replace(/\s+/g,"-");
  }

  function groupFromAutoData(pokemon){
    const apiName = normalizeApiName(pokemon);
    if(GROUP_BY_API_NAME[apiName]) return GROUP_BY_API_NAME[apiName];

    const height = Number(pokemon?.height || 0); // PokeAPI decimeter 기준
    const weight = Number(pokemon?.weight || 0); // kilogram/hectogram source mix safe enough for grouping
    const types = Array.isArray(pokemon?.types) ? pokemon.types : [];

    if(height > 0 && height <= 5) return "tiny";
    if(height > 0 && height <= 9) return "small";
    if(types.includes("flying") && height >= 15) return "wideFlying";
    if(height >= 40) return "huge";
    if(height >= 20 || weight >= 1000) return "large";
    return "default";
  }

  function clamp(n, min, max, fallback){
    const v = Number(n);
    if(!Number.isFinite(v)) return fallback;
    return Math.max(min, Math.min(max, v));
  }

  function mergeProfile(base, extra){
    return Object.assign({}, base || {}, extra || {});
  }

  let CUSTOM_OVERRIDES = {};

  function normalizeProfileKey(value){
    return String(value || "").trim().toLowerCase().replace(/_/g,"-").replace(/\s+/g,"-");
  }

  function setCustomOverrides(next){
    CUSTOM_OVERRIDES = {};
    if(next && typeof next === "object" && !Array.isArray(next)){
      for(const [key, value] of Object.entries(next)){
        const normalized = normalizeProfileKey(key);
        if(normalized && value && typeof value === "object" && !Array.isArray(value)){
          CUSTOM_OVERRIDES[normalized] = Object.assign({}, value);
        }
      }
    }
    return CUSTOM_OVERRIDES;
  }

  function getCustomOverrides(){
    return Object.assign({}, CUSTOM_OVERRIDES);
  }

  function getBaseRenderProfile(pokemon){
    const apiName = normalizeApiName(pokemon);
    const groupName = groupFromAutoData(pokemon);
    const groupProfile = GROUPS[groupName] || GROUPS.default;
    const override = OVERRIDES[apiName];

    let profile = mergeProfile(GROUPS.default, groupProfile);

    // 명시 보정이 없는 포켓몬은 기존 서버 spriteScale을 존중하되 안전 범위에 묶는다.
    if(!override && pokemon?.spriteScale != null){
      profile.scale = clamp(pokemon.spriteScale, 0.65, 1.55, profile.scale);
    }

    profile = mergeProfile(profile, override);

    const tuningMultiplier = SIZE_TUNING_MULTIPLIERS[apiName];
    if(tuningMultiplier != null){
      profile.scale = Number(profile.scale || 1) * tuningMultiplier;
      profile.tuningMultiplier = tuningMultiplier;
    }
    return profile;
  }

  function finalizeProfile(profile){
    profile.scale = clamp(profile.scale, 0.55, 1.90, 1);
    profile.offsetX = clamp(profile.offsetX, -64, 64, 0);
    profile.playerOffsetX = clamp(profile.playerOffsetX, -64, 64, profile.offsetX);
    profile.opponentOffsetX = clamp(profile.opponentOffsetX, -64, 64, profile.offsetX);
    profile.offsetY = clamp(profile.offsetY, -48, 48, 0);
    profile.widthRatio = clamp(profile.widthRatio, 1.35, 2.85, 1.72);
    if(profile.baseHeight != null) profile.baseHeight = clamp(profile.baseHeight, 80, 240, undefined);
    return profile;
  }

  function getRenderProfile(pokemon){
    const apiName = normalizeApiName(pokemon);
    let profile = getBaseRenderProfile(pokemon);
    if(CUSTOM_OVERRIDES[apiName]){
      profile = mergeProfile(profile, CUSTOM_OVERRIDES[apiName]);
      profile.customOverride = true;
    }
    return finalizeProfile(profile);
  }

  window.POOKI_RENDER_PROFILES = {
    GROUPS,
    GROUP_BY_API_NAME,
    OVERRIDES,
    SIZE_TUNING_MULTIPLIERS,
    getBaseRenderProfile,
    getRenderProfile,
    setCustomOverrides,
    getCustomOverrides
  };
})();
