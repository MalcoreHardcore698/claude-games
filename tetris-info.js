/* Game guide content for the shared info dialog (orion-info.js). */
window.OrionInfoSpec=lang=>{const L=(ru,en)=>lang==='en'?en:ru;return{
 kicker:L('Правила · кооператив','Rules · co-op'),
 title:L('Общий тетрис','Orbit Blocks'),
 lead:L('Каждый управляет своей фигурой, но все складывают блоки на одном поле.','Everyone controls their own piece, but all of you build on one shared board.'),
 facts:[{v:'1–6',l:L('игроков','players')},{v:'10–30',l:L('столбцов','columns')}],
 tabs:[
  {id:'rules',icon:'🧱',label:L('Правила','Rules'),blocks:[
   {list:[L('У каждого игрока **своя фигура и свой запас**.','Each player has **their own piece and hold slot**.'),L('Уничтожайте целые горизонтальные линии.','Clear complete horizontal rows.'),L('Поле расширяется с 10 до 30 столбцов для 1–6 игроков.','The board grows from 10 to 30 columns for 1–6 players.')]},
   {note:L('Если новая фигура не помещается, забег заканчивается **для всех**.','If a new piece cannot spawn, the run ends **for everyone**.'),tone:'warn'},
   {acc:[{icon:'⏸',t:L('Пауза','Pause'),d:L('Пауза общая, управляет ею только хост.','The pause is shared; only the host controls it.')},{icon:'🎨',t:L('Как отличить фигуры','Telling pieces apart'),d:L('Цвет зависит от типа фигуры, а номер и маленькая метка обозначают игрока.','Color shows the piece type; numbers and small markers identify the player.')}]}]},
  {id:'keys',icon:'⌨️',label:L('Управление','Controls'),blocks:[
   {keys:[{k:['←','→'],d:L('движение','move')},{k:['↑','X'],d:L('поворот','rotate')},{k:['Z'],d:L('обратный поворот','rotate back')},{k:['↓'],d:L('мягкое падение','soft drop')},{k:[L('Пробел','Space')],d:L('мгновенный сброс','hard drop')},{k:['C'],d:L('запас','hold')}]}]}
 ]};};
