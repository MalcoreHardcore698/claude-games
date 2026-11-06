const {test}=require('node:test');const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const FX=require('../rune-effects.js'),Q=require('../guess-questions.js'),extra=require('../quiz-extra.js');
test('new trivia has 90 bilingual questions, valid categories and four distinct choices',()=>{
  assert.equal(extra.length,90);const categories=new Set(['geo','hist','sci','screen','games','nature','food','sport','misc']);
  const seen=new Set();for(const row of extra){assert.ok(categories.has(row[0]));assert.ok(row[1]&&row[2]);assert.equal(row[3].length,4);assert.equal(new Set(row[3]).size,4);assert.ok(!seen.has(row[1]));seen.add(row[1]);}
});
test('all 60 extra guessing questions have consistent yes/no answers on their actual roster',()=>{
  const html=readFileSync(path.join(__dirname,'../guess-who.html'),'utf8');
  const literal=html.match(/const THEMES=(\[[\s\S]*?\n\]);/)[1],themes=vm.runInNewContext('('+literal+')');
  Q.install(themes);let count=0;
  for(const theme of themes)for(const [id,rule]of Object.entries(theme.extraRules)){const answers=theme.c.map(hero=>Q.matches(hero[2],rule));assert.ok(answers.some(Boolean),id);assert.ok(answers.some(a=>!a),id);count++;}
  assert.equal(count,60);
});
test('row, column, moving cell and overlapping effects stay within the scored grid',()=>{
  const a=FX.grid(3,4,[{type:'fire',target:'row',index:0},{type:'charge',target:'column',index:'last'},{type:'echo',target:'cell',index:'wander'}],0);
  assert.equal(a.flat().filter(c=>c.some(f=>f.type==='fire')).length,4);
  assert.equal(a.flat().filter(c=>c.some(f=>f.type==='charge')).length,3);
  assert.equal(a[0][3].length,2);
  const b=FX.grid(3,4,[{type:'echo',target:'cell',index:'wander'}],1);
  assert.ok(b[0][1].some(f=>f.type==='echo'));
});
test('rime cleanses skulls, prisms create actual wilds, and echo never multiplies spins',()=>{
  const marks=FX.grid(1,3,[{type:'frost',target:'cell',row:0,col:0},{type:'wild',target:'cell',row:0,col:1}]);
  assert.deepEqual(FX.prepare([['skull','coin','heart']],marks),[['shield','star','heart']]);
  const result=FX.apply({phys:10,mag:0,block:0,heal:0,gold:2,spins:1,skulls:0},'sword',[{type:'fire',power:1},{type:'echo',power:1}],1,1);
  assert.equal(result.phys,13.5);assert.equal(result.mag,2.0250000000000004);assert.equal(result.spins,1);
});
