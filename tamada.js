(function () {
  'use strict';
  const C = window.OrionTamadaCore, W = window.OrionWheel;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const words = {
    title:['Выбор за удачей','Let fortune decide'], intro:['Три способа выбрать следующую игру. Собирайтесь в лобби — остальное решит тамада.','Three ways to choose your next game. Gather your lobby and let the tamada take over.'],
    wheel:['Колесо фортуны','Wheel of fortune'],wheel_d:['У каждого 10 голосов. Чем больше голосов у игры, тем больше её сектор.','10 votes per player. More votes give a game a larger sector.'],
    tiles:['Плитка голосов','Voting tiles'],tiles_d:['Три раунда: редкость, тег и открытая карточка игры. Выбирайте вместе.','Three rounds: rarity, tag, then a revealed game card. Choose together.'],
    prize:['Сектор «Приз»','Prize sector'],prize_d:['Лента игр, плавное замедление и один случайный победитель под указателем.','A reel of games slows to reveal a random winner under the pointer.'],
    pick:['Выбрать режим','Choose mode'],resume:['Продолжить выбор','Resume session'],menu:['Все режимы','All modes'],host:['Хост','Host'],only_host:['Режим и состав игр выбирает хост лобби.','The lobby host chooses the mode and included games.'],
    roster:['Игроки лобби','Lobby players'],waiting:['Ждём голоса','Waiting for votes'],ready:['Готово','Ready'],include:['Игры в выборе','Included games'],include_d:['Изменение состава игр начинает голосование заново.','Changing the games resets the vote.'],
    budget:['Распределите 10 голосов','Distribute your 10 votes'],remaining:['Осталось: {n}','Remaining: {n}'],confirm:['Подтвердить голоса','Confirm votes'],edit:['Изменить голоса','Edit votes'],
    settings:['Настройки режима','Mode settings'],click_vote:['Клик по сектору: +1 голос','Click a sector: +1 vote'],remove_vote:['Правый клик или Shift + клик: −1','Right-click or Shift + click: −1'],reset_votes:['Сбросить','Reset'],votes_left:['ГОЛОСОВ','VOTES LEFT'],budget_full:['Все 10 голосов распределены. Подтвердите выбор или уберите голос.','All 10 votes are allocated. Confirm, or remove a vote.'],
    sector_label:['{g}: ваши голоса {mine}, всего {total}. Клик +1; Shift-клик −1.','{g}: your votes {mine}, total {total}. Click +1; Shift-click −1.'],
    wheel_note:['У каждой игры есть базовый сектор. Голоса увеличивают его площадь и шанс выпадения.','Every game has a base sector. Votes increase its area and winning chance.'],
    spin:['КРУТИТЬ КОЛЕСО','SPIN THE WHEEL'],spin_prize:['КРУТИТЬ ЛЕНТУ','SPIN THE REEL'],next:['Следующий раунд','Next round'],reveal:['Раскрыть победителя','Reveal winner'],
    rarity:['Редкость','Rarity'],tag:['Тег','Tag'],game:['Игра','Game'],round:['Раунд {n} из 3','Round {n} of 3'],voted:['Ваш голос','Your vote'],votes:['голосов: {n}','votes: {n}'],
    host_wait:['Хост продолжит, когда все проголосуют.','The host continues once everyone has voted.'],all_ready:['Все готовы. Можно продолжать.','Everyone is ready. You can continue.'],
    spinning:['Удача выбирает…','Fortune is choosing…'],winner:['Играем: {g}','Next up: {g}'],launch:['Запустить игру','Launch game'],host_launch:['Ждём запуска от хоста','Waiting for the host to launch'],again:['Выбрать ещё раз','Choose again'],
    prize_ready:['Лента готова к запуску','The reel is ready'],random:['У всех включённых игр одинаковый шанс.','Every included game has the same chance.'],vote_wait:['Голосуйте за следующий шаг. При ничьей вариант выбирается случайно.','Vote for the next step. Ties are broken randomly.'],
    join_title:['Тамада зовёт','The tamada is calling'],join_text:['Хост предлагает режим «{mode}».','The host suggests {mode}.'],
    rare:['Редкая','Rare'],epic:['Эпическая','Epic'],legendary:['Легендарная','Legendary'],common:['Обычная','Common'],
    all_games:['Все игры','All games'],await_host:['Вы можете голосовать; запуск — у хоста.','You can vote; the host starts the reveal.'],vote_count:['{n} из {total} готовы','{n} of {total} ready'],
  };
  window.createOrionTamada = function (ctx) {
    const root = ctx.root, games = ctx.games;
    let state = null, menu = true, finishTimer = null, sig = '', noticeId = '';
    let drawnWheel=null,wheelFrame=0;
    const t = (key, values = {}) => {
      let value = (words[key] || [key, key])[ctx.lang() === 'en' ? 1 : 0];
      for (const [name, replacement] of Object.entries(values)) value = value.split('{'+name+'}').join(replacement);
      return value;
    };
    const host = () => ctx.host() || ctx.me();
    const isHost = () => ctx.manage?ctx.manage():host()===ctx.me();
    const people = () => ctx.members();
    const players = () => people().map(p => p.label);
    const game = id => games.find(g => g.id === id);
    const gameColor=id=>W.color(games.findIndex(g=>g.id===id));
    const name = id => ctx.name(id);
    const readyCount = () => players().filter(p => state?.ready[p]).length;
    function publish(next) {
      if (!isHost() || !next) return;
      next.host = host(); next.seq = (state?.seq || 0) + 1;
      ctx.emit({ a:'state', state:next });
    }
    function start(mode) {
      if (!isHost()) { ctx.notice(t('only_host')); return; }
      menu = false;
      ctx.started();
      publish(C.create(games, { id:ctx.id(), host:host(), mode }));
    }
    function receive(from, data) {
      if (!data || typeof data !== 'object') return;
      if (data.a === 'state') {
        const next = C.normalise(data.state, games);
        if (!next || from !== host() || next.host !== from || (state && next.seq <= state.seq)) return;
        const fresh = !state || next.id !== state.id;
        state = next; ctx.changed(state);
        if(fresh||(!isHost()&&!ctx.visible())){menu=false;ctx.join();}
        scheduleFinish(); render(true); return;
      }
      if (!state || data.id !== state.id) return;
      if (data.a === 'launch') {
        if (from === host() && state.phase === 'done' && data.game === state.result && ctx.visible()) ctx.launch(state.result);
        return;
      }
      if (!isHost() || !players().includes(from)) return;
      if (data.a === 'vote') publish(C.vote(state, from, data, players(), games));
      else if(data.a==='vote_step')publish(C.step(state,from,data,players(),games));
      else if (from === host() && data.a === 'include') publish(C.include(state, data.game, games));
      else if (from === host() && data.a === 'advance') publish(C.advance(state, players(), games));
    }
    function scheduleFinish() {
      clearTimeout(finishTimer);
      if (state?.phase !== 'spin' || !isHost()) return;
      const id = state.id, seed = state.seed;
      finishTimer = setTimeout(() => {
        if (isHost() && state?.id === id && state.seed === seed && state.phase === 'spin') publish({ ...state, phase:'done' });
      }, Math.max(0, state.spinAt + state.spinDuration + 80 - Date.now()));
    }
    function sync() {
      const leader = people().find(p => p.label === host());
      const snapshot = leader?.p?.tm;
      if(snapshot&&(!ctx.allowedSession||ctx.allowedSession(snapshot))&&(!state||snapshot.seq>state.seq)) receive(leader.label, { a:'state', state:snapshot });
      if (state && state.host !== host() && isHost()) publish({ ...state, host:host() });
    }
    function actionButton(action, label, extra = '', disabled = false, ghost = false) {
      return `<button type="button" class="btn${ghost?' ghost':''}" data-tm-action="${action}" data-tm-focus="${action}${extra}" ${disabled?'disabled':''}>${escape(label)}</button>`;
    }
    function hubArt(mode) {
      if (mode === 'wheel') return `<div class="tmArtWheel"><div class="tmArtWheelDisc">${['fa-dice-d20','fa-circle-question','fa-user-secret','fa-person-running'].map((ic,i)=>`<i class="fa-solid ${ic}" style="--q:${i}"></i>`).join('')}<b>O</b></div><span class="tmArtNeedle"></span></div>`;
      if (mode === 'tiles') return `<div class="tmArtCards"><i class="fa-solid fa-gem"></i><i class="fa-solid fa-hashtag"></i><i class="fa-solid fa-gamepad"></i></div>`;
      return `<div class="tmArtPrize"><span class="tmArtNeedle"></span><div>${['fa-person-running','fa-dice-d20','fa-circle-question','fa-user-secret'].map((ic,i)=>`<i class="fa-solid ${ic}" style="--ac:${['#f2a33a','#b26cf5','#4c9bf0','#f2a33a'][i]}"></i>`).join('')}</div></div>`;
    }
    function renderMenu() {
      return `<section class="tmHub"><div class="tmOrbits" aria-hidden="true"><i></i><i></i><i></i><span>✦</span><b>✧</b></div>
        <div class="tmHeroCopy"><p class="eyebrow">ORION · ${escape(ctx.lang()==='en'?'GAME NIGHT':'ИГРОВОЙ ВЕЧЕР')}</p><h2>${escape(t('title'))}</h2><p>${escape(t('intro'))}</p></div>
        <div class="tmModes">${['wheel','tiles','prize'].map((mode,i)=>`<button class="tmMode" type="button" data-tm-action="mode" data-mode="${mode}"><span class="tmModeNo">0${i+1}</span><div class="tmModeArt" aria-hidden="true">${hubArt(mode)}</div><h3>${escape(t(mode))}</h3><p>${escape(t(mode+'_d'))}</p><span class="tmModeGo">${escape(t('pick'))} <i class="fa-solid fa-arrow-right"></i></span></button>`).join('')}</div>
        ${state?`<div class="tmResume">${actionButton('resume', t('resume'), '', false, true)}</div>`:''}${!isHost()?`<p class="tmHostHint"><i class="fa-solid fa-crown"></i> ${escape(t('only_host'))}</p>`:''}</section>`;
    }
    function membersMarkup() {
      return `<div class="tmPlayers">${people().map(p=>`<span class="tmPlayer${state.ready[p.label]?' ready':''}"><i class="fa-solid ${state.ready[p.label]?'fa-check':'fa-user'}"></i><span>${escape(p.p.n||'—')}</span>${state.mode==='wheel'?`<b class="tmPlayerBudget">${C.sum(state.ballots[p.label]||{})}/10</b>`:''}${p.label===host()?'<i class="fa-solid fa-crown"></i>':''}</span>`).join('')}</div>`;
    }
    function includedMarkup() {
      const totals=C.totals(state,players()),mine=state.ballots[ctx.me()]||{};
      return `<div class="tmIncluded"><span class="eyebrow">${escape(t('include'))}</span><div>${games.map(g=>`<button type="button" class="tmInclude${state.enabled.includes(g.id)?' on':''}" style="--game-color:${gameColor(g.id)}" data-tm-action="include" data-game="${g.id}" data-tm-focus="include-${g.id}" aria-pressed="${state.enabled.includes(g.id)}" ${!isHost()||state.phase!=='vote'?'disabled':''}><span class="tmIncludeArt" aria-hidden="true">${ctx.cover(g.id)}</span><span class="tmIncludeName"><span>${escape(name(g.id))}</span>${state.mode==='wheel'?`<small>${escape(ctx.lang()==='en'?'Total':'Всего')}: <b class="tmGameTotal">${totals[g.id]||0}</b> · ${escape(ctx.lang()==='en'?'yours':'ваши')}: ${mine[g.id]||0}</small>`:''}</span><i class="fa-solid ${state.enabled.includes(g.id)?'fa-check':'fa-plus'}"></i></button>`).join('')}</div>${isHost()&&state.phase==='vote'?`<p>${escape(t('include_d'))}</p>`:''}</div>`;
    }
    function wheelTargets(){return C.sectors(state.spinWeights || C.wheelWeights(state,players()));}
    function wheelMarkup() {
      const target=wheelTargets(), voting=state.phase==='vote',mine=state.ballots[ctx.me()]||{},total=C.sum(mine),totals=C.totals(state,players());
      const locked=!!state.ready[ctx.me()]||!voting;
      const segments=drawnWheel?.id===state.id&&voting?W.interpolate(drawnWheel.segments,target,0):target;
      const selected=target.find(s=>s.id===state.result),angle=selected?2160+(360-selected.mid):0;
      const spinning=state.phase==='spin',finished=state.phase==='done';
      return `<div class="tmWheelArea"><div class="tmWheelFrame"><span class="tmWheelPointer"></span><div class="tmWheelRotor${spinning?' spinning':''}" style="--tm-rotation:${angle}deg;--tm-duration:${state.spinDuration}ms;animation-delay:${state.spinAt-Date.now()}ms;${finished?`transform:rotate(${angle}deg)`:''}"><svg viewBox="0 0 420 420" aria-label="${escape(t('wheel'))}">
        ${segments.map(segment=>{const g=game(segment.id),label=t('sector_label',{g:name(g.id),mine:mine[g.id]||0,total:totals[g.id]||0});return `<g class="tmSector${mine[g.id]?' has-votes':''}" data-tm-action="sector" data-game="${g.id}" data-tm-focus="sector-${g.id}" role="button" tabindex="${locked?-1:0}" aria-disabled="${locked}" aria-label="${escape(label)}"><title>${escape(label)}</title><path class="tmSectorPath" d="${W.path(segment)}" fill="${gameColor(g.id)}"/><text class="tmSectorName">${escape(name(g.id))}</text><text class="tmSectorVotes">${totals[g.id]||0}</text></g>`;}).join('')}
        <circle cx="210" cy="210" r="54" fill="#17191c" stroke="#ece6d8" stroke-width="3"/><text x="210" y="209" text-anchor="middle" class="tmWheelCenter">${voting?10-total:'ORION'}</text><text x="210" y="229" text-anchor="middle" class="tmWheelCenterLabel">${escape(voting?t('votes_left'):'PLAY TOGETHER')}</text><circle cx="210" cy="210" r="204" fill="none" stroke="#f2a33a" stroke-width="4" pointer-events="none"/>
      </svg></div></div><div class="tmWheelHelp"><span>${escape(t('click_vote'))}</span><span>${escape(t('remove_vote'))}</span></div></div>`;
    }
    function paintWheel(segments){
      for(const sector of segments){
        const group=root.querySelector(`.tmSector[data-game="${CSS.escape(sector.id)}"]`);if(!group)continue;
        group.querySelector('.tmSectorPath').setAttribute('d',W.path(sector));
        const p=W.point(sector.mid,137),count=W.point(sector.mid,86),angle=sector.mid>180?sector.mid+90:sector.mid-90;
        const label=group.querySelector('.tmSectorName');label.setAttribute('visibility',W.visibleLabel(sector,name(sector.id))?'visible':'hidden');label.setAttribute('transform',`translate(${p[0]} ${p[1]}) rotate(${angle})`);
        const votes=group.querySelector('.tmSectorVotes');votes.setAttribute('visibility',sector.end-sector.start>=15?'visible':'hidden');votes.setAttribute('x',count[0]);votes.setAttribute('y',count[1]);
      }
    }
    function animateWheel(){
      if(!state||state.mode!=='wheel'||menu)return;
      const target=wheelTargets(),from=drawnWheel?.id===state.id?W.interpolate(drawnWheel.segments,target,0):target;
      const id=state.id;drawnWheel={id,segments:from};paintWheel(from);
      const changed=JSON.stringify(from)!==JSON.stringify(target);
      const reduce=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(!changed||state.phase!=='vote'||reduce||typeof requestAnimationFrame!=='function'){drawnWheel={id,segments:target};paintWheel(target);return;}
      const start=performance.now();
      const step=now=>{
        if(!state||state.id!==id||menu)return;
        const t=Math.min(1,(now-start)/360),eased=1-Math.pow(1-t,3);
        const segments=W.interpolate(from,target,eased);drawnWheel={id,segments};paintWheel(segments);
        if(t<1)wheelFrame=requestAnimationFrame(step);else wheelFrame=0;
      };
      wheelFrame=requestAnimationFrame(step);
    }
    function voteToolsMarkup(){
      if(state.mode!=='wheel'||state.phase!=='vote')return '';
      const total=C.sum(state.ballots[ctx.me()]||{}),locked=!!state.ready[ctx.me()];
      return `<div class="tmVoteTools"><p>${escape(t('remaining',{n:10-total}))}</p><div>${actionButton('ready',t(locked?'edit':'confirm'),'',total!==10)}${!locked?actionButton('reset',t('reset_votes'),'',!total,true):''}</div></div>`;
    }
    function tilesMarkup() {
      const opts = C.options(state,games), mine = state.ballots[ctx.me()], tally=Object.fromEntries(opts.map(id=>[id,0]));
      for(const p of players())if(Object.hasOwn(tally,state.ballots[p]))tally[state.ballots[p]]++;
      return `<div class="tmRounds">${['rarity','tag','game'].map((r,i)=>`<span class="${r===state.round?'current':i<['rarity','tag','game'].indexOf(state.round)?'complete':''}"><b>${i+1}</b>${escape(t(r))}</span>`).join('')}</div><p class="tmRoundNote">${escape(t('round',{n:['rarity','tag','game'].indexOf(state.round)+1}))} · ${escape(t('vote_wait'))}</p>
        <div class="tmChoices">${opts.map(id=>{const g=state.round==='game'?game(id):null,color=g?ctx.color(g.r):state.round==='rarity'?ctx.color(id):'#f2a33a';return `<button class="tmChoice${mine===id?' chosen':''}${g?' game':''}" type="button" data-tm-action="choice" data-choice="${id}" data-tm-focus="choice-${id}" aria-pressed="${mine===id}" style="--rc:${color}" ${state.phase!=='vote'?'disabled':''}>${g?`<div class="cover ${g.cover}">${ctx.cover(g.id)}</div>`:`<div class="tmChoiceSymbol"><i class="fa-solid ${state.round==='rarity'?'fa-gem':'fa-hashtag'}"></i></div>`}<h3>${escape(g?name(id):state.round==='rarity'?t(id):ctx.tag(id))}</h3><span class="tmTileVotes">${escape(mine===id?t('voted'):t('votes',{n:tally[id]}))}</span></button>`;}).join('')}</div>`;
    }
    function prizeMarkup() {
      const sequence = state.result ? C.prizeStrip(state) : { items:Array.from({length:12},(_,i)=>state.enabled[i%state.enabled.length]), winnerIndex:-1,offset:0 };
      return `<div class="tmPrizeStage"><p class="eyebrow">${escape(t('prize'))}</p><div class="tmReelViewport"><span class="tmReelPointer"></span><div aria-hidden="true" class="tmPrizeTrack${state.phase==='spin'?' spinning':''}" style="--tm-offset:${sequence.offset}px;--tm-duration:${state.spinDuration}ms;animation-delay:${state.spinAt-Date.now()}ms;${state.phase==='done'?`transform:translateX(${sequence.offset}px)`:''}">${sequence.items.map((id,i)=>{const g=game(id);return `<div data-game="${id}" class="tmPrizeItem${i===sequence.winnerIndex&&state.phase==='done'?' winner':''}" style="--rc:${ctx.color(g.r)}"><div class="cover ${g.cover}">${ctx.cover(id)}</div><i class="fa-solid ${g.icon}"></i><b>${escape(name(id))}</b><span>${escape(t(g.r))}</span></div>`;}).join('')}</div></div><p class="tmFootnote">${escape(t('random'))}</p></div>`;
    }
    function resultMarkup(){
      if(state.phase!=='done')return `<p class="tmStageStatus" role="status" aria-live="polite"><i class="fa-solid ${state.phase==='spin'?'fa-wand-magic-sparkles':'fa-circle-info'}"></i>${escape(state.phase==='spin'?t('spinning'):state.mode==='wheel'?t('wheel_note'):state.mode==='prize'?t('random'):t('vote_wait'))}</p>`;
      return `<div class="tmResult" role="status" style="--rc:${ctx.color(game(state.result).r)}"><i class="fa-solid fa-trophy"></i><div><small>${escape(t('ready'))}</small><h3>${escape(t('winner',{g:name(state.result)}))}</h3></div></div>`;
    }
    function sessionActionsMarkup(){
      const allReady=C.canAdvance(state,players()),phase=state.phase;
      const label=state.mode==='wheel'?'spin':state.mode==='prize'?'spin_prize':state.round==='game'?'reveal':'next';
      return `<div class="tmSessionActions"><p class="tmReadyStatus" role="status" aria-live="polite">${escape(phase==='spin'?t('spinning'):phase==='done'?t('ready'):state.mode==='prize'?t('prize_ready'):t('vote_count',{n:readyCount(),total:players().length}))}</p>
        ${phase==='vote'&&isHost()?actionButton('advance',t(label),'',!allReady):''}
        ${phase==='vote'&&!isHost()?`<p class="tmFootnote">${escape(t('await_host'))}</p>`:''}
        ${phase==='done'?(isHost()?actionButton('launch',t('launch'))+actionButton('again',t('again'),'',false,true):`<p class="tmFootnote">${escape(t('host_launch'))}</p>`):''}</div>`;
    }
    function renderSession(){
      return `<div class="tmSession"><section class="tmMain"><div class="tmSessionHead"><div><p class="eyebrow">ORION · ${escape(t('title'))}</p><h2>${escape(t(state.mode))}</h2></div>${isHost()?actionButton('menu',t('menu'),'',false,true):''}</div>
        <div class="tmSessionBody tmBody-${state.mode}">${state.mode==='wheel'?wheelMarkup():state.mode==='tiles'?tilesMarkup():prizeMarkup()}</div><div class="tmSessionFooter">${resultMarkup()}</div></section>
        <aside class="tmSettings"><h3 class="tmSettingsTitle"><i class="fa-solid fa-sliders" aria-hidden="true"></i>${escape(t('settings'))}</h3>${includedMarkup()}${voteToolsMarkup()}<div class="tmRoster"><span class="eyebrow">${escape(t('roster'))}</span>${membersMarkup()}</div>${sessionActionsMarkup()}</aside></div>`;
    }
    function render(force = false) {
      if (!ctx.visible()) return;
      const signature = JSON.stringify([state?.id,state?.seq,menu,ctx.lang(),host(),people().map(p=>[p.label,p.p.n])]);
      if(!force&&sig===signature)return;sig=signature;
      const focus=root.contains(document.activeElement)?document.activeElement?.dataset?.tmFocus:null;
      if(wheelFrame&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(wheelFrame);wheelFrame=0;
      if(ctx.following?.())menu=false;
      root.innerHTML=!state&&ctx.following?.()?`<section class="tmWaiting"><i class="fa-solid fa-satellite-dish"></i><h2>${escape(ctx.lang()==='ru'?'Подключаемся к тамаде':'Joining the tamada')}</h2><p>${escape(ctx.lang()==='ru'?'Восстанавливаем общий режим лобби…':'Restoring the shared lobby session…')}</p></section>`:menu||!state?renderMenu():renderSession();
      if(!menu&&state?.mode==='wheel')animateWheel();
      if(focus)root.querySelector(`[data-tm-focus="${CSS.escape(focus)}"]`)?.focus({preventScroll:true});
    }
    function adjustSector(id,delta){
      if(!state||state.mode!=='wheel'||state.phase!=='vote'||state.ready[ctx.me()]||!state.enabled.includes(id))return;
      if(delta>0&&C.sum(state.ballots[ctx.me()]||{})>=10)ctx.notice(t('budget_full'));
      // Apply each click against the host's latest ballot, so rapid clicks by a
      // guest survive delayed state acknowledgements instead of overwriting one another.
      ctx.emit({id:state.id,revision:state.revision,a:'vote_step',game:id,delta});
    }
    root.addEventListener('contextmenu',event=>{const sector=event.target.closest('[data-tm-action="sector"]');if(sector&&root.contains(sector)){event.preventDefault();adjustSector(sector.dataset.game,-1);}});
    root.addEventListener('keydown',event=>{const sector=event.target.closest('[data-tm-action="sector"]');if(!sector||!root.contains(sector))return;
      if(['Enter',' ','Backspace','Delete','-'].includes(event.key)){event.preventDefault();adjustSector(sector.dataset.game,event.shiftKey||['Backspace','Delete','-'].includes(event.key)?-1:1);}});
    root.addEventListener('click', event => {
      const button=event.target.closest('[data-tm-action]');if(!button||button.disabled||button.getAttribute?.('aria-disabled')==='true'||!root.contains(button))return;
      const a=button.dataset.tmAction;
      if(a==='mode'){start(button.dataset.mode);return;}
      if(a==='menu'){if(!isHost())return;ctx.menuOpened?.();menu=true;render(true);return;}if(a==='resume'){menu=false;render(true);return;}
      if(!state)return;
      const send=payload=>ctx.emit({id:state.id,revision:state.revision,...payload});
      if(a==='sector'){adjustSector(button.dataset.game,event.shiftKey?-1:1);return;}
      if(a==='reset'){if(state.phase==='vote'&&!state.ready[ctx.me()])send({a:'vote',allocation:{},ready:false});return;}
      if(a==='include'){if(isHost())send({a:'include',game:button.dataset.game});}
      else if(a==='plus'||a==='minus'){
        const mine={...(state.ballots[ctx.me()]||{})},id=button.dataset.game;
        mine[id]=(mine[id]||0)+(a==='plus'?1:-1);
        if(C.allocation(mine,state.enabled))send({a:'vote',allocation:mine,ready:false});
      }else if(a==='ready')send({a:'vote',allocation:state.ballots[ctx.me()]||{},ready:!state.ready[ctx.me()]});
      else if(a==='choice')send({a:'vote',round:state.round,choice:button.dataset.choice});
      else if(a==='advance'){if(isHost())send({a:'advance'});}
      else if(a==='launch'){if(isHost())send({a:'launch',game:state.result});}
      else if(a==='again')start(state.mode);
    });
    return {receive,getSnapshot:()=>state,
      reset(){clearTimeout(finishTimer);state=null;menu=true;sig='';},
      hydrate(snapshot){receive(snapshot.host,{a:'state',state:snapshot});},
      adopt(snapshot){if(isHost()){const next=C.normalise(snapshot,games);if(next)publish({...next,host:host()});}},
      open(){if(!isHost())return;sync();ctx.menuOpened?.();menu=true;render(true);},join(){menu=false;render(true);},
      render:()=>render(true), tick(){sync();render();}, destroy(){clearTimeout(finishTimer);if(wheelFrame&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(wheelFrame);} };
  };
})();
