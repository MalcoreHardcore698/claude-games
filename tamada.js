(function () {
  'use strict';
  const C = window.OrionTamadaCore;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const words = {
    title:['Выбор за удачей','Let fortune decide'], intro:['Три способа выбрать следующую игру. Собирайтесь в лобби — остальное решит тамада.','Three ways to choose your next game. Gather your lobby and let the tamada take over.'],
    wheel:['Колесо фортуны','Wheel of fortune'],wheel_d:['У каждого 10 голосов. Чем больше голосов у игры, тем больше её сектор.','10 votes per player. More votes give a game a larger sector.'],
    tiles:['Плитка голосов','Voting tiles'],tiles_d:['Три раунда: редкость, тег и открытая карточка игры. Выбирайте вместе.','Three rounds: rarity, tag, then a revealed game card. Choose together.'],
    prize:['Сектор «Приз»','Prize sector'],prize_d:['Лента игр, плавное замедление и один случайный победитель под указателем.','A reel of games slows to reveal a random winner under the pointer.'],
    pick:['Выбрать режим','Choose mode'],resume:['Продолжить выбор','Resume session'],menu:['Все режимы','All modes'],host:['Хост','Host'],only_host:['Режим и состав игр выбирает хост лобби.','The lobby host chooses the mode and included games.'],
    roster:['Игроки лобби','Lobby players'],waiting:['Ждём голоса','Waiting for votes'],ready:['Готово','Ready'],include:['Игры в выборе','Included games'],include_d:['Изменение состава игр начинает голосование заново.','Changing the games resets the vote.'],
    budget:['Голосуйте по секторам','Vote by clicking sectors'],remaining:['Осталось: {n}','Remaining: {n}'],sector_help:['Нажмите на сектор, чтобы добавить голос. Shift + клик или правый клик — убрать голос.','Click a sector to add a vote. Shift-click or right-click removes one.'],settings:['Настройки выбора','Selection settings'],confirm:['Подтвердить голоса','Confirm votes'],edit:['Изменить голоса','Edit votes'],
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
    let state = null, menu = true, finishTimer = null, sig = '', noticeId = '', previousSectors = null;
    const t = (key, values = {}) => {
      let value = (words[key] || [key, key])[ctx.lang() === 'en' ? 1 : 0];
      for (const [name, replacement] of Object.entries(values)) value = value.split('{'+name+'}').join(replacement);
      return value;
    };
    const host = () => ctx.host() || ctx.me();
    const isHost = () => host() === ctx.me();
    const people = () => ctx.members();
    const players = () => people().map(p => p.label);
    const game = id => games.find(g => g.id === id);
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
        if (fresh) {
          if (from === ctx.me() || ctx.visible()) { menu = false; ctx.join(); }
          else if (noticeId !== next.id) { noticeId = next.id; ctx.invite(t('join_title'), t('join_text', { mode:t(next.mode) })); }
        }
        scheduleFinish(); render(true); return;
      }
      if (!state || data.id !== state.id) return;
      if (data.a === 'launch') {
        if (from === host() && state.phase === 'done' && data.game === state.result && ctx.visible()) ctx.launch(state.result);
        return;
      }
      if (!isHost() || !players().includes(from)) return;
      if (data.a === 'vote') publish(C.vote(state, from, data, players(), games));
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
      if (snapshot && (!state || snapshot.seq > state.seq)) receive(leader.label, { a:'state', state:snapshot });
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
      return `<div class="tmPlayers">${people().map(p=>`<span class="tmPlayer${state.ready[p.label]?' ready':''}"><i class="fa-solid ${state.ready[p.label]?'fa-check':'fa-user'}"></i><span>${escape(p.p.n || '—')}</span>${p.label===host()?'<i class="fa-solid fa-crown"></i>':''}</span>`).join('')}</div>`;
    }
    function includedMarkup() {
      return `<div class="tmIncluded"><span class="eyebrow">${escape(t('include'))}</span><div>${games.map(g=>`<button type="button" class="tmInclude${state.enabled.includes(g.id)?' on':''}" data-tm-action="include" data-game="${g.id}" data-tm-focus="include-${g.id}" aria-pressed="${state.enabled.includes(g.id)}" ${!isHost()||state.phase!=='vote'?'disabled':''}><i class="fa-solid ${state.enabled.includes(g.id)?'fa-check':'fa-plus'}"></i>${escape(name(g.id))}</button>`).join('')}</div>${isHost()&&state.phase==='vote'?`<p>${escape(t('include_d'))}</p>`:''}</div>`;
    }
    function wheelMarkup() {
      const weights = state.spinWeights || C.wheelWeights(state, players());
      const segments = C.sectors(weights), selected = segments.find(s => s.id === state.result);
      const prev = previousSectors && previousSectors.length === segments.length ? previousSectors : [];
      const angle = selected ? 2160 + (360 - selected.mid) : 0;
      const spinning = state.phase === 'spin', finished = state.phase === 'done';
      const mine = state.ballots[ctx.me()] || {};
      const canVote = state.phase === 'vote' && !state.ready[ctx.me()];
      const point = (a, radius) => { const radians=(a-90)*Math.PI/180;return [210+Math.cos(radians)*radius,210+Math.sin(radians)*radius]; };
      const path = sector => { const p=point(sector.start,199),q=point(sector.end,199);return `M210 210L${p.join(' ')}A199 199 0 ${sector.end-sector.start>180?1:0} 1 ${q.join(' ')}Z`; };
      const part = sector => {
        const older=prev.find(x=>x.id===sector.id),before=older&&path(older),after=path(sector),p=point(sector.mid,137),oldp=older&&point(older.mid,137),g=game(sector.id);
        const isCircle = segments.length===1;
        const select=`data-tm-action="sector" data-game="${sector.id}" data-tm-focus="sector-${sector.id}" role="button" tabindex="${canVote?0:-1}" aria-label="${escape(name(sector.id)+': '+(mine[sector.id]||0))}"`;
        const anim=!isCircle&&older&&before!==after&&state.phase==='vote'&&(!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        const shape=isCircle?`<circle cx="210" cy="210" r="199"`:`<path d="${after}"`;
        return `<g class="tmSector${canVote?' votable':''}${mine[sector.id]?' hasVotes':''}" style="--sector:${ctx.color(g.r)}">${shape} ${select} fill="${ctx.color(g.r)}" stroke="#17191c" stroke-width="3">${anim?`<animate attributeName="d" from="${before}" to="${after}" dur=".42s" fill="freeze"/>`:''}${isCircle?'</circle>':'</path>'}
          <text x="${p[0]}" y="${p[1]-8}" text-anchor="middle" dominant-baseline="middle" pointer-events="none">${escape(name(sector.id).length>14?name(sector.id).slice(0,13)+'…':name(sector.id))}${anim?`<animate attributeName="x" from="${oldp[0]}" to="${p[0]}" dur=".42s" fill="freeze"/><animate attributeName="y" from="${oldp[1]-8}" to="${p[1]-8}" dur=".42s" fill="freeze"/>`:''}</text>
          <text class="tmSectorVotes" x="${p[0]}" y="${p[1]+12}" text-anchor="middle" dominant-baseline="middle" pointer-events="none">${mine[sector.id]?`×${mine[sector.id]}`:''}${anim?`<animate attributeName="x" from="${oldp[0]}" to="${p[0]}" dur=".42s" fill="freeze"/><animate attributeName="y" from="${oldp[1]+12}" to="${p[1]+12}" dur=".42s" fill="freeze"/>`:''}</text></g>`;
      };
      previousSectors=segments;
      return `<div class="tmWheelArea"><div class="tmWheelFrame"><span class="tmWheelPointer"></span><div class="tmWheelRotor${spinning?' spinning':''}" style="--tm-rotation:${angle}deg;--tm-duration:${state.spinDuration}ms;animation-delay:${state.spinAt-Date.now()}ms;${finished?`transform:rotate(${angle}deg)`:''}"><svg viewBox="0 0 420 420" role="group" aria-label="${escape(t('wheel'))}">${segments.map(part).join('')}<circle cx="210" cy="210" r="54" fill="#17191c" stroke="#ece6d8" stroke-width="3" pointer-events="none"/><text x="210" y="215" text-anchor="middle" class="tmWheelCenter" pointer-events="none">ORION</text><circle cx="210" cy="210" r="204" fill="none" stroke="#f2a33a" stroke-width="4" pointer-events="none"/></svg></div></div><p class="tmFootnote">${escape(t('wheel_note'))}</p></div>`;
    }
    function votesMarkup() {
      const mine=state.ballots[ctx.me()]||{},total=C.sum(mine);
      return `<div class="tmBallot"><div class="tmBallotHead"><h3>${escape(t('budget'))}</h3><span>${escape(t('remaining',{n:10-total}))}</span></div><div class="tmBudget"><i style="width:${total*10}%"></i></div><p class="tmFootnote">${escape(t('sector_help'))}</p>${state.phase==='vote'?actionButton('ready',t(state.ready[ctx.me()]?'edit':'confirm'),'',total!==10):''}</div>`;
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
    function resultMarkup() {
      if(state.phase!=='done')return '';
      return `<div class="tmResult" style="--rc:${ctx.color(game(state.result).r)}"><i class="fa-solid fa-trophy"></i><div><small>${escape(t('ready'))}</small><h3>${escape(t('winner',{g:name(state.result)}))}</h3></div>${isHost()?actionButton('launch',t('launch')):`<span>${escape(t('host_launch'))}</span>`}${isHost()?actionButton('again',t('again'),'',false,true):''}</div>`;
    }
    function renderSession() {
      const phase=state.phase, allReady=C.canAdvance(state,players());
      const label=state.mode==='wheel'?'spin':state.mode==='prize'?'spin_prize':state.round==='game'?'reveal':'next';
      return `<section class="tmSession"><div class="tmSessionHead"><div><p class="eyebrow">ORION · ${escape(t('title'))}</p><h2>${escape(t(state.mode))}</h2></div>${actionButton('menu',t('menu'),'',false,true)}</div>
        <div class="tmSessionBody">${state.mode==='wheel'?wheelMarkup():state.mode==='tiles'?tilesMarkup():prizeMarkup()}</div>
        <aside class="tmSettings"><p class="eyebrow tmSettingsTitle">${escape(t('settings'))}</p>${state.mode==='wheel'?votesMarkup():''}${includedMarkup()}</aside>
        <div class="tmSessionBottom"><div class="tmReadyLine"><span role="status" aria-live="polite">${escape(phase==='spin'?t('spinning'):phase==='done'?t('winner',{g:name(state.result)}):state.mode==='prize'?t('prize_ready'):t('vote_count',{n:readyCount(),total:players().length}))}</span>${phase==='vote'&&isHost()?actionButton('advance',t(label),'',!allReady):''}</div>${phase==='vote'?`<p class="tmFootnote">${escape(t(state.mode==='prize'?(isHost()?'random':'host_launch'):allReady?'all_ready':isHost()?'waiting':'await_host'))}</p>`:''}${membersMarkup()}${resultMarkup()}</div></section>`;
    }
    function render(force = false) {
      if (!ctx.visible()) return;
      const signature = JSON.stringify([state?.id,state?.seq,menu,ctx.lang(),host(),people().map(p=>[p.label,p.p.n])]);
      if(!force&&sig===signature)return;sig=signature;
      const focus=root.contains(document.activeElement)?document.activeElement?.dataset?.tmFocus:null;
      root.innerHTML=menu||!state?renderMenu():renderSession();
      if(focus)root.querySelector(`[data-tm-focus="${CSS.escape(focus)}"]`)?.focus({preventScroll:true});
    }
    root.addEventListener('click', event => {
      const button=event.target.closest('[data-tm-action]');if(!button||button.disabled||!root.contains(button))return;
      const a=button.dataset.tmAction;
      if(a==='mode'){start(button.dataset.mode);return;}
      if(a==='menu'){menu=true;render(true);return;}if(a==='resume'){menu=false;render(true);return;}
      if(!state)return;
      const send=payload=>ctx.emit({id:state.id,revision:state.revision,...payload});
      if(a==='include'){if(isHost())send({a:'include',game:button.dataset.game});}
      else if(a==='sector'){
        const mine={...(state.ballots[ctx.me()]||{})},id=button.dataset.game;
        if(state.phase!=='vote'||state.ready[ctx.me()]||!state.enabled.includes(id))return;
        const minus=event.shiftKey||C.sum(mine)>=10;
        if(minus&&!(mine[id]>0))return;
        mine[id]=(mine[id]||0)+(minus?-1:1);
        if(C.allocation(mine,state.enabled))send({a:'vote',allocation:mine,ready:false});
      }else if(a==='plus'||a==='minus'){
        const mine={...(state.ballots[ctx.me()]||{})},id=button.dataset.game;
        mine[id]=(mine[id]||0)+(a==='plus'?1:-1);
        if(C.allocation(mine,state.enabled))send({a:'vote',allocation:mine,ready:false});
      }else if(a==='ready')send({a:'vote',allocation:state.ballots[ctx.me()]||{},ready:!state.ready[ctx.me()]});
      else if(a==='choice')send({a:'vote',round:state.round,choice:button.dataset.choice});
      else if(a==='advance'){if(isHost())send({a:'advance'});}
      else if(a==='launch'){if(isHost())send({a:'launch',game:state.result});}
      else if(a==='again')start(state.mode);
    });
    root.addEventListener('contextmenu', event => {
      const segment=event.target.closest('.tmSector [data-tm-action="sector"]');
      if(!segment||!root.contains(segment)||state?.phase!=='vote'||state.ready[ctx.me()])return;
      event.preventDefault();
      const mine={...(state.ballots[ctx.me()]||{})},id=segment.dataset.game;
      if(!(mine[id]>0))return;
      mine[id]--;
      ctx.emit({id:state.id,revision:state.revision,a:'vote',allocation:mine,ready:false});
    });
    root.addEventListener('keydown', event => {
      if((event.key==='Enter'||event.key===' ')&&event.target.matches('.tmSector [data-tm-action="sector"]')){
        event.preventDefault();event.target.click();
      }
    });
    return { receive, getSnapshot:()=>state, open(){sync();menu=true;render(true);}, join(){menu=false;render(true);},
      render:()=>render(true), tick(){sync();render();}, destroy(){clearTimeout(finishTimer);} };
  };
})();
