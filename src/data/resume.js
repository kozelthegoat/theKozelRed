// Résumé content — sourced from kozel-resume-2026-10-15.pdf. Edit freely.
//
// The prose is written three times; the proper nouns — organisations, people, places, game and
// event titles — are written once, because they keep their own name. `*For(locale)` gives one
// language's view; the plain exports are English, for anything that is not a page. A language that
// is missing a line falls back to English rather than going blank.

const helpWithText = {
  en: [
    'Running operations across distributed, multi-entity teams',
    'Putting AI and automation to work in real delivery — not slide decks',
    'Turning strategy into scope, priorities, and shipped products',
    'Structuring and staffing teams for the work at hand',
    'Forecasting risks and steering teams through a crisis',
    'Keeping the numbers honest — P&L, budgets, and “misc” spend',
    'Building processes and tools people actually love',
    'Aligning product, design, engineering, and art around one plan'
  ],
  ru: [
    'Операционная работа в распределённых командах и нескольких юрлицах',
    'ИИ и автоматизация в реальной работе — а не в презентациях',
    'Превращение стратегии в объём, приоритеты и выпущенные продукты',
    'Структура и подбор команд под конкретную задачу',
    'Прогноз рисков и вывод команд из кризиса',
    'Честные цифры — P&L, бюджеты и «прочие» расходы',
    'Процессы и инструменты, которыми люди действительно пользуются',
    'Согласование продукта, дизайна, разработки и арта вокруг одного плана'
  ],
  be: [
    'Аперацыйная праца ў размеркаваных камандах і некалькіх юрыдычных асобах',
    'ШІ і аўтаматызацыя ў рэальнай працы — а не ў прэзентацыях',
    'Ператварэнне стратэгіі ў аб’ём, прыярытэты і выпушчаныя прадукты',
    'Структура і падбор каманд пад пэўную задачу',
    'Прагноз рызык і вывад каманд з крызісу',
    'Сумленныя лічбы — P&L, бюджэты і «іншыя» выдаткі',
    'Працэсы і інструменты, якімі людзі сапраўды карыстаюцца',
    'Узгадненне прадукту, дызайну, распрацоўкі і арта вакол аднаго плана'
  ]
};

const experienceText = [
  {
    role: { en: 'Director of Operations', ru: 'Директор по операциям', be: 'Дырэктар па аперацыях' },
    org: 'Magic Media',
    where: { en: 'Ireland', ru: 'Ирландия', be: 'Ірландыя' },
    when: { en: 'Feb 2024 – Sep 2025', ru: 'фев 2024 – сен 2025', be: 'лют 2024 – вер 2025' },
    points: {
      en: [
        'Led operations across a few legal entities for ~20 AA+ titles.',
        'Steered P&L to bring transparency to “misc” expenses with no clear ROI, saving R&D budget.',
        'Sunset “pet” projects with no path to production.',
        'Optimized bench mgmt reducing idle time w/ dynamic talent pooling from cross-project staffing.',
        'Standardized Jira workflows for a number of projects reducing cross-team dependencies.'
      ],
      ru: [
        'Вёл операционную работу в нескольких юрлицах для ~20 проектов уровня AA+.',
        'Вывел P&L в прозрачность по «прочим» расходам без явной отдачи, сэкономив бюджет R&D.',
        'Закрыл «любимые» проекты без пути в производство.',
        'Оптимизировал управление скамом, снизив простой за счёт динамического пула талантов из кросс-проектного штата.',
        'Стандартизировал рабочие процессы Jira для ряда проектов, снизив кросс-командные зависимости.'
      ],
      be: [
        'Вёў аперацыйную працу ў некалькіх юрыдычных асобах для ~20 праектаў узроўню AA+.',
        'Вывеў P&L у празрыстасць па «іншых» выдатаках без яўнай аддачы, зэканоміўшы бюджэт R&D.',
        'Закрыў «любімыя» праекты без шляху ў вытворчасць.',
        'Аптымізаваў кіраванне скамам, знізіўшы прастой за кошт дынамічнага пула талентаў з крос-праектнага штату.',
        'Стандартызаваў працэсы Jira для шэрагу праектаў, знізіўшы крос-камандныя залежнасці.'
      ]
    }
  },
  {
    role: { en: 'Director of Production', ru: 'Директор по производству', be: 'Дырэктар па вытворчасці' },
    org: 'Fracture Labs',
    where: { en: 'Singapore', ru: 'Сингапур', be: 'Сінгапур' },
    when: { en: 'Jun 2022 – Feb 2024', ru: 'июн 2022 – фев 2024', be: 'чэр 2022 – лют 2024' },
    intro: {
      en: 'Worked on Decimated, AA+, an MMO FPS for PC.',
      ru: 'Работал над Decimated — AA+, MMO FPS для PC.',
      be: 'Працаваў над Decimated — AA+, MMO FPS для PC.'
    },
    points: {
      en: [
        'Reworked & phased out product scope (multiple iterations).',
        'Streamlined team structure to re-define responsibilities and pipelines.',
        'Built & managed: Engineering, Design, DevOps, Tech Art, Animation, VFX, Recruitment.',
        'Introduced new studio task management & automation tools.',
        'Introduced & maintained Agile as continuous improvement practices.',
        'Reworked knowledge-base structure, fueling its quality & depth.'
      ],
      ru: [
        'Переработал и поэтапно свёл продуктовый объём (несколько итераций).',
        'Выстроил структуру команды заново, переопределив зоны ответственности и пайплайны.',
        'Собрал и управлял: разработка, дизайн, DevOps, техарт, анимация, VFX, рекрутинг.',
        'Внедрил новые инструменты управления задачами и автоматизации в студии.',
        'Внедрил и поддерживал Agile как практику непрерывного улучшения.',
        'Переработал структуру базы знаний, что подняло её качество и глубину.'
      ],
      be: [
        'Перапрацаваў і паэтапна звёў прадуктовы аб’ём (некалькі ітэрацый).',
        'Пабудаваў структуру каманды нанова, пераакрэсліўшы зоны адказнасці і пайплайны.',
        'Сабраў і кіраваў: распрацоўка, дызайн, DevOps, тэхарт, анімацыя, VFX, рэкрутынг.',
        'Укараніў новыя інструменты кіравання задачамі і аўтаматызацыі ў студыі.',
        'Укараніў і падтрымліваў Agile як практыку бесперапыннага паляпшэння.',
        'Перапрацаваў структуру базы ведаў, што падняло яе якасць і глыбіню.'
      ]
    }
  },
  {
    role: { en: 'Game Producer', ru: 'Гейм-продюсер', be: 'Гейм-прадзюсар' },
    org: 'CM Games',
    where: { en: 'Estonia', ru: 'Эстония', be: 'Эстонія' },
    when: { en: 'Mar 2022 – Jul 2022', ru: 'мар 2022 – июл 2022', be: 'сак 2022 – ліп 2022' },
    points: {
      en: [
        'Revamped LiveOps leading global updates optimizing live events, car economies & balancing, IAP pricing, etc.',
        'Reduced rollout delays from 3 weeks to healthy “2 days” with kill-switch feature enabled (multi-platform updates).'
      ],
      ru: [
        'Переработал LiveOps, ведя глобальные обновления: живые события, экономика машин и балансировка, цены IAP и т. д.',
        'Сократил задержки релизов с 3 недель до здоровых «2 дней», включив kill-switch (обновления для нескольких платформ).'
      ],
      be: [
        'Перапрацаваў LiveOps, вёў глабальныя абнаўленні: жывыя падзеі, эканоміка машын і балансаванне, кошты IAP і г. д.',
        'Скараціў затрымкі рэлізаў з 3 тыдняў да здаровых «2 дзён», уключыўшы kill-switch (абнаўленні для некалькіх платформ).'
      ]
    },
    released: {
      en: ['a number of updates to Nitro Nation, a popular game in the Racing genre'],
      ru: ['ряд обновлений для Nitro Nation — популярной игры в жанре гонок'],
      be: ['шэраг абнаўленняў для Nitro Nation — папулярнай гульні ў жанры гонак']
    }
  },
  {
    role: { en: 'Co-founder', ru: 'Соучредитель', be: 'Сузаснавальнік' },
    org: 'Payara Games',
    where: { en: 'Belarus', ru: 'Беларусь', be: 'Беларусь' },
    when: { en: 'Mar 2020 – Mar 2022', ru: 'мар 2020 – мар 2022', be: 'сак 2020 – сак 2022' },
    points: {
      en: [
        'Pioneered award-winning survival horror game development in Eastern Europe.',
        'Developed 5+ mobile & web games powered by the latest NFC and smart chip technologies.'
      ],
      ru: [
        'Запустил отмеченную наградами разработку survival horror в Восточной Европе.',
        'Разработал 5+ мобильных и веб-игр на новейших NFC и smart-chip технологиях.'
      ],
      be: [
        'Запусціў адзначаную ўзнагародамі распрацоўку survival horror ва Усходняй Еўропе.',
        'Распрацаваў 5+ мабільных і вэб-гульняў на найноўшых NFC і smart-chip тэхналогіях.'
      ]
    },
    released: {
      en: [
        {
          title: 'a PC game in the Horror genre inspired by P.T. on Steam',
          notes: [
            '“Best PC Game” & “Best Art” @ Games Gathering',
            '“True Indie” @ BelGameDev (nominated by WarHorse Studios)',
            '“People’s Choice” & “Best Game” @ WebCon'
          ]
        },
        {
          title: 'a PC game in the Adventure / Horror genres on Steam',
          notes: ['“The Finalist” @ Unreal Engine Dev Contest']
        },
        '5 mobile & web games in the Charitable Gaming / Lottery / Casino genres powered by NFC'
      ],
      ru: [
        {
          title: 'PC-игра в жанре хоррор, вдохновлённая P.T., в Steam',
          notes: [
            '«Лучшая PC-игра» и «Лучший арт» @ Games Gathering',
            '«True Indie» @ BelGameDev (номинация от WarHorse Studios)',
            '«Приз зрительских симпатий» и «Лучшая игра» @ WebCon'
          ]
        },
        {
          title: 'PC-игра в жанрах приключение / хоррор в Steam',
          notes: ['«Финалист» @ Unreal Engine Dev Contest']
        },
        '5 мобильных и веб-игр в жанрах благотворительных игр / лотерей / казино на NFC'
      ],
      be: [
        {
          title: 'PC-гульня ў жанры хорар, натхнёная P.T., у Steam',
          notes: [
            '«Лепшая PC-гульня» і «Лепшы арт» @ Games Gathering',
            '«True Indie» @ BelGameDev (намінацыя ад WarHorse Studios)',
            '«Прыз гледачоў» і «Лепшая гульня» @ WebCon'
          ]
        },
        {
          title: 'PC-гульня ў жанрах прыгоды / хорар у Steam',
          notes: ['«Фіналіст» @ Unreal Engine Dev Contest']
        },
        '5 мабільных і вэб-гульняў у жанрах дабрачынных гульняў / латарэй / казіно на NFC'
      ]
    }
  },
  {
    role: { en: 'Co-founder', ru: 'Соучредитель', be: 'Сузаснавальнік' },
    org: 'Abelana VR Productions, Inc.',
    where: { en: 'United States', ru: 'США', be: 'ЗША' },
    when: { en: 'Mar 2018 – Mar 2022', ru: 'мар 2018 – мар 2022', be: 'сак 2018 – сак 2022' },
    points: {
      en: [
        'Pioneered & developed educational VR experiences and tools.',
        'Developed a platform & 5+ games/apps blending science, education, and latest visionary technologies.'
      ],
      ru: [
        'Запустил и развивал образовательные VR-опыты и инструменты.',
        'Разработал платформу и 5+ игр/приложений, соединяющих науку, образование и новейшие технологии.'
      ],
      be: [
        'Запусціў і развіваў адукацыйныя VR-вопыты і інструменты.',
        'Распрацаваў платформу і 5+ гульняў/прыкладанняў, што спалучаюць навуку, адукацыю і найноўшыя тэхналогіі.'
      ]
    },
    released: {
      en: [
        'a VR game featuring Atoms and Orbitals + mobile companion app',
        'a VR game featuring Speed Of Light + mobile game',
        'a VR game featuring String Theory',
        'a distribution platform for educational VR apps (including 3rd-party ones)',
        'a VR experience featuring Romina Russell, the US writer and author of famous Zodiac series',
        'a VR app for online metaverse collaboration'
      ],
      ru: [
        'VR-игра про атомы и орбитали + мобильное приложение-компаньон',
        'VR-игра про скорость света + мобильная игра',
        'VR-игра про теорию струн',
        'платформа распространения образовательных VR-приложений (включая сторонние)',
        'VR-опыт с Роминой Расселл — американской писательницей, автором известной серии Zodiac',
        'VR-приложение для онлайн-коллаборации в метавёрсе'
      ],
      be: [
        'VR-гульня пра атамы і арбіталі + мабільнае прыкладанне-кампаньён',
        'VR-гульня пра хуткасць святла + мабільная гульня',
        'VR-гульня пра тэорыю струн',
        'платформа распаўсюду адукацыйных VR-прыкладанняў (уключаючы староннія)',
        'VR-вопыт з Рамінай Расэл — амерыканскай пісьменніцай, аўтарам вядомай серыі Zodiac',
        'VR-прыкладанне для анлайн-калабарацыі ў метасусвеце'
      ]
    }
  },
  {
    role: { en: 'Co-founder', ru: 'Соучредитель', be: 'Сузаснавальнік' },
    org: 'Iridescent Studio, Ltd.',
    where: { en: 'Belarus', ru: 'Беларусь', be: 'Беларусь' },
    when: { en: 'Mar 2016 – Mar 2022', ru: 'мар 2016 – мар 2022', be: 'сак 2016 – сак 2022' },
    points: {
      en: [
        'Pioneered subscription monetization in mobile gaming, mastered with A/B testing & predictive analytics.',
        'Developed 10+ games/apps blending entertainment, brain science, and mindfulness.'
      ],
      ru: [
        'Запустил подписочную монетизацию в мобильных играх, отточив её на A/B-тестах и предиктивной аналитике.',
        'Разработал 10+ игр/приложений на стыке развлечения, нейронауки и осознанности.'
      ],
      be: [
        'Запусціў падпісную манетызацыю ў мабільных гульнях, адточваючы яе на A/B-тэстах і прэдыктыўнай аналітыцы.',
        'Распрацаваў 10+ гульняў/прыкладанняў на стыку забавы, нейранавукі і ўсвядомленасці.'
      ]
    },
    released: {
      en: [
        '3 mobile games in the Board game genre',
        'a mobile app with 50+ different brain-training mini-games approved by neuroscientists',
        'an AA mobile multiplayer online game in the RTS genre',
        'a web platform for skill-based cash mobile games',
        '10+ hyper-casual games with various gameplay mechanics',
        '2 mental health mobile gamified apps with hundreds of unique meditation content items',
        '2 emoji apps featuring celebrities (Zayn Malik, Kevin Durant)'
      ],
      ru: [
        '3 мобильные игры в жанре настольных',
        'мобильное приложение с 50+ мини-играми для тренировки мозга, одобренное нейробиологами',
        'AA-игра в жанре RTS с онлайн-мультиплеером для мобильных',
        'веб-платформа для мобильных игр на деньги за навык',
        '10+ гиперказуальных игр с разными механиками',
        '2 геймифицированных приложения о ментальном здоровье с сотнями уникальных медитаций',
        '2 эмодзи-приложения с участием знаменитостей (Zayn Malik, Kevin Durant)'
      ],
      be: [
        '3 мабільныя гульні ў жанры настольных',
        'мабільнае прыкладанне з 50+ міні-гульнямі для трэніроўкі мозгу, ухваленае нейрабіёлагамі',
        'AA-гульня ў жанры RTS з анлайн-мультыплэерам для мабільных',
        'вэб-платформа для мабільных гульняў на грошы за навык',
        '10+ гіперказуальных гульняў з рознымі механікамі',
        '2 гейміфікаваныя прыкладанні пра ментальнае здароўе з сотнямі ўнікальных медытацый',
        '2 эмодзі-прыкладанні з удзелам зорак (Zayn Malik, Kevin Durant)'
      ]
    }
  }
];

const earlierRolesText = [
  {
    role: { en: 'Project Manager', ru: 'Проектный менеджер', be: 'Праектны менеджар' },
    org: 'Omertex',
    when: { en: 'Aug 2014 – Feb 2016', ru: 'авг 2014 – фев 2016', be: 'жні 2014 – лют 2016' }
  },
  {
    role: { en: 'Project Manager', ru: 'Проектный менеджер', be: 'Праектны менеджар' },
    org: 'Cactus',
    when: { en: 'Sep 2011 – Aug 2012', ru: 'сен 2011 – авг 2012', be: 'вер 2011 – жні 2012' }
  },
  {
    role: { en: 'Business Development Manager', ru: 'Менеджер по развитию бизнеса', be: 'Менеджар па развіцці бізнесу' },
    org: 'Artezio',
    when: { en: 'Aug 2012 – Jul 2013', ru: 'авг 2012 – июл 2013', be: 'жні 2012 – ліп 2013' }
  },
  {
    role: { en: 'Business Development Manager', ru: 'Менеджер по развитию бизнеса', be: 'Менеджар па развіцці бізнесу' },
    org: 'Svyaznoy',
    when: { en: 'Oct 2009 – Mar 2011', ru: 'окт 2009 – мар 2011', be: 'кас 2009 – сак 2011' }
  }
];

// One language out of a field that is written per language, or a name that is not.
const pick = (value, locale) => (value && typeof value === 'object' && !Array.isArray(value) ? value[locale] ?? value.en : value);

export const helpWithFor = (locale) => helpWithText[locale] ?? helpWithText.en;
export const experienceFor = (locale) =>
  experienceText.map((job) => ({
    role: pick(job.role, locale),
    org: job.org,
    where: pick(job.where, locale),
    when: pick(job.when, locale),
    ...(job.intro ? { intro: pick(job.intro, locale) } : {}),
    points: pick(job.points, locale),
    ...(job.released ? { released: pick(job.released, locale) } : {})
  }));
export const earlierRolesFor = (locale) =>
  earlierRolesText.map((job) => ({ role: pick(job.role, locale), org: job.org, when: pick(job.when, locale) }));

// English, for anything that is not a page.
export const helpWith = helpWithFor('en');
export const experience = experienceFor('en');
export const earlierRoles = earlierRolesFor('en');

// The pair that carries the most on a first read: one from the employer side, and one on
// leadership and team-building. Everyone else lives at /recommendations/ — a dozen quotes in a
// grid is six rows, and each one is diluted by the one beside it.
export const homeRecommendations = ['Mike Lindelsee', 'Mitzi McGilvray'];

// Order of the quotes below is deliberate: each 2-up row pairs near-equal lengths, so the section
// tapers smoothly instead of jumping between tall and short rows. They are other people's words
// and are never translated — the frame around them is, the words are not.
export const recommendations = [
  {
    quote: `As a true professional, Aliaksei made our cooperation in software development not only effective, clear and fast but also smooth and pleasant. He is extremely attentive to detail, passionate about the quality of each project, focused on the clients' needs and able to estimate most of the risks at the very first stage of planning. He's open to new information, constantly improves his skills and is eager to master new spheres and to become an even better professional. It has always been a pleasure to work with him on different projects, and I hope our cooperation will continue in future. I would definitely recommend Aliaksei for any position he is interested in, since he will be a valuable asset for every company in game or business software development.`,
    author: 'Vera Gavryushina'
  },
  {
    quote: `Aliaksei is an educated and inspiring pro who works with several software development teams. I've had the pleasure of knowing him for about a year now, as we have worked together on several corporate initiatives. He has shown significant knowledge about methodological (e.g. Scrum or Kanban), HR-related, and UX-specific aspects in a broad sense. Above all, I was impressed with his abilities to focus on results and keep everybody informed. And, of course, his open nature and hard working habits, which helped us stay healthy as a team and deliver on time. Aliaksei would be a true asset for any positions requiring a development management jedi.`,
    author: 'Elizabeth Nova'
  },
  {
    quote: `Working with Aliaksei was genuinely a great experience. He jumped straight into a huge amount of responsibility and managed it all with a calm and steady attitude. No matter how complex or unexpected the situation was, he kept his cool and solved problems across a really wide spectrum of operational challenges. What makes him stand out is how adaptable he is. Big systems, lots of moving parts, constant changes and challenges — he was able to quickly find his way, connect the dots, and keep things running smoothly. Aliaksei is the kind of teammate you want around: adaptable, reliable, constructive, and a pleasure to work with.`,
    author: 'Aleksandar Đokić'
  },
  {
    quote: `Aliaksei has a great talent for building processes that actually work — not just on paper — and for aligning teams across projects and departments. He is always deeply involved in what's happening on a project, anticipates potential challenges before they become problems, and helps the team navigate them smoothly. He is an exceptional crisis manager. I've seen him take on projects that seemed impossible to turn around, and with his leadership, they not only got back on track but often exceeded expectations. I highly recommend Aliaksei to any organization looking for a leader who can both stabilize and grow teams and projects.`,
    author: 'Alex Petukh'
  },
  {
    quote: `Aliaksei is one of the smartest, nicest, and most capable people that I've ever worked with. He has the perfect balance of business knowledge, technical capability, and product development experience and skill to manage and drive every project that he's been involved in to great success. He is hard-nosed when he has to be, knows when to be flexible, and is able to mentor both product and technical staff very effectively. I'd recommend Aliaksei in a heartbeat and look forward to working together with him whenever we can.`,
    author: 'Mike Lindelsee'
  },
  {
    quote: `Aliaksei is the best producer I have ever worked with. He forms an excellent vision of the project very quickly, knows how to correctly set and prioritize tasks. He has excellent long-term and short-term planning skills. He is perfectly organized and does not miss even the smallest details. He has good technical knowledge and excellent understanding of the technical aspects of processes. Last but not the least, Aliaksei is a wonderful, kind, sympathetic person, with high emotional intelligence and great soft skills.`,
    author: 'Anna Ivanova'
  },
  {
    quote: `I have been working with Aliaksei for several years, and those were full of inspiration. He is the mentor in my career and professional growth, working with him is a pleasure and challenge. He is always ready to provide guidance to his colleagues, give a chance to join even with less skills than required in a particular area, be a support for them, unite them, and well ... "kick asses" to get things done. It is a great opportunity to work in Aliaksei's team and deliver great products together!`,
    author: 'Sergei Lebedzev'
  },
  {
    quote: `Aliaksei is the most client-oriented person I've ever known. Working with him was an absolute pleasure. He is extremely reliable — if he gives a promise he not only has respect for it, he always surpasses expectations both in timing and in quality. I can definitely recommend Aliaksei as a highly-qualified specialist in a very broad range of fields and especially as a person who makes you eager to get up earlier and rush to the office in order to conform to his unparalleled working standards.`,
    author: 'Irina Gusinskaya'
  },
  {
    quote: `I have had the pleasure of working with Aliaksei for the last couple of years. He is a true leader. He has built a loyal, hard-working team. He's inquisitive, willing to learn and is relentless to get the facts. He has an enormous amount of integrity when it comes to his commitments and will not stop until he's successful. We have thrown a huge variety of challenges at him, and he always comes through. Aliaksei comes with my highest recommendation.`,
    author: 'Mitzi McGilvray'
  },
  {
    quote: `Aliaksei is one of the most dedicated professionals I've worked with. It was a pleasure to work with him on various tasks and problems. He is a responsible, hard-working person, always full of useful ideas and suggestions on how to make work better. Aliaksei is result oriented, very attentive to details and a good communicator. I highly recommend Aliaksei and would love to work with him again.`,
    author: 'Olga Truhina'
  },
  {
    quote: `What always stood out to me about Aliaksei was his dedication and precision. Every detail mattered to him, and he consistently delivered work of the highest quality. At the same time, he brought a touch of humour and lightness that made even the most intense projects enjoyable to be part of. I truly valued our collaboration and would happily work with Aliaksei again in the future.`,
    author: 'Paulina Swiatkowska'
  },
  {
    quote: `Aliaksei is an exceptionally versatile and talented game development specialist who also stands out for his clarity, honesty, and thoughtful feedback. He creates a comfortable and friendly work environment, always focusing on results. He is also a kind, positive, and inspiring person. I highly recommend him and look forward to working with him in the future.`,
    author: 'Tatiana Sehen'
  }
];

// Company sites, from the résumé PDF's hyperlinks.
export const orgUrls = {
  'Magic Media': 'https://magicmedia.studio',
  'Fracture Labs': 'https://decimated.net',
  'CM Games': 'https://cm.games',
  'Abelana VR Productions, Inc.': 'http://abelanavr.com'
};

export const earlierOrgUrls = {
  Omertex: 'http://www.omertex.com',
  Cactus: 'https://cactus-now.com',
  Artezio: 'http://www.artezio.com',
  Svyaznoy: 'https://en.wikipedia.org/wiki/Svyaznoy'
};

// Recommenders' LinkedIn profiles, from the résumé PDF's hyperlinks.
export const recommenderUrls = {
  'Aleksandar Đokić': 'https://www.linkedin.com/in/aleksdj/',
  'Alex Petukh': 'https://www.linkedin.com/in/alexpetukh/',
  'Anna Ivanova': 'https://www.linkedin.com/in/anna-ivanova-3b065a67/',
  'Elizabeth Nova': 'https://www.linkedin.com/in/elizabethnova000',
  'Irina Gusinskaya': 'https://www.linkedin.com/in/irgus',
  'Mike Lindelsee': 'https://www.linkedin.com/in/mikelindelsee/',
  'Mitzi McGilvray': 'https://www.linkedin.com/in/mitzimcgilvray',
  'Olga Truhina': 'https://www.linkedin.com/in/olga-truhina/',
  'Paulina Swiatkowska': 'https://www.linkedin.com/in/paulina-swiatkowska/',
  'Sergei Lebedzev': 'https://www.linkedin.com/in/sergei-lebedzev-00a361134',
  'Tatiana Sehen': 'https://www.linkedin.com/in/tatsiana-sehen',
  'Vera Gavryushina': 'https://www.linkedin.com/in/vera-gavryushina'
};

// The quotes, translated — keyed by author, against the English above, which stays the source and
// stays the original. A language with no entry here shows the English and no toggle, so a quote can
// be translated one at a time without the page ever showing a half-swapped pair.
const recoTranslations = {
  'Vera Gavryushina': {
    ru: `Как настоящий профессионал, Алексей сделал наше сотрудничество в разработке ПО не только эффективным, чётким и быстрым, но и гладким и приятным. Он крайне внимателен к деталям, болеет за качество каждого проекта, ориентирован на нужды клиента и умеет оценить большинство рисков ещё на первом этапе планирования. Он открыт новой информации, постоянно растёт и стремится осваивать новые области, чтобы стать ещё лучше. С ним всегда было в удовольствие работать над разными проектами, и надеюсь, наше сотрудничество продолжится. Я безусловно рекомендую Алексея на любую позицию, которая ему интересна: он станет ценным приобретением для любой компании в разработке игрового или бизнес-ПО.`
  },
  'Elizabeth Nova': {
    ru: `Алексей — образованный и вдохновляющий профессионал, работающий с несколькими командами разработки. Мне выпало удовольствие знать его около года: мы вместе работали над несколькими корпоративными инициативами. Он показал серьёзные знания в методологии (Scrum, Kanban), в HR-темах и в UX в широком смысле. Сильнее всего меня впечатлила его способность держать фокус на результате и держать всех в курсе. И, конечно, открытость и работоспособность, которые помогали нам оставаться здоровой командой и сдавать в срок. Алексей был бы настоящим приобретением для любой позиции, требующей джедая в управлении разработкой.`
  },
  'Aleksandar Đokić': {
    ru: `Работать с Алексеем было по-настоящему здорово. Он сразу взял на себя огромный объём ответственности и вёл всё это спокойно и уверенно. Какой бы сложной или неожиданной ни была ситуация, он сохранял хладнокровие и решал задачи из очень широкого спектра операционных вызовов. Выделяется он своей адаптивностью. Большие системы, множество движущихся частей, постоянные перемены и вызовы — он быстро находил свой путь, связывал точки и держал всё в рабочем состоянии. Алексей — из тех коллег, которых хочется иметь рядом: адаптивный, надёжный, конструктивный, и с ним приятно работать.`
  },
  'Alex Petukh': {
    ru: `У Алексея большой талант строить процессы, которые действительно работают, а не только на бумаге, и сводить команды между проектами и отделами. Он всегда глубоко вовлечён в то, что происходит на проекте, предвидит трудности прежде, чем они станут проблемами, и помогает команде их гладко пройти. Он исключительный кризис-менеджер. Я видел, как он брал проекты, которые казались неисправимыми, и с его руководством они не только возвращались в график, но часто превосходили ожидания. Очень рекомендую Алексея любой организации, которой нужен лидер, способный и стабилизировать, и выращивать команды и проекты.`
  },
  'Mike Lindelsee': {
    ru: `Алексей — один из самых умных, приятных и способных людей, с которыми мне доводилось работать. У него идеальный баланс деловых знаний, технической хватки и опыта разработки продуктов, чтобы доводить каждый проект, в котором он участвует, до большого успеха. Он бывает жёстким, когда это нужно, знает, когда быть гибким, и очень эффективно растит и продуктовых, и технических специалистов. Я рекомендую Алексея не задумываясь и жду случая поработать с ним снова.`
  },
  'Anna Ivanova': {
    ru: `Алексей — лучший продюсер, с которым я когда-либо работала. Он очень быстро формирует точное видение проекта, умеет правильно ставить и приоритизировать задачи. У него отличные навыки долгосрочного и краткосрочного планирования. Он безупречно организован и не упускает мельчайших деталей. У него хорошие технические знания и прекрасное понимание технической стороны процессов. И, что не менее важно, Алексей — замечательный, добрый, отзывчивый человек с высоким эмоциональным интеллектом и отличными софт-скиллами.`
  },
  'Sergei Lebedzev': {
    ru: `Я работаю с Алексеем несколько лет, и они были полны вдохновения. Он наставник в моей карьере и профессиональном росте, с ним и приятно, и вызов. Он всегда готов дать коллегам руководство, дать шанс зайти в область, где навыков пока меньше, чем нужно, поддержать, объединить и, что уж там, «пинать», чтобы дело делалось. Работать в команде Алексея и вместе выпускать отличные продукты — большая возможность!`
  },
  'Irina Gusinskaya': {
    ru: `Алексей — самый клиентоориентированный человек, которого я знаю. Работать с ним было сплошным удовольствием. Он исключительно надёжен: если уж пообещал, он не только держит слово, но всегда превосходит ожидания и по срокам, и по качеству. Я однозначно рекомендую Алексея как высококлассного специалиста в очень широком спектре областей и особенно как человека, из-за которого хочется встать пораньше и бежать в офис, чтобы соответствовать его недосягаемым рабочим стандартам.`
  },
  'Mitzi McGilvray': {
    ru: `Мне выпало удовольствие работать с Алексеем последние пару лет. Он настоящий лидер. Он построил преданную, трудолюбивую команду. Он любознателен, готов учиться и безжалостен в поиске фактов. В вопросах обязательств у него огромная порядочность, и он не остановится, пока не добьётся успеха. Мы бросали в него самые разные вызовы, и он всегда справлялся. Алексей — с моей самой высокой рекомендацией.`
  },
  'Olga Truhina': {
    ru: `Алексей — один из самых преданных делу профессионалов, с кем я работала. Работать с ним над разными задачами и проблемами было удовольствием. Он ответственный, трудолюбивый человек, всегда полный полезных идей и предложений, как сделать работу лучше. Алексей ориентирован на результат, очень внимателен к деталям и умеет общаться. Очень рекомендую Алексея и с радостью поработала бы с ним снова.`
  },
  'Paulina Swiatkowska': {
    ru: `Меня всегда поражали в Алексее его преданность делу и точность. Каждая деталь для него значила, и он неизменно отдавал работу высшего качества. При этом он приносил нотку юмора и лёгкости, благодаря которой даже самые напряжённые проекты было приятно вести. Я очень ценила наше сотрудничество и с радостью поработала бы с Алексеем снова.`
  },
  'Tatiana Sehen': {
    ru: `Алексей — исключительно разносторонний и талантливый специалист по разработке игр, который к тому же выделяется ясностью, честностью и вдумчивой обратной связью. Он создаёт комфортную и дружелюбную рабочую среду, всегда фокусируясь на результате. Он также добрый, позитивный и вдохновляющий человек. Очень рекомендую его и жду возможности поработать с ним в будущем.`
  }
};

// One language's view of the quotes: the English above, or its translation when there is one — with
// `original` carrying the English so the page can offer "See original · English" beside it.
export const recommendationsFor = (locale) =>
  recommendations.map((r) => {
    const translated = recoTranslations[r.author]?.[locale];
    return { ...r, quote: translated ?? r.quote, original: translated ? r.quote : null };
  });
