/* Game guide content for the shared info dialog (orion-info.js). */
window.OrionInfoSpec=lang=>{const L=(ru,en)=>lang==='en'?en:ru;return{
 kicker:L('Правила · викторина','Rules · quiz night'),
 title:L('Викторина','Quiz Night'),
 lead:L('Отвечайте на вопросы, рискуйте на колесе фортуны и не вылетайте на испытаниях между раундами. Вместе против Профессора или каждый сам за себя.','Answer questions, gamble on the wheel and survive the trials between rounds. Together against the Professor or every player for themselves.'),
 facts:[{v:'≤ 8',l:L('игроков','players')},{v:'15 c',l:L('на вопрос','per question')},{v:'4',l:L('варианта','options')}],
 tabs:[
  {id:'score',icon:'⭐',label:L('Очки','Scoring'),blocks:[
   {cards:[{icon:'✅',t:'100',meta:L('+ до 50 за скорость','+ up to 50 for speed'),d:L('за верный ответ','for a right answer')},{icon:'🎡',t:L('Колесо','Wheel'),d:L('Может удвоить следующий ответ, дать щит или отнять очки.','Can double your next answer, give a shield or take points away.')}]},
   {p:L('На каждый вопрос — 15 секунд и четыре варианта ответа.','Each question gives 15 seconds and four options.')}]},
  {id:'modes',icon:'👥',label:L('Режимы','Modes'),blocks:[
   {acc:[{icon:'🤝',t:L('Кооператив','Co-op'),d:L('Все вместе набирают очки. Профессор отвечает за каждого из вас — нужно его обогнать.','Everyone scores together. The Professor answers once per player — beat him.'),open:true},{icon:'🏅',t:L('Каждый сам за себя','Free for all'),d:L('У кого больше очков в конце — тот и победил.','Most points at the end wins.')},{icon:'⚔️',t:L('Команды','Teams'),d:L('Две команды, очки складываются. Создатель стола может пересадить игрока кликом.','Two teams, points add up. The host can move a player with a click.')}]}]},
  {id:'trials',icon:'🧪',label:L('Испытания','Trials'),blocks:[
   {p:L('Между раундами случайный игрок проходит испытание:','Between rounds a random player faces a trial:')},
   {cards:[{icon:'🎡',t:L('Колесо','Wheel')},{icon:'🧠',t:L('Память','Memory')},{icon:'➗',t:L('Счёт','Maths')},{icon:'⚡',t:L('Блиц','Speed maths')},{icon:'🎯',t:L('Реакция','Reflexes')},{icon:'🥁',t:L('Ритм','Rhythm')},{icon:'🔍',t:L('Найди лишнее','Odd one out')}],compact:true},
   {note:L('Не справился — пропускаешь следующий вопрос. Щит с колеса спасает от вылета.','Fail and you sit out the next question. A shield from the wheel saves you.'),tone:'warn'},
   {p:L('Частоту, сложность и набор испытаний выбирает создатель стола.','The host picks the frequency, difficulty and set of trials.')}]}
 ]};};
