(()=>{'use strict';const C=OrionCatan,D=OrionCatanContent,$=s=>document.querySelector(s),icons={wood:'🌲',brick:'🧱',sheep:'🐑',wheat:'🌾',ore:'🪨'},colors={wood:'#84a88d',brick:'#c78b73',sheep:'#b3c68a',wheat:'#d3b677',ore:'#9e9fb2'},resNames={wood:['Дерево','Wood'],brick:['Кирпич','Brick'],sheep:['Шерсть','Wool'],wheat:['Пшеница','Wheat'],ore:['Руда','Ore'],desert:['Пустыня','Desert']};let app,scene,choice='',dialogType='',modalKey='',latest=null,income=null,incomeTimer=0;
const DICE_TOSS_MS=650,INCOME_LABEL_MS=650;const sent=new Map();
const words={size:['Размер острова','Island size'],terrain:['Ландшафт','Landscape'],mixed:['Разнообразный','Mixed'],woodland:['Больше лесов','Woodland'],farmland:['Больше полей','Farmland'],deserts:['Пустыни','Deserts'],ports:['Порты','Harbors'],standardPorts:['Обычно · 9 / 11','Standard · 9 / 11'],few:['Мало · 6','Few · 6'],many:['Много · 12','Many · 12'],robberSetting:['Разбойник и сброс на семёрке','Robber and seven discards'],tradeSetting:['Обмен между игроками','Player trading'],on:['Включён','On'],off:['Выключен','Off'],title:['CATAN · Тихие берега','CATAN · Quiet Shores'],subtitle:['Тихие берега','Quiet Shores'],eyebrow:['ЭПИЧЕСКАЯ · УЮТНАЯ 3D-НАСТОЛКА','EPIC · COZY 3D BOARD GAME'],intro:['Маленький остров, большие планы. Постройте свой берег, обменяйтесь дарами земли и найдите путь к процветанию.','A little island, big plans. Build your shore, trade the gifts of the land and find your way to prosperity.'],tagline:['1–6 участников · боты или друзья · мягкий ритм острова','1–6 participants · bots or friends · a gentle island pace'],lobbyTitle:['Собираемся на берегу','Gather at the shore'],atTable:['ЖИТЕЛИ ОСТРОВА','ISLANDERS'],exchange:['Обмен ресурсами','Resource exchange'],harbor:['Торговый остров','Trading island'],construction:['Строительство','Construction'],newOffer:['Предложение обмена','Trade offer'],backToTrade:['К обмену','Back to exchange'],cards:['Развитие','Development'],roll:['Бросить кубики','Roll dice'],end:['Завершить ход','End turn'],bank:['Обмен {n}:1','Trade {n}:1'],offerTrade:['Предложить обмен','Offer a trade'],chronicle:['История острова','Island journal'],bots:['Свободные места займут боты','Fill empty seats with bots'],goal:['Победные очки','Victory points'],layout:['Распределение чисел','Number layout'],balanced:['Без соседних 6 и 8','No adjacent 6 or 8'],random:['Случайное','Random'],pace:['Ритм ботов','Bot pace'],calm:['Неторопливый','Relaxed'],normal:['Спокойный','Gentle'],quick:['Быстрый','Quick'],need:['Нужно от 2 до 6 участников, включая ботов.','You need 2–6 seats, including bots.'],round:['Круг {n}','Round {n}'],yourTurn:['Ваш ход','Your turn'],theirTurn:['Ход: {n}','Turn: {n}'],setupSettlement:['Выберите место для поселения','Choose a settlement site'],setupRoad:['Проложите первую дорогу','Place the connected road'],road:['Дорога','Road'],settlement:['Поселение','Settlement'],city:['Город','City'],dev:['Карта развития','Development card'],pickRoad:['Нажмите подсвеченную дорогу','Click a highlighted road'],pickSettlement:['Нажмите подсвеченное гнездо','Click a highlighted corner'],pickCity:['Выберите поселение для улучшения','Choose a settlement to upgrade'],robber:['Переместите разбойника','Move the robber'],discard:['Сбросить ресурсы','Discard resources'],steal:['Выбрать соперника','Choose a player'],stealHelp:['Возьмите одну случайную карту у соседа разбойника.','Take one random resource from a neighbor of the robber.'],freeRoads:['Бесплатных дорог: {n}','Free roads remaining: {n}'],noRoad:['Пока нет подходящих мест. Продолжите свою сеть дорог.','No eligible sites yet. Extend your road network.'],costHelp:['Не хватает ресурсов или свободных фигур.','Not enough resources or pieces.'],offer:['Обмен с соседями','Trade with neighbors'],give:['Отдать','Give'],want:['Получить','Receive'],send:['Предложить','Offer'],accept:['Принять','Accept'],cancel:['Отменить','Cancel'],offerFrom:['{n} предлагает:','{n} offers:'],for:['за','for'],notYou:['Обмен не для вас.','This is your own offer.'],devTitle:['Карты развития','Development cards'],newCards:['Новых карт: {n}. Их можно разыграть со следующего хода.','New cards: {n}. Play them starting next turn.'],playCard:['Разыграть','Play'],knight:['Рыцарь','Knight'],roads:['Строительство дорог','Road building'],plenty:['Год изобилия','Year of plenty'],monopoly:['Монополия','Monopoly'],vp:['Победное очко','Victory point'],knightD:['Передвиньте разбойника и возьмите ресурс. Три рыцаря могут дать большую армию.','Move the robber and take a resource. Three knights can earn the largest army.'],roadsD:['Две дороги без затрат ресурсов.','Build two roads without spending resources.'],plentyD:['Возьмите два доступных ресурса из банка.','Take two available resources from the bank.'],monopolyD:['Заберите у соперников все карты выбранного ресурса.','Take all cards of a chosen resource from your opponents.'],vpD:['Скрытое победное очко, учитывается автоматически.','A hidden victory point, counted automatically.'],chooseTwo:['Выберите два ресурса','Choose two resources'],chooseOne:['Выберите ресурс','Choose a resource'],confirm:['Подтвердить','Confirm'],discardCount:['Верните в банк ровно {n} карт.','Return exactly {n} cards to the bank.'],invalid:['Этот ход сейчас недоступен. Проверьте ресурсы и правила.','That action is unavailable. Check your resources and the rules.'],result:['{n} набирает {p} очков и побеждает.','{n} reaches {p} points and wins.'],largest:['Большая армия','Largest army'],longest:['Длинная дорога','Longest road'],bankLeft:['В банке','Bank stock'],bot:['Бот','Bot'],rules:['Это уютная адаптация по мотивам CATAN на 2–4 места. В одиночной игре остальные места занимают боты.\n\nНачало: каждый размещает два поселения и по одной дороге рядом с каждым. Во втором круге порядок обратный; второе поселение приносит стартовые ресурсы с соседних гексов. Между поселениями должно быть хотя бы одно свободное пересечение.\n\nХод: нажмите на островок с кубиками справа, чтобы бросить их. Все поселения рядом с выпавшими числами получают ресурс, города — два. Если нужного ресурса не хватает в банке, в этот бросок его не получает никто. На семёрке игроки с более чем семью картами сбрасывают половину, затем активный игрок двигает разбойника и крадёт случайную карту у одного соседа. Гекс с разбойником не производит ресурсы.\n\nСтроительство: дорога — дерево и кирпич; поселение — дерево, кирпич, шерсть и пшеница; город — две пшеницы и три руды. Новое поселение соединяется с вашей дорогой. Фигуры ограничены: 15 дорог, 5 поселений, 4 города.\n\nТорговля: откройте обмен на торговом островке слева. Банк меняет 4 одинаковых ресурса на 1 другой. Поселение у общего порта даёт 3:1, у специального — 2:1 для его ресурса. Можно предложить обмен другим игрокам; первым принявший завершает сделку.\n\nРазвитие стоит по одной шерсти, пшенице и руде. В колоде рыцари, победные очки, дороги, изобилие и монополия. Новую карту действия можно разыграть только со следующего хода; за ход — одну, после кубиков. Победные очки учитываются сразу и скрыты от соперников.\n\nСамая длинная непрерывная дорога от пяти отрезков и большая армия от трёх рыцарей дают по два очка. При равенстве бонус остаётся у прежнего владельца. Поселение даёт одно очко, город — два. Победит тот, кто в свой ход достигнет выбранной цели.','A cozy adaptation inspired by CATAN for 2–6 seats. Bots occupy the other seats in solo play.\n\nSetup: each player places two settlements and an adjacent road for each. The second round runs in reverse order; the second settlement grants resources from neighboring hexes. Leave at least one empty intersection between settlements.\n\nTurn: click the dice island on the right to roll. All settlements next to the rolled number receive one resource, cities receive two. If the bank cannot supply a resource to everyone, nobody receives that resource this roll. On seven, players holding over seven cards discard half; the active player then moves the robber and steals a random resource from one neighbor. The robber’s hex produces nothing.\n\nBuilding: a road costs wood and brick; a settlement costs wood, brick, wool and wheat; a city costs two wheat and three ore. New settlements must touch your road. Piece limits: 15 roads, 5 settlements and 4 cities.\n\nTrading: click the trading island on the left. Exchange four matching resources for one different resource at the bank. A settlement at a generic harbor grants 3:1; a resource-specific harbor grants 2:1 for that resource. You can offer a trade to other players; the first acceptance completes it.\n\nDevelopment costs one wool, wheat and ore. The deck includes knights, victory points, road building, plenty and monopoly. Newly bought action cards become playable next turn; play at most one per turn, after rolling. Victory points count immediately and stay hidden from opponents.\n\nThe longest continuous road of at least five edges and largest army of at least three knights each grant two points. Ties preserve the existing holder. A settlement grants one point, a city two. Reach the configured target during your own turn to win.']};
const text=(key,v={})=>app.t(key,v),rn=r=>app.tr(resNames[r]),me=s=>s.seats.find(p=>p.l===app.party.me),isMe=s=>C.active?C.active(s).l===app.party.me:s.seats[s.turn].l===app.party.me,canBuild=s=>isMe(s)&&s.stage==='build',costHtml=kind=>Object.entries(C.COST[kind]).map(([r,n])=>icons[r]+(n>1?'×'+n:'')).join(' ');
function report(s){if(!app.party.isHost())return;let seen=sent.get(s.id);if(!seen){seen=new Set();sent.set(s.id,seen);}for(const e of D.progress(s)){const token=e.id+'|'+e.sub;if(!seen.has(token)){seen.add(token);app.party.post('event',{gid:s.id,ev:e.id,sub:e.sub});}}}
function resourceOptions(selected){return C.RES.map(r=>`<option value="${r}" ${r===selected?'selected':''}>${icons[r]} ${rn(r)}</option>`).join('');}
function modal(title,html,type=''){
 dialogType=type;
 $('#dialogTitle').textContent=title;
 const body=$('#dialogBody');
 body.onclick=null;
 body.innerHTML=html;
 $('#info').hidden=false;
}
function close(){$('#info').hidden=true;dialogType='';}
function bagText(bag){return C.RES.filter(r=>bag[r]).map(r=>icons[r]+' '+bag[r]).join(' · ');}
function latestRoll(s){return s.lastRoll||s.log.findLast(entry=>entry.key==='dice');}
function renderTurn(s){
 const mine=isMe(s),owed=s.stage==='discard'&&s.discard?.[app.party.me],stealing=mine&&s.stage==='steal';
 $('#round').textContent=text('round',{n:s.round});
 $('#turnTitle').textContent=mine?text('yourTurn'):text('theirTurn',{n:app.name(s.seats[s.turn].l)});
 $('#endTurn').disabled=!canBuild(s);
 $('#diceIsland').disabled=!(mine&&s.stage==='roll');
 const incoming=Boolean(s.offer&&s.offer.from!==app.party.me);
 const trade=$('#tradeIsland');
 trade.toggleAttribute('data-offer',incoming);
 trade.textContent=text(incoming?'newOffer':'harbor');

 let prompt='';
 if(mine){
  const stages={setupSettlement:'setupSettlement',setupRoad:'setupRoad',robber:'robber'};
  if(stages[s.stage])prompt=text(stages[s.stage]);
  else if(s.stage==='build'&&choice)prompt=text({road:'pickRoad',city:'pickCity',settlement:'pickSettlement'}[choice]);
 }
 $('#promptText').textContent=prompt;
 $('#actionPrompt').hidden=!prompt&&!owed&&!stealing;
 const resolve=$('#resolveAction');
 resolve.hidden=!owed&&!stealing;
 resolve.textContent=text(owed?'discard':'steal');
 const key=owed?s.id+'discard'+owed:stealing?s.id+'steal'+s.version:'';
 if(key&&modalKey!==key){
  if(owed)discardDialog(s);
  else victimDialog(s);
 }
 modalKey=key;
}
const buildPaths={
 road:'M5 21c0-7 14-11 14-18M10 21c0-7 14-11 14-18M8 16l2 1m3-6 2 1m3-6 2 1',
 settlement:'M3 11l9-8 9 8M6 10v10h12V10M10 20v-5h4v5',
 city:'M3 21V10l5-5 5 5v11M13 21V6h7v15M2 21h20M16 9h1m-1 4h1M7 13h1m-1 4h1',
 dev:'M8 3h11v16H8zM5 6H3v16h11v-2m0-13 1 2 2 1-2 1-1 2-1-2-2-1 2-1z'
};
function renderBuild(s,p){
 OrionRoomUI.paint($('#buildBar'),Object.keys(buildPaths).map(kind=>{
  const allowed=canBuild(s)&&p&&(kind==='dev'?s.deckCount>0:C.legal(s,p.l,kind).length>0)
   &&(kind==='road'&&s.freeRoads||C.afford(p,C.COST[kind]));
  const cost=kind==='road'&&s.freeRoads?'✦':costHtml(kind);
  return `<button type="button" data-build="${kind}" class="${choice===kind?'selected':''}" ${allowed?'':'disabled'}>
   <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${buildPaths[kind]}"/></svg>
   <span>${text(kind)}<small class="buildCost">${cost}</small></span>
  </button>`;
 }).join(''));
}
function renderJournal(s){
 OrionRoomUI.paint($('#logs'),s.log.slice(-4).reverse().map(e=>`<span class="logEntry">${app.E(logText(e))}</span>`).join(''));
 const full=$('#journalFull');
 if(!$('#info').hidden&&dialogType==='journal'&&full){
  OrionRoomUI.paint(full,s.log.slice().reverse().map(e=>`<li>${app.E(logText(e))}</li>`).join(''));
 }
}
function openJournal(){
 modal(text('chronicle'),'<ol class="journalFull" id="journalFull"></ol>','journal');
 renderJournal(app.state);
}
function renderResources(s){
 const res=me(s)?.res||C.empty();
 OrionRoomUI.paint($('#hand'),C.RES.map(r=>{
  const gain=income?.give[r]||0,count=res[r]-gain;
  return `<div class="resourceSlot"><div class="resourceCard" style="--rc:${colors[r]}" data-resource="${r}"><span class="resIcon">${icons[r]}</span><div><b>${count}</b><small>${rn(r)}</small></div></div>${income?.visible&&gain?`<span class="resourceGain">+${gain}</span>`:''}</div>`;
 }).join(''));
}
function clearIncome(){
 clearTimeout(incomeTimer);
 income=null;
}
function presentIncome(s,previous,animateRoll){
 const player=me(s);
 if(income&&(s.id!==income.matchId||C.RES.some(r=>player?.res[r]!==income.balance[r])))clearIncome();
 const production=s.production;
 if(!player||!previous||previous.id!==s.id||!production||production.serial===previous.production?.serial)return;
 const give=production.give[player.l];
 if(!give||!C.RES.some(r=>give[r]>0))return;
 clearIncome();
 const event=income={matchId:s.id,give,balance:{...player.res},visible:false};
 function show(){
  if(app.screen!=='sGame'){clearIncome();return;}
  event.visible=true;
  scene.highlightIncome(production.tilesByPlayer?.[player.l]||[]);
  renderResources(latest);
  incomeTimer=setTimeout(()=>{
   clearIncome();
   if(app.screen==='sGame')renderResources(latest);
  },INCOME_LABEL_MS);
 }
 if(animateRoll)incomeTimer=setTimeout(show,DICE_TOSS_MS);
 else show();
}
function render(s,a){
 const previous=latest,roll=latestRoll(s);
 app=a;latest=s;
 const animateRoll=Boolean(previous&&previous.id===s.id&&roll&&roll.serial!==latestRoll(previous)?.serial&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
 if(!scene)scene=createCatanScene($('#islandCanvas'),pick,tile=>{
  const t=latest?.board?.tiles[tile];
  $('#tileHint').textContent=t?rn(t.type)+(t.number?' · '+t.number:''):'';
 },{roll:$('#diceIsland'),trade:$('#tradeIsland')});
 scene.update(s,roll,animateRoll?DICE_TOSS_MS:0);
 presentIncome(s,previous,animateRoll);
 if(app.party.isHost())report(app.party.server);
 const p=me(s),paint=OrionRoomUI.paint,mine=isMe(s);
 renderTurn(s);
 paint($('#seats'),s.seats.map(x=>`<div class="catanSeat${x.l===s.seats[s.turn].l?' current':''}"><span class="seatAvatar" style="--pc:${C.COLORS[x.color]}">${app.E(x.n[0])}</span><div class="seatName"><b>${app.E(x.n)}${x.l===app.party.me?' · '+text('you'):''}</b><small>${x.bot?text('bot')+' · ':''}${x.cards||0} ▧ · ${x.devCount||0} ✦ ${s.longest===x.l?' · 🛤':''}${s.army===x.l?' · 🛡':''}</small></div><span class="seatPoints">${x.score}<small>/${s.settings.target}</small></span></div>`).join(''));
 renderResources(s);
 renderBuild(s,p);
 renderJournal(s);
 if(!$('#info').hidden&&dialogType==='market')updateBank(s);
 let kind='',ids=[];if(mine){if(s.stage==='setupSettlement')kind='settlement';else if(s.stage==='setupRoad')kind='road';else if(s.stage==='robber')kind='robber';else if(s.stage==='build')kind=choice;if(kind)ids=C.legal(s,app.party.me,kind);}scene.select({kind,ids});}
function updateBank(s=app.state){
 const p=me(s),give=$('#bankGive').value,want=$('#bankWant').value;
 if(!p?.res||!give||!want)return;
 const ratio=C.ratio(s,p.l,give),available=canBuild(s);
 $('#bankTrade').textContent=text('bank',{n:ratio})+' · '+icons[give]+' → '+icons[want];
 $('#bankTrade').disabled=!available||give===want||p.res[give]<ratio||s.bank[want]<=0;
 for(const select of [$('#bankGive'),$('#bankWant')])select.disabled=!available;
 $('#playerTrade').disabled=!available||s.settings.trade===false;
 renderOffer(s);
}
function openMarket(){
 const s=app.state;
 if(s?.phase!=='play')return;
 modal(text('exchange'),`<div class="tradeFields">
  <select id="bankGive" aria-label="${text('give')}">${resourceOptions('wood')}</select><span aria-hidden="true">→</span>
  <select id="bankWant" aria-label="${text('want')}">${resourceOptions('brick')}</select>
 </div><div class="tradeActions"><button id="bankTrade" class="primary"></button>
 <button id="playerTrade">${text('offerTrade')}</button></div><div id="offerPanel"></div>`,'market');
 $('#bankGive').onchange=$('#bankWant').onchange=()=>updateBank();
 $('#bankTrade').onclick=()=>app.act({type:'bank',give:$('#bankGive').value,want:$('#bankWant').value});
 $('#playerTrade').onclick=tradeDialog;
 $('#offerPanel').onclick=e=>{
  if(e.target.closest('[data-accept]:not(:disabled)'))app.act({type:'accept'});
  else if(e.target.closest('[data-cancel]'))app.act({type:'cancelOffer'});
 };
 updateBank(s);
}
function pick(kind,index){
 const s=app.state;
 if(s?.phase!=='play')return;
 if(kind==='trade'){openMarket();return;}
 if(!isMe(s))return;
 if(kind==='roll'){
  if(s.stage==='roll')app.act({type:'roll'});
  return;
 }
 if(kind==='robber')app.act({type:'robber',tile:index});
 else{choice='';scene.select({kind:'',ids:[]});app.act({type:'build',kind,index});}
}
function logText(e){const n=e.by?app.name(e.by):'',en=app.lang==='en',roll=e.dice?e.dice.join(' + ')+' = '+(e.dice[0]+e.dice[1]):'';const messages={setup:en?'The first homes on the shore.':'Первые дома на берегу.',turn:en?`${n} · turn begins.`:`${n} · начинается ход.`,dice:en?`${n} rolls ${roll}.`:`${n}: на кубиках ${roll}.`,settlement:en?`${n} builds a settlement.`:`${n} строит поселение.`,city:en?`${n} builds a city.`:`${n} строит город.`,road:en?`${n} lays a road.`:`${n} прокладывает дорогу.`,robber:en?'The robber moves to another hex.':'Разбойник переходит на другой гекс.',steal:en?`${n} takes one resource from ${app.name(e.victim)}.`:`${n} берёт ресурс у ${app.name(e.victim)}.`,discard:en?`${n} returns ${e.count} cards.`:`${n} возвращает ${e.count} карт.`,bank:en?`${n} trades at ${e.ratio}:1.`:`${n}: обмен ${e.ratio}:1.`,trade:en?`${n} and ${app.name(e.with)} complete a trade.`:`${n} и ${app.name(e.with)} обмениваются.`,offer:en?`${n} offers a trade.`:`${n} предлагает обмен.`,dev:en?`${n} buys a development card.`:`${n} получает карту развития.`,card:en?`${n} plays ${text(e.card)}.`:`${n}: ${text(e.card)}.`,win:en?`${n} wins!`:`${n} побеждает!`};return messages[e.key]||e.key;}
function renderOffer(s){const o=s.offer;if(!o){OrionRoomUI.paint($('#offerPanel'),'');return;}const mine=o.from===app.party.me,p=me(s);OrionRoomUI.paint($('#offerPanel'),`<b>${app.E(text('offerFrom',{n:app.name(o.from)}))}</b><div>${bagText(o.give)} ${text('for')} ${bagText(o.want)}</div>${mine?`<button data-cancel>${text('cancel')}</button>`:`<button data-accept ${p?.res&&C.afford(p,o.want)?'':'disabled'}>${text('accept')}</button>`}`);}
function tradeDialog(){const s=app.state;if(!canBuild(s)||s.settings.trade===false)return;modal(text('offer'),`<div class="fieldRow"><select id="offerGive" aria-label="${text('give')}">${resourceOptions('wood')}</select><input id="giveCount" type="number" min="1" max="99" value="1"><span>→</span><select id="offerWant" aria-label="${text('want')}">${resourceOptions('ore')}</select><input id="wantCount" type="number" min="1" max="99" value="1"></div><div class="dialogActions"><button id="backToTrade">${text('backToTrade')}</button><button id="sendOffer" class="primary">${text('send')}</button></div>`);$('#backToTrade').onclick=openMarket;$('#sendOffer').onclick=()=>{const s=app.state,give=$('#offerGive').value,want=$('#offerWant').value,g=+$('#giveCount').value,w=+$('#wantCount').value;if(!canBuild(s)||s.settings.trade===false||give===want||!Number.isInteger(g)||!Number.isInteger(w)||g<1||w<1||!C.afford(me(s),{[give]:g})){app.notice(text('invalid'));return;}app.act({type:'offer',give:{[give]:g},want:{[want]:w}});openMarket();};}
function discardDialog(s){const p=me(s),owed=s.discard?.[app.party.me];if(!owed||!p?.res)return;modal(text('discard'),`<p>${text('discardCount',{n:owed})}</p><div class="resourcePicker">${C.RES.map(r=>`<label class="pickResource"><span>${icons[r]}</span><small>${rn(r)} · ${p.res[r]}</small><input data-drop="${r}" type="number" min="0" max="${p.res[r]}" value="0"></label>`).join('')}</div><div class="dialogActions"><button id="discardConfirm" class="primary">${text('confirm')}</button></div>`);$('#discardConfirm').onclick=()=>{const resources=C.empty();document.querySelectorAll('[data-drop]').forEach(el=>resources[el.dataset.drop]=+el.value);if(C.sum(resources)!==owed||!C.afford(p,resources)){app.notice(text('invalid'));return;}close();app.act({type:'discard',resources});};}
function victimDialog(s){modal(text('steal'),`<p>${text('stealHelp')}</p><div class="dialogActions">${s.victims.map(id=>`<button data-victim="${app.E(id)}">${app.E(app.name(id))}</button>`).join('')}</div>`);$('#dialogBody').onclick=e=>{const b=e.target.closest('[data-victim]');if(b){$('#dialogBody').onclick=null;close();app.act({type:'steal',victim:b.dataset.victim});}};}
function cardChoice(card){const two=card==='plenty';modal(text(two?'chooseTwo':'chooseOne'),`<div class="fieldRow"><select id="cardRes1" aria-label="Resource">${resourceOptions('wood')}</select>${two?`<select id="cardRes2" aria-label="Second resource">${resourceOptions('wheat')}</select>`:''}</div><div class="dialogActions"><button id="cardConfirm" class="primary">${text('confirm')}</button></div>`);$('#cardConfirm').onclick=()=>{const r=$('#cardRes1').value;if(two){const resources={[r]:1},q=$('#cardRes2').value;resources[q]=(resources[q]||0)+1;if(C.RES.some(r=>(resources[r]||0)>app.state.bank[r])){app.notice(text('invalid'));return;}close();app.act({type:'dev',card,resources});}else{close();app.act({type:'dev',card,resource:r});}};}
function cardsDialog(){const s=app.state,p=me(s);if(!p?.dev)return;modal(text('devTitle'),`<p>${text('newCards',{n:Object.values(p.newDev).reduce((a,b)=>a+b,0)})}</p>${['knight','roads','plenty','monopoly','vp'].map(k=>`<div class="devItem"><span>${{knight:'🛡',roads:'🛤',plenty:'🌾',monopoly:'⚖',vp:'✦'}[k]}</span><div><b>${text(k)} · ${p.dev[k]||0}${k==='vp'&&p.newDev.vp?' + '+p.newDev.vp:''}</b><p>${text(k+'D')}</p></div>${k!=='vp'?`<button data-card="${k}" ${canBuild(s)&&!s.usedDev&&p.dev[k]>0?'':'disabled'}>${text('playCard')}</button>`:''}</div>`).join('')}`);$('#dialogBody').onclick=e=>{const b=e.target.closest('[data-card]');if(!b||b.disabled)return;$('#dialogBody').onclick=null;const card=b.dataset.card;if(card==='plenty'||card==='monopoly')cardChoice(card);else{close();app.act({type:'dev',card});}};}
app=createOrionBoardApp({game:'catan',limit:6,core:C,words,canStart:s=>s.players.length+s.settings.bots>=2&&s.players.length+s.settings.bots<=6,startNote:()=>text('need'),settings:(s,a)=>a.select('size',a.t('size'),[19,30,37].map(n=>[n,String(n)+' ⬡']),s.settings.size,!a.party.isHost())+a.select('terrain',a.t('terrain'),['mixed','woodland','farmland'].map(k=>[k,a.t(k)]),s.settings.terrain,!a.party.isHost())+a.select('deserts',a.t('deserts'),[1,2,3].map(n=>[n,String(n)]),s.settings.deserts,!a.party.isHost())+a.select('ports',a.t('ports'),['few','normal','many'].map(k=>[k,a.t(k==='normal'?'standardPorts':k)]),s.settings.ports,!a.party.isHost())+['robber','trade'].map(k=>a.select(k,a.t(k+'Setting'),[[true,a.t('on')],[false,a.t('off')]],s.settings[k],!a.party.isHost())).join('')+a.select('bots',a.t('bots'),Array.from({length:7-s.players.length},(_,i)=>[i,String(i)]),s.settings.bots,!a.party.isHost())+a.select('target',a.t('goal'),[8,10,12].map(n=>[n,String(n)]),s.settings.target,!a.party.isHost())+a.select('balanced',a.t('layout'),[[true,a.t('balanced')],[false,a.t('random')]],s.settings.balanced,!a.party.isHost())+a.select('pace',a.t('pace'),[[450,a.t('quick')],[800,a.t('normal')],[1200,a.t('calm')]],s.settings.pace,!a.party.isHost()),reason:(s,a)=>a.t('result',{n:a.name(s.winner),p:C.score(s,s.winner)}),result:(s,a)=>s.seats.slice().sort((x,y)=>C.score(s,y.l)-C.score(s,x.l)).map(p=>`<div><span>${a.E(p.n)}</span><b>${C.score(s,p.l)}</b></div>`).join(''),groups:s=>[...(s.round>=20?['catan.rounds20']:[]),...(()=>{const scores=s.seats.map(p=>C.score(s,p.l)).sort((a,b)=>b-a);return scores[0]-scores[1]<=1?['catan.close']:[];})()],finished:s=>report(s),render,reset(){choice='';modalKey='';latest=null;clearIncome();close();},bind(a){
 app=a;
 $('#buildBar').onclick=e=>{
  const button=e.target.closest('[data-build]:not(:disabled)');
  if(!button)return;
  const kind=button.dataset.build;
  if(kind==='dev'){a.act({type:'buyDev'});return;}
  choice=choice===kind?'':kind;
  a.refresh();
 };
 $('#diceIsland').onclick=()=>pick('roll');
 $('#tradeIsland').onclick=()=>pick('trade');
 $('#resolveAction').onclick=()=>{
  const s=a.state;
  if(s.stage==='discard')discardDialog(s);
  else if(s.stage==='steal'&&isMe(s))victimDialog(s);
 };
 $('#endTurn').onclick=()=>{choice='';a.act({type:'end'});};
 $('#devCards').onclick=cardsDialog;
 $('#openJournal').onclick=openJournal;
 $('#infoButton').addEventListener('click',()=>{modal(a.t('title'),'<p style="white-space:pre-line">'+a.E(a.t('rules'))+'</p>');});
}});
})();
