const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync,existsSync}=require('node:fs');
const path=require('node:path');
const at=file=>readFileSync(path.join(__dirname,'..',file),'utf8');

test('recovered rune campaigns and modes reference six saved illustrations',()=>{
  const page=at('runes.html');
  for(const name of ['campaign-knight','campaign-rogue','campaign-mage','mode-time','mode-endless','mode-weekly'])
    assert.ok(existsSync(path.join(__dirname,'../assets',name+'.webp')),name);
  assert.match(page,/assets\/campaign-\$\{k\}\.webp/);
  assert.match(page,/assets\/mode-\$\{m\.id\}\.webp/);
});

test('wheel has clickable sectors, animated geometry, and a way to remove votes',()=>{
  const script=at('tamada.js');
  assert.match(script,/data-tm-action=\\?"sector\\?"/);
  assert.match(script,/attributeName=\\?"d\\?"/);
  assert.match(script,/event\.shiftKey/);
  assert.match(script,/addEventListener\('contextmenu'/);
  assert.doesNotMatch(script,/class="tmVoteRows"/);
});

test('compact Tamada layout and all three illustrations are available',()=>{
  const css=at('tamada.css');
  assert.match(css,/body:has\(#vTamada:not\(\[hidden\]\)\).*overflow:hidden/);
  assert.match(css,/\.tmSettings\{grid-column:2/);
  assert.match(at('guess-who.html'),/guessMenuArt img\{width:100%;height:100%;object-fit:cover/);
  assert.match(at('quiz.html'),/class="quizFullArt"/);
  assert.match(at('index.html'),/assets\/svo-card\.webp/);
});
