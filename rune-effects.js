(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrionRuneEffects=api;})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const types={
    fire:{n:['Горение','Burning'],d:['+1,5 магического урона от каждой отмеченной ячейки.','Each marked cell adds 1.5 magic damage.'],i:'fa-fire',c:'#ff9854'},
    charge:{n:['Заряд','Charge'],d:['Молнии сильнее на 50%, остальные символы дают +0,5 магического урона.','Bolts are 50% stronger; other symbols add 0.5 magic damage.'],i:'fa-bolt',c:'#69e5ff'},
    renew:{n:['Источник','Wellspring'],d:['Сердца и щиты дополнительно лечат на 1, другие ячейки — на 0,35.','Hearts and shields heal 1 extra; other cells heal 0.35.'],i:'fa-droplet',c:'#69e4ad'},
    gild:{n:['Позолота','Gilding'],d:['+2 золота с ячейки; ценность монет дополнительно +35%.','+2 gold per cell; coins are worth 35% more.'],i:'fa-coins',c:'#ffd36c'},
    echo:{n:['Эхо','Echo'],d:['Урон, блок, лечение и золото ячейки сильнее на 35%.','Cell damage, block, healing and gold are 35% stronger.'],i:'fa-clone',c:'#d0a1ff'},
    frost:{n:['Иней','Rime'],d:['Череп заменяется щитом. Щит даёт +1 блок, другие ячейки — +0,5 блока.','Skulls become shields. Shields add 1 block; other cells add 0.5 block.'],i:'fa-snowflake',c:'#b1e9ff'},
    wild:{n:['Призма','Prism'],d:['Символ ячейки становится звездой-джокером.','The symbol becomes a wild star.'],i:'fa-star',c:'#f5e3ff'}
  };
  const mod=(n,size)=>((n%size)+size)%size;
  const index=(value,size)=>value==='middle'?Math.floor(size/2):value==='last'?size-1:mod(Number(value)||0,size);
  function grid(rows,cols,recipes,turn=0){
    const result=Array.from({length:rows},()=>Array.from({length:cols},()=>[]));
    for(const recipe of recipes||[]){if(!types[recipe.type])continue;
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
        const target=recipe.target||'cell';
        const match=target==='row'?r===index(recipe.index,rows):target==='column'?c===index(recipe.index,cols):recipe.index==='wander'?r*cols+c===mod(turn+(recipe.seed||0),rows*cols):r===index(recipe.row??'middle',rows)&&c===index(recipe.col??'middle',cols);
        if(!match)continue;const existing=result[r][c].find(x=>x.type===recipe.type);
        if(existing)existing.power=Math.min(2,existing.power+(recipe.power||1));else result[r][c].push({type:recipe.type,power:Math.min(2,recipe.power||1)});
      }
    }return result;
  }
  function prepare(symbols,marks){return symbols.map((row,r)=>row.map((s,c)=>{const fx=marks?.[r]?.[c]||[];if(fx.some(f=>f.type==='wild'))return 'star';if(s==='skull'&&fx.some(f=>f.type==='frost'))return 'shield';return s;}));}
  function apply(cell,symbol,effects,multiplier=1,scale=1){
    const out={...cell};
    for(const f of effects||[]){const p=f.power||1;
      if(f.type==='fire')out.mag+=1.5*p*multiplier;
      else if(f.type==='charge'){if(symbol==='bolt')out.mag*=1+.5*p;else out.mag+=.5*p*multiplier;}
      else if(f.type==='renew')out.heal+=(['heart','shield'].includes(symbol)?1:.35)*p*multiplier;
      else if(f.type==='gild'){out.gold+=2*p*multiplier;if(symbol==='coin')out.gold*=1+.35*p;}
      else if(f.type==='frost')out.block+=(symbol==='shield'?1:.5)*p*multiplier;
    }
    const echo=(effects||[]).find(f=>f.type==='echo');if(echo)for(const k of ['phys','mag','block','heal','gold'])out[k]*=1+.35*echo.power;
    for(const k of ['phys','mag','block','heal'])out[k]*=scale;
    return out;
  }
  function install(runes,positions,synergies,basic,RP){
    const fx=(type,target,index,extra={})=>({type,target,index,...extra});
    const definitions={
      kenaz:{g:'ᚲ',c:'#d66332',n:['Кеназ','Kenaz'],d:['Накладывает горение на ячейки барабана.','Ignites cells on the reels.'],p:[
        RP(1,{fx:fx('fire','row',0)},'Горение всего верхнего ряда.','Burning across the top row.'),RP(3,{fx:fx('fire','column',0)},'Горение всего первого столбца.','Burning down the first column.'),RP(5,{sw:1,fx:fx('fire','cell',null)},'Меч +1; горение центральной ячейки.','Swords +1; burning in the centre cell.')]},
      laguz:{g:'ᛚ',c:'#279b98',n:['Лагуз','Laguz'],d:['Создаёт лечебные источники на барабане.','Creates healing springs on the reels.'],p:[
        RP(2,{fx:fx('renew','row','last')},'Источник в нижнем ряду.','Wellspring across the bottom row.'),RP(4,{fx:fx('renew','column','middle')},'Источник в среднем столбце.','Wellspring down the middle column.'),RP(6,{he:1,fx:fx('renew','cell',null,{row:'last',col:'last',power:2})},'Сердце +1; двойной источник в правом нижнем углу.','Hearts +1; double wellspring in the bottom-right cell.')]},
      ansuz:{g:'ᚨ',c:'#398fae',n:['Ансуз','Ansuz'],d:['Заряжает клетки молниями.','Charges cells with lightning.'],p:[
        RP(1,{fx:fx('charge','column','last')},'Заряд последнего столбца.','Charge down the last column.'),RP(4,{weights:{bolt:3},fx:fx('charge','row','middle')},'Заряд среднего ряда; молнии чаще.','Charge across the middle row; more bolts.'),RP(6,{bo:1,fx:fx('charge','cell',null,{index:'wander',seed:6,power:2})},'Молния +1; двойной заряд перемещается каждый ход.','Bolts +1; a double charge moves each turn.')]},
      perthro:{g:'ᛈ',c:'#985bcc',n:['Пертро','Perthro'],d:['Эхо повторяет часть награды клетки.','Echo repeats part of a cell’s reward.'],p:[
        RP(2,{fx:fx('echo','row','middle')},'Эхо всего среднего ряда.','Echo across the middle row.'),RP(3,{fx:fx('echo','column','last')},'Эхо всего последнего столбца.','Echo down the last column.'),RP(5,{crit:.05,fx:fx('echo','cell',null,{index:'wander',seed:3,power:2})},'Крит +5%; двойное эхо перемещается каждый ход.','Crit +5%; a double echo moves each turn.')]},
      othala:{g:'ᛟ',c:'#b28a37',n:['Отала','Othala'],d:['Позолоченные клетки дают больше золота.','Gilded cells produce extra gold.'],p:[
        RP(2,{fx:fx('gild','column',0)},'Позолота первого столбца.','Gilding down the first column.'),RP(4,{fx:fx('gild','row','last')},'Позолота нижнего ряда.','Gilding across the bottom row.'),RP(5,{coinBonus:.15,fx:fx('gild','cell',null,{row:0,col:'last',power:2})},'Монеты +15%; двойная позолота в правом верхнем углу.','Coins +15%; double gilding in the top-right cell.')]},
      dagaz:{g:'ᛞ',c:'#ab7dc8',n:['Дагаз','Dagaz'],d:['Меняет форму барабана и создаёт джокеры.','Reshapes the reels and creates wilds.'],p:[
        RP(1,{oscillate:1,fx:fx('wild','cell',null,{index:'wander',seed:1})},'Каждый ход чередует +1 ряд и +1 столбец; перемещающийся джокер.','Alternates +1 row and +1 column each turn; a moving wild.'),RP(3,{cols:1,fx:fx('wild','cell',null)},'+1 столбец; джокер в центре.','+1 column; a wild in the centre.'),RP(6,{rows:1,fx:fx('frost','column',0)},'+1 ряд; иней первого столбца.','+1 row; rime down the first column.')]}
    };
    for(const [id,d]of Object.entries(definitions)){runes[id]={g:d.g,c:d.c,n:d.n,d:d.d,positions:d.p};positions[id]=d.p;basic.push(id);}
    const extra=[
      ['firewall',{kenaz:1,algiz:1},'fa-shield-halved',['Огненный заслон','Fire barrier'],['Горение верхнего ряда и иней нижнего.','Burning on the top row and rime on the bottom row.'],[fx('fire','row',0),fx('frost','row','last')]],
      ['tide',{laguz:1,berkana:1},'fa-water',['Живая вода','Living water'],['Источник нижнего ряда.','Wellspring across the bottom row.'],[fx('renew','row','last')]],
      ['conductor',{ansuz:1,thurs:1},'fa-tower-broadcast',['Проводник','Conductor'],['Заряд среднего столбца.','Charge down the middle column.'],[fx('charge','column','middle')]],
      ['mirror',{perthro:1,gebo:1},'fa-clone',['Зеркало судьбы','Mirror of fate'],['Двойное эхо центральной клетки.','Double echo in the centre cell.'],[fx('echo','cell',null,{power:2})]],
      ['goldpath',{othala:1,fehu:1},'fa-coins',['Золотая жила','Golden vein'],['Позолота первого столбца.','Gilding down the first column.'],[fx('gild','column',0)]],
      ['equinox',{dagaz:1,jera:1},'fa-circle-half-stroke',['Равноденствие','Equinox'],['Ещё один перемещающийся джокер.','One more moving wild.'],[fx('wild','cell',null,{index:'wander',seed:7})]]
    ];
    for(const [id,need,i,n,d,effects]of extra)synergies.push({id,need,i,n,d,effects});
    const attach=(id,slot,effect,ru,en)=>{const p=positions[id].find(p=>p.slot===slot);if(p){p.effect.fx=effect;p.d=[p.d[0]+' '+ru,p.d[1]+' '+en];}};
    attach('thurs',4,fx('charge','column','middle'),'Заряд среднего столбца.','Charge down the middle column.');
    attach('algiz',5,fx('frost','row','last'),'Иней нижнего ряда.','Rime across the bottom row.');
    attach('berkana',2,fx('renew','cell',null),'Источник центральной клетки.','Wellspring in the centre cell.');
    attach('fehu',4,fx('gild','column','last'),'Позолота последнего столбца.','Gilding down the last column.');
    const j=positions.jera.find(p=>p.slot===4);j.effect.cols=2;j.d=['+2 ячейки в строке; монеты чаще (+3 веса).','+2 cells per row; more coins (+3 weight).'];
  }
  return{types,grid,prepare,apply,install};
});
