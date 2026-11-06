/* Game guide content for the shared info dialog (orion-info.js). */
window.OrionInfoSpec=lang=>{const L=(ru,en)=>lang==='en'?en:ru;return{
 kicker:L('Правила · тайлы и миплы','Rules · tiles and meeples'),
 title:L('Каркассон','Carcassonne'),
 lead:L('Выкладывайте ландшафт плитка за плиткой, занимайте города, дороги, монастыри и поля — и получайте за них очки.','Build the landscape tile by tile, claim cities, roads, monasteries and fields, and score them.'),
 facts:[{v:'1–8',l:L('участников','players')},{v:L('ИИ','AI'),l:L('соперники-компьютеры','computer rivals')}],
 tabs:[
  {id:'turn',icon:'🧩',label:L('Ход','Turn'),blocks:[
   {steps:[
    {t:L('Возьмите плитку','Draw a tile'),d:L('Нажмите стопку в левом нижнем углу. Плитка следует за курсором, и все видят ваш предварительный выбор.','Click the bottom-left stack. The tile follows your cursor and everyone sees your preview.')},
    {t:L('Поверните и положите','Rotate and place'),d:L('Поворот — кнопками или `R`. Города, дороги, поля и реки на краях должны совпадать с соседями.','Rotate with the buttons or `R`. City, road, field and river edges must match the neighbors.')},
    {t:L('Поставьте мипла (по желанию)','Place a meeple (optional)'),d:L('Только на объект новой плитки и только если на всём связанном объекте ещё нет миплов.','Only on a feature of the new tile, and only if the whole connected feature has no meeples yet.')}]},
   {note:L('Если плитку нельзя положить никуда, она пропускается.','A tile that fits nowhere is discarded.'),tone:'info'}]},
  {id:'score',icon:'⭐',label:L('Очки','Scoring'),blocks:[
   {h:L('Во время игры','During the game')},
   {table:{head:[L('Объект','Feature'),L('Завершён','Completed')],rows:[[L('🛤️ Дорога','🛤️ Road'),L('1 за плитку','1 per tile')],[L('🏰 Город','🏰 City'),L('2 за плитку и за герб','2 per tile and shield')],[L('⛪ Монастырь','⛪ Monastery'),L('9 вместе с 8 соседями','9 with all 8 neighbors')]]}},
   {p:L('Миплы с завершённых объектов возвращаются владельцам.','Meeples on completed features return to their owners.')},
   {h:L('В конце партии','At game end')},
   {list:[L('Незавершённые города и дороги — **1 очко** за плитку, гербы — по 1.','Unfinished cities and roads score **1** per tile, shields 1 each.'),L('Монастырь — очки за себя и за занятых соседей.','A monastery scores itself and its occupied neighbors.'),L('Поле — **3 очка** за каждый соседний завершённый город.','A field scores **3** for each adjacent completed city.')]}]},
  {id:'meeples',icon:'🧍',label:L('Миплы','Meeples'),blocks:[
   {acc:[
    {icon:'🤝',t:L('Слияние объектов','Merging features'),d:L('Объекты с миплами могут позже соединиться. Очки получает большинство, а при равенстве каждый из лидеров получает их полностью.','Occupied features may merge later. The majority scores; tied leaders each receive full points.'),open:true},
    {icon:'🌾',t:L('Фермеры','Farmers'),d:L('Мипл на поле остаётся там до конца партии. Очки за поле тоже распределяются по большинству.','A meeple in a field stays until the end. Field points also go by majority.')},
    {icon:'🌊',t:L('Реки','Rivers'),d:L('Реки разделяют поля, но сами очков не дают.','Rivers divide fields but do not score.')}]}]},
  {id:'controls',icon:'🖱️',label:L('Управление','Controls'),blocks:[
   {keys:[{k:['R'],d:L('повернуть плитку','rotate the tile')},{k:[L('Перетаскивание','Drag')],d:L('двигать карту','pan the map')},{k:[L('Колесо','Wheel')],d:L('масштаб','zoom')},{k:[L('Вся карта','Fit map')],d:L('вернуть общий вид','restore the overview')}]},
   {note:L('Число плиток задаёт длину партии, а настройки состава — частоту разных ландшафтов.','Tile count sets the game length; mix settings adjust how often each landscape appears.'),tone:'tip'}]}
 ]};};
