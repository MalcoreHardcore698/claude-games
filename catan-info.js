/* Game guide content for the shared info dialog (orion-info.js). */
window.OrionInfoSpec=lang=>{const L=(ru,en)=>lang==='en'?en:ru;return{
 kicker:L('Правила · стратегия на острове','Rules · island strategy'),
 title:L('CATAN · Тихие берега','CATAN · Quiet Shores'),
 lead:L('Уютная адаптация по мотивам CATAN. Собирайте ресурсы, стройте дороги и города, торгуйте и первыми наберите нужное число очков.','A cozy adaptation inspired by CATAN. Gather resources, build roads and cities, trade, and be first to the target score.'),
 facts:[{v:'2–6',l:L('мест','seats')},{v:L('боты','bots'),l:L('в одиночной игре','in solo play')},{v:'10',l:L('очков по умолчанию','points by default')}],
 tabs:[
  {id:'start',icon:'🏝️',label:L('Начало','Setup'),blocks:[
   {lead:L('Партия начинается с расстановки: у каждого два поселения и по дороге рядом с каждым.','The game opens with placement: everyone gets two settlements and a road next to each.')},
   {steps:[
    {t:L('Первый круг','First round'),d:L('По очереди ставьте поселение на свободное пересечение и дорогу рядом с ним.','In turn, place a settlement on a free intersection and a road beside it.')},
    {t:L('Второй круг — в обратном порядке','Second round — reverse order'),d:L('Последний игрок ходит первым. Второе поселение сразу приносит ресурсы с соседних гексов.','The last player goes first. The second settlement immediately pays resources from neighboring hexes.')},
    {t:L('Правило расстояния','Distance rule'),d:L('Между любыми поселениями должно оставаться хотя бы одно свободное пересечение.','At least one empty intersection must separate any two settlements.')}]},
   {note:L('В одиночной игре свободные места занимают боты. Их число и темп настраиваются перед партией.','In solo play bots take the empty seats. Their number and pace are set before the game.'),tone:'info'}]},
  {id:'turn',icon:'🎲',label:L('Ход','Turn'),blocks:[
   {steps:[
    {t:L('Бросьте два кубика','Roll two dice'),d:L('Каждое поселение рядом с выпавшим числом получает 1 ресурс, город — 2.','Every settlement next to the rolled number receives 1 resource, every city 2.')},
    {t:L('Стройте и торгуйте','Build and trade'),d:L('В любом порядке: строительство, обмен с банком или игроками, карты развития.','In any order: build, trade with the bank or players, play development cards.')},
    {t:L('Завершите ход','End the turn'),d:L('Кнопка «Завершить ход» передаёт кубики следующему.','The End turn button passes the dice on.')}]},
   {acc:[
    {icon:'7️⃣',t:L('Выпала семёрка','A seven is rolled'),blocks:[{list:[L('Игроки, у которых **больше 7 карт**, сбрасывают половину.','Players holding **more than 7 cards** discard half.'),L('Активный игрок переставляет разбойника и крадёт случайную карту у одного из соседей этого гекса.','The active player moves the robber and steals a random card from one neighbor of that hex.')]}]},
    {icon:'🥷',t:L('Разбойник','The robber'),d:L('Гекс с разбойником не производит ресурсы, пока разбойник там стоит. Разбойника можно отключить в настройках стола.','The robber’s hex produces nothing while he stands there. The robber can be turned off in table settings.')},
    {icon:'🏦',t:L('Пустой банк','Empty bank'),d:L('Если банк не может выдать ресурс всем, кому он положен, в этот бросок его не получает никто.','If the bank cannot pay a resource to everyone owed it, nobody receives that resource this roll.')}]}]},
  {id:'build',icon:'🏠',label:L('Строительство','Building'),blocks:[
   {cards:[
    {icon:'🛤️',t:L('Дорога','Road'),meta:'🌲 🧱',d:L('Дерево и кирпич. Продолжает вашу сеть.','Wood and brick. Extends your network.')},
    {icon:'🏠',t:L('Поселение','Settlement'),meta:'🌲 🧱 🐑 🌾',d:L('Ставится у вашей дороги. **1 очко**.','Must touch your road. **1 point**.')},
    {icon:'🏰',t:L('Город','City'),meta:'🌾×2 ⛰️×3',d:L('Улучшает поселение. Даёт двойной урожай. **2 очка**.','Upgrades a settlement. Double yield. **2 points**.')},
    {icon:'🃏',t:L('Карта развития','Development card'),meta:'🐑 🌾 ⛰️',d:L('Рыцарь, очко, дороги, изобилие или монополия.','Knight, point, roads, plenty or monopoly.')}]},
   {table:{head:[L('Фигура','Piece'),L('Лимит','Limit')],rows:[[L('Дороги','Roads'),'15'],[L('Поселения','Settlements'),'5'],[L('Города','Cities'),'4']]}}]},
  {id:'trade',icon:'⚖️',label:L('Торговля','Trading'),blocks:[
   {cards:[
    {icon:'🏦',t:L('Банк 4:1','Bank 4:1'),d:L('Четыре одинаковых ресурса на один любой другой.','Four matching resources for any one other.')},
    {icon:'⚓',t:L('Общий порт 3:1','Generic harbor 3:1'),d:L('Нужно поселение или город у порта.','Requires a settlement or city at the harbor.')},
    {icon:'🚢',t:L('Особый порт 2:1','Special harbor 2:1'),d:L('Выгодный курс для ресурса этого порта.','A better rate for that harbor’s resource.')}]},
   {note:L('Можно предложить обмен другим игрокам: сделку завершает первый, кто её примет.','You can offer a trade to other players: the first to accept completes it.'),tone:'tip'}]},
  {id:'dev',icon:'🃏',label:L('Развитие','Development'),blocks:[
   {p:L('Карта стоит по одной шерсти, пшенице и руде. Купленную карту действия можно сыграть **только со следующего хода**, не больше одной за ход и после броска кубиков.','A card costs one wool, wheat and ore. A bought action card is playable **from your next turn**, at most one per turn, after rolling.')},
   {acc:[
    {icon:'🛡️',t:L('Рыцарь','Knight'),d:L('Передвиньте разбойника и возьмите ресурс. Три рыцаря могут дать большую армию.','Move the robber and take a resource. Three knights can earn the largest army.')},
    {icon:'⭐',t:L('Победное очко','Victory point'),d:L('Скрытое победное очко, учитывается автоматически.','A hidden victory point, counted automatically.')},
    {icon:'🛤️',t:L('Строительство дорог','Road building'),d:L('Две дороги без затрат ресурсов.','Build two roads without spending resources.')},
    {icon:'🌾',t:L('Год изобилия','Year of plenty'),d:L('Возьмите два доступных ресурса из банка.','Take two available resources from the bank.')},
    {icon:'⚖️',t:L('Монополия','Monopoly'),d:L('Заберите у соперников все карты выбранного ресурса.','Take all cards of a chosen resource from your opponents.')}]}]},
  {id:'win',icon:'🏆',label:L('Победа','Winning'),blocks:[
   {table:{head:[L('Источник','Source'),L('Очки','Points')],rows:[[L('Поселение','Settlement'),'1'],[L('Город','City'),'2'],[L('Самая длинная дорога (от 5 отрезков)','Longest road (5+ edges)'),'2'],[L('Большая армия (от 3 рыцарей)','Largest army (3+ knights)'),'2'],[L('Карта победного очка','Victory point card'),'1']]}},
   {note:L('При равенстве бонус остаётся у прежнего владельца. Побеждает тот, кто достиг цели **в свой ход**.','Ties keep the bonus with its current holder. You win by reaching the target **on your own turn**.'),tone:'tip'}]},
  {id:'controls',icon:'🖱️',label:L('Управление','Controls'),blocks:[
   {keys:[{k:[L('Перетаскивание','Drag')],d:L('повернуть остров','rotate the island')},{k:[L('Колесо','Wheel')],d:L('приблизить или отдалить','zoom in or out')},{k:['↶','↷'],d:L('повернуть на шаг','rotate one step')},{k:['⌂'],d:L('вернуть камеру','reset the camera')}]},
   {p:L('Подсвеченные кружки и отрезки — доступные места. Наведите курсор на гекс, чтобы увидеть его ресурс и число.','Highlighted circles and edges are legal spots. Hover a hex to see its resource and number.')}]}
 ]};};
