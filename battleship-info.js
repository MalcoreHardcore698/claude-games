/* Game guide content for the shared info dialog (orion-info.js). */
window.OrionInfoSpec=lang=>{const L=(ru,en)=>lang==='en'?en:ru;return{
 kicker:L('Правила · морская дуэль','Rules · naval duel'),
 title:L('Морской бой','Battleship'),
 lead:L('Расставьте флот и потопите корабли соперника раньше, чем он найдёт ваши.','Deploy your fleet and sink the enemy’s ships before they find yours.'),
 facts:[{v:'2',l:L('игрока','players')},{v:L('ИИ','AI'),l:L('уровни сложности','difficulty levels')}],
 tabs:[
  {id:'setup',icon:'⚓',label:L('Расстановка','Deployment'),blocks:[
   {p:L('Перед боем выберите размер моря, состав флота, сложность ИИ и правила попаданий.','Before the battle choose sea size, fleet, AI level and hit rules.')},
   {steps:[{t:L('Поставьте корабли','Place ships'),d:L('Нажатие на своё море ставит следующий корабль. Или расставьте флот случайно.','Click your sea to place the next ship, or randomize the fleet.')},{t:L('Поверните при необходимости','Rotate if needed'),d:L('Клавиша `R` меняет направление.','`R` changes direction.')},{t:L('Нажмите «Готово»','Press Ready'),d:L('Кнопка «Готово» завершает расстановку.','The Ready button finishes deployment.')}]},
   {note:L('По умолчанию корабли не могут касаться друг друга даже углами.','By default ships cannot touch, even diagonally.'),tone:'info'}]},
  {id:'battle',icon:'💥',label:L('Бой','Battle'),blocks:[
   {p:L('Стреляйте по клеткам моря соперника. При стандартных настройках попадание сохраняет ход.','Fire at cells in the enemy sea. With default settings a hit keeps your turn.')},
   {cards:[{icon:'·',t:L('Точка','Dot'),d:L('Мимо.','A miss.')},{icon:'✹',t:L('Оранжевая отметка','Orange mark'),d:L('Попадание.','A hit.')},{icon:'✕',t:L('Красный крест','Red cross'),d:L('Корабль потоплен.','Ship sunk.')}],compact:true},
   {note:L('Побеждает тот, кто первым потопит весь флот соперника.','The first to sink the entire enemy fleet wins.'),tone:'tip'}]}
 ]};};
