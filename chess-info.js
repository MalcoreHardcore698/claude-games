/* Game guide content for the shared info dialog (orion-info.js). */
window.OrionInfoSpec=lang=>{const L=(ru,en)=>lang==='en'?en:ru;return{
 kicker:L('Правила · классика','Rules · classic'),
 title:L('Шахматы','Chess'),
 lead:L('Полные правила шахмат: против друга из лобби или против компьютера трёх уровней.','Full chess rules: play a friend from the lobby or a computer at three levels.'),
 facts:[{v:'2',l:L('игрока','players')},{v:'3',l:L('уровня ИИ','AI levels')},{v:'⏱',l:L('часы с добавлением','clock with increment')}],
 tabs:[
  {id:'move',icon:'♟️',label:L('Как ходить','Moving'),blocks:[
   {steps:[{t:L('Нажмите свою фигуру','Click your piece'),d:L('Точки покажут допустимые ходы, кольца — взятия.','Dots show legal moves, rings show captures.')},{t:L('Нажмите клетку назначения','Click the destination'),d:L('Ход сделан. Своего короля нельзя оставлять под шахом.','The move is made. Your king can never be left in check.')}]},
   {cards:[{icon:'🏰',t:L('Рокировка','Castling'),d:L('Поддерживается по стандартным правилам.','Supported under standard rules.')},{icon:'↘️',t:L('Взятие на проходе','En passant'),d:L('Поддерживается.','Supported.')},{icon:'👑',t:L('Превращение','Promotion'),d:L('Пешка превращается в любую из четырёх фигур на выбор.','A pawn promotes to any of the four pieces.')}]}]},
  {id:'end',icon:'🏁',label:L('Конец партии','Game end'),blocks:[
   {table:{head:[L('Ситуация','Situation'),L('Итог','Result')],rows:[[L('Мат','Checkmate'),L('Победа','Win')],[L('Пат','Stalemate'),L('Ничья','Draw')],[L('Повторение позиции','Repetition'),L('Ничья','Draw')],[L('Недостаток материала','Insufficient material'),L('Ничья','Draw')],[L('Правило 50 ходов','Fifty-move rule'),L('Ничья','Draw')]]}},
   {note:L('Сопернику можно предложить ничью.','You can offer your opponent a draw.'),tone:'tip'}]},
  {id:'solo',icon:'🤖',label:L('Против компьютера','Versus computer'),blocks:[
   {list:[L('Три уровня сложности компьютера.','Three computer difficulty levels.'),L('В одиночной игре можно **вернуть ход**.','Solo play allows **takebacks**.'),L('Перед партией выберите сторону и, при желании, часы с добавлением.','Before starting, pick a side and an optional clock with increment.')]}]}
 ]};};
