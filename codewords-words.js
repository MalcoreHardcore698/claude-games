(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrionWords=api;})(typeof window==='object'?window:globalThis,()=>{
const categories=[
 ['space',['Космос','Space'],['Орбита','Orbit'],'Луна|Moon;Ракета|Rocket;Комета|Comet;Марс|Mars;Спутник|Satellite;Галактика|Galaxy;Астронавт|Astronaut;Телескоп|Telescope;Кратер|Crater;Метеорит|Meteorite'],
 ['sea',['Океан','Ocean'],['Прилив','Tide'],'Корабль|Ship;Якорь|Anchor;Капитан|Captain;Жемчуг|Pearl;Коралл|Coral;Подводник|Diver;Маяк|Lighthouse;Акула|Shark;Парус|Sail;Пират|Pirate'],
 ['forest',['Лес','Forest'],['Чаща','Woods'],'Сосна|Pine;Мох|Moss;Гриб|Mushroom;Олень|Deer;Дуб|Oak;Белка|Squirrel;Сова|Owl;Шишка|Cone;Папоротник|Fern;Медведь|Bear'],
 ['winter',['Мороз','Frost'],['Зима','Winter'],'Снег|Snow;Лёд|Ice;Санки|Sled;Лыжи|Skis;Иней|Rime;Варежка|Mitten;Метель|Blizzard;Айсберг|Iceberg;Снеговик|Snowman;Пингвин|Penguin'],
 ['music',['Музыка','Music'],['Концерт','Concert'],'Рояль|Piano;Скрипка|Violin;Гитара|Guitar;Барабан|Drum;Флейта|Flute;Нота|Note;Дирижёр|Conductor;Певец|Singer;Струна|String;Оркестр|Orchestra'],
 ['kitchen',['Кухня','Kitchen'],['Ужин','Dinner'],'Ложка|Spoon;Чайник|Kettle;Перец|Pepper;Тарелка|Plate;Повар|Chef;Корица|Cinnamon;Лимон|Lemon;Вилка|Fork;Тесто|Dough;Кастрюля|Saucepan'],
 ['royal',['Королевство','Kingdom'],['Трон','Throne'],'Корона|Crown;Рыцарь|Knight;Замок|Castle;Меч|Sword;Король|King;Герб|Crest;Щит|Shield;Принц|Prince;Башня|Tower;Дракон|Dragon'],
 ['science',['Наука','Science'],['Лаборатория','Laboratory'],'Атом|Atom;Колба|Flask;Микроскоп|Microscope;Электрон|Electron;Лазер|Laser;Магнит|Magnet;Формула|Formula;Вирус|Virus;Реактор|Reactor;Кристалл|Crystal'],
 ['city',['Город','City'],['Улица','Street'],'Мост|Bridge;Метро|Metro;Фонарь|Lantern;Вокзал|Station;Такси|Taxi;Площадь|Square;Балкон|Balcony;Фонтан|Fountain;Магазин|Shop;Трамвай|Tram'],
 ['art',['Искусство','Art'],['Мастерская','Studio'],'Кисть|Brush;Холст|Canvas;Палитра|Palette;Скульптор|Sculptor;Портрет|Portrait;Музей|Museum;Краска|Paint;Рама|Frame;Мольберт|Easel;Мозаика|Mosaic'],
 ['sport',['Спорт','Sport'],['Турнир','Tournament'],'Мяч|Ball;Ракетка|Racket;Ворота|Goal;Стадион|Stadium;Тренер|Coach;Медаль|Medal;Кубок|Cup;Коньки|Skates;Боксёр|Boxer;Бассейн|Pool'],
 ['magic',['Колдовство','Sorcery'],['Заклинание','Spell'],'Ведьма|Witch;Котёл|Cauldron;Посох|Staff;Зелье|Potion;Руна|Rune;Фея|Fairy;Гримуар|Grimoire;Амулет|Amulet;Призрак|Ghost;Портал|Portal'],
 ['travel',['Путешествие','Travel'],['Экспедиция','Expedition'],'Компас|Compass;Карта|Map;Палатка|Tent;Рюкзак|Backpack;Билет|Ticket;Самолёт|Airplane;Паспорт|Passport;Чемодан|Suitcase;Бинокль|Binoculars;Глобус|Globe'],
 ['desert',['Пустыня','Desert'],['Оазис','Oasis'],'Верблюд|Camel;Песок|Sand;Кактус|Cactus;Дюна|Dune;Мираж|Mirage;Скорпион|Scorpion;Караван|Caravan;Пирамида|Pyramid;Фараон|Pharaoh;Сфинкс|Sphinx'],
 ['tech',['Технологии','Technology'],['Цифра','Digital'],'Робот|Robot;Экран|Screen;Клавиатура|Keyboard;Процессор|Processor;Кабель|Cable;Сервер|Server;Батарея|Battery;Дрон|Drone;Антенна|Antenna;Датчик|Sensor'],
 ['garden',['Сад','Garden'],['Цветение','Blossom'],'Роза|Rose;Тюльпан|Tulip;Яблоко|Apple;Пчела|Bee;Лейка|Watering-can;Семя|Seed;Груша|Pear;Подсолнух|Sunflower;Лаванда|Lavender;Садовник|Gardener'],
 // Fandom pack: picked with the "Вселенные" word set.
 ['twilight',['Сумерки','Twilight'],['Форкс','Forks'],'Белла|Bella;Эдвард|Edward;Джейкоб|Jacob;Вампир|Vampire;Оборотень|Werewolf;Вольтури|Volturi;Элис|Alice;Карлайл|Carlisle;Ренесми|Renesmee;Квилеты|Quileutes','fandom'],
 ['potter',['Хогвартс','Hogwarts'],['Волшебник','Wizard'],'Гарри|Harry;Гермиона|Hermione;Дамблдор|Dumbledore;Снейп|Snape;Квиддич|Quidditch;Палочка|Wand;Гриффиндор|Gryffindor;Хагрид|Hagrid;Крестраж|Horcrux;Снитч|Snitch','fandom'],
 ['genshin',['Тейват','Teyvat'],['Архонт','Archon'],'Паймон|Paimon;Венти|Venti;Райдэн|Raiden;Нахида|Nahida;Фурина|Furina;Мондштадт|Mondstadt;Инадзума|Inazuma;Сумеру|Sumeru;Примогем|Primogem;Мора|Mora','fandom'],
 ['winx',['Винкс','Winx'],['Феи','Fairies'],'Блум|Bloom;Стелла|Stella;Флора|Flora;Муза|Musa;Текна|Tecna;Лейла|Layla;Алфея|Alfea;Трикс|Trix;Скай|Sky;Энчантикс|Enchantix','fandom'],
 ['rick',['Мультивселенная','Multiverse'],['Смиты','Smiths'],'Рик|Rick;Морти|Morty;Саммер|Summer;Бет|Beth;Джерри|Jerry;Огурчик|Pickle;Мисикс|Meeseeks;Цитадель|Citadel;Плюмбус|Plumbus;Сквончи|Squanchy','fandom'],
 ['overwatch',['Овервотч','Overwatch'],['Герои','Heroes'],'Трейсер|Tracer;Уинстон|Winston;Ангел|Mercy;Гэндзи|Genji;Хандзо|Hanzo;Райнхардт|Reinhardt;Жнец|Reaper;Ана|Ana;Кирико|Kiriko;Бастион|Bastion','fandom']
];
const words=[];for(const [tag,,,list,pack='classic']of categories)for(const pair of list.split(';'))words.push({n:pair.split('|'),tags:[tag],pack});
// Secondary associations give captains connections across the obvious categories.
const cross={Корабль:'travel',Капитан:'travel',Айсберг:'sea',Пингвин:'sea',Лёд:'science',Сова:'magic',Дракон:'magic',Кристалл:'magic',Маяк:'city',Лазер:'tech',Атом:'tech',Дрон:'travel',Бинокль:'science',Коньки:'winter',Медаль:'royal',Корона:'art',Глобус:'science',Пирамида:'royal',Пчела:'forest',Лаванда:'kitchen',Руна:'royal',Призрак:'winter',Фонарь:'travel',Мост:'travel',Кисть:'garden',Груша:'kitchen'};
for(const word of words)if(cross[word.n[0]])word.tags.push(cross[word.n[0]]);
return{words,categories:categories.map(([id,n,alias,,pack='classic'])=>({id,n,alias,pack})),packs:['classic','fandom','mix']};});
