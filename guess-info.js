/* Game guide content for the shared info dialog (orion-info.js). */
window.OrionInfoSpec=lang=>{const L=(ru,en)=>lang==='en'?en:ru;return{
 kicker:L('Правила · дуэль вопросов','Rules · question duel'),
 title:L('Угадай героя','Guess the Hero'),
 lead:L('Двое загадывают по герою с общей доски и по очереди задают вопросы. Кто первым назовёт героя соперника — тот победил.','Two players each pick a hero from a shared board and take turns asking questions. Name your opponent’s hero first to win.'),
 facts:[{v:'2',l:L('игрока','players')},{v:'5',l:L('вселенных','universes')},{v:L('да / нет','yes / no'),l:L('ответы','answers')}],
 tabs:[
  {id:'how',icon:'🎭',label:L('Как играть','How to play'),blocks:[
   {steps:[
    {t:L('Подготовка','Setup'),d:L('Выберите тему и размер доски, затем загадайте героя.','Pick a theme and a board size, then choose your secret hero.')},
    {t:L('Вопрос за ход','One question per turn'),d:L('Задайте вопрос-кнопку: ответ придёт сразу, и неподходящие карточки опустятся сами.','Ask a preset question: the answer is instant and non-matching cards flip down by themselves.')},
    {t:L('Назовите героя','Make the guess'),d:L('Нажмите «Назвать героя» и кликните карточку.','Press the guess button and click a card.')}]},
   {note:L('Ошибка при попытке назвать героя — **поражение**.','A wrong guess **loses** the game.'),tone:'warn'},
   {note:L('Клик по карточке опускает или поднимает её вручную.','Clicking a card flips it down or up manually.'),tone:'tip'}]},
  {id:'online',icon:'🌐',label:L('Онлайн','Online'),blocks:[
   {list:[L('Соперника берём из лобби сайта: позовите его кнопкой **«Позвать»**.','Opponents come from the site lobby: invite them with **Invite**.'),L('Онлайн можно спросить что угодно текстом — соперник ответит «да», «нет» или «не знаю».','Online you can type any question; your opponent answers yes, no or not sure.'),L('Остальные игроки лобби могут ставить фишки на победу и ошибки.','Other lobby players can bet chips on wins and wrong guesses.')]}]}
 ]};};
