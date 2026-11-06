(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrionGuessQuestions=api;})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const all=(...args)=>['all',...args],any=(...args)=>['any',...args],not=x=>['not',x];
  function matches(features,rule){const tags=features instanceof Set?features:new Set(String(features).split(/\s+/));if(typeof rule==='string')return tags.has(rule);if(rule[0]==='not')return !matches(tags,rule[1]);return rule[0]==='all'?rule.slice(1).every(r=>matches(tags,r)):rule.slice(1).some(r=>matches(tags,r));}
  const rules={
    witcher:[
      ['Это человек без ведьмачьих мутаций?','A human without witcher mutations?',all(not('nonhuman'),not('witcher'))],
      ['Это женщина, которая владеет магией?','A woman who uses magic?',all('woman','mage')],
      ['Это мужчина, который владеет магией?','A man who uses magic?',all(not('woman'),'mage')],
      ['Это ведьмак с седыми волосами?','A witcher with white or grey hair?',all('witcher','white')],
      ['Из Школы Волка и со шрамом?','From the Wolf School and has a scar?',all('wolf','scar')],
      ['Это правительница?','A female ruler?',all('ruler','woman')],
      ['Это правитель, который не является человеком?','A non-human ruler?',all('ruler','nonhuman')],
      ['Это эльф, который владеет магией?','An elf who uses magic?',all('elf','mage')],
      ['Связан с Реданией или Темерией?','Connected to Redania or Temeria?',any('redania','temeria')],
      ['Ведьмак или чародей?','A witcher or a mage?',any('witcher','mage')],
      ['Не ведьмак и не чародей?','Neither a witcher nor a mage?',all(not('witcher'),not('mage'))],
      ['Это не человек со шрамом?','A non-human with a scar?',all('nonhuman','scar')]
    ],
    lol:[
      ['Это женщина с дальней атакой?','A woman with ranged attacks?',all('woman','ranged')],
      ['Это женщина ближнего боя?','A woman who fights at close range?',all('woman',not('ranged'))],
      ['Это мужчина со стрелковым оружием?','A male marksman?',all(not('woman'),'marksman')],
      ['Это маг, который не является человеком?','A non-human mage?',all('nonhuman','mage')],
      ['Это человек-воин?','A human fighter?',all(not('nonhuman'),'fighter')],
      ['Убийца из Ионии?','An assassin from Ionia?',all('assassin','ionia')],
      ['Воин из Демасии или Ноксуса?','A fighter from Demacia or Noxus?',all('fighter',any('demacia','noxus'))],
      ['Это женщина из Пилтовера или Зауна?','A woman from Piltover or Zaun?',all('woman','pilt')],
      ['Это танк, который не является человеком?','A non-human tank?',all('tank','nonhuman')],
      ['Стрелок из Фрельйорда?','A marksman from the Freljord?',all('marksman','frel')],
      ['Родом из Ионии или Демасии?','From Ionia or Demacia?',any('ionia','demacia')],
      ['Это не человек с дальней атакой?','A non-human ranged attacker?',all('nonhuman','ranged')]
    ],
    dota:[
      ['Это героиня ближнего боя?','A female melee hero?',all('woman',not('ranged'))],
      ['Это героиня с дальней атакой?','A female ranged hero?',all('woman','ranged')],
      ['Это мужчина с дальней атакой?','A male ranged hero?',all(not('woman'),'ranged')],
      ['Это герой ближнего боя с ловкостью?','A melee Agility hero?',all(not('ranged'),'agi')],
      ['Это герой дальнего боя с ловкостью?','A ranged Agility hero?',all('ranged','agi')],
      ['Это героиня с силой?','A female Strength hero?',all('woman','str')],
      ['Это мужчина с силой?','A male Strength hero?',all(not('woman'),'str')],
      ['Это героиня с интеллектом?','A female Intelligence hero?',all('woman','int')],
      ['Это мужчина с интеллектом?','A male Intelligence hero?',all(not('woman'),'int')],
      ['Это героиня с ловкостью?','A female Agility hero?',all('woman','agi')],
      ['Это мужчина ближнего боя с ловкостью?','A male melee Agility hero?',all(not('woman'),not('ranged'),'agi')],
      ['Это героиня с ловкостью и дальней атакой?','A female ranged Agility hero?',all('woman','ranged','agi')]
    ],
    sw:[
      ['Владеет Силой и служит Тёмной стороне?','A Force user on the dark side?',all('force','dark')],
      ['Владеет Силой, но не относится к Тёмной стороне?','A Force user outside the dark side?',all('force',not('dark'))],
      ['Это женщина со световым мечом?','A woman with a lightsaber?',all('woman','saber')],
      ['Это инопланетянин, владеющий Силой?','An alien Force user?',all('alien','force')],
      ['Это дроид повстанцев?','A droid on the rebel side?',all('droid','rebel')],
      ['Имперский персонаж в шлеме или маске?','An Imperial character with a helmet or mask?',all('empire','helmet')],
      ['Это охотник за головами в шлеме?','A bounty hunter wearing a helmet?',all('hunter','helmet')],
      ['Это человек, летавший на «Соколе»?','A human who flew the Falcon?',all('falcon',not('alien'),not('droid'))],
      ['Это женщина, связанная с повстанцами?','A woman aligned with the rebels?',all('woman','rebel')],
      ['Зелёный инопланетянин без светового меча?','A green alien without a lightsaber?',all('green','alien',not('saber'))],
      ['Боец со световым мечом, который не является человеком?','A non-human lightsaber fighter?',all('saber','alien')],
      ['Повстанец, который не владеет Силой?','A rebel who does not use the Force?',all('rebel',not('force'))]
    ],
    got:[
      ['Это женщина из Винтерфелла?','A woman raised at Winterfell?',all('woman','wf')],
      ['Ланнистер, который носил корону?','A Lannister who wore a crown?',all('lan','crown')],
      ['Правитель, выросший в Винтерфелле?','A ruler raised at Winterfell?',all('crown','wf')],
      ['Это женщина с рыцарским титулом?','A woman with a knighthood?',all('woman','knight')],
      ['Связан с магией, но не носил корону?','Connected to magic but never wore a crown?',all('magic',not('crown'))],
      ['Таргариен с опытом Ночного Дозора?','A Targaryen who served in the Night’s Watch?',all('targ','watch')],
      ['Это светловолосая правительница?','A fair-haired female ruler?',all('woman','blonde','crown')],
      ['Рыжеволосая женщина с магическими силами?','A red-haired woman with magical powers?',all('woman','red','magic')],
      ['Рыцарь со светлыми волосами?','A fair-haired knight?',all('knight','blonde')],
      ['Ланнистер или Таргариен по крови?','A Lannister or Targaryen by blood?',any('lan','targ')],
      ['Из Винтерфелла и служил в Ночном Дозоре?','Raised at Winterfell and served in the Night’s Watch?',all('wf','watch')],
      ['Это мужчина, носивший корону?','A man who wore a crown?',all(not('woman'),'crown')]
    ]
  };
  function install(themes){for(const theme of themes){theme.extraRules={};(rules[theme.id]||[]).forEach(([ru,en,rule],i)=>{const id='extra_'+theme.id+'_'+i;theme.extraRules[id]=rule;theme.q.push([id,ru,en,'сочетание','combined']);});}}
  return{matches,install,rules};
});
