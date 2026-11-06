/* Verified by the game host; each milestone is emitted once per game and player. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrionMilestones=api;})(typeof window==='object'?window:globalThis,()=>{
'use strict';
const events=[
 ['tetris.lines10','group',1.6,'Команда соберёт 10 линий','The team clears 10 lines'],
 ['tetris.lines40','group',3.8,'Команда соберёт 40 линий','The team clears 40 lines'],
 ['tetris.score5000','group',3,'Команда наберёт 5000 очков','The team scores 5,000 points'],
 ['tetris.four','yes',4,'{n} уберёт четыре линии одной фигурой','{n} clears four lines with one piece'],
 ['tetris.builder','yes',2.5,'{n} поставит 25 фигур за забег','{n} places 25 pieces in one run'],
 ['codewords.triple','yes',3,'Команда {n} откроет три своих слова за ход','{n}’s team reveals three own words in one turn'],
 ['codewords.flawless','yes',4,'Команда {n} победит без ошибочных открытий','{n}’s team wins without a wrong reveal'],
 ['codewords.black','yes',3,'{n} откроет чёрную карту','{n} reveals the black card'],
 ['codewords.long','group',2.6,'В «Шифре» начнётся десятый ход','Cipher reaches turn ten'],
 ['chess.castle','yes',1.8,'{n} сделает рокировку','{n} castles'],
 ['chess.promotion','yes',3.8,'{n} превратит пешку','{n} promotes a pawn'],
 ['chess.quick_mate','yes',3.2,'{n} поставит мат не позже 20-го хода','{n} delivers checkmate by move 20'],
 ['chess.long','group',2.4,'Шахматная партия достигнет 40-го полного хода','The chess game reaches 40 full moves'],
 ['battleship.first_sunk','yes',1.5,'{n} потопит хотя бы один корабль','{n} sinks at least one ship'],
 ['battleship.hit3','yes',2.2,'{n} попадёт три раза подряд','{n} lands three hits in a row'],
 ['battleship.quick_win','yes',3,'{n} победит не более чем за 40 своих выстрелов','{n} wins in at most 40 shots'],
 ['battleship.long','group',2.8,'Игроки сделают не меньше 80 выстрелов','The players fire at least 80 shots'],
 ['carcassonne.city','yes',1.7,'{n} получит очки за завершённый город','{n} scores a completed city'],
 ['carcassonne.roads3','yes',2.6,'{n} получит очки за три завершённые дороги','{n} scores three completed roads'],
 ['carcassonne.score50','yes',1.8,'{n} наберёт 50 очков','{n} scores 50 points'],
 ['carcassonne.feature12','yes',3,'{n} получит 12 очков за один объект','{n} scores 12 points for one feature'],
 ['carcassonne.score150','group',3.5,'Кто-нибудь наберёт 150 очков','Someone scores 150 points']
].map(([id,kind,base,ru,en])=>({id,g:id.split('.')[0],kind,base,t:[ru,en]}));
const rows=[
 ['t_lines10','tetris.lines10','common','fa-layer-group','Разминка','Warm-up','Соберите командой 10 линий за один забег.','Clear 10 team lines in one run.'],
 ['t_lines40','tetris.lines40','epic','fa-tower-broadcast','Орбитальная станция','Orbital station','Соберите командой 40 линий за один забег.','Clear 40 team lines in one run.'],
 ['t_four','tetris.four','rare','fa-bars','Четверной удар','Four at once','Уберите четыре линии одной своей фигурой.','Clear four lines with one of your pieces.'],
 ['t_builder','tetris.builder75','rare','fa-cubes-stacked','Строитель орбиты','Orbit builder','Поставьте 75 своих фигур за один забег.','Place 75 of your own pieces in one run.'],
 ['t_together','tetris.coop','common','fa-user-group','Без границ','No borders','Начните общий тетрис минимум вдвоём.','Start Orbit Blocks with at least two players.'],
 ['cw_triple','codewords.triple','rare','fa-link','Тройная связь','Triple connection','Откройте командой три своих слова за один ход.','Reveal three own words in one team turn.'],
 ['cw_flawless','codewords.flawless','epic','fa-fingerprint','Чистая работа','Clean operation','Победите командой без ошибочных открытий.','Win without your team making a wrong reveal.'],
 ['cw_captain','codewords.captain_win','rare','fa-user-secret','Мастер подсказок','Clue master','Победите в роли капитана команды.','Win as a team captain.'],
 ['cw_duel','codewords.duel_win','rare','fa-chess','Дуэль умов','Battle of minds','Победите в режиме 1 на 1.','Win a one-on-one game.'],
 ['cw_black','codewords.black','common','fa-skull','Роковое слово','Fatal word','Откройте чёрную карту.','Reveal the black card.'],
 ['chess_castle','chess.castle','common','fa-chess-rook','За крепостной стеной','Behind the walls','Сделайте рокировку.','Castle your king.'],
 ['chess_promote','chess.promotion','rare','fa-chess-queen','Новая королева','New queen','Превратите пешку в другую фигуру.','Promote a pawn.'],
 ['chess_queen','chess.queen_capture','common','fa-chess-pawn','Королевская охота','Royal hunt','Возьмите ферзя соперника.','Capture the enemy queen.'],
 ['chess_quick','chess.quick_mate','rare','fa-bolt','Блицкриг','Blitzkrieg','Поставьте мат не позже 20-го полного хода.','Deliver checkmate by full move 20.'],
 ['chess_hard','chess.hard_ai','epic','fa-microchip','Гроссмейстер машины','Machine master','Обыграйте ИИ третьего уровня.','Beat the level-three AI.'],
 ['sea_sunk','battleship.first_sunk','common','fa-anchor','На дно','To the depths','Потопите корабль соперника.','Sink an enemy ship.'],
 ['sea_streak','battleship.hit3','rare','fa-crosshairs','Точный прицел','Deadeye','Попадите три раза подряд за одну партию.','Land three consecutive hits in a game.'],
 ['sea_quick','battleship.quick_win','rare','fa-stopwatch','Молниеносный флот','Lightning fleet','Победите не более чем за 40 своих выстрелов.','Win using at most 40 of your own shots.'],
 ['sea_hard','battleship.hard_ai','epic','fa-robot','Охотница за субмаринами','Submarine hunter','Обыграйте ИИ третьего уровня.','Beat the level-three AI.'],
 ['sea_clean','battleship.clean_win','legendary','fa-shield-halved','Непотопляемый','Unsinkable','Победите, не потеряв ни одного своего корабля.','Win without losing any of your ships.'],
 ['land_city','carcassonne.city','common','fa-chess-rook','Городские стены','City walls','Получите очки за завершённый город.','Score a completed city.'],
 ['land_roads','carcassonne.roads3','rare','fa-road','Все дороги ведут…','All roads lead…','Получите очки за три завершённые дороги в партии.','Score three completed roads in a game.'],
 ['land_abbeys','carcassonne.monasteries2','rare','fa-landmark','Тихая обитель','Quiet sanctuary','Получите очки за два завершённых монастыря в партии.','Score two completed monasteries in a game.'],
 ['land_farms','carcassonne.farm12','epic','fa-wheat-awn','Щедрый урожай','Rich harvest','Получите 12 очков с полей за одну партию.','Score 12 points from fields in a game.'],
 ['land_feature','carcassonne.feature12','rare','fa-building-columns','Большой проект','Grand project','Получите минимум 12 очков за один объект.','Score at least 12 points for one feature.'],
 ['land_eight','carcassonne.eight_win','legendary','fa-crown','Восемь претендентов','Eight contenders','Победите за столом на восемь участников, включая ботов.','Win at an eight-seat table, including bots.']
];
const achievementEvents=Object.fromEntries(rows.map(r=>[r[1],r[0]]));
const achievements=rows.map(([id,event,r,i,ru,en,dru,den])=>({id,g:event.split('.')[0],r,i,t:[ru,en],d:[dru,den]}));
const runs=new Map();
function reset(){runs.clear();}
function observe(game,s){if(!s?.id)return null;const key=game+':'+s.id;if(s.phase==='lobby'){runs.delete(key);return{id:s.id,events:[],groups:[]};}let run=runs.get(key);if(!run){run={seen:new Set(),groups:new Set()};runs.set(key,run);if(runs.size>32)runs.delete(runs.keys().next().value);}const out=[],humans=(s.players||[]).filter(p=>!p.l.startsWith('@')),humanIds=new Set(humans.map(p=>p.l));
 const emit=(id,sub,x={})=>{if(!humanIds.has(sub))return;const token=id+'|'+sub;if(!run.seen.has(token)){run.seen.add(token);out.push({id,sub,x});}};
 const group=id=>{run.groups.add(id);for(const p of humans)emit(id,p.l);};
 if(game==='tetris'){
  for(const n of [10,40])if(s.lines>=n)group('tetris.lines'+n);if(s.score>=5000)group('tetris.score5000');
  if(s.lastClear?.n>=4)emit('tetris.four',s.lastClear.by);
  for(const p of humans){if((s.drops?.[p.l]||0)>=25)emit('tetris.builder',p.l);if((s.drops?.[p.l]||0)>=75)emit('tetris.builder75',p.l);if(humans.length>=2)emit('tetris.coop',p.l);}
 }else if(game==='codewords'){
  if(s.round>=10)group('codewords.long');if(s.blackBy)emit('codewords.black',s.blackBy);
  for(const p of humans){if(s.bestTurn?.[p.team]>=3)emit('codewords.triple',p.l);if(s.phase!=='over'||p.team!==s.winner||s.reason==='left')continue;
   const team=humans.filter(x=>x.team===p.team),stats=team.map(x=>s.stats?.[x.l]||{hits:0,wrong:0});
   if(stats.reduce((n,x)=>n+x.hits,0)>0&&stats.every(x=>x.wrong===0))emit('codewords.flawless',p.l);
   if(s.mode!=='coop'&&team.length>=2&&team[0].l===p.l)emit('codewords.captain_win',p.l);
   if(s.mode==='duel')emit('codewords.duel_win',p.l);
  }
 }else if(game==='chess'){
  const move=s.lastMove;if(move){const id=s.seats?.[move.color];if(/^O-O/.test(move.san))emit('chess.castle',id);if(move.san.includes('='))emit('chess.promotion',id);if(move.captured==='q')emit('chess.queen_capture',id);}
  if(s.history?.length>=80)group('chess.long');
  if(s.phase==='over'&&s.reason==='checkmate'&&s.history?.length<=40)emit('chess.quick_mate',s.winner);
  if(s.phase==='over'&&s.solo&&s.settings.level===3)emit('chess.hard_ai',s.winner);
 }else if(game==='battleship'){
  if(s.moves>=80)group('battleship.long');
  for(const p of humans){const st=s.stats?.[p.l];if(!st)continue;if(st.sunk>=1)emit('battleship.first_sunk',p.l);if(st.maxStreak>=3)emit('battleship.hit3',p.l);
   if(s.phase!=='over'||s.winner!==p.l||s.reason!=='fleet')continue;if(st.shots<=40)emit('battleship.quick_win',p.l);if(s.solo&&s.settings.level===3)emit('battleship.hard_ai',p.l);if(s.boards[p.l].ships.every(ship=>!ship.sunk))emit('battleship.clean_win',p.l);
  }
 }else if(game==='carcassonne'){
  if(s.seats?.some(p=>p.score>=150))group('carcassonne.score150');
  for(const p of s.seats||[]){if(p.completed?.city>=1)emit('carcassonne.city',p.l);if(p.completed?.road>=3)emit('carcassonne.roads3',p.l);if(p.completed?.monastery>=2)emit('carcassonne.monasteries2',p.l);if(p.score>=50)emit('carcassonne.score50',p.l);if(p.bestFeature>=12)emit('carcassonne.feature12',p.l);if(p.farmPoints>=12)emit('carcassonne.farm12',p.l);if(s.phase==='over'&&s.seats.length===8&&s.winners?.includes(p.l))emit('carcassonne.eight_win',p.l);}
 }
 return{id:s.id,events:out,groups:[...run.groups]};
}
return{events,achievements,achievementEvents,observe,reset};
});
