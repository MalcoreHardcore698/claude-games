/* Game guide content for the shared info dialog (orion-info.js). */
window.OrionInfoSpec=lang=>{const L=(ru,en)=>lang==='en'?en:ru;return{
 kicker:L('Правила · выживание отрядом','Rules · squad survival'),
 title:L('Последний паёк','Last Ration'),
 lead:L('Обеспечивайте коммуну едой как можно дольше: днём — вылазки в город, вечером — расчёт квоты.','Keep the commune fed for as long as possible: raid the city by day, settle the quota by night.'),
 facts:[{v:'1–8',l:L('игроков','players')},{v:'4 + 2×'+L('день','day'),l:L('еды на человека','food per player')}],
 tabs:[
  {id:'goal',icon:'🥫',label:L('Цель','Goal'),blocks:[
   {lead:L('Дневная квота — **(4 + день × 2)** еды на каждого участника.','The daily quota is **(4 + day × 2)** food per player.')},
   {steps:[{t:L('Вылазка','Raid'),d:L('Соберите еду и ценности в городе.','Collect food and valuables in the city.')},{t:L('Эвакуация','Extraction'),d:L('Еда сдаётся автоматически, излишки переходят на следующий день.','Food is deposited automatically; surplus carries forward.')},{t:L('Расчёт','Settlement'),d:L('Когда все вернулись или погибли, квота списывается.','Once everyone returns or dies, the quota is consumed.')}]},
   {note:L('Если еды не хватает, коммуну выгоняют за ворота — партия окончена.','If food runs short, the commune is exiled and the game ends.'),tone:'warn'}]},
  {id:'camp',icon:'🏕️',label:L('Лагерь и лут','Camp & loot'),blocks:[
   {p:L('В лагере каждый тратит свои деньги на патроны, аптечки, броню, оружие и рюкзак. Вылазку начинает хост.','At camp everyone spends their own credits on ammo, medkits, armor, weapons and a backpack. The host starts the raid.')},
   {cards:[{icon:'🟩',t:L('Зелёный ящик','Green crate'),d:L('Еда. Занимает 1 ячейку.','Food. Takes 1 slot.')},{icon:'🟨',t:L('Золотой ящик','Gold crate'),d:L('Ценности: 5 монет после эвакуации. 1 ячейка.','Valuables: 5 credits on extraction. 1 slot.')},{icon:'⬜',t:L('Серый ящик','Gray crate'),d:L('Патроны.','Ammo.')},{icon:'➕',t:L('Белый с крестом','White cross'),d:L('Аптечка.','Medkit.')}]},
   {p:L('Ящики подбираются, когда вы подходите близко. Уничтоженный зомби приносит 1 монету.','Crates are picked up when you walk close. Each zombie kill pays 1 credit.')}]},
  {id:'extract',icon:'🚪',label:L('Эвакуация','Extraction'),blocks:[
   {steps:[{t:L('Вернитесь к воротам','Return to the gate'),d:L('Ориентируйтесь по указателю УБЕЖИЩЕ.','Follow the SHELTER indicator.')},{t:L('Начните эвакуацию','Start extracting'),d:L('Нажмите `E` или кнопку эвакуации.','Press `E` or the Extract button.')},{t:L('Продержитесь 3 секунды','Hold for 3 seconds'),d:L('Уход из зоны отменяет эвакуацию.','Leaving the zone cancels it.')}]},
   {acc:[{icon:'⏳',t:L('Время вышло','Time is up'),d:L('Все, кто остался в городе, погибают.','Anyone still in the city dies.')},{icon:'💀',t:L('Смерть','Death'),d:L('Еда и ценности остаются на земле для товарищей. Если квота выполнена, погибшие возвращаются на следующий день.','Food and valuables stay on the ground for teammates. If the quota is met, the dead return next day.')},{icon:'📈',t:L('Рост сложности','Rising difficulty'),d:L('С каждым днём растут потребности коммуны и число зомби. Огонь по своим отключён.','Each day raises the food demand and the zombie count. Friendly fire is off.')}]}]},
  {id:'keys',icon:'⌨️',label:L('Управление','Controls'),blocks:[
   {keys:[{k:['WASD'],d:L('движение','move')},{k:[L('Мышь','Mouse')],d:L('обзор после клика по игре','look after clicking the game')},{k:['←','→'],d:L('поворот','turn')},{k:[L('ЛКМ','LMB'),L('Пробел','Space')],d:L('огонь','fire')},{k:['F'],d:L('лечение','heal')},{k:['E'],d:L('эвакуация','extract')},{k:['Esc'],d:L('освободить курсор','release the mouse')}]},
   {note:L('Если захват мыши недоступен, поворачивайте обзор, удерживая левую кнопку.','If pointer lock is unavailable, hold the left button to turn.'),tone:'info'}]}
 ]};};
