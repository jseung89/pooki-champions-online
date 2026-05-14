const fs = require("fs/promises");
const path = require("path");
const { hasEnoughUsableMoves } = require("./moveBuilder");

const DATA_DIR = path.join(__dirname, "..", "data");
const CACHE_PATH = path.join(DATA_DIR, "pokemon_cache_gen2_v590_move_rework.json");
const POKE_API = "https://pokeapi.co/api/v2";

const KO_NAMES = {
  1: "이상해씨", 2: "이상해풀", 3: "이상해꽃", 4: "파이리", 5: "리자드", 6: "리자몽",
  7: "꼬부기", 8: "어니부기", 9: "거북왕", 10: "캐터피", 11: "단데기", 12: "버터플",
  13: "뿔충이", 14: "딱충이", 15: "독침붕", 16: "구구", 17: "피죤", 18: "피죤투",
  19: "꼬렛", 20: "레트라", 21: "깨비참", 22: "깨비드릴조", 23: "아보", 24: "아보크",
  25: "피카츄", 26: "라이츄", 27: "모래두지", 28: "고지", 29: "니드런♀", 30: "니드리나",
  31: "니드퀸", 32: "니드런♂", 33: "니드리노", 34: "니드킹", 35: "삐삐", 36: "픽시",
  37: "식스테일", 38: "나인테일", 39: "푸린", 40: "푸크린", 41: "주뱃", 42: "골뱃",
  43: "뚜벅쵸", 44: "냄새꼬", 45: "라플레시아", 46: "파라스", 47: "파라섹트",
  48: "콘팡", 49: "도나리", 50: "디그다", 51: "닥트리오", 52: "나옹", 53: "페르시온",
  54: "고라파덕", 55: "골덕", 56: "망키", 57: "성원숭", 58: "가디", 59: "윈디",
  60: "발챙이", 61: "슈륙챙이", 62: "강챙이", 63: "캐이시", 64: "윤겔라", 65: "후딘",
  66: "알통몬", 67: "근육몬", 68: "괴력몬", 69: "모다피", 70: "우츠동", 71: "우츠보트",
  72: "왕눈해", 73: "독파리", 74: "꼬마돌", 75: "데구리", 76: "딱구리", 77: "포니타",
  78: "날쌩마", 79: "야돈", 80: "야도란", 81: "코일", 82: "레어코일", 83: "파오리",
  84: "두두", 85: "두트리오", 86: "쥬쥬", 87: "쥬레곤", 88: "질퍽이", 89: "질뻐기",
  90: "셀러", 91: "파르셀", 92: "고오스", 93: "고우스트", 94: "팬텀", 95: "롱스톤",
  96: "슬리프", 97: "슬리퍼", 98: "크랩", 99: "킹크랩", 100: "찌리리공", 101: "붐볼",
  102: "아라리", 103: "나시", 104: "탕구리", 105: "텅구리", 106: "시라소몬", 107: "홍수몬",
  108: "내루미", 109: "또가스", 110: "또도가스", 111: "뿔카노", 112: "코뿌리", 113: "럭키",
  114: "덩쿠리", 115: "캥카", 116: "쏘드라", 117: "시드라", 118: "콘치", 119: "왕콘치",
  120: "별가사리", 121: "아쿠스타", 122: "마임맨", 123: "스라크", 124: "루주라",
  125: "에레브", 126: "마그마", 127: "쁘사이저", 128: "켄타로스", 129: "잉어킹",
  130: "갸라도스", 131: "라프라스", 132: "메타몽", 133: "이브이", 134: "샤미드",
  135: "쥬피썬더", 136: "부스터", 137: "폴리곤", 138: "암나이트", 139: "암스타",
  140: "투구", 141: "투구푸스", 142: "프테라", 143: "잠만보", 144: "프리져",
  145: "썬더", 146: "파이어", 147: "미뇽", 148: "신뇽", 149: "망나뇽", 150: "뮤츠", 151: "뮤",

  152: "치코리타", 153: "베이리프", 154: "메가니움", 155: "브케인", 156: "마그케인", 157: "블레이범",
  158: "리아코", 159: "엘리게이", 160: "장크로다일", 161: "꼬리선", 162: "다꼬리",
  163: "부우부", 164: "야부엉", 165: "레디바", 166: "레디안", 167: "페이검", 168: "아리아도스",
  169: "크로뱃", 170: "초라기", 171: "랜턴", 172: "피츄", 173: "삐", 174: "푸푸린",
  175: "토게피", 176: "토게틱", 177: "네이티", 178: "네이티오", 179: "메리프", 180: "보송송",
  181: "전룡", 182: "아르코", 183: "마릴", 184: "마릴리", 185: "꼬지모", 186: "왕구리",
  187: "통통코", 188: "두코", 189: "솜솜코", 190: "에이팜", 191: "해너츠", 192: "해루미",
  193: "왕자리", 194: "우파", 195: "누오", 196: "에브이", 197: "블래키", 198: "니로우",
  199: "야도킹", 200: "무우마", 201: "안농", 202: "마자용", 203: "키링키", 204: "피콘",
  205: "쏘콘", 206: "노고치", 207: "글라이거", 208: "강철톤", 209: "블루", 210: "그랑블루",
  211: "침바루", 212: "핫삼", 213: "단단지", 214: "헤라크로스", 215: "포푸니",
  216: "깜지곰", 217: "링곰", 218: "마그마그", 219: "마그카르고", 220: "꾸꾸리", 221: "메꾸리",
  222: "코산호", 223: "총어", 224: "대포무노", 225: "딜리버드", 226: "만타인",
  227: "무장조", 228: "델빌", 229: "헬가", 230: "킹드라", 231: "코코리", 232: "코리갑",
  233: "폴리곤2", 234: "노라키", 235: "루브도", 236: "배루키", 237: "카포에라",
  238: "뽀뽀라", 239: "에레키드", 240: "마그비", 241: "밀탱크", 242: "해피너스",
  243: "라이코", 244: "앤테이", 245: "스이쿤", 246: "애버라스", 247: "데기라스", 248: "마기라스",
  249: "루기아", 250: "칠색조", 251: "세레비",
};


const FINAL_EVOLUTION_OR_PIKACHU_IDS = new Set([
  3, 6, 9, 12, 15, 18, 20, 22, 24, 25, 26, 28, 31, 34, 36, 38, 40, 42,
  45, 47, 49, 51, 53, 55, 57, 59, 62, 65, 68, 71, 73, 76, 78, 80, 82,
  83, 85, 87, 89, 91, 94, 95, 97, 99, 101, 103, 105, 106, 107, 108,
  110, 112, 113, 114, 115, 117, 119, 121, 122, 123, 124, 125, 126, 127,
  128, 130, 131, 134, 135, 136, 137, 139, 141, 142, 143, 144, 145,
  146, 149, 150, 151,

  // 2세대: 최종진화체 + 단일 포켓몬 + 전설/환상
  154, 157, 160, 162, 164, 166, 168, 169, 171, 178, 181, 182, 184, 185,
  186, 189, 192, 195, 196, 197, 198, 199, 200, 203, 205, 206, 207,
  208, 210, 211, 212, 213, 214, 215, 217, 219, 221, 224, 225, 226, 227,
  229, 230, 232, 233, 234, 237, 241, 242, 243, 244, 245, 248, 249,
  250, 251
]);

function isGen2FinalEvolutionOrPikachu(pokemon) {
  return FINAL_EVOLUTION_OR_PIKACHU_IDS.has(Number(pokemon.id));
}

function filterPlayableGen2Pool(pool) {
  return pool
    .filter(isGen2FinalEvolutionOrPikachu)
    .filter((pokemon) => pokemon.frontSprite && pokemon.backSprite)
    .filter(hasEnoughUsableMoves);
}


const MANUAL_SPRITE_SCALE = {
  24: 0.98, 42: 0.96, 45: 1.02, 49: 0.95, 59: 1.05, 65: 0.96, 68: 1.05,
  71: 1.03, 73: 1.08, 76: 1.1, 80: 1.05, 87: 1.04, 91: 1.06, 94: 0.88,
  95: 1.18, 101: 0.9, 103: 1.12, 110: 0.94, 112: 1.12, 113: 0.98,
  114: 1.04, 115: 1.08, 121: 0.96, 123: 1.08, 124: 0.94, 125: 1.0,
  126: 1.02, 127: 1.08, 128: 1.1, 130: 1.18, 131: 1.12, 132: 0.82,
  134: 1.06, 135: 0.96, 136: 1.0, 139: 1.08, 141: 1.08, 142: 1.18,
  143: 1.2, 144: 1.42, 145: 1.38, 146: 1.45, 149: 1.2, 150: 1.06, 151: 0.92,

  // 2세대 대형/전설 보정
  154: 1.08, 157: 1.08, 160: 1.12, 169: 1.06, 171: 1.02, 181: 1.05,
  184: 0.98, 189: 0.95, 196: 0.95, 197: 0.98, 199: 1.03, 202: 1.05,
  205: 1.03, 208: 1.34, 212: 1.12, 214: 1.1, 217: 1.12, 221: 1.05,
  226: 1.14, 227: 1.12, 229: 1.08, 230: 1.15, 232: 1.12, 237: 1.0,
  241: 1.08, 242: 1.02, 243: 1.25, 244: 1.28, 245: 1.22, 248: 1.28,
  249: 1.45, 250: 1.45, 251: 0.96
};

function baseSpriteScaleByHeight(height) {
  if (!height) return 1;
  if (height <= 6) return 0.88;
  if (height <= 10) return 0.96;
  if (height <= 16) return 1.0;
  if (height <= 22) return 1.08;
  if (height <= 30) return 1.16;
  return 1.24;
}

function spriteScaleForPokemon(pokemon) {
  return MANUAL_SPRITE_SCALE[pokemon.id] || baseSpriteScaleByHeight(pokemon.height);
}


const FALLBACK_POOL = [
  { id: 6, name: "리자몽", apiName: "charizard", types: ["fire", "flying"], stats: { hp: 156, attack: 94, defense: 85, speed: 100 }, availableMoveNames: ["flamethrower", "fire-blast", "air-slash", "will-o-wisp", "slash", "hyper-beam"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/6.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/6.gif", isBaby: false },
  { id: 9, name: "거북왕", apiName: "blastoise", types: ["water"], stats: { hp: 165, attack: 88, defense: 105, speed: 78 }, availableMoveNames: ["water-gun", "surf", "hydro-pump", "body-slam", "scary-face", "hyper-beam"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/9.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/9.gif", isBaby: false },
  { id: 3, name: "이상해꽃", apiName: "venusaur", types: ["grass", "poison"], stats: { hp: 160, attack: 90, defense: 90, speed: 80 }, availableMoveNames: ["vine-whip", "razor-leaf", "energy-ball", "sleep-powder", "poison-powder", "body-slam"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/3.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/3.gif", isBaby: false },
  { id: 25, name: "피카츄", apiName: "pikachu", types: ["electric"], stats: { hp: 118, attack: 75, defense: 55, speed: 120 }, availableMoveNames: ["thunder-shock", "thunderbolt", "thunder", "thunder-wave", "quick-attack"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/25.gif", isBaby: false },
  { id: 143, name: "잠만보", apiName: "snorlax", types: ["normal"], stats: { hp: 220, attack: 112, defense: 75, speed: 30 }, availableMoveNames: ["body-slam", "hyper-beam", "tackle", "harden", "earthquake"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/143.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/143.gif", isBaby: false },
  { id: 149, name: "망나뇽", apiName: "dragonite", types: ["dragon", "flying"], stats: { hp: 175, attack: 125, defense: 95, speed: 80 }, availableMoveNames: ["dragon-breath", "wing-attack", "hyper-beam", "thunder-wave", "fire-blast"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/149.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/149.gif", isBaby: false },
  { id: 130, name: "갸라도스", apiName: "gyarados", types: ["water", "flying"], stats: { hp: 170, attack: 115, defense: 85, speed: 81 }, availableMoveNames: ["water-gun", "hydro-pump", "bite", "scary-face", "hyper-beam"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/130.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/130.gif", isBaby: false },
  { id: 59, name: "윈디", apiName: "arcanine", types: ["fire"], stats: { hp: 165, attack: 110, defense: 80, speed: 95 }, availableMoveNames: ["flamethrower", "fire-blast", "bite", "scary-face", "quick-attack"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/59.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/59.gif", isBaby: false },
  { id: 94, name: "팬텀", apiName: "gengar", types: ["ghost", "poison"], stats: { hp: 135, attack: 92, defense: 75, speed: 110 }, availableMoveNames: ["shadow-ball", "sludge-bomb", "psychic", "hypnosis", "thunderbolt"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/94.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/94.gif", isBaby: false },
  { id: 65, name: "후딘", apiName: "alakazam", types: ["psychic"], stats: { hp: 125, attack: 95, defense: 75, speed: 120 }, availableMoveNames: ["psychic", "confusion", "recover", "agility", "shadow-ball"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/65.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/65.gif", isBaby: false },
  { id: 68, name: "괴력몬", apiName: "machamp", types: ["fighting"], stats: { hp: 170, attack: 125, defense: 85, speed: 55 }, availableMoveNames: ["karate-chop", "brick-break", "body-slam", "earthquake", "scary-face"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/68.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/68.gif", isBaby: false },
  { id: 131, name: "라프라스", apiName: "lapras", types: ["water", "ice"], stats: { hp: 190, attack: 85, defense: 95, speed: 60 }, availableMoveNames: ["surf", "hydro-pump", "ice-beam", "body-slam", "hyper-beam"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/131.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/131.gif", isBaby: false },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


const GEN2_FALLBACK_EXTRA = [
  { id: 197, name: "블래키", apiName: "umbreon", types: ["dark"], stats: { hp: 170, attack: 76, defense: 128, speed: 65 }, availableMoveNames: ["bite", "crunch", "quick-attack", "scary-face", "body-slam"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/197.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/197.gif", isBaby: false, height: 10, spriteScale: 0.98 },
  { id: 229, name: "헬가", apiName: "houndoom", types: ["dark", "fire"], stats: { hp: 150, attack: 110, defense: 80, speed: 105 }, availableMoveNames: ["crunch", "bite", "flamethrower", "fire-blast", "scary-face"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/229.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/229.gif", isBaby: false, height: 14, spriteScale: 1.08 },
  { id: 244, name: "앤테이", apiName: "entei", types: ["fire"], stats: { hp: 190, attack: 115, defense: 95, speed: 100 }, availableMoveNames: ["flamethrower", "fire-blast", "overheat", "crunch", "bite", "extreme-speed", "will-o-wisp"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/244.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/244.gif", isBaby: false, height: 21, spriteScale: 1.28 },
  { id: 248, name: "마기라스", apiName: "tyranitar", types: ["rock", "dark"], stats: { hp: 190, attack: 134, defense: 120, speed: 61 }, availableMoveNames: ["crunch", "bite", "rock-slide", "earthquake", "scary-face"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/248.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/248.gif", isBaby: false, height: 20, spriteScale: 1.28 },
  { id: 208, name: "강철톤", apiName: "steelix", types: ["steel", "ground"], stats: { hp: 160, attack: 95, defense: 170, speed: 30 }, availableMoveNames: ["iron-tail", "earthquake", "dig", "rock-slide", "harden"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/208.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/208.gif", isBaby: false, height: 92, spriteScale: 1.34 },
  { id: 212, name: "핫삼", apiName: "scizor", types: ["bug", "steel"], stats: { hp: 150, attack: 130, defense: 110, speed: 65 }, availableMoveNames: ["slash", "iron-tail", "bug-bite", "swords-dance", "quick-attack"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/212.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/212.gif", isBaby: false, height: 18, spriteScale: 1.12 },
  { id: 227, name: "무장조", apiName: "skarmory", types: ["steel", "flying"], stats: { hp: 140, attack: 90, defense: 140, speed: 70 }, availableMoveNames: ["iron-tail", "air-slash", "aerial-ace", "harden", "slash"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/227.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/227.gif", isBaby: false, height: 17, spriteScale: 1.12 },
  { id: 249, name: "루기아", apiName: "lugia", types: ["psychic", "flying"], stats: { hp: 205, attack: 100, defense: 140, speed: 110 }, availableMoveNames: ["psychic", "air-slash", "hydro-pump", "recover", "dragon-breath"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/249.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/249.gif", isBaby: false, height: 52, spriteScale: 1.45 },
  { id: 250, name: "칠색조", apiName: "ho-oh", types: ["fire", "flying"], stats: { hp: 205, attack: 120, defense: 130, speed: 90 }, availableMoveNames: ["flamethrower", "fire-blast", "air-slash", "recover", "hyper-beam"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/250.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/250.gif", isBaby: false, height: 38, spriteScale: 1.45 },
  { id: 251, name: "세레비", apiName: "celebi", types: ["psychic", "grass"], stats: { hp: 180, attack: 100, defense: 100, speed: 100 }, availableMoveNames: ["psychic", "energy-ball", "recover", "sleep-powder", "razor-leaf"], frontSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/251.gif", backSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/251.gif", isBaby: false, height: 6, spriteScale: 0.96 }
];


async function fetchJson(url, retries = 3) {
  let lastError;
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      await sleep(250 * (i + 1));
    }
  }
  throw lastError;
}

function getStat(stats, name) {
  return stats.find((s) => s.stat.name === name)?.base_stat || 50;
}

function scaleHp(baseHp) {
  return Math.max(80, Math.round(72 + baseHp * 0.86));
}

function scaleStat(value) {
  return Math.max(35, Math.round(value));
}


function koreanNameFromSpecies(pokemon, species) {
  const names = Array.isArray(species?.names) ? species.names : [];
  const ko = names.find((entry) => entry?.language?.name === "ko")?.name;
  const koOfficial = names.find((entry) => entry?.language?.name === "ko-Hrkt")?.name;
  return ko || koOfficial || KO_NAMES[pokemon.id] || pokemon.name;
}

function mapPokemon(pokemon, species) {
  const attack = getStat(pokemon.stats, "attack");
  const spAttack = getStat(pokemon.stats, "special-attack");
  const defense = getStat(pokemon.stats, "defense");
  const spDefense = getStat(pokemon.stats, "special-defense");

  return {
    id: pokemon.id,
    apiName: pokemon.name,
    name: koreanNameFromSpecies(pokemon, species),
    height: pokemon.height,
    spriteScale: spriteScaleForPokemon(pokemon),
    types: pokemon.types.map((t) => t.type.name),
    stats: {
      hp: scaleHp(getStat(pokemon.stats, "hp")),
      attack: scaleStat(Math.round((attack + spAttack) / 2)),
      defense: scaleStat(Math.round((defense + spDefense) / 2)),
      speed: scaleStat(getStat(pokemon.stats, "speed")),
    },
    availableMoveNames: pokemon.moves.map((m) => m.move.name),
    frontSprite: pokemon.sprites?.other?.showdown?.front_default || pokemon.sprites?.front_default || "",
    backSprite: pokemon.sprites?.other?.showdown?.back_default || pokemon.sprites?.back_default || "",
    isBaby: Boolean(species.is_baby),
  };
}

async function buildCache() {
  const result = [];

  console.log("[DATA] 1~2세대 최종진화체 + 피카츄 + 전설 데이터 준비 중...");

  for (let id = 1; id <= 251; id += 1) {
    try {
      const [pokemon, species] = await Promise.all([
        fetchJson(`${POKE_API}/pokemon/${id}`),
        fetchJson(`${POKE_API}/pokemon-species/${id}`),
      ]);

      const mapped = mapPokemon(pokemon, species);

      if (isGen2FinalEvolutionOrPikachu(mapped) && mapped.frontSprite && mapped.backSprite && hasEnoughUsableMoves(mapped)) {
        result.push(mapped);
      }

      if (id % 25 === 0 || id === 251) {
        console.log(`[DATA] ${id}/251 확인 중... 후보 ${result.length}마리`);
      }
    } catch (err) {
      console.warn(`[DATA][WARN] ${id}번 로드 실패`);
    }
  }

  if (result.length < 40) {
    console.warn("[DATA][WARN] API 후보가 부족합니다. 기본 포켓몬 풀로 실행합니다.");
    return ensureMandatoryExtraPokemon([...FALLBACK_POOL, ...GEN2_FALLBACK_EXTRA]);
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(result, null, 2), "utf-8");
  console.log(`[DATA] 한글 이름 적용 완료 / 포켓몬 준비 완료 ${result.length}마리`);
  return result;
}


function ensureMandatoryExtraPokemon(pool) {
  const result = Array.isArray(pool) ? [...pool] : [];
  for (const extra of GEN2_FALLBACK_EXTRA) {
    if (!result.some((p) => Number(p.id) === Number(extra.id)) && hasEnoughUsableMoves(extra)) {
      result.push(extra);
    }
  }
  return result.sort((a, b) => Number(a.id) - Number(b.id));
}

async function loadPokemonData() {
  console.log("[DATA] 한글 이름 캐시 확인 중...");

  try {
    const raw = await fs.readFile(CACHE_PATH, "utf-8");
    const parsed = ensureMandatoryExtraPokemon(filterPlayableGen2Pool(JSON.parse(raw)));
    console.log(`[DATA] 한글 이름 적용 완료 / 포켓몬 준비 완료 ${parsed.length}마리`);
    return parsed;
  } catch (_) {
    try {
      return await buildCache();
    } catch (err) {
      console.warn("[DATA][WARN] API 캐싱 실패. 기본 포켓몬 풀로 실행합니다.");
      return ensureMandatoryExtraPokemon([...FALLBACK_POOL, ...GEN2_FALLBACK_EXTRA]);
    }
  }
}

module.exports = {
  loadPokemonData,
};
