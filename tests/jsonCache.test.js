const test = require('node:test');
const assert = require('node:assert/strict');
const { createJsonCache } = require('../src/jsonCache');

function fixture() {
  let time=0, revision=1, text='{"rewards":[1]}', reads=0, stats=0, missing=false;
  const cache=createJsonCache({now:()=>time,io:{
    statSync:()=>{stats++;if(missing)throw Object.assign(new Error('missing'),{code:'ENOENT'});return{mtimeMs:revision,ctimeMs:revision,size:text.length};},
    readFileSync:()=>{reads++;return text;}
  }});
  return {cache, counts:()=>({reads,stats}), advance:()=>{time+=1001;}, set:value=>{text=value;revision++;}, remove:()=>{missing=true;}};
}
test('1000 repeated reads avoid disk reads and stat calls; returned objects are isolated',()=>{
  const f=fixture();f.cache.read('data').rewards.push(99);
  for(let i=0;i<1000;i++)assert.deepEqual(f.cache.read('data'),{rewards:[1]});
  assert.deepEqual(f.counts(),{reads:1,stats:1});
  f.advance();assert.deepEqual(f.cache.read('data'),{rewards:[1]});
  assert.deepEqual(f.counts(),{reads:1,stats:2});
});
test('external edits refresh after interval and admin invalidation refreshes immediately',()=>{
  const f=fixture();f.cache.read('data');f.set('{"rewards":[2]}');f.advance();
  assert.deepEqual(f.cache.read('data'),{rewards:[2]});
  f.set('{"rewards":[3]}');f.cache.invalidate('data');
  assert.deepEqual(f.cache.read('data'),{rewards:[3]});
});
test('removed file returns a copy of fallback and malformed data does not poison cache',()=>{
  const f=fixture();f.cache.read('data');f.set('{bad');f.advance();
  assert.throws(()=>f.cache.read('data'),SyntaxError);
  f.set('{"rewards":[4]}');assert.deepEqual(f.cache.read('data'),{rewards:[4]});
  f.remove();f.advance();const fallback={rewards:[]};
  assert.deepEqual(f.cache.read('data',fallback),fallback);
  assert.notEqual(f.cache.read('data',fallback),fallback);
});
