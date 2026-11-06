/* Game guide content for the shared info dialog (orion-info.js). */
window.OrionInfoSpec=lang=>{const L=(ru,en)=>lang==='en'?en:ru;return{
 kicker:L('Правила · командная игра в слова','Rules · team word game'),
 title:L('Шифр','Cipher'),
 lead:L('Капитан видит, где свои агенты, и даёт подсказку из одного слова. Команда угадывает карточки по этой подсказке.','The captain sees where their agents are and gives a one-word clue. The team guesses cards from it.'),
 facts:[{v:'25',l:L('слов','words')},{v:'1–8',l:L('игроков','players')},{v:L('ИИ','AI'),l:L('капитаны','captains')}],
 tabs:[
  {id:'board',icon:'🗂️',label:L('Поле','Board'),blocks:[
   {cards:[{icon:'🟥',t:'9',d:L('красных агентов','red agents')},{icon:'🟦',t:'8',d:L('синих агентов','blue agents')},{icon:'⬜',t:'7',d:L('мирных жителей','bystanders')},{icon:'⬛',t:'1',d:L('чёрная карточка','black card')}],compact:true},
   {p:L('Красные начинают. Побеждает команда, которая первой найдёт всех своих агентов.','Red starts. The first team to find all its agents wins.')}]},
  {id:'turn',icon:'🔎',label:L('Ход','Turn'),blocks:[
   {steps:[{t:L('Подсказка капитана','Captain’s clue'),d:L('Одно слово и число. Слово с поля подсказкой быть не может.','One word and a number. A word from the board cannot be a clue.')},{t:L('Догадки агентов','Agents guess'),d:L('Можно открыть столько карточек, сколько в подсказке, и ещё одну сверху.','Open as many cards as the number, plus one extra.')},{t:L('Конец хода','End of turn'),d:L('Ход можно закончить раньше. Чужой агент или мирный житель тоже заканчивают ход.','You may stop early. An enemy agent or a bystander also ends the turn.')}]},
   {note:L('Чёрная карточка — **мгновенное поражение**.','The black card means **instant defeat**.'),tone:'warn'}]},
  {id:'modes',icon:'👥',label:L('Режимы','Modes'),blocks:[
   {acc:[{icon:'🤖',t:L('Против ИИ','Versus AI'),d:L('Все люди — агенты красных, капитаны обеих команд виртуальные.','All humans guess for red; both captains are virtual.'),open:true},{icon:'🛡️',t:L('Команды','Teams'),d:L('Капитан — первый игрок стороны, если на ней хотя бы два человека.','The first player captains a side that has two or more people.')},{icon:'⚔️',t:L('Дуэль','Duel'),d:L('У каждого игрока свой ИИ-капитан.','Each player has an AI captain.')}]}]}
 ]};};
